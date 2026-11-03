"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateVariantAction, createVariantAction } from "@/actions/admin-products";
import { formatPrice } from "@/lib/utils";
import type { AdminVariant } from "@/lib/data/admin";

function VariantRow({ variant }: { variant: AdminVariant }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [priceCents, setPriceCents] = useState(String(variant.priceCents));
  const [stock, setStock] = useState(String(variant.stock));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setError(null);
    setIsSaving(true);
    const result = await updateVariantAction(variant.id, {
      color: variant.color,
      size: variant.size,
      priceCents: Number(priceCents),
      stock: Number(stock),
    });
    setIsSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  return (
    <tr className="border-b border-border text-sm">
      <td className="py-3">{variant.color}</td>
      <td className="py-3">{variant.size}</td>
      <td className="py-3 text-xs text-stone">{variant.sku}</td>
      <td className="py-3">
        {editing ? (
          <input
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            className="w-24 border border-border px-2 py-1 text-sm"
          />
        ) : (
          formatPrice(variant.priceCents)
        )}
      </td>
      <td className="py-3">
        {editing ? (
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={`w-16 border px-2 py-1 text-sm ${variant.stock <= 5 ? "border-error" : "border-border"}`}
          />
        ) : (
          <span className={variant.stock <= 5 ? "text-error" : ""}>{variant.stock}</span>
        )}
      </td>
      <td className="py-3 text-right">
        {editing ? (
          <div className="flex justify-end gap-2">
            <button onClick={save} disabled={isSaving} className="text-xs font-semibold underline disabled:opacity-50">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-stone underline">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-xs underline">
            Edit
          </button>
        )}
      </td>
      {error && (
        <td colSpan={6} className="text-xs text-error">
          {error}
        </td>
      )}
    </tr>
  );
}

export function VariantTable({ productId, variants }: { productId: string; variants: AdminVariant[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function addVariant() {
    setError(null);
    setIsSaving(true);
    const result = await createVariantAction(productId, {
      color,
      size,
      priceCents: Number(priceCents),
      stock: Number(stock),
    });
    setIsSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setColor("");
    setSize("");
    setPriceCents("");
    setStock("");
    setShowAdd(false);
    router.refresh();
  }

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-stone">
            <th className="pb-2 font-medium">Colour</th>
            <th className="pb-2 font-medium">Size</th>
            <th className="pb-2 font-medium">SKU</th>
            <th className="pb-2 font-medium">Price</th>
            <th className="pb-2 font-medium">Stock</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <VariantRow key={v.id} variant={v} />
          ))}
        </tbody>
      </table>

      {showAdd ? (
        <div className="mt-5 flex flex-wrap items-end gap-3 border border-border p-4">
          <div>
            <label className="mb-1 block text-xs text-stone">Colour</label>
            <input value={color} onChange={(e) => setColor(e.target.value)} className="w-28 border border-border px-2 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone">Size</label>
            <input value={size} onChange={(e) => setSize(e.target.value)} className="w-20 border border-border px-2 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone">Price (cents)</label>
            <input value={priceCents} onChange={(e) => setPriceCents(e.target.value)} className="w-24 border border-border px-2 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone">Stock</label>
            <input value={stock} onChange={(e) => setStock(e.target.value)} className="w-16 border border-border px-2 py-2 text-sm" />
          </div>
          <button onClick={addVariant} disabled={isSaving} className="rounded-pill bg-ink px-5 py-2 text-xs font-semibold uppercase text-paper disabled:opacity-50">
            Add
          </button>
          <button onClick={() => setShowAdd(false)} className="text-xs text-stone underline">
            Cancel
          </button>
          {error && <p className="w-full text-xs text-error">{error}</p>}
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="mt-5 text-xs font-semibold underline">
          + Add variant
        </button>
      )}
    </div>
  );
}
