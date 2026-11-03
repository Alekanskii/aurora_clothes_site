import "dotenv/config";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { TEST_USER } from "./fixtures";

const prisma = new PrismaClient();

/**
 * Logs in through the actual login form (not a storageState shortcut) —
 * slower per-test, but it means this suite is also implicitly exercising
 * the real Auth.js credentials flow on every run that needs a session,
 * not just in auth.spec.ts.
 */
export async function loginAs(page: Page, user = TEST_USER) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: /log in/i }).click();

  // If login didn't land on /account, surface whatever error text is
  // actually on screen (friendlyError() in login-form.tsx) instead of
  // just failing on the URL mismatch — that error text is the real
  // reason and shouldn't require a second round of manual digging.
  try {
    await expect(page).toHaveURL(/\/account/, { timeout: 8000 });
  } catch {
    const visibleError = await page
      .locator("p.text-error")
      .first()
      .textContent()
      .catch(() => null);
    throw new Error(
      `loginAs() did not reach /account for ${user.email}. ` +
        `Visible error on page: ${visibleError ?? "(none found)"}`
    );
  }
}

/**
 * Clears the test user's cart (items + any applied coupon) directly via
 * Prisma. global-setup.ts only does this once for the whole suite run —
 * without also doing it per-test, cart-checkout.spec.ts's tests leaked
 * state into each other (a coupon or leftover item from one test showing
 * up in the next one's assertions).
 */
export async function resetTestUserCart(email = TEST_USER.email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
}
