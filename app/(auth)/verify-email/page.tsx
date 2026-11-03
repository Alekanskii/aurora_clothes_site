import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { verifyEmailAction } from "@/actions/auth";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell title="Missing verification token">
        <p className="text-sm text-stone">
          This page needs a token from the confirmation link in your email.
        </p>
      </AuthShell>
    );
  }

  // Server Components can call Server Actions directly as plain async
  // functions — no form needed for a one-shot action like this.
  const result = await verifyEmailAction(token);

  return (
    <AuthShell title={result.success ? "Email confirmed" : "Verification failed"}>
      <p className="text-sm text-stone">
        {result.success ? result.message : result.error}
      </p>
      {result.success && (
        <Link
          href={routes.login}
          className="mt-6 block rounded-pill bg-ink py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink"
        >
          Log in
        </Link>
      )}
    </AuthShell>
  );
}
