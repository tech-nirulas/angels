// app/providers.tsx
"use client";

import { ModalProvider } from "@/lib/ModalProvider";
import ReduxProvider from "@/lib/ReduxProvider";
import ThemeRegistry from "@/lib/ThemeRegistry";
import { ToastProvider } from "@/lib/ToastProvider";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeRegistry>
        <AuthProvider>
          <ToastProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeRegistry>
    </ReduxProvider>
  );
}