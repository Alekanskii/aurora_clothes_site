"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getCurrentCart } from "@/lib/data/cart";
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validation/checkout";
import { DEMO_COUPON_CODE, DEMO_COUPON_DISCOUNT_PERCENT } from "@/lib/cart/constants";

type ActionResult = { success: true; url: string } | { success: false; error: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function createCheckoutSessionAction(input: ShippingAddressInput): Promise<ActionResult> {
  if (!isStripeConfigured) {
    return {
      success: false,
      error:
        "Stripe isn't configured in this environment yet — add STRIPE_SECRET_KEY to .env (a free test-mode key from your Stripe dashboard) to actually process a checkout.",
    };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You need to be logged in to check out." };
  }

  const parsed = shippingAddressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid address." };
  }
  const address = parsed.data;

  const cart = await getCurrentCart();
  if (cart.items.length === 0) {
    return { success: false, error: "Your bag is empty." };
  }

  // Re-check stock at checkout time, not just at add-to-cart time — items
  // can sell out in the gap between adding to a cart and checking out.
  for (const item of cart.items) {
    const variant = await prisma.variant.findUnique({ where: { id: item.variantId } });
    if (!variant || variant.stock < item.quantity) {
      return {
        success: false,
        error: `${item.productName} (${item.color} / ${item.size}) no longer has enough stock. Update your bag and try again.`,
      };
    }
  }

  if (address.saveAddress) {
    const existingCount = await prisma.address.count({ where: { userId: session.user.id } });
    await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName: address.fullName,
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        postcode: address.postcode,
        country: address.country,
        phone: address.phone || null,
        isDefault: existingCount === 0,
      },
    });
  }

  // Order is created PENDING now, before payment — Variant.stock is only
  // decremented once the Stripe webhook confirms payment succeeded (see
  // app/api/webhooks/stripe/route.ts). This avoids permanently locking
  // stock for abandoned checkout sessions, at the cost of a known,
  // documented race: two people can both "succeed" at checking out the
  // last unit before either webhook lands. A real high-traffic store
  // would hold stock for the lifetime of the Stripe session instead —
  // flagged here rather than silently handled.
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      status: "PENDING",
      subtotalCents: cart.subtotalCents,
      shippingCents: cart.shippingCents,
      taxCents: cart.taxCents,
      discountCents: cart.discountCents,
      totalCents: cart.totalCents,
      couponCode: cart.couponCode,
      shippingAddress: address as unknown as object,
      items: {
        create: cart.items.map((item) => ({
          variantId: item.variantId,
          nameSnapshot: item.productName,
          colorSnapshot: item.color,
          sizeSnapshot: item.size,
          priceCentsSnapshot: item.priceCents,
          quantity: item.quantity,
        })),
      },
    },
  });

  // Discount is prorated into each line item's unit price rather than
  // passed as a Stripe-level discount/coupon object — real percentage-off
  // codes at scale should use Stripe's own Coupon/PromotionCode API so the
  // discount shows as its own line on the receipt; this is a deliberate
  // simplification for a single hardcoded demo code.
  const discountMultiplier =
    cart.couponCode === DEMO_COUPON_CODE ? 1 - DEMO_COUPON_DISCOUNT_PERCENT / 100 : 1;

  const productLineItems = cart.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: { name: `${item.productName} — ${item.color} / ${item.size}` },
      unit_amount: Math.round(item.priceCents * discountMultiplier),
    },
    quantity: item.quantity,
  }));

  const lineItems = [...productLineItems];
  if (cart.shippingCents > 0) {
    lineItems.push({
      price_data: { currency: "usd", product_data: { name: "Shipping" }, unit_amount: cart.shippingCents },
      quantity: 1,
    });
  }
  if (cart.taxCents > 0) {
    lineItems.push({
      price_data: { currency: "usd", product_data: { name: "Estimated tax" }, unit_amount: cart.taxCents },
      quantity: 1,
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: session.user.email ?? undefined,
    line_items: lineItems,
    success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/checkout`,
    metadata: { orderId: order.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: checkoutSession.id },
  });

  if (!checkoutSession.url) {
    return { success: false, error: "Could not start checkout — please try again." };
  }

  return { success: true, url: checkoutSession.url };
}
