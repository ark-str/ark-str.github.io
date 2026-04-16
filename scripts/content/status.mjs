import fs from "node:fs";
import {
  PORTRAIT_SOURCE_PATH,
  getArknightsDataSubmoduleSha,
  getGeneratedFilePaths,
  getRepoRoot,
  getServerRoots,
  hasArknightsDataSource,
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
    ArknightsData: hasArknightsDataSource(cwd),
    PortraitSource: fs.existsSync(`${cwd}/${PORTRAIT_SOURCE_PATH}`),
    submoduleSha: hasArknightsDataSource(cwd) ? getArknightsDataSubmoduleSha(cwd) : null,
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
        submoduleSha: generated.index.vendor.submoduleSha,
      }
    : {
        rootExists: false,
      },
};

console.log(JSON.stringify(status, null, 2));
