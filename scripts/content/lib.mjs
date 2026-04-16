import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { collectObservedOperators, parseStoryText } from "./story-parser.mjs";

export const ARKNIGHTS_DATA_SUBMODULE_PATH = "vendor/ArknightsGamedata";
export const ARKNIGHTS_DATA_REMOTE = "https://github.com/ArknightsAssets/ArknightsGamedata.git";
export const ARKNIGHTS_DATA_BRANCH = "master";
export const PORTRAIT_SOURCE_PATH = "vendor/ArknightsResource";
export const PORTRAIT_SOURCE_REMOTE = "https://github.com/fexli/ArknightsResource.git";
export const PORTRAIT_SOURCE_BRANCH = "main";
export const PORTRAIT_ASSISTANT_DIRECTORY = path.join("avatar", "ASSISTANT");
export const CANONICAL_READER_LOCALES = ["cn", "en", "jp", "kr", "tw"];

export function getRepoRoot() {
  return process.cwd();
}

export function getArknightsDataRoot(cwd = getRepoRoot()) {
  return path.join(cwd, ARKNIGHTS_DATA_SUBMODULE_PATH);
}

export function getPortraitSourceRoot(cwd = getRepoRoot()) {
  return path.join(cwd, PORTRAIT_SOURCE_PATH);
}

export function getPortraitAssistantSourceRoot(cwd = getRepoRoot()) {
  return path.join(getPortraitSourceRoot(cwd), PORTRAIT_ASSISTANT_DIRECTORY);
}

export function getGeneratedContentRoot(cwd = getRepoRoot()) {
  return path.join(cwd, "ark-str-web-app", "public", "generated", "content");
}

export function getGeneratedPortraitsRoot(cwd = getRepoRoot()) {
  return path.join(cwd, "ark-str-web-app", "public", "generated", "portraits", "assistant");
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

  return {
    contentRoot,
    statusRoot,
    storiesRoot,
    appContentRoot,
    generatedPortraitsRoot,
    index: path.join(contentRoot, "index.json"),
    sourceManifest: path.join(statusRoot, "source-manifest.json"),
    summaryManifest: path.join(statusRoot, "summary-manifest.json"),
    appIndex: path.join(appContentRoot, "index.json"),
    appSummaryManifest: path.join(appContentRoot, "summary-manifest.json"),
    appPortraitManifest: path.join(appContentRoot, "portraits.json"),
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
  return fs.existsSync(path.join(getArknightsDataRoot(cwd), ".git"));
}

export function hasPortraitSource(cwd = getRepoRoot()) {
  return fs.existsSync(path.join(getPortraitSourceRoot(cwd), ".git"));
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
  const assistantRoot = getPortraitAssistantSourceRoot(cwd);

  if (!hasPortraitSource(cwd)) {
    ensureDirectory(path.dirname(portraitRoot));
    runGit(
      [
        "clone",
        "--depth",
        "1",
        "--filter=blob:none",
        "--sparse",
        PORTRAIT_SOURCE_REMOTE,
        portraitRoot,
      ],
      { cwd, stdio: "inherit" },
    );
  } else if (remote) {
    runGit(["-C", portraitRoot, "fetch", "origin", PORTRAIT_SOURCE_BRANCH, "--depth", "1"], {
      cwd,
      stdio: "inherit",
    });
    runGit(["-C", portraitRoot, "checkout", "--force", "FETCH_HEAD"], {
      cwd,
      stdio: "inherit",
    });
  }

  runGit(["-C", portraitRoot, "sparse-checkout", "set", PORTRAIT_ASSISTANT_DIRECTORY], {
    cwd,
    stdio: "inherit",
  });
  ensureDirectory(assistantRoot);
}

function materializePortraitFile(speakerId, cwd = getRepoRoot()) {
  const portraitRoot = getPortraitSourceRoot(cwd);
  const relativePortraitPath = path.join(PORTRAIT_ASSISTANT_DIRECTORY, `${speakerId}.png`).replaceAll("\\", "/");
  const sourceFilePath = path.join(portraitRoot, relativePortraitPath);

  if (fs.existsSync(sourceFilePath)) {
    return sourceFilePath;
  }

  if (!hasPortraitSource(cwd)) {
    return null;
  }

  const trackedFileCheck = spawnSync(
    "git",
    ["-C", portraitRoot, "cat-file", "-e", `HEAD:${relativePortraitPath}`],
    {
      cwd,
      stdio: "ignore",
      shell: false,
    },
  );

  if (trackedFileCheck.status !== 0) {
    return null;
  }

  runGit(["-C", portraitRoot, "checkout", "--force", "HEAD", "--", relativePortraitPath], {
    cwd,
    stdio: "inherit",
  });

  return fs.existsSync(sourceFilePath) ? sourceFilePath : null;
}

export function getRequiredExcelPaths(serverRoot) {
  const excelRoot = path.join(serverRoot, "gamedata", "excel");

  return {
    storyReviewTable: path.join(excelRoot, "story_review_table.json"),
    storyReviewMetaTable: path.join(excelRoot, "story_review_meta_table.json"),
    stageTable: path.join(excelRoot, "stage_table.json"),
    storyTable: path.join(excelRoot, "story_table.json"),
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
  const candidatePaths = [];

  if (typeof storyTxt === "string" && storyTxt.length > 0) {
    candidatePaths.push(
      path.join(cwd, ARKNIGHTS_DATA_SUBMODULE_PATH, server, "gamedata", "story", `${storyTxt}.txt`),
    );
  }

  if (typeof storyInfo === "string" && storyInfo.length > 0) {
    candidatePaths.push(
      path.join(
        cwd,
        ARKNIGHTS_DATA_SUBMODULE_PATH,
        server,
        "gamedata",
        "story",
        `[uc]${storyInfo}.txt`,
      ),
    );
    candidatePaths.push(
      path.join(cwd, ARKNIGHTS_DATA_SUBMODULE_PATH, server, "gamedata", "story", `${storyInfo}.txt`),
    );
  }

  if (candidatePaths.length === 0) {
    candidatePaths.push(
      path.join(cwd, ARKNIGHTS_DATA_SUBMODULE_PATH, server, "gamedata", "story", `${storyId}.txt`),
    );
  }

  const existingPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath)) ?? null;
  const sourcePath = path.relative(cwd, existingPath ?? candidatePaths[0]).replaceAll("\\", "/");

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

function collectReferencedSpeakerIds(storyDetails) {
  return new Set(
    storyDetails.flatMap((storyDetail) =>
      (storyDetail.detail.observedOperators ?? []).map((observedOperator) => observedOperator.speakerId),
    ),
  );
}

function collectReferencedPortraitPaths(storyDetails, cwd = getRepoRoot()) {
  const portraitPaths = {};

  const speakerIds = collectReferencedSpeakerIds(storyDetails);

  for (const speakerId of [...speakerIds].filter(Boolean).sort((left, right) => left.localeCompare(right))) {
    if (!materializePortraitFile(speakerId, cwd)) {
      continue;
    }

    portraitPaths[speakerId] = `/generated/portraits/assistant/${speakerId}.png`;
  }

  return portraitPaths;
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

    let groupCount = 0;
    let storyCount = 0;

    const isReaderLocale = isCanonicalReaderLocale(server);

    for (const [groupId, groupRecord] of Object.entries(storyReviewTable)) {
      const unlockDatas = Array.isArray(groupRecord.infoUnlockDatas) ? groupRecord.infoUnlockDatas : [];
      groupCount += 1;
      storyCount += unlockDatas.length;

      if (isReaderLocale) {
        groupItems.push({
          server,
          groupId,
          title: groupRecord.name ?? groupId,
          entryType: groupRecord.entryType ?? null,
          actType: groupRecord.actType ?? null,
          startTime: groupRecord.startTime ?? null,
          endTime: groupRecord.endTime ?? null,
          storyCount: unlockDatas.length,
        });
      }

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
        };

        if (isReaderLocale) {
          storyItems.push(story);
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
            const sourceFilePath = path.join(cwd, source.sourcePath);
            const parsedBlocks = parseStoryText(fs.readFileSync(sourceFilePath, "utf8"));
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
        }
      }
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
      },
    });
  }

  const sortByKey = (left, right) =>
    left.server.localeCompare(right.server) ||
    left.groupId.localeCompare(right.groupId) ||
    left.sortKey - right.sortKey ||
    left.storyId.localeCompare(right.storyId);

  groupItems.sort((left, right) => left.server.localeCompare(right.server) || left.groupId.localeCompare(right.groupId));
  storyItems.sort(sortByKey);
  sourceItems.sort((left, right) => left.server.localeCompare(right.server) || left.storyId.localeCompare(right.storyId));
  summaryItems.sort((left, right) => left.server.localeCompare(right.server) || left.storyId.localeCompare(right.storyId));

  if (ensurePortraitSource && collectReferencedSpeakerIds(storyDetails).size > 0) {
    ensurePortraitSourceCache(cwd, { remote: remotePortraitSource });
  }

  const portraitPaths = collectReferencedPortraitPaths(storyDetails, cwd);

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

function createGeneratedRegistrySource(stories, portraitPaths) {
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

  return [
    "// @ts-nocheck",
    "/* This file is generated by the content pipeline scripts. */",
    "import contentIndexData from \"./index.json\";",
    "import portraitManifestData from \"./portraits.json\";",
    "import summaryManifestData from \"./summary-manifest.json\";",
    "",
    "export const contentIndex = contentIndexData;",
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
    "export function getStoryDetailPath(locale, storyId) {",
    "  return storyDetailPaths[`${locale}:${storyId}`] ?? null;",
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
  fs.rmSync(filePaths.appContentRoot, { recursive: true, force: true });
  ensureDirectory(filePaths.appContentRoot);
  writeJson(filePaths.index, artifacts.index);
  writeJson(filePaths.sourceManifest, artifacts.sourceManifest);
  writeJson(filePaths.summaryManifest, artifacts.summaryManifest);
  writeJson(filePaths.appIndex, artifacts.index);
  writeJson(filePaths.appSummaryManifest, artifacts.summaryManifest);
  writeJson(filePaths.appPortraitManifest, artifacts.portraitPaths ?? {});

  for (const storyDetail of artifacts.storyDetails ?? []) {
    writeJson(path.join(filePaths.contentRoot, storyDetail.filePath), storyDetail.detail);
  }

  for (const [speakerId, publicPath] of Object.entries(artifacts.portraitPaths ?? {})) {
    const sourceFilePath = path.join(getPortraitAssistantSourceRoot(cwd), `${speakerId}.png`);
    if (!fs.existsSync(sourceFilePath)) {
      continue;
    }

    const targetFilePath = path.join(cwd, "ark-str-web-app", "public", publicPath.replace(/^\//, ""));
    ensureDirectory(path.dirname(targetFilePath));
    fs.copyFileSync(sourceFilePath, targetFilePath);
  }

  fs.writeFileSync(
    filePaths.appRegistry,
    `${createGeneratedRegistrySource(artifacts.index.stories ?? [], artifacts.portraitPaths ?? {})}\n`,
    "utf8",
  );
}
