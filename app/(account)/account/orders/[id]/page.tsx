import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { auth } from "@/lib/auth/config";
import { getOrderForUser } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Order detail" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  const { id } = await params;
  // getOrderForUser scopes the lookup by userId — a well-formed id
  // belonging to someone else's order returns null here, same as a
  // nonexistent one, and both correctly 404 rather than leaking anything.
  const order = await getOrderForUser(id, session.user.id);
  if (!order) notFound();

  const address = order.shippingAddress;

  return (
    <Container className="py-14 pb-28">
      <p className="mb-2 text-xs text-stone">
        <Link href={routes.account} className="font-semibold text-ink">Account</Link> /{" "}
        <Link href={routes.accountOrders}>Orders</Link> / #{order.orderNumber}
      </p>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">Order #{order.orderNumber}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-14 md:grid-cols-[1fr_340px]">
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone">Items</h2>
          <div className="flex flex-col">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between border-b border-border py-4 text-sm">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs text-stone">
                    {item.color} · {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">{formatPrice(item.lineTotalCents)}</span>
              </div>
            ))}
          </div>

          <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wide text-stone">
            Shipping address
          </h2>
          <p className="text-sm leading-relaxed text-ink/80">
            {address.fullName}
            <br />
            {address.line1}
            {address.line2 && <>, {address.line2}</>}
            <br />
            {address.city}, {address.postcode}
            <br />
            {address.country}
          </p>
        </div>

        <div className="h-fit bg-paper-deep p-7">
          <h3 className="mb-5 text-base font-semibold">Summary</h3>
          <div className="flex flex-col gap-2.5 text-sm text-ink/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotalCents)}</span>
            </div>
            {order.discountCents > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>−{formatPrice(order.discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shippingCents === 0 ? "Free" : formatPrice(order.shippingCents)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatPrice(order.taxCents)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
          <p className="mt-5 text-xs text-stone">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </Container>
  );
}
