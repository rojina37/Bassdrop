import type { Song } from "@prisma/client";

export const songInclude = {
  artist: { select: { id: true, name: true } },
  genre: { select: { id: true, name: true } },
} as const;

export type SongWithRelations = Song & {
  artist: { id: string; name: string };
  genre: { id: string; name: string };
};

export function toPublicSong(song: SongWithRelations) {
  return {
    id: song.id,
    title: song.title,
    album: song.album,
    duration: song.duration,
    audioUrl: song.audioUrl,
    coverUrl: song.coverUrl,
    lyrics: song.lyrics,
    artist: song.artist,
    genre: song.genre,
    createdAt: song.createdAt,
    updatedAt: song.updatedAt,
  };
}
