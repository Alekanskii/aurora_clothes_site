import { prisma } from "@/lib/prisma";

export type AddressSummary = {
  id: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
};

export async function getAddressesForUser(userId: string): Promise<AddressSummary[]> {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return addresses.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    postcode: a.postcode,
    country: a.country,
    phone: a.phone,
    isDefault: a.isDefault,
  }));
}
