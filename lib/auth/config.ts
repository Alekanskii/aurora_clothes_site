import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validation/auth";
import { MAX_FAILED_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS } from "@/lib/auth/constants";
import { authConfig } from "@/lib/auth/auth.config";

// This is the Node-runtime auth config — it's the only file that imports
// Prisma and argon2 for auth purposes, and it must never be imported by
// middleware.ts (see auth.config.ts for why). Route Handlers, Server
// Components, and Server Actions all get their `auth()`/`signIn`/`signOut`
// from here.
//
// No PrismaAdapter on purpose. @auth/prisma-adapter expects Auth.js's own
// Account/Session/VerificationToken shape (identifier/token/expires,
// composite keys) — our schema's VerificationToken has a completely
// different shape (userId/tokenHash/purpose/expiresAt) built for our own
// hand-rolled verification/reset flows. Credentials + JWT sessions don't
// need an adapter at all — authorize() below is the entire integration
// point with the database.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        // Same generic failure path whether the account doesn't exist or
        // the password is wrong — never reveal which one to the caller.
        if (!user || !user.passwordHash) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("ACCOUNT_LOCKED");
        }

        const valid = await verifyPassword(user.passwordHash, password);

        if (!valid) {
          const attempts = user.failedLoginAttempts + 1;
          const lockingNow = attempts >= MAX_FAILED_LOGIN_ATTEMPTS;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: lockingNow ? 0 : attempts,
              lockedUntil: lockingNow ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
            },
          });
          await prisma.auditLog.create({
            data: {
              actorId: user.id,
              action: lockingNow ? "auth.account_locked" : "auth.login_failed",
            },
          });
          if (lockingNow) throw new Error("ACCOUNT_LOCKED");
          return null;
        }

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Successful login clears the failure counter.
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        });
        await prisma.auditLog.create({
          data: { actorId: user.id, action: "auth.login_success" },
        });

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Carries id/role from the User row into the JWT once, at sign-in —
    // every subsequent request reads them from the token, not the database.
    // (The session callback that maps token -> session.user lives in
    // auth.config.ts, inherited here via the spread above, since
    // middleware needs that same mapping and builds its own instance from
    // auth.config.ts alone.)
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
  },
});

