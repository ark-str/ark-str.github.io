import { LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LoadingIndicatorProps = {
  className?: string;
  label?: string;
};

function LoadingIndicator({ className, label = "로딩 중" }: LoadingIndicatorProps) {
  return (
    <span
      aria-label={label}
      className={cn("inline-flex items-center justify-center text-[var(--accent-strong)]", className)}
      data-testid="loading-indicator"
      role="status"
    >
      <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
    </span>
  );
}

function LoadingStateCard({ className, label }: LoadingIndicatorProps) {
  return (
    <Card className={cn("bg-[var(--surface)]/94", className)}>
      <CardContent className="flex min-h-24 items-center justify-center px-5 py-6">
        <LoadingIndicator label={label} />
      </CardContent>
    </Card>
  );
}

export { LoadingIndicator, LoadingStateCard };
