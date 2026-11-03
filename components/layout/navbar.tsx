"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, Search, Heart, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { primaryNavLinks, routes } from "@/lib/routes";
import { MobileNav } from "./mobile-nav";

const HIDE_THRESHOLD_PX = 140; // matches the prototype's nav-hide trigger point

export function Navbar({ cartCount }: { cartCount: number }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      setHidden(y > lastScrollY.current && y > HIDE_THRESHOLD_PX);
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="bg-ink py-2 text-center text-xs tracking-wide text-paper">
        Complimentary shipping on orders over $200 · Returns within 30 days
      </div>

      <nav
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-paper transition-transform duration-[420ms] ease-[cubic-bezier(.65,0,.35,1)]",
          hidden && "-translate-y-full"
        )}
      >
        <div className="mx-auto flex h-[78px] w-full max-w-container items-center justify-between px-6 md:px-10">
          <Link href={routes.home} className="font-heading text-xl font-extrabold tracking-[0.2em]">
            AURORA
          </Link>

          <div className="hidden gap-9 text-sm font-medium md:flex">
            {primaryNavLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative py-1 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-ink after:transition-all after:duration-[420ms] after:ease-[cubic-bezier(.65,0,.35,1)]",
                    active ? "after:w-full" : "after:w-0 hover:after:w-full"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            {session?.user.role === "ADMIN" && (
              <Link href={routes.admin} className="text-gold-deep">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-5">
            {/* Real search arrives with the Shop milestone's filter bar — this
                is a visual placeholder so the header layout is final now. */}
            <button aria-label="Search" className="hidden md:block">
              <Search size={21} strokeWidth={1.6} />
            </button>
            <Link href={routes.wishlist} aria-label="Wishlist" className="hidden md:block">
              <Heart size={21} strokeWidth={1.6} />
            </Link>
            <Link
              href={status === "authenticated" ? routes.account : routes.login}
              aria-label="Your account"
            >
              <User size={21} strokeWidth={1.6} />
            </Link>
            <Link href={routes.cart} aria-label="Bag" className="relative">
              <ShoppingBag size={21} strokeWidth={1.6} />
              {cartCount > 0 && (
                <span className="absolute -right-2.5 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-paper">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              aria-label="Menu"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
