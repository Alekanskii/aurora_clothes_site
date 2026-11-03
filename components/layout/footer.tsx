import Link from "next/link";
import { routes } from "@/lib/routes";
import { Container } from "./container";

const footerColumns: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "Outerwear", href: `${routes.shop}?category=outerwear` },
      { label: "Knitwear", href: `${routes.shop}?category=knitwear` },
      { label: "Tailoring", href: `${routes.shop}?category=tailoring` },
      { label: "Accessories", href: `${routes.shop}?category=accessories` },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Shipping", href: routes.contact },
      { label: "Returns", href: routes.contact },
      { label: "Size guide", href: routes.contact },
      { label: "FAQ", href: routes.contact },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our story", href: routes.about },
      { label: "Materials", href: routes.about },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Orders", href: routes.account },
      { label: "Wishlist", href: routes.wishlist },
      { label: "Bag", href: routes.cart },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink py-20 text-paper">
      <Container>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div>
            <div className="mb-3 font-heading text-xl font-extrabold tracking-[0.2em]">
              AURORA
            </div>
            <p className="max-w-[220px] text-sm leading-relaxed text-paper/70">
              Considered clothing, made to be worn for a decade, not a season.
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">
                {col.heading}
              </h5>
              <ul className="flex flex-col gap-2.5 text-sm text-paper/70">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-gold">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex justify-between border-t border-paper/15 pt-6 text-xs text-paper/50">
          <span>© {new Date().getFullYear()} AURORA Studio</span>
          <span>Privacy · Terms</span>
        </div>
      </Container>
    </footer>
  );
}
