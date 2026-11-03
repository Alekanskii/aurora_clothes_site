import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create an account" subtitle="Takes about a minute.">
      <RegisterForm />
    </AuthShell>
  );
}
