export const GUEST_CART_COOKIE = "aurora_guest_cart";
export const GUEST_CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

// Demo-only: a single hardcoded coupon, matching the one used in the
// original static prototype. Real promotions need their own table (code,
// discount type/value, expiry, per-user usage limits) — that's a genuine
// gap, flagged here rather than silently designed around.
export const DEMO_COUPON_CODE = "AURORA10";
export const DEMO_COUPON_DISCOUNT_PERCENT = 10;

export const FREE_SHIPPING_THRESHOLD_CENTS = 20000; // $200 — matches the top banner copy
export const FLAT_SHIPPING_CENTS = 900; // $9 flat estimate below the threshold
export const CART_TAX_RATE = 0.08; // flat estimate — Milestone 8 checkout does real address-based tax
