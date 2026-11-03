import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { ShopFilters } from "@/components/shop/shop-filters";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ShopPagination } from "@/components/shop/shop-pagination";
import { getShopProducts, getFilterOptions } from "@/lib/data/products";
import { getWishlistedProductIds } from "@/lib/data/wishlist";
import { auth } from "@/lib/auth/config";
import { productQuerySchema } from "@/lib/validation/product-query";

export const metadata: Metadata = {
  title: "Shop",
  description: "Outerwear, knitwear, tailoring and accessories, made in small runs from traceable material.",
};

// Server Component reading searchParams directly and querying Prisma itself
// — no client-side fetch to /api/products. Filtering is just navigation:
// ShopFilters/ShopToolbar update the URL, Next.js re-renders this page with
// the new searchParams, the database does the actual filtering work.
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const rawParams = await searchParams;
  const query = productQuerySchema.parse(rawParams);
  const session = await auth();

  const [{ products, total, page, totalPages }, filterOptions, wishlistedIds] = await Promise.all([
    getShopProducts(query),
    getFilterOptions(),
    session?.user ? getWishlistedProductIds(session.user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <Container className="py-10 pb-28">
      <p className="mb-2 text-xs text-stone">
        <span className="font-semibold text-ink">Home</span> / Shop
      </p>
      <div className="grid gap-12 md:grid-cols-[250px_1fr]">
        <ShopFilters options={filterOptions} />
        <div>
          <ShopToolbar total={total} />
          {products.length === 0 ? (
            <div className="py-24 text-center text-stone">
              <p className="mb-2 text-base text-ink">No pieces match those filters</p>
              <p className="text-sm">Try widening your price range or clearing a filter.</p>
            </div>
          ) : (
            <div
              className={
                query.view === "list"
                  ? "flex flex-col gap-10"
                  : "grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-7"
              }
            >
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} view={query.view} wishlistedIds={wishlistedIds} />
              ))}
            </div>
          )}
          <ShopPagination currentPage={page} totalPages={totalPages} searchParams={rawParams} />
        </div>
      </div>
    </Container>
  );
}
