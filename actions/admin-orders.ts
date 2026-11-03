"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/auth/require-admin";
import { orderStatusSchema } from "@/lib/validation/admin";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateOrderStatusAction(orderId: string, status: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Admin access required." };

  const parsed = orderStatusSchema.safeParse(status);
  if (!parsed.success) return { success: false, error: "Invalid status." };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { success: false, error: "Order not found." };

  // Marking an order REFUNDED actually calls Stripe's refund API — this
  // isn't just a label change. If there's no payment intent (e.g. the
  // order never completed payment) or Stripe isn't configured, the status
  // still updates but the refund itself is skipped, with that limitation
  // returned as an error rather than silently pretending money moved.
  if (parsed.data === "REFUNDED" && order.status !== "REFUNDED") {
    if (!stripe) {
      return { success: false, error: "Stripe isn't configured — can't issue a real refund." };
    }
    if (!order.stripePaymentIntentId) {
      return { success: false, error: "This order has no associated payment to refund." };
    }
    try {
      await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
    } catch (err) {
      console.error("Stripe refund failed:", err);
      return { success: false, error: "Stripe refund failed — order status was not changed." };
    }
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: parsed.data } });

  await prisma.auditLog.create({
    data: {
      actorId: admin.user.id,
      action: `order.status_changed_to_${parsed.data.toLowerCase()}`,
      targetId: orderId,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  return { success: true };
}
