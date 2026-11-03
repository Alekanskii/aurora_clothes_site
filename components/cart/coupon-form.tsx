"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyCouponAction, removeCouponAction } from "@/actions/cart";

export function CouponForm({ appliedCode }: { appliedCode: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function apply() {
    setError(null);
    startTransition(async () => {
      const result = await applyCouponAction(value);
      if (!result.success) setError(result.error);
      else setValue("");
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await removeCouponAction();
      router.refresh();
    });
  }

  if (appliedCode) {
    return (
      <div className="mb-5 flex items-center justify-between text-xs">
        <span>
          Code <span className="font-semibold">{appliedCode}</span> applied
        </span>
        <button onClick={remove} disabled={isPending} className="underline">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Promo code"
          className="flex-1 border border-border bg-paper px-3 py-2.5 text-sm outline-none focus-visible:border-ink"
        />
        <button
          onClick={apply}
          disabled={isPending || !value}
          className="border border-ink px-4 text-xs font-semibold uppercase tracking-wide disabled:opacity-50"
        >
          Apply
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </div>
  );
}
