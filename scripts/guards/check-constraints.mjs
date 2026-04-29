import fs from "node:fs";
import path from "node:path";
import { readText, relativePath, walkFiles } from "./lib.mjs";

const codeRoots = [
  path.join(process.cwd(), "ark-str-web-app", "src"),
  path.join(process.cwd(), "ark-str-web-app", "next.config.ts"),
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
const allowedRemoteFetchFiles = new Set([
  "ark-str-web-app/src/features/ai-summary/runtime/summarize-story-with-gemini.ts",
]);
const allowedRemoteUrlsByFile = new Map([
  [
    "ark-str-web-app/src/features/ai-summary/config/google-ai-studio.ts",
    new Set(["https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"]),
  ],
  [
    "ark-str-web-app/src/features/settings/ui/settings-overview.tsx",
    new Set([
      "https://aistudio.google.com/app/apikey",
      "https://github.com/wjlee611/ark-str/issues/new",
    ]),
  ],
]);

for (const filePath of files) {
  const text = readText(filePath);
  const repoPath = relativePath(filePath);

  if (/from\s+["']next\/font\/google["']/.test(text)) {
    violations.push(`${repoPath}: remote Google font helper is disallowed`);
  }

  if (
    /\bfetch\s*\(\s*["'`](https?:)?\/\//.test(text) &&
    !allowedRemoteFetchFiles.has(repoPath)
  ) {
    violations.push(`${repoPath}: remote fetch is disallowed in this local-first app`);
  }

  if (/(src=|href=)["']https?:\/\//.test(text)) {
    violations.push(`${repoPath}: remote asset or link detected in runtime code`);
  }

  const allowedRemoteUrls = allowedRemoteUrlsByFile.get(repoPath) ?? new Set();
  for (const match of text.matchAll(/["'`](https?:\/\/[^"'`]+)["'`]/g)) {
    const url = match[1];
    if (!allowedRemoteUrls.has(url)) {
      violations.push(`${repoPath}: remote URL literal detected in runtime code`);
    }
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
