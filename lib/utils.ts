import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats integer cents as a display price. Never format currency from a Float. */
export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/**
 * Safe for embedding inside <script type="application/ld+json">. Plain
 * JSON.stringify() doesn't escape "<", so a literal "</script>" inside a
 * string value (e.g. a product name) would prematurely close the tag and
 * let the rest be parsed as HTML — a real, well-known gotcha with
 * embedding JSON in script tags. Currently only admin-controlled fields
 * (product name/description) feed structured data in this app, but this
 * costs nothing and removes the risk if that ever changes.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
