import { spawnSync } from "node:child_process";

const commands = [
  ["node", ["scripts/content/sync.mjs", ...process.argv.slice(2)]],
  ["node", ["scripts/content/build-index.mjs"]],
  ["node", ["scripts/content/check.mjs"]],
  ["node", ["scripts/content/status.mjs"]],
];

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
