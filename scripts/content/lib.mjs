import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseStoryText } from "./story-parser.mjs";

export const ARKNIGHTS_DATA_SUBMODULE_PATH = "vendor/ArknightsData";
export const ARKNIGHTS_DATA_REMOTE = "https://github.com/ArknightsAssets/ArknightsGamedata.git";
export const ARKNIGHTS_DATA_BRANCH = "master";
export const PORTRAIT_SOURCE_PATH = "vendor/PortraitSource";
export const CANONICAL_READER_LOCALES = ["cn", "en", "jp", "kr", "tw"];

export function getRepoRoot() {
  return process.cwd();
}

export function getArknightsDataRoot(cwd = getRepoRoot()) {
  return path.join(cwd, ARKNIGHTS_DATA_SUBMODULE_PATH);
}

export function getGeneratedContentRoot(cwd = getRepoRoot()) {
  return path.join(cwd, "ark-str-web-app", "public", "generated", "content");
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

  return {
    contentRoot,
    statusRoot,
    storiesRoot,
    appContentRoot,
    index: path.join(contentRoot, "index.json"),
    sourceManifest: path.join(statusRoot, "source-manifest.json"),
    summaryManifest: path.join(statusRoot, "summary-manifest.json"),
    appIndex: path.join(appContentRoot, "index.json"),
    appSummaryManifest: path.join(appContentRoot, "summary-manifest.json"),
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

function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function hashFile(filePath) {
  return hashBuffer(fs.readFileSync(filePath));
}

export function hashJson(value) {
  return hashBuffer(Buffer.from(JSON.stringify(value)));
}

export function getArknightsDataSubmoduleSha(cwd = getRepoRoot()) {
  if (!hasArknightsDataSource(cwd)) {
    return null;
  }

  const result = spawnSync("git", ["-C", getArknightsDataRoot(cwd), "rev-parse", "HEAD"], {
    cwd,
    encoding: "utf8",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "Unable to resolve ArknightsData submodule SHA");
  }

  return result.stdout.trim();
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

export function buildContentArtifacts(cwd = getRepoRoot()) {
  if (!hasArknightsDataSource(cwd)) {
    throw new Error("vendor/ArknightsData is not initialized. Run `npm run content:sync` first.");
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
                blocks: parseStoryText(fs.readFileSync(sourceFilePath, "utf8")),
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

function createGeneratedRegistrySource(stories) {
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

  return [
    "// @ts-nocheck",
    "/* This file is generated by scripts/content/build-index.mjs. */",
    "import contentIndexData from \"./index.json\";",
    "import summaryManifestData from \"./summary-manifest.json\";",
    "",
    "export const contentIndex = contentIndexData;",
    "export const summaryManifest = summaryManifestData;",
    "",
    "export const storyDetailPaths = {",
    ...pathEntries,
    "};",
    "",
    "export function getStoryDetailPath(locale, storyId) {",
    "  return storyDetailPaths[`${locale}:${storyId}`] ?? null;",
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
  fs.rmSync(filePaths.appContentRoot, { recursive: true, force: true });
  ensureDirectory(filePaths.appContentRoot);
  writeJson(filePaths.index, artifacts.index);
  writeJson(filePaths.sourceManifest, artifacts.sourceManifest);
  writeJson(filePaths.summaryManifest, artifacts.summaryManifest);
  writeJson(filePaths.appIndex, artifacts.index);
  writeJson(filePaths.appSummaryManifest, artifacts.summaryManifest);

  for (const storyDetail of artifacts.storyDetails ?? []) {
    writeJson(path.join(filePaths.contentRoot, storyDetail.filePath), storyDetail.detail);
  }

  fs.writeFileSync(
    filePaths.appRegistry,
    `${createGeneratedRegistrySource(artifacts.index.stories ?? [])}\n`,
    "utf8",
  );
}
