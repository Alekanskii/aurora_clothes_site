"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateToken, hashToken, EMAIL_VERIFICATION_TTL_MS, PASSWORD_RESET_TTL_MS } from "@/lib/auth/tokens";
import { sendEmail, verificationEmailHtml, passwordResetEmailHtml } from "@/lib/email";
import { checkRegisterRateLimit, checkAuthRateLimit } from "@/lib/rate-limit";
import { extractClientIp } from "@/lib/request-ip";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validation/auth";

type ActionResult = { success: true; message?: string } | { success: false; error: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function registerAction(input: RegisterInput): Promise<ActionResult> {
  const ip = extractClientIp(await headers());
  const rateLimit = await checkRegisterRateLimit(ip);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many attempts — try again in a while." };
  }

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Deliberately vague — confirming "that email is already registered"
    // to an anonymous caller is a user-enumeration leak.
    return { success: false, error: "Could not create an account with those details." };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const { token, tokenHash } = generateToken();
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      purpose: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    },
  });

  await sendEmail({
    to: user.email,
    subject: "Confirm your AURORA account",
    html: verificationEmailHtml(`${SITE_URL}/verify-email?token=${token}`),
  });

  await prisma.auditLog.create({
    data: { actorId: user.id, action: "auth.register" },
  });

  return { success: true, message: "Check your email to confirm your account." };
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } });

  if (!record || record.purpose !== "EMAIL_VERIFICATION" || record.usedAt || record.expiresAt < new Date()) {
    return { success: false, error: "This verification link is invalid or has expired." };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { success: true, message: "Email confirmed — you can log in now." };
}

export async function requestPasswordResetAction(input: ForgotPasswordInput): Promise<ActionResult> {
  const ip = extractClientIp(await headers());
  const rateLimit = await checkAuthRateLimit(ip);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many attempts — try again in a while." };
  }

  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Same response whether the account exists or not — this is the one
  // request in the whole auth flow where the "success" path and the
  // "nothing happened" path must look identical to the caller.
  const genericMessage = "If an account exists for that email, a reset link is on its way.";

  if (!user) return { success: true, message: genericMessage };

  const { token, tokenHash } = generateToken();
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      purpose: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  });

  await sendEmail({
    to: user.email,
    subject: "Reset your AURORA password",
    html: passwordResetEmailHtml(`${SITE_URL}/reset-password?token=${token}`),
  });

  return { success: true, message: genericMessage };
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } });
  if (!record || record.purpose !== "PASSWORD_RESET" || record.usedAt || record.expiresAt < new Date()) {
    return { success: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    }),
    prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Any other outstanding reset tokens for this user are now stale —
    // a second unused reset link shouldn't still work after the password
    // has already changed.
    prisma.verificationToken.deleteMany({
      where: {
        userId: record.userId,
        purpose: "PASSWORD_RESET",
        usedAt: null,
        id: { not: record.id },
      },
    }),
    prisma.auditLog.create({
      data: { actorId: record.userId, action: "auth.password_reset" },
    }),
  ]);

  return { success: true, message: "Password updated — you can log in now." };
}
