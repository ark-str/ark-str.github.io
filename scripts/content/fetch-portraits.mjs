import { buildContentArtifacts, getPortraitSourceRevision, writeGeneratedArtifacts } from "./lib.mjs";

const useRemote = process.argv.includes("--remote");
const artifacts = buildContentArtifacts(process.cwd(), {
  ensurePortraitSource: true,
  remotePortraitSource: useRemote,
});

writeGeneratedArtifacts(artifacts, process.cwd());

console.log(
  JSON.stringify(
    {
      generatedAt: artifacts.index.generatedAt,
      storyDetailCount: artifacts.storyDetails.length,
      portraitCount: Object.keys(artifacts.portraitPaths ?? {}).length,
      portraitRevision: getPortraitSourceRevision(process.cwd()),
    },
    null,
    2,
  ),
);
