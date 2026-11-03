"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, cn } from "@/lib/utils";
import { addToCartAction } from "@/actions/cart";
import { WishlistButton } from "./wishlist-button";
import type { VariantData } from "@/types/product";

const COLOR_SWATCHES: Record<string, string> = {
  Stone: "#B9B4A9",
  Ink: "#25231F",
  Sand: "#D8C7A9",
  Olive: "#6C6E51",
  Ecru: "#EDE6D6",
};

export function VariantSelector({
  variants,
  productId,
  initialWishlisted,
}: {
  variants: VariantData[];
  productId: string;
  initialWishlisted: boolean;
}) {
  const colors = useMemo(() => Array.from(new Set(variants.map((v) => v.color))), [variants]);
  const sizes = useMemo(() => Array.from(new Set(variants.map((v) => v.size))), [variants]);

  const firstInStockColor =
    colors.find((c) => variants.some((v) => v.color === c && v.stock > 0)) ?? colors[0];

  // Only ever called after the `hasVariants` guard below has confirmed
  // `sizes` is non-empty — the `!` reflects that proven invariant, not a
  // shortcut past a real possibility of emptiness.
  const sizeForColor = (c: string) =>
    sizes.find((s) => variants.some((v) => v.color === c && v.size === s && v.stock > 0)) ?? sizes[0]!;

  // A product can exist with zero variants for a little while — it's
  // created first, then variants are added on its admin edit page (see
  // app/admin/products/new/page.tsx). Rather than let `string | undefined`
  // cascade through every piece of state below (color, size, stockFor...),
  // this is handled as its own explicit, honest state up front.
  const hasVariants = colors.length > 0 && sizes.length > 0 && firstInStockColor !== undefined;

  if (!hasVariants) {
    return (
      <div>
        <p className="text-sm text-stone">
          This piece isn&apos;t available to order yet — no colors or sizes have been added.
        </p>
      </div>
    );
  }

  return (
    <VariantSelectorReady
      variants={variants}
      colors={colors}
      sizes={sizes}
      firstInStockColor={firstInStockColor}
      sizeForColor={sizeForColor}
      productId={productId}
      initialWishlisted={initialWishlisted}
    />
  );
}

function VariantSelectorReady({
  variants,
  colors,
  sizes,
  firstInStockColor,
  sizeForColor,
  productId,
  initialWishlisted,
}: {
  variants: VariantData[];
  colors: string[];
  sizes: string[];
  firstInStockColor: string;
  sizeForColor: (color: string) => string;
  productId: string;
  initialWishlisted: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [color, setColor] = useState(firstInStockColor);
  const [size, setSize] = useState(() => sizeForColor(firstInStockColor));

  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeVariant = variants.find((v) => v.color === color && v.size === size);
  const inStock = (activeVariant?.stock ?? 0) > 0;
  const price = activeVariant?.priceCents ?? variants[0]?.priceCents ?? 0;

  function stockFor(c: string, s: string): number {
    return variants.find((v) => v.color === c && v.size === s)?.stock ?? 0;
  }

  function handleColorChange(next: string) {
    setColor(next);
    // If the current size doesn't exist in stock for the new color, jump to
    // one that does (or the first size, shown disabled) rather than silently
    // keeping a selection that's actually unavailable.
    if (stockFor(next, size) === 0) {
      setSize(sizeForColor(next));
    }
    setQty(1);
    setFeedback(null);
  }

  function handleAddToBag() {
    if (!inStock || !activeVariant) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await addToCartAction(activeVariant.id, qty);
      if (result.success) {
        setFeedback({ type: "success", text: `Added ${qty} × ${color} / ${size} to your bag.` });
        router.refresh(); // picks up the fresh Navbar cart count
      } else {
        setFeedback({ type: "error", text: result.error });
      }
    });
  }

  return (
    <div>
      <p className="text-lg font-semibold">{formatPrice(price)}</p>

      <div className="mt-6">
        <span className="mb-2.5 block text-xs uppercase tracking-wide text-stone">
          Colour — {color}
        </span>
        <div className="flex gap-2.5">
          {colors.map((c) => (
            <button
              key={c}
              title={c}
              aria-label={c}
              aria-pressed={c === color}
              onClick={() => handleColorChange(c)}
              className={cn(
                "h-7 w-7 rounded-full border border-border",
                c === color && "ring-2 ring-offset-2 ring-ink ring-offset-paper"
              )}
              style={{ backgroundColor: COLOR_SWATCHES[c] ?? "#CCCCCC" }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <span className="mb-2.5 block text-xs uppercase tracking-wide text-stone">Size</span>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const stock = stockFor(color, s);
            const disabled = stock === 0;
            return (
              <button
                key={s}
                disabled={disabled}
                onClick={() => {
                  setSize(s);
                  setFeedback(null);
                }}
                className={cn(
                  "rounded-pill border px-4 py-2 text-sm",
                  disabled && "cursor-not-allowed text-stone opacity-40 line-through",
                  !disabled && s === size && "border-ink bg-ink text-paper",
                  !disabled && s !== size && "border-border"
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
        {!inStock && <p className="mt-2 text-xs text-error">Out of stock in this size.</p>}
      </div>

      <div className="mt-6">
        <span className="mb-2.5 block text-xs uppercase tracking-wide text-stone">Quantity</span>
        <div className="flex h-11 w-[130px] items-center border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex-1 text-base"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="flex-1 text-center text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(activeVariant?.stock ?? 1, q + 1))}
            className="flex-1 text-base"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-7 flex gap-3">
        <button
          onClick={handleAddToBag}
          disabled={!inStock || isPending}
          className={cn(
            "flex-1 rounded-pill py-4 text-xs font-semibold uppercase tracking-wide transition-colors",
            inStock ? "bg-ink text-paper hover:bg-gold-deep hover:text-ink disabled:opacity-60" : "bg-paper-deep text-stone"
          )}
        >
          {!inStock ? "Out of stock" : isPending ? "Adding…" : "Add to bag"}
        </button>
        <WishlistButton productId={productId} initialWishlisted={initialWishlisted} variant="detail" />
      </div>

      {feedback && (
        <p className={cn("mt-3 text-xs", feedback.type === "success" ? "text-success" : "text-error")}>
          {feedback.text}
        </p>
      )}
    </div>
  );
}
