import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARK STR | Agentic Frontend Harness",
  description:
    "Single-page Next.js starter tuned for bundled resources, localStorage persistence, and autonomous Codex iterations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
