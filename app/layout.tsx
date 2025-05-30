import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { LanguageProvider } from "@/lib/translation-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "त्रyana",
  description: "Comprehensive disaster response coordination system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <LanguageProvider> */}
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
      {/* </LanguageProvider> */}
    </html>
  );
}
