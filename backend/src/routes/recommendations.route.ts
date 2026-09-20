import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { songInclude, toPublicSong, type SongWithRelations } from "../lib/serializers.js";
import {
  addWeighted,
  cosineSimilarity,
  inverseDocumentFrequencies,
  tfidfVector,
  tokenize,
  type SparseVector,
} from "../lib/tfidf.js";

export const recommendationsRouter = Router();

// Content-based filtering — see PROJECT.md. No ML service: songs are turned
// into TF-IDF term vectors (title/album/artist/genre/lyrics) and ranked by
// cosine similarity against a "taste vector" built from the user's liked
// songs, recent plays, and followed artists. weightedArtists/weightedGenres
// below are only for the human-readable "reason" shown in the UI, not for
// scoring — scoring is entirely the TF-IDF/cosine step.
type ScoredSong = { song: SongWithRelations; score: number; reason: string };

function repeat(tokens: string[], times: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < times; i++) out.push(...tokens);
  return out;
}

// Structured metadata (artist/genre/title) is repeated so it isn't drowned
// out by lyrics length in the raw term-frequency count.
function songDocument(song: SongWithRelations): string[] {
  return [
    ...repeat(tokenize(song.artist.name), 3),
    ...repeat(tokenize(song.genre.name), 3),
    ...repeat(tokenize(song.title), 2),
    ...tokenize(song.album ?? ""),
    ...tokenize(song.lyrics ?? ""),
  ];
}

function buildCatalogIndex(songs: SongWithRelations[]): {
  idf: Map<string, number>;
  vectors: Map<string, SparseVector>;
} {
  const documents = songs.map((song) => [song.id, songDocument(song)] as const);
  const idf = inverseDocumentFrequencies(documents.map(([, tokens]) => tokens));
  const vectors = new Map(documents.map(([id, tokens]) => [id, tfidfVector(tokens, idf)]));
  return { idf, vectors };
}

function artistBoostVector(name: string, idf: Map<string, number>): SparseVector {
  return tfidfVector(repeat(tokenize(name), 3), idf);
}

function scoreCatalog(
  songs: SongWithRelations[],
  profile: SparseVector,
  vectors: Map<string, SparseVector>,
  weightedArtists: Map<string, { weight: number; reason: string }>,
  weightedGenres: Map<string, { weight: number; reason: string }>,
): ScoredSong[] {
  return songs
    .map((song) => {
      const vector = vectors.get(song.id);
      const score = vector ? cosineSimilarity(profile, vector) : 0;
      const artistMatch = weightedArtists.get(song.artistId);
      const genreMatch = weightedGenres.get(song.genreId);
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

  const [likedSongs, recentPlays, follows, catalog] = await Promise.all([
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
    prisma.artistFollow.findMany({ where: { userId }, include: { artist: { select: { name: true } } } }),
    prisma.song.findMany({ include: songInclude }),
  ]);

  const seenSongIds = new Set([
    ...likedSongs.map((entry) => entry.songId),
    ...recentPlays.map((entry) => entry.songId),
  ]);

  const { idf, vectors } = buildCatalogIndex(catalog);

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

  // Taste vector: TF-IDF vectors of liked/played songs (weighted by how
  // strong that signal is), plus a direct boost for followed artists' names
  // so following someone counts even before you've played any of their songs.
  const profile: SparseVector = new Map();
  for (const entry of likedSongs) {
    const vector = vectors.get(entry.songId);
    if (vector) addWeighted(profile, vector, 3);
  }
  for (const entry of recentPlays) {
    const vector = vectors.get(entry.songId);
    if (vector) addWeighted(profile, vector, 2);
  }
  for (const { artist } of follows) addWeighted(profile, artistBoostVector(artist.name, idf), 4);

  const unseen = catalog.filter((song) => !seenSongIds.has(song.id));
  const scored = scoreCatalog(unseen, profile, vectors, weightedArtists, weightedGenres);

  let result = scored.slice(0, take);

  // Prefer unseen songs, but a small catalog + an active user can exhaust
  // every unseen song. Rather than fall straight to a flat "newest first"
  // list, re-score the songs they've already liked/played against the same
  // taste vector — a maxed-out user still gets a personalized order instead
  // of generic filler.
  if (result.length < take && profile.size > 0) {
    const have = new Set(result.map((entry) => entry.song.id));
    const seenIdsToRescore = new Set([...seenSongIds].filter((id) => !have.has(id)));
    if (seenIdsToRescore.size > 0) {
      const seenCandidates = catalog.filter((song) => seenIdsToRescore.has(song.id));
      const rescored = scoreCatalog(seenCandidates, profile, vectors, weightedArtists, weightedGenres);
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
// Playing page: songs whose TF-IDF vector is closest by cosine similarity to
// the currently playing song, not tied to a logged-in user.
recommendationsRouter.get("/song/:songId", async (req, res) => {
  const take = z.coerce.number().int().min(1).max(20).default(8).parse(req.query.take);
  const songId = req.params.songId as string;

  const catalog = await prisma.song.findMany({ include: songInclude });
  const song = catalog.find((entry) => entry.id === songId);
  if (!song) throw new HttpError(404, "Song not found");

  const { vectors } = buildCatalogIndex(catalog);
  const songVector = vectors.get(song.id) ?? new Map();

  // Kept only for the "reason" text — same artist/genre naturally scores
  // highest via cosine similarity anyway, since songDocument() repeats
  // artist/genre names into the term vector.
  const weightedArtists = new Map([[song.artistId, { weight: 3, reason: `Because you're playing ${song.title}` }]]);
  const weightedGenres = new Map([[song.genreId, { weight: 1, reason: `More ${song.genre.name}` }]]);

  const candidates = catalog.filter((entry) => entry.id !== song.id);
  const scored = scoreCatalog(candidates, songVector, vectors, weightedArtists, weightedGenres);
  const result = await padWithNewest(scored, new Set([song.id]), take);

  res.json({ songs: result.map(({ song: s, reason }) => ({ ...toPublicSong(s), reason })) });
});
