import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StoryClassificationBadgesProps = {
  avgTag?: string | null;
  className?: string;
  compact?: boolean;
  phaseTestId?: string;
  stageTestId?: string;
  storyCode?: string | null;
  testId?: string;
};

function StoryClassificationBadges({
  avgTag,
  className,
  compact = false,
  phaseTestId = "story-phase-badge",
  stageTestId = "story-stage-badge",
  storyCode,
  testId,
}: StoryClassificationBadgesProps) {
  const normalizedStoryCode = storyCode?.trim();
  const normalizedAvgTag = avgTag?.trim();
  const badgeClassName = compact ? "px-2 py-0.5 text-[10px] tracking-[0.12em]" : undefined;

  if (!normalizedStoryCode && !normalizedAvgTag) {
    return null;
  }

  return (
    <span className={cn("flex flex-wrap gap-1.5", className)} data-testid={testId}>
      {normalizedStoryCode ? (
        <Badge className={badgeClassName} data-testid={stageTestId} variant="contrast">
          {normalizedStoryCode}
        </Badge>
      ) : null}
      {normalizedAvgTag ? (
        <Badge className={badgeClassName} data-testid={phaseTestId} variant="accent">
          {normalizedAvgTag}
        </Badge>
      ) : null}
    </span>
  );
}

export { StoryClassificationBadges };
