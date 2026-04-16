import { Separator } from "@/components/ui/separator";
import type { StoryBlock } from "@/features/content/types";

function StoryBlocks({ blocks }: { blocks: StoryBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "dialogue") {
          return (
            <article
              key={`dialogue-${index}`}
              className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]/95 p-4 md:grid-cols-[72px_minmax(0,1fr)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--accent-soft)] font-[var(--font-display)] text-sm font-semibold uppercase text-[var(--accent-strong)]">
                  {block.speakerName.slice(0, 2)}
                </div>
                <div className="pt-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Dialogue
                  </p>
                  <h3 className="text-lg font-semibold text-[var(--text)]">{block.speakerName}</h3>
                </div>
              </div>
              <p className="max-w-[72ch] whitespace-pre-wrap text-base leading-8 text-[var(--text)]">
                {block.text}
              </p>
            </article>
          );
        }

        if (block.type === "narration") {
          return (
            <article
              key={`narration-${index}`}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5"
            >
              <p className="max-w-[72ch] whitespace-pre-wrap font-[var(--font-display)] text-lg leading-8 text-[var(--text)]">
                {block.text}
              </p>
            </article>
          );
        }

        if (block.type === "sceneBreak") {
          return (
            <div key={`scene-break-${index}`} className="flex items-center gap-4 py-1">
              <Separator className="flex-1" />
              <span className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Scene break
              </span>
              <Separator className="flex-1" />
            </div>
          );
        }

        return (
          <article
            key={`choice-${index}`}
            className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]/96 p-5"
            data-testid="choice-block"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                Doctor choice
              </p>
              <h3 className="text-2xl font-semibold text-[var(--text)]">Available responses</h3>
            </div>
            <div className="mt-5 grid gap-4">
              {block.options.map((option) => (
                <section
                  key={option.value}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4"
                >
                  <p className="text-sm font-semibold text-[var(--accent)]">{option.label}</p>
                  <div className="mt-3 grid gap-3">
                    {option.blocks.length > 0 ? (
                      <StoryBlocks blocks={option.blocks} />
                    ) : (
                      <p className="text-sm leading-6 text-[var(--text-muted)]">
                        이 선택지에 매핑된 후속 대사가 아직 정규화되지 않았습니다.
                      </p>
                    )}
                  </div>
                </section>
              ))}
            </div>
            {block.sharedBlocks.length > 0 ? (
              <section className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Shared response
                </p>
                <div className="mt-3 grid gap-3">
                  <StoryBlocks blocks={block.sharedBlocks} />
                </div>
              </section>
            ) : null}
          </article>
        );
      })}
    </>
  );
}

export function StoryBodyRenderer({ blocks }: { blocks: StoryBlock[] }) {
  return <div className="grid gap-4" data-testid="story-body"><StoryBlocks blocks={blocks} /></div>;
}
