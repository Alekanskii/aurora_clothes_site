import Link from "next/link";
import { Container } from "@/components/layout/container";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="font-heading text-[clamp(4rem,12vw,7rem)] font-extrabold leading-none text-paper-deep">
        404
      </div>
      <h1 className="font-heading text-2xl font-bold">This page has been discontinued</h1>
      <p className="max-w-sm text-sm text-stone">
        The page you&apos;re looking for doesn&apos;t exist, or has moved.
        Let&apos;s get you back to something real.
      </p>
      <div className="mt-4 flex gap-4">
        <Link
          href={routes.home}
          className="rounded-pill bg-ink px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink"
        >
          Back to home
        </Link>
        <Link
          href={routes.shop}
          className="rounded-pill border border-ink px-7 py-3.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper"
        >
          Browse the shop
        </Link>
      </div>
    </Container>
  );
}
