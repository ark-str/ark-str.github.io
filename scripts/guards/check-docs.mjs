import fs from "node:fs";
import path from "node:path";
import { readText } from "./lib.mjs";

const requiredFiles = [
  "AGENTS.md",
  "ARCHITECTURE.md",
  "docs/design-system/README.md",
  "docs/FRONTEND.md",
  "docs/PLANS.md",
  "docs/RELIABILITY.md",
  "docs/SECURITY.md",
  "docs/QUALITY_SCORE.md",
  "docs/product-specs/index.md",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(process.cwd(), file)));

if (missing.length > 0) {
  console.error("Missing required documentation files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const agents = readText(path.join(process.cwd(), "AGENTS.md"));
const missingLinks = requiredFiles
  .filter((file) => file !== "AGENTS.md")
  .filter((file) => !agents.includes(file));

if (missingLinks.length > 0) {
  console.error("AGENTS.md must reference the core documentation map:");
  for (const file of missingLinks) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("docs check passed");
