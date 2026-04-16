import { buildContentArtifacts, writeGeneratedArtifacts } from "./lib.mjs";

const artifacts = buildContentArtifacts(process.cwd());
writeGeneratedArtifacts(artifacts, process.cwd());

console.log(
  JSON.stringify(
    {
      generatedAt: artifacts.index.generatedAt,
      serverCount: artifacts.index.vendor.servers.length,
      groupCount: artifacts.index.groups.length,
      storyCount: artifacts.index.stories.length,
      submoduleSha: artifacts.index.vendor.submoduleSha,
    },
    null,
    2,
  ),
);
