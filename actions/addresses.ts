"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validation/checkout";

type ActionResult = { success: true } | { success: false; error: string };

export async function createAddressAction(input: ShippingAddressInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You need to be logged in." };

  const parsed = shippingAddressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid address." };
  }

  const existingCount = await prisma.address.count({ where: { userId: session.user.id } });

  await prisma.address.create({
    data: {
      userId: session.user.id,
      fullName: parsed.data.fullName,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      postcode: parsed.data.postcode,
      country: parsed.data.country,
      phone: parsed.data.phone || null,
      // The very first address a customer saves becomes their default
      // automatically — otherwise every new account would have no
      // default address and checkout would never be able to suggest one.
      isDefault: existingCount === 0,
    },
  });

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddressAction(addressId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You need to be logged in." };

  // Scoped by userId in the delete itself, not fetched-then-checked —
  // same IDOR-prevention pattern as getOrderForUser elsewhere in this
  // app. deleteMany with a non-matching id/userId pair just deletes
  // nothing rather than throwing, which is fine here.
  await prisma.address.deleteMany({ where: { id: addressId, userId: session.user.id } });

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function setDefaultAddressAction(addressId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You need to be logged in." };

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: session.user.id },
  });
  if (!address) return { success: false, error: "Address not found." };

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } }),
    prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
  return { success: true };
}
