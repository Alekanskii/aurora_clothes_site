import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { LogoutButton } from "@/components/auth/logout-button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { auth } from "@/lib/auth/config";
import { getOrdersForUser } from "@/lib/data/orders";
import { getAddressesForUser } from "@/lib/data/addresses";
import { getWishlistProducts } from "@/lib/data/wishlist";
import { formatPrice } from "@/lib/utils";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  // Defense in depth: middleware.ts already redirects unauthenticated
  // requests away from /account, but this page checks again rather than
  // assuming middleware always ran (e.g. if the matcher config ever
  // changes). A Server Component with its own real session check, not a
  // placeholder that trusts the URL was reached legitimately.
  const session = await auth();
  if (!session?.user) {
    redirect(routes.login);
  }

  const orders = await getOrdersForUser(session.user.id);
  const recentOrders = orders.slice(0, 2);
  const addresses = await getAddressesForUser(session.user.id);
  const wishlistProducts = await getWishlistProducts(session.user.id);

  return (
    <Container className="py-14 pb-28">
      <p className="mb-2 text-xs text-stone">
        <span className="font-semibold text-ink">Home</span> / Account
      </p>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">
            {session.user.name ? `Hi, ${session.user.name.split(" ")[0]}` : "Your account"}
          </h1>
          <p className="mt-1 text-sm text-stone">{session.user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid gap-6 border-t border-border pt-10 md:grid-cols-3">
        <div className="border border-border p-6 md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Orders</h2>
            {orders.length > 0 && (
              <Link href={routes.accountOrders} className="text-xs underline text-stone">
                View all ({orders.length})
              </Link>
            )}
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-xs text-stone">
              You haven&apos;t placed an order yet —{" "}
              <Link href={routes.shop} className="underline">browse the shop</Link>.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={routes.accountOrder(order.id)}
                  className="flex items-center justify-between text-sm"
                >
                  <span>#{order.orderNumber}</span>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="w-16 text-right font-semibold">{formatPrice(order.totalCents)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="border border-border p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Wishlist</h2>
            {wishlistProducts.length > 0 && (
              <Link href={routes.wishlist} className="text-xs underline text-stone">
                View all ({wishlistProducts.length})
              </Link>
            )}
          </div>
          {wishlistProducts.length === 0 ? (
            <p className="text-xs text-stone">
              Nothing saved yet — tap the heart on any product to add it here.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {wishlistProducts.slice(0, 3).map((product) => (
                <li key={product.slug}>
                  <Link href={routes.product(product.slug)} className="hover:underline">
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border border-border p-6 md:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Addresses</h2>
            {addresses.length > 0 && (
              <Link href={routes.accountAddresses} className="text-xs underline text-stone">
                Manage ({addresses.length})
              </Link>
            )}
          </div>
          {addresses.length === 0 ? (
            <p className="text-xs text-stone">
              No saved addresses yet —{" "}
              <Link href={routes.accountAddresses} className="underline">add one</Link>.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {addresses.slice(0, 3).map((address) => (
                <div key={address.id} className="border border-border p-4 text-xs">
                  <p className="font-semibold text-ink">
                    {address.fullName}
                    {address.isDefault && <span className="ml-2 text-stone">· Default</span>}
                  </p>
                  <p className="mt-1 text-stone">
                    {address.line1}, {address.city}, {address.country}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
