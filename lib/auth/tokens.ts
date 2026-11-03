import { randomBytes, createHash } from "crypto";

const TOKEN_BYTES = 32;
export const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
export const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60; // 1 hour — shorter, since a leaked reset link is more dangerous

/**
 * Generates a random token and its SHA-256 hash. The plaintext token goes
 * in the emailed link; only the hash is ever written to the database — a
 * leaked database dump shouldn't hand out usable reset/verification links.
 */
export function generateToken(): { token: string; tokenHash: string } {
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
