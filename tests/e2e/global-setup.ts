import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { TEST_USER } from "./fixtures";

/**
 * Runs once before the whole suite. Creates (or resets) a known-good,
 * pre-verified account directly via Prisma — bypassing the real
 * registration/email-verification UI entirely, since that flow depends on
 * a console-logged link Playwright can't read. Also clears any leftover
 * cart from a previous run so cart-checkout.spec.ts starts from empty
 * every time, not accumulated state from the last run.
 */
export default async function globalSetup() {
  const prisma = new PrismaClient();

  const passwordHash = await argon2.hash(TEST_USER.password, { type: argon2.argon2id });

  const user = await prisma.user.upsert({
    where: { email: TEST_USER.email },
    update: {
      passwordHash,
      emailVerified: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: TEST_USER.email,
      passwordHash,
      emailVerified: new Date(),
      name: "Playwright Test",
    },
  });

  // Self-check: re-read the row back and verify the password against it,
  // exactly like authorize() does. If this ever prints FAILED, the
  // problem is in this setup step itself (bad write, bad hash) — not a
  // mystery somewhere downstream in the actual login test.
  const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const selfCheck = stored.passwordHash ? await argon2.verify(stored.passwordHash, TEST_USER.password) : false;
  console.log(
    `[global-setup] Test user ready: ${stored.email} | emailVerified: ${Boolean(stored.emailVerified)} | ` +
      `lockedUntil: ${stored.lockedUntil ?? "none"} | failedLoginAttempts: ${stored.failedLoginAttempts} | ` +
      `password self-check: ${selfCheck ? "OK" : "FAILED"}`
  );
  if (!selfCheck) {
    throw new Error(
      "[global-setup] Test user's password hash did not verify immediately after being written — aborting the suite rather than letting every login-dependent test fail with a confusing downstream error."
    );
  }

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
  }

  await prisma.$disconnect();
}
