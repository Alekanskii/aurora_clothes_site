import type { Product, ProductImage, Variant, Category } from "@prisma/client";

/** A Product as returned by queries that include its images, variants, and category. */
export type ProductWithRelations = Product & {
  images: ProductImage[];
  variants: Variant[];
  category: Category;
};

/** Derived, display-ready shape — computed once in the data layer instead
 * of recomputing min price / color list in every component that renders a
 * ProductCard. Includes enough of the catalog (colors, sizes, description)
 * for Quick View to render without a second fetch. */
export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  imageUrl: string;
  imageAlt: string;
  priceCents: number;
  colorCount: number;
  colors: string[];
  sizes: string[];
};

/** One sellable (color, size) combination with its own stock and price. */
export type VariantData = {
  id: string;
  color: string;
  size: string;
  priceCents: number;
  stock: number;
};

export type ReviewData = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
};

/** Full detail shape for the product page — everything ProductCardData has,
 * plus the raw variant matrix (for stock-aware color/size selection),
 * ordered gallery images, reviews, and a short list of related products. */
export type ProductDetail = ProductCardData & {
  images: { url: string; alt: string }[];
  variants: VariantData[];
  reviews: ReviewData[];
  averageRating: number;
  relatedProducts: ProductCardData[];
};
