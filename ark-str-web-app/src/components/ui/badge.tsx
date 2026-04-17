import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-sm)] border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        default: "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]",
        accent: "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]",
        contrast:
          "border-[var(--accent-strong)] bg-[var(--accent-strong)] text-[var(--accent-contrast)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} data-slot="badge" {...props} />;
}

export { Badge, badgeVariants };
