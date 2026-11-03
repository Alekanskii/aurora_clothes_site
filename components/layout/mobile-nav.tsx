"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { primaryNavLinks, routes } from "@/lib/routes";

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.42, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[95] flex flex-col gap-6 bg-paper p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="self-end p-2"
          >
            <X size={26} />
          </button>
          {primaryNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="font-heading text-xl font-semibold"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-6 border-t border-border pt-6">
            <Link href={routes.account} onClick={onClose} className="font-heading text-xl font-semibold">
              Account
            </Link>
            <Link href={routes.cart} onClick={onClose} className="font-heading text-xl font-semibold">
              Bag
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
