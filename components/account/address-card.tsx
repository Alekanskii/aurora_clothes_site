"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAddressAction, setDefaultAddressAction } from "@/actions/addresses";
import type { AddressSummary } from "@/lib/data/addresses";

export function AddressCard({ address }: { address: AddressSummary }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      await deleteAddressAction(address.id);
      router.refresh();
    });
  }

  function setDefault() {
    startTransition(async () => {
      await setDefaultAddressAction(address.id);
      router.refresh();
    });
  }

  return (
    <div className="border border-border p-5">
      <div className="mb-2 flex items-start justify-between">
        <p className="text-sm font-semibold">{address.fullName}</p>
        {address.isDefault && (
          <span className="rounded-pill bg-paper-deep px-2.5 py-1 text-[11px] uppercase tracking-wide text-stone">
            Default
          </span>
        )}
      </div>
      <p className="text-xs leading-relaxed text-stone">
        {address.line1}
        {address.line2 && <>, {address.line2}</>}
        <br />
        {address.city}, {address.postcode}
        <br />
        {address.country}
        {address.phone && (
          <>
            <br />
            {address.phone}
          </>
        )}
      </p>
      <div className="mt-4 flex gap-4 text-xs">
        {!address.isDefault && (
          <button onClick={setDefault} disabled={isPending} className="underline disabled:opacity-50">
            Set as default
          </button>
        )}
        <button onClick={remove} disabled={isPending} className="text-error underline disabled:opacity-50">
          Remove
        </button>
      </div>
    </div>
  );
}
