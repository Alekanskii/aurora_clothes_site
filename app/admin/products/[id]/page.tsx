import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { VariantTable } from "@/components/admin/variant-table";
import { ProductImages } from "@/components/admin/product-images";
import { getAdminProductById, getAllCategoriesAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Admin — Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProductById(id), getAllCategoriesAdmin()]);

  if (!product) notFound();

  return (
    <div>
      <h2 className="mb-6 font-heading text-lg font-bold">{product.name}</h2>

      <ProductForm
        productId={product.id}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: product.categoryId,
          isPublished: product.isPublished,
        }}
      />

      <div className="mt-12 border-t border-border pt-10">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-stone">
          Photos ({product.images.length})
        </h3>
        <ProductImages productId={product.id} images={product.images} />
      </div>

      <div className="mt-12 border-t border-border pt-10">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-stone">
          Variants ({product.variants.length})
        </h3>
        <VariantTable productId={product.id} variants={product.variants} />
      </div>
    </div>
  );
}
