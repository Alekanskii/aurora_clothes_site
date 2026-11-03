"use client";

import { signOut } from "next-auth/react";
import { routes } from "@/lib/routes";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: routes.home })}
      className="rounded-pill border border-ink px-6 py-3 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper"
    >
      Log out
    </button>
  );
}
