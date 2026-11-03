import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { getAllOrdersAdmin } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Admin — Orders" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await getAllOrdersAdmin(status);

  const statuses = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">Orders ({orders.length})</h2>
        <div className="flex gap-2 text-xs">
          <Link href={routes.adminOrders} className={!status ? "font-semibold underline" : "text-stone"}>
            All
          </Link>
          {statuses.map((s) => (
            <Link
              key={s}
              href={`${routes.adminOrders}?status=${s}`}
              className={status === s ? "font-semibold underline" : "text-stone"}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-stone">
            <th className="pb-3 font-medium">Order</th>
            <th className="pb-3 font-medium">Customer</th>
            <th className="pb-3 font-medium">Items</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-border text-sm">
              <td className="py-3">
                <Link href={routes.adminOrder(o.id)} className="font-semibold hover:underline">
                  #{o.orderNumber}
                </Link>
              </td>
              <td className="py-3 text-stone">{o.customerEmail}</td>
              <td className="py-3 text-stone">{o.itemCount}</td>
              <td className="py-3">
                <OrderStatusBadge status={o.status as never} />
              </td>
              <td className="py-3 font-semibold">{formatPrice(o.totalCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
