import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { songInclude, toPublicSong } from "../lib/serializers.js";

export const searchRouter = Router();

const searchQuerySchema = z.object({
  q: z.string().trim().min(1),
  type: z.enum(["all", "songs", "artists", "genres"]).default("all"),
  take: z.coerce.number().int().min(1).max(50).default(10),
  skip: z.coerce.number().int().min(0).default(0),
});

// type=all is the instant "as you type" mode: a small capped preview from each
// category. type=songs/artists/genres is a full, paginated single-category
// search (e.g. a "see all results" page).
searchRouter.get("/", async (req, res) => {
  const { q, type, take, skip } = searchQuerySchema.parse(req.query);
  const isAll = type === "all";
  const limit = isAll ? Math.min(take, 5) : take;
  const offset = isAll ? 0 : skip;

  const [songs, artists, genres] = await Promise.all([
    prisma.song.findMany({
      where: { OR: [{ title: { contains: q } }, { album: { contains: q } }] },
      include: songInclude,
      orderBy: { title: "asc" },
      take: limit,
      skip: offset,
    }),
    prisma.artist.findMany({
      where: { name: { contains: q } },
      select: { id: true, name: true, imageUrl: true },
      orderBy: { name: "asc" },
      take: limit,
      skip: offset,
    }),
    prisma.genre.findMany({
      where: { name: { contains: q } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: limit,
      skip: offset,
    }),
  ]);

  res.json({
    query: q,
    ...(type === "all" || type === "songs" ? { songs: songs.map(toPublicSong) } : {}),
    ...(type === "all" || type === "artists" ? { artists } : {}),
    ...(type === "all" || type === "genres" ? { genres } : {}),
  });
});
