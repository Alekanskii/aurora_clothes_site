import type { NextAuthConfig } from "next-auth";

const PROTECTED_PREFIXES = ["/account", "/wishlist", "/checkout"];

/**
 * Deliberately minimal and dependency-free: this file must be importable
 * from Edge middleware, which means no Prisma Client and no argon2 (a
 * native module) — both would crash at the edge. The full config (with
 * the actual Credentials provider) lives in config.ts and is only ever
 * imported by Node-runtime code (Route Handlers, Server Components,
 * Server Actions), never by middleware.ts.
 *
 * The `session` callback lives here (not just in the full config) because
 * middleware builds its own separate NextAuth instance from *this* file
 * alone — without this mapping, `auth.user.role` would be undefined in
 * middleware even though the JWT itself carries the role claim (encoded
 * by the full config's `jwt` callback at sign-in). Pure token→session
 * shaping has no Node dependencies, so it's safe to share here.
 */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/admin")) {
        return auth?.user?.role === "ADMIN";
      }

      const needsAuth = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
      return needsAuth ? Boolean(auth?.user) : true;
    },
  },
};
