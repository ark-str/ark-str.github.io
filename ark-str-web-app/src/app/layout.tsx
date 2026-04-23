import type { Metadata } from "next";
import "./globals.css";
import { AppPreferencesProvider } from "@/features/preferences/runtime/app-preferences-context";
import { ReaderSessionProvider } from "@/features/reader/runtime/reader-session-context";
import { appIconPath } from "@/lib/public-path";

export const metadata: Metadata = {
  title: "ARK STR",
  description: "Editorial archive reading surface for Arknights story content.",
  icons: {
    apple: [{ url: appIconPath, type: "image/png" }],
    icon: [{ url: appIconPath, type: "image/png" }],
    shortcut: [{ url: appIconPath, type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full" data-theme="light">
      <body className="min-h-full">
        <AppPreferencesProvider>
          <ReaderSessionProvider>{children}</ReaderSessionProvider>
        </AppPreferencesProvider>
      </body>
    </html>
  );
}
