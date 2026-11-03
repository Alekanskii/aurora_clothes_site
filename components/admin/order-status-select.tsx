"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/actions/admin-orders";

const STATUSES = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"] as const;

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [value, setValue] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    setError(null);
    const previous = value;
    setValue(next); // optimistic
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, next);
      if (!result.success) {
        setValue(previous);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="border border-border bg-paper px-3.5 py-2 text-sm disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
      {value === "REFUNDED" && (
        <p className="mt-2 text-xs text-stone">
          Setting this calls Stripe&apos;s refund API for real — it&apos;s not just a label change.
        </p>
      )}
    </div>
  );
}
