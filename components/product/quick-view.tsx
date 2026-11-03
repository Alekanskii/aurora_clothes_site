"use client";

import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { routes } from "@/lib/routes";
import type { ProductCardData } from "@/types/product";

/**
 * Self-contained: the "Quick view" trigger button and the Dialog it opens
 * live in one client component so ProductCard (a Server Component) only
 * has to render <QuickView product={product} /> and never needs to know
 * about dialog state. Color/size selection here is informational only —
 * it doesn't add to a cart yet, since there's no cart until Milestone 7.
 */
export function QuickView({ product }: { product: ProductCardData }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="absolute inset-x-3.5 bottom-3.5 translate-y-2 bg-ink py-3 text-xs font-semibold uppercase tracking-wide text-paper opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          Quick view
        </button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex items-center justify-center bg-paper-deep p-10">
          <Image src={product.imageUrl} alt={product.imageAlt} width={220} height={260} className="w-3/5" />
        </div>
        <div className="p-9">
          <span className="text-xs uppercase tracking-wide text-stone">{product.categorySlug}</span>
          <h2 className="mt-1.5 font-heading text-2xl font-bold">{product.name}</h2>
          <p className="mt-2 text-lg font-semibold">{formatPrice(product.priceCents)}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink/80">{product.description}</p>

          <div className="mt-6">
            <span className="mb-2 block text-xs uppercase tracking-wide text-stone">Colour</span>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <span
                  key={color}
                  title={color}
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: colorToHex(color) }}
                />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <span className="mb-2 block text-xs uppercase tracking-wide text-stone">Size</span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <span key={size} className="rounded-pill border border-border px-3 py-1.5 text-xs">
                  {size}
                </span>
              ))}
            </div>
          </div>

          <Link
            href={routes.product(product.slug)}
            className="mt-8 block rounded-pill bg-ink py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink"
          >
            View full details
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Approximate swatches for the named colors in the seed catalog. This is a
// display convenience, not a source of truth — the color name in the
// database is what actually matters for matching/filtering.
const COLOR_SWATCHES: Record<string, string> = {
  Stone: "#B9B4A9",
  Ink: "#25231F",
  Sand: "#D8C7A9",
  Olive: "#6C6E51",
  Ecru: "#EDE6D6",
};
function colorToHex(name: string): string {
  return COLOR_SWATCHES[name] ?? "#CCCCCC";
}
