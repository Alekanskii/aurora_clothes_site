import { NextResponse } from "next/server";
import type { Stripe } from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail, orderConfirmationEmailHtml } from "@/lib/email";

/**
 * Stripe requires the raw, unparsed request body to verify the webhook
 * signature — parsing it as JSON first (even implicitly) would change the
 * bytes and break verification. `request.text()` gets the raw string;
 * Next.js Route Handlers don't auto-parse the body, so this is safe.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderId = checkoutSession.metadata?.orderId;
    if (!orderId) {
      console.error("Webhook: checkout.session.completed with no orderId in metadata");
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    // Idempotency guard: Stripe can and does redeliver webhooks. If this
    // order was already marked PAID by an earlier delivery of the same
    // event, don't decrement stock or send the confirmation email twice.
    if (!order || order.status !== "PENDING") {
      return NextResponse.json({ received: true });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          stripePaymentIntentId:
            typeof checkoutSession.payment_intent === "string" ? checkoutSession.payment_intent : null,
        },
      }),
      ...order.items.map((item) =>
        prisma.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
      prisma.auditLog.create({
        data: { actorId: order.userId, action: "order.paid", targetId: order.id },
      }),
    ]);

    // Cart is cleared after payment confirmation, not at checkout-session
    // creation — if the customer abandons the Stripe-hosted payment page,
    // their cart is exactly as they left it.
    const userCart = await prisma.cart.findUnique({ where: { userId: order.userId } });
    if (userCart) {
      await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
    }

    await sendEmail({
      to: order.user.email,
      subject: `Your AURORA order is confirmed — #${order.id.slice(-8).toUpperCase()}`,
      html: orderConfirmationEmailHtml(order.id, order.totalCents),
    });
  }

  return NextResponse.json({ received: true });
}
