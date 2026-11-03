import { prisma } from "@/lib/prisma";
import type { OrderSummaryData, OrderDetailData, ShippingAddressSnapshot } from "@/types/order";

function toOrderNumber(id: string): string {
  return id.slice(-8).toUpperCase();
}

export async function getOrdersForUser(userId: string): Promise<OrderSummaryData[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: toOrderNumber(order.id),
    status: order.status,
    totalCents: order.totalCents,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt.toISOString(),
  }));
}

/**
 * Scoped by `userId` directly in the `where` clause, not fetched by id
 * alone and checked afterward — this is what actually prevents one signed-in
 * user from viewing another user's order by guessing or iterating ids in
 * the URL (IDOR). A mismatch returns null exactly like "not found", so this
 * page can 404 rather than leak that the order id exists at all.
 */
export async function getOrderForUser(orderId: string, userId: string): Promise<OrderDetailData | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) return null;

  const items = order.items.map((item) => ({
    id: item.id,
    name: item.nameSnapshot,
    color: item.colorSnapshot,
    size: item.sizeSnapshot,
    priceCents: item.priceCentsSnapshot,
    quantity: item.quantity,
    lineTotalCents: item.priceCentsSnapshot * item.quantity,
  }));

  return {
    id: order.id,
    orderNumber: toOrderNumber(order.id),
    status: order.status,
    totalCents: order.totalCents,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt.toISOString(),
    items,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    taxCents: order.taxCents,
    discountCents: order.discountCents,
    shippingAddress: order.shippingAddress as unknown as ShippingAddressSnapshot,
  };
}
