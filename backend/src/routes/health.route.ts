import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const healthRouter = Router();

// Liveness — process is up.
healthRouter.get("/", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Readiness — can we reach MySQL?
healthRouter.get("/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "up" });
  } catch (err) {
    res.status(503).json({
      status: "error",
      db: "down",
      message: err instanceof Error ? err.message : "unknown error",
    });
  }
});
