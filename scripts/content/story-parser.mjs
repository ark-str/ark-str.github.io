function getAttributeValue(line, attribute) {
  const match = new RegExp(`${attribute}\\s*=\\s*"([^"]*)"`, "i").exec(line);

  return match ? match[1] : null;
}

function getLooseAttributeValue(line, attribute) {
  const match = new RegExp(
    `${attribute}\\s*=\\s*(?:"([^"]*)"|([^,\\)]*))`,
    "i",
  ).exec(line);

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

function normalizeBackgroundId(rawBackgroundId) {
  const backgroundId = typeof rawBackgroundId === "string" ? rawBackgroundId.trim() : "";
  if (!backgroundId) {
    return null;
  }

  return backgroundId.replace(/\.(png|jpe?g|webp)$/i, "");
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

function stripSpeakerToken(rawToken) {
  if (typeof rawToken !== "string") {
    return null;
  }

  const strippedToken = rawToken.split(/[#$]/, 1)[0]?.trim();
  if (!strippedToken) {
    return null;
  }

  return strippedToken;
}

export function normalizeSpeakerIdToken(rawToken) {
  const strippedToken = stripSpeakerToken(rawToken);
  if (!strippedToken) {
    return null;
  }

  if (strippedToken.startsWith("char_")) {
    const segments = strippedToken.split("_").filter(Boolean);
    if (segments[0] !== "char" || segments.length < 3) {
      return null;
    }

    return segments.slice(0, Math.min(3, segments.length)).join("_");
  }

  return strippedToken;
}

function parseNumericPriority(rawFocusValue) {
  if (rawFocusValue === null || rawFocusValue === "") {
    return 0;
  }

  const priority = Number.parseFloat(rawFocusValue);
  return Number.isFinite(priority) ? priority : 0;
}

function normalizeSlotKey(rawSlotValue) {
  const rawSlot = rawSlotValue?.trim().toLowerCase();
  if (!rawSlot) {
    return null;
  }

  if (["l", "left"].includes(rawSlot)) {
    return "l";
  }

  if (["r", "right"].includes(rawSlot)) {
    return "r";
  }

  if (["m", "mid", "middle", "c", "center"].includes(rawSlot)) {
    return "m";
  }

  return rawSlot;
}

function resolveUniformSpeakerId(slots) {
  const normalizedSpeakerIds = slots.map((slot) => normalizeSpeakerIdToken(slot.token));
  const uniqueSpeakerIds = [...new Set(normalizedSpeakerIds.filter(Boolean))];

  if (uniqueSpeakerIds.length !== 1) {
    return null;
  }

  return uniqueSpeakerIds[0] ?? null;
}

function resolveCharacterSpeakerId(rawAttributes) {
  if (!rawAttributes) {
    return null;
  }

  const slots = parseCharacterSlots(rawAttributes);
  if (slots.length === 0) {
    return null;
  }

  if (slots.length === 1) {
    return normalizeSpeakerIdToken(slots[0].token);
  }

  const uniformSpeakerId = resolveUniformSpeakerId(slots);
  if (uniformSpeakerId) {
    return uniformSpeakerId;
  }

  const focusValue = parseNumericPriority(getLooseAttributeValue(rawAttributes, "focus"));
  if (!Number.isInteger(focusValue) || focusValue <= 0) {
    return null;
  }

  return normalizeSpeakerIdToken(slots[focusValue - 1]?.token ?? null);
}

function resolveCharslotPriority(rawFocusValue, slotKey) {
  if (rawFocusValue === null || rawFocusValue === "") {
    return 0;
  }

  const numericPriority = Number.parseFloat(rawFocusValue);
  if (Number.isFinite(numericPriority)) {
    return numericPriority;
  }

  const normalizedFocus = normalizeSlotKey(rawFocusValue);
  if (["n", "none", "all"].includes(rawFocusValue.trim().toLowerCase())) {
    return -1;
  }

  if (normalizedFocus === null) {
    return 0;
  }

  return normalizedFocus === slotKey ? 1 : -1;
}

function isNeutralCharslotFocus(rawFocusValue) {
  if (typeof rawFocusValue !== "string") {
    return false;
  }

  return ["n", "none", "all"].includes(rawFocusValue.trim().toLowerCase());
}

function createFrame(parserState, source, key, speakerId, priority) {
  parserState.frameClock += 1;

  return {
    source,
    key,
    speakerId,
    priority,
    updatedAt: parserState.frameClock,
  };
}

function getActiveFrames(parserState) {
  return [
    ...parserState.cutins.values(),
    ...(parserState.characterFrame ? [parserState.characterFrame] : []),
    ...parserState.charslots.values(),
  ];
}

function resolveWinningFrame(parserState) {
  const activeFrames = getActiveFrames(parserState).filter((frame) => frame.priority >= 0);

  return activeFrames.reduce((winningFrame, candidateFrame) => {
    if (!winningFrame) {
      return candidateFrame;
    }

    if (candidateFrame.priority !== winningFrame.priority) {
      return candidateFrame.priority > winningFrame.priority ? candidateFrame : winningFrame;
    }

    if (candidateFrame.updatedAt !== winningFrame.updatedAt) {
      return candidateFrame.updatedAt > winningFrame.updatedAt ? candidateFrame : winningFrame;
    }

    return winningFrame;
  }, null);
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
  const hasActiveFrame = getActiveFrames(parserState).length > 0;
  const winningFrame = resolveWinningFrame(parserState);
  const speakerId = winningFrame ? winningFrame.speakerId : hasActiveFrame ? null : knownSpeakerBinding;

  const block = {
    type: "dialogue",
    speakerName,
    speakerId,
    isRemote: winningFrame?.source === "cutin",
    text,
  };

  if (winningFrame && speakerId !== null) {
    parserState.speakerBindings.set(speakerName, speakerId);
  }

  return [block];
}

function consumeBackgroundTag(remainder) {
  const backgroundMatch = /^\[Background(?:\(([^\]]*)\))?\]\s*(.*)$/i.exec(remainder);
  if (!backgroundMatch) {
    return null;
  }

  const rawAttributes = backgroundMatch[1] ?? null;
  const backgroundId = normalizeBackgroundId(getLooseAttributeValue(rawAttributes, "image"));

  return {
    blocks: backgroundId
      ? [
          {
            type: "background",
            backgroundId,
          },
        ]
      : [],
    remainder: backgroundMatch[2]?.trim() ?? "",
  };
}

function consumeCharacterCutinTag(remainder, parserState) {
  const cutinMatch = /^\[CharacterCutin(?:\(([^\]]*)\))?\]\s*(.*)$/i.exec(remainder);
  if (!cutinMatch) {
    return null;
  }

  const rawAttributes = cutinMatch[1] ?? null;
  const widgetId = getLooseAttributeValue(rawAttributes, "widgetID");
  const speakerToken = getLooseAttributeValue(rawAttributes, "name");

  if (widgetId) {
    if (speakerToken) {
      parserState.cutins.set(
        widgetId,
        createFrame(
          parserState,
          "cutin",
          widgetId,
          normalizeSpeakerIdToken(speakerToken),
          0,
        ),
      );
    } else {
      parserState.cutins.delete(widgetId);
    }
  }

  return cutinMatch[2]?.trim() ?? "";
}

function consumeCharacterTag(remainder, parserState) {
  const characterMatch = /^\[(?:Character|character)(?:\(([^\]]*)\))?\]\s*(.*)$/i.exec(remainder);
  if (!characterMatch) {
    return null;
  }

  const rawAttributes = characterMatch[1] ?? null;
  const slots = parseCharacterSlots(rawAttributes);

  if (slots.length === 0) {
    parserState.characterFrame = null;
    return characterMatch[2]?.trim() ?? "";
  }

  parserState.characterFrame = createFrame(
    parserState,
    "character",
    "character",
    resolveCharacterSpeakerId(rawAttributes),
    parseNumericPriority(getLooseAttributeValue(rawAttributes, "focus")),
  );

  return characterMatch[2]?.trim() ?? "";
}

function consumeCharslotTag(remainder, parserState) {
  const charslotMatch = /^\[charslot(?:\(([^\]]*)\))?\]\s*(.*)$/i.exec(remainder);
  if (!charslotMatch) {
    return null;
  }

  const rawAttributes = charslotMatch[1] ?? null;
  const slotKey = normalizeSlotKey(getLooseAttributeValue(rawAttributes, "slot"));
  if (!slotKey) {
    parserState.charslots.clear();
    return charslotMatch[2]?.trim() ?? "";
  }

  const existingFrame = parserState.charslots.get(slotKey) ?? null;
  const speakerToken = getLooseAttributeValue(rawAttributes, "name");
  const rawFocusValue = getLooseAttributeValue(rawAttributes, "focus");

  if (!speakerToken && rawFocusValue === null && !existingFrame) {
    return charslotMatch[2]?.trim() ?? "";
  }

  const nextSpeakerId =
    speakerToken !== null
      ? normalizeSpeakerIdToken(speakerToken)
      : existingFrame?.speakerId ?? null;
  const nextPriority =
    rawFocusValue !== null
      ? resolveCharslotPriority(rawFocusValue, slotKey)
      : speakerToken !== null
        ? 0
        : existingFrame?.priority ?? 0;

  if (isNeutralCharslotFocus(rawFocusValue)) {
    for (const [activeSlotKey, activeFrame] of parserState.charslots.entries()) {
      if (activeSlotKey === slotKey) {
        continue;
      }

      parserState.charslots.set(activeSlotKey, {
        ...activeFrame,
        priority: -1,
      });
    }
  }

  parserState.charslots.set(
    slotKey,
    createFrame(parserState, "charslot", slotKey, nextSpeakerId, nextPriority),
  );

  return charslotMatch[2]?.trim() ?? "";
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

    const cutinRemainder = consumeCharacterCutinTag(remainder, parserState);
    if (cutinRemainder !== null) {
      remainder = cutinRemainder;
      if (!remainder) {
        return blocks;
      }
      continue;
    }

    const characterRemainder = consumeCharacterTag(remainder, parserState);
    if (characterRemainder !== null) {
      remainder = characterRemainder;
      if (!remainder) {
        return blocks;
      }
      continue;
    }

    const charslotRemainder = consumeCharslotTag(remainder, parserState);
    if (charslotRemainder !== null) {
      remainder = charslotRemainder;
      if (!remainder) {
        return blocks;
      }
      continue;
    }

    const backgroundResult = consumeBackgroundTag(remainder);
    if (backgroundResult) {
      blocks.push(...backgroundResult.blocks);
      remainder = backgroundResult.remainder;
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
    return [];
  }

  if (predicateCollector.blocks.length === 0) {
    return [];
  }

  const optionValues = currentChoice.options.map((option) => option.value);
  const uniqueReferences = [...new Set(predicateCollector.references)];
  const isShared =
    uniqueReferences.length === optionValues.length &&
    uniqueReferences.every((reference) => optionValues.includes(reference));

  if (isShared) {
    return predicateCollector.blocks;
  }

  for (const option of currentChoice.options) {
    if (!uniqueReferences.includes(option.value)) {
      continue;
    }

    for (const block of predicateCollector.blocks) {
      pushVisibleBlock(option.blocks, block);
    }
  }

  return [];
}

export function parseStoryText(rawText) {
  const lines = rawText.replace(/^\uFEFF/, "").split(/\r?\n/);
  const blocks = [];
  let currentChoice = null;
  let currentPredicate = null;
  let currentChoiceContinuationBlocks = [];
  const parserState = {
    frameClock: 0,
    cutins: new Map(),
    characterFrame: null,
    charslots: new Map(),
    speakerBindings: new Map(),
  };

  function flushChoice() {
    if (!currentChoice) {
      return;
    }

    const continuationBlocks = flushPredicate(currentChoice, currentPredicate);
    for (const block of continuationBlocks) {
      pushVisibleBlock(currentChoiceContinuationBlocks, block);
    }
    currentPredicate = null;
    blocks.push(currentChoice);
    for (const block of currentChoiceContinuationBlocks) {
      pushVisibleBlock(blocks, block);
    }
    currentChoice = null;
    currentChoiceContinuationBlocks = [];
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
      currentChoiceContinuationBlocks = [];
      continue;
    }

    const predicate = parsePredicateLine(line);
    if (predicate) {
      if (!currentChoice) {
        continue;
      }

      const continuationBlocks = flushPredicate(currentChoice, currentPredicate);
      for (const block of continuationBlocks) {
        pushVisibleBlock(currentChoiceContinuationBlocks, block);
      }
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
      if (!block.speakerId || !block.speakerId.startsWith("char_")) {
        continue;
      }

      const current =
        accumulator.get(block.speakerId) ??
        {
          aliases: new Set(),
        };

      current.aliases.add(block.speakerName);
      accumulator.set(block.speakerId, current);
      continue;
    }

    if (block.type !== "choice") {
      continue;
    }

    for (const option of block.options) {
      collectObservedOperatorsFromBlocks(option.blocks, accumulator);
    }
  }
}

export function collectObservedOperators(blocks) {
  const accumulator = new Map();
  collectObservedOperatorsFromBlocks(blocks, accumulator);

  return [...accumulator.entries()]
    .map(([speakerId, value]) => ({
      speakerId,
      aliases: [...value.aliases].sort((left, right) => left.localeCompare(right)),
    }))
    .sort((left, right) => left.speakerId.localeCompare(right.speakerId));
}
