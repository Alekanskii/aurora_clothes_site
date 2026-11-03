import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CouponForm } from "@/components/cart/coupon-form";
import { getCurrentCart } from "@/lib/data/cart";
import { formatPrice } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/cart/constants";

export const metadata: Metadata = { title: "Your bag" };

export default async function CartPage() {
  const cart = await getCurrentCart();

  return (
    <Container className="py-10 pb-28">
      <p className="mb-2 text-xs text-stone">
        <span className="font-semibold text-ink">Home</span> / Bag
      </p>
      <h1 className="mb-8 font-heading text-2xl font-extrabold">Your bag</h1>

      {cart.items.length === 0 ? (
        <div className="py-20 text-left text-stone">
          <p className="mb-5 text-sm">Your bag is empty.</p>
          <Link
            href={routes.shop}
            className="inline-block rounded-pill bg-ink px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-14 md:grid-cols-[1fr_380px]">
          <div>
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="h-fit bg-paper-deep p-7">
            <h3 className="mb-5 text-base font-semibold">Order summary</h3>

            <CouponForm appliedCode={cart.couponCode} />

            <div className="mb-3 flex justify-between text-sm text-ink/80">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotalCents)}</span>
            </div>
            {cart.discountCents > 0 && (
              <div className="mb-3 flex justify-between text-sm text-success">
                <span>Discount</span>
                <span>−{formatPrice(cart.discountCents)}</span>
              </div>
            )}
            <div className="mb-3 flex justify-between text-sm text-ink/80">
              <span>Shipping estimate</span>
              <span>{cart.shippingCents === 0 ? "Free" : formatPrice(cart.shippingCents)}</span>
            </div>
            <div className="mb-4 flex justify-between text-sm text-ink/80">
              <span>Estimated tax</span>
              <span>{formatPrice(cart.taxCents)}</span>
            </div>
            {cart.shippingCents > 0 && (
              <p className="mb-4 text-xs text-stone">
                Add {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS - (cart.subtotalCents - cart.discountCents))} more for free shipping.
              </p>
            )}

            <div className="mb-6 flex justify-between border-t border-border pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(cart.totalCents)}</span>
            </div>

            <Link
              href={routes.checkout}
              className="block rounded-pill bg-ink py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}
