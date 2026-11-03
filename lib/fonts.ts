import { Manrope, Inter } from "next/font/google";

// Matches the two typefaces used in the approved static prototype:
// Manrope for headings, Inter for body/UI text. next/font self-hosts
// these at build time — no runtime request to Google Fonts, no layout
// shift, and no separate CSP allowance needed for fonts.googleapis.com
// beyond what's already in next.config.mjs.

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});
