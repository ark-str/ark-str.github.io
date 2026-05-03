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

  if (block.type === "background" && target.at(-1)?.type === "background") {
    if (target.at(-1).backgroundId === block.backgroundId) {
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

function isCharSpeakerId(speakerId) {
  return typeof speakerId === "string" && speakerId.startsWith("char_");
}

function decodeTextAttributeValue(rawValue) {
  if (typeof rawValue !== "string") {
    return null;
  }

  return rawValue
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .trim();
}

function stripSubtitleRichText(rawText) {
  if (typeof rawText !== "string") {
    return null;
  }

  return rawText.replace(/<\/?color(?:=[^>]*)?>/gi, "").trim();
}

function parseTagWithAttributes(remainder, tagName) {
  const tagPrefix = `[${tagName}`;
  if (!remainder.toLowerCase().startsWith(tagPrefix.toLowerCase())) {
    return null;
  }

  let cursor = tagPrefix.length;
  if (remainder[cursor] === "]") {
    return {
      rawAttributes: null,
      remainder: remainder.slice(cursor + 1).trim(),
    };
  }

  if (remainder[cursor] !== "(") {
    return null;
  }

  cursor += 1;
  const attributesStart = cursor;
  let isInQuote = false;
  let isEscaped = false;

  while (cursor < remainder.length) {
    const char = remainder[cursor];

    if (isEscaped) {
      isEscaped = false;
      cursor += 1;
      continue;
    }

    if (char === "\\" && isInQuote) {
      isEscaped = true;
      cursor += 1;
      continue;
    }

    if (char === '"') {
      isInQuote = !isInQuote;
      cursor += 1;
      continue;
    }

    if (char === ")" && !isInQuote) {
      if (remainder[cursor + 1] !== "]") {
        return null;
      }

      return {
        rawAttributes: remainder.slice(attributesStart, cursor),
        remainder: remainder.slice(cursor + 2).trim(),
      };
    }

    cursor += 1;
  }

  return null;
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

  const focusValue = parseNumericPriority(getLooseAttributeValue(rawAttributes, "focus"));
  if (Number.isInteger(focusValue) && focusValue > 0) {
    return normalizeSpeakerIdToken(slots[focusValue - 1]?.token ?? null);
  }

  const uniformSpeakerId = resolveUniformSpeakerId(slots);
  if (uniformSpeakerId) {
    return uniformSpeakerId;
  }

  return null;
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

function getAlphabeticSuffix(index) {
  if (index >= 0 && index < 26) {
    return String.fromCharCode("A".charCodeAt(0) + index);
  }

  return String(index + 1);
}

function createFrame(parserState, source, key, speakerId, priority, hasExplicitSpeakerToken = false) {
  parserState.frameClock += 1;

  return {
    source,
    key,
    speakerId,
    priority,
    hasExplicitSpeakerToken,
    confirmedSpeakerName: null,
    staleAfterSceneBreak: false,
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

function isFrameEligibleForSpeaker(frame, speakerName) {
  if (frame.source === "cutin" && frame.confirmedSpeakerName) {
    return frame.confirmedSpeakerName === speakerName;
  }

  if (frame.staleAfterSceneBreak) {
    return frame.confirmedSpeakerName === speakerName;
  }

  return true;
}

function selectWinningFrame(frames) {
  return frames.reduce((winningFrame, candidateFrame) => {
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

function selectFreshWinningFrame(frames, speakerName) {
  const winningFrame = selectWinningFrame(frames);

  const confirmedCutinFrame = selectWinningFrame(
    frames.filter(
      (frame) =>
        frame.source === "cutin" &&
        frame.speakerId &&
        frame.confirmedSpeakerName === speakerName,
    ),
  );

  if (!winningFrame) {
    return confirmedCutinFrame;
  }

  if (winningFrame?.speakerId) {
    if (
      confirmedCutinFrame &&
      winningFrame !== confirmedCutinFrame &&
      winningFrame.speakerId !== confirmedCutinFrame.speakerId &&
      winningFrame.confirmedSpeakerName &&
      winningFrame.confirmedSpeakerName !== speakerName
    ) {
      return confirmedCutinFrame;
    }

    return winningFrame;
  }

  if (confirmedCutinFrame) {
    return confirmedCutinFrame;
  }

  const newerSpeakerFrame = selectWinningFrame(
    frames.filter(
      (frame) =>
        frame.speakerId &&
        frame.updatedAt > winningFrame.updatedAt &&
        (frame.hasExplicitSpeakerToken || frame.confirmedSpeakerName === speakerName),
    ),
  );

  if (newerSpeakerFrame) {
    return newerSpeakerFrame;
  }

  const unconfirmedCutinFrame = selectWinningFrame(
    frames.filter(
      (frame) => frame.source === "cutin" && frame.speakerId && !frame.confirmedSpeakerName,
    ),
  );

  return unconfirmedCutinFrame ?? winningFrame;
}

function resolveWinningFrame(parserState, speakerName) {
  const activeFrames = getActiveFrames(parserState).filter((frame) => frame.priority >= 0);
  const freshEligibleFrames = activeFrames.filter(
    (frame) => !frame.staleAfterSceneBreak && isFrameEligibleForSpeaker(frame, speakerName),
  );
  const freshWinningFrame = selectFreshWinningFrame(freshEligibleFrames, speakerName);

  if (freshWinningFrame?.speakerId) {
    return freshWinningFrame;
  }

  const staleConfirmedFrame = selectWinningFrame(
    activeFrames.filter(
      (frame) => frame.staleAfterSceneBreak && frame.confirmedSpeakerName === speakerName,
    ),
  );

  if (staleConfirmedFrame) {
    return staleConfirmedFrame;
  }

  if (freshWinningFrame) {
    return freshWinningFrame;
  }

  return selectWinningFrame(
    activeFrames.filter(
      (frame) => frame.staleAfterSceneBreak && !frame.confirmedSpeakerName,
    ),
  );
}

function parseDialogueTag(line) {
  const dialogueMatch = /^\[name="([^"]+)"\]\s*(.*)$/i.exec(line);
  if (dialogueMatch) {
    return {
      speakerName: dialogueMatch[1].trim(),
      text: dialogueMatch[2]?.trim(),
    };
  }

  const multilineMatch = /^\[multiline\(([^\]]*)\)\]\s*(.*)$/i.exec(line);
  if (!multilineMatch) {
    return null;
  }

  const speakerName = getLooseAttributeValue(multilineMatch[1] ?? null, "name");
  if (!speakerName) {
    return null;
  }

  return {
    speakerName: speakerName.trim(),
    text: multilineMatch[2]?.trim(),
  };
}

function forEachDialogueBlock(blocks, callback) {
  for (const block of blocks) {
    if (block.type === "dialogue") {
      callback(block);
      continue;
    }

    if (block.type !== "choice") {
      continue;
    }

    for (const option of block.options) {
      forEachDialogueBlock(option.blocks, callback);
    }
  }
}

function resetCharslotMatchDisambiguation(parserState) {
  parserState.weakCharslotMatches = [];
  parserState.strongCharslotSpeakersBySpeakerId.clear();
}

function hasConflictingStrongCharslotMatch(parserState, speakerId, speakerName) {
  const speakerNames = parserState.strongCharslotSpeakersBySpeakerId.get(speakerId);
  if (!speakerNames) {
    return false;
  }

  return [...speakerNames].some((knownSpeakerName) => knownSpeakerName !== speakerName);
}

function registerWeakCharslotMatch(parserState, block, speakerId, speakerName) {
  if (hasConflictingStrongCharslotMatch(parserState, speakerId, speakerName)) {
    block.speakerId = null;
    return;
  }

  parserState.weakCharslotMatches.push({
    block,
    speakerId,
    speakerName,
  });
}

function registerStrongCharslotMatch(parserState, speakerId, speakerName) {
  const speakerNames =
    parserState.strongCharslotSpeakersBySpeakerId.get(speakerId) ?? new Set();
  speakerNames.add(speakerName);
  parserState.strongCharslotSpeakersBySpeakerId.set(speakerId, speakerNames);

  for (const weakMatch of parserState.weakCharslotMatches) {
    if (weakMatch.speakerId !== speakerId || weakMatch.speakerName === speakerName) {
      continue;
    }

    weakMatch.block.speakerId = null;
  }
}

function recordAmbiguousCharslotSpeakerIds(parserState) {
  const slotKeysBySpeakerId = new Map();
  for (const [slotKey, frame] of parserState.charslots.entries()) {
    if (!frame.speakerId || isCharSpeakerId(frame.speakerId)) {
      continue;
    }

    const slotKeys = slotKeysBySpeakerId.get(frame.speakerId) ?? new Set();
    slotKeys.add(slotKey);
    slotKeysBySpeakerId.set(frame.speakerId, slotKeys);
  }

  for (const [speakerId, slotKeys] of slotKeysBySpeakerId.entries()) {
    if (slotKeys.size > 1) {
      parserState.ambiguousCharslotSpeakerIds.add(speakerId);
    }
  }
}

function applyAmbiguousSpeakerSuffixes(blocks, parserState) {
  if (parserState.ambiguousCharslotSpeakerIds.size === 0) {
    return;
  }

  const suffixesBySpeakerGroup = new Map();
  forEachDialogueBlock(blocks, (block) => {
    if (
      !parserState.ambiguousCharslotSpeakerIds.has(block.speakerId) ||
      block._speakerFrameSource !== "charslot" ||
      !block._speakerFrameKey
    ) {
      return;
    }

    const groupKey = `${block.speakerName}\0${block.speakerId}`;
    const suffixesBySlotKey = suffixesBySpeakerGroup.get(groupKey) ?? new Map();
    if (!suffixesBySlotKey.has(block._speakerFrameKey)) {
      suffixesBySlotKey.set(
        block._speakerFrameKey,
        getAlphabeticSuffix(suffixesBySlotKey.size),
      );
    }

    suffixesBySpeakerGroup.set(groupKey, suffixesBySlotKey);
    block.speakerName = `${block.speakerName} (${suffixesBySlotKey.get(block._speakerFrameKey)})`;
  });
}

function stripInternalDialogueMetadata(blocks) {
  forEachDialogueBlock(blocks, (block) => {
    delete block._speakerFrameSource;
    delete block._speakerFrameKey;
    delete block._speakerFramePriority;
  });
}

function finalizeStoryBlocks(blocks, parserState) {
  applyAmbiguousSpeakerSuffixes(blocks, parserState);
  stripInternalDialogueMetadata(blocks);
  return blocks;
}

function resolveDialogueSpeaker(line, parserState) {
  const dialogueTag = parseDialogueTag(line);
  if (!dialogueTag) {
    return null;
  }

  const { speakerName, text } = dialogueTag;
  if (!text) {
    return [];
  }

  const knownSpeakerBinding = parserState.speakerBindings.get(speakerName) ?? null;
  const eligibleSpeakerBinding = isCharSpeakerId(knownSpeakerBinding) ? knownSpeakerBinding : null;
  const hasActiveFrame = getActiveFrames(parserState).length > 0;
  const winningFrame = resolveWinningFrame(parserState, speakerName);
  const speakerId = winningFrame
    ? winningFrame.speakerId
    : hasActiveFrame
      ? null
      : eligibleSpeakerBinding;

  const block = {
    type: "dialogue",
    speakerName,
    speakerId,
    isRemote: winningFrame?.source === "cutin",
    text,
  };

  if (winningFrame) {
    block._speakerFrameSource = winningFrame.source;
    block._speakerFrameKey = winningFrame.key;
    block._speakerFramePriority = winningFrame.priority;
    winningFrame.confirmedSpeakerName = speakerName;

    if (winningFrame.source === "charslot" && speakerId && !isCharSpeakerId(speakerId)) {
      if (winningFrame.priority > 0) {
        registerStrongCharslotMatch(parserState, speakerId, speakerName);
      } else if (winningFrame.priority === 0) {
        registerWeakCharslotMatch(parserState, block, speakerId, speakerName);
      }
    }

    if (isCharSpeakerId(speakerId) && !winningFrame.hasConfirmedSpeakerBinding) {
      parserState.speakerBindings.set(speakerName, speakerId);
      winningFrame.hasConfirmedSpeakerBinding = true;
    }
  }

  return [block];
}

function markActiveFramesStale(parserState) {
  for (const frame of getActiveFrames(parserState)) {
    frame.staleAfterSceneBreak = true;
  }
}

function clearVisualSpeakerState(parserState) {
  parserState.cutins.clear();
  parserState.characterFrame = null;
  parserState.charslots.clear();
  parserState.speakerBindings.clear();
  resetCharslotMatchDisambiguation(parserState);
}

function consumeBackgroundTag(remainder, parserState) {
  const backgroundMatch = parseTagWithAttributes(remainder, "Background");
  if (!backgroundMatch) {
    return null;
  }

  clearVisualSpeakerState(parserState);
  const rawAttributes = backgroundMatch.rawAttributes;
  const backgroundId = normalizeBackgroundId(getLooseAttributeValue(rawAttributes, "image"));
  if (backgroundId) {
    parserState.activeBackdropId = backgroundId;
    parserState.activeSceneImageId = null;

    return {
      blocks: [
        {
          type: "background",
          backgroundId,
        },
      ],
      remainder: backgroundMatch.remainder,
    };
  }

  if (!parserState.activeBackdropId) {
    return {
      blocks: [],
      remainder: backgroundMatch.remainder,
    };
  }

  parserState.activeBackdropId = null;
  parserState.activeSceneImageId = null;

  return {
    blocks: [
      {
        type: "background",
        backgroundId,
      },
    ],
    remainder: backgroundMatch.remainder,
  };
}

function consumeImageTag(remainder, parserState) {
  const imageMatch = parseTagWithAttributes(remainder, "Image");
  if (!imageMatch) {
    return null;
  }

  clearVisualSpeakerState(parserState);
  const rawAttributes = imageMatch.rawAttributes;
  const backgroundId = normalizeBackgroundId(getLooseAttributeValue(rawAttributes, "image"));
  if (backgroundId) {
    parserState.activeBackdropId = backgroundId;
    parserState.activeSceneImageId = backgroundId;

    return {
      blocks: [
        {
          type: "background",
          backgroundId,
        },
      ],
      remainder: imageMatch.remainder,
    };
  }

  if (!parserState.activeSceneImageId) {
    return {
      blocks: [],
      remainder: imageMatch.remainder,
    };
  }

  parserState.activeBackdropId = null;
  parserState.activeSceneImageId = null;

  return {
    blocks: [
      {
        type: "background",
        backgroundId,
      },
    ],
    remainder: imageMatch.remainder,
  };
}

function consumeSubtitleTag(remainder) {
  const subtitleMatch = parseTagWithAttributes(remainder, "Subtitle");
  if (!subtitleMatch) {
    return null;
  }

  const rawAttributes = subtitleMatch.rawAttributes;
  const subtitleText = stripSubtitleRichText(
    decodeTextAttributeValue(getLooseAttributeValue(rawAttributes, "text")),
  );

  return {
    blocks: subtitleText
      ? [
          {
            type: "narration",
            text: subtitleText,
          },
        ]
      : [],
    remainder: subtitleMatch.remainder,
  };
}

function consumeStickerTag(remainder) {
  const stickerMatch = parseTagWithAttributes(remainder, "Sticker");
  if (!stickerMatch) {
    return null;
  }

  const rawAttributes = stickerMatch.rawAttributes;
  const stickerText = decodeTextAttributeValue(getLooseAttributeValue(rawAttributes, "text"));

  return {
    blocks: stickerText
      ? [
          {
            type: "narration",
            text: stickerText,
          },
        ]
      : [],
    remainder: stickerMatch.remainder,
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
          true,
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
  parserState.charslots.clear();
  resetCharslotMatchDisambiguation(parserState);

  if (slots.length === 0) {
    parserState.characterFrame = null;
    return characterMatch[2]?.trim() ?? "";
  }

  const existingFrame = parserState.characterFrame;
  const speakerId = resolveCharacterSpeakerId(rawAttributes);
  const nextFrame = createFrame(
    parserState,
    "character",
    "character",
    speakerId,
    parseNumericPriority(getLooseAttributeValue(rawAttributes, "focus")),
    true,
  );

  if (speakerId && existingFrame?.speakerId === speakerId) {
    nextFrame.hasConfirmedSpeakerBinding = existingFrame.hasConfirmedSpeakerBinding;
    nextFrame.confirmedSpeakerName = existingFrame.confirmedSpeakerName;
  }

  parserState.characterFrame = nextFrame;

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
    resetCharslotMatchDisambiguation(parserState);
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

  const nextFrame = createFrame(
    parserState,
    "charslot",
    slotKey,
    nextSpeakerId,
    nextPriority,
    speakerToken !== null,
  );
  if (speakerToken === null && existingFrame?.speakerId === nextSpeakerId) {
    nextFrame.hasConfirmedSpeakerBinding = existingFrame.hasConfirmedSpeakerBinding;
    nextFrame.confirmedSpeakerName = existingFrame.confirmedSpeakerName;
  }

  parserState.charslots.set(slotKey, nextFrame);
  recordAmbiguousCharslotSpeakerIds(parserState);

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

    const backgroundResult = consumeBackgroundTag(remainder, parserState);
    if (backgroundResult) {
      blocks.push(...backgroundResult.blocks);
      remainder = backgroundResult.remainder;
      if (!remainder) {
        return blocks;
      }
      continue;
    }

    const imageResult = consumeImageTag(remainder, parserState);
    if (imageResult) {
      blocks.push(...imageResult.blocks);
      remainder = imageResult.remainder;
      if (!remainder) {
        return blocks;
      }
      continue;
    }

    const subtitleResult = consumeSubtitleTag(remainder);
    if (subtitleResult) {
      blocks.push(...subtitleResult.blocks);
      remainder = subtitleResult.remainder;
      if (!remainder) {
        return blocks;
      }
      continue;
    }

    const stickerResult = consumeStickerTag(remainder);
    if (stickerResult) {
      blocks.push(...stickerResult.blocks);
      remainder = stickerResult.remainder;
      if (!remainder) {
        return blocks;
      }
      continue;
    }

    const dialogBreakMatch = /^\[(?:Dialog|dialog)(?:\([^\]]*\))?\]\s*(.*)$/i.exec(remainder);
    if (dialogBreakMatch) {
      markActiveFramesStale(parserState);
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
    activeBackdropId: null,
    activeSceneImageId: null,
    weakCharslotMatches: [],
    strongCharslotSpeakersBySpeakerId: new Map(),
    ambiguousCharslotSpeakerIds: new Set(),
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

  return finalizeStoryBlocks(blocks, parserState);
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
