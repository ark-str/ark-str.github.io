"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DisclosureCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  children: React.ReactNode;
  contentClassName?: string;
  contentTestId?: string;
  defaultOpen?: boolean;
  panelTestId?: string;
  summary: React.ReactNode;
  toggleTestId?: string;
};

export function DisclosureCard({
  children,
  className,
  contentClassName,
  contentTestId,
  defaultOpen = false,
  panelTestId,
  summary,
  toggleTestId,
  ...props
}: DisclosureCardProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
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
        "overflow-hidden bg-[var(--surface)]/95",
        className,
      )}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      <div
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="grid w-full cursor-pointer grid-cols-[1fr_auto] gap-4 p-6 text-left"
        data-testid={toggleTestId}
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
        data-testid={panelTestId}
        id={panelId}
        inert={!isOpen ? true : undefined}
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <CardContent className={cn("flex flex-col gap-2 pt-4", contentClassName)} data-testid={contentTestId}>
            {children}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
