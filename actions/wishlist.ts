"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";

type ActionResult = { success: true; wishlisted: boolean } | { success: false; error: string };

/**
 * Unlike Cart, WishlistItem has no guest/cookie concept in the schema —
 * userId is required. A logged-out visitor's heart click stays a local,
 * unpersisted toggle in WishlistButton itself; this action only runs for
 * signed-in users. That's a smaller, more honest scope cut than adding a
 * parallel guest-wishlist system for a feature with much lower stakes than
 * an abandoned cart.
 */
export async function toggleWishlistAction(productId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Log in to save items to your wishlist." };
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/", "layout");
    return { success: true, wishlisted: false };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return { success: false, error: "This product no longer exists." };
  }

  await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } });
  revalidatePath("/", "layout");
  return { success: true, wishlisted: true };
}
