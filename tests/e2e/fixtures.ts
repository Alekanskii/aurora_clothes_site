/**
 * A pre-verified test account, created directly via Prisma in
 * global-setup.ts rather than through the real registration UI. Email
 * verification links only ever appear in server console logs (see
 * lib/email.ts) — Playwright has no way to read those, so any test that
 * needs to be logged in uses this account instead of registering fresh.
 * Registration itself is still tested (auth.spec.ts), just not chained
 * into a full register-verify-login loop.
 */
export const TEST_USER = {
  email: "playwright-test@example.com",
  password: "playwright-test-password",
};
