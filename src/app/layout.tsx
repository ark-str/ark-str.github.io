import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARK STR",
  description: "Root-first bootstrap for the Arknights story reader.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
