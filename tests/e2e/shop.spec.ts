import { test, expect } from "@playwright/test";

test.describe("Shop", () => {
  test("shows products and lets you filter by category", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByText(/\d+ pieces?/)).toBeVisible();

    // Scoped to <aside> (ShopFilters) specifically — the global Footer
    // also has an "Outerwear" link on every page, which would otherwise
    // match twice and fail Playwright's strict-mode uniqueness check.
    await page.locator("aside").getByText("Outerwear", { exact: true }).click();
    await expect(page).toHaveURL(/category=outerwear/);
  });

  test("shows a no-results state for an impossible filter combination", async ({ page }) => {
    // maxPrice=1 is below every seeded product's price, so this should
    // always produce zero results regardless of catalog changes elsewhere.
    await page.goto("/shop?maxPrice=1");
    await expect(page.getByText(/no pieces match those filters/i)).toBeVisible();
  });
});

test.describe("Product page", () => {
  test("shows product detail and disables an out-of-stock size", async ({ page }) => {
    // Seeded with size XS at 0 stock specifically so this is a real,
    // non-decorative assertion — see prisma/seed.ts and Milestone 5's notes.
    await page.goto("/product/wool-overcoat");
    await expect(page.getByRole("heading", { name: "The Wool Overcoat" })).toBeVisible();

    const outOfStockSize = page.getByRole("button", { name: "XS", exact: true });
    await expect(outOfStockSize).toBeDisabled();
  });

  test("404s for an unknown product slug", async ({ page }) => {
    const response = await page.goto("/product/this-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
