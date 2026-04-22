"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DisclosureCardProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  dataStorylineId: string;
  summary: React.ReactNode;
  testId: string;
};

export function DisclosureCard({
  children,
  className,
  contentClassName,
  dataStorylineId,
  summary,
  testId,
}: DisclosureCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const panelId = React.useId();
  const toggle = () => setIsOpen((current) => !current);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    toggle();
  };

  return (
    <Card
      className={cn(
        "overflow-hidden bg-[var(--surface)]/95 transition-[grid-column] duration-300 ease-out",
        "md:data-[state=open]:col-span-2 xl:data-[state=open]:col-span-3",
        className,
      )}
      data-state={isOpen ? "open" : "closed"}
      data-storyline-id={dataStorylineId}
      data-testid={testId}
    >
      <div
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="grid w-full cursor-pointer grid-cols-[1fr_auto] gap-4 p-6 text-left"
        data-testid="storyline-toggle"
        onClick={toggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        <span className="min-w-0">{summary}</span>
        <span
          aria-hidden="true"
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)] text-lg font-semibold text-[var(--text-muted)] transition-transform duration-300 ease-out",
            isOpen && "rotate-45",
          )}
        >
          +
        </span>
      </div>
      <div
        aria-hidden={!isOpen}
        className={cn(
          "grid overflow-hidden border-t transition-[grid-template-rows,opacity,border-color] duration-300 ease-out",
          isOpen ? "border-[var(--border)] opacity-100" : "border-transparent opacity-0",
        )}
        data-state={isOpen ? "open" : "closed"}
        data-testid="storyline-panel"
        id={panelId}
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <CardContent className={cn("grid gap-2 pt-4", contentClassName)} data-testid="storyline-item-grid">
            {children}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
