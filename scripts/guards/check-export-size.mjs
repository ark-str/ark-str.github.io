import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXPORT_ROOT = path.join(ROOT, "ark-str-web-app", ".next-export");
const GENERATED_ROOT = path.join(EXPORT_ROOT, "generated");
const EXPORT_LIMIT_BYTES = 2 * 1024 * 1024 * 1024;
const GENERATED_LIMIT_BYTES = 750 * 1024 * 1024;

function formatBytes(bytes) {
  const units = ["B", "KiB", "MiB", "GiB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getDirectorySize(directoryPath) {
  let totalBytes = 0;

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      totalBytes += getDirectorySize(entryPath);
      continue;
    }

    if (entry.isFile()) {
      totalBytes += fs.statSync(entryPath).size;
    }
  }

  return totalBytes;
}

function assertDirectorySize({ directoryPath, label, limitBytes }) {
  if (!fs.existsSync(directoryPath)) {
    console.error(`${label} size check failed: ${path.relative(ROOT, directoryPath)} does not exist`);
    process.exit(1);
  }

  const sizeBytes = getDirectorySize(directoryPath);
  if (sizeBytes > limitBytes) {
    console.error(
      `${label} size check failed: ${formatBytes(sizeBytes)} exceeds ${formatBytes(limitBytes)}`,
    );
    process.exit(1);
  }

  console.log(`${label} size check passed: ${formatBytes(sizeBytes)} / ${formatBytes(limitBytes)}`);
}

assertDirectorySize({
  directoryPath: EXPORT_ROOT,
  label: "export",
  limitBytes: EXPORT_LIMIT_BYTES,
});
assertDirectorySize({
  directoryPath: GENERATED_ROOT,
  label: "generated assets",
  limitBytes: GENERATED_LIMIT_BYTES,
});
