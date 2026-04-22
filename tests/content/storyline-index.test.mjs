import test from "node:test";
import assert from "node:assert/strict";
import { buildStorylineIndex } from "../../scripts/content/storyline-index.mjs";

const groups = [
  {
    groupId: "main_0",
    title: "암흑 시대·상",
    totalVisibleCharacterCount: 900,
  },
  {
    groupId: "act_event",
    title: "흑야의 회고록",
    totalVisibleCharacterCount: 450,
  },
  {
    groupId: "main_15",
    title: "해리성 결합",
    totalVisibleCharacterCount: 1350,
  },
  {
    groupId: "story_amiya_set_1",
    title: "아미야 기록",
    totalVisibleCharacterCount: 300,
  },
  {
    groupId: "act_unmatched",
    title: "한정 이벤트",
    totalVisibleCharacterCount: 600,
  },
];

const storyReviewTable = {
  main_0: { entryType: "MAINLINE", actType: "MAIN_STORY" },
  act_event: { entryType: "ACTIVITY", actType: "ACTIVITY_STORY" },
  main_15: { entryType: "MAINLINE", actType: "MAIN_STORY" },
  story_amiya_set_1: { entryType: "NONE", actType: "NONE" },
  act_unmatched: { entryType: "ACTIVITY", actType: "ACTIVITY_STORY" },
};

const stageTable = {
  storylines: {
    mainLine: {
      storylineId: "mainLine",
      storylineType: "CONTINUE",
      sortId: 0,
      storylineName: "내일을 위하여",
      locations: {
        main_0: {
          locationId: "main_0",
          locationType: "STORY_SET",
          sortId: 10,
          relevantStorySetId: "set_main_0",
        },
        event_before: {
          locationId: "event_before",
          locationType: "BEFORE",
          sortId: 19,
          relevantStorySetId: "set_event",
        },
        main_15: {
          locationId: "main_15",
          locationType: "STORY_SET",
          sortId: 20,
          relevantStorySetId: "set_main_activity",
        },
      },
    },
    ssLine_1: {
      storylineId: "ssLine_1",
      storylineType: "CONTINUE",
      sortId: 1,
      storylineName: "방주",
      locations: {
        event: {
          locationId: "event",
          locationType: "STORY_SET",
          sortId: 1010,
          relevantStorySetId: "set_event",
        },
      },
    },
  },
  storylineStorySets: {
    set_main_0: {
      storySetId: "set_main_0",
      mainlineData: { zoneId: "main_0" },
    },
    set_event: {
      storySetId: "set_event",
      relevantActivityId: "act_event",
      ssData: { name: "흑야의 회고록" },
    },
    set_main_activity: {
      storySetId: "set_main_activity",
      relevantActivityId: "act2mainss",
      mainlineData: { zoneId: null, retroId: "permanent_main_1_Dissociative_Recombination" },
    },
  },
};

const zoneTable = {
  zones: {
    act2mainss_zone1: {
      zoneID: "act2mainss_zone1",
      sixStarMilestoneGroupId: "main_15",
    },
  },
};

test("buildStorylineIndex separates primary memberships from flow references", () => {
  const storylines = buildStorylineIndex({
    groups,
    server: "kr",
    stageTable,
    storyReviewTable,
    zoneTable,
  });

  const mainLine = storylines.find((storyline) => storyline.storylineId === "mainLine");
  const arkLine = storylines.find((storyline) => storyline.storylineId === "ssLine_1");

  assert.equal(mainLine.title, "내일을 위하여");
  assert.deepEqual(
    mainLine.items.map((item) => [item.groupId, item.role, item.locationType]),
    [
      ["main_0", "primary", "STORY_SET"],
      ["act_event", "reference", "BEFORE"],
      ["main_15", "primary", "STORY_SET"],
    ],
  );
  assert.equal(mainLine.primaryGroupCount, 2);
  assert.equal(mainLine.referenceCount, 1);
  assert.equal(mainLine.totalVisibleCharacterCount, 2250);
  assert.equal(mainLine.estimatedMinutes, 5);

  assert.deepEqual(
    arkLine.items.map((item) => [item.groupId, item.role]),
    [["act_event", "primary"]],
  );
});

test("buildStorylineIndex adds synthetic operator and uncategorized storylines", () => {
  const storylines = buildStorylineIndex({
    groups,
    server: "kr",
    stageTable,
    storyReviewTable,
    zoneTable,
  });

  const operatorLine = storylines.find((storyline) => storyline.storylineId === "synthetic_operator_narratives");
  const uncategorizedLine = storylines.find((storyline) => storyline.storylineId === "synthetic_uncategorized");

  assert.equal(operatorLine.title, "오퍼레이터 서사");
  assert.equal(operatorLine.isSynthetic, true);
  assert.deepEqual(operatorLine.items.map((item) => item.groupId), ["story_amiya_set_1"]);

  assert.equal(uncategorizedLine.title, "미분류");
  assert.equal(uncategorizedLine.isSynthetic, true);
  assert.deepEqual(uncategorizedLine.items.map((item) => item.groupId), ["act_unmatched"]);

  assert.equal(storylines.at(-1).storylineId, "synthetic_operator_narratives");
});
