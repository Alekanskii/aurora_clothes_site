/**
 * Behind Vercel (and most proxies), the real client IP is in
 * x-forwarded-for as the first entry — the header can carry a chain of
 * proxies, so only the first (leftmost) value is the actual client.
 * Falls back to "unknown" rather than throwing — used as a rate-limit
 * bucket key, and grouping unknown-origin requests into one bucket is a
 * safe default, not a security hole.
 */
export function extractClientIp(headerLookup: { get(name: string): string | null }): string {
  const forwardedFor = headerLookup.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  const realIp = headerLookup.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
