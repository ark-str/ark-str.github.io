import * as React from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      className={cn(
        "h-4 w-4 rounded-[calc(var(--radius-sm)-2px)] border border-[var(--border)] bg-[var(--surface)] accent-[var(--accent)] shadow-[var(--shadow-sm)] outline-none transition duration-[var(--motion-fast)] ease-out focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      data-slot="checkbox"
      type="checkbox"
      {...props}
    />
  );
}

export { Checkbox };
