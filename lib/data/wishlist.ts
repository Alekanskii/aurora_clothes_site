import { prisma } from "@/lib/prisma";
import type { ProductCardData } from "@/types/product";

/**
 * Returns the set of Product ids the user has wishlisted — cheap to check
 * membership against (`.has(product.id)`) when rendering a grid, rather
 * than querying per-card.
 */
export async function getWishlistedProductIds(userId: string): Promise<Set<string>> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(items.map((i) => i.productId));
}

export async function getWishlistProducts(userId: string): Promise<ProductCardData[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: { include: { images: true, variants: true, category: true } },
    },
  });

  return items.map(({ product }) => {
    const cheapestVariant = product.variants.reduce(
      (min, v) => (v.priceCents < min.priceCents ? v : min),
      product.variants[0]
    );
    const primaryImage = product.images[0];
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      categorySlug: product.category.slug,
      imageUrl: primaryImage?.url ?? "/illustrations/outerwear.svg",
      imageAlt: primaryImage?.alt ?? product.name,
      priceCents: cheapestVariant?.priceCents ?? 0,
      colorCount: new Set(product.variants.map((v) => v.color)).size,
      colors: Array.from(new Set(product.variants.map((v) => v.color))),
      sizes: Array.from(new Set(product.variants.map((v) => v.size))),
    };
  });
}
