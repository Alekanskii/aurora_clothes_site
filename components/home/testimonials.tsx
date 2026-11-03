"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

const quotes = [
  {
    text: "The only coat I've owned that got better with every wash. Five years in, still my most-worn piece.",
    name: "Marit H., Oslo",
  },
  {
    text: "Quietly the best knitwear I own. It doesn't shout, and that's exactly the point.",
    name: "Daniel K., Toronto",
  },
  {
    text: "Ordered the trouser expecting a template fit — it was tailored better than anything from a proper tailor.",
    name: "Priya S., Singapore",
  },
];

const ROTATE_INTERVAL_MS = 6000;

export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % quotes.length), ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // `index` is always kept in [0, quotes.length) by the modulo in the
  // interval above and by mapping over `quotes` itself for manual
  // selection — this is genuinely always in range, which
  // noUncheckedIndexedAccess (correctly) can't prove statically.
  const quote = quotes[index]!;

  return (
    <section className="pb-20 pt-4 md:pb-24">
      <Container className="mx-auto max-w-[760px] text-center">
        <blockquote className="font-heading text-[clamp(1.4rem,3vw,2rem)] font-medium leading-snug">
          &ldquo;{quote.text}&rdquo;
        </blockquote>
        <p className="mt-5 text-sm text-stone">— {quote.name}</p>
        <div className="mt-8 flex justify-center gap-2">
          {quotes.map((q, i) => (
            <button
              key={q.name}
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === index ? "bg-ink" : "bg-border"
              )}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
