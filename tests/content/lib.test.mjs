import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { resolveStorySource, selectStoryTitle } from "../../scripts/content/lib.mjs";

test("selectStoryTitle prefers storyName then stage name then storyId", () => {
  assert.equal(
    selectStoryTitle({ storyId: "story-a", storyName: "Named Story" }, { name: "Stage Name" }),
    "Named Story",
  );
  assert.equal(
    selectStoryTitle({ storyId: "story-b", storyName: "" }, { name: "Stage Name" }),
    "Stage Name",
  );
  assert.equal(selectStoryTitle({ storyId: "story-c" }, null), "story-c");
});

test("resolveStorySource uses the existing story file when present", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ark-str-content-"));
  const storyPath = path.join(
    root,
    "vendor",
    "ArknightsData",
    "en",
    "gamedata",
    "story",
    "activities",
    "test",
    "story.txt",
  );
  fs.mkdirSync(path.dirname(storyPath), { recursive: true });
  fs.writeFileSync(storyPath, "story-body");

  const resolved = resolveStorySource({
    cwd: root,
    server: "en",
    storyInfo: "info/activities/test/story",
    storyTableEntry: null,
    storyTxt: "activities/test/story",
    storyId: "story-id",
    unlockData: { storyId: "story-id" },
  });

  assert.equal(resolved.sourceExists, true);
  assert.equal(resolved.sourceBasis, "file");
  assert.equal(
    resolved.sourcePath,
    "vendor/ArknightsData/en/gamedata/story/activities/test/story.txt",
  );
});

test("resolveStorySource falls back to metadata hashing when the file is missing", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ark-str-content-"));

  const resolved = resolveStorySource({
    cwd: root,
    server: "en",
    storyInfo: "info/activities/test/story",
    storyTableEntry: { id: "activities/test/story" },
    storyTxt: "activities/test/story",
    storyId: "story-id",
    unlockData: { storyId: "story-id", storySort: 1 },
  });

  assert.equal(resolved.sourceExists, false);
  assert.equal(resolved.sourceBasis, "metadata");
  assert.match(resolved.sourceHash, /^[0-9a-f]{64}$/);
});
