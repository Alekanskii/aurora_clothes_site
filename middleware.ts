import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { checkAuthRateLimit } from "@/lib/rate-limit";
import { extractClientIp } from "@/lib/request-ip";

// A separate, edge-safe NextAuth() instance built only from authConfig
// (no Credentials provider, no Prisma, no argon2) — this is what actually
// runs in middleware's Edge runtime. The `authorized` callback in
// auth.config.ts decides allow/redirect; NextAuth's own middleware wrapper
// handles the redirect-to-signIn automatically when it returns false.
export const { auth } = NextAuth(authConfig);

const LOGIN_CALLBACK_PATH = "/api/auth/callback/credentials";

export default auth(async (req) => {
  // Rate limit login attempts by IP, ahead of Auth.js's own credentials
  // callback. This is a separate, coarser protection from the per-account
  // lockout in lib/auth/config.ts (5 failed attempts on ONE account) —
  // this one catches an attacker trying many different accounts from a
  // single IP, which per-account lockout alone never would.
  if (req.method === "POST" && req.nextUrl.pathname === LOGIN_CALLBACK_PATH) {
    const ip = extractClientIp(req.headers);
    const result = await checkAuthRateLimit(ip);
    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
      );
    }
  }
  // No further logic needed for everything else — the authorized()
  // callback in auth.config.ts already decided allow/redirect for
  // protected pages; this function only runs at all for requests that
  // passed it.
});

export const config = {
  matcher: [
    "/account/:path*",
    "/wishlist/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/api/auth/callback/credentials",
  ],
};
