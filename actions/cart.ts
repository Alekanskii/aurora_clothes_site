"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import {
  GUEST_CART_COOKIE,
  GUEST_CART_COOKIE_MAX_AGE,
  DEMO_COUPON_CODE,
} from "@/lib/cart/constants";
import type { Cart } from "@prisma/client";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Finds or lazily creates a cart for the current visitor — signed-in
 * user or guest. Guest carts are identified by an opaque random token in
 * an HttpOnly cookie, never by the cart's own database id, so a leaked
 * cookie can't be traded for a guessable primary key.
 */
async function getOrCreateCart(): Promise<Cart> {
  const session = await auth();
  const cookieStore = await cookies();

  if (session?.user) {
    const existing = await prisma.cart.findUnique({ where: { userId: session.user.id } });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId: session.user.id } });
  }

  const existingToken = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (existingToken) {
    const existing = await prisma.cart.findUnique({ where: { guestToken: existingToken } });
    if (existing) return existing;
  }

  const guestToken = randomBytes(24).toString("hex");
  const cart = await prisma.cart.create({ data: { guestToken } });
  cookieStore.set(GUEST_CART_COOKIE, guestToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: GUEST_CART_COOKIE_MAX_AGE,
    path: "/",
  });
  return cart;
}

export async function addToCartAction(variantId: string, quantity: number): Promise<ActionResult> {
  if (quantity < 1) return { success: false, error: "Quantity must be at least 1." };

  const variant = await prisma.variant.findUnique({ where: { id: variantId } });
  if (!variant) return { success: false, error: "This item is no longer available." };

  const cart = await getOrCreateCart();
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  const newQuantity = (existingItem?.quantity ?? 0) + quantity;
  if (newQuantity > variant.stock) {
    return { success: false, error: `Only ${variant.stock} left in stock.` };
  }

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: newQuantity },
    create: { cartId: cart.id, variantId, quantity },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateCartItemQuantityAction(
  cartItemId: string,
  quantity: number
): Promise<ActionResult> {
  if (quantity < 1) return removeCartItemAction(cartItemId);

  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId }, include: { variant: true } });
  if (!item) return { success: false, error: "Item not found." };
  if (quantity > item.variant.stock) {
    return { success: false, error: `Only ${item.variant.stock} left in stock.` };
  }

  await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeCartItemAction(cartItemId: string): Promise<ActionResult> {
  await prisma.cartItem.delete({ where: { id: cartItemId } }).catch(() => null);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function applyCouponAction(code: string): Promise<ActionResult> {
  const cart = await getOrCreateCart();
  const normalized = code.trim().toUpperCase();

  if (normalized !== DEMO_COUPON_CODE) {
    return { success: false, error: "That code isn't valid." };
  }

  await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: normalized } });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeCouponAction(): Promise<ActionResult> {
  const cart = await getOrCreateCart();
  await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Called right after a successful client-side signIn() (see LoginForm).
 * Folds any guest-cart cookie into the now-authenticated user's cart
 * instead of silently losing whatever they added before logging in.
 */
export async function mergeGuestCartIntoUserAction(): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!guestToken) return;

  const guestCart = await prisma.cart.findUnique({ where: { guestToken }, include: { items: true } });
  if (!guestCart) {
    cookieStore.delete(GUEST_CART_COOKIE);
    return;
  }

  const userCart = await prisma.cart.findUnique({ where: { userId: session.user.id } });

  if (!userCart) {
    // No existing cart for this account — the guest cart just becomes theirs.
    await prisma.cart.update({
      where: { id: guestCart.id },
      data: { userId: session.user.id, guestToken: null },
    });
  } else {
    // Merge quantities item by item (capped at stock), then discard the
    // now-empty guest cart rather than leaving an orphaned row behind.
    for (const item of guestCart.items) {
      const variant = await prisma.variant.findUnique({ where: { id: item.variantId } });
      if (!variant) continue;
      const existing = await prisma.cartItem.findUnique({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
      });
      const mergedQuantity = Math.min(variant.stock, (existing?.quantity ?? 0) + item.quantity);
      await prisma.cartItem.upsert({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
        update: { quantity: mergedQuantity },
        create: { cartId: userCart.id, variantId: item.variantId, quantity: mergedQuantity },
      });
    }
    await prisma.cart.delete({ where: { id: guestCart.id } });
  }

  cookieStore.delete(GUEST_CART_COOKIE);
  revalidatePath("/", "layout");
}
