import Stripe from "stripe";

/**
 * No apiVersion pinned here deliberately — omitting it lets the SDK use
 * the Stripe account's own default API version rather than hardcoding a
 * version string that could drift out of date. Pin one explicitly once
 * this is a real production account with a version you've tested against.
 *
 * Null when STRIPE_SECRET_KEY is unset: the SDK throws on an empty key at
 * construction time, which would fail `next build` in environments without
 * Stripe (like CI) — callers check for null instead.
 */
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
