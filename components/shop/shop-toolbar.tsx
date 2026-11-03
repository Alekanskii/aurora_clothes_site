"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS } from "@/lib/validation/product-query";

const SORT_LABELS: Record<(typeof SORT_OPTIONS)[number], string> = {
  featured: "Sort: Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-asc": "Name: A–Z",
};

export function ShopToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") ?? "featured";
  const view = searchParams.get("view") ?? "grid";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key !== "page") params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="mb-7 flex items-center justify-between">
      <span className="text-sm text-stone">
        {total} {total === 1 ? "piece" : "pieces"}
      </span>
      <div className="flex items-center gap-4">
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border border-border bg-paper px-3.5 py-2 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {SORT_LABELS[opt]}
            </option>
          ))}
        </select>
        <div className="flex border border-border">
          <button
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => updateParam("view", "grid")}
            className={cn("p-2", view === "grid" && "bg-ink text-paper")}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => updateParam("view", "list")}
            className={cn("p-2", view === "list" && "bg-ink text-paper")}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
