import fs from "node:fs";
import {
  PORTRAIT_SOURCE_PATH,
  getArknightsDataSubmoduleSha,
  getPortraitSourceRevision,
  getGeneratedFilePaths,
  getRepoRoot,
  getServerRoots,
  hasArknightsDataSource,
  hasPortraitSource,
  loadGeneratedArtifacts,
} from "./lib.mjs";

const cwd = getRepoRoot();
const generatedPaths = getGeneratedFilePaths(cwd);
const generatedExists =
  fs.existsSync(generatedPaths.index) &&
  fs.existsSync(generatedPaths.sourceManifest) &&
  fs.existsSync(generatedPaths.summaryManifest);

const generated = generatedExists ? loadGeneratedArtifacts(cwd) : null;

const status = {
  vendor: {
    ArknightsGamedata: hasArknightsDataSource(cwd),
    ArknightsResource: hasPortraitSource(cwd),
    dataSubmoduleSha: hasArknightsDataSource(cwd) ? getArknightsDataSubmoduleSha(cwd) : null,
    portraitRevision: hasPortraitSource(cwd) ? getPortraitSourceRevision(cwd) : null,
    portraitPath: PORTRAIT_SOURCE_PATH,
    servers: getServerRoots(cwd).map(({ server }) => server),
  },
      generated: generated
    ? {
        rootExists: true,
        serverCount: generated.index.vendor.servers.length,
        groupCount: generated.index.groups.length,
        storyCount: generated.index.stories.length,
        storyDetailCount: generated.index.stories.filter((story) => story.bodyAvailable).length,
        summaryMissingCount: generated.summaryManifest.items.filter((item) => item.status === "missing").length,
        backgroundCount: fs.existsSync(generatedPaths.generatedBackgroundsRoot)
          ? fs.readdirSync(generatedPaths.generatedBackgroundsRoot).filter((fileName) => fileName.endsWith(".png")).length
          : 0,
        portraitCount: fs.existsSync(generatedPaths.generatedPortraitsRoot)
          ? fs.readdirSync(generatedPaths.generatedPortraitsRoot).filter((fileName) => fileName.endsWith(".png")).length
          : 0,
        submoduleSha: generated.index.vendor.submoduleSha,
      }
    : {
        rootExists: false,
      },
};

console.log(JSON.stringify(status, null, 2));
