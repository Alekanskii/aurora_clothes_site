import { test, expect } from "@playwright/test";
import { TEST_USER } from "./fixtures";
import { loginAs } from "./helpers";

test.describe("Registration", () => {
  test("shows a confirmation message after registering", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Name").fill("New Test User");
    // A fresh email every run — registering with an existing address is a
    // separate, deliberately vague error path (see actions/auth.ts) that
    // isn't what this test is checking.
    await page.getByLabel("Email").fill(`playwright-${Date.now()}@example.com`);
    await page.getByLabel("Password").fill("a-long-enough-password");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test("rejects a password under 10 characters", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Name").fill("Short Password");
    await page.getByLabel("Email").fill(`playwright-${Date.now()}@example.com`);
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: /create account/i }).click();

    // Narrowed to "must be" specifically — the field also has a static
    // helper hint ("At least 10 characters — length matters more than
    // symbols") that a looser match would ambiguously match too.
    await expect(page.getByText(/password must be at least 10/i)).toBeVisible();
  });
});

test.describe("Login", () => {
  test("logs in with valid credentials", async ({ page }) => {
    await loginAs(page);
    await expect(page.getByText(TEST_USER.email)).toBeVisible();
  });

  test("shows an error for a wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill("definitely-the-wrong-password");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText(/incorrect email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects to /login when visiting /account while logged out", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);
  });
});
