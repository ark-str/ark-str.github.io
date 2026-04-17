import { FloatingAppBar } from "@/components/layout/floating-app-bar";
import type { FloatingAppBarModel } from "@/components/layout/types";

type ReaderPageFrameProps = {
  appBar: FloatingAppBarModel;
  children: React.ReactNode;
  header: React.ReactNode;
  testId: string;
};

export function ReaderPageFrame({ appBar, children, header, testId }: ReaderPageFrameProps) {
  return (
    <main
      className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-6 text-[var(--text)] md:px-8 lg:px-12"
      data-testid={testId}
    >
      <FloatingAppBar model={appBar} />
      {header}
      {children}
    </main>
  );
}
