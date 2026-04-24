import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  collectReferencedGroupBackgroundPaths,
  getGeneratedFilePaths,
  getGeneratedBackgroundPublicPath,
  getGeneratedGroupBackgroundPublicPath,
  getGeneratedPortraitPublicPath,
  resolveStorySource,
  selectStoryTitle,
  writeGeneratedArtifacts,
} from "../../scripts/content/lib.mjs";

function createPngHeader(width, height) {
  const buffer = Buffer.alloc(24);
  buffer.set([0x89, 0x50, 0x4e, 0x47], 0);
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

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

test("writeGeneratedArtifacts keeps story payloads out of app-internal generated content", async () => {
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
      char_002_amiya: "/generated/portraits/speakers/char_002_amiya.webp",
      avg_npc_175: "/generated/portraits/speakers/avg_npc_175.webp",
    },
  };

  fs.mkdirSync(path.join(root, "vendor", "ArknightsResource", "avgs", "npcs"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, "vendor", "ArknightsResource", "avgs", "npcs", "char_002_amiya_1_2.png"),
    tinyPng,
  );
  fs.writeFileSync(
    path.join(root, "vendor", "ArknightsResource", "avgs", "npcs", "char_002_amiya_1_1.png"),
    tinyPng,
  );
  fs.writeFileSync(
    path.join(root, "vendor", "ArknightsResource", "avgs", "npcs", "avg_npc_175_175.png"),
    tinyPng,
  );

  await writeGeneratedArtifacts(artifacts, root);
  const filePaths = getGeneratedFilePaths(root);

  assert.equal(
    fs.existsSync(path.join(filePaths.contentRoot, "stories", "en", "story-a.json")),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(filePaths.generatedPortraitsRoot, "char_002_amiya.webp")),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(filePaths.generatedPortraitsRoot, "avg_npc_175.webp")),
    true,
  );
  assert.equal(fs.existsSync(path.join(root, "ark-str-web-app", "public", "generated", "portraits", "assistant")), false);
  assert.equal(fs.existsSync(path.join(filePaths.appContentRoot, "stories")), false);
  assert.match(fs.readFileSync(filePaths.appRegistry, "utf8"), /"en:story-a": "stories\/en\/story-a\.json"/);
  assert.match(
    fs.readFileSync(filePaths.appRegistry, "utf8"),
    /"char_002_amiya": "\/generated\/portraits\/speakers\/char_002_amiya\.webp"/,
  );
  assert.match(
    fs.readFileSync(filePaths.appRegistry, "utf8"),
    /"avg_npc_175": "\/generated\/portraits\/speakers\/avg_npc_175\.webp"/,
  );
  assert.deepEqual(JSON.parse(fs.readFileSync(filePaths.assetManifest, "utf8")).portraits, artifacts.portraitPaths);
});

test("writeGeneratedArtifacts normalizes portrait filenames for mixed-case speaker ids", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ark-str-generated-"));
  const artifacts = {
    index: {
      generatedAt: "2026-04-18T00:00:00.000Z",
      vendor: {
        source: "ArknightsAssets/ArknightsGamedata",
        submodulePath: "vendor/ArknightsGamedata",
        submoduleSha: "abc123",
        servers: [],
      },
      groups: [],
      stories: [],
    },
    sourceManifest: {
      generatedAt: "2026-04-18T00:00:00.000Z",
      vendor: { submoduleSha: "abc123" },
      items: [],
    },
    summaryManifest: {
      generatedAt: "2026-04-18T00:00:00.000Z",
      vendor: { submoduleSha: "abc123" },
      items: [],
    },
    storyDetails: [],
    portraitPaths: {
      AVG_4081_WARMY_1: getGeneratedPortraitPublicPath("AVG_4081_WARMY_1"),
      avg_4081_warmy_1: getGeneratedPortraitPublicPath("avg_4081_warmy_1"),
    },
  };

  fs.mkdirSync(path.join(root, "vendor", "ArknightsResource", "avgs", "npcs"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, "vendor", "ArknightsResource", "avgs", "npcs", "AVG_4081_WARMY_1_1.png"),
    tinyPng,
  );

  await writeGeneratedArtifacts(artifacts, root);
  const filePaths = getGeneratedFilePaths(root);
  const portraitManifest = JSON.parse(fs.readFileSync(filePaths.appPortraitManifest, "utf8"));
  const generatedPortraitFileNames = fs.readdirSync(filePaths.generatedPortraitsRoot).sort();

  assert.equal(
    fs.existsSync(path.join(filePaths.generatedPortraitsRoot, "avg_4081_warmy_1.webp")),
    true,
  );
  assert.deepEqual(generatedPortraitFileNames, ["avg_4081_warmy_1.webp"]);
  assert.equal(
    portraitManifest.AVG_4081_WARMY_1,
    "/generated/portraits/speakers/avg_4081_warmy_1.webp",
  );
  assert.equal(
    portraitManifest.avg_4081_warmy_1,
    "/generated/portraits/speakers/avg_4081_warmy_1.webp",
  );
});

test("writeGeneratedArtifacts normalizes background filenames for mixed-case background ids", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ark-str-generated-"));
  const artifacts = {
    index: {
      generatedAt: "2026-04-18T00:00:00.000Z",
      vendor: {
        source: "ArknightsAssets/ArknightsGamedata",
        submodulePath: "vendor/ArknightsGamedata",
        submoduleSha: "abc123",
        servers: [],
      },
      groups: [],
      stories: [],
    },
    sourceManifest: {
      generatedAt: "2026-04-18T00:00:00.000Z",
      vendor: { submoduleSha: "abc123" },
      items: [],
    },
    summaryManifest: {
      generatedAt: "2026-04-18T00:00:00.000Z",
      vendor: { submoduleSha: "abc123" },
      items: [],
    },
    storyDetails: [],
    portraitPaths: {},
    backgroundPaths: {
      "27_i01": getGeneratedBackgroundPublicPath("27_i01"),
      "38_g21_skyStarry_R1": getGeneratedBackgroundPublicPath("38_g21_skyStarry_R1"),
      "38_g21_skystarry_r1": getGeneratedBackgroundPublicPath("38_g21_skystarry_r1"),
    },
  };

  fs.mkdirSync(path.join(root, "vendor", "ArknightsResource", "avgs", "bg"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, "vendor", "ArknightsResource", "avgs", "bg", "38_g21_skyStarry_R1.png"),
    tinyPng,
  );
  fs.writeFileSync(
    path.join(root, "vendor", "ArknightsResource", "avgs", "27_i01.png"),
    tinyPng,
  );

  await writeGeneratedArtifacts(artifacts, root);
  const filePaths = getGeneratedFilePaths(root);
  const backgroundManifest = JSON.parse(fs.readFileSync(filePaths.appBackgroundManifest, "utf8"));
  const generatedBackgroundFileNames = fs.readdirSync(filePaths.generatedBackgroundsRoot).sort();

  assert.deepEqual(generatedBackgroundFileNames, ["27_i01.webp", "38_g21_skystarry_r1.webp"]);
  assert.equal(
    backgroundManifest["27_i01"],
    "/generated/backgrounds/27_i01.webp",
  );
  assert.equal(
    backgroundManifest["38_g21_skyStarry_R1"],
    "/generated/backgrounds/38_g21_skystarry_r1.webp",
  );
  assert.equal(
    backgroundManifest["38_g21_skystarry_r1"],
    "/generated/backgrounds/38_g21_skystarry_r1.webp",
  );
});

test("writeGeneratedArtifacts copies inferred group background images from resource art", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ark-str-generated-"));
  const groupBackgroundPath = getGeneratedGroupBackgroundPublicPath("title_stultifera_navis");
  const artifacts = {
    index: {
      generatedAt: "2026-04-22T00:00:00.000Z",
      vendor: {
        source: "ArknightsAssets/ArknightsGamedata",
        submodulePath: "vendor/ArknightsGamedata",
        submoduleSha: "abc123",
        servers: [],
      },
      groups: [
        {
          server: "en",
          groupId: "act17side",
          title: "Stultifera Navis",
          entryType: "ACTIVITY",
          actType: "SIDE_STORY",
          startTime: null,
          endTime: null,
          backgroundImageId: "title_stultifera_navis",
          backgroundImageAspect: "wide",
          backgroundImagePath: groupBackgroundPath,
          storyCount: 1,
          totalVisibleCharacterCount: 450,
          estimatedMinutes: 1,
        },
      ],
      stories: [],
    },
    sourceManifest: {
      generatedAt: "2026-04-22T00:00:00.000Z",
      vendor: { submoduleSha: "abc123" },
      items: [],
    },
    summaryManifest: {
      generatedAt: "2026-04-22T00:00:00.000Z",
      vendor: { submoduleSha: "abc123" },
      items: [],
    },
    storyDetails: [],
    portraitPaths: {},
    backgroundPaths: {},
    groupBackgroundPaths: {
      "en:act17side": {
        backgroundImageId: "title_stultifera_navis",
        backgroundImageAspect: "wide",
        backgroundImagePath: groupBackgroundPath,
        sourcePath: "mapreview/act17side_01.png",
        sourceType: "vendor",
      },
    },
  };

  fs.mkdirSync(path.join(root, "vendor", "ArknightsResource", "mapreview"), {
    recursive: true,
  });
  fs.writeFileSync(path.join(root, "vendor", "ArknightsResource", "mapreview", "act17side_01.png"), tinyPng);

  await writeGeneratedArtifacts(artifacts, root);
  const filePaths = getGeneratedFilePaths(root);

  assert.equal(fs.existsSync(path.join(filePaths.generatedGroupBackgroundsRoot, "title_stultifera_navis.webp")), true);
});

test("collectReferencedGroupBackgroundPaths prefers project group overrides", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ark-str-generated-"));
  const groupBackgroundCandidates = new Map([
    [
      "en:act17side",
      [
        {
          backgroundImageId: "title_stultifera_navis",
          backgroundImageAspect: "wide",
          sourceIds: ["27_kv"],
        },
      ],
    ],
  ]);

  fs.mkdirSync(path.join(root, "assets", "group-backgrounds"), { recursive: true });
  fs.mkdirSync(path.join(root, "vendor", "ArknightsResource", "avgs"), { recursive: true });
  fs.writeFileSync(path.join(root, "assets", "group-backgrounds", "act17side.png"), createPngHeader(256, 256));
  fs.writeFileSync(path.join(root, "vendor", "ArknightsResource", "avgs", "27_kv.png"), createPngHeader(1600, 900));

  const groupBackgroundPaths = collectReferencedGroupBackgroundPaths(groupBackgroundCandidates, root);

  assert.deepEqual(groupBackgroundPaths["en:act17side"], {
    backgroundImageId: "act17side",
    backgroundImageAspect: "square",
    backgroundImagePath: "/generated/group-backgrounds/act17side.webp",
    sourcePath: "assets/group-backgrounds/act17side.png",
    sourceType: "project",
  });
});
