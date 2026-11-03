import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  const order = sessionId
    ? await prisma.order.findUnique({ where: { stripeCheckoutSessionId: sessionId } })
    : null;

  if (!order) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-3 py-24 text-center">
        <h1 className="font-heading text-2xl font-bold">We couldn&apos;t find that order</h1>
        <p className="text-sm text-stone">
          If you just paid, check your account&apos;s order history in a moment — this page needs a
          valid session reference.
        </p>
        <Link href={routes.home} className="mt-4 text-sm underline">
          Back to home
        </Link>
      </Container>
    );
  }

  // Stripe's webhook is what actually marks the order PAID — this page can
  // render before that delivery lands (typically a second or two, but not
  // guaranteed). Rather than pretend certainty, the copy reflects whatever
  // the order's real status is right now.
  const isConfirmed = order.status === "PAID" || order.status === "FULFILLED";

  return (
    <Container className="py-10 pb-28">
      <CheckoutSteps current={3} />
      <div className="mx-auto max-w-md text-center">
        <div className="mb-5 flex justify-center">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="1.6" />
            <path d="M8 12.5l2.5 2.5L16 9" stroke="#4CAF50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-extrabold">
          {isConfirmed ? "Order confirmed" : "Payment received — confirming"}
        </h1>
        <p className="mt-3 text-sm text-stone">
          Order <span className="font-semibold text-ink">#{order.id.slice(-8).toUpperCase()}</span> ·{" "}
          {formatPrice(order.totalCents)}
          {!isConfirmed && " — this page will show as confirmed once payment finishes processing."}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href={routes.account}
            className="rounded-pill bg-ink px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink"
          >
            View account
          </Link>
          <Link
            href={routes.home}
            className="rounded-pill border border-ink px-7 py-3.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </Container>
  );
}
