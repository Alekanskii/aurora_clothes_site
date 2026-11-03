"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

const links = [
  { label: "Dashboard", href: routes.admin },
  { label: "Products", href: routes.adminProducts },
  { label: "Orders", href: routes.adminOrders },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== routes.admin && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "border-l-2 px-4 py-2.5 text-sm",
              active ? "border-ink bg-paper-deep font-semibold" : "border-transparent text-ink/70 hover:bg-paper-deep"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
