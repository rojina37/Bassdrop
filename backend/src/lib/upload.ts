import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { env } from "../config/env.js";

const AUDIO_DIR = path.join(env.UPLOAD_DIR, "audio");
const COVER_DIR = path.join(env.UPLOAD_DIR, "covers");
const ARTIST_DIR = path.join(env.UPLOAD_DIR, "artists");

for (const dir of [AUDIO_DIR, COVER_DIR, ARTIST_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

export const MAX_AUDIO_BYTES = 30 * 1024 * 1024; // 30MB
export const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, file.fieldname === "audio" ? AUDIO_DIR : COVER_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

// Silently drop files with the wrong mimetype rather than erroring the whole
// request — route handlers check for the field's presence and report a clear
// 400 if it's missing.
function fileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const isAudio = file.fieldname === "audio" && file.mimetype.startsWith("audio/");
  const isCover = file.fieldname === "cover" && file.mimetype.startsWith("image/");
  cb(null, isAudio || isCover);
}

// Multer applies one fileSize ceiling across all fields; the audio field needs
// the larger allowance, so the cover field is size-checked again in the route
// handler after upload (and deleted if it's over MAX_COVER_BYTES).
export const songUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_AUDIO_BYTES },
}).fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

export function audioUrlFor(filename: string) {
  return `/media/audio/${filename}`;
}

export function coverUrlFor(filename: string) {
  return `/media/covers/${filename}`;
}

export function artistImageUrlFor(filename: string) {
  return `/media/artists/${filename}`;
}

const artistImageStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, ARTIST_DIR);
  },
  filename(req, file, cb) {
    cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
  },
});

function imageOnlyFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  cb(null, file.mimetype.startsWith("image/"));
}

export const artistImageUpload = multer({
  storage: artistImageStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: MAX_COVER_BYTES },
}).single("image");

function mediaPathFromUrl(url: string) {
  // "/media/audio/foo.mp3" -> "<UPLOAD_DIR>/audio/foo.mp3"
  const relative = url.replace(/^\/media\//, "");
  return path.join(env.UPLOAD_DIR, relative);
}

export async function deleteMediaFile(url: string | null | undefined) {
  if (!url) return;
  try {
    await fs.promises.unlink(mediaPathFromUrl(url));
  } catch {
    // best-effort — file may already be gone
  }
}

export async function deleteUploadedFiles(files: Express.Multer.File[] | undefined) {
  await Promise.all((files ?? []).map((file) => fs.promises.unlink(file.path).catch(() => {})));
}
