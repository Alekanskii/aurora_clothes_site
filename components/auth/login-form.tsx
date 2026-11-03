"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { mergeGuestCartIntoUserAction } from "@/actions/cart";
import { routes } from "@/lib/routes";

// authorize() in lib/auth/config.ts throws specific Error messages for
// account lockout / unverified email — NextAuth surfaces the thrown
// message as result.error on the client. Anything else (wrong password,
// no such user) falls back to one deliberately generic message.
function friendlyError(code: string | undefined): string {
  if (code === "ACCOUNT_LOCKED") {
    return "Too many failed attempts — this account is temporarily locked. Try again in 15 minutes, or reset your password.";
  }
  if (code === "EMAIL_NOT_VERIFIED") {
    return "Confirm your email address before logging in — check your inbox for the verification link.";
  }
  return "Incorrect email or password.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError(friendlyError(result.error));
      return;
    }

    await mergeGuestCartIntoUserAction();
    router.push(searchParams.get("callbackUrl") ?? routes.account);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <label htmlFor="login-email" className="mb-2 block text-xs uppercase tracking-wide text-stone">Email</label>
        <input id="login-email" type="email" {...register("email")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
        {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email.message}</p>}
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="login-password" className="text-xs uppercase tracking-wide text-stone">Password</label>
          <Link href={routes.forgotPassword} className="text-xs underline text-stone">
            Forgot password?
          </Link>
        </div>
        <input id="login-password" type="password" {...register("password")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
        {errors.password && <p className="mt-1.5 text-xs text-error">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-xs text-error">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-pill bg-ink py-3.5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink disabled:opacity-60"
      >
        {isSubmitting ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center text-xs text-stone">
        New to AURORA?{" "}
        <Link href={routes.register} className="underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
