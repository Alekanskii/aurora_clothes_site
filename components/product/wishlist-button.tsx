"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleWishlistAction } from "@/actions/wishlist";

type Variant = "card" | "detail";

/**
 * Logged-in: persists via toggleWishlistAction (optimistic — flips
 * immediately, rolls back if the server call fails). Logged-out: a local,
 * unpersisted toggle — see actions/wishlist.ts for why guest wishlists
 * aren't backed by the database the way guest carts are.
 */
export function WishlistButton({
  productId,
  initialWishlisted = false,
  variant = "card",
}: {
  productId: string;
  initialWishlisted?: boolean;
  variant?: Variant;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialWishlisted);
  const [, startTransition] = useTransition();

  function handleClick() {
    const next = !saved;
    setSaved(next); // optimistic

    if (status !== "authenticated") return; // local-only for guests

    startTransition(async () => {
      const result = await toggleWishlistAction(productId);
      if (!result.success) {
        setSaved(!next); // roll back
        return;
      }
      setSaved(result.wishlisted);
      router.refresh();
    });
  }

  if (variant === "detail") {
    return (
      <button
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={saved}
        onClick={handleClick}
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center border border-ink"
      >
        <Heart size={19} className={cn(saved && "fill-gold-deep text-gold-deep")} />
      </button>
    );
  }

  return (
    <button
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      onClick={handleClick}
      className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
    >
      <Heart size={15} className={cn(saved && "fill-gold-deep text-gold-deep")} />
    </button>
  );
}
