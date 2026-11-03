"use client";

import { motion } from "framer-motion";

/**
 * Matches the `.reveal` class from the approved prototype: sections fade
 * and shift up slightly the first time they enter the viewport. `once:
 * true` means it never re-plays on scroll-back, and Framer Motion respects
 * prefers-reduced-motion automatically.
 */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
