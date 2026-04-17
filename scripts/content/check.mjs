import fs from "node:fs";
import path from "node:path";
import {
  buildContentArtifacts,
  getGeneratedFilePaths,
  hasArknightsDataSource,
  hasPortraitSource,
  loadGeneratedArtifacts,
} from "./lib.mjs";

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function estimateReadingMinutes(visibleCharacterCount) {
  if (!Number.isFinite(visibleCharacterCount) || visibleCharacterCount <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(visibleCharacterCount / 450));
}

function buildStoryMap(items) {
  return new Map(items.map((item) => [`${item.server}:${item.storyId}`, item]));
}

function collectSpeakerIdsFromBlocks(blocks, accumulator) {
  for (const block of blocks) {
    if (block?.type === "dialogue") {
      if (typeof block.speakerId === "string" && block.speakerId.length > 0) {
        accumulator.add(block.speakerId);
      }
      continue;
    }

    if (block?.type === "choice") {
      for (const option of block.options ?? []) {
        collectSpeakerIdsFromBlocks(option.blocks ?? [], accumulator);
      }
    }
  }
}

function collectBackgroundIdsFromBlocks(blocks, accumulator) {
  for (const block of blocks) {
    if (block?.type === "background") {
      if (typeof block.backgroundId === "string" && block.backgroundId.length > 0) {
        accumulator.add(block.backgroundId);
      }
      continue;
    }

    if (block?.type === "choice") {
      for (const option of block.options ?? []) {
        collectBackgroundIdsFromBlocks(option.blocks ?? [], accumulator);
      }
    }
  }
}

function compareLiveArtifacts(generated, live) {
  invariant(
    generated.index.vendor.submoduleSha === live.index.vendor.submoduleSha,
    `Generated vendor SHA ${generated.index.vendor.submoduleSha} does not match live vendor SHA ${live.index.vendor.submoduleSha}`,
  );
  invariant(
    generated.index.stories.length === live.index.stories.length,
    "Generated story count does not match live vendor-derived story count",
  );
  invariant(
    generated.index.groups.length === live.index.groups.length,
    "Generated group count does not match live vendor-derived group count",
  );

  const generatedStories = buildStoryMap(generated.index.stories);
  for (const liveStory of live.index.stories) {
    const key = `${liveStory.server}:${liveStory.storyId}`;
    const generatedStory = generatedStories.get(key);

    invariant(generatedStory, `Missing generated story entry for ${key}`);
    invariant(
      generatedStory.sourceHash === liveStory.sourceHash,
      `Generated source hash drift detected for ${key}`,
    );
    invariant(
      generatedStory.sourcePath === liveStory.sourcePath,
      `Generated source path drift detected for ${key}`,
    );
    invariant(generatedStory.title === liveStory.title, `Generated title drift detected for ${key}`);
    invariant(
      generatedStory.visibleCharacterCount === liveStory.visibleCharacterCount,
      `Generated visible character count drift detected for ${key}`,
    );
    invariant(
      generatedStory.estimatedMinutes === liveStory.estimatedMinutes,
      `Generated estimated minutes drift detected for ${key}`,
    );
  }

  const generatedGroups = new Map(
    generated.index.groups.map((group) => [`${group.server}:${group.groupId}`, group]),
  );
  for (const liveGroup of live.index.groups) {
    const key = `${liveGroup.server}:${liveGroup.groupId}`;
    const generatedGroup = generatedGroups.get(key);

    invariant(generatedGroup, `Missing generated group entry for ${key}`);
    invariant(
      generatedGroup.totalVisibleCharacterCount === liveGroup.totalVisibleCharacterCount,
      `Generated group visible character count drift detected for ${key}`,
    );
    invariant(
      generatedGroup.estimatedMinutes === liveGroup.estimatedMinutes,
      `Generated group estimated minutes drift detected for ${key}`,
    );
  }

  if (hasPortraitSource(process.cwd())) {
    invariant(
      JSON.stringify(live.backgroundPaths ?? {}) ===
        JSON.stringify(JSON.parse(fs.readFileSync(getGeneratedFilePaths(process.cwd()).appBackgroundManifest, "utf8"))),
      "Generated background manifest does not match live vendor-derived background availability",
    );
    invariant(
      JSON.stringify(live.portraitPaths ?? {}) ===
        JSON.stringify(JSON.parse(fs.readFileSync(getGeneratedFilePaths(process.cwd()).appPortraitManifest, "utf8"))),
      "Generated portrait manifest does not match live vendor-derived portrait availability",
    );
  }
}

function validateGeneratedArtifacts(generated) {
  const filePaths = getGeneratedFilePaths(process.cwd());
  invariant(Array.isArray(generated.index.vendor.servers), "index.vendor.servers must be an array");
  invariant(Array.isArray(generated.index.groups), "index.groups must be an array");
  invariant(Array.isArray(generated.index.stories), "index.stories must be an array");
  invariant(Array.isArray(generated.sourceManifest.items), "source-manifest items must be an array");
  invariant(Array.isArray(generated.summaryManifest.items), "summary-manifest items must be an array");
  invariant(fs.existsSync(filePaths.appIndex), "app-generated index.json is missing");
  invariant(fs.existsSync(filePaths.appSummaryManifest), "app-generated summary-manifest.json is missing");
  invariant(fs.existsSync(filePaths.appBackgroundManifest), "app-generated backgrounds.json is missing");
  invariant(fs.existsSync(filePaths.appPortraitManifest), "app-generated portraits.json is missing");
  invariant(fs.existsSync(filePaths.appRegistry), "app-generated registry.js is missing");
  invariant(
    !fs.existsSync(path.join(filePaths.appContentRoot, "stories")),
    "app-generated story mirror directory must not exist",
  );

  const appIndex = JSON.parse(fs.readFileSync(filePaths.appIndex, "utf8"));
  const appSummaryManifest = JSON.parse(fs.readFileSync(filePaths.appSummaryManifest, "utf8"));
  const appBackgroundManifest = JSON.parse(fs.readFileSync(filePaths.appBackgroundManifest, "utf8"));
  const appPortraitManifest = JSON.parse(fs.readFileSync(filePaths.appPortraitManifest, "utf8"));
  invariant(
    JSON.stringify(appIndex) === JSON.stringify(generated.index),
    "app-generated index.json does not match the published generated index",
  );
  invariant(
    JSON.stringify(appSummaryManifest) === JSON.stringify(generated.summaryManifest),
    "app-generated summary-manifest.json does not match the published generated summary manifest",
  );
  invariant(appBackgroundManifest && typeof appBackgroundManifest === "object", "app-generated backgrounds.json must be an object");
  invariant(appPortraitManifest && typeof appPortraitManifest === "object", "app-generated portraits.json must be an object");

  invariant(
    generated.index.stories.length === generated.sourceManifest.items.length,
    "index stories and source-manifest items must have the same length",
  );
  invariant(
    generated.index.stories.length === generated.summaryManifest.items.length,
    "index stories and summary-manifest items must have the same length",
  );

  const storyMap = buildStoryMap(generated.index.stories);

  for (const story of generated.index.stories) {
    invariant(typeof story.server === "string" && story.server.length > 0, "story.server must be present");
    invariant(typeof story.storyId === "string" && story.storyId.length > 0, "story.storyId must be present");
    invariant(typeof story.groupId === "string" && story.groupId.length > 0, "story.groupId must be present");
    invariant(typeof story.title === "string" && story.title.length > 0, "story.title must be present");
    invariant(typeof story.sourcePath === "string" && story.sourcePath.length > 0, "story.sourcePath must be present");
    invariant(
      story.sourcePath.startsWith("vendor/ArknightsGamedata/"),
      "story.sourcePath must stay repository-relative under vendor/ArknightsGamedata/",
    );
    invariant(typeof story.sourceHash === "string" && story.sourceHash.length > 0, "story.sourceHash must be present");
    invariant(typeof story.bodyAvailable === "boolean", "story.bodyAvailable must be present");
    invariant(
      Number.isInteger(story.visibleCharacterCount) && story.visibleCharacterCount >= 0,
      "story.visibleCharacterCount must be a non-negative integer",
    );
    invariant(
      Number.isInteger(story.estimatedMinutes) && story.estimatedMinutes >= 0,
      "story.estimatedMinutes must be a non-negative integer",
    );
    invariant(
      story.bodyPath === null || (typeof story.bodyPath === "string" && story.bodyPath.length > 0),
      "story.bodyPath must be null or a non-empty string",
    );
  }

  for (const group of generated.index.groups) {
    invariant(
      Number.isInteger(group.totalVisibleCharacterCount) && group.totalVisibleCharacterCount >= 0,
      "group.totalVisibleCharacterCount must be a non-negative integer",
    );
    invariant(
      Number.isInteger(group.estimatedMinutes) && group.estimatedMinutes >= 0,
      "group.estimatedMinutes must be a non-negative integer",
    );
    invariant(
      group.estimatedMinutes === estimateReadingMinutes(group.totalVisibleCharacterCount),
      "group.estimatedMinutes must match the generated visible character total",
    );
  }

  for (const item of generated.sourceManifest.items) {
    const key = `${item.server}:${item.storyId}`;
    const story = storyMap.get(key);
    invariant(story, `source-manifest item ${key} is missing from index stories`);
    invariant(item.sourceHash === story.sourceHash, `source-manifest hash mismatch for ${key}`);
    invariant(item.bodyAvailable === story.bodyAvailable, `source-manifest body availability mismatch for ${key}`);
  }

  for (const item of generated.summaryManifest.items) {
    const key = `${item.server}:${item.storyId}`;
    const story = storyMap.get(key);
    invariant(story, `summary-manifest item ${key} is missing from index stories`);
    invariant(item.sourceHash === story.sourceHash, `summary-manifest hash mismatch for ${key}`);
    invariant(
      item.status === "missing" || item.status === "ready" || item.status === "stale",
      `summary-manifest status is invalid for ${key}`,
    );
  }

  for (const story of generated.index.stories) {
    if (!story.bodyPath || !story.bodyAvailable) {
      continue;
    }

    const bodyFilePath = path.join(process.cwd(), "ark-str-web-app", "public", "generated", "content", story.bodyPath);
    invariant(fs.existsSync(bodyFilePath), `story detail file is missing for ${story.server}:${story.storyId}`);

    const body = JSON.parse(fs.readFileSync(bodyFilePath, "utf8"));
    invariant(body.storyId === story.storyId, `story detail storyId mismatch for ${story.server}:${story.storyId}`);
    invariant(body.server === story.server, `story detail locale mismatch for ${story.server}:${story.storyId}`);
    invariant(Array.isArray(body.blocks), `story detail blocks must be an array for ${story.server}:${story.storyId}`);
    invariant(
      Array.isArray(body.observedOperators),
      `story detail observedOperators must be an array for ${story.server}:${story.storyId}`,
    );

    for (const block of body.blocks) {
      if (block?.type !== "dialogue") {
        if (block?.type === "choice") {
          invariant(!Object.hasOwn(block, "sharedBlocks"), `legacy sharedBlocks found for ${story.server}:${story.storyId}`);
        }

        if (block?.type === "background") {
          invariant(
            typeof block.backgroundId === "string" && block.backgroundId.length > 0,
            `background block backgroundId is invalid for ${story.server}:${story.storyId}`,
          );
        }
        continue;
      }

      invariant(Object.hasOwn(block, "speakerId"), `dialogue block speakerId is missing for ${story.server}:${story.storyId}`);
      invariant(typeof block.isRemote === "boolean", `dialogue block isRemote is missing for ${story.server}:${story.storyId}`);
      invariant(!Object.hasOwn(block, "speakerToken"), `legacy speakerToken found for ${story.server}:${story.storyId}`);
      invariant(!Object.hasOwn(block, "operatorId"), `legacy operatorId found for ${story.server}:${story.storyId}`);
      invariant(!Object.hasOwn(block, "portraitKey"), `legacy portraitKey found for ${story.server}:${story.storyId}`);
    }

    for (const observedOperator of body.observedOperators) {
      invariant(
        typeof observedOperator?.speakerId === "string" && observedOperator.speakerId.length > 0,
        `observed operator speakerId is invalid for ${story.server}:${story.storyId}`,
      );
      invariant(
        observedOperator.speakerId.startsWith("char_"),
        `observed operator speakerId must be char-only for ${story.server}:${story.storyId}`,
      );
      invariant(
        Array.isArray(observedOperator.aliases),
        `observed operator aliases must be an array for ${story.server}:${story.storyId}`,
      );
      invariant(
        !Object.hasOwn(observedOperator, "operatorId") && !Object.hasOwn(observedOperator, "speakerTokens"),
        `legacy observed operator fields found for ${story.server}:${story.storyId}`,
      );
    }
  }

  const portraitSpeakerIds = new Set(
    generated.index.stories
      .filter((story) => story.bodyAvailable && story.bodyPath)
      .flatMap((story) => {
        const bodyFilePath = path.join(process.cwd(), "ark-str-web-app", "public", "generated", "content", story.bodyPath);
        const body = JSON.parse(fs.readFileSync(bodyFilePath, "utf8"));
        const speakerIds = new Set();
        collectSpeakerIdsFromBlocks(body.blocks ?? [], speakerIds);
        return [...speakerIds];
      }),
  );
  const backgroundIds = new Set(
    generated.index.stories
      .filter((story) => story.bodyAvailable && story.bodyPath)
      .flatMap((story) => {
        const bodyFilePath = path.join(process.cwd(), "ark-str-web-app", "public", "generated", "content", story.bodyPath);
        const body = JSON.parse(fs.readFileSync(bodyFilePath, "utf8"));
        const ids = new Set();
        collectBackgroundIdsFromBlocks(body.blocks ?? [], ids);
        return [...ids];
      }),
  );

  for (const speakerId of Object.keys(appPortraitManifest)) {
    invariant(portraitSpeakerIds.has(speakerId), `portrait manifest references an unobserved speakerId: ${speakerId}`);
    const portraitFilePath = path.join(filePaths.generatedPortraitsRoot, `${speakerId}.png`);
    invariant(fs.existsSync(portraitFilePath), `portrait file is missing for ${speakerId}`);
  }

  for (const backgroundId of Object.keys(appBackgroundManifest)) {
    invariant(backgroundIds.has(backgroundId), `background manifest references an unobserved backgroundId: ${backgroundId}`);
    const backgroundFilePath = path.join(filePaths.generatedBackgroundsRoot, `${backgroundId}.png`);
    invariant(fs.existsSync(backgroundFilePath), `background file is missing for ${backgroundId}`);
  }
}

const generated = loadGeneratedArtifacts(process.cwd());
validateGeneratedArtifacts(generated);

if (hasArknightsDataSource(process.cwd())) {
  compareLiveArtifacts(generated, buildContentArtifacts(process.cwd()));
}

if (!hasPortraitSource(process.cwd())) {
  console.warn(
    "content check warning: vendor/ArknightsResource portrait cache is not initialized; portrait availability was validated against generated artifacts only.",
  );
}

console.log("content check passed");
