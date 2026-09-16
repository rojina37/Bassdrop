import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { songInclude, toPublicSong, type SongWithRelations } from "../lib/serializers.js";

export const recommendationsRouter = Router();

// Content-based filtering (genre/artist scoring) — see PROJECT.md. No ML
// service: candidates are scored in JS from a small signal set (liked
// songs, recent plays, followed artists), which is plenty for this catalog's
// size and keeps the whole thing debuggable.
type ScoredSong = { song: SongWithRelations; score: number; reason: string };

function rankBySignals(
  candidates: SongWithRelations[],
  weightedArtists: Map<string, { weight: number; reason: string }>,
  weightedGenres: Map<string, { weight: number; reason: string }>,
): ScoredSong[] {
  return candidates
    .map((song) => {
      const artistMatch = weightedArtists.get(song.artistId);
      const genreMatch = weightedGenres.get(song.genreId);
      const score = (artistMatch?.weight ?? 0) + (genreMatch?.weight ?? 0);
      const reason = artistMatch?.reason ?? genreMatch?.reason ?? "Popular on BassDrop";
      return { song, score, reason };
    })
    .sort((a, b) => b.score - a.score || b.song.createdAt.getTime() - a.song.createdAt.getTime());
}

// `excludeIds` is a hard exclude (e.g. "never recommend the song currently
// playing") — it's kept even here. `weakExcludeIds` (e.g. already
// liked/played) is dropped for this fallback: a tiny catalog with a very
// active user can otherwise exhaust every unseen song and end up
// recommending nothing at all, which reads as broken, not personalized.
async function padWithNewest(
  scored: ScoredSong[],
  excludeIds: Set<string>,
  take: number,
  fillerReason = "New on BassDrop",
): Promise<ScoredSong[]> {
  if (scored.length >= take) return scored.slice(0, take);

  const have = new Set(scored.map((entry) => entry.song.id));
  const filler = await prisma.song.findMany({
    where: { id: { notIn: [...excludeIds, ...have] } },
    include: songInclude,
    orderBy: { createdAt: "desc" },
    take: take - scored.length,
  });

  return [
    ...scored,
    ...filler.map((song) => ({ song, score: 0, reason: fillerReason })),
  ].slice(0, take);
}

// GET /api/recommendations — personalized "Top Picks for You" (Home page).
// Scores unseen songs by the user's liked songs, recent plays, and followed
// artists; a brand-new user with no signal just gets the newest catalog songs.
recommendationsRouter.get("/", requireAuth, async (req, res) => {
  const take = z.coerce.number().int().min(1).max(20).default(8).parse(req.query.take);
  const userId = req.user!.id;

  const [likedSongs, recentPlays, follows] = await Promise.all([
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
    prisma.artistFollow.findMany({ where: { userId }, select: { artistId: true } }),
  ]);

  const seenSongIds = new Set([
    ...likedSongs.map((entry) => entry.songId),
    ...recentPlays.map((entry) => entry.songId),
  ]);

  const weightedArtists = new Map<string, { weight: number; reason: string }>();
  const weightedGenres = new Map<string, { weight: number; reason: string }>();

  const bump = (
    map: Map<string, { weight: number; reason: string }>,
    key: string,
    weight: number,
    reason: string,
  ) => {
    const current = map.get(key);
    if (!current || current.weight < weight) map.set(key, { weight, reason });
    else current.weight += weight * 0.1; // small nudge for repeated signals without letting them dominate
  };

  for (const { artistId } of follows) bump(weightedArtists, artistId, 4, "From an artist you follow");
  for (const entry of likedSongs) {
    bump(weightedArtists, entry.song.artistId, 3, `Because you liked ${entry.song.title}`);
    bump(weightedGenres, entry.song.genreId, 1.5, `Because you like ${entry.song.genre.name}`);
  }
  for (const entry of recentPlays) {
    bump(weightedArtists, entry.song.artistId, 2, `Because you played ${entry.song.title}`);
    bump(weightedGenres, entry.song.genreId, 1, `More ${entry.song.genre.name}`);
  }

  let scored: ScoredSong[] = [];
  if (weightedArtists.size > 0 || weightedGenres.size > 0) {
    const candidates = await prisma.song.findMany({
      where: {
        id: { notIn: [...seenSongIds] },
        OR: [
          { artistId: { in: [...weightedArtists.keys()] } },
          { genreId: { in: [...weightedGenres.keys()] } },
        ],
      },
      include: songInclude,
      take: 100,
    });
    scored = rankBySignals(candidates, weightedArtists, weightedGenres);
  }

  let result = scored.slice(0, take);

  // Prefer unseen songs, but a small catalog + an active user can exhaust
  // every unseen song. Rather than fall straight to a flat "newest first"
  // list, re-score the songs they've already liked/played against the same
  // signals — a maxed-out user still gets a personalized order (e.g. "From
  // an artist you follow") instead of generic filler.
  if (result.length < take && (weightedArtists.size > 0 || weightedGenres.size > 0)) {
    const have = new Set(result.map((entry) => entry.song.id));
    const seenIdsToRescore = [...seenSongIds].filter((id) => !have.has(id));
    if (seenIdsToRescore.length > 0) {
      const seenCandidates = await prisma.song.findMany({
        where: { id: { in: seenIdsToRescore } },
        include: songInclude,
      });
      const rescored = rankBySignals(seenCandidates, weightedArtists, weightedGenres);
      result = [...result, ...rescored].slice(0, take);
    }
  }

  // Last resort: catalog is genuinely smaller than `take` — pad with
  // whatever's newest so the section still isn't empty.
  result = await padWithNewest(result, new Set(), take, "New on BassDrop");

  // Best-effort cache of the result — lets the schema's designed purpose
  // (score/reason per user+song) actually get used; never blocks the response.
  Promise.all(
    result.map(({ song, score, reason }) =>
      prisma.userSongRecommendation.upsert({
        where: { userId_songId: { userId, songId: song.id } },
        update: { score, reason },
        create: { userId, songId: song.id, score, reason },
      }),
    ),
  ).catch(() => {});

  res.json({ songs: result.map(({ song, reason }) => ({ ...toPublicSong(song), reason })) });
});

// GET /api/recommendations/song/:songId — "Recommended for you" on the Now
// Playing page: songs related to whatever's currently playing (same artist
// weighted above same genre), not tied to a logged-in user.
recommendationsRouter.get("/song/:songId", async (req, res) => {
  const take = z.coerce.number().int().min(1).max(20).default(8).parse(req.query.take);
  const songId = req.params.songId as string;

  const song = await prisma.song.findUnique({ where: { id: songId }, include: songInclude });
  if (!song) throw new HttpError(404, "Song not found");

  const weightedArtists = new Map([[song.artistId, { weight: 3, reason: `Because you're playing ${song.title}` }]]);
  const weightedGenres = new Map([[song.genreId, { weight: 1, reason: `More ${song.genre.name}` }]]);

  // Score the whole catalog rather than pre-filtering to same-artist/genre
  // matches: same artist (weight 3) and same genre (weight 1) naturally
  // sort to the top, but a small or sparse catalog with no direct match
  // still falls back to the rest of the catalog by recency instead of a
  // blanket "New on BassDrop" filler for every slot.
  const candidates = await prisma.song.findMany({
    where: { id: { not: song.id } },
    include: songInclude,
    take: 100,
  });

  const scored = rankBySignals(candidates, weightedArtists, weightedGenres);
  const result = await padWithNewest(scored, new Set([song.id]), take);

  res.json({ songs: result.map(({ song: s, reason }) => ({ ...toPublicSong(s), reason })) });
});
