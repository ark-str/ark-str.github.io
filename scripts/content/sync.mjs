import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const vendorRoot = path.join(cwd, "vendor");
const requiredDirs = ["ArknightsData", "PortraitSource"];

fs.mkdirSync(vendorRoot, { recursive: true });

for (const directory of requiredDirs) {
  fs.mkdirSync(path.join(vendorRoot, directory), { recursive: true });
}

console.log("content sync placeholder complete");
console.log("vendor roots are ready for future GitHub-backed source attachment:");
for (const directory of requiredDirs) {
  console.log(`- vendor/${directory}`);
}
