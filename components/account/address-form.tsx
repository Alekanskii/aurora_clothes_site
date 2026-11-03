"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validation/checkout";
import { createAddressAction } from "@/actions/addresses";

export function AddressForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: { saveAddress: true },
  });

  async function onSubmit(data: ShippingAddressInput) {
    setServerError(null);
    const result = await createAddressAction(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 border border-border p-5">
      <div>
        <label htmlFor="addr-fullName" className="mb-1.5 block text-xs uppercase tracking-wide text-stone">Full name</label>
        <input id="addr-fullName" {...register("fullName")} className="w-full border border-border bg-paper px-3 py-2.5 text-sm outline-none focus-visible:border-ink" />
        {errors.fullName && <p className="mt-1 text-xs text-error">{errors.fullName.message}</p>}
      </div>
      <div>
        <label htmlFor="addr-line1" className="mb-1.5 block text-xs uppercase tracking-wide text-stone">Address</label>
        <input id="addr-line1" {...register("line1")} className="w-full border border-border bg-paper px-3 py-2.5 text-sm outline-none focus-visible:border-ink" />
        {errors.line1 && <p className="mt-1 text-xs text-error">{errors.line1.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="addr-city" className="mb-1.5 block text-xs uppercase tracking-wide text-stone">City</label>
          <input id="addr-city" {...register("city")} className="w-full border border-border bg-paper px-3 py-2.5 text-sm outline-none focus-visible:border-ink" />
          {errors.city && <p className="mt-1 text-xs text-error">{errors.city.message}</p>}
        </div>
        <div>
          <label htmlFor="addr-postcode" className="mb-1.5 block text-xs uppercase tracking-wide text-stone">Postal code</label>
          <input id="addr-postcode" {...register("postcode")} className="w-full border border-border bg-paper px-3 py-2.5 text-sm outline-none focus-visible:border-ink" />
          {errors.postcode && <p className="mt-1 text-xs text-error">{errors.postcode.message}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="addr-country" className="mb-1.5 block text-xs uppercase tracking-wide text-stone">Country</label>
        <input id="addr-country" {...register("country")} className="w-full border border-border bg-paper px-3 py-2.5 text-sm outline-none focus-visible:border-ink" />
        {errors.country && <p className="mt-1 text-xs text-error">{errors.country.message}</p>}
      </div>

      {serverError && <p className="text-xs text-error">{serverError}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-pill bg-ink px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save address"}
        </button>
        <button type="button" onClick={onDone} className="text-xs text-stone underline">
          Cancel
        </button>
      </div>
    </form>
  );
}
