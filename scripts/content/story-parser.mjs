function getAttributeValue(line, attribute) {
  const match = new RegExp(`${attribute}="([^"]*)"`, "i").exec(line);

  return match ? match[1] : null;
}

function splitDelimitedList(value) {
  return (value ?? "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function pushVisibleBlock(target, block) {
  if (block.type === "sceneBreak") {
    if (target.length === 0 || target.at(-1).type === "sceneBreak") {
      return;
    }
  }

  if (block.type === "narration" && target.at(-1)?.type === "narration") {
    target[target.length - 1] = {
      type: "narration",
      text: `${target.at(-1).text}\n${block.text}`,
    };
    return;
  }

  target.push(block);
}

function parseDecisionLine(line) {
  if (!line.startsWith("[Decision(")) {
    return null;
  }

  const options = splitDelimitedList(getAttributeValue(line, "options"));
  const values = splitDelimitedList(getAttributeValue(line, "values"));

  if (options.length === 0) {
    return null;
  }

  return {
    type: "choice",
    options: options.map((label, index) => ({
      label,
      value: values[index] ?? String(index + 1),
      blocks: [],
    })),
    sharedBlocks: [],
  };
}

function parsePredicateLine(line) {
  if (!line.startsWith("[Predicate(")) {
    return null;
  }

  return {
    references: splitDelimitedList(getAttributeValue(line, "references")),
  };
}

function extractVisibleBlocks(line) {
  let remainder = line.trim();
  const blocks = [];

  while (remainder.startsWith("[")) {
    const dialogueMatch = /^\[name="([^"]+)"\]\s*(.*)$/i.exec(remainder);

    if (dialogueMatch) {
      const text = dialogueMatch[2]?.trim();
      if (text) {
        blocks.push({
          type: "dialogue",
          speakerName: dialogueMatch[1].trim(),
          text,
          portraitKey: null,
        });
      }
      return blocks;
    }

    const dialogBreakMatch = /^\[(?:Dialog|dialog)(?:\([^\]]*\))?\]\s*(.*)$/i.exec(remainder);
    if (dialogBreakMatch) {
      blocks.push({ type: "sceneBreak" });
      remainder = dialogBreakMatch[1]?.trim() ?? "";
      if (!remainder) {
        return blocks;
      }
      continue;
    }

    const genericTagMatch = /^\[[^\]]+\]\s*(.*)$/i.exec(remainder);
    if (!genericTagMatch) {
      break;
    }

    remainder = genericTagMatch[1]?.trim() ?? "";
    if (!remainder) {
      return blocks;
    }
  }

  if (remainder.length > 0) {
    blocks.push({
      type: "narration",
      text: remainder,
    });
  }

  return blocks;
}

function flushPredicate(currentChoice, predicateCollector) {
  if (!currentChoice || !predicateCollector) {
    return null;
  }

  if (predicateCollector.blocks.length === 0) {
    return null;
  }

  const optionValues = currentChoice.options.map((option) => option.value);
  const uniqueReferences = [...new Set(predicateCollector.references)];
  const isShared =
    uniqueReferences.length === optionValues.length &&
    uniqueReferences.every((reference) => optionValues.includes(reference));

  if (isShared) {
    for (const block of predicateCollector.blocks) {
      pushVisibleBlock(currentChoice.sharedBlocks, block);
    }
    return null;
  }

  for (const option of currentChoice.options) {
    if (!uniqueReferences.includes(option.value)) {
      continue;
    }

    for (const block of predicateCollector.blocks) {
      pushVisibleBlock(option.blocks, block);
    }
  }

  return null;
}

export function parseStoryText(rawText) {
  const lines = rawText.replace(/^\uFEFF/, "").split(/\r?\n/);
  const blocks = [];
  let currentChoice = null;
  let currentPredicate = null;

  function flushChoice() {
    if (!currentChoice) {
      return;
    }

    flushPredicate(currentChoice, currentPredicate);
    currentPredicate = null;
    blocks.push(currentChoice);
    currentChoice = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    const decision = parseDecisionLine(line);
    if (decision) {
      flushChoice();
      currentChoice = decision;
      currentPredicate = null;
      continue;
    }

    const predicate = parsePredicateLine(line);
    if (predicate) {
      if (!currentChoice) {
        continue;
      }

      flushPredicate(currentChoice, currentPredicate);
      currentPredicate = {
        references: predicate.references,
        blocks: [],
      };
      continue;
    }

    const visibleBlocks = extractVisibleBlocks(line);
    if (visibleBlocks.length === 0) {
      continue;
    }

    const target = currentChoice && currentPredicate ? currentPredicate.blocks : blocks;
    for (const block of visibleBlocks) {
      pushVisibleBlock(target, block);
    }
  }

  flushChoice();

  return blocks;
}
