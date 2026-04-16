import { spawnSync } from "node:child_process";

const commands = [
  ["npm", ["run", "guards:all"]],
  ["npm", ["run", "typecheck"]],
  ["npm", ["run", "lint"]],
  ["npm", ["run", "harness:test"]],
  ["npm", ["run", "build"]],
  ["npm", ["run", "smoke"]],
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
