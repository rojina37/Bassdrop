import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { songInclude, toPublicSong, type SongWithRelations } from "../lib/serializers.js";

export const chatsRouter = Router();

chatsRouter.use(requireAuth);

function toPublicChat(
  chat: {
    id: string;
    name: string;
    createdAt: Date;
    genre: { id: string; name: string } | null;
    _count?: { members: number };
  },
  isMember?: boolean,
) {
  return {
    id: chat.id,
    name: chat.name,
    genre: chat.genre,
    memberCount: chat._count?.members ?? 0,
    createdAt: chat.createdAt,
    ...(isMember !== undefined ? { isMember } : {}),
  };
}

const chatInclude = {
  genre: { select: { id: true, name: true } },
  _count: { select: { members: true } },
} as const;

chatsRouter.get("/", async (req, res) => {
  const [chats, memberships] = await Promise.all([
    prisma.groupChat.findMany({ include: chatInclude, orderBy: { name: "asc" } }),
    prisma.groupChatMember.findMany({
      where: { userId: req.user!.id },
      select: { groupChatId: true },
    }),
  ]);

  const memberChatIds = new Set(memberships.map((m) => m.groupChatId));
  res.json({ chats: chats.map((chat) => toPublicChat(chat, memberChatIds.has(chat.id))) });
});

chatsRouter.get("/:id", async (req, res) => {
  const chat = await prisma.groupChat.findUnique({
    where: { id: req.params.id as string },
    include: chatInclude,
  });
  if (!chat) throw new HttpError(404, "Chat not found");

  const membership = await prisma.groupChatMember.findUnique({
    where: { groupChatId_userId: { groupChatId: chat.id, userId: req.user!.id } },
  });

  res.json({ chat: toPublicChat(chat, Boolean(membership)) });
});

const createChatSchema = z.object({
  name: z.string().trim().min(1).max(120),
  genreId: z.string().min(1).optional(),
});

chatsRouter.post("/", requireAdmin, async (req, res) => {
  const { name, genreId } = createChatSchema.parse(req.body);

  if (genreId) {
    const genre = await prisma.genre.findUnique({ where: { id: genreId } });
    if (!genre) throw new HttpError(400, "Unknown genreId");
  }

  const chat = await prisma.groupChat.create({
    data: { name, genreId },
    include: chatInclude,
  });

  res.status(201).json({ chat: toPublicChat(chat) });
});

const updateChatSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  genreId: z.string().min(1).nullable().optional(),
});

chatsRouter.patch("/:id", requireAdmin, async (req, res) => {
  const existing = await prisma.groupChat.findUnique({ where: { id: req.params.id as string } });
  if (!existing) throw new HttpError(404, "Chat not found");

  const data = updateChatSchema.parse(req.body);
  if (data.genreId) {
    const genre = await prisma.genre.findUnique({ where: { id: data.genreId } });
    if (!genre) throw new HttpError(400, "Unknown genreId");
  }

  const chat = await prisma.groupChat.update({
    where: { id: existing.id },
    data,
    include: chatInclude,
  });

  res.json({ chat: toPublicChat(chat) });
});

chatsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const chat = await prisma.groupChat.findUnique({ where: { id: req.params.id as string } });
  if (!chat) throw new HttpError(404, "Chat not found");

  await prisma.groupChat.delete({ where: { id: chat.id } });
  res.status(204).end();
});

chatsRouter.post("/:id/join", async (req, res) => {
  const chatId = req.params.id as string;
  const chat = await prisma.groupChat.findUnique({ where: { id: chatId } });
  if (!chat) throw new HttpError(404, "Chat not found");

  await prisma.groupChatMember.upsert({
    where: { groupChatId_userId: { groupChatId: chatId, userId: req.user!.id } },
    update: {},
    create: { groupChatId: chatId, userId: req.user!.id },
  });

  res.status(204).end();
});

chatsRouter.delete("/:id/leave", async (req, res) => {
  await prisma.groupChatMember.deleteMany({
    where: { groupChatId: req.params.id as string, userId: req.user!.id },
  });
  res.status(204).end();
});

const messageInclude = {
  user: { select: { id: true, name: true } },
  sharedSong: { include: songInclude },
} as const;

type ChatMessageWithRelations = {
  id: string;
  body: string;
  createdAt: Date;
  groupChatId: string;
  user: { id: string; name: string };
  sharedSong: SongWithRelations | null;
};

function toPublicMessage(message: ChatMessageWithRelations) {
  return {
    id: message.id,
    body: message.body,
    createdAt: message.createdAt,
    chatId: message.groupChatId,
    user: message.user,
    sharedSong: message.sharedSong ? toPublicSong(message.sharedSong) : null,
  };
}

const messagesQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

chatsRouter.get("/:id/messages", async (req, res) => {
  const chatId = req.params.id as string;
  const chat = await prisma.groupChat.findUnique({ where: { id: chatId } });
  if (!chat) throw new HttpError(404, "Chat not found");

  const { take, skip } = messagesQuerySchema.parse(req.query);

  const messages = await prisma.chatMessage.findMany({
    where: { groupChatId: chatId },
    include: messageInclude,
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });

  res.json({ messages: messages.map(toPublicMessage).reverse() });
});

const postMessageSchema = z
  .object({
    body: z.string().trim().max(2000).optional(),
    sharedSongId: z.string().min(1).optional(),
  })
  .refine((data) => Boolean(data.body) || Boolean(data.sharedSongId), {
    message: "Provide a message body or a shared song",
  });

// Shared by the REST route and the socket.io layer so a message posted either
// way goes through the same membership/validation rules and comes back shaped
// the same way.
export async function postChatMessage({
  chatId,
  userId,
  body,
  sharedSongId,
}: {
  chatId: string;
  userId: string;
  body?: string;
  sharedSongId?: string;
}) {
  const chat = await prisma.groupChat.findUnique({ where: { id: chatId } });
  if (!chat) throw new HttpError(404, "Chat not found");

  const membership = await prisma.groupChatMember.findUnique({
    where: { groupChatId_userId: { groupChatId: chatId, userId } },
  });
  if (!membership) throw new HttpError(403, "Join this chat before posting");

  if (sharedSongId) {
    const song = await prisma.song.findUnique({ where: { id: sharedSongId } });
    if (!song) throw new HttpError(400, "Unknown sharedSongId");
  }

  const message = await prisma.chatMessage.create({
    data: { groupChatId: chatId, userId, body: body ?? "", sharedSongId },
    include: messageInclude,
  });

  return toPublicMessage(message);
}

chatsRouter.post("/:id/messages", async (req, res) => {
  const { body, sharedSongId } = postMessageSchema.parse(req.body);

  const message = await postChatMessage({
    chatId: req.params.id as string,
    userId: req.user!.id,
    body,
    sharedSongId,
  });

  res.status(201).json({ message });
});
