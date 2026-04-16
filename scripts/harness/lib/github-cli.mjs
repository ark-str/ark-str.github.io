import fs from "node:fs";
import path from "node:path";
import { runCommand } from "./commands.mjs";

let dryRunIssueNumber = 1000;
let dryRunPrNumber = 2000;

function parseNumberFromUrl(url) {
  const match = url.trim().match(/\/(\d+)(?:\/?$)/);
  if (!match) {
    throw new Error(`Unable to parse number from GitHub URL: ${url}`);
  }

  return Number.parseInt(match[1], 10);
}

function writeTempBody(runDir, filename, body) {
  const bodyPath = path.join(runDir, filename);
  fs.writeFileSync(bodyPath, `${body}\n`, "utf8");
  return bodyPath;
}

export function ensureGhReady({ cwd, dryRun }) {
  runCommand("gh", ["--version"], { cwd, dryRun });
  runCommand("gh", ["auth", "status"], { cwd, dryRun });
}

export function createIssue({ cwd, dryRun, repoFullName, title, body, runDir, filename }) {
  if (dryRun) {
    dryRunIssueNumber += 1;
    const fallbackNumber = dryRunIssueNumber;
    return {
      number: fallbackNumber,
      url: `https://github.com/${repoFullName}/issues/${fallbackNumber}`,
    };
  }

  const bodyPath = writeTempBody(runDir, filename, body);
  const result = runCommand(
    "gh",
    ["issue", "create", "--repo", repoFullName, "--title", title, "--body-file", bodyPath],
    { cwd },
  );

  const url = result.stdout.trim();
  return {
    number: parseNumberFromUrl(url),
    url,
  };
}

export function editIssue({ cwd, dryRun, repoFullName, issueNumber, title, body, runDir, filename }) {
  if (dryRun) {
    return;
  }

  const bodyPath = writeTempBody(runDir, filename, body);
  runCommand(
    "gh",
    ["issue", "edit", String(issueNumber), "--repo", repoFullName, "--title", title, "--body-file", bodyPath],
    { cwd },
  );
}

export function commentIssue({ cwd, dryRun, repoFullName, issueNumber, body, runDir, filename }) {
  if (dryRun) {
    return;
  }

  const bodyPath = writeTempBody(runDir, filename, body);
  runCommand(
    "gh",
    ["issue", "comment", String(issueNumber), "--repo", repoFullName, "--body-file", bodyPath],
    { cwd },
  );
}

export function closeIssue({ cwd, dryRun, repoFullName, issueNumber }) {
  if (dryRun) {
    return;
  }

  runCommand("gh", ["issue", "close", String(issueNumber), "--repo", repoFullName], { cwd });
}

export function createPullRequest({
  cwd,
  dryRun,
  repoFullName,
  baseBranch,
  headBranch,
  title,
  body,
  runDir,
  filename,
}) {
  if (dryRun) {
    dryRunPrNumber += 1;
    const fallbackNumber = dryRunPrNumber;
    return {
      number: fallbackNumber,
      url: `https://github.com/${repoFullName}/pull/${fallbackNumber}`,
    };
  }

  const bodyPath = writeTempBody(runDir, filename, body);
  const result = runCommand(
    "gh",
    [
      "pr",
      "create",
      "--repo",
      repoFullName,
      "--base",
      baseBranch,
      "--head",
      headBranch,
      "--title",
      title,
      "--body-file",
      bodyPath,
      "--draft",
    ],
    { cwd },
  );

  const url = result.stdout.trim();
  return {
    number: parseNumberFromUrl(url),
    url,
  };
}

export function commentPullRequest({ cwd, dryRun, repoFullName, prNumber, body, runDir, filename }) {
  if (dryRun) {
    return;
  }

  const bodyPath = writeTempBody(runDir, filename, body);
  runCommand(
    "gh",
    ["pr", "comment", String(prNumber), "--repo", repoFullName, "--body-file", bodyPath],
    { cwd },
  );
}

export function markPullRequestReady({ cwd, dryRun, repoFullName, prNumber }) {
  if (dryRun) {
    return;
  }

  runCommand("gh", ["pr", "ready", String(prNumber), "--repo", repoFullName], { cwd });
}

export function mergePullRequest({ cwd, dryRun, repoFullName, prNumber }) {
  if (dryRun) {
    return;
  }

  runCommand(
    "gh",
    ["pr", "merge", String(prNumber), "--repo", repoFullName, "--squash", "--delete-branch"],
    { cwd },
  );
}

export function closePullRequest({ cwd, dryRun, repoFullName, prNumber }) {
  if (dryRun) {
    return;
  }

  runCommand("gh", ["pr", "close", String(prNumber), "--repo", repoFullName], {
    cwd,
    allowFailure: true,
  });
}
