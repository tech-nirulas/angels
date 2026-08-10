import { Providers } from "@/lib/Providers";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

export const metadata: Metadata = {
  title: "Angels in my Kitchen | Bakery & Patisserie",
  description: "Handcrafted pastries and cakes made with love since 1987. Experience the art of baking.",
  openGraph: {
    title: "Angels in my Kitchen | Bakery & Patisserie",
    description: "Handcrafted pastries and cakes made with love since 1987.",
    type: "website",
  },
};

/**
 * Fonts are exposed as CSS variables rather than stacked class names.
 *
 * Previously all four font `.className`s were applied to <body> together, so the
 * last one in the cascade (DM Mono) silently became the computed body font.
 * Using `variable` puts each family on :root instead, and lib/theme.ts is the
 * single authority that decides which role each one fills.
 *
 * Each variable resolves to the family PLUS Next's metric-adjusted fallback
 * (e.g. "Poppins", "Poppins Fallback"), so the size-adjusted fallback is used
 * during load instead of being bypassed.
 */

/**
 * ⚠️ Cravelo is a DEMO cut — PERSONAL USE ONLY, not licensed for production.
 *    See app/fonts/LICENCE-NOTICE.md before deploying.
 *
 * Static, single weight (OS/2 usWeightClass = 400), CFF outlines, Latin only.
 * The demo maps just 56 codepoints (A-Z, a-z, space) — no digits, no punctuation,
 * no ₹ — so prices and product data deliberately use Poppins instead.
 *
 * `weight: "400"` is the font's real weight; declaring anything else here would
 * make the browser synthesise a fake bold. Headings that ask for 600-900 are
 * rendered by the browser from this single master.
 *
 * `adjustFontFallback: "Times New Roman"` lets Next build a metric-adjusted
 * fallback face, which limits layout shift while the local file loads and also
 * covers the characters Cravelo is missing.
 */
const cravelo = localFont({
  src: "./fonts/Cravelo-DEMO-Regular.otf",
  weight: "400",
  style: "normal",
  variable: "--font-cravelo",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

// Poppins is a STATIC family, so the required weights must be enumerated.
// These are the weights actually present in the codebase.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cravelo.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                cursor: url('http://www.rw-designer.com/cursor-extern.php?id=167731'), auto;
              }
              a, button, [role="button"], input, select, textarea {
                cursor: url('http://www.rw-designer.com/cursor-extern.php?id=167731'), pointer;
              }
            `,
          }}
        />
      </head>
      {/* No font className here — the body font is set once, authoritatively,
          by MuiCssBaseline in lib/theme.ts (TYPOGRAPHY.bodyFont). */}
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}