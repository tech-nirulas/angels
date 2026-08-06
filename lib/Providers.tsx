// app/providers.tsx
"use client";

import { ModalProvider } from "@/lib/ModalProvider";
import ReduxProvider from "@/lib/ReduxProvider";
import ThemeRegistry from "@/lib/ThemeRegistry";
import { ToastProvider } from "@/lib/ToastProvider";
import SiteShell from "@/components/layout/SiteShell";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeRegistry>
        <AuthProvider>
          <ToastProvider>
            <ModalProvider>
              <SiteShell>{children}</SiteShell>
            </ModalProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeRegistry>
    </ReduxProvider>
  );
}