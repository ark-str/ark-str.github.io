import fs from "node:fs";
import path from "node:path";
import { readText, relativePath, walkFiles } from "./lib.mjs";

const codeRoots = [
  path.join(process.cwd(), "src"),
  path.join(process.cwd(), "next.config.ts"),
];

const files = [];

for (const entry of codeRoots) {
  const stats = fs.statSync(entry);
  if (stats.isDirectory()) {
    files.push(
      ...walkFiles(entry, (filePath) => /\.(ts|tsx|css)$/.test(filePath)),
    );
  } else {
    files.push(entry);
  }
}

const violations = [];

for (const filePath of files) {
  const text = readText(filePath);
  const repoPath = relativePath(filePath);

  if (/from\s+["']next\/font\/google["']/.test(text)) {
    violations.push(`${repoPath}: remote Google font helper is disallowed`);
  }

  if (/\bfetch\s*\(\s*["'`](https?:)?\/\//.test(text)) {
    violations.push(`${repoPath}: remote fetch is disallowed in this local-first app`);
  }

  if (/(src=|href=)["']https?:\/\//.test(text)) {
    violations.push(`${repoPath}: remote asset or link detected in runtime code`);
  }

  if (/url\(\s*["']?https?:\/\//.test(text)) {
    violations.push(`${repoPath}: remote CSS asset detected`);
  }

  if (
    /(window\.)?localStorage(?:\.[A-Za-z_$]|\s*\[)/.test(text) &&
    !/src\/features\/[^/]+\/(repo|runtime)\//.test(repoPath)
  ) {
    violations.push(`${repoPath}: localStorage access must stay in repo/runtime layers`);
  }
}

if (violations.length > 0) {
  console.error("Constraint violations detected:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("constraints check passed");
