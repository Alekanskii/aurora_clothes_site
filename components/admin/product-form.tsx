"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormInput } from "@/lib/validation/admin";
import { createProductAction, updateProductAction } from "@/actions/admin-products";
import { routes } from "@/lib/routes";

export function ProductForm({
  categories,
  productId,
  defaultValues,
}: {
  categories: { id: string; name: string }[];
  productId?: string;
  defaultValues?: Partial<ProductFormInput>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      isPublished: true,
      categoryId: categories[0]?.id ?? "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: ProductFormInput) {
    setServerError(null);

    if (productId) {
      const result = await updateProductAction(productId, data);
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      router.push(routes.adminProduct(productId));
    } else {
      const result = await createProductAction(data);
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      router.push(routes.adminProduct(result.id));
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-5">
      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-stone">Name</label>
        <input {...register("name")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
        {errors.name && <p className="mt-1.5 text-xs text-error">{errors.name.message}</p>}
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-stone">Slug</label>
        <input {...register("slug")} placeholder="wool-overcoat" className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
        {errors.slug && <p className="mt-1.5 text-xs text-error">{errors.slug.message}</p>}
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-stone">Description</label>
        <textarea {...register("description")} rows={4} className="w-full border border-border bg-paper px-3.5 py-3 text-sm outline-none focus-visible:border-ink" />
        {errors.description && <p className="mt-1.5 text-xs text-error">{errors.description.message}</p>}
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-stone">Category</label>
        <select {...register("categoryId")} className="w-full border border-border bg-paper px-3.5 py-3 text-sm">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" {...register("isPublished")} className="accent-ink" />
        Published (visible in the shop)
      </label>

      {serverError && <p className="text-xs text-error">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 self-start rounded-pill bg-ink px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-deep hover:text-ink disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : productId ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
