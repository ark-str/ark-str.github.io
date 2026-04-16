import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const options = {
    goal: "Advance the single-page local-first product by one coherent, verified iteration.",
    spec: "docs/product-specs/single-page-local-first.md",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if (token === "--goal" && next) {
      options.goal = next;
      index += 1;
    }

    if (token === "--spec" && next) {
      options.spec = next;
      index += 1;
    }
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));
const timestamp = new Date().toISOString().replaceAll(":", "-");
const runDir = path.join(process.cwd(), "artifacts", "harness", "runs", timestamp);

fs.mkdirSync(runDir, { recursive: true });

const prompt = [
  "You are running the ark-str autonomous iteration harness.",
  "",
  "Follow this flow exactly:",
  "1. Read AGENTS.md, ARCHITECTURE.md, docs/product-specs/index.md, the requested spec file, docs/FRONTEND.md, docs/RELIABILITY.md, docs/SECURITY.md, docs/PLANS.md, and docs/QUALITY_SCORE.md.",
  "2. Implement one coherent iteration toward the goal below.",
  "3. Keep the app single-page, local-first, bundled-resource-only, and localStorage-backed.",
  "4. Update docs when the implementation changes behavior or expectations.",
  "5. Run npm run verify before finishing. A successful iteration requires guards, typecheck, lint, build, and browser smoke to pass.",
  "6. Treat any uncaught browser error, console error, or render crash as a failed iteration.",
  "7. Only after verify passes, write a short report to docs/generated/latest-iteration.md with summary, verification, and remaining risks.",
  "",
  `Goal: ${options.goal}`,
  `Spec file: ${options.spec}`,
].join("\n");

const promptPath = path.join(runDir, "prompt.txt");
fs.writeFileSync(promptPath, `${prompt}\n`, "utf8");

const outputPath = path.join(process.cwd(), "artifacts", "harness", "latest-message.md");
const eventsPath = path.join(runDir, "events.jsonl");
const latestIterationPath = path.join(process.cwd(), "docs", "generated", "latest-iteration.md");
const latestIterationBackup = fs.existsSync(latestIterationPath)
  ? fs.readFileSync(latestIterationPath, "utf8")
  : null;

const child = spawnSync(
  "codex",
  [
    "exec",
    "--full-auto",
    "--cd",
    process.cwd(),
    "--json",
    "--output-last-message",
    outputPath,
    prompt,
  ],
  {
    cwd: process.cwd(),
    encoding: "utf8",
  },
);

fs.writeFileSync(eventsPath, child.stdout ?? "", "utf8");

if (child.stderr) {
  process.stderr.write(child.stderr);
}

if (child.status !== 0) {
  if (latestIterationBackup === null) {
    fs.rmSync(latestIterationPath, { force: true });
  } else {
    fs.writeFileSync(latestIterationPath, latestIterationBackup, "utf8");
  }

  process.stderr.write(`Iteration failed. Prompt snapshot: ${path.relative(process.cwd(), promptPath)}\n`);
  process.exit(child.status ?? 1);
}

process.stdout.write(`Iteration complete. Trace: ${path.relative(process.cwd(), eventsPath)}\n`);
