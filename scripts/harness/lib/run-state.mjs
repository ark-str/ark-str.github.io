import fs from "node:fs";

export function createRunState({
  options,
  repoFullName,
  baseBranch,
  runId,
  runDir,
  parentIssue,
  issues,
}) {
  const issueStateMap = Object.fromEntries(
    issues.map((issue) => [
      issue.slug,
      {
        ...issue,
        status: "pending",
        milestoneCommits: [],
        resetEvents: [],
        reviewLoopsUsed: 0,
        pr: null,
        worktreePath: null,
      },
    ]),
  );

  return {
    runId,
    createdAt: new Date().toISOString(),
    options,
    repoFullName,
    baseBranch,
    runDir,
    parentIssue,
    issueOrder: issues.map((issue) => issue.slug),
    issues: issueStateMap,
    events: [],
  };
}

export function persistRunState(runState, filePath) {
  fs.writeFileSync(filePath, `${JSON.stringify(runState, null, 2)}\n`, "utf8");
}

export function recordEvent(runState, type, details) {
  runState.events.push({
    type,
    details,
    at: new Date().toISOString(),
  });
}
