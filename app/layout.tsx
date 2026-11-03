import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { manrope, inter } from "@/lib/fonts";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SelvageRail } from "@/components/layout/selvage-rail";
import { AuthProvider } from "@/components/providers/auth-provider";
import { getCurrentCart } from "@/lib/data/cart";
import "./globals.css";

// Base metadata. Individual pages override title/description via their own
// generateMetadata() — this is only the fallback + the shared OG/Twitter
// defaults so every page has *something* correct even before it's customized.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "AURORA — Considered clothing, made to last",
    template: "%s · AURORA",
  },
  description:
    "AURORA is a Scandinavian clothing studio making considered outerwear, knitwear and tailoring in small, honest runs.",
  openGraph: {
    type: "website",
    siteName: "AURORA",
    title: "AURORA — Considered clothing, made to last",
    description:
      "Minimal luxury outerwear, knitwear and tailoring, made in small runs from traceable material.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AURORA — Considered clothing, made to last",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetched here (Server Component, once per request) rather than inside
  // Navbar itself — Navbar is a Client Component (needs scroll state), and
  // Client Components can't query Prisma directly. Cart-mutating Server
  // Actions call revalidatePath("/", "layout"), which is what makes this
  // number update after Add to Bag without a full page reload.
  const cart = await getCurrentCart();

  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <SelvageRail />
          <Navbar cartCount={cart.itemCount} />
          {children}
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
