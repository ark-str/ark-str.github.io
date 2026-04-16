export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildIterationTitle(goal) {
  return `[harness] ${goal}`;
}

export function buildIssueBranchName(iterationNumber, issueNumber, slug) {
  return `codex/iter-${iterationNumber}/issue-${issueNumber}-${slugify(slug)}`;
}

export function buildWorktreeName(branchName) {
  return branchName.replaceAll("/", "__");
}
