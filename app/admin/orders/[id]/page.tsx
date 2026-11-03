import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { getAdminOrderById } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Order detail" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const address = order.shippingAddress;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold">Order #{order.orderNumber}</h2>
          <p className="mt-1 text-xs text-stone">
            {order.customerName ?? "—"} · {order.customerEmail}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone">Items</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between border-b border-border py-3 text-sm">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="mt-0.5 text-xs text-stone">
                  {item.color} · {item.size} · Qty {item.quantity}
                </p>
              </div>
              <span>{formatPrice(item.priceCents * item.quantity)}</span>
            </div>
          ))}
          <div className="mt-4 flex flex-col gap-1.5 text-sm text-ink/80">
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
              <span>{formatPrice(order.shippingCents)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatPrice(order.taxCents)}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone">Shipping address</h3>
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

          <h3 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-stone">Payment</h3>
          <p className="text-sm text-stone">
            {order.stripePaymentIntentId ?? "No payment intent recorded (order never completed checkout)."}
          </p>

          <h3 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-stone">Placed</h3>
          <p className="text-sm text-stone">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
