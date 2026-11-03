import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { ShippingForm } from "@/components/checkout/shipping-form";
import { auth } from "@/lib/auth/config";
import { getCurrentCart } from "@/lib/data/cart";
import { formatPrice } from "@/lib/utils";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  // Defense in depth alongside middleware.ts — same pattern as /account.
  const session = await auth();
  if (!session?.user) {
    redirect(`${routes.login}?callbackUrl=${routes.checkout}`);
  }

  const cart = await getCurrentCart();
  if (cart.items.length === 0) {
    redirect(routes.cart);
  }

  return (
    <Container className="py-10 pb-28">
      <CheckoutSteps current={1} />
      <div className="grid gap-14 md:grid-cols-[1fr_380px]">
        <div>
          <h1 className="mb-8 font-heading text-xl font-bold">Shipping address</h1>
          <ShippingForm />
        </div>

        <div className="h-fit bg-paper-deep p-7">
          <h3 className="mb-5 text-base font-semibold">Order summary</h3>
          <div className="mb-4 flex flex-col gap-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-ink/80">
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span>{formatPrice(item.lineTotalCents)}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 border-t border-border pt-4 text-sm text-ink/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotalCents)}</span>
            </div>
            {cart.discountCents > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>−{formatPrice(cart.discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{cart.shippingCents === 0 ? "Free" : formatPrice(cart.shippingCents)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated tax</span>
              <span>{formatPrice(cart.taxCents)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(cart.totalCents)}</span>
          </div>
        </div>
      </div>
    </Container>
  );
}
