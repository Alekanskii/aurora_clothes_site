import { Container } from "@/components/layout/container";

export function EditorialBanner() {
  return (
    <section className="bg-ink py-32 text-center text-paper md:py-36">
      <Container>
        <span className="text-xs font-semibold uppercase tracking-widest text-gold">
          Manifesto
        </span>
        <h2 className="mx-auto mt-5 max-w-3xl font-heading text-[clamp(2.1rem,5vw,4rem)] font-bold leading-tight">
          We believe clothing should be quiet enough to disappear into your
          day, and considered enough to remember.
        </h2>
        <div className="mx-auto mt-9 h-0.5 w-16 bg-gold" />
      </Container>
    </section>
  );
}
