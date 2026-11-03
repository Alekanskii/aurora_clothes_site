import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell title="Reset link missing">
        <p className="text-sm text-stone">
          This page needs a reset token from the link in your email. Request a new one from the
          forgot password page if yours has expired.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password">
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
