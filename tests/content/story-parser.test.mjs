import test from "node:test";
import assert from "node:assert/strict";
import {
  collectObservedOperators,
  normalizeOperatorIdToken,
  parseStoryText,
} from "../../scripts/content/story-parser.mjs";

test("parseStoryText extracts dialogue, narration, and scene breaks", () => {
  const blocks = parseStoryText(`
[Dialog]
[name="Amiya"] Ready, Doctor?
The corridor falls silent.
[Dialog]
[name="Dobermann"] Move out.
`);

  assert.deepEqual(blocks, [
    {
      type: "dialogue",
      speakerName: "Amiya",
      speakerToken: null,
      operatorId: null,
      text: "Ready, Doctor?",
      portraitKey: null,
    },
    {
      type: "narration",
      text: "The corridor falls silent.",
    },
    { type: "sceneBreak" },
    {
      type: "dialogue",
      speakerName: "Dobermann",
      speakerToken: null,
      operatorId: null,
      text: "Move out.",
      portraitKey: null,
    },
  ]);
});

test("parseStoryText groups predicate blocks under the matching choice option", () => {
  const blocks = parseStoryText(`
[Decision(options="Stay calm;Advance",values="1;2")]
[Predicate(references="1")]
[name="Kal'tsit"] Hold the line.
[Predicate(references="2")]
[name="Kal'tsit"] Push forward.
`);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, "choice");
  assert.deepEqual(blocks[0].options.map((option) => option.label), ["Stay calm", "Advance"]);
  assert.equal(blocks[0].options[0].blocks[0].type, "dialogue");
  assert.equal(blocks[0].options[0].blocks[0].text, "Hold the line.");
  assert.equal(blocks[0].options[1].blocks[0].text, "Push forward.");
});

test("parseStoryText treats predicates that reference every option as shared", () => {
  const blocks = parseStoryText(`
[Decision(options="...;Proceed",values="1;2")]
[Predicate(references="1;2")]
[name="Amiya"] We understand.
`);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, "choice");
  assert.equal(blocks[0].sharedBlocks.length, 1);
  assert.equal(blocks[0].sharedBlocks[0].type, "dialogue");
  assert.equal(blocks[0].sharedBlocks[0].text, "We understand.");
});

test("normalizeOperatorIdToken strips suffixes and keeps the first three underscore segments", () => {
  assert.equal(normalizeOperatorIdToken("char_101_sora_1#4"), "char_101_sora");
  assert.equal(normalizeOperatorIdToken("char_201_moeshd#2"), "char_201_moeshd");
  assert.equal(normalizeOperatorIdToken("avg_npc_175"), null);
});

test("parseStoryText resolves focused Character slots into operator-aware dialogue blocks", () => {
  const blocks = parseStoryText(`
[Character(name="avg_npc_262_1#7$1",name2="char_102_texas_1#1",focus=2)]
[name="Texas"]Stand down.
`);

  assert.deepEqual(blocks, [
    {
      type: "dialogue",
      speakerName: "Texas",
      speakerToken: "char_102_texas_1#1",
      operatorId: "char_102_texas",
      portraitKey: "char_102_texas",
      text: "Stand down.",
    },
  ]);
});

test("parseStoryText reuses the last resolved speaker only while the name stays the same", () => {
  const blocks = parseStoryText(`
[Character(name="char_101_sora_1#4")]
[name="Sora"]The stage is ours.
[character]
[name="Sora"]Encore.
[name="Texas"]Not the same speaker.
`);

  assert.equal(blocks[0].type, "dialogue");
  assert.equal(blocks[0].operatorId, "char_101_sora");
  assert.equal(blocks[1].type, "dialogue");
  assert.equal(blocks[1].operatorId, "char_101_sora");
  assert.equal(blocks[2].type, "dialogue");
  assert.equal(blocks[2].operatorId, null);
});

test("parseStoryText preserves speaker bindings across effect-only character tags", () => {
  const blocks = parseStoryText(`
[Character(name="char_101_sora_1#4")]
[name="Sora"]The stage is ours.
[Character(name="char_102_texas_1#1")]
[name="Texas"]Stay sharp.
[Character(fadetime=1)]
[name="Sora"]We are not done yet.
`);

  assert.equal(blocks[0].type, "dialogue");
  assert.equal(blocks[0].operatorId, "char_101_sora");
  assert.equal(blocks[1].type, "dialogue");
  assert.equal(blocks[1].operatorId, "char_102_texas");
  assert.equal(blocks[2].type, "dialogue");
  assert.equal(blocks[2].speakerToken, "char_101_sora_1#4");
  assert.equal(blocks[2].operatorId, "char_101_sora");
});

test("parseStoryText keeps non-operator tokens on dialogue blocks without alias observations", () => {
  const blocks = parseStoryText(`
[character(name="avg_npc_175",name2="avg_npc_360_1#1$1",focus=2)]
[name="Cheery Legatus"]Lady Sharon, we're in the Basilica...
`);

  assert.deepEqual(blocks, [
    {
      type: "dialogue",
      speakerName: "Cheery Legatus",
      speakerToken: "avg_npc_360_1#1$1",
      operatorId: null,
      portraitKey: null,
      text: "Lady Sharon, we're in the Basilica...",
    },
  ]);
});

test("collectObservedOperators deduplicates aliases and speaker tokens per operator", () => {
  const blocks = parseStoryText(`
[Character(name="char_101_sora_1#4")]
[name="Sora"]The show starts now.
[character]
[name="Sora"]Keep tempo.
[Character(name="char_101_sora_2#1")]
[name="Idol Sora"]The encore is for everyone.
`);

  assert.deepEqual(collectObservedOperators(blocks), [
    {
      operatorId: "char_101_sora",
      aliases: ["Idol Sora", "Sora"],
      speakerTokens: ["char_101_sora_1#4", "char_101_sora_2#1"],
    },
  ]);
});
