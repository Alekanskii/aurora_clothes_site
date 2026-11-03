"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container } from "@/components/layout/container";

const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type NewsletterValues = z.infer<typeof newsletterSchema>;

export function Newsletter() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useForm<NewsletterValues>({ resolver: zodResolver(newsletterSchema) });

  // No real subscription endpoint yet — this validates and resets so the
  // form is honestly demonstrable without pretending to call a backend that
  // doesn't exist. Wire to Resend's audience API (or a `Subscriber` table)
  // when that becomes a real requirement.
  async function onSubmit(_values: NewsletterValues) {
    await new Promise((r) => setTimeout(r, 300));
    reset();
  }

  return (
    <section className="bg-paper-deep py-24 text-center md:py-28">
      <Container>
        <span className="text-xs font-semibold uppercase tracking-widest text-stone">
          Join the list
        </span>
        <h2 className="mb-8 mt-2.5 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold">
          First access to new arrivals and restocks.
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mx-auto flex max-w-[440px] items-center gap-2 border-b border-ink pb-2.5"
        >
          <input
            type="email"
            placeholder="you@email.com"
            className="flex-1 bg-transparent py-2 text-[15px] outline-none"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "newsletter-error" : undefined}
            {...register("email")}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="whitespace-nowrap text-xs font-bold uppercase tracking-wide disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Subscribe →"}
          </button>
        </form>
        {errors.email && (
          <p id="newsletter-error" role="alert" className="mt-3 text-xs text-error">
            {errors.email.message}
          </p>
        )}
        {isSubmitSuccessful && !errors.email && (
          <p className="mt-3 text-xs text-success">Thanks — check your inbox to confirm.</p>
        )}
      </Container>
    </section>
  );
}
