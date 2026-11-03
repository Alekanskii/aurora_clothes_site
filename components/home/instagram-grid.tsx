import Image from "next/image";
import { Container } from "@/components/layout/container";

const cells = [
  "outerwear.svg", "knitwear.svg", "tailoring.svg",
  "shirt.svg", "bag.svg", "scarf.svg",
  "outerwear.svg", "knitwear.svg", "tailoring.svg",
  "shirt.svg", "bag.svg", "scarf.svg",
];

export function InstagramGrid() {
  return (
    <section className="pb-24 md:pb-28">
      <Container className="mb-7">
        <span className="text-xs font-semibold uppercase tracking-widest text-stone">
          @aurora.studio
        </span>
      </Container>
      <div className="grid grid-cols-3 gap-px bg-border md:grid-cols-6">
        {cells.map((file, i) => (
          <div key={i} className="flex aspect-square items-center justify-center bg-paper-deep">
            <Image src={`/illustrations/${file}`} alt="" width={80} height={80} className="w-2/5 opacity-80" />
          </div>
        ))}
      </div>
    </section>
  );
}
