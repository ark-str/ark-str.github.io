import type { Metadata } from "next";
import "./globals.css";
import { AppPreferencesProvider } from "@/features/preferences/runtime/app-preferences-context";
import { ReaderSessionProvider } from "@/features/reader/runtime/reader-session-context";
import { StoryNotesProvider } from "@/features/notes/runtime/story-notes-context";
import { ReadProgressProvider } from "@/features/read-progress/runtime/read-progress-context";
import { UiLocaleDocumentSync } from "@/features/i18n/ui/ui-locale-document-sync";
import { browserIconPath } from "@/lib/public-path";

export const metadata: Metadata = {
  title: "ARK STR",
  description: "Editorial archive reading surface for Arknights story content.",
  icons: {
    apple: [{ url: browserIconPath, type: "image/png" }],
    icon: [{ url: browserIconPath, type: "image/png" }],
    shortcut: [{ url: browserIconPath, type: "image/png" }],
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
          <ReaderSessionProvider>
            <UiLocaleDocumentSync />
            <StoryNotesProvider>
              <ReadProgressProvider>{children}</ReadProgressProvider>
            </StoryNotesProvider>
          </ReaderSessionProvider>
        </AppPreferencesProvider>
      </body>
    </html>
  );
}
