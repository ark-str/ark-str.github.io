export type AiSummaryInline =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "strong";
      text: string;
    }
  | {
      type: "emphasis";
      text: string;
    }
  | {
      type: "code";
      text: string;
    };

export type AiSummaryMarkdownBlock =
  | {
      type: "heading";
      level: 2 | 3;
      content: AiSummaryInline[];
    }
  | {
      type: "paragraph";
      content: AiSummaryInline[];
    }
  | {
      type: "list";
      ordered: boolean;
      items: AiSummaryInline[][];
    }
  | {
      type: "code";
      text: string;
    };

function parseInline(text: string): AiSummaryInline[] {
  const tokens: AiSummaryInline[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const remaining = text.slice(cursor);
    const match = remaining.match(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/);

    if (!match || match.index === undefined) {
      tokens.push({ type: "text", text: remaining });
      break;
    }

    if (match.index > 0) {
      tokens.push({ type: "text", text: remaining.slice(0, match.index) });
    }

    const value = match[0];
    if (value.startsWith("`")) {
      tokens.push({ type: "code", text: value.slice(1, -1) });
    } else if (value.startsWith("**")) {
      tokens.push({ type: "strong", text: value.slice(2, -2) });
    } else {
      tokens.push({ type: "emphasis", text: value.slice(1, -1) });
    }

    cursor += match.index + value.length;
  }

  return tokens.filter((token) => token.text.length > 0);
}

function flushParagraph(blocks: AiSummaryMarkdownBlock[], lines: string[]) {
  const text = lines.join(" ").trim();
  if (text.length > 0) {
    blocks.push({
      type: "paragraph",
      content: parseInline(text),
    });
  }
  lines.length = 0;
}

function flushList(
  blocks: AiSummaryMarkdownBlock[],
  listState: { ordered: boolean; items: string[] } | null,
) {
  if (!listState || listState.items.length === 0) {
    return;
  }

  blocks.push({
    type: "list",
    ordered: listState.ordered,
    items: listState.items.map((item) => parseInline(item)),
  });
}

export function parseAiSummaryMarkdown(markdown: string): AiSummaryMarkdownBlock[] {
  const blocks: AiSummaryMarkdownBlock[] = [];
  const paragraphLines: string[] = [];
  let listState: { ordered: boolean; items: string[] } | null = null;
  let codeLines: string[] | null = null;

  for (const rawLine of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trimEnd();

    if (line.trimStart().startsWith("```")) {
      flushParagraph(blocks, paragraphLines);
      flushList(blocks, listState);
      listState = null;

      if (codeLines) {
        blocks.push({ type: "code", text: codeLines.join("\n") });
        codeLines = null;
      } else {
        codeLines = [];
      }
      continue;
    }

    if (codeLines) {
      codeLines.push(rawLine);
      continue;
    }

    if (line.trim().length === 0) {
      flushParagraph(blocks, paragraphLines);
      flushList(blocks, listState);
      listState = null;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph(blocks, paragraphLines);
      flushList(blocks, listState);
      listState = null;
      blocks.push({
        type: "heading",
        level: headingMatch[1].length === 1 ? 2 : 3,
        content: parseInline(headingMatch[2].trim()),
      });
      continue;
    }

    const unorderedMatch = line.match(/^\s*[-*]\s+(.+)$/);
    const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
    const listMatch = unorderedMatch ?? orderedMatch;
    if (listMatch) {
      flushParagraph(blocks, paragraphLines);
      const ordered = Boolean(orderedMatch);
      if (!listState || listState.ordered !== ordered) {
        flushList(blocks, listState);
        listState = { ordered, items: [] };
      }
      listState.items.push(listMatch[1].trim());
      continue;
    }

    flushList(blocks, listState);
    listState = null;
    paragraphLines.push(line.trim());
  }

  flushParagraph(blocks, paragraphLines);
  flushList(blocks, listState);

  if (codeLines && codeLines.length > 0) {
    blocks.push({ type: "code", text: codeLines.join("\n") });
  }

  return blocks;
}
