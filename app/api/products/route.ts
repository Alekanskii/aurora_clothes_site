import { NextRequest, NextResponse } from "next/server";
import { productQuerySchema } from "@/lib/validation/product-query";
import { getShopProducts } from "@/lib/data/products";

/**
 * GET /api/products?category=&color=&size=&maxPrice=&q=&sort=&view=&page=
 *
 * The Shop page itself doesn't call this — it queries Prisma directly as a
 * Server Component, which avoids an unnecessary network hop to its own
 * server. This route exists for the brief's REST API requirement and for
 * actual external consumers: the admin panel (Milestone 4+), a future
 * mobile client, etc. Both paths share getShopProducts() so filtering logic
 * can't drift between them.
 */
export async function GET(request: NextRequest) {
  const rawParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = productQuerySchema.safeParse(rawParams);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await getShopProducts(parsed.data);
  return NextResponse.json(result);
}
