import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative" data-slot="select-root">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 pr-11 text-sm tracking-[-0.012em] text-[var(--text)] shadow-[var(--shadow-sm)] outline-none transition duration-[var(--motion-fast)] ease-out focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        data-slot="select"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
      />
    </div>
  );
}

export { Select };
