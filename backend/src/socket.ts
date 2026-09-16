import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { verifyAuthToken } from "./lib/jwt.js";
import { prisma } from "./lib/prisma.js";
import { HttpError } from "./middleware/error.js";
import { postChatMessage } from "./routes/chats.route.js";

type Ack = (result: { ok: boolean; error?: string }) => void;

// Group-chat realtime layer. Connections authenticate with the same JWT used
// by the REST API (`socket.handshake.auth.token`); joining a room persists
// membership and sending a message persists it, both via the same
// postChatMessage()/membership logic the REST routes use.
export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error("Authentication required"));
      return;
    }

    try {
      const payload = verifyAuthToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    socket.on("chat:join", async (chatId: string, ack?: Ack) => {
      try {
        const chat = await prisma.groupChat.findUnique({ where: { id: chatId } });
        if (!chat) throw new HttpError(404, "Chat not found");

        await prisma.groupChatMember.upsert({
          where: { groupChatId_userId: { groupChatId: chatId, userId } },
          update: {},
          create: { groupChatId: chatId, userId },
        });

        socket.join(`chat:${chatId}`);
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err instanceof HttpError ? err.message : "Could not join chat" });
      }
    });

    socket.on("chat:leave", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on(
      "chat:message",
      async (payload: { chatId: string; body?: string; sharedSongId?: string }, ack?: Ack) => {
        try {
          const message = await postChatMessage({
            chatId: payload.chatId,
            userId,
            body: payload.body,
            sharedSongId: payload.sharedSongId,
          });
          io.to(`chat:${payload.chatId}`).emit("chat:message", message);
          ack?.({ ok: true });
        } catch (err) {
          ack?.({
            ok: false,
            error: err instanceof HttpError ? err.message : "Could not send message",
          });
        }
      },
    );
  });

  return io;
}
