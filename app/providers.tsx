"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./useTheme";
import { LangProvider } from "./useI18n";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LangProvider>{children}</LangProvider>
    </ThemeProvider>
  );
}