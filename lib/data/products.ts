import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductCardData, ProductDetail, ProductWithRelations } from "@/types/product";
import {
  PRODUCTS_PER_PAGE,
  parseMultiValue,
  type ProductQuery,
} from "@/lib/validation/product-query";

/**
 * Maps a full Prisma product (with relations) down to exactly what a
 * ProductCard/QuickView needs to render. Keeping this conversion in one
 * place means "what counts as the display price" (currently: cheapest
 * variant) is decided once, not re-derived in every component.
 */
function toProductCardData(product: ProductWithRelations): ProductCardData {
  const cheapestVariant = product.variants.reduce(
    (min, v) => (!min || v.priceCents < min.priceCents ? v : min),
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
}

/**
 * Featured/best-seller products for the homepage. There's no real "sold
 * count" yet (that needs Order data, which doesn't exist until Milestone
 * 9), so this currently just takes the first N published products in
 * catalog order. Swap the `orderBy` once order history exists — the
 * function signature and every caller stay the same.
 */
export async function getFeaturedProducts(limit = 6): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    include: { images: true, variants: true, category: true },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  return products.map(toProductCardData);
}

function buildWhereClause(query: ProductQuery): Prisma.ProductWhereInput {
  const colors = parseMultiValue(query.color);
  const sizes = parseMultiValue(query.size);

  const where: Prisma.ProductWhereInput = { isPublished: true };

  if (query.category) {
    where.category = { slug: query.category };
  }
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
    ];
  }
  // Filtering on a to-many relation (variants) requires `some` — this reads
  // "at least one variant matches", not "every variant matches".
  if (colors.length || sizes.length || query.maxPrice) {
    where.variants = {
      some: {
        ...(colors.length ? { color: { in: colors } } : {}),
        ...(sizes.length ? { size: { in: sizes } } : {}),
        ...(query.maxPrice ? { priceCents: { lte: query.maxPrice } } : {}),
      },
    };
  }

  return where;
}

function buildOrderBy(sort: ProductQuery["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "name-asc":
      return { name: "asc" };
    case "price-asc":
    case "price-desc":
      // Price lives on Variant, not Product, so "sort by price" can't be a
      // simple orderBy on the Product query — it's handled as a post-sort
      // on the mapped results in getShopProducts() instead.
      return { createdAt: "asc" };
    case "featured":
    default:
      return { createdAt: "asc" };
  }
}

export type ShopResult = {
  products: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * The Shop page's main query. Used two ways: directly by the Shop page
 * (Server Component, no network hop) and via app/api/products/route.ts
 * (for anything external — a future mobile client, the admin panel, etc.).
 * Both call this same function so the two can never drift apart.
 */
export async function getShopProducts(query: ProductQuery): Promise<ShopResult> {
  const where = buildWhereClause(query);
  const orderBy = buildOrderBy(query.sort);

  const total = await prisma.product.count({ where });

  // Price sort happens in memory below (see buildOrderBy comment), so this
  // still needs every matching row's cheapest variant computed before the
  // page can be sliced — pageSize slicing happens after that sort, not here.
  const products = await prisma.product.findMany({
    where,
    include: { images: true, variants: true, category: true },
    orderBy,
  });

  let mapped = products.map(toProductCardData);

  if (query.sort === "price-asc") {
    mapped = mapped.sort((a, b) => a.priceCents - b.priceCents);
  } else if (query.sort === "price-desc") {
    mapped = mapped.sort((a, b) => b.priceCents - a.priceCents);
  }

  const totalPages = Math.max(1, Math.ceil(mapped.length / PRODUCTS_PER_PAGE));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * PRODUCTS_PER_PAGE;
  const pageItems = mapped.slice(start, start + PRODUCTS_PER_PAGE);

  return {
    products: pageItems,
    total,
    page,
    pageSize: PRODUCTS_PER_PAGE,
    totalPages,
  };
}

// Numeric sizes (trouser waist measurements) and "One size" both need to
// sort sensibly alongside XS–XL — plain alphabetical would put "36" before
// "M". Known letter sizes get an explicit order; anything else (numeric
// sizes, "One size") sorts after them, numerically where possible.
const LETTER_SIZE_ORDER = ["XS", "S", "M", "L", "XL"];
function compareSizes(a: string, b: string): number {
  const aIndex = LETTER_SIZE_ORDER.indexOf(a);
  const bIndex = LETTER_SIZE_ORDER.indexOf(b);
  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
  if (aIndex !== -1) return -1;
  if (bIndex !== -1) return 1;
  const aNum = Number(a);
  const bNum = Number(b);
  if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
  return a.localeCompare(b);
}

export type FilterOptions = {
  categories: { slug: string; name: string }[];
  colors: string[];
  sizes: string[];
  maxPriceCents: number;
};

/**
 * Filter sidebar options, derived from the actual catalog rather than
 * hardcoded — add a new color to a product and it shows up in the filter
 * automatically, no component to edit.
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  const [categories, variants] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.variant.findMany({ select: { color: true, size: true, priceCents: true } }),
  ]);

  return {
    categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
    colors: Array.from(new Set(variants.map((v) => v.color))).sort(),
    sizes: Array.from(new Set(variants.map((v) => v.size))).sort(compareSizes),
    maxPriceCents: variants.reduce((max, v) => Math.max(max, v.priceCents), 0),
  };
}

/**
 * Full product detail for /product/[slug]. Returns null on no match so the
 * page can call notFound() — a real 404, not a placeholder.
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { slug, isPublished: true },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) return null;

  const card = toProductCardData(product);
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const related = await getRelatedProducts(product.categoryId, product.id, 3);

  return {
    ...card,
    images:
      product.images.length > 0
        ? product.images.map((img) => ({ url: img.url, alt: img.alt }))
        : [{ url: card.imageUrl, alt: card.imageAlt }],
    variants: product.variants.map((v) => ({
      id: v.id,
      color: v.color,
      size: v.size,
      priceCents: v.priceCents,
      stock: v.stock,
    })),
    reviews: product.reviews.map((r) => ({
      id: r.id,
      authorName: r.user.name ?? "AURORA customer",
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
    })),
    averageRating,
    relatedProducts: related,
  };
}

/** Same category, published, excluding the product itself. */
export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 3
): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { categoryId, isPublished: true, id: { not: excludeProductId } },
    include: { images: true, variants: true, category: true },
    take: limit,
  });
  return products.map(toProductCardData);
}

/** All slugs, for generateStaticParams — lets the product page prerender
 * at build time instead of on every first request. */
export async function getAllProductSlugs(): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return products.map((p) => p.slug);
}
