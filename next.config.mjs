import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

// Next.js's dev server bundles use eval() for fast refresh / source maps —
// blocking it (as a strict CSP correctly should) breaks ALL client-side JS
// in dev, silently, with no visible error except a CSP violation in the
// console. Production builds don't use eval() at all, so 'unsafe-eval'
// is scoped to development only — it must never ship to a real deploy.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://js.stripe.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://res.cloudinary.com",
      "connect-src 'self' https://api.stripe.com https://*.ingest.sentry.io",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// withSentryConfig wraps the build to upload source maps (so stack traces
// in Sentry show real file/line, not minified bundle positions) and injects
// the client init. Safe to leave wrapped even without a Sentry account
// configured yet — without SENTRY_AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT set,
// the plugin skips the source-map upload step and logs a notice rather
// than failing the build.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});
