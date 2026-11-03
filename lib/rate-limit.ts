import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Upstash's client talks over plain HTTP REST — no native bindings, which
// is what makes it safe to use from Edge middleware (unlike Prisma/argon2;
// see lib/auth/auth.config.ts for why that split matters elsewhere).
const authLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "10 m"), prefix: "ratelimit:auth" })
  : null;

const registerLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "ratelimit:register" })
  : null;

let warnedOnce = false;

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Without UPSTASH_REDIS_REST_URL/TOKEN configured (unset by default in
 * .env.example), this fails open — allows every request rather than
 * blocking all traffic because an optional dependency isn't set up.
 * Same honest-degradation pattern as lib/email.ts and lib/stripe.ts. This
 * means account lockout (5 failed attempts, see lib/auth/constants.ts) is
 * the only brute-force protection until Upstash is actually configured —
 * real, but per-account, not per-IP across many accounts.
 */
async function checkLimit(limiter: Ratelimit | null, identifier: string): Promise<RateLimitResult> {
  if (!limiter) {
    if (!warnedOnce) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting is disabled (failing open). " +
          "See DEPLOYMENT.md before relying on this in production."
      );
      warnedOnce = true;
    }
    return { allowed: true };
  }
  const result = await limiter.limit(identifier);
  return result.success
    ? { allowed: true }
    : { allowed: false, retryAfterSeconds: Math.ceil((result.reset - Date.now()) / 1000) };
}

/** Applies to login attempts, by IP — catches credential stuffing across
 * many different accounts, which per-account lockout alone can't. */
export function checkAuthRateLimit(ip: string): Promise<RateLimitResult> {
  return checkLimit(authLimiter, ip);
}

/** Applies to registration, by IP — limits spam account creation and the
 * outbound verification emails that come with each one. */
export function checkRegisterRateLimit(ip: string): Promise<RateLimitResult> {
  return checkLimit(registerLimiter, ip);
}
