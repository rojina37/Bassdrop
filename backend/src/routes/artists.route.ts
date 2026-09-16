import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import {
  artistImageUpload,
  artistImageUrlFor,
  deleteMediaFile,
  deleteUploadedFiles,
} from "../lib/upload.js";

export const artistsRouter = Router();

function toPublicArtist(artist: {
  id: string;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  createdAt: Date;
  _count?: { songs: number; followers: number };
}) {
  return {
    id: artist.id,
    name: artist.name,
    bio: artist.bio,
    imageUrl: artist.imageUrl,
    createdAt: artist.createdAt,
    songCount: artist._count?.songs ?? 0,
    followerCount: artist._count?.followers ?? 0,
  };
}

const artistInclude = { _count: { select: { songs: true, followers: true } } } as const;

const listQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

artistsRouter.get("/", async (req, res) => {
  const { search, take, skip } = listQuerySchema.parse(req.query);

  const artists = await prisma.artist.findMany({
    where: search ? { name: { contains: search } } : undefined,
    include: artistInclude,
    orderBy: { name: "asc" },
    take,
    skip,
  });

  res.json({ artists: artists.map(toPublicArtist) });
});

artistsRouter.get("/:id", async (req, res) => {
  const artist = await prisma.artist.findUnique({
    where: { id: req.params.id as string },
    include: artistInclude,
  });
  if (!artist) throw new HttpError(404, "Artist not found");
  res.json({ artist: toPublicArtist(artist) });
});

const createArtistSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name must be 120 characters or fewer."),
  bio: z.string().trim().min(1).optional(),
});

artistsRouter.post("/", requireAuth, requireAdmin, artistImageUpload, async (req, res) => {
  try {
    const { name, bio } = createArtistSchema.parse(req.body);

    const artist = await prisma.artist.create({
      data: {
        name,
        bio,
        imageUrl: req.file ? artistImageUrlFor(req.file.filename) : null,
      },
      include: artistInclude,
    });

    res.status(201).json({ artist: toPublicArtist(artist) });
  } catch (err) {
    if (req.file) await deleteUploadedFiles([req.file]);
    throw err;
  }
});

const updateArtistSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name must be 120 characters or fewer.").optional(),
  bio: z.string().trim().min(1).optional(),
});

artistsRouter.patch("/:id", requireAuth, requireAdmin, artistImageUpload, async (req, res) => {
  try {
    const existing = await prisma.artist.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw new HttpError(404, "Artist not found");

    const data = updateArtistSchema.parse(req.body);

    const artist = await prisma.artist.update({
      where: { id: existing.id },
      data: {
        ...data,
        ...(req.file ? { imageUrl: artistImageUrlFor(req.file.filename) } : {}),
      },
      include: artistInclude,
    });

    if (req.file) await deleteMediaFile(existing.imageUrl);

    res.json({ artist: toPublicArtist(artist) });
  } catch (err) {
    if (req.file) await deleteUploadedFiles([req.file]);
    throw err;
  }
});

artistsRouter.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const artist = await prisma.artist.findUnique({ where: { id: req.params.id as string } });
  if (!artist) throw new HttpError(404, "Artist not found");

  try {
    await prisma.artist.delete({ where: { id: artist.id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      throw new HttpError(409, "Cannot delete an artist that still has songs");
    }
    throw err;
  }

  await deleteMediaFile(artist.imageUrl);
  res.status(204).end();
});

// Follow / unfollow — any authenticated user, not admin-only.
artistsRouter.post("/:id/follow", requireAuth, async (req, res) => {
  const artistId = req.params.id as string;
  const artist = await prisma.artist.findUnique({ where: { id: artistId } });
  if (!artist) throw new HttpError(404, "Artist not found");

  await prisma.artistFollow.upsert({
    where: { userId_artistId: { userId: req.user!.id, artistId } },
    update: {},
    create: { userId: req.user!.id, artistId },
  });

  res.status(204).end();
});

artistsRouter.delete("/:id/follow", requireAuth, async (req, res) => {
  const artistId = req.params.id as string;

  await prisma.artistFollow.deleteMany({
    where: { userId: req.user!.id, artistId },
  });

  res.status(204).end();
});
