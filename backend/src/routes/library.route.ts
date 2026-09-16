import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { songInclude, toPublicSong } from "../lib/serializers.js";

export const libraryRouter = Router();

libraryRouter.use(requireAuth);

const paginationSchema = z.object({
  take: z.coerce.number().int().min(1).max(200).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

// One-call summary for the Library page: a user's own playlists, liked songs,
// and recent play history.
libraryRouter.get("/", async (req, res) => {
  const userId = req.user!.id;

  const [playlists, likedSongs, recentlyPlayed] = await Promise.all([
    prisma.playlist.findMany({
      where: { userId },
      include: { _count: { select: { songs: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.likedSong.findMany({
      where: { userId },
      include: { song: { include: songInclude } },
      orderBy: { likedAt: "desc" },
      take: 50,
    }),
    prisma.recentlyPlayed.findMany({
      where: { userId },
      include: { song: { include: songInclude } },
      orderBy: { playedAt: "desc" },
      take: 50,
    }),
  ]);

  res.json({
    playlists: playlists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      isPublic: playlist.isPublic,
      songCount: playlist._count.songs,
      updatedAt: playlist.updatedAt,
    })),
    likedSongs: likedSongs.map((entry) => ({ likedAt: entry.likedAt, song: toPublicSong(entry.song) })),
    recentlyPlayed: recentlyPlayed.map((entry) => ({
      playedAt: entry.playedAt,
      song: toPublicSong(entry.song),
    })),
  });
});

libraryRouter.get("/liked", async (req, res) => {
  const { take, skip } = paginationSchema.parse(req.query);

  const liked = await prisma.likedSong.findMany({
    where: { userId: req.user!.id },
    include: { song: { include: songInclude } },
    orderBy: { likedAt: "desc" },
    take,
    skip,
  });

  res.json({ likedSongs: liked.map((entry) => ({ likedAt: entry.likedAt, song: toPublicSong(entry.song) })) });
});

libraryRouter.post("/liked/:songId", async (req, res) => {
  const songId = req.params.songId as string;
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) throw new HttpError(404, "Song not found");

  await prisma.likedSong.upsert({
    where: { userId_songId: { userId: req.user!.id, songId } },
    update: {},
    create: { userId: req.user!.id, songId },
  });

  res.status(204).end();
});

libraryRouter.delete("/liked/:songId", async (req, res) => {
  await prisma.likedSong.deleteMany({
    where: { userId: req.user!.id, songId: req.params.songId as string },
  });
  res.status(204).end();
});

libraryRouter.get("/recent", async (req, res) => {
  const { take, skip } = paginationSchema.parse(req.query);

  const recent = await prisma.recentlyPlayed.findMany({
    where: { userId: req.user!.id },
    include: { song: { include: songInclude } },
    orderBy: { playedAt: "desc" },
    take,
    skip,
  });

  res.json({
    recentlyPlayed: recent.map((entry) => ({ playedAt: entry.playedAt, song: toPublicSong(entry.song) })),
  });
});

libraryRouter.post("/recent/:songId", async (req, res) => {
  const songId = req.params.songId as string;
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) throw new HttpError(404, "Song not found");

  const entry = await prisma.recentlyPlayed.upsert({
    where: { userId_songId: { userId: req.user!.id, songId } },
    update: { playedAt: new Date() },
    create: { userId: req.user!.id, songId },
  });

  res.status(201).json({ playedAt: entry.playedAt });
});
