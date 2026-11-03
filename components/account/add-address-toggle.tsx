"use client";

import { useState } from "react";
import { AddressForm } from "./address-form";

export function AddAddressToggle() {
  const [open, setOpen] = useState(false);

  if (open) {
    return <AddressForm onDone={() => setOpen(false)} />;
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="rounded-pill border border-ink px-6 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper"
    >
      + Add new address
    </button>
  );
}
