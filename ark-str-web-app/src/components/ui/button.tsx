import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border px-4 py-2.5 text-sm font-semibold tracking-[-0.012em] shadow-[var(--shadow-sm)] transition duration-[var(--motion-fast)] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:-translate-y-px hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]",
        accent:
          "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] hover:-translate-y-px hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]",
        ghost:
          "border-transparent bg-transparent text-[var(--text)] shadow-none hover:border-[var(--border)] hover:bg-[var(--surface-muted)]",
        subtle:
          "border-[var(--border)] bg-[var(--panel)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]",
      },
      size: {
        default: "h-11",
        sm: "h-9 rounded-[var(--radius-sm)] px-3 text-xs",
        lg: "h-12 px-5 text-sm",
        icon: "h-11 w-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

function Button({ className, size, type = "button", variant, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      data-slot="button"
      type={type}
      {...props}
    />
  );
}

export { Button, buttonVariants };
