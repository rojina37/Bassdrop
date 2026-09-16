import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { createSocketServer } from "./socket.js";

const app = createApp();
const httpServer = createServer(app);
createSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`BassDrop API listening on http://localhost:${env.PORT}`);
  console.log(`  health:    http://localhost:${env.PORT}/api/health`);
  console.log(`  health/db: http://localhost:${env.PORT}/api/health/db`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down...`);
  httpServer.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
