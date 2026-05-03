import test from "node:test";
import assert from "node:assert/strict";
import {
  collectObservedOperators,
  normalizeSpeakerIdToken,
  parseStoryText,
} from "../../scripts/content/story-parser.mjs";

function dialogueBlocks(blocks) {
  return blocks.filter((block) => block.type === "dialogue");
}

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
      isRemote: false,
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
      isRemote: false,
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
  assert.equal(blocks[0].options[0].blocks[0].isRemote, false);
});

test("parseStoryText treats predicates that reference every option as continuation after the choice", () => {
  const blocks = parseStoryText(`
[Decision(options="...;Proceed",values="1;2")]
[Predicate(references="1;2")]
[name="Amiya"] We understand.
`);

  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].type, "choice");
  assert.equal(blocks[1].type, "dialogue");
  assert.equal(blocks[1].text, "We understand.");
  assert.equal(blocks[1].isRemote, false);
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
      isRemote: false,
      speakerName: "Texas",
      speakerId: "char_102_texas",
      text: "Stand down.",
    },
  ]);
});

test("parseStoryText keeps fresh character frames across pre-dialog separators", () => {
  const blocks = parseStoryText(`
[Character(name="char_379_sesa_1")]
[dialog]
[name="세사"]하, 하지…… 앗, 기다려! 마, 말로 하자고!
`);

  assert.deepEqual(dialogueBlocks(blocks), [
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "세사",
      speakerId: "char_379_sesa",
      text: "하, 하지…… 앗, 기다려! 마, 말로 하자고!",
    },
  ]);
});

test("parseStoryText prevents confirmed character frames from leaking after dialog breaks", () => {
  const blocks = parseStoryText(`
[Character(name="char_379_sesa_1")]
[name="세사"]멈춰.
[dialog]
[name="두린"]무슨 일이야?
`);

  assert.deepEqual(
    dialogueBlocks(blocks).map((block) => [block.speakerName, block.speakerId]),
    [
      ["세사", "char_379_sesa"],
      ["두린", null],
    ],
  );
});

test("parseStoryText lets fresh cutins beat pre-dialog character frames", () => {
  const blocks = parseStoryText(`
[Character(name="char_empty",name2="avg_126_shotst_1",focus=1)]
[dialog]
[CharacterCutin(widgetID="1", name="char_016_medic", style="cutin")]
[name="메딕 오퍼레이터"]자, 착하지~ 울지 마, 지아나. 지금 메테오 언니 찾으러 가자.
`);

  assert.deepEqual(dialogueBlocks(blocks), [
    {
      type: "dialogue",
      isRemote: true,
      speakerName: "메딕 오퍼레이터",
      speakerId: "char_016_medic",
      text: "자, 착하지~ 울지 마, 지아나. 지금 메테오 언니 찾으러 가자.",
    },
  ]);
});

test("parseStoryText keeps cutins when character focus points to char_empty", () => {
  const blocks = parseStoryText(`
[CharacterCutin(widgetID="1", name="char_016_medic", style="cutin")]
[name="메딕 오퍼레이터"]메테오, 나야. 늦은 시간에 전화해서 미안해.
[Character(name="char_empty",name2="avg_126_shotst_1",focus=2)]
[name="메테오"]미나, 야근 아니었어?
[Character(name="char_empty",name2="avg_126_shotst_1",focus=1)]
[name="메딕 오퍼레이터"]내가 아니라 지아나.
`);

  assert.deepEqual(
    dialogueBlocks(blocks).map((block) => ({
      speakerName: block.speakerName,
      speakerId: block.speakerId,
      isRemote: block.isRemote,
    })),
    [
      {
        speakerName: "메딕 오퍼레이터",
        speakerId: "char_016_medic",
        isRemote: true,
      },
      {
        speakerName: "메테오",
        speakerId: "avg_126_shotst_1",
        isRemote: false,
      },
      {
        speakerName: "메딕 오퍼레이터",
        speakerId: "char_016_medic",
        isRemote: true,
      },
    ],
  );
});

test("parseStoryText keeps confirmed cutins through intervening pre-dialog frames", () => {
  const blocks = parseStoryText(`
[CharacterCutin(widgetID="1", name="char_002_amiya_1", style="cutin")]
[name="아미야"]먼저 말한다.
[Character(name="char_003_kalts_1")]
[dialog]
[name="아미야"]확인된 기존 컷인이 우선한다.
`);

  assert.deepEqual(
    dialogueBlocks(blocks).map((block) => [block.speakerName, block.speakerId, block.isRemote]),
    [
      ["아미야", "char_002_amiya", true],
      ["아미야", "char_002_amiya", true],
    ],
  );
});

test("parseStoryText treats negative-focus character frames as non-speaker visual state", () => {
  const blocks = parseStoryText(`
[character(name="char_010_chen_summer",focus=-1)]
[name="경박한 관광객"]헤이, 거기 예쁜이, 우리랑 같이 해변에 놀러 가지 않을래?
[character(name="char_010_chen_summer")]
[name="첸"]꺼져.
`);

  assert.deepEqual(blocks, [
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "경박한 관광객",
      speakerId: null,
      text: "헤이, 거기 예쁜이, 우리랑 같이 해변에 놀러 가지 않을래?",
    },
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "첸",
      speakerId: "char_010_chen",
      text: "꺼져.",
    },
  ]);
});

test("parseStoryText ignores char_empty placeholders when only one real Character speaker remains", () => {
  const blocks = parseStoryText(`
[character(name="avg_npc_196_1#1",name2="char_empty",fadetime=1)]
[name="린 위시아"]찾았다.
`);

  assert.deepEqual(blocks, [
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "린 위시아",
      speakerId: "avg_npc_196_1",
      text: "찾았다.",
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
      isRemote: false,
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
      isRemote: false,
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
      isRemote: false,
      speakerName: "에기르 연구원 A",
      speakerId: "avg_npc_1393_1",
      text: "……지질 조건 상으로는 잠재력이 아주 큰 화산이지만 위치가 그리 좋지는 않아.",
    },
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "에기르 연구원 B",
      speakerId: "avg_npc_1395_1",
      text: "기술원의 보고서를 검토해 봤군요?",
    },
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "에기르 연구원 A",
      speakerId: "avg_npc_1393_1",
      text: "자료에 따르면 탑의 에너지 소모는 현재보다 훨씬 더 많았다더군.",
    },
  ]);
});

test("parseStoryText treats multiline tags as focused dialogue", () => {
  const blocks = parseStoryText(`
[charslot(slot="r",name="avg_4017_puzzle_1#4$1",focus="r")]
[multiline(name="피셔")]급성 감염이래요. 상처 부위에 들어간 활성 오리지늄 파편이 꽤 많았던 터라……
[charslot(slot="r",name="avg_4017_puzzle_1#1$1",focus="r")]
[multiline(name="피셔")]물론, 지금은 병세는 진정된 상태니까 걱정하지 마세요.
`);

  assert.deepEqual(blocks, [
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "피셔",
      speakerId: "avg_4017_puzzle_1",
      text: "급성 감염이래요. 상처 부위에 들어간 활성 오리지늄 파편이 꽤 많았던 터라……",
    },
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "피셔",
      speakerId: "avg_4017_puzzle_1",
      text: "물론, 지금은 병세는 진정된 상태니까 걱정하지 마세요.",
    },
  ]);
});

test("parseStoryText keeps multiline end tags as dialogue", () => {
  const blocks = parseStoryText(`
[charslot(slot="l",name="avg_npc_725_1#1$1",focus="l")]
[multiline(name="핀")]아, 그래……
[charslot(slot="l",name="avg_npc_725_1#8$1",focus="l")]
[multiline(name="핀",end=true)]사실 어젯밤 일에 대해서 감사의 말을 하고 싶었어.
`);

  assert.deepEqual(blocks, [
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "핀",
      speakerId: "avg_npc_725_1",
      text: "아, 그래……",
    },
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "핀",
      speakerId: "avg_npc_725_1",
      text: "사실 어젯밤 일에 대해서 감사의 말을 하고 싶었어.",
    },
  ]);
});

test("parseStoryText clears charslot frames when character scenes take over", () => {
  const blocks = parseStoryText(`
[charslot(slot="left",name="avg_npc_242")]
[charslot(slot="right",name="avg_npc_725_1#1$1")]
[character(name="avg_npc_725_1#6$1")]
[name="핀"]……윽, 글룸핀서한테 물린 거야.
[character(name="avg_1020_reed2_1#1$1")]
[name="리드"]그렇다면 내가 너희들과 함께……
[dialog]
[character(fadetime=0.5)]
[name="순찰대 대원"]저쪽이다! 진흙 위에 발자국이 있어, 저쪽으로 갔다!
[name="순찰대 대원"]그 불을 지른 타라의 쓰레기들도 분명히 이 주변에 있을 거야!
[character(name="avg_npc_725_1#4$1")]
[name="핀"]……어, 어서 숨어!
`);

  assert.deepEqual(
    blocks.filter((block) => block.type === "dialogue").map((block) => block.speakerId),
    [
      "avg_npc_725_1",
      "avg_1020_reed2_1",
      null,
      null,
      "avg_npc_725_1",
    ],
  );
});

test("parseStoryText does not fallback to non-operator speaker bindings after frame clear", () => {
  const blocks = parseStoryText(`
[character(name="avg_npc_725_1#4$1")]
[name="핀"]먼저 보이는 대사.
[character(fadetime=0.2)]
[name="핀"](나는…… 윽……)
[name="리드"]……
`);

  assert.deepEqual(
    blocks.filter((block) => block.type === "dialogue").map((block) => block.speakerId),
    ["avg_npc_725_1", null, null],
  );
});

test("parseStoryText does not persist stale char bindings from non-fresh frames", () => {
  const blocks = parseStoryText(`
[Character(name="char_500_noirc_1")]
[name="Noir Corne"]Hold the line.
[name="White creature"]This line is still visually ambiguous.
[Character]
[name="White creature"]This should not inherit Noir Corne.
[name="Noir Corne"]This can use the confirmed operator fallback.
`);

  assert.deepEqual(
    blocks.filter((block) => block.type === "dialogue").map((block) => block.speakerId),
    [
      "char_500_noirc",
      "char_500_noirc",
      null,
      "char_500_noirc",
    ],
  );
});

test("parseStoryText preserves charslot confirmation through focus-only updates", () => {
  const blocks = parseStoryText(`
[charslot(slot="l",name="char_500_noirc_1")]
[name="Noir Corne"]Hold the line.
[charslot(slot="l",focus="l")]
[name="White creature"]This line is still visually ambiguous.
[charslot]
[name="White creature"]This should not inherit Noir Corne.
`);

  assert.deepEqual(
    blocks.filter((block) => block.type === "dialogue").map((block) => block.speakerId),
    [
      "char_500_noirc",
      "char_500_noirc",
      null,
    ],
  );
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
    blocks
      .filter((block) => block.type === "dialogue")
      .map((block) => ({ isRemote: block.isRemote, speakerId: block.speakerId })),
    [
      { isRemote: true, speakerId: "char_2006_weiywfmzuki" },
      { isRemote: false, speakerId: "avg_npc_034" },
      { isRemote: false, speakerId: "avg_npc_036" },
      { isRemote: true, speakerId: "char_2006_weiywfmzuki" },
      { isRemote: false, speakerId: "char_2006_weiywfmzuki" },
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
[name="Cheery Legatus"]De-emphasized slot suppresses fallback while it remains active.
[charslot]
[name="Cheery Legatus"]Non-operator binding fallback stays suppressed after slot clear.
`);

  assert.deepEqual(
    blocks.filter((block) => block.type === "dialogue").map((block) => block.speakerId),
    [
      "avg_npc_175",
      "avg_npc_034",
      null,
      null,
    ],
  );
});

test("parseStoryText neutralizes all active charslot priorities for all-focus updates", () => {
  const blocks = parseStoryText(`
[charslot(slot="l",name="avg_369_bena_1#11$1")]
[charslot(slot="r",name="avg_npc_152")]
[charslot(slot="l",name="avg_369_bena_1#11$1",focus="l")]
[name="베나"]그럼……
[charslot(slot="l",name="avg_369_bena_1#11$1",focus="all")]
[name="베나&애니"]사과 한 개만 줘.
`);

  assert.deepEqual(
    blocks.filter((block) => block.type === "dialogue").map((block) => block.speakerId),
    ["avg_369_bena_1", null],
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
      isRemote: false,
      speakerName: "로빈",
      speakerId: null,
      text: "지금은 움직이면 안 돼.",
    },
  ]);
});

test("parseStoryText keeps level_act22side_07_end CG exchange portraitless after scene image", () => {
  const blocks = parseStoryText(`
[Character(name="avg_1020_reed2_1#6$1")]
[name="리드"]……백파이프?
[Dialog]
[Image(image="34_i06", xScale=1.2, yScale=1.2,fadetime=0.2)]
[background]
[name="백파이프"]'리드'.
[name="백파이프"]……니가 더블린의 '리더' 맞나?
[name="리드"]……
`);

  assert.deepEqual(
    dialogueBlocks(blocks).map((block) => ({
      speakerName: block.speakerName,
      speakerId: block.speakerId,
      text: block.text,
    })),
    [
      {
        speakerName: "리드",
        speakerId: "avg_1020_reed2_1",
        text: "……백파이프?",
      },
      {
        speakerName: "백파이프",
        speakerId: null,
        text: "'리드'.",
      },
      {
        speakerName: "백파이프",
        speakerId: null,
        text: "……니가 더블린의 '리더' 맞나?",
      },
      {
        speakerName: "리드",
        speakerId: null,
        text: "……",
      },
    ],
  );
});

test("parseStoryText emits level_main_11-15_beg subtitles and clears CG speaker frames", () => {
  const blocks = parseStoryText(`
[character(name="avg_npc_062",fadetime=0.5)]
[name="테레시스"]……
[Dialog]
[Image(image="32_i08_2",screenadapt="coverall")]
[Subtitle(text="<color=#000000>익숙한 모습이 당신과 아미야 앞을 가로막았다.</color>", x=500, y=370)]
[subtitle]
[name="Mon3tr"](극도로 고통스러운 듯) 크르르르르!!!!
[Dialog]
[Subtitle(text="<color=#000000>새빨갛고 따뜻한 액체가 당신의 뺨, 그리고 아미야를 껴안은 당신의 손에 튀었다.</color>", x=500, y=370)]
[subtitle]
[Image(image="32_i08_1",fadetime=2,screenadapt="coverall")]
[name="켈시"]{@nickname} 박사……
`);

  assert.deepEqual(
    blocks.filter((block) => block.type === "narration").map((block) => block.text),
    [
      "익숙한 모습이 당신과 아미야 앞을 가로막았다.",
      "새빨갛고 따뜻한 액체가 당신의 뺨, 그리고 아미야를 껴안은 당신의 손에 튀었다.",
    ],
  );
  assert.deepEqual(
    dialogueBlocks(blocks).map((block) => [block.speakerName, block.speakerId]),
    [
      ["테레시스", "avg_npc_062"],
      ["Mon3tr", null],
      ["켈시", null],
    ],
  );
});

test("parseStoryText emits level_main_12-02_end subtitles and prevents stale charslot leakage", () => {
  const blocks = parseStoryText(`
[Subtitle(text="“빠르게 통과해. 지붕 위에 매복이 있어.”", x=300, y=370)]
[subtitle]
[charslot(slot="m",name="avg_npc_394_1#18$1",focus="m")]
[name="아미야"]박사님, 들리세요? 지금 어떤 목소리가……
[charslot(slot="m",name="avg_npc_395_1#4$1",focus="m")]
[name="아스카론"]……
[name="아스카론"]이네스.
[dialog]
[name="이네스"]'회색 모자' 씨, 아주 단단히 준비했던데.
[name="이네스"]소형 통신기지 13개 중에 4개가 수동으로 작동하는 거였어.
`);

  assert.equal(
    blocks.find((block) => block.type === "narration")?.text,
    "“빠르게 통과해. 지붕 위에 매복이 있어.”",
  );
  assert.deepEqual(
    dialogueBlocks(blocks).map((block) => [block.speakerName, block.speakerId]),
    [
      ["아미야", "avg_npc_394_1"],
      ["아스카론", "avg_npc_395_1"],
      ["아스카론", "avg_npc_395_1"],
      ["이네스", null],
      ["이네스", null],
    ],
  );
});

test("parseStoryText keeps level_main_12-09_end cutin portraits speaker-scoped", () => {
  const blocks = parseStoryText(`
[CharacterCutin(widgetID="1", name="char_147_shining_1", style="cutin", offsetx=-300)]
[name="샤이닝"]이런 흔들림은 켈시 선생님의 회복에도 좋지 않을 거예요.
[Dialog]
[CharacterCutin(widgetID="2", name="avg_npc_412_1#1$1", style="cutin", offsetx=300)]
[name="W"]그래서? 테레시스도 못 죽였는데 겨우 이 정도 흔들림에 목숨을 잃을 것 같아?
[name="샤이닝"]돌아서 가면 될 텐데요.
[Dialog]
[playsound(key="$Mon3tr_n")]
[name="Mon3tr"](높아진 소리로) 그르르르
[CharacterCutin(widgetID="2", name="avg_npc_412_1#10$1", style="cutin", offsetx=300)]
[name="W"]금속 머리로 무슨 꿍꿍이를 세우고 있는 거야?
[CharacterCutin(widgetID="1", name="char_147_shining_1", style="cutin", offsetx=-300)]
[name="샤이닝"]W 씨, 길을 서두르는 게 먼저입니다.
[CharacterCutin(widgetID="2", name="avg_npc_412_1#14$1", style="cutin", offsetx=300)]
[name="W"]지금 저 여자가 입으로 한 마디도 내뱉지 못하니까 저 애완동물이 초조해하고 두려워서 벌벌 떠는 거 좀 봐!
[name="샤이닝"]지금은 제 환자예요.
`);

  assert.deepEqual(
    dialogueBlocks(blocks).map((block) => [block.speakerName, block.speakerId]),
    [
      ["샤이닝", "char_147_shining"],
      ["W", "avg_npc_412_1"],
      ["샤이닝", "char_147_shining"],
      ["Mon3tr", null],
      ["W", "avg_npc_412_1"],
      ["샤이닝", "char_147_shining"],
      ["W", "avg_npc_412_1"],
      ["샤이닝", "char_147_shining"],
    ],
  );
});

test("parseStoryText keeps level_st_12-02 neutral W slots and CG memory lines portraitless", () => {
  const blocks = parseStoryText(`
[charslot(slot="m",name="avg_npc_412_1#10$1")]
[delay(time=1)]
[name="켈시"]……
[Dialog]
[charslot(slot="m",name="avg_npc_412_1#10$1",focus="none")]
[name="켈시"]윽……
[charslot(slot="m",name="avg_npc_412_1#10$1",focus="m")]
[name="W"]안녕, 켈시. 참 재수도 없어, 그렇지?
[charslot(slot="m",name="avg_npc_412_1#10$1",focus="none")]
[name="켈시"]여기는……
[charslot(slot="l",name="char_003_kalts_1",focus="l")]
[name="켈시"]난 후회하지 않는다.
[Dialog]
[charslot]
[Background]
[Image(image="37_i05",xFrom=-150, yFrom=-120, xScale=1.1, yScale=1.1)]
[name="켈시"]하지만 가끔……
[name="켈시"]……지칠 때는 있지.
[name="W"]어쩐 일이래, 네가 그런 표정을 지을 때도 다 있고?
`);

  assert.deepEqual(
    dialogueBlocks(blocks).map((block) => [block.speakerName, block.speakerId]),
    [
      ["켈시", null],
      ["켈시", null],
      ["W", "avg_npc_412_1"],
      ["켈시", null],
      ["켈시", "char_003_kalts"],
      ["켈시", null],
      ["켈시", null],
      ["W", null],
    ],
  );
});

test("parseStoryText suffixes duplicate-position non-operator speakers", () => {
  const blocks = parseStoryText(`
[charslot(slot="m",name="avg_npc_867_1#1$1",focus="m")]
[name="'회색 모자'"]맞아. 우리는 다시 더블린과 동일한 출발선에 선 거야.
[charslot]
[dialog]
[charslot(slot="r",name="avg_npc_867_1#1$1",duration=1)]
[charslot(slot="l",name="avg_npc_867_1#1$1",duration=1)]
[delay(time=2)]
[charslot]
[charslot(slot="m",name="avg_npc_867_1#1$1",focus="m")]
[name="'회색 모자'"]드디어 왔군. 하마터면 적철 근위대 녀석한테 제거당할 뻔했어.
[charslot]
[charslot(slot="r",name="avg_npc_867_1#1$1",focus="r")]
[name="'회색 모자'"]공작님은 네 게으름에 불만이 매우 크셔.
[charslot]
[charslot(slot="l",name="avg_npc_867_1#1$1",focus="l")]
[name="'회색 모자'"]네 변명은 나중에 다시 확인하겠다.
`);

  assert.deepEqual(
    dialogueBlocks(blocks).map((block) => [block.speakerName, block.speakerId]),
    [
      ["'회색 모자' (A)", "avg_npc_867_1"],
      ["'회색 모자' (A)", "avg_npc_867_1"],
      ["'회색 모자' (B)", "avg_npc_867_1"],
      ["'회색 모자' (C)", "avg_npc_867_1"],
    ],
  );
});

test("parseStoryText does not suffix single speakers that move between slots", () => {
  const blocks = parseStoryText(`
[charslot(slot="m",name="avg_npc_867_1#1$1",focus="m")]
[name="'회색 모자'"]중앙에 있다.
[charslot]
[charslot(slot="r",name="avg_npc_867_1#1$1",focus="r")]
[name="'회색 모자'"]오른쪽으로 이동했다.
`);

  assert.deepEqual(
    dialogueBlocks(blocks).map((block) => [block.speakerName, block.speakerId]),
    [
      ["'회색 모자'", "avg_npc_867_1"],
      ["'회색 모자'", "avg_npc_867_1"],
    ],
  );
});

test("parseStoryText emits background blocks from Background tags", () => {
  const blocks = parseStoryText(`
[Background(image="51_g4_aegirstreet_1",screenadapt="coverall")]
[name="에기르 연구원 A"]배경이 바뀌었다.
`);

  assert.deepEqual(blocks, [
    {
      type: "background",
      backgroundId: "51_g4_aegirstreet_1",
    },
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "에기르 연구원 A",
      speakerId: null,
      text: "배경이 바뀌었다.",
    },
  ]);
});

test("parseStoryText emits background blocks from Image tags and narration from Sticker tags", () => {
  const blocks = parseStoryText(`
[theater(mode=true)]
[Sticker(id="st1", text="런디니움 오슈테리그", x=290, y=320)]
[Sticker(id="st2", text="더 샤드 빌딩 내부\\n관제실", x=290, y=400)]
[Sticker(id="st3", text="_노드 [DWDB-221E]와 교차 인증 연결 수립", x=290, y=450)]
[stickerclear]
[theater(mode=false)]
[Image(image="27_i01", fadetime=1, xScale=1.3, yScale=1.3)]
[name="테레시스"]공사는 이제 마무리 단계다.
`);

  assert.deepEqual(blocks, [
    {
      type: "narration",
      text: "런디니움 오슈테리그\n더 샤드 빌딩 내부\n관제실\n_노드 [DWDB-221E]와 교차 인증 연결 수립",
    },
    {
      type: "background",
      backgroundId: "27_i01",
    },
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "테레시스",
      speakerId: null,
      text: "공사는 이제 마무리 단계다.",
    },
  ]);
});

test("parseStoryText coalesces adjacent duplicate scene image backgrounds", () => {
  const blocks = parseStoryText(`
[Background(image="ac5_2_on")]
[Image(image="ac5_2_on",x=-20,y=-20)]
[Image(image="ac5_2_on",x=-20,y=-20)]
[Image(image="ac5_2_off",x=-20,y=-20)]
`);

  assert.deepEqual(blocks, [
    {
      type: "background",
      backgroundId: "ac5_2_on",
    },
    {
      type: "background",
      backgroundId: "ac5_2_off",
    },
  ]);
});

test("parseStoryText emits clear markers for scene image clears", () => {
  const blocks = parseStoryText(`
[Image(image="27_i01", fadetime=1)]
[Image(fadetime=2)]
[name="테레시스"]공사는 이제 마무리 단계다.
`);

  assert.deepEqual(blocks, [
    {
      type: "background",
      backgroundId: "27_i01",
    },
    {
      type: "background",
      backgroundId: null,
    },
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "테레시스",
      speakerId: null,
      text: "공사는 이제 마무리 단계다.",
    },
  ]);
});

test("parseStoryText ignores image clears without an active scene image", () => {
  const blocks = parseStoryText(`
[Image(fadetime=0)]
[Background(image="bg_cher_1", fadetime=1)]
[Image(fadetime=2)]
[name="테레시스"]공사는 이제 마무리 단계다.
`);

  assert.deepEqual(blocks, [
    {
      type: "background",
      backgroundId: "bg_cher_1",
    },
    {
      type: "dialogue",
      isRemote: false,
      speakerName: "테레시스",
      speakerId: null,
      text: "공사는 이제 마무리 단계다.",
    },
  ]);
});

test("parseStoryText emits background clears only when a backdrop is active", () => {
  const blocks = parseStoryText(`
[Background(fadetime=0)]
[Background(image="bg_cher_1", fadetime=1)]
[Background(fadetime=2)]
[Background]
[Image(image="27_i01", fadetime=1)]
[Background(fadetime=0)]
`);

  assert.deepEqual(blocks, [
    {
      type: "background",
      backgroundId: "bg_cher_1",
    },
    {
      type: "background",
      backgroundId: null,
    },
    {
      type: "background",
      backgroundId: "27_i01",
    },
    {
      type: "background",
      backgroundId: null,
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
