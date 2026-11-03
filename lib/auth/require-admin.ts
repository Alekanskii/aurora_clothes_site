import { auth } from "@/lib/auth/config";

export type AdminSession = { user: { id: string; email: string; role: "ADMIN" } };

/**
 * Same principle as every other "defense in depth" check in this codebase
 * (see /account, /checkout) — middleware.ts already blocks non-admins from
 * reaching /admin/*, but Server Actions are callable directly, so every
 * admin action re-checks role itself rather than trusting the request
 * came from a page middleware already gated.
 */
export async function requireAdmin(): Promise<AdminSession | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session as AdminSession;
}
