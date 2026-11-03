import * as Sentry from "@sentry/nextjs";

// An empty/missing NEXT_PUBLIC_SENTRY_DSN (the .env.example default) makes
// the SDK a safe no-op rather than throwing — nothing to configure to run
// locally without a Sentry account.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0, // session replay is off by default — it's a meaningful privacy decision, not a cost cut, given this app handles addresses and order data
  replaysOnErrorSampleRate: 0,
  debug: false,
});
