import Link from "next/link";
import Image from "next/image";
import { formatPrice, cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import type { ProductCardData } from "@/types/product";
import { WishlistButton } from "./wishlist-button";
import { QuickView } from "./quick-view";

// Server Component — the only client JS shipped per card is the two leaf
// components below (WishlistButton, QuickView). Hover states (image scale,
// button reveal) are pure CSS via `group`/`group-hover`.
export function ProductCard({
  product,
  view = "grid",
  wishlistedIds,
}: {
  product: ProductCardData;
  view?: "grid" | "list";
  wishlistedIds?: Set<string>;
}) {
  return (
    <div className={cn("group", view === "list" && "grid grid-cols-[180px_1fr] items-center gap-6")}>
      <div
        className={cn(
          "relative overflow-hidden bg-paper-deep",
          view === "list" ? "aspect-[4/3]" : "aspect-[3/4]"
        )}
      >
        <Link href={routes.product(product.slug)} className="block h-full w-full">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            className="object-contain p-10 transition-transform duration-500 ease-aurora group-hover:scale-[1.04]"
            sizes="(min-width: 768px) 33vw, 50vw"
          />
        </Link>
        <WishlistButton productId={product.id} initialWishlisted={wishlistedIds?.has(product.id) ?? false} />
        <QuickView product={product} />
      </div>
      <div className="flex items-baseline justify-between pt-4">
        <div>
          <Link href={routes.product(product.slug)}>
            <h3 className="text-sm font-semibold">{product.name}</h3>
          </Link>
          <p className="mt-1 text-xs text-stone">
            {product.colorCount} {product.colorCount === 1 ? "colour" : "colours"}
          </p>
        </div>
        <span className="text-sm font-semibold">{formatPrice(product.priceCents)}</span>
      </div>
    </div>
  );
}
