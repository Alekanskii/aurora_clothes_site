import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth/require-admin";
import { routes } from "@/lib/routes";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth alongside middleware.ts, same pattern as every other
  // protected area in this app (/account, /checkout).
  const admin = await requireAdmin();
  if (!admin) redirect(routes.home);

  return (
    <Container className="py-10 pb-28">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold">Admin</h1>
        <span className="text-xs text-stone">{admin.user.email}</span>
      </div>
      <div className="grid gap-10 md:grid-cols-[200px_1fr]">
        <AdminSidebar />
        <div>{children}</div>
      </div>
    </Container>
  );
}
