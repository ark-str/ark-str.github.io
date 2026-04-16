import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  getGeneratedFilePaths,
  resolveStorySource,
  selectStoryTitle,
  writeGeneratedArtifacts,
} from "../../scripts/content/lib.mjs";

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

test("writeGeneratedArtifacts keeps story payloads out of app-internal generated content", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ark-str-generated-"));
  const artifacts = {
    index: {
      generatedAt: "2026-04-16T00:00:00.000Z",
      vendor: {
        source: "ArknightsAssets/ArknightsGamedata",
        submodulePath: "vendor/ArknightsData",
        submoduleSha: "abc123",
        servers: [],
      },
      groups: [],
      stories: [
        {
          server: "en",
          storyId: "story-a",
          groupId: "group-a",
          stageId: null,
          title: "Story A",
          sortKey: 1,
          sourcePath: "vendor/ArknightsData/en/gamedata/story/story-a.txt",
          sourceHash: "deadbeef",
          sourceExists: true,
          sourceBasis: "file",
          storyCode: null,
          avgTag: null,
          bodyPath: "stories/en/story-a.json",
          bodyAvailable: true,
        },
      ],
    },
    sourceManifest: {
      generatedAt: "2026-04-16T00:00:00.000Z",
      vendor: { submoduleSha: "abc123" },
      items: [],
    },
    summaryManifest: {
      generatedAt: "2026-04-16T00:00:00.000Z",
      vendor: { submoduleSha: "abc123" },
      items: [],
    },
    storyDetails: [
      {
        locale: "en",
        storyId: "story-a",
        filePath: "stories/en/story-a.json",
        detail: {
          server: "en",
          storyId: "story-a",
          groupId: "group-a",
          stageId: null,
          title: "Story A",
          storyCode: null,
          avgTag: null,
          sourcePath: "vendor/ArknightsData/en/gamedata/story/story-a.txt",
          sourceHash: "deadbeef",
          bodyAvailable: true,
          blocks: [],
          observedOperators: [],
        },
      },
    ],
  };

  writeGeneratedArtifacts(artifacts, root);
  const filePaths = getGeneratedFilePaths(root);

  assert.equal(
    fs.existsSync(path.join(filePaths.contentRoot, "stories", "en", "story-a.json")),
    true,
  );
  assert.equal(fs.existsSync(path.join(filePaths.appContentRoot, "stories")), false);
  assert.match(fs.readFileSync(filePaths.appRegistry, "utf8"), /"en:story-a": "stories\/en\/story-a\.json"/);
});
