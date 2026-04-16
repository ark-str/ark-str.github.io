import type { Metadata } from "next";
import "./globals.css";
import { AppPreferencesProvider } from "@/features/preferences/runtime/app-preferences-context";

export const metadata: Metadata = {
  title: "ARK STR",
  description: "Editorial archive reading surface for Arknights story content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full" data-theme="light">
      <body className="min-h-full">
        <AppPreferencesProvider>{children}</AppPreferencesProvider>
      </body>
    </html>
  );
}
