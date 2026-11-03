import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { getAdminDashboardStats } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div>
      <div className="mb-10 grid gap-4 md:grid-cols-3">
        <StatCard label="Total orders" value={String(stats.totalOrders)} />
        <StatCard label="Revenue (paid + fulfilled)" value={formatPrice(stats.totalRevenueCents)} />
        <StatCard label="Products" value={String(stats.totalProducts)} />
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone">
            Low stock ({"\u2264"}5 units)
          </h2>
          {stats.lowStockVariants.length === 0 ? (
            <p className="text-sm text-stone">Nothing running low.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.lowStockVariants.map((v) => (
                <div key={v.id} className="flex justify-between border-b border-border py-2 text-sm">
                  <span>
                    {v.productName} — {v.color} / {v.size}
                  </span>
                  <span className="font-semibold text-error">{v.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone">Recent orders</h2>
            <Link href={routes.adminOrders} className="text-xs underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {stats.recentOrders.map((o) => (
              <Link
                key={o.id}
                href={routes.adminOrder(o.id)}
                className="flex items-center justify-between border-b border-border py-2 text-sm"
              >
                <span>
                  #{o.orderNumber} · {o.customerEmail}
                </span>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={o.status as never} />
                  <span className="w-16 text-right font-semibold">{formatPrice(o.totalCents)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
