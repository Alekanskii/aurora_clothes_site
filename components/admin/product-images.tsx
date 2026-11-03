"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { uploadProductImageAction, deleteProductImageAction } from "@/actions/admin-products";
import type { AdminImage } from "@/lib/data/admin";

export function ProductImages({ productId, images }: { productId: string; images: AdminImage[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadProductImageAction(productId, formData);

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  function handleDelete(imageId: string) {
    setError(null);
    setDeletingId(imageId);
    (async () => {
      const result = await deleteProductImageAction(imageId);
      setDeletingId(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    })();
  }

  return (
    <div>
      {images.length === 0 ? (
        <p className="mb-4 text-sm text-stone">
          No photos yet — this product currently shows the default line-art placeholder in the shop.
        </p>
      ) : (
        <div className="mb-5 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden border border-border bg-paper-deep">
              <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="120px" />
              <button
                onClick={() => handleDelete(img.id)}
                disabled={deletingId === img.id}
                aria-label="Delete image"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-ink text-xs text-paper opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
              >
                {deletingId === img.id ? "…" : "×"}
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="inline-block cursor-pointer rounded-pill border border-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper">
        {isUploading ? "Uploading…" : "Upload photo"}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
      </label>
      <p className="mt-2 text-xs text-stone">JPEG, PNG, or WEBP · up to 5MB</p>

      {error && <p className="mt-3 text-xs text-error">{error}</p>}
    </div>
  );
}
