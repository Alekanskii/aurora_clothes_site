"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleProductPublishedAction } from "@/actions/admin-products";

export function PublishToggle({ productId, isPublished }: { productId: string; isPublished: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleProductPublishedAction(productId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wide disabled:opacity-50 ${
        isPublished ? "bg-[#e3f3e4] text-success" : "bg-paper-deep text-stone"
      }`}
    >
      {isPublished ? "Published" : "Unpublished"}
    </button>
  );
}
