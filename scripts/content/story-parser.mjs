function getAttributeValue(line, attribute) {
  const match = new RegExp(`${attribute}="([^"]*)"`, "i").exec(line);

  return match ? match[1] : null;
}

function getLooseAttributeValue(line, attribute) {
  const match = new RegExp(`${attribute}=(?:"([^"]*)"|([^,\\)]*))`, "i").exec(line);

  return match ? (match[1] ?? match[2] ?? "").trim() : null;
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

function parseCharacterSlots(rawAttributes) {
  if (!rawAttributes) {
    return [];
  }

  const slots = [];
  const pattern = /name(\d*)="([^"]*)"/gi;
  let match = pattern.exec(rawAttributes);

  while (match) {
    const slotIndex = match[1] ? Number.parseInt(match[1], 10) : 1;
    if (Number.isFinite(slotIndex) && slotIndex > 0) {
      slots.push({
        slotIndex,
        token: match[2].trim(),
      });
    }
    match = pattern.exec(rawAttributes);
  }

  return slots
    .filter((slot) => slot.token.length > 0)
    .sort((left, right) => left.slotIndex - right.slotIndex);
}

function resolveFocusedSpeakerToken(rawAttributes) {
  if (!rawAttributes) {
    return null;
  }

  const slots = parseCharacterSlots(rawAttributes);
  if (slots.length === 0) {
    return null;
  }

  if (slots.length === 1) {
    return slots[0].token;
  }

  const focusValue = Number.parseInt(getLooseAttributeValue(rawAttributes, "focus") ?? "1", 10);
  const focusIndex = Number.isFinite(focusValue) && focusValue > 0 ? focusValue : 1;

  return slots[focusIndex - 1]?.token ?? slots[0].token;
}

export function normalizeOperatorIdToken(rawToken) {
  if (typeof rawToken !== "string" || !rawToken.startsWith("char_")) {
    return null;
  }

  const strippedToken = rawToken.split(/[#$]/, 1)[0]?.trim();
  if (!strippedToken) {
    return null;
  }

  const segments = strippedToken.split("_").filter(Boolean);
  if (segments[0] !== "char" || segments.length < 3) {
    return null;
  }

  return segments.slice(0, Math.min(3, segments.length)).join("_");
}

function resolveDialogueSpeaker(line, parserState) {
  const dialogueMatch = /^\[name="([^"]+)"\]\s*(.*)$/i.exec(line);
  if (!dialogueMatch) {
    return null;
  }

  const speakerName = dialogueMatch[1].trim();
  const text = dialogueMatch[2]?.trim();
  if (!text) {
    return [];
  }

  const knownSpeakerBinding = parserState.speakerBindings.get(speakerName) ?? null;
  const speakerToken = parserState.activeSpeakerToken ?? knownSpeakerBinding?.speakerToken ?? null;
  const operatorId =
    speakerToken !== null ? normalizeOperatorIdToken(speakerToken) : knownSpeakerBinding?.operatorId ?? null;

  const block = {
    type: "dialogue",
    speakerName,
    speakerToken,
    operatorId,
    portraitKey: operatorId,
    text,
  };

  if (speakerToken !== null) {
    parserState.speakerBindings.set(speakerName, {
      speakerToken,
      operatorId,
    });
  }

  return [block];
}

function consumeCharacterTag(remainder, parserState) {
  const characterMatch = /^\[(?:Character|character)(?:\(([^\]]*)\))?\]\s*(.*)$/i.exec(remainder);
  if (!characterMatch) {
    return null;
  }

  parserState.activeSpeakerToken = resolveFocusedSpeakerToken(characterMatch[1] ?? null);
  return characterMatch[2]?.trim() ?? "";
}

function extractVisibleBlocks(line, parserState) {
  let remainder = line.trim();
  const blocks = [];

  while (remainder.startsWith("[")) {
    const dialogueBlocks = resolveDialogueSpeaker(remainder, parserState);
    if (dialogueBlocks) {
      blocks.push(...dialogueBlocks);
      return blocks;
    }

    const characterRemainder = consumeCharacterTag(remainder, parserState);
    if (characterRemainder !== null) {
      remainder = characterRemainder;
      if (!remainder) {
        return blocks;
      }
      continue;
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
  const parserState = {
    activeSpeakerToken: null,
    speakerBindings: new Map(),
  };

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

    const visibleBlocks = extractVisibleBlocks(line, parserState);
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

function collectObservedOperatorsFromBlocks(blocks, accumulator) {
  for (const block of blocks) {
    if (block.type === "dialogue") {
      if (!block.operatorId) {
        continue;
      }

      const current =
        accumulator.get(block.operatorId) ??
        {
          aliases: new Set(),
          speakerTokens: new Set(),
        };

      current.aliases.add(block.speakerName);
      if (block.speakerToken) {
        current.speakerTokens.add(block.speakerToken);
      }

      accumulator.set(block.operatorId, current);
      continue;
    }

    if (block.type !== "choice") {
      continue;
    }

    for (const option of block.options) {
      collectObservedOperatorsFromBlocks(option.blocks, accumulator);
    }

    collectObservedOperatorsFromBlocks(block.sharedBlocks, accumulator);
  }
}

export function collectObservedOperators(blocks) {
  const accumulator = new Map();
  collectObservedOperatorsFromBlocks(blocks, accumulator);

  return [...accumulator.entries()]
    .map(([operatorId, value]) => ({
      operatorId,
      aliases: [...value.aliases].sort((left, right) => left.localeCompare(right)),
      speakerTokens: [...value.speakerTokens].sort((left, right) => left.localeCompare(right)),
    }))
    .sort((left, right) => left.operatorId.localeCompare(right.operatorId));
}
