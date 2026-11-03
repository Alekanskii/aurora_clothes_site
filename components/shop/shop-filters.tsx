"use client";

import { useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { formatPrice, cn } from "@/lib/utils";
import { parseMultiValue } from "@/lib/validation/product-query";
import type { FilterOptions } from "@/lib/data/products";

const SEARCH_DEBOUNCE_MS = 350;

// Approximate swatches for display — see the same map in quick-view.tsx.
// Kept separate on purpose: this list only needs to cover whatever colors
// exist in the catalog right now, and duplicating a five-line map is
// cheaper than adding a shared import for something this small.
const COLOR_SWATCHES: Record<string, string> = {
  Stone: "#B9B4A9",
  Ink: "#25231F",
  Sand: "#D8C7A9",
  Olive: "#6C6E51",
  Ecru: "#EDE6D6",
};

export function ShopFilters({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentCategory = searchParams.get("category") ?? "";
  const selectedColors = parseMultiValue(searchParams.get("color") ?? undefined);
  const selectedSizes = parseMultiValue(searchParams.get("size") ?? undefined);
  const maxPrice = searchParams.get("maxPrice");
  const query = searchParams.get("q") ?? "";

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page"); // any filter change restarts pagination
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  function toggleListValue(current: string[], value: string): string[] {
    return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  }

  function handleSearchChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ q: value }), SEARCH_DEBOUNCE_MS);
  }

  function handlePriceChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ maxPrice: value }), SEARCH_DEBOUNCE_MS);
  }

  function resetFilters() {
    router.replace(pathname, { scroll: false });
  }

  return (
    <aside>
      <div className="mb-9">
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone">Search</h4>
        <input
          type="search"
          defaultValue={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search this collection"
          className="w-full border border-border bg-paper px-3 py-2.5 text-sm outline-none focus-visible:border-ink"
        />
      </div>

      <div className="mb-9">
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone">Category</h4>
        {options.categories.map((cat) => (
          <label key={cat.slug} className="mb-2.5 flex items-center gap-2.5 text-sm">
            <input
              type="radio"
              name="category"
              checked={currentCategory === cat.slug}
              onChange={() => pushParams({ category: cat.slug })}
              className="accent-ink"
            />
            {cat.name}
          </label>
        ))}
        {currentCategory && (
          <button onClick={() => pushParams({ category: null })} className="mt-1 text-xs text-stone underline">
            Clear category
          </button>
        )}
      </div>

      <div className="mb-9">
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone">Colour</h4>
        <div className="flex flex-wrap gap-2.5">
          {options.colors.map((color) => {
            const selected = selectedColors.includes(color);
            return (
              <button
                key={color}
                title={color}
                aria-label={color}
                aria-pressed={selected}
                onClick={() => pushParams({ color: toggleListValue(selectedColors, color).join(",") })}
                className={cn(
                  "relative h-[26px] w-[26px] rounded-full border border-border",
                  selected && "ring-2 ring-offset-2 ring-ink ring-offset-paper"
                )}
                style={{ backgroundColor: COLOR_SWATCHES[color] ?? "#CCCCCC" }}
              />
            );
          })}
        </div>
      </div>

      <div className="mb-9">
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone">Size</h4>
        <div className="flex flex-wrap gap-2">
          {options.sizes.map((size) => {
            const selected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => pushParams({ size: toggleListValue(selectedSizes, size).join(",") })}
                className={cn(
                  "rounded-pill border px-3.5 py-1.5 text-xs",
                  selected ? "border-ink bg-ink text-paper" : "border-border"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-9">
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone">Price</h4>
        <input
          type="range"
          min={0}
          max={options.maxPriceCents}
          step={1000}
          defaultValue={maxPrice ?? options.maxPriceCents}
          onChange={(e) => handlePriceChange(e.target.value)}
          className="w-full accent-gold-deep"
        />
        <div className="mt-1.5 flex justify-between text-xs text-stone">
          <span>{formatPrice(0)}</span>
          <span>Up to {formatPrice(Number(maxPrice ?? options.maxPriceCents))}</span>
        </div>
      </div>

      <button
        onClick={resetFilters}
        className="w-full rounded-pill border border-ink py-3 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper"
      >
        Reset filters
      </button>
    </aside>
  );
}
