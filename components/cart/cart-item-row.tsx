"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { updateCartItemQuantityAction, removeCartItemAction } from "@/actions/cart";
import type { CartItemData } from "@/types/cart";

export function CartItemRow({ item }: { item: CartItemData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateQuantity(next: number) {
    startTransition(async () => {
      await updateCartItemQuantityAction(item.id, next);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await removeCartItemAction(item.id);
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-[96px_1fr_auto_auto] items-center gap-5 border-b border-border py-6">
      <Link href={routes.product(item.productSlug)} className="flex h-[120px] w-24 items-center justify-center bg-paper-deep">
        <Image src={item.imageUrl} alt={item.imageAlt} width={70} height={88} />
      </Link>
      <div>
        <Link href={routes.product(item.productSlug)}>
          <h4 className="text-sm font-semibold">{item.productName}</h4>
        </Link>
        <p className="mt-1 text-xs text-stone">
          {item.color} · {item.size}
        </p>
        <button onClick={remove} disabled={isPending} className="mt-2 text-xs text-error underline disabled:opacity-50">
          Remove
        </button>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => updateQuantity(item.quantity - 1)}
          disabled={isPending}
          className="flex h-6 w-6 items-center justify-center border border-border text-xs disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span data-testid="cart-item-qty" className="w-4 text-center text-sm">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.quantity + 1)}
          disabled={isPending || item.quantity >= item.stock}
          className="flex h-6 w-6 items-center justify-center border border-border text-xs disabled:opacity-50"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <div className="text-sm font-semibold">{formatPrice(item.lineTotalCents)}</div>
    </div>
  );
}
