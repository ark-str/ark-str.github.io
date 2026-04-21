import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { collectObservedOperators, parseStoryText } from "./story-parser.mjs";
import { buildStorylineIndex } from "./storyline-index.mjs";

export const ARKNIGHTS_DATA_SUBMODULE_PATH = "vendor/ArknightsGamedata";
export const ARKNIGHTS_DATA_REMOTE = "https://github.com/ArknightsAssets/ArknightsGamedata.git";
export const ARKNIGHTS_DATA_BRANCH = "master";
export const PORTRAIT_SOURCE_PATH = "vendor/ArknightsResource";
export const PORTRAIT_SOURCE_REMOTE = "https://github.com/fexli/ArknightsResource.git";
export const PORTRAIT_SOURCE_BRANCH = "main";
export const PORTRAIT_NPCS_DIRECTORY = path.join("avgs", "npcs");
export const BACKGROUND_SOURCE_DIRECTORY = path.join("avgs", "bg");
export const PORTRAIT_CACHE_MARKER = ".ark-str-portrait-cache.json";
export const CANONICAL_READER_LOCALES = ["cn", "en", "jp", "kr", "tw"];

export function getRepoRoot() {
  return process.cwd();
}

function getHarnessHostRoot(cwd = getRepoRoot()) {
  const marker = `${path.sep}.harness-worktrees${path.sep}`;
  const markerIndex = cwd.indexOf(marker);
  return markerIndex === -1 ? cwd : cwd.slice(0, markerIndex);
}

function toRepoRelativePath(absolutePath, cwd = getRepoRoot()) {
  return path.relative(getHarnessHostRoot(cwd), absolutePath).replaceAll("\\", "/");
}

function hasGitWorkingTree(rootPath) {
  return fs.existsSync(path.join(rootPath, ".git"));
}

function resolveSourceRoot(cwd, relativeRootPath) {
  const directRoot = path.join(cwd, relativeRootPath);
  if (hasGitWorkingTree(directRoot)) {
    return directRoot;
  }

  const hostRoot = getHarnessHostRoot(cwd);
  if (hostRoot !== cwd) {
    const hostCandidate = path.join(hostRoot, relativeRootPath);
    if (hasGitWorkingTree(hostCandidate)) {
      return hostCandidate;
    }
  }

  return directRoot;
}

function resolveWorkspacePath(cwd, relativePath) {
  const directPath = path.join(cwd, relativePath);
  if (fs.existsSync(directPath)) {
    return directPath;
  }

  const hostRoot = getHarnessHostRoot(cwd);
  if (hostRoot !== cwd) {
    const hostPath = path.join(hostRoot, relativePath);
    if (fs.existsSync(hostPath)) {
      return hostPath;
    }
  }

  return directPath;
}

export function getArknightsDataRoot(cwd = getRepoRoot()) {
  return resolveSourceRoot(cwd, ARKNIGHTS_DATA_SUBMODULE_PATH);
}

export function getPortraitSourceRoot(cwd = getRepoRoot()) {
  return resolveSourceRoot(cwd, PORTRAIT_SOURCE_PATH);
}

export function getPortraitNpcSourceRoot(cwd = getRepoRoot()) {
  return path.join(getPortraitSourceRoot(cwd), PORTRAIT_NPCS_DIRECTORY);
}

export function getBackgroundSourceRoot(cwd = getRepoRoot()) {
  return path.join(getPortraitSourceRoot(cwd), BACKGROUND_SOURCE_DIRECTORY);
}

export function getPortraitCacheMarkerPath(cwd = getRepoRoot()) {
  return path.join(getPortraitSourceRoot(cwd), PORTRAIT_CACHE_MARKER);
}

export function getGeneratedContentRoot(cwd = getRepoRoot()) {
  return path.join(cwd, "ark-str-web-app", "public", "generated", "content");
}

export function getGeneratedPortraitsRoot(cwd = getRepoRoot()) {
  return path.join(cwd, "ark-str-web-app", "public", "generated", "portraits", "speakers");
}

export function getNormalizedPortraitFileName(speakerId) {
  if (typeof speakerId !== "string") {
    return null;
  }

  const normalizedSpeakerId = speakerId.trim();
  if (normalizedSpeakerId.length === 0) {
    return null;
  }

  return `${normalizedSpeakerId.toLowerCase()}.png`;
}

export function getGeneratedPortraitPublicPath(speakerId) {
  const normalizedFileName = getNormalizedPortraitFileName(speakerId);
  return normalizedFileName ? `/generated/portraits/speakers/${normalizedFileName}` : null;
}

export function getGeneratedBackgroundsRoot(cwd = getRepoRoot()) {
  return path.join(cwd, "ark-str-web-app", "public", "generated", "backgrounds");
}

export function getNormalizedBackgroundFileName(backgroundId) {
  if (typeof backgroundId !== "string") {
    return null;
  }

  const normalizedBackgroundId = backgroundId.trim();
  if (normalizedBackgroundId.length === 0) {
    return null;
  }

  return `${normalizedBackgroundId.toLowerCase()}.png`;
}

export function getGeneratedBackgroundPublicPath(backgroundId) {
  const normalizedFileName = getNormalizedBackgroundFileName(backgroundId);
  return normalizedFileName ? `/generated/backgrounds/${normalizedFileName}` : null;
}

export function getGeneratedAppContentRoot(cwd = getRepoRoot()) {
  return path.join(cwd, "ark-str-web-app", "src", "generated", "content");
}

export function getGeneratedStatusRoot(cwd = getRepoRoot()) {
  return path.join(getGeneratedContentRoot(cwd), "status");
}

export function getGeneratedStoriesRoot(cwd = getRepoRoot()) {
  return path.join(getGeneratedContentRoot(cwd), "stories");
}

export function getGeneratedFilePaths(cwd = getRepoRoot()) {
  const contentRoot = getGeneratedContentRoot(cwd);
  const statusRoot = getGeneratedStatusRoot(cwd);
  const storiesRoot = getGeneratedStoriesRoot(cwd);
  const appContentRoot = getGeneratedAppContentRoot(cwd);
  const generatedPortraitsRoot = getGeneratedPortraitsRoot(cwd);
  const generatedBackgroundsRoot = getGeneratedBackgroundsRoot(cwd);

  return {
    contentRoot,
    statusRoot,
    storiesRoot,
    appContentRoot,
    generatedPortraitsRoot,
    generatedBackgroundsRoot,
    index: path.join(contentRoot, "index.json"),
    sourceManifest: path.join(statusRoot, "source-manifest.json"),
    summaryManifest: path.join(statusRoot, "summary-manifest.json"),
    appIndex: path.join(appContentRoot, "index.json"),
    appSummaryManifest: path.join(appContentRoot, "summary-manifest.json"),
    appPortraitManifest: path.join(appContentRoot, "portraits.json"),
    appBackgroundManifest: path.join(appContentRoot, "backgrounds.json"),
    appRegistry: path.join(appContentRoot, "registry.js"),
  };
}

export function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, value) {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function hasArknightsDataSource(cwd = getRepoRoot()) {
  return hasGitWorkingTree(getArknightsDataRoot(cwd));
}

export function hasPortraitSource(cwd = getRepoRoot()) {
  return hasGitWorkingTree(getPortraitSourceRoot(cwd));
}

function runGit(args, { cwd = getRepoRoot(), stdio = "pipe" } = {}) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: stdio === "pipe" ? "utf8" : undefined,
    shell: false,
    stdio,
  });

  if (result.status !== 0) {
    throw new Error(
      (typeof result.stderr === "string" && result.stderr.trim()) ||
        `git ${args.join(" ")} failed with status ${result.status ?? "unknown"}`,
    );
  }

  return result;
}

function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function hashFile(filePath) {
  return hashBuffer(fs.readFileSync(filePath));
}

export function hashJson(value) {
  return hashBuffer(Buffer.from(JSON.stringify(value)));
}

function getSubmoduleSha(cwd, submoduleRoot, missingCheck, missingMessage) {
  if (!missingCheck(cwd)) {
    return null;
  }

  const result = spawnSync("git", ["-C", submoduleRoot(cwd), "rev-parse", "HEAD"], {
    cwd,
    encoding: "utf8",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || missingMessage);
  }

  return result.stdout.trim();
}

export function getArknightsDataSubmoduleSha(cwd = getRepoRoot()) {
  return getSubmoduleSha(
    cwd,
    getArknightsDataRoot,
    hasArknightsDataSource,
    "Unable to resolve ArknightsGamedata submodule SHA",
  );
}

export function getPortraitSourceRevision(cwd = getRepoRoot()) {
  if (!hasPortraitSource(cwd)) {
    return null;
  }

  return runGit(["-C", getPortraitSourceRoot(cwd), "rev-parse", "HEAD"], { cwd }).stdout.trim();
}

export function ensurePortraitSourceCache(
  cwd = getRepoRoot(),
  { remote = false } = {},
) {
  const portraitRoot = getPortraitSourceRoot(cwd);
  const portraitNpcRoot = getPortraitNpcSourceRoot(cwd);
  const backgroundRoot = getBackgroundSourceRoot(cwd);
  const cacheMarkerPath = getPortraitCacheMarkerPath(cwd);

  const rebuildCache = () => {
    fs.rmSync(portraitRoot, { recursive: true, force: true });
    ensureDirectory(path.dirname(portraitRoot));
    runGit(
      [
        "clone",
        "--depth",
        "1",
        "--filter=blob:none",
        "--no-checkout",
        PORTRAIT_SOURCE_REMOTE,
        portraitRoot,
      ],
      { cwd, stdio: "inherit" },
    );
    writeJson(cacheMarkerPath, {
      source: PORTRAIT_SOURCE_REMOTE,
      branch: PORTRAIT_SOURCE_BRANCH,
      directories: [PORTRAIT_NPCS_DIRECTORY, BACKGROUND_SOURCE_DIRECTORY],
    });
  };

  if (!hasPortraitSource(cwd)) {
    rebuildCache();
    return;
  }

  if (
    remote ||
    !fs.existsSync(portraitNpcRoot) ||
    !fs.existsSync(backgroundRoot) ||
    !fs.existsSync(cacheMarkerPath)
  ) {
    rebuildCache();
    return;
  }

  try {
    const cacheMarker = readJson(cacheMarkerPath);
    if (
      cacheMarker?.source !== PORTRAIT_SOURCE_REMOTE ||
      cacheMarker?.branch !== PORTRAIT_SOURCE_BRANCH ||
      JSON.stringify(cacheMarker?.directories ?? []) !==
        JSON.stringify([PORTRAIT_NPCS_DIRECTORY, BACKGROUND_SOURCE_DIRECTORY])
    ) {
      rebuildCache();
    }
  } catch {
    rebuildCache();
  }
}

function listTrackedPortraitFiles(cwd = getRepoRoot()) {
  const portraitNpcRoot = getPortraitNpcSourceRoot(cwd);

  if (!hasPortraitSource(cwd)) {
    if (!fs.existsSync(portraitNpcRoot)) {
      return [];
    }

    return fs
      .readdirSync(portraitNpcRoot)
      .filter((fileName) => fileName.endsWith(".png"))
      .map((fileName) => path.join(PORTRAIT_NPCS_DIRECTORY, fileName).replaceAll("\\", "/"));
  }

  return runGit(["-C", getPortraitSourceRoot(cwd), "ls-tree", "-r", "--name-only", "HEAD", PORTRAIT_NPCS_DIRECTORY], {
    cwd,
  }).stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.endsWith(".png"));
}

function listTrackedBackgroundFiles(cwd = getRepoRoot()) {
  const backgroundRoot = getBackgroundSourceRoot(cwd);

  if (!hasPortraitSource(cwd)) {
    if (!fs.existsSync(backgroundRoot)) {
      return [];
    }

    return fs
      .readdirSync(backgroundRoot)
      .filter((fileName) => fileName.endsWith(".png"))
      .map((fileName) => path.join(BACKGROUND_SOURCE_DIRECTORY, fileName).replaceAll("\\", "/"));
  }

  return runGit(
    ["-C", getPortraitSourceRoot(cwd), "ls-tree", "-r", "--name-only", "HEAD", BACKGROUND_SOURCE_DIRECTORY],
    { cwd },
  ).stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.endsWith(".png"));
}

function selectPortraitMatch(speakerId, trackedPortraitFiles) {
  const normalizedSpeakerId =
    typeof speakerId === "string" && speakerId.trim().length > 0 ? speakerId.trim() : null;

  if (!normalizedSpeakerId) {
    return null;
  }

  const normalizedSpeakerIdLower = normalizedSpeakerId.toLowerCase();
  const matches = trackedPortraitFiles.filter((relativePath) => {
    const basename = path.basename(relativePath, ".png");
    const basenameLower = basename.toLowerCase();
    return (
      basenameLower === normalizedSpeakerIdLower ||
      basenameLower.startsWith(`${normalizedSpeakerIdLower}_`)
    );
  });

  if (matches.length === 0) {
    return null;
  }

  return matches.sort((left, right) =>
    path.basename(left).localeCompare(path.basename(right)),
  )[0];
}

function readTrackedResourceFile(relativeResourcePath, cwd = getRepoRoot()) {
  const portraitRoot = getPortraitSourceRoot(cwd);
  const sourceFilePath = path.join(portraitRoot, relativeResourcePath);

  if (fs.existsSync(sourceFilePath)) {
    return fs.readFileSync(sourceFilePath);
  }

  if (!hasPortraitSource(cwd)) {
    return null;
  }

  const result = spawnSync(
    "git",
    ["-C", portraitRoot, "show", `HEAD:${relativeResourcePath}`],
    {
      cwd,
      encoding: null,
      maxBuffer: 64 * 1024 * 1024,
      shell: false,
    },
  );

  if (result.status !== 0 || !result.stdout) {
    return null;
  }

  const resourceBuffer = Buffer.from(result.stdout);
  ensureDirectory(path.dirname(sourceFilePath));
  fs.writeFileSync(sourceFilePath, resourceBuffer);
  return resourceBuffer;
}

function readTrackedPortraitFile(relativePortraitPath, cwd = getRepoRoot()) {
  return readTrackedResourceFile(relativePortraitPath, cwd);
}

function selectBackgroundMatch(backgroundId, trackedBackgroundFiles) {
  const normalizedBackgroundId =
    typeof backgroundId === "string" && backgroundId.trim().length > 0 ? backgroundId.trim() : null;

  if (!normalizedBackgroundId) {
    return null;
  }

  const normalizedBackgroundIdLower = normalizedBackgroundId.toLowerCase();
  const matches = trackedBackgroundFiles.filter((relativePath) => {
    const basename = path.basename(relativePath, ".png");
    const basenameLower = basename.toLowerCase();
    return (
      basenameLower === normalizedBackgroundIdLower ||
      basenameLower.startsWith(`${normalizedBackgroundIdLower}_`)
    );
  });

  if (matches.length === 0) {
    return null;
  }

  return matches.sort((left, right) => path.basename(left).localeCompare(path.basename(right)))[0];
}

function readTrackedBackgroundFile(relativeBackgroundPath, cwd = getRepoRoot()) {
  return readTrackedResourceFile(relativeBackgroundPath, cwd);
}

export function getRequiredExcelPaths(serverRoot) {
  const excelRoot = path.join(serverRoot, "gamedata", "excel");

  return {
    storyReviewTable: path.join(excelRoot, "story_review_table.json"),
    storyReviewMetaTable: path.join(excelRoot, "story_review_meta_table.json"),
    stageTable: path.join(excelRoot, "stage_table.json"),
    storyTable: path.join(excelRoot, "story_table.json"),
    zoneTable: path.join(excelRoot, "zone_table.json"),
  };
}

export function getServerRoots(cwd = getRepoRoot()) {
  if (!hasArknightsDataSource(cwd)) {
    return [];
  }

  const dataRoot = getArknightsDataRoot(cwd);
  const candidates = fs
    .readdirSync(dataRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => ({
      server: entry.name,
      root: path.join(dataRoot, entry.name),
    }))
    .sort((left, right) => left.server.localeCompare(right.server));

  return candidates.filter(({ root }) => {
    const required = getRequiredExcelPaths(root);
    return Object.values(required).every((filePath) => fs.existsSync(filePath));
  });
}

export function selectStoryTitle(unlockData, stage) {
  const candidateName =
    typeof unlockData.storyName === "string" && unlockData.storyName.trim().length > 0
      ? unlockData.storyName.trim()
      : null;

  if (candidateName) {
    return candidateName;
  }

  const stageName =
    typeof stage?.name === "string" && stage.name.trim().length > 0 ? stage.name.trim() : null;

  return stageName ?? unlockData.storyId;
}

function isCanonicalReaderLocale(server) {
  return CANONICAL_READER_LOCALES.includes(server);
}

function createStoryBodyPath(server, storyId) {
  return path.join("stories", server, `${storyId}.json`).replaceAll("\\", "/");
}

export function resolveStorySource({
  cwd = getRepoRoot(),
  server,
  storyInfo,
  storyTableEntry,
  storyTxt,
  storyId,
  unlockData,
}) {
  const dataRoot = getArknightsDataRoot(cwd);
  const candidatePaths = [];

  if (typeof storyTxt === "string" && storyTxt.length > 0) {
    candidatePaths.push(
      path.join(dataRoot, server, "gamedata", "story", `${storyTxt}.txt`),
    );
  }

  if (typeof storyInfo === "string" && storyInfo.length > 0) {
    candidatePaths.push(
      path.join(
        dataRoot,
        server,
        "gamedata",
        "story",
        `[uc]${storyInfo}.txt`,
      ),
    );
    candidatePaths.push(
      path.join(dataRoot, server, "gamedata", "story", `${storyInfo}.txt`),
    );
  }

  if (candidatePaths.length === 0) {
    candidatePaths.push(
      path.join(dataRoot, server, "gamedata", "story", `${storyId}.txt`),
    );
  }

  const existingPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath)) ?? null;
  const sourcePath = toRepoRelativePath(existingPath ?? candidatePaths[0], cwd);

  if (existingPath) {
    return {
      sourcePath,
      sourceExists: true,
      sourceBasis: "file",
      sourceHash: hashFile(existingPath),
    };
  }

  return {
    sourcePath,
    sourceExists: false,
    sourceBasis: "metadata",
    sourceHash: hashJson({
      storyId,
      storyTxt,
      storyInfo,
      storyTableEntry: storyTableEntry ?? null,
      unlockData,
    }),
  };
}

function collectSpeakerIdsFromBlocks(blocks, accumulator) {
  for (const block of blocks) {
    if (block.type === "dialogue") {
      if (typeof block.speakerId === "string" && block.speakerId.length > 0) {
        accumulator.add(block.speakerId);
      }
      continue;
    }

    if (block.type === "choice") {
      for (const option of block.options) {
        collectSpeakerIdsFromBlocks(option.blocks, accumulator);
      }
    }
  }
}

function collectBackgroundIdsFromBlocks(blocks, accumulator) {
  for (const block of blocks) {
    if (block.type === "background") {
      if (typeof block.backgroundId === "string" && block.backgroundId.length > 0) {
        accumulator.add(block.backgroundId);
      }
      continue;
    }

    if (block.type === "choice") {
      for (const option of block.options) {
        collectBackgroundIdsFromBlocks(option.blocks, accumulator);
      }
    }
  }
}

function collectReferencedSpeakerIds(storyDetails) {
  const speakerIds = new Set();

  for (const storyDetail of storyDetails) {
    collectSpeakerIdsFromBlocks(storyDetail.detail.blocks ?? [], speakerIds);
  }

  return speakerIds;
}

function collectReferencedBackgroundIds(storyDetails) {
  const backgroundIds = new Set();

  for (const storyDetail of storyDetails) {
    collectBackgroundIdsFromBlocks(storyDetail.detail.blocks ?? [], backgroundIds);
  }

  return backgroundIds;
}

function collectReferencedPortraitPaths(storyDetails, cwd = getRepoRoot()) {
  const portraitPaths = {};
  const speakerIds = collectReferencedSpeakerIds(storyDetails);
  const trackedPortraitFiles = listTrackedPortraitFiles(cwd);

  for (const speakerId of [...speakerIds].filter(Boolean).sort((left, right) => left.localeCompare(right))) {
    const portraitMatch = selectPortraitMatch(speakerId, trackedPortraitFiles);
    if (!portraitMatch) {
      continue;
    }

    const publicPath = getGeneratedPortraitPublicPath(speakerId);
    if (!publicPath) {
      continue;
    }

    portraitPaths[speakerId] = publicPath;
  }

  return portraitPaths;
}

function collectReferencedBackgroundPaths(storyDetails, cwd = getRepoRoot()) {
  const backgroundPaths = {};
  const backgroundIds = collectReferencedBackgroundIds(storyDetails);
  const trackedBackgroundFiles = listTrackedBackgroundFiles(cwd);

  for (const backgroundId of [...backgroundIds].filter(Boolean).sort((left, right) => left.localeCompare(right))) {
    const backgroundMatch = selectBackgroundMatch(backgroundId, trackedBackgroundFiles);
    if (!backgroundMatch) {
      continue;
    }

    const publicPath = getGeneratedBackgroundPublicPath(backgroundId);
    if (!publicPath) {
      continue;
    }

    backgroundPaths[backgroundId] = publicPath;
  }

  return backgroundPaths;
}

function countVisibleCharactersFromBlocks(blocks) {
  let total = 0;

  for (const block of blocks ?? []) {
    if (block?.type === "dialogue" || block?.type === "narration") {
      total += typeof block.text === "string" ? block.text.length : 0;
      continue;
    }

    if (block?.type === "choice") {
      for (const option of block.options ?? []) {
        total += countVisibleCharactersFromBlocks(option.blocks ?? []);
      }
    }
  }

  return total;
}

function estimateReadingMinutes(visibleCharacterCount) {
  if (!Number.isFinite(visibleCharacterCount) || visibleCharacterCount <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(visibleCharacterCount / 450));
}

export function buildContentArtifacts(
  cwd = getRepoRoot(),
  { ensurePortraitSource = false, remotePortraitSource = false } = {},
) {
  if (!hasArknightsDataSource(cwd)) {
    throw new Error("vendor/ArknightsGamedata is not initialized. Run `npm run content:sync` first.");
  }

  const generatedAt = new Date().toISOString();
  const submoduleSha = getArknightsDataSubmoduleSha(cwd);
  const serverRoots = getServerRoots(cwd);

  const serverSummaries = [];
  const groupItems = [];
  const storylineItems = [];
  const storyItems = [];
  const sourceItems = [];
  const summaryItems = [];
  const storyDetails = [];

  for (const { server, root } of serverRoots) {
    const requiredPaths = getRequiredExcelPaths(root);
    const storyReviewTable = readJson(requiredPaths.storyReviewTable);
    readJson(requiredPaths.storyReviewMetaTable);
    const stageTable = readJson(requiredPaths.stageTable);
    const storyTable = readJson(requiredPaths.storyTable);
    const zoneTable = readJson(requiredPaths.zoneTable);

    let groupCount = 0;
    let storyCount = 0;
    const serverGroupItems = [];

    const isReaderLocale = isCanonicalReaderLocale(server);

    for (const [groupId, groupRecord] of Object.entries(storyReviewTable)) {
      const unlockDatas = Array.isArray(groupRecord.infoUnlockDatas) ? groupRecord.infoUnlockDatas : [];
      groupCount += 1;
      storyCount += unlockDatas.length;
      let totalVisibleCharacterCount = 0;

      for (const unlockData of unlockDatas) {
        const stageId = unlockData.requiredStages?.[0]?.stageId ?? null;
        const stage = stageId ? stageTable.stages?.[stageId] ?? null : null;
        const source = resolveStorySource({
          cwd,
          server,
          storyInfo: unlockData.storyInfo,
          storyTableEntry: unlockData.storyTxt ? storyTable[unlockData.storyTxt] ?? null : null,
          storyTxt: unlockData.storyTxt,
          storyId: unlockData.storyId,
          unlockData,
        });

        const bodyPath = isReaderLocale ? createStoryBodyPath(server, unlockData.storyId) : null;
        let visibleCharacterCount = 0;
        let estimatedMinutes = 0;

        const story = {
          server,
          storyId: unlockData.storyId,
          groupId,
          stageId,
          title: selectStoryTitle(unlockData, stage),
          sortKey: unlockData.storySort ?? 0,
          sourcePath: source.sourcePath,
          sourceHash: source.sourceHash,
          sourceExists: source.sourceExists,
          sourceBasis: source.sourceBasis,
          storyCode: unlockData.storyCode ?? stage?.code ?? null,
          avgTag: unlockData.avgTag ?? null,
          bodyPath,
          bodyAvailable: isReaderLocale && source.sourceExists,
          visibleCharacterCount,
          estimatedMinutes,
        };

        if (isReaderLocale) {
          sourceItems.push({
            server,
            storyId: story.storyId,
            sourcePath: story.sourcePath,
            sourceHash: story.sourceHash,
            sourceExists: story.sourceExists,
            sourceBasis: story.sourceBasis,
            bodyPath,
            bodyAvailable: story.bodyAvailable,
            generatedAt,
          });
          summaryItems.push({
            server,
            storyId: story.storyId,
            sourceHash: story.sourceHash,
            status: "missing",
          });

          if (source.sourceExists) {
            const sourceFilePath = resolveWorkspacePath(cwd, source.sourcePath);
            const parsedBlocks = parseStoryText(fs.readFileSync(sourceFilePath, "utf8"));
            visibleCharacterCount = countVisibleCharactersFromBlocks(parsedBlocks);
            estimatedMinutes = estimateReadingMinutes(visibleCharacterCount);
            story.visibleCharacterCount = visibleCharacterCount;
            story.estimatedMinutes = estimatedMinutes;
            totalVisibleCharacterCount += visibleCharacterCount;
            storyDetails.push({
              locale: server,
              storyId: story.storyId,
              filePath: bodyPath,
              detail: {
                server,
                storyId: story.storyId,
                groupId,
                stageId,
                title: story.title,
                storyCode: story.storyCode,
                avgTag: story.avgTag,
                sourcePath: story.sourcePath,
                sourceHash: story.sourceHash,
                bodyAvailable: true,
                blocks: parsedBlocks,
                observedOperators: collectObservedOperators(parsedBlocks),
              },
            });
          }

          storyItems.push(story);
        }
      }

      if (isReaderLocale) {
        const groupItem = {
          server,
          groupId,
          title: groupRecord.name ?? groupId,
          entryType: groupRecord.entryType ?? null,
          actType: groupRecord.actType ?? null,
          startTime: groupRecord.startTime ?? null,
          endTime: groupRecord.endTime ?? null,
          storyCount: unlockDatas.length,
          totalVisibleCharacterCount,
          estimatedMinutes: estimateReadingMinutes(totalVisibleCharacterCount),
        };
        groupItems.push(groupItem);
        serverGroupItems.push(groupItem);
      }
    }

    if (isReaderLocale) {
      storylineItems.push(
        ...buildStorylineIndex({
          groups: serverGroupItems,
          server,
          stageTable,
          storyReviewTable,
          zoneTable,
        }),
      );
    }

    serverSummaries.push({
      server,
      groupCount,
      storyCount,
      inputHashes: {
        storyReviewTable: hashFile(requiredPaths.storyReviewTable),
        storyReviewMetaTable: hashFile(requiredPaths.storyReviewMetaTable),
        stageTable: hashFile(requiredPaths.stageTable),
        storyTable: hashFile(requiredPaths.storyTable),
        zoneTable: hashFile(requiredPaths.zoneTable),
      },
    });
  }

  const sortByKey = (left, right) =>
    left.server.localeCompare(right.server) ||
    left.groupId.localeCompare(right.groupId) ||
    left.sortKey - right.sortKey ||
    left.storyId.localeCompare(right.storyId);

  groupItems.sort((left, right) => left.server.localeCompare(right.server) || left.groupId.localeCompare(right.groupId));
  storylineItems.sort(
    (left, right) =>
      left.server.localeCompare(right.server) ||
      left.sortKey - right.sortKey ||
      left.storylineId.localeCompare(right.storylineId),
  );
  storyItems.sort(sortByKey);
  sourceItems.sort((left, right) => left.server.localeCompare(right.server) || left.storyId.localeCompare(right.storyId));
  summaryItems.sort((left, right) => left.server.localeCompare(right.server) || left.storyId.localeCompare(right.storyId));

  if (
    ensurePortraitSource &&
    (collectReferencedSpeakerIds(storyDetails).size > 0 ||
      collectReferencedBackgroundIds(storyDetails).size > 0)
  ) {
    ensurePortraitSourceCache(cwd, { remote: remotePortraitSource });
  }

  const portraitPaths = collectReferencedPortraitPaths(storyDetails, cwd);
  const backgroundPaths = collectReferencedBackgroundPaths(storyDetails, cwd);

  return {
    index: {
      generatedAt,
      vendor: {
        source: "ArknightsAssets/ArknightsGamedata",
        submodulePath: ARKNIGHTS_DATA_SUBMODULE_PATH,
        submoduleSha,
        servers: serverSummaries,
      },
      groups: groupItems,
      storylines: storylineItems,
      stories: storyItems,
    },
    sourceManifest: {
      generatedAt,
      vendor: {
        submoduleSha,
      },
      items: sourceItems,
    },
    summaryManifest: {
      generatedAt,
      vendor: {
        submoduleSha,
      },
      items: summaryItems,
    },
    storyDetails,
    portraitPaths,
    backgroundPaths,
  };
}

export function loadGeneratedArtifacts(cwd = getRepoRoot()) {
  const filePaths = getGeneratedFilePaths(cwd);

  return {
    index: readJson(filePaths.index),
    sourceManifest: readJson(filePaths.sourceManifest),
    summaryManifest: readJson(filePaths.summaryManifest),
  };
}

function createGeneratedRegistrySource(stories, portraitPaths, backgroundPaths) {
  const pathEntries = stories
    .slice()
    .sort(
      (left, right) =>
        left.server.localeCompare(right.server) || left.storyId.localeCompare(right.storyId),
    )
    .filter((story) => story.bodyAvailable && typeof story.bodyPath === "string" && story.bodyPath.length > 0)
    .map(
      (story) =>
        `  ${JSON.stringify(
          `${story.server}:${story.storyId}`,
        )}: ${JSON.stringify(story.bodyPath)},`,
    );
  const portraitEntries = Object.entries(portraitPaths)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([speakerId, portraitPath]) =>
        `  ${JSON.stringify(speakerId)}: ${JSON.stringify(portraitPath)},`,
    );
  const backgroundEntries = Object.entries(backgroundPaths)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([backgroundId, backgroundPath]) =>
        `  ${JSON.stringify(backgroundId)}: ${JSON.stringify(backgroundPath)},`,
    );

  return [
    "// @ts-nocheck",
    "/* This file is generated by the content pipeline scripts. */",
    "import contentIndexData from \"./index.json\";",
    "import backgroundManifestData from \"./backgrounds.json\";",
    "import portraitManifestData from \"./portraits.json\";",
    "import summaryManifestData from \"./summary-manifest.json\";",
    "",
    "export const contentIndex = contentIndexData;",
    "export const backgroundManifest = backgroundManifestData;",
    "export const portraitManifest = portraitManifestData;",
    "export const summaryManifest = summaryManifestData;",
    "",
    "export const storyDetailPaths = {",
    ...pathEntries,
    "};",
    "",
    "export const portraitPaths = {",
    ...portraitEntries,
    "};",
    "",
    "export const backgroundPaths = {",
    ...backgroundEntries,
    "};",
    "",
    "export function getStoryDetailPath(locale, storyId) {",
    "  return storyDetailPaths[`${locale}:${storyId}`] ?? null;",
    "}",
    "",
    "export function hasBackgroundForBackgroundId(backgroundId) {",
    "  return typeof backgroundId === \"string\" && Object.hasOwn(backgroundPaths, backgroundId);",
    "}",
    "",
    "export function getBackgroundPathForBackgroundId(backgroundId) {",
    "  return hasBackgroundForBackgroundId(backgroundId) ? backgroundPaths[backgroundId] : null;",
    "}",
    "",
    "export function hasPortraitForSpeakerId(speakerId) {",
    "  return typeof speakerId === \"string\" && Object.hasOwn(portraitPaths, speakerId);",
    "}",
    "",
    "export function getPortraitPathForSpeakerId(speakerId) {",
    "  return hasPortraitForSpeakerId(speakerId) ? portraitPaths[speakerId] : null;",
    "}",
    "",
  ].join("\n");
}

export function writeGeneratedArtifacts(artifacts, cwd = getRepoRoot()) {
  const filePaths = getGeneratedFilePaths(cwd);
  ensureDirectory(filePaths.contentRoot);
  ensureDirectory(filePaths.statusRoot);
  fs.rmSync(filePaths.storiesRoot, { recursive: true, force: true });
  ensureDirectory(filePaths.storiesRoot);
  fs.rmSync(filePaths.generatedPortraitsRoot, { recursive: true, force: true });
  ensureDirectory(filePaths.generatedPortraitsRoot);
  fs.rmSync(filePaths.generatedBackgroundsRoot, { recursive: true, force: true });
  ensureDirectory(filePaths.generatedBackgroundsRoot);
  fs.rmSync(filePaths.appContentRoot, { recursive: true, force: true });
  ensureDirectory(filePaths.appContentRoot);
  writeJson(filePaths.index, artifacts.index);
  writeJson(filePaths.sourceManifest, artifacts.sourceManifest);
  writeJson(filePaths.summaryManifest, artifacts.summaryManifest);
  writeJson(filePaths.appIndex, artifacts.index);
  writeJson(filePaths.appSummaryManifest, artifacts.summaryManifest);
  writeJson(filePaths.appBackgroundManifest, artifacts.backgroundPaths ?? {});
  writeJson(filePaths.appPortraitManifest, artifacts.portraitPaths ?? {});

  const trackedPortraitFiles = listTrackedPortraitFiles(cwd);
  const trackedBackgroundFiles = listTrackedBackgroundFiles(cwd);

  for (const storyDetail of artifacts.storyDetails ?? []) {
    writeJson(path.join(filePaths.contentRoot, storyDetail.filePath), storyDetail.detail);
  }

  for (const [speakerId, publicPath] of Object.entries(artifacts.portraitPaths ?? {})) {
    const relativePortraitPath = selectPortraitMatch(
      speakerId,
      trackedPortraitFiles,
    );
    if (!relativePortraitPath) {
      continue;
    }

    const portraitFileBuffer = readTrackedPortraitFile(relativePortraitPath, cwd);
    if (!portraitFileBuffer) {
      continue;
    }

    const targetFilePath = path.join(cwd, "ark-str-web-app", "public", publicPath.replace(/^\//, ""));
    ensureDirectory(path.dirname(targetFilePath));
    fs.writeFileSync(targetFilePath, portraitFileBuffer);
  }

  for (const [backgroundId, publicPath] of Object.entries(artifacts.backgroundPaths ?? {})) {
    const relativeBackgroundPath = selectBackgroundMatch(backgroundId, trackedBackgroundFiles);
    if (!relativeBackgroundPath) {
      continue;
    }

    const backgroundFileBuffer = readTrackedBackgroundFile(relativeBackgroundPath, cwd);
    if (!backgroundFileBuffer) {
      continue;
    }

    const targetFilePath = path.join(cwd, "ark-str-web-app", "public", publicPath.replace(/^\//, ""));
    ensureDirectory(path.dirname(targetFilePath));
    fs.writeFileSync(targetFilePath, backgroundFileBuffer);
  }

  fs.writeFileSync(
    filePaths.appRegistry,
    `${createGeneratedRegistrySource(
      artifacts.index.stories ?? [],
      artifacts.portraitPaths ?? {},
      artifacts.backgroundPaths ?? {},
    )}\n`,
    "utf8",
  );
}
