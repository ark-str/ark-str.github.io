import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  ARKNIGHTS_DATA_SUBMODULE_PATH,
  getArknightsDataRoot,
  getArknightsDataSubmoduleSha,
  getPortraitSourceRoot,
  getRepoRoot,
  getServerRoots,
  hasPortraitSource,
} from "./lib.mjs";

const cwd = getRepoRoot();
const vendorRoot = path.join(cwd, "vendor");
const useRemote = process.argv.includes("--remote");

fs.mkdirSync(vendorRoot, { recursive: true });

const args = ["submodule", "update", "--init", "--recursive"];
if (useRemote) {
  args.push("--remote");
}
args.push(ARKNIGHTS_DATA_SUBMODULE_PATH);

const result = spawnSync("git", args, {
  cwd,
  stdio: "inherit",
  shell: false,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("content sync complete");
console.log(`- data submodule SHA: ${getArknightsDataSubmoduleSha(cwd)}`);
console.log("- detected server roots:");
for (const { server } of getServerRoots(cwd)) {
  console.log(`  - ${server}`);
}
console.log(`- data root: ${path.relative(cwd, getArknightsDataRoot(cwd))}`);
if (hasPortraitSource(cwd)) {
  console.log(`- portrait cache root: ${path.relative(cwd, getPortraitSourceRoot(cwd))}`);
} else {
  console.log("- portrait cache: not initialized (run `npm run content:portraits` or `npm run content:update`)");
}
