import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import {
  GUEST_CART_COOKIE,
  DEMO_COUPON_CODE,
  DEMO_COUPON_DISCOUNT_PERCENT,
  FREE_SHIPPING_THRESHOLD_CENTS,
  FLAT_SHIPPING_CENTS,
  CART_TAX_RATE,
} from "@/lib/cart/constants";
import type { CartData } from "@/types/cart";

const cartWithItemsArgs = Prisma.validator<Prisma.CartDefaultArgs>()({
  include: {
    items: {
      include: {
        variant: { include: { product: { include: { images: true } } } },
      },
    },
  },
});
type CartWithItems = Prisma.CartGetPayload<typeof cartWithItemsArgs>;

const EMPTY_CART: CartData = {
  id: null,
  items: [],
  itemCount: 0,
  couponCode: null,
  subtotalCents: 0,
  discountCents: 0,
  shippingCents: 0,
  taxCents: 0,
  totalCents: 0,
};

/**
 * Read-only — safe to call from a Server Component. Never creates a cart
 * or sets a cookie (Server Components can't write cookies at all); an
 * empty result just means "nothing to show yet", not an error. Cart
 * creation only happens inside actions/cart.ts's addToCartAction, which
 * runs as a Server Action and can set the guest-cart cookie.
 */
export async function getCurrentCart(): Promise<CartData> {
  const session = await auth();

  const cart: CartWithItems | null = session?.user
    ? await prisma.cart.findUnique({ where: { userId: session.user.id }, ...cartWithItemsArgs })
    : await findGuestCart();

  return cart ? toCartData(cart) : EMPTY_CART;
}

async function findGuestCart(): Promise<CartWithItems | null> {
  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!guestToken) return null;
  return prisma.cart.findUnique({ where: { guestToken }, ...cartWithItemsArgs });
}

function toCartData(cart: CartWithItems): CartData {
  const items = cart.items.map((item) => {
    const { variant } = item;
    const { product } = variant;
    const image = product.images[0];
    return {
      id: item.id,
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      color: variant.color,
      size: variant.size,
      imageUrl: image?.url ?? "/illustrations/outerwear.svg",
      imageAlt: image?.alt ?? product.name,
      priceCents: variant.priceCents,
      quantity: item.quantity,
      stock: variant.stock,
      lineTotalCents: variant.priceCents * item.quantity,
    };
  });

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalCents = items.reduce((sum, i) => sum + i.lineTotalCents, 0);
  const discountCents =
    cart.couponCode === DEMO_COUPON_CODE
      ? Math.round(subtotalCents * (DEMO_COUPON_DISCOUNT_PERCENT / 100))
      : 0;
  const afterDiscount = subtotalCents - discountCents;
  const shippingCents =
    items.length === 0 ? 0 : afterDiscount >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  const taxCents = Math.round(afterDiscount * CART_TAX_RATE);

  return {
    id: cart.id,
    items,
    itemCount,
    couponCode: cart.couponCode,
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents: afterDiscount + shippingCents + taxCents,
  };
}
