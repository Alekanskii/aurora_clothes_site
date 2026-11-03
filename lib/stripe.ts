import Stripe from "stripe";

/**
 * No apiVersion pinned here deliberately — omitting it lets the SDK use
 * the Stripe account's own default API version rather than hardcoding a
 * version string that could drift out of date. Pin one explicitly once
 * this is a real production account with a version you've tested against.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
