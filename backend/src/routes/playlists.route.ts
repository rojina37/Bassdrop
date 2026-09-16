import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { songInclude, toPublicSong } from "../lib/serializers.js";

export const playlistsRouter = Router();

playlistsRouter.use(requireAuth);

const playlistInclude = { _count: { select: { songs: true } } } as const;

function toPublicPlaylist(playlist: {
  id: string;
  name: string;
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { songs: number };
}) {
  return {
    id: playlist.id,
    name: playlist.name,
    isPublic: playlist.isPublic,
    ownerId: playlist.userId,
    songCount: playlist._count?.songs ?? 0,
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
  };
}

async function loadOwnedPlaylist(id: string, userId: string) {
  const playlist = await prisma.playlist.findUnique({ where: { id } });
  if (!playlist || playlist.userId !== userId) throw new HttpError(404, "Playlist not found");
  return playlist;
}

playlistsRouter.get("/", async (req, res) => {
  const playlists = await prisma.playlist.findMany({
    where: { userId: req.user!.id },
    include: playlistInclude,
    orderBy: { updatedAt: "desc" },
  });
  res.json({ playlists: playlists.map(toPublicPlaylist) });
});

playlistsRouter.get("/:id", async (req, res) => {
  const playlist = await prisma.playlist.findUnique({
    where: { id: req.params.id as string },
    include: {
      ...playlistInclude,
      songs: {
        orderBy: { position: "asc" },
        include: { song: { include: songInclude } },
      },
    },
  });
  if (!playlist) throw new HttpError(404, "Playlist not found");
  if (playlist.userId !== req.user!.id && !playlist.isPublic) {
    throw new HttpError(404, "Playlist not found");
  }

  res.json({
    playlist: {
      ...toPublicPlaylist(playlist),
      songs: playlist.songs.map((entry) => ({
        position: entry.position,
        addedAt: entry.addedAt,
        song: toPublicSong(entry.song),
      })),
    },
  });
});

const createPlaylistSchema = z.object({
  name: z.string().trim().min(1).max(120),
  isPublic: z.coerce.boolean().default(false),
});

playlistsRouter.post("/", async (req, res) => {
  const { name, isPublic } = createPlaylistSchema.parse(req.body);

  const playlist = await prisma.playlist.create({
    data: { name, isPublic, userId: req.user!.id },
    include: playlistInclude,
  });

  res.status(201).json({ playlist: toPublicPlaylist(playlist) });
});

const updatePlaylistSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  isPublic: z.coerce.boolean().optional(),
});

playlistsRouter.patch("/:id", async (req, res) => {
  const existing = await loadOwnedPlaylist(req.params.id as string, req.user!.id);
  const data = updatePlaylistSchema.parse(req.body);

  const playlist = await prisma.playlist.update({
    where: { id: existing.id },
    data,
    include: playlistInclude,
  });

  res.json({ playlist: toPublicPlaylist(playlist) });
});

playlistsRouter.delete("/:id", async (req, res) => {
  const existing = await loadOwnedPlaylist(req.params.id as string, req.user!.id);
  await prisma.playlist.delete({ where: { id: existing.id } });
  res.status(204).end();
});

const addSongSchema = z.object({ songId: z.string().min(1) });

playlistsRouter.post("/:id/songs", async (req, res) => {
  const playlist = await loadOwnedPlaylist(req.params.id as string, req.user!.id);
  const { songId } = addSongSchema.parse(req.body);

  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) throw new HttpError(404, "Song not found");

  const position = await prisma.playlistSong.count({ where: { playlistId: playlist.id } });

  try {
    await prisma.playlistSong.create({
      data: { playlistId: playlist.id, songId, position },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new HttpError(409, "Song is already in this playlist");
    }
    throw err;
  }

  res.status(204).end();
});

playlistsRouter.delete("/:id/songs/:songId", async (req, res) => {
  const playlist = await loadOwnedPlaylist(req.params.id as string, req.user!.id);

  const deleted = await prisma.playlistSong.deleteMany({
    where: { playlistId: playlist.id, songId: req.params.songId as string },
  });
  if (deleted.count === 0) throw new HttpError(404, "Song is not in this playlist");

  res.status(204).end();
});
