import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { AddressCard } from "@/components/account/address-card";
import { AddAddressToggle } from "@/components/account/add-address-toggle";
import { auth } from "@/lib/auth/config";
import { getAddressesForUser } from "@/lib/data/addresses";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Your addresses" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  const addresses = await getAddressesForUser(session.user.id);

  return (
    <Container className="py-14 pb-28">
      <p className="mb-2 text-xs text-stone">
        <Link href={routes.account} className="font-semibold text-ink">Account</Link> / Addresses
      </p>
      <h1 className="mb-8 font-heading text-2xl font-extrabold">Your addresses</h1>

      {addresses.length > 0 && (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}

      <AddAddressToggle />
    </Container>
  );
}
