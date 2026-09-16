import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

export const genresRouter = Router();

function toPublicGenre(genre: {
  id: string;
  name: string;
  createdAt: Date;
  _count?: { songs: number };
}) {
  return {
    id: genre.id,
    name: genre.name,
    createdAt: genre.createdAt,
    songCount: genre._count?.songs ?? 0,
  };
}

const genreInclude = { _count: { select: { songs: true } } } as const;

genresRouter.get("/", async (_req, res) => {
  const genres = await prisma.genre.findMany({
    include: genreInclude,
    orderBy: { name: "asc" },
  });
  res.json({ genres: genres.map(toPublicGenre) });
});

genresRouter.get("/:id", async (req, res) => {
  const genre = await prisma.genre.findUnique({
    where: { id: req.params.id as string },
    include: genreInclude,
  });
  if (!genre) throw new HttpError(404, "Genre not found");
  res.json({ genre: toPublicGenre(genre) });
});

const genreSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(60, "Name must be 60 characters or fewer."),
});

// Chat is organized around genres (see PROJECT.md), so every genre gets exactly
// one matching group chat room — created here rather than left to a manual
// admin step, so admins never have to remember to set one up separately.
genresRouter.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { name } = genreSchema.parse(req.body);

  const existing = await prisma.genre.findUnique({ where: { name } });
  if (existing) throw new HttpError(409, "A genre with that name already exists");

  const genre = await prisma.$transaction(async (tx) => {
    const created = await tx.genre.create({ data: { name }, include: genreInclude });
    await tx.groupChat.create({ data: { name: created.name, genreId: created.id } });
    return created;
  });

  res.status(201).json({ genre: toPublicGenre(genre) });
});

genresRouter.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const existing = await prisma.genre.findUnique({ where: { id: req.params.id as string } });
  if (!existing) throw new HttpError(404, "Genre not found");

  const { name } = genreSchema.parse(req.body);

  const duplicate = await prisma.genre.findUnique({ where: { name } });
  if (duplicate && duplicate.id !== existing.id) {
    throw new HttpError(409, "A genre with that name already exists");
  }

  const genre = await prisma.$transaction(async (tx) => {
    const updated = await tx.genre.update({
      where: { id: existing.id },
      data: { name },
      include: genreInclude,
    });
    await tx.groupChat.updateMany({ where: { genreId: updated.id }, data: { name: updated.name } });
    return updated;
  });
  res.json({ genre: toPublicGenre(genre) });
});

genresRouter.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const genre = await prisma.genre.findUnique({ where: { id: req.params.id as string } });
  if (!genre) throw new HttpError(404, "Genre not found");

  try {
    // The genre's chat room (and its messages/memberships, via cascade) goes with it —
    // it only ever existed to represent this genre's room.
    await prisma.$transaction([
      prisma.groupChat.deleteMany({ where: { genreId: genre.id } }),
      prisma.genre.delete({ where: { id: genre.id } }),
    ]);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      throw new HttpError(409, "Cannot delete a genre that still has songs assigned to it");
    }
    throw err;
  }

  res.status(204).end();
});
