import type { Metadata } from "next";
import Link from "next/link";
import { getAllProductsAdmin } from "@/lib/data/admin";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Admin — Products" };

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">Products ({products.length})</h2>
        <Link
          href={routes.adminProductNew}
          className="rounded-pill bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-paper"
        >
          + New product
        </Link>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-stone">
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Category</th>
            <th className="pb-3 font-medium">Variants</th>
            <th className="pb-3 font-medium">Stock</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-border text-sm">
              <td className="py-3">
                <Link href={routes.adminProduct(p.id)} className="font-semibold hover:underline">
                  {p.name}
                </Link>
              </td>
              <td className="py-3 text-stone">{p.categoryName}</td>
              <td className="py-3 text-stone">{p.variantCount}</td>
              <td className={`py-3 ${p.totalStock <= 10 ? "text-error" : "text-stone"}`}>{p.totalStock}</td>
              <td className="py-3">
                <PublishToggle productId={p.id} isPublished={p.isPublished} />
              </td>
              <td className="py-3 text-right">
                <Link href={routes.adminProduct(p.id)} className="text-xs underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
