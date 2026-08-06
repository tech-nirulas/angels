"use client";

import { usePathname } from "next/navigation";
import CakesCategoryNav from "./CakesCategoryNav";
import Footer from "./Footer";
import Navbar from "./Navbar";
import FloatingCustomizeCTA from "@/components/ui/FloatingCustomizeCTA";

/** Routes where the full consumer shell (Navbar + CategoryNav + Footer) is suppressed. */
const AUTH_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];

/** Routes where the CategoryNav is hidden (auth pages) */
function isAuthPage(pathname: string): boolean {
  return AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Routes where the FloatingCTA must NOT appear */
function shouldHideCTA(pathname: string): boolean {
  return pathname === "/customize" || isAuthPage(pathname);
}

interface SiteShellProps {
  children: React.ReactNode;
}

export default function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const isAuth = isAuthPage(pathname);

  return (
    <>
      {/* Global Navbar — always visible on all pages */}
      <Navbar />

      {/* Category sub-bar — only on consumer (non-auth) pages */}
      {!isAuth && <CakesCategoryNav />}

      {/* Page content */}
      <main style={{ flex: 1, minHeight: "calc(100vh - 64px)" }}>{children}</main>

      {/* Global Footer — only on consumer pages */}
      {!isAuth && <Footer />}

      {/* Global floating CTA — visible everywhere except /customize and auth pages */}
      {!shouldHideCTA(pathname) && <FloatingCustomizeCTA />}
    </>
  );
}
