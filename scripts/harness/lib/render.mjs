function renderDependencyList(values) {
  return values.length > 0 ? values.join(", ") : "none";
}

export function renderParentIssueBody({
  goal,
  spec,
  runId,
  childIssues,
}) {
  const childLines = childIssues.map(
    (issue) =>
      `- [${issue.status === "merged" ? "x" : " "}] #${issue.number} ${issue.title} (${issue.slug}) -> \`${issue.branchName}\` [${issue.status}]`,
  );

  return [
    "## Iteration Goal",
    goal,
    "",
    "## Source Spec",
    `- \`${spec}\``,
    "",
    "## Run Metadata",
    `- Run ID: \`${runId}\``,
    "",
    "## Child Issues",
    ...childLines,
  ].join("\n");
}

export function renderChildIssueBody({
  parentIssueNumber,
  issue,
  branchName,
  dependencyNumbers,
  blockNumbers,
  status,
}) {
  const acceptanceLines = issue.acceptanceCriteria.map((criterion) => `- ${criterion}`);

  return [
    "## Objective",
    issue.objective,
    "",
    "## Acceptance Criteria",
    ...acceptanceLines,
    "",
    "## Dependency Metadata",
    `Parent iteration: #${parentIssueNumber}`,
    `Depends on: ${renderDependencyList(dependencyNumbers.map((number) => `#${number}`))}`,
    `Blocks: ${renderDependencyList(blockNumbers.map((number) => `#${number}`))}`,
    `Branch: \`${branchName}\``,
    `Status: ${status}`,
  ].join("\n");
}

export function renderPrBody({
  parentIssueNumber,
  issueNumber,
  issue,
  verificationLines,
}) {
  const acceptanceLines = issue.acceptanceCriteria.map((criterion) => `- ${criterion}`);
  const verifyLines = verificationLines.map((line) => `- ${line}`);

  return [
    `Closes #${issueNumber}`,
    `Part of #${parentIssueNumber}`,
    "",
    "## Summary",
    issue.objective,
    "",
    "## Acceptance Criteria",
    ...acceptanceLines,
    "",
    "## Verification",
    ...verifyLines,
  ].join("\n");
}

export function renderReviewComment({ outcome, findings }) {
  const findingLines =
    findings.length > 0 ? findings.map((finding) => `- ${finding}`) : ["- none"];

  return [
    "## Harness Review",
    `Outcome: ${outcome}`,
    "",
    "### Findings",
    ...findingLines,
  ].join("\n");
}

export function renderFinalEvaluation({
  goal,
  mergedIssues,
  resetEvents,
  reviewLoops,
  verificationLines,
}) {
  return [
    "## Iteration Evaluation",
    goal,
    "",
    `Merged issues: ${mergedIssues.length}`,
    `Reset events: ${resetEvents.length}`,
    `Review fix loops: ${reviewLoops}`,
    "",
    "## Verification",
    ...verificationLines.map((line) => `- ${line}`),
  ].join("\n");
}
