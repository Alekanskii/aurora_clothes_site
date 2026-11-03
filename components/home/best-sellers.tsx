import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { getFeaturedProducts } from "@/lib/data/products";
import { getWishlistedProductIds } from "@/lib/data/wishlist";
import { auth } from "@/lib/auth/config";
import { routes } from "@/lib/routes";

// Async Server Component — this hits the real database directly. No API
// route needed for the homepage's own render; a route.ts under /api/products
// still gets built in Milestone 4 for the Shop page's client-side filtering.
export async function BestSellers() {
  const session = await auth();
  const [products, wishlistedIds] = await Promise.all([
    getFeaturedProducts(6),
    session?.user ? getWishlistedProductIds(session.user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <section className="pb-24 md:pb-28">
      <Container>
        <div className="mb-14 flex items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone">
              Best sellers
            </span>
            <h2 className="mt-2 font-heading text-[clamp(1.9rem,3.6vw,2.9rem)] font-extrabold">
              Most re-ordered, season on season.
            </h2>
          </div>
          <Link
            href={routes.shop}
            className="hidden shrink-0 rounded-pill border border-ink px-6 py-3 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper md:block"
          >
            View all
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-stone">
            No products yet — run <code>npx prisma db seed</code> to populate the catalog.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-7">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} wishlistedIds={wishlistedIds} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
