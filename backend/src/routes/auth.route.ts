import crypto from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signAuthToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { isProd } from "../config/env.js";

export const authRouter = Router();

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

const registerSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().min(1, "Name is required.").max(120, "Name must be 120 characters or fewer."),
});

authRouter.post("/register", async (req, res) => {
  const { email, password, name } = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "Email already registered");

  const user = await prisma.user.create({
    data: { email, name, passwordHash: await bcrypt.hash(password, 10) },
  });

  const token = signAuthToken({ sub: user.id, role: user.role });
  res.status(201).json({ token, user: toPublicUser(user) });
});

// Self-service admin signup — no invite/approval gate. Anyone who can reach
// this endpoint can create a full admin account; that's a deliberate choice
// for this project (single-team, not a public multi-tenant deployment), not
// an oversight.
authRouter.post("/register-admin", async (req, res) => {
  const { email, password, name } = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "Email already registered");

  const user = await prisma.user.create({
    data: { email, name, passwordHash: await bcrypt.hash(password, 10), role: "ADMIN" },
  });

  const token = signAuthToken({ sub: user.id, role: user.role });
  res.status(201).json({ token, user: toPublicUser(user) });
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, "Invalid email or password");
  }

  const token = signAuthToken({ sub: user.id, role: user.role });
  res.json({ token, user: toPublicUser(user) });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw new HttpError(404, "User not found");
  res.json({ user: toPublicUser(user) });
});

const forgotPasswordSchema = z.object({ email: z.string().email() });

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });

  const genericResponse = {
    message: "If that email is registered, a reset link has been created.",
  };

  // Don't reveal whether the email is registered.
  if (!user) {
    res.json(genericResponse);
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  // No email service is wired up (BassDrop runs fully offline) — log the raw
  // token instead of mailing it, and echo it back outside production so the
  // reset flow is testable end-to-end. Replace with real email delivery later.
  if (!isProd) {
    console.log(`[auth] password reset token for ${email}: ${rawToken}`);
  }

  res.json(isProd ? genericResponse : { ...genericResponse, devToken: rawToken });
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

authRouter.post("/reset-password", async (req, res) => {
  const { token, password } = resetPasswordSchema.parse(req.body);
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.expiresAt < new Date()) {
    throw new HttpError(400, "Invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.delete({ where: { id: record.id } }),
  ]);

  res.json({ message: "Password updated" });
});
