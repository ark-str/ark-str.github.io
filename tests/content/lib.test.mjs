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
    "ArknightsGamedata",
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
    "vendor/ArknightsGamedata/en/gamedata/story/activities/test/story.txt",
  );
});

test("resolveStorySource keeps vendor-relative paths when called from a harness worktree", () => {
  const hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ark-str-host-"));
  const worktreeRoot = path.join(hostRoot, ".harness-worktrees", "issue-38");
  fs.mkdirSync(worktreeRoot, { recursive: true });
  fs.mkdirSync(path.join(hostRoot, "vendor", "ArknightsGamedata"), { recursive: true });
  fs.writeFileSync(path.join(hostRoot, "vendor", "ArknightsGamedata", ".git"), "gitdir: mocked");

  const storyPath = path.join(
    hostRoot,
    "vendor",
    "ArknightsGamedata",
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
    cwd: worktreeRoot,
    server: "en",
    storyInfo: "info/activities/test/story",
    storyTableEntry: null,
    storyTxt: "activities/test/story",
    storyId: "story-id",
    unlockData: { storyId: "story-id" },
  });

  assert.equal(resolved.sourceExists, true);
  assert.equal(
    resolved.sourcePath,
    "vendor/ArknightsGamedata/en/gamedata/story/activities/test/story.txt",
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
        submodulePath: "vendor/ArknightsGamedata",
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
          sourcePath: "vendor/ArknightsGamedata/en/gamedata/story/story-a.txt",
          sourceHash: "deadbeef",
          sourceExists: true,
          sourceBasis: "file",
          storyCode: null,
          avgTag: null,
          bodyPath: "stories/en/story-a.json",
          bodyAvailable: true,
          visibleCharacterCount: 180,
          estimatedMinutes: 1,
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
          sourcePath: "vendor/ArknightsGamedata/en/gamedata/story/story-a.txt",
          sourceHash: "deadbeef",
          bodyAvailable: true,
          blocks: [],
          observedOperators: [],
        },
      },
    ],
    portraitPaths: {
      char_002_amiya: "/generated/portraits/speakers/char_002_amiya.png",
      avg_npc_175: "/generated/portraits/speakers/avg_npc_175.png",
    },
  };

  fs.mkdirSync(path.join(root, "vendor", "ArknightsResource", "avgs", "npcs"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, "vendor", "ArknightsResource", "avgs", "npcs", "char_002_amiya_1_2.png"),
    "char-second",
  );
  fs.writeFileSync(
    path.join(root, "vendor", "ArknightsResource", "avgs", "npcs", "char_002_amiya_1_1.png"),
    "char-first",
  );
  fs.writeFileSync(
    path.join(root, "vendor", "ArknightsResource", "avgs", "npcs", "avg_npc_175_175.png"),
    "npc-first",
  );

  writeGeneratedArtifacts(artifacts, root);
  const filePaths = getGeneratedFilePaths(root);

  assert.equal(
    fs.existsSync(path.join(filePaths.contentRoot, "stories", "en", "story-a.json")),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(filePaths.generatedPortraitsRoot, "char_002_amiya.png")),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(filePaths.generatedPortraitsRoot, "avg_npc_175.png")),
    true,
  );
  assert.equal(
    fs.readFileSync(path.join(filePaths.generatedPortraitsRoot, "char_002_amiya.png"), "utf8"),
    "char-first",
  );
  assert.equal(
    fs.readFileSync(path.join(filePaths.generatedPortraitsRoot, "avg_npc_175.png"), "utf8"),
    "npc-first",
  );
  assert.equal(fs.existsSync(path.join(filePaths.appContentRoot, "stories")), false);
  assert.match(fs.readFileSync(filePaths.appRegistry, "utf8"), /"en:story-a": "stories\/en\/story-a\.json"/);
  assert.match(
    fs.readFileSync(filePaths.appRegistry, "utf8"),
    /"char_002_amiya": "\/generated\/portraits\/speakers\/char_002_amiya\.png"/,
  );
  assert.match(
    fs.readFileSync(filePaths.appRegistry, "utf8"),
    /"avg_npc_175": "\/generated\/portraits\/speakers\/avg_npc_175\.png"/,
  );
});
