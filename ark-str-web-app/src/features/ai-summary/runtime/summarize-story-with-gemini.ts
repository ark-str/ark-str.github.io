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

function createSummaryPrompt({ locale, storyText, storyTitle }: Omit<SummarizeStoryInput, "apiKey">) {
  const localeLabel = READER_LOCALE_LABELS[locale].label;

  return [
    `Summarize this Arknights story in ${localeLabel}.`,
    "Focus on the plot, conflict, important character decisions, and outcome.",
    "Keep the summary concise, specific, and useful for a returning reader.",
    "Return Markdown with short headings and bullet points when helpful.",
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
        temperature: 0.2,
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
