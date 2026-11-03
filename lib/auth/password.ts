import argon2 from "argon2";

// Argon2id specifically (not argon2i/argon2d) — OWASP's current
// recommendation, resistant to both GPU cracking and side-channel attacks.
const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MB, OWASP's 2024 minimum recommendation
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(plainText: string): Promise<string> {
  return argon2.hash(plainText, HASH_OPTIONS);
}

export async function verifyPassword(hash: string, plainText: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainText);
  } catch {
    // Malformed hash (shouldn't happen, but a corrupt value should fail
    // closed, not throw and 500 the login route).
    return false;
  }
}
