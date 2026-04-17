import test from "node:test";
import assert from "node:assert/strict";
import {
  collectObservedOperators,
  normalizeSpeakerIdToken,
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
      speakerId: null,
      text: "Ready, Doctor?",
    },
    {
      type: "narration",
      text: "The corridor falls silent.",
    },
    { type: "sceneBreak" },
    {
      type: "dialogue",
      speakerName: "Dobermann",
      speakerId: null,
      text: "Move out.",
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

test("normalizeSpeakerIdToken keeps char ids canonical and preserves non-char visual keys", () => {
  assert.equal(normalizeSpeakerIdToken("char_101_sora_1#4"), "char_101_sora");
  assert.equal(normalizeSpeakerIdToken("char_201_moeshd#2"), "char_201_moeshd");
  assert.equal(normalizeSpeakerIdToken("avg_npc_175"), "avg_npc_175");
  assert.equal(normalizeSpeakerIdToken("avg_npc_262_1#7$1"), "avg_npc_262_1");
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
      speakerId: "char_102_texas",
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
  assert.equal(blocks[0].speakerId, "char_101_sora");
  assert.equal(blocks[1].type, "dialogue");
  assert.equal(blocks[1].speakerId, "char_101_sora");
  assert.equal(blocks[2].type, "dialogue");
  assert.equal(blocks[2].speakerId, null);
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
  assert.equal(blocks[0].speakerId, "char_101_sora");
  assert.equal(blocks[1].type, "dialogue");
  assert.equal(blocks[1].speakerId, "char_102_texas");
  assert.equal(blocks[2].type, "dialogue");
  assert.equal(blocks[2].speakerId, "char_101_sora");
});

test("parseStoryText keeps non-char visual keys on dialogue blocks without alias observations", () => {
  const blocks = parseStoryText(`
[character(name="avg_npc_175",name2="avg_npc_360_1#1$1",focus=2)]
[name="Cheery Legatus"]Lady Sharon, we're in the Basilica...
`);

  assert.deepEqual(blocks, [
    {
      type: "dialogue",
      speakerName: "Cheery Legatus",
      speakerId: "avg_npc_360_1",
      text: "Lady Sharon, we're in the Basilica...",
    },
  ]);
});

test("parseStoryText resolves charslot speaker ids for visual portrait lookup", () => {
  const blocks = parseStoryText(`
[charslot(slot = "m", name = "avg_npc_1297_1#1$1")]
[name="Theresis"]You're watching me, aren't you?
`);

  assert.deepEqual(blocks, [
    {
      type: "dialogue",
      speakerName: "Theresis",
      speakerId: "avg_npc_1297_1",
      text: "You're watching me, aren't you?",
    },
  ]);
});

test("parseStoryText resolves spaced charslot attributes from act34side npc exchanges", () => {
  const blocks = parseStoryText(`
[charslot(slot = "left", name = "avg_npc_1393_1#1$1",duration = 1)]
[charslot(slot = "right", name = "avg_npc_1395_1#1$1",duration = 1)]
[charslot(slot = "left",focus="l")]
[name="에기르 연구원 A"]……지질 조건 상으로는 잠재력이 아주 큰 화산이지만 위치가 그리 좋지는 않아.
[charslot(slot = "r",focus="r")]
[name="에기르 연구원 B"]기술원의 보고서를 검토해 봤군요?
[charslot(slot = "left",focus="l")]
[name="에기르 연구원 A"]자료에 따르면 탑의 에너지 소모는 현재보다 훨씬 더 많았다더군.
`);

  assert.deepEqual(blocks, [
    {
      type: "dialogue",
      speakerName: "에기르 연구원 A",
      speakerId: "avg_npc_1393_1",
      text: "……지질 조건 상으로는 잠재력이 아주 큰 화산이지만 위치가 그리 좋지는 않아.",
    },
    {
      type: "dialogue",
      speakerName: "에기르 연구원 B",
      speakerId: "avg_npc_1395_1",
      text: "기술원의 보고서를 검토해 봤군요?",
    },
    {
      type: "dialogue",
      speakerName: "에기르 연구원 A",
      speakerId: "avg_npc_1393_1",
      text: "자료에 따르면 탑의 에너지 소모는 현재보다 훨씬 더 많았다더군.",
    },
  ]);
});

test("parseStoryText resolves mixed cutin and character frames with priority and recency", () => {
  const blocks = parseStoryText(`
[CharacterCutin(widgetID="1", name="char_2006_weiywfmzuki_1", style="cutin")]
[character(name2="avg_npc_034",focus=-1)]
[name="후미즈키"]린 선생님, 후미즈키입니다.
[character(name2="avg_npc_034",focus=2)]
[name="래트킹"]후미즈키 부인, 어쩐 일로 나한테 전화까지 주셨나?
[character(name2="avg_npc_036")]
[name="린 위시아"]후미즈키 부인 전화? 그럼 난 방해 안 할게요……
[character(name2="avg_npc_036",focus=-1)]
[name="후미즈키"]위시아도 있나요? 그럼 같이 받아달라 말씀 전해주실 수 있을까요?
[CharacterCutin(widgetID="1", block=true)]
[character]
[name="후미즈키"]린 선생님도 그 초대장 받으셨죠?
`);

  assert.deepEqual(
    blocks.filter((block) => block.type === "dialogue").map((block) => block.speakerId),
    [
      "char_2006_weiywfmzuki",
      "avg_npc_034",
      "avg_npc_036",
      "char_2006_weiywfmzuki",
      "char_2006_weiywfmzuki",
    ],
  );
});

test("parseStoryText resolves charslot and cutin frames together and clears slot registries", () => {
  const blocks = parseStoryText(`
[charslot(slot="r",name="avg_npc_175",focus="r")]
[CharacterCutin(widgetID="1", name="avg_npc_034", style="cutin")]
[name="Cheery Legatus"]Priority beats neutral cutin.
[charslot(slot="r",focus="n")]
[name="Rat King"]Neutral cutin beats de-emphasized slot.
[CharacterCutin(widgetID="1", block=true)]
[name="Cheery Legatus"]De-emphasized slot still binds when cutin is gone.
[charslot]
[name="Cheery Legatus"]Binding fallback survives after slot clear.
`);

  assert.deepEqual(
    blocks.filter((block) => block.type === "dialogue").map((block) => block.speakerId),
    [
      "avg_npc_175",
      "avg_npc_034",
      "avg_npc_175",
      "avg_npc_175",
    ],
  );
});

test("parseStoryText leaves ambiguous multi-slot decimal focus without a speaker portrait", () => {
  const blocks = parseStoryText(`
[Character(name="avg_npc_136#4",name2="char_451_robin#3",focus=0.6)]
[name="로빈"]지금은 움직이면 안 돼.
`);

  assert.deepEqual(blocks, [
    {
      type: "dialogue",
      speakerName: "로빈",
      speakerId: null,
      text: "지금은 움직이면 안 돼.",
    },
  ]);
});

test("collectObservedOperators deduplicates aliases per speakerId", () => {
  const blocks = parseStoryText(`
[Character(name="char_101_sora_1#4")]
[name="Sora"]The show starts now.
[character]
[name="Sora"]Keep tempo.
[Character(name="char_101_sora_2#1")]
[name="Idol Sora"]The encore is for everyone.
[Character(name="avg_npc_175")]
[name="Leithanian"]No alias persistence here.
`);

  assert.deepEqual(collectObservedOperators(blocks), [
    {
      speakerId: "char_101_sora",
      aliases: ["Idol Sora", "Sora"],
    },
  ]);
});
