import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  ARKNIGHTS_DATA_SUBMODULE_PATH,
  PORTRAIT_SOURCE_PATH,
  getArknightsDataRoot,
  getArknightsDataSubmoduleSha,
  getRepoRoot,
  getServerRoots,
} from "./lib.mjs";

const cwd = getRepoRoot();
const vendorRoot = path.join(cwd, "vendor");
const useRemote = process.argv.includes("--remote");

fs.mkdirSync(vendorRoot, { recursive: true });
fs.mkdirSync(path.join(cwd, PORTRAIT_SOURCE_PATH), { recursive: true });

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
console.log(`- submodule SHA: ${getArknightsDataSubmoduleSha(cwd)}`);
console.log("- detected server roots:");
for (const { server } of getServerRoots(cwd)) {
  console.log(`  - ${server}`);
}
console.log(`- portrait placeholder: ${path.relative(cwd, path.join(cwd, PORTRAIT_SOURCE_PATH))}`);
console.log(`- data root: ${path.relative(cwd, getArknightsDataRoot(cwd))}`);
