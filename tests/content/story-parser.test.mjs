import test from "node:test";
import assert from "node:assert/strict";
import { parseStoryText } from "../../scripts/content/story-parser.mjs";

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
