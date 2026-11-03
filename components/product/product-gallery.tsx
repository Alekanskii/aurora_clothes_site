"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
}: {
  images: { url: string; alt: string }[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loupeVisible, setLoupeVisible] = useState(false);
  const [loupePosition, setLoupePosition] = useState({ x: 0, y: 0 });
  const [cursorPercent, setCursorPercent] = useState({ x: 50, y: 50 });
  const mainRef = useRef<HTMLDivElement>(null);

  const active = images[activeIndex] ?? images[0];

  // Defense in depth: getProductBySlug always provides a fallback image
  // now, but this component shouldn't crash on `active.url` below if it's
  // ever called with a genuinely empty array from somewhere else.
  if (!active) {
    return <div className="aspect-[4/5] bg-paper-deep" />;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = mainRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLoupePosition({ x: e.clientX - 85, y: e.clientY - 85 });
    setCursorPercent({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }

  return (
    <div>
      <div
        ref={mainRef}
        className="relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-paper-deep"
        onMouseEnter={() => setLoupeVisible(true)}
        onMouseLeave={() => setLoupeVisible(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={active.url}
          alt={active.alt}
          fill
          className="object-contain p-16"
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
        />
      </div>

      {/* Loupe: a fixed-position circle showing a zoomed crop of the same
          image, following the cursor. Desktop-only in practice — there's
          no mouse to drive it on touch devices, and that's fine. */}
      {loupeVisible && (
        <div
          className="pointer-events-none fixed z-20 hidden h-[170px] w-[170px] overflow-hidden rounded-full border-2 border-paper bg-paper-deep shadow-[0_0_0_1px_theme(colors.border)] md:block"
          style={{ left: loupePosition.x, top: loupePosition.y }}
        >
          <div
            className="absolute h-[280%] w-[280%]"
            style={{
              left: `${-cursorPercent.x * 1.8 + 90}%`,
              top: `${-cursorPercent.y * 1.8 + 90}%`,
            }}
          >
            <Image src={active.url} alt="" fill className="object-contain p-16" />
          </div>
        </div>
      )}

      {images.length > 1 && (
        <div className="mt-3.5 flex gap-3">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "flex h-24 w-[78px] items-center justify-center border bg-paper-deep",
                i === activeIndex ? "border-ink" : "border-transparent"
              )}
            >
              <Image src={img.url} alt={img.alt} width={44} height={52} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
