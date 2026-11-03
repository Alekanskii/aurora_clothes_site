import Link from "next/link";
import { routes } from "@/lib/routes";

export function Hero() {
  return (
    <section className="grid min-h-[80vh] border-b border-border md:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col justify-center gap-6 px-6 py-20 md:px-16">
        <span className="text-xs font-semibold uppercase tracking-widest text-stone">
          SS26 Collection
        </span>
        <h1 className="font-heading text-[clamp(3rem,7vw,5.6rem)] font-extrabold leading-[0.98] tracking-tight">
          Dressed
          <br />
          for stillness.
        </h1>
        <p className="max-w-[420px] text-[17px] leading-relaxed text-ink/80">
          Considered garments in natural fibre, cut for movement and built to
          outlast the season they were made for.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href={routes.shop}
            className="rounded-pill bg-ink px-7 py-4 text-xs font-semibold uppercase tracking-wide text-paper transition-colors duration-[420ms] ease-aurora hover:bg-gold-deep hover:text-ink"
          >
            Shop the collection
          </Link>
          <Link
            href={routes.about}
            className="rounded-pill border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-wide transition-colors duration-[420ms] ease-aurora hover:bg-ink hover:text-paper"
          >
            Our story
          </Link>
        </div>
      </div>
      <div className="relative flex items-center justify-center border-t border-border bg-paper-deep md:border-l md:border-t-0">
        <svg viewBox="0 0 200 240" className="w-3/5" fill="none">
          <path
            d="M70 20c0-8 10-14 30-14s30 6 30 14l14 26-16 12-6-14v150H78V44l-6 14-16-12 14-26z"
            stroke="#0F0F0F"
            strokeWidth="1.4"
          />
        </svg>
        <div className="absolute bottom-7 left-7 flex items-center gap-2 border border-border bg-paper px-4 py-2.5 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Woven in Portugal
        </div>
      </div>
    </section>
  );
}
