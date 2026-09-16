import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { songInclude, toPublicSong } from "../lib/serializers.js";
import {
  audioUrlFor,
  coverUrlFor,
  deleteMediaFile,
  deleteUploadedFiles,
  MAX_COVER_BYTES,
  songUpload,
} from "../lib/upload.js";

export const songsRouter = Router();

function uploadedFiles(req: { files?: unknown }) {
  return (req.files ?? {}) as Partial<Record<"audio" | "cover", Express.Multer.File[]>>;
}

const listQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  artistId: z.string().min(1).optional(),
  genreId: z.string().min(1).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

songsRouter.get("/", async (req, res) => {
  const { search, artistId, genreId, take, skip } = listQuerySchema.parse(req.query);

  const songs = await prisma.song.findMany({
    where: {
      ...(artistId ? { artistId } : {}),
      ...(genreId ? { genreId } : {}),
      ...(search ? { title: { contains: search } } : {}),
    },
    include: songInclude,
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });

  res.json({ songs: songs.map(toPublicSong) });
});

songsRouter.get("/:id", async (req, res) => {
  const song = await prisma.song.findUnique({
    where: { id: req.params.id },
    include: songInclude,
  });
  if (!song) throw new HttpError(404, "Song not found");
  res.json({ song: toPublicSong(song) });
});

const createSongSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  album: z.string().trim().min(1).optional(),
  artistId: z.string().min(1, "Select an artist."),
  genreId: z.string().min(1, "Select a genre."),
  duration: z.coerce.number().int().min(0).default(0),
  lyrics: z.string().trim().min(1).optional(),
});

songsRouter.post("/", requireAuth, requireAdmin, songUpload, async (req, res) => {
  const files = uploadedFiles(req);

  try {
    const { title, album, artistId, genreId, duration, lyrics } = createSongSchema.parse(req.body);

    const audioFile = files.audio?.[0];
    if (!audioFile) {
      throw new HttpError(400, "An audio file is required");
    }

    const coverFile = files.cover?.[0];
    if (coverFile && coverFile.size > MAX_COVER_BYTES) {
      throw new HttpError(400, "Cover image must be 5MB or smaller");
    }

    const [artist, genre] = await Promise.all([
      prisma.artist.findUnique({ where: { id: artistId } }),
      prisma.genre.findUnique({ where: { id: genreId } }),
    ]);
    if (!artist) throw new HttpError(400, "Unknown artistId");
    if (!genre) throw new HttpError(400, "Unknown genreId");

    const song = await prisma.song.create({
      data: {
        title,
        album,
        duration,
        artistId,
        genreId,
        lyrics,
        audioUrl: audioUrlFor(audioFile.filename),
        coverUrl: coverFile ? coverUrlFor(coverFile.filename) : null,
      },
      include: songInclude,
    });

    res.status(201).json({ song: toPublicSong(song) });
  } catch (err) {
    await deleteUploadedFiles([...(files.audio ?? []), ...(files.cover ?? [])]);
    throw err;
  }
});

const updateSongSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").optional(),
  album: z.string().trim().min(1).optional(),
  artistId: z.string().min(1, "Select an artist.").optional(),
  genreId: z.string().min(1, "Select a genre.").optional(),
  duration: z.coerce.number().int().min(0).optional(),
  lyrics: z.string().trim().min(1).optional(),
});

songsRouter.patch("/:id", requireAuth, requireAdmin, songUpload, async (req, res) => {
  const files = uploadedFiles(req);

  try {
    const existing = await prisma.song.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new HttpError(404, "Song not found");

    const data = updateSongSchema.parse(req.body);

    const audioFile = files.audio?.[0];
    const coverFile = files.cover?.[0];
    if (coverFile && coverFile.size > MAX_COVER_BYTES) {
      throw new HttpError(400, "Cover image must be 5MB or smaller");
    }

    if (data.artistId) {
      const artist = await prisma.artist.findUnique({ where: { id: data.artistId } });
      if (!artist) throw new HttpError(400, "Unknown artistId");
    }
    if (data.genreId) {
      const genre = await prisma.genre.findUnique({ where: { id: data.genreId } });
      if (!genre) throw new HttpError(400, "Unknown genreId");
    }

    const song = await prisma.song.update({
      where: { id: existing.id },
      data: {
        ...data,
        ...(audioFile ? { audioUrl: audioUrlFor(audioFile.filename) } : {}),
        ...(coverFile ? { coverUrl: coverUrlFor(coverFile.filename) } : {}),
      },
      include: songInclude,
    });

    // Replaced files: drop the old ones from disk now that the DB points elsewhere.
    if (audioFile) await deleteMediaFile(existing.audioUrl);
    if (coverFile) await deleteMediaFile(existing.coverUrl);

    res.json({ song: toPublicSong(song) });
  } catch (err) {
    await deleteUploadedFiles([...(files.audio ?? []), ...(files.cover ?? [])]);
    throw err;
  }
});

songsRouter.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const song = await prisma.song.findUnique({ where: { id: req.params.id as string } });
  if (!song) throw new HttpError(404, "Song not found");

  await prisma.song.delete({ where: { id: song.id } });
  await Promise.all([deleteMediaFile(song.audioUrl), deleteMediaFile(song.coverUrl)]);

  res.status(204).end();
});
