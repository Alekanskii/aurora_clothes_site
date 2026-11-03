"use client";

import { useEffect, useRef } from "react";

/**
 * The one signature motion element carried over from the approved prototype:
 * a fixed vertical "selvage" line (styled after a fabric selvage / tailor's
 * tape) whose gold marker tracks scroll position. Desktop only — hidden
 * below 1100px, same breakpoint as the prototype.
 *
 * Deliberately the only persistent scroll-driven animation in the layout —
 * see the case study for why restraint on motion was a design decision, not
 * an oversight.
 */
export function SelvageRail() {
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      const doc = document.documentElement;
      const scrollableHeight = doc.scrollHeight - window.innerHeight;
      const pct = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      if (markerRef.current) {
        markerRef.current.style.transform = `translateY(${pct * 84}vh)`;
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="pointer-events-none fixed right-[22px] top-0 z-[60] hidden h-screen w-5 justify-center min-[1100px]:flex"
      aria-hidden="true"
    >
      <div
        className="absolute bottom-[8%] top-[8%] w-px opacity-35"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, #0F0F0F 0 4px, transparent 4px 9px)",
        }}
      />
      <div
        ref={markerRef}
        className="absolute top-[8%] h-[9px] w-[9px] rounded-full bg-gold"
        style={{ boxShadow: "0 0 0 3px #F7F6F3" /* matches `paper` in tailwind.config.ts */ }}
      />
    </div>
  );
}
