import path from "node:path";
import { readText, relativePath, walkFiles } from "./lib.mjs";

const appSourceRoot = path.join(process.cwd(), "ark-str-web-app", "src");
const allowedColorSource = path.join(appSourceRoot, "app", "globals.css");
const files = walkFiles(appSourceRoot, (filePath) => /\.(ts|tsx|css)$/.test(filePath));
const violations = [];

for (const filePath of files) {
  if (filePath === allowedColorSource) {
    continue;
  }

  const text = readText(filePath);
  const repoPath = relativePath(filePath);

  if (/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/.test(text)) {
    violations.push(`${repoPath}: hard-coded hex colors must stay in src/app/globals.css`);
  }

  if (/\brgba?\(/.test(text) || /\bhsla?\(/.test(text)) {
    violations.push(`${repoPath}: hard-coded rgb/hsl colors must stay in src/app/globals.css`);
  }
}

if (violations.length > 0) {
  console.error("Design system violations detected:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("design system check passed");
