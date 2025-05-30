"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/lib/translation-context";
// import { TranslationProvider } from "./context/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <LanguageProvider>
        {children}
        <Toaster />
      </LanguageProvider>
    </NextThemesProvider>
  );
}
