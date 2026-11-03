import Image from "next/image";
import { Container } from "@/components/layout/container";

const looks = [
  { illustration: "/illustrations/outerwear.svg", label: "Look 01 — The Wool Overcoat" },
  { illustration: "/illustrations/knitwear.svg", label: "Look 02 — Merino Crewneck" },
  { illustration: "/illustrations/tailoring.svg", label: "Look 03 — Structured Trouser" },
  { illustration: "/illustrations/shirt.svg", label: "Look 04 — Poplin Shirt" },
  { illustration: "/illustrations/bag.svg", label: "Look 05 — Leather Tote" },
  { illustration: "/illustrations/scarf.svg", label: "Look 06 — Cashmere Scarf" },
];

export function Lookbook() {
  return (
    <section className="pb-24 md:pb-28">
      <Container className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-stone">
          Lookbook
        </span>
        <h2 className="mt-2 font-heading text-[clamp(1.9rem,3.6vw,2.9rem)] font-extrabold">
          SS26 — Field notes
        </h2>
      </Container>
      <div className="flex gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:px-10 [&::-webkit-scrollbar]:hidden">
        {looks.map((look) => (
          <div
            key={look.label}
            className="relative flex aspect-[3/4] w-[280px] shrink-0 items-center justify-center bg-paper-deep md:w-[320px]"
          >
            <Image src={look.illustration} alt="" width={140} height={140} className="w-[56%]" />
            <span className="absolute bottom-[18px] left-[18px] text-xs text-stone">{look.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
