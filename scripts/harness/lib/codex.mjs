import fs from "node:fs";
import path from "node:path";
import { runCommand, spawnStreamingCommand } from "./commands.mjs";

const issuePlanSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "issues"],
  properties: {
    summary: { type: "string" },
    issues: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["slug", "title", "objective", "acceptanceCriteria", "dependsOn"],
        properties: {
          slug: {
            type: "string",
            pattern: "^[a-z0-9-]+$",
          },
          title: { type: "string" },
          objective: { type: "string" },
          acceptanceCriteria: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
          },
          dependsOn: {
            type: "array",
            items: { type: "string", pattern: "^[a-z0-9-]+$" },
          },
        },
      },
    },
  },
};

export function ensureCodexReady({ cwd, dryRun }) {
  runCommand("codex", ["--version"], { cwd, dryRun });
}

export function generateIssuePlan({ cwd, dryRun, goal, spec, runDir }) {
  const schemaPath = path.join(runDir, "issue-plan.schema.json");
  const outputPath = path.join(runDir, "issue-plan.json");

  fs.writeFileSync(schemaPath, `${JSON.stringify(issuePlanSchema, null, 2)}\n`, "utf8");

  const prompt = [
    "Create a small implementation DAG for this iteration.",
    "",
    "Requirements:",
    "- Read AGENTS.md, ARCHITECTURE.md, docs/product-specs/index.md, the given spec file, docs/FRONTEND.md, docs/RELIABILITY.md, docs/SECURITY.md, docs/PLANS.md, and docs/QUALITY_SCORE.md.",
    "- Return 1 to 6 child issues only.",
    "- Each issue must be independently mergeable.",
    "- Use dependsOn only when strictly necessary.",
    "- Prefer parallelizable units whenever safe.",
    "- Slugs must be short kebab-case identifiers.",
    "- Acceptance criteria must be concrete and testable.",
    "",
    `Goal: ${goal}`,
    `Spec file: ${spec}`,
  ].join("\n");

  runCommand(
    "codex",
    [
      "exec",
      "--full-auto",
      "--cd",
      cwd,
      "--output-schema",
      schemaPath,
      "--output-last-message",
      outputPath,
      prompt,
    ],
    { cwd, dryRun },
  );

  if (dryRun) {
    return {
      summary: "dry-run issue graph",
      issues: [
        {
          slug: "sample-task",
          title: "Sample Task",
          objective: "Sample objective for dry-run mode.",
          acceptanceCriteria: ["Dry-run only"],
          dependsOn: [],
        },
      ],
    };
  }

  return JSON.parse(fs.readFileSync(outputPath, "utf8"));
}

export function runIssueWorker({
  worktreePath,
  dryRun,
  issue,
  issueNumber,
  branchName,
  runDir,
  logName,
}) {
  const outputPath = path.join(runDir, `${logName}.md`);
  const eventsPath = path.join(runDir, `${logName}.jsonl`);
  const prompt = [
    `You own GitHub issue #${issueNumber} on branch ${branchName}.`,
    "",
    "Execution rules:",
    "- Work only inside this worktree and only for this issue.",
    "- Read AGENTS.md, ARCHITECTURE.md, docs/product-specs/index.md, docs/FRONTEND.md, docs/RELIABILITY.md, docs/SECURITY.md, docs/PLANS.md, and docs/QUALITY_SCORE.md.",
    "- Implement only this issue's objective and acceptance criteria.",
    "- Commit milestone checkpoints with messages like `milestone(issue-" + issueNumber + "): scaffold` and `milestone(issue-" + issueNumber + "): core`.",
    "- End with a final commit using `feat(issue-" + issueNumber + "): ...`, `fix(issue-" + issueNumber + "): ...`, or `chore(issue-" + issueNumber + "): ...`.",
    "- If verification fails and rollback is clearly better, you may reset within this harness-owned worktree only.",
    "- Run npm run verify before finishing.",
    "",
    `Issue title: ${issue.title}`,
    `Objective: ${issue.objective}`,
    "Acceptance criteria:",
    ...issue.acceptanceCriteria.map((criterion) => `- ${criterion}`),
  ].join("\n");

  return spawnStreamingCommand(
    "codex",
    [
      "exec",
      "--full-auto",
      "--cd",
      worktreePath,
      "--json",
      "--output-last-message",
      outputPath,
      prompt,
    ],
    {
      cwd: worktreePath,
      dryRun,
      logFilePath: eventsPath,
    },
  );
}

export function runReview({
  worktreePath,
  dryRun,
  baseRef,
  issueNumber,
  runDir,
  logName,
}) {
  const reviewPath = path.join(runDir, `${logName}.md`);
  const prompt = [
    `Review the branch for GitHub issue #${issueNumber}.`,
    "Return exactly PASS if there are no blocking findings.",
    "Otherwise return only a flat bullet list of blocking findings.",
  ].join("\n");

  const result = runCommand(
    "codex",
    ["review", "--base", baseRef, prompt],
    { cwd: worktreePath, dryRun },
  );

  fs.writeFileSync(reviewPath, `${result.stdout}\n${result.stderr}`.trim(), "utf8");
  const text = result.dryRun ? "PASS" : result.stdout.trim();

  return {
    passed: text === "PASS",
    findings: text === "PASS" || text.length === 0 ? [] : text.split("\n").map((line) => line.replace(/^- /, "")),
    outputPath: reviewPath,
  };
}

export function runReviewFixWorker({
  worktreePath,
  dryRun,
  issueNumber,
  findings,
  runDir,
  logName,
}) {
  const outputPath = path.join(runDir, `${logName}.md`);
  const eventsPath = path.join(runDir, `${logName}.jsonl`);
  const prompt = [
    `Address the review findings for GitHub issue #${issueNumber}.`,
    "Fix only the blocking findings listed below.",
    `Commit the changes with a message like \`fix(issue-${issueNumber}): address review\`.`,
    "Run npm run verify before finishing.",
    "",
    "Findings:",
    ...findings.map((finding) => `- ${finding}`),
  ].join("\n");

  return spawnStreamingCommand(
    "codex",
    [
      "exec",
      "--full-auto",
      "--cd",
      worktreePath,
      "--json",
      "--output-last-message",
      outputPath,
      prompt,
    ],
    {
      cwd: worktreePath,
      dryRun,
      logFilePath: eventsPath,
    },
  );
}
