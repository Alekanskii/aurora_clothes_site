import { Container } from "@/components/layout/container";

const stats = [
  { value: "12", label: "Garments per collection" },
  { value: "6", label: "Mills we work with" },
  { value: "0", label: "Synthetic fibres used" },
];

export function BrandStory() {
  return (
    <section id="brand-story" className="py-24 md:py-28">
      <Container className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="flex aspect-square items-center justify-center bg-paper-deep">
          <svg viewBox="0 0 160 160" className="w-[56%]" fill="none">
            <rect x="30" y="20" width="100" height="120" stroke="#0F0F0F" strokeWidth="1.2" />
            <path d="M30 60h100M30 100h100" stroke="#0F0F0F" strokeWidth="1" />
          </svg>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-stone">
            Since 2016
          </span>
          <h2 className="mb-5 mt-2.5 font-heading text-[clamp(1.8rem,3vw,2.4rem)] font-extrabold">
            Made slowly, in small runs, from honest material.
          </h2>
          <p className="text-base leading-relaxed text-ink/80">
            AURORA began as a single coat, cut by hand in a Copenhagen
            workshop. A decade on, every piece still passes through the same
            three hands before it reaches yours — pattern, cloth, seam.
          </p>
          <div className="mt-10 flex gap-10">
            {stats.map((s) => (
              <div key={s.label}>
                <b className="block font-heading text-3xl font-extrabold">{s.value}</b>
                <span className="text-xs uppercase tracking-wide text-stone">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
