import { GOOGLE_AI_STUDIO_SUMMARY_ENDPOINT } from "@/features/ai-summary/config/google-ai-studio";
import { extractGeminiSummaryText } from "@/features/ai-summary/service/extract-gemini-summary";
import { READER_LOCALE_LABELS } from "@/features/content/config/canonical-reader-locales";
import type { ReaderLocale } from "@/features/content/types";

type SummarizeStoryInput = {
  apiKey: string;
  locale: ReaderLocale;
  storyText: string;
  storyTitle: string;
};

const SUMMARY_SECTION_HEADINGS = {
  cn: {
    characters: "登场人物（含别名）",
    events: "主要内容",
    final: "最终摘要",
  },
  en: {
    characters: "Characters (including aliases)",
    events: "Key events",
    final: "Final summary",
  },
  jp: {
    characters: "登場人物（別名を含む）",
    events: "主な内容",
    final: "最終要約",
  },
  kr: {
    characters: "등장인물(이명 포함)",
    events: "주요 내용",
    final: "최종 요약",
  },
  tw: {
    characters: "登場人物（含別名）",
    events: "主要內容",
    final: "最終摘要",
  },
} satisfies Record<ReaderLocale, { characters: string; events: string; final: string }>;

function createSummaryPrompt({ locale, storyText, storyTitle }: Omit<SummarizeStoryInput, "apiKey">) {
  const localeLabel = READER_LOCALE_LABELS[locale].label;
  const headings = SUMMARY_SECTION_HEADINGS[locale];

  return [
    `Summarize this Arknights story in ${localeLabel}.`,
    "Return Markdown only. Use exactly these level-2 headings in this order:",
    `## ${headings.characters}`,
    `## ${headings.events}`,
    `## ${headings.final}`,
    "Under the characters section, list important named characters as bullets and include aliases, titles, or codenames when the story text clearly provides them.",
    "Under the key events section, summarize the plot, conflict, important character decisions, and outcome as concise bullets.",
    "Under the final summary section, write a short paragraph useful for a returning reader.",
    "Do not invent details that are not supported by the story text.",
    "",
    `Title: ${storyTitle}`,
    "",
    "Story text:",
    storyText,
  ].join("\n");
}

export async function summarizeStoryWithGemini({
  apiKey,
  locale,
  storyText,
  storyTitle,
}: SummarizeStoryInput): Promise<string> {
  const response = await fetch(GOOGLE_AI_STUDIO_SUMMARY_ENDPOINT, {
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: createSummaryPrompt({ locale, storyText, storyTitle }),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    }),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Gemini API request failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();
  const summary = extractGeminiSummaryText(payload);

  if (!summary) {
    throw new Error("Gemini API response did not include summary text.");
  }

  return summary;
}
