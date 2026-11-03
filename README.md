# AURORA — E-Commerce Platform

A production-ready e-commerce application for a premium clothing brand, built with Next.js, PostgreSQL, and Stripe. This document covers everything needed to run, test, and deploy the project.

---

## What's included

**Storefront**
- Home, Shop (with filtering, sorting, search, and pagination), and Product pages, all reading live data from the database
- Quick View, product galleries with zoom, and a wishlist
- Persistent shopping cart, for both guests and signed-in customers, with promo code support
- Full checkout via Stripe, with order confirmation emails

**Accounts**
- Registration with email verification, login, password reset, and account lockout after repeated failed attempts
- Order history and address book under "My Account" — add, remove, and set a default shipping address

**Admin panel**
- Dashboard with sales and low-stock overview
- Product and inventory management, including photo uploads and publish/unpublish control
- Order management, including issuing real refunds through Stripe

**Engineering**
- Automated end-to-end test suite (Playwright) covering the core shopping flow
- Continuous integration (GitHub Actions) running tests and code checks on every change
- Security measures: rate limiting, account lockout, hashed passwords, audit logging, and standard security headers
- Error tracking (Sentry) and analytics (Vercel Analytics), ready to activate

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Prisma ORM |
| Authentication | Auth.js (NextAuth) |
| Payments | Stripe Checkout |
| Email | Resend |
| Rate limiting | Upstash Redis |
| Error tracking | Sentry |
| Testing | Playwright |
| Hosting | Vercel (recommended) |

---

## Getting started

### Requirements

- Node.js 20 or later
- A PostgreSQL database (a free [Neon](https://neon.tech) database works well and requires no local setup)

### Installation

```bash
npm install
cp .env.example .env
```

Open `.env` and fill in at minimum `DATABASE_URL` and `DIRECT_URL` (see [Environment variables](#environment-variables) below). Everything else can stay blank for local development — the app degrades gracefully and clearly indicates in the console when an optional service (email, payments, rate limiting) isn't configured, rather than failing silently.

### Set up the database

```bash
npx prisma migrate deploy
npx prisma db seed
```

This creates the database tables and populates a starter catalog (categories, products, and demo customer reviews).

### Run the app

```bash
npm run dev
```

The site will be available at `http://localhost:3000`.

### Create an admin account

There is no self-service way to become an admin — this is intentional, for security. Register a normal account through the site, then run:

```bash
npm run make-admin your-email@example.com
```

An "Admin" link will then appear in the site header for that account.

---

## Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Everything | PostgreSQL connection strings |
| `AUTH_SECRET` | Everything | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL` | Everything | The site's own URL |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout | Free in Stripe's test mode |
| `RESEND_API_KEY`, `EMAIL_FROM` | Sending real emails | Without this, emails are printed to the server console instead, so registration and password reset are still fully testable |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting | Free tier available at [upstash.com](https://upstash.com) |
| `CLOUDINARY_*` | Product photo uploads | Without this, the admin photo upload button shows a clear "not configured" message rather than failing silently |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | Error tracking | Free tier available at [sentry.io](https://sentry.io) |

A full template with comments is in `.env.example`.

---

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` / `npm run start` | Build and run a production build locally |
| `npm run lint` / `npm run typecheck` | Code quality checks |
| `npm run test` | Run the automated test suite |
| `npm run prisma:studio` | Browse and edit the database visually |
| `npm run prisma:seed` | Reload the starter catalog |
| `npm run make-admin <email>` | Grant admin access to an existing account |

---

## Testing

The project includes an automated test suite covering registration, login, browsing and filtering the catalog, and the full cart-to-checkout flow:

```bash
npx playwright install   # one-time browser download
npm run test
```

These same checks run automatically on every code change via GitHub Actions (see `.github/workflows/ci.yml`), so regressions are caught before they reach production.

---

## Deploying to production

Full step-by-step deployment instructions — including production database setup, Stripe webhook configuration, and environment variable checklists — are in **[DEPLOYMENT.md](./DEPLOYMENT.md)**. In short:

1. Push the project to GitHub
2. Import it into [Vercel](https://vercel.com) (auto-detects Next.js, no configuration needed)
3. Set up a production database and add the environment variables listed above
4. Deploy

The project is set up to run safely in Stripe's test mode indefinitely if live payments aren't needed yet.

---

## Current limitations

For transparency, a few things are intentionally out of scope for this version:

- **Guest checkout isn't available** — customers need an account to complete a purchase. This was a deliberate simplification; adding it later is a moderate, well-understood piece of work.
- **Promo codes** currently support one fixed code as a demonstration, rather than a full promotions system with expiry dates and usage limits.
- **Product photography** — the catalog currently uses placeholder illustrations. The admin panel supports uploading real product photos (JPEG/PNG/WEBP, validated and stored via Cloudinary) whenever photography is ready; no code changes are needed to start using it.
- Stock is confirmed at checkout, but not "held" during the payment step itself, so in the rare case of simultaneous purchases of the very last unit of an item, both could succeed. This is a common trade-off at this stage of a project and can be hardened later if inventory becomes tight enough for it to matter.

None of these affect the core shopping experience — they're worth knowing about if requirements expand.

---

## Questions or support

For anything not covered here, the code is organized by feature (`app/`, `components/`, `actions/`, `lib/`) and each area is reasonably self-contained. Feel free to reach out with any questions.
