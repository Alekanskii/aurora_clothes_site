"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validation/checkout";
import { createCheckoutSessionAction } from "@/actions/checkout";

export function ShippingForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: { saveAddress: false },
  });

  async function onSubmit(data: ShippingAddressInput) {
    setServerError(null);
    const result = await createCheckoutSessionAction(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    // Stripe Checkout is a hosted page — a full navigation, not a fetch.
    window.location.href = result.url;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <label htmlFor="ship-fullName" className="mb-2 block text-xs uppercase tracking-wide text-stone">Full name</label>
        <input id="ship-fullName" {...register("fullName")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
        {errors.fullName && <p className="mt-1.5 text-xs text-error">{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor="ship-line1" className="mb-2 block text-xs uppercase tracking-wide text-stone">Address</label>
        <input id="ship-line1" {...register("line1")} placeholder="Street and number" className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
        {errors.line1 && <p className="mt-1.5 text-xs text-error">{errors.line1.message}</p>}
      </div>

      <div>
        <label htmlFor="ship-line2" className="sr-only">Apartment, suite, etc. (optional)</label>
        <input id="ship-line2" {...register("line2")} placeholder="Apartment, suite, etc. (optional)" className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ship-city" className="mb-2 block text-xs uppercase tracking-wide text-stone">City</label>
          <input id="ship-city" {...register("city")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
          {errors.city && <p className="mt-1.5 text-xs text-error">{errors.city.message}</p>}
        </div>
        <div>
          <label htmlFor="ship-postcode" className="mb-2 block text-xs uppercase tracking-wide text-stone">Postal code</label>
          <input id="ship-postcode" {...register("postcode")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
          {errors.postcode && <p className="mt-1.5 text-xs text-error">{errors.postcode.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="ship-country" className="mb-2 block text-xs uppercase tracking-wide text-stone">Country</label>
        <input id="ship-country" {...register("country")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
        {errors.country && <p className="mt-1.5 text-xs text-error">{errors.country.message}</p>}
      </div>

      <div>
        <label htmlFor="ship-phone" className="mb-2 block text-xs uppercase tracking-wide text-stone">Phone (optional)</label>
        <input id="ship-phone" {...register("phone")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" {...register("saveAddress")} className="accent-ink" />
        Save this address to my account
      </label>

      {serverError && <p className="text-xs text-error">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-pill bg-ink py-4 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink disabled:opacity-60"
      >
        {isSubmitting ? "Redirecting to payment…" : "Continue to payment"}
      </button>
    </form>
  );
}
