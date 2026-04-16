import { buildContentArtifacts, hasArknightsDataSource, loadGeneratedArtifacts } from "./lib.mjs";

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildStoryMap(items) {
  return new Map(items.map((item) => [`${item.server}:${item.storyId}`, item]));
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
  }
}

function validateGeneratedArtifacts(generated) {
  invariant(Array.isArray(generated.index.vendor.servers), "index.vendor.servers must be an array");
  invariant(Array.isArray(generated.index.groups), "index.groups must be an array");
  invariant(Array.isArray(generated.index.stories), "index.stories must be an array");
  invariant(Array.isArray(generated.sourceManifest.items), "source-manifest items must be an array");
  invariant(Array.isArray(generated.summaryManifest.items), "summary-manifest items must be an array");

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
    invariant(typeof story.sourceHash === "string" && story.sourceHash.length > 0, "story.sourceHash must be present");
  }

  for (const item of generated.sourceManifest.items) {
    const key = `${item.server}:${item.storyId}`;
    const story = storyMap.get(key);
    invariant(story, `source-manifest item ${key} is missing from index stories`);
    invariant(item.sourceHash === story.sourceHash, `source-manifest hash mismatch for ${key}`);
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
}

const generated = loadGeneratedArtifacts(process.cwd());
validateGeneratedArtifacts(generated);

if (hasArknightsDataSource(process.cwd())) {
  compareLiveArtifacts(generated, buildContentArtifacts(process.cwd()));
}

console.log("content check passed");
