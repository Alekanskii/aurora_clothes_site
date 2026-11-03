import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { getAllCategoriesAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Admin — New product" };

export default async function NewProductPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div>
      <h2 className="mb-6 font-heading text-lg font-bold">New product</h2>
      <p className="mb-6 max-w-lg text-sm text-stone">
        Variants (color/size/price/stock) are added after creating the product — every product
        needs at least one before it can actually be sold.
      </p>
      <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
