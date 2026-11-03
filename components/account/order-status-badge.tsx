import { cn } from "@/lib/utils";
import type { OrderStatusValue } from "@/types/order";

const STATUS_STYLES: Record<OrderStatusValue, string> = {
  PENDING: "bg-paper-deep text-stone",
  PAID: "bg-[#fbf1de] text-gold-deep",
  FULFILLED: "bg-[#e3f3e4] text-success",
  CANCELLED: "bg-paper-deep text-stone line-through",
  REFUNDED: "bg-[#fbe9e9] text-error",
};

const STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "Payment pending",
  PAID: "Paid",
  FULFILLED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export function OrderStatusBadge({ status }: { status: OrderStatusValue }) {
  return (
    <span
      className={cn(
        "rounded-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
