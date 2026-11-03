import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { routes } from "@/lib/routes";

const categories = [
  { slug: "outerwear", label: "Outerwear", illustration: "/illustrations/outerwear.svg" },
  { slug: "knitwear", label: "Knitwear", illustration: "/illustrations/knitwear.svg" },
  { slug: "tailoring", label: "Tailoring", illustration: "/illustrations/tailoring.svg" },
];

export function Categories() {
  return (
    <section className="py-24 md:py-28">
      <Container>
        <div className="mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone">
            Shop by category
          </span>
          <h2 className="mt-2 font-heading text-[clamp(1.9rem,3.6vw,2.9rem)] font-extrabold">
            Four essentials, endlessly worn.
          </h2>
        </div>
        <div className="grid gap-px bg-border md:grid-cols-3">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`${routes.shop}?category=${cat.slug}`}
              className="group relative flex aspect-[4/5] items-end bg-paper-deep p-7"
            >
              <span className="absolute left-7 top-6 text-xs tracking-wide text-stone">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Image
                src={cat.illustration}
                alt=""
                width={140}
                height={140}
                className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-[58%] transition-transform duration-500 ease-aurora group-hover:scale-105"
              />
              <span className="relative z-[1] font-heading text-xl font-bold">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
