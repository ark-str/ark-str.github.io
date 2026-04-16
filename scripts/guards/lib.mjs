import fs from "node:fs";
import path from "node:path";

export function walkFiles(rootDir, matcher) {
  const results = [];

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
      continue;
    }

    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, matcher));
      continue;
    }

    if (!matcher || matcher(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

export function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

export function relativePath(filePath) {
  return path.relative(process.cwd(), filePath);
}
