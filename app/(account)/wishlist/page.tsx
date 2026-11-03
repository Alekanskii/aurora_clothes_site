import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { auth } from "@/lib/auth/config";
import { getWishlistProducts, getWishlistedProductIds } from "@/lib/data/wishlist";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  const products = await getWishlistProducts(session.user.id);
  // Every product here is, by definition, wishlisted — but ProductCard
  // still takes the same wishlistedIds prop as everywhere else rather
  // than a one-off "isWishlistPage" flag, so the heart shows filled
  // consistently without a special case.
  const wishlistedIds = await getWishlistedProductIds(session.user.id);

  return (
    <Container className="py-14 pb-28">
      <p className="mb-2 text-xs text-stone">
        <Link href={routes.account} className="font-semibold text-ink">Account</Link> / Wishlist
      </p>
      <h1 className="mb-8 font-heading text-2xl font-extrabold">Your wishlist</h1>

      {products.length === 0 ? (
        <div className="py-16 text-stone">
          <p className="mb-5 text-sm">Nothing saved yet.</p>
          <Link
            href={routes.shop}
            className="inline-block rounded-pill bg-ink px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-7">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} wishlistedIds={wishlistedIds} />
          ))}
        </div>
      )}
    </Container>
  );
}
