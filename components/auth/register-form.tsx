"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { registerAction } from "@/actions/auth";
import { routes } from "@/lib/routes";

export function RegisterForm() {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setResult(null);
    const res = await registerAction(data);
    setResult({
      success: res.success,
      message: res.success ? res.message ?? "Account created." : res.error,
    });
  }

  if (result?.success) {
    return (
      <div className="rounded-none border border-border bg-paper-deep p-6 text-sm">
        {result.message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <label htmlFor="register-name" className="mb-2 block text-xs uppercase tracking-wide text-stone">Name</label>
        <input id="register-name" {...register("name")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
        {errors.name && <p className="mt-1.5 text-xs text-error">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="register-email" className="mb-2 block text-xs uppercase tracking-wide text-stone">Email</label>
        <input id="register-email" type="email" {...register("email")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
        {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="register-password" className="mb-2 block text-xs uppercase tracking-wide text-stone">Password</label>
        <input id="register-password" type="password" {...register("password")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
        {errors.password && <p className="mt-1.5 text-xs text-error">{errors.password.message}</p>}
        <p className="mt-1.5 text-xs text-stone">At least 10 characters — length matters more than symbols.</p>
      </div>

      {result?.success === false && <p className="text-xs text-error">{result.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-pill bg-ink py-3.5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink disabled:opacity-60"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-xs text-stone">
        Already have an account?{" "}
        <Link href={routes.login} className="underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
