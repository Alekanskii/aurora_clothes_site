import { test, expect } from "@playwright/test";
import { loginAs, resetTestUserCart } from "./helpers";

test.describe("Cart → Checkout", () => {
  // Every test here shares TEST_USER's single cart, so they can't run
  // concurrently under CI's fullyParallel — one test's resetTestUserCart()
  // would wipe another's items mid-assertion. Keep them sequential.
  test.describe.configure({ mode: "default" });

  test.beforeEach(async ({ page }) => {
    await resetTestUserCart();
    await loginAs(page);
  });

  test("add to bag, edit quantity, apply coupon, reach checkout", async ({ page }) => {
    await page.goto("/product/wool-overcoat");

    // The default color/size selection auto-picks an in-stock combination
    // (see components/product/variant-selector.tsx) — XS is seeded
    // out-of-stock specifically, so this also implicitly confirms the
    // page didn't default to it.
    await page.getByRole("button", { name: /add to bag/i }).click();
    await expect(page.getByText(/added \d+ ×/i)).toBeVisible();

    await page.goto("/cart");
    await expect(page.getByText("The Wool Overcoat")).toBeVisible();

    // Quantity: increase once and confirm the row reflects it. Only one
    // item is in the cart at this point in the test, so the aria-label
    // and testid below are unambiguous without needing to scope to a
    // specific row.
    await page.getByLabel("Increase quantity").click();
    await expect(page.getByTestId("cart-item-qty")).toHaveText("2");

    // Coupon: AURORA10 is the one hardcoded demo code (lib/cart/constants.ts).
    await page.getByPlaceholder("Promo code").fill("AURORA10");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText(/AURORA10.*applied/i)).toBeVisible();
    await expect(page.getByText("Discount")).toBeVisible();
    // Applying the coupon triggers router.refresh() (see coupon-form.tsx),
    // which re-renders the whole page from the server. Without waiting for
    // that to fully settle, the checkout link below can be clicked mid-
    // refresh and miss the navigation.
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: /proceed to checkout/i }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    await page.getByLabel("Full name").fill("Playwright Tester");
    await page.getByLabel("Address", { exact: true }).fill("123 Test Street");
    await page.getByLabel("City").fill("Copenhagen");
    await page.getByLabel("Postal code").fill("1050");
    await page.getByLabel("Country").fill("Denmark");
    await page.getByRole("button", { name: /continue to payment/i }).click();

    // Whether this redirects to Stripe's hosted checkout or shows a
    // configuration error depends on whether STRIPE_SECRET_KEY is set in
    // .env (see actions/checkout.ts and DEPLOYMENT.md) — both are correct,
    // intentional outcomes, so the test accepts either rather than
    // hard-requiring real Stripe credentials just to run the suite.
    await Promise.race([
      page.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 }),
      expect(page.getByText(/stripe isn't configured/i)).toBeVisible({ timeout: 15_000 }),
    ]);
  });

  test("removing the only item shows the empty bag state", async ({ page }) => {
    await page.goto("/product/merino-crewneck");
    await page.getByRole("button", { name: /add to bag/i }).click();
    await expect(page.getByText(/added \d+ ×/i)).toBeVisible();

    await page.goto("/cart");
    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText(/your bag is empty/i)).toBeVisible();
  });

  test("checkout redirects to /login for a logged-out visitor", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login/);
  });
});
