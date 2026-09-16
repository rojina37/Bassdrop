import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

adminRouter.get("/stats", async (_req, res) => {
  const [userCount, songCount, artistCount, genreCount, playlistCount, chatCount, newUsersLast7Days] =
    await Promise.all([
      prisma.user.count(),
      prisma.song.count(),
      prisma.artist.count(),
      prisma.genre.count(),
      prisma.playlist.count(),
      prisma.groupChat.count(),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - SEVEN_DAYS_MS) } } }),
    ]);

  res.json({
    stats: {
      userCount,
      songCount,
      artistCount,
      genreCount,
      playlistCount,
      chatCount,
      newUsersLast7Days,
    },
  });
});

function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  _count?: { playlists: number; likes: number; follows: number };
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    ...(user._count
      ? {
          playlistCount: user._count.playlists,
          likedSongCount: user._count.likes,
          followingCount: user._count.follows,
        }
      : {}),
  };
}

const listUsersQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

adminRouter.get("/users", async (req, res) => {
  const { search, role, take, skip } = listUsersQuerySchema.parse(req.query);

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });

  res.json({ users: users.map(toPublicUser) });
});

adminRouter.get("/users/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id as string },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { playlists: true, likes: true, follows: true } },
    },
  });
  if (!user) throw new HttpError(404, "User not found");
  res.json({ user: toPublicUser(user) });
});
