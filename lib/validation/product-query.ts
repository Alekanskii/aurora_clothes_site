import { z } from "zod";

export const SORT_OPTIONS = ["featured", "price-asc", "price-desc", "name-asc"] as const;
export const VIEW_OPTIONS = ["grid", "list"] as const;
export const PRODUCTS_PER_PAGE = 9;

/**
 * Shared by app/api/products/route.ts and the Shop page's Server Component.
 * Query params arrive as strings (or comma-separated strings for multi-select
 * filters) regardless of source — this is the one place that turns them into
 * typed, validated values. Reject malformed input rather than silently
 * coercing it into something that happens to work.
 */
export const productQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  // comma-separated, e.g. "Stone,Ink"
  color: z.string().trim().min(1).optional(),
  size: z.string().trim().min(1).optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  q: z.string().trim().min(1).max(100).optional(),
  sort: z.enum(SORT_OPTIONS).catch("featured"),
  view: z.enum(VIEW_OPTIONS).catch("grid"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

export function parseMultiValue(value: string | undefined): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}
