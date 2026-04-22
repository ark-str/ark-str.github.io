import { buildContentArtifacts, writeGeneratedArtifacts } from "./lib.mjs";

const artifacts = buildContentArtifacts(process.cwd());
await writeGeneratedArtifacts(artifacts, process.cwd());

console.log(
  JSON.stringify(
    {
      generatedAt: artifacts.index.generatedAt,
      serverCount: artifacts.index.vendor.servers.length,
      groupCount: artifacts.index.groups.length,
      storyCount: artifacts.index.stories.length,
      storyDetailCount: artifacts.storyDetails.length,
      submoduleSha: artifacts.index.vendor.submoduleSha,
    },
    null,
    2,
  ),
);
