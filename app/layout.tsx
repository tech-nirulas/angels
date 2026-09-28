import { Providers } from "@/lib/Providers";
import type { Metadata } from "next";
import { Fraunces, Poppins } from "next/font/google";
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
 * Using `variable` puts each family on :root, and lib/theme.ts is the
 * single authority that decides which role each one fills.
 *
 * Display font: Fraunces (warm, artisanal serif with full glyph coverage)
 * Body font: Poppins (clean, modern geometric sans)
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// Poppins is a STATIC family, so the required weights must be enumerated.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${poppins.variable}`}>
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