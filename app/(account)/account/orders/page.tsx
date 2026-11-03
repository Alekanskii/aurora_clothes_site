import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { auth } from "@/lib/auth/config";
import { getOrdersForUser } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Your orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  const orders = await getOrdersForUser(session.user.id);

  return (
    <Container className="py-14 pb-28">
      <p className="mb-2 text-xs text-stone">
        <Link href={routes.account} className="font-semibold text-ink">Account</Link> / Orders
      </p>
      <h1 className="mb-8 font-heading text-2xl font-extrabold">Your orders</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-stone">
          <p className="mb-5 text-sm">You haven&apos;t placed an order yet.</p>
          <Link
            href={routes.shop}
            className="inline-block rounded-pill bg-ink px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={routes.accountOrder(order.id)}
              className="flex items-center justify-between border border-border p-6 transition-colors hover:border-ink"
            >
              <div>
                <p className="text-sm font-semibold">Order #{order.orderNumber}</p>
                <p className="mt-1 text-xs text-stone">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="flex items-center gap-5">
                <OrderStatusBadge status={order.status} />
                <span className="text-sm font-semibold">{formatPrice(order.totalCents)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
