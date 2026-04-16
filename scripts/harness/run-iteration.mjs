import fs from "node:fs";
import path from "node:path";
import { parseIterationArgs } from "./lib/options.mjs";
import { buildIterationTitle, buildIssueBranchName } from "./lib/naming.mjs";
import { buildBlocksMap, getReadyIssues, topologicallySortIssues, validateIssuePlan } from "./lib/graph.mjs";
import {
  renderChildIssueBody,
  renderFinalEvaluation,
  renderParentIssueBody,
  renderPrBody,
  renderReviewComment,
} from "./lib/render.mjs";
import { createRunState, persistRunState, recordEvent } from "./lib/run-state.mjs";
import { ensureCodexReady, generateIssuePlan, runIssueWorker, runReview, runReviewFixWorker } from "./lib/codex.mjs";
import {
  checkoutBaseBranch,
  createBranch,
  createIssueWorktree,
  deleteBranch,
  deleteRemoteBranch,
  ensureCleanWorkingTree,
  fetchOrigin,
  getCurrentBranch,
  getDefaultBranch,
  getRepoFullName,
  listIssueCommits,
  pullBaseBranch,
  pushBranch,
  removeIssueWorktree,
  resetIssueWorktree,
} from "./lib/git.mjs";
import {
  closeIssue,
  closePullRequest,
  commentIssue,
  commentPullRequest,
  createIssue,
  createPullRequest,
  editIssue,
  ensureGhReady,
  markPullRequestReady,
  mergePullRequest,
} from "./lib/github-cli.mjs";
import { runCommand } from "./lib/commands.mjs";

const options = parseIterationArgs(process.argv.slice(2));
const cwd = process.cwd();
const runId = new Date().toISOString().replaceAll(":", "-");
const runDir = path.join(cwd, "artifacts", "harness", "runs", runId);
const runStatePath = path.join(runDir, "iteration.json");
const worktreeRoot = path.join(cwd, ".harness-worktrees");
const latestIterationPath = path.join(cwd, "docs", "generated", "latest-iteration.md");
const latestIterationBackup = fs.existsSync(latestIterationPath)
  ? fs.readFileSync(latestIterationPath, "utf8")
  : null;

fs.mkdirSync(runDir, { recursive: true });
fs.mkdirSync(worktreeRoot, { recursive: true });

const context = {
  cwd,
  dryRun: options.dryRun,
  runDir,
};

let runState = null;

try {
  await runIteration();
} catch (error) {
  restoreLatestIteration();
  if (runState) {
    recordEvent(runState, "iteration_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    persistRunState(runState, runStatePath);
  }
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}

async function runIteration() {
  ensureCodexReady(context);

  if (!options.dryRun) {
    ensureGhReady(context);
  }

  ensureCleanWorkingTree(context);
  const repoFullName = getRepoFullName(context);
  const baseBranch = getDefaultBranch(context);
  const currentBranch = getCurrentBranch(context);

  if (currentBranch !== baseBranch) {
    throw new Error(
      `Harness iterations must start from the default branch ${baseBranch}. Current branch: ${currentBranch}`,
    );
  }

  fetchOrigin(context);
  const baseRef = `origin/${baseBranch}`;

  const issuePlan = validateIssuePlan(
    generateIssuePlan({
      cwd,
      dryRun: options.dryRun,
      goal: options.goal,
      spec: options.spec,
      runDir,
    }),
  );
  const sortedIssues = topologicallySortIssues(issuePlan.issues);
  const blocksMap = buildBlocksMap(sortedIssues);

  const parentIssue = createIssue({
    ...context,
    repoFullName,
    title: buildIterationTitle(options.goal),
    body: [
      "## Iteration Goal",
      options.goal,
      "",
      "## Source Spec",
      `- \`${options.spec}\``,
      "",
      "## Status",
      "Planning child issues",
    ].join("\n"),
    filename: "parent-issue-body.md",
    runDir,
  });

  const createdIssues = [];

  for (let index = 0; index < sortedIssues.length; index += 1) {
    const issue = sortedIssues[index];
    const created = createIssue({
      ...context,
      repoFullName,
      title: `[harness] ${issue.title}`,
      body: [
        "## Objective",
        issue.objective,
        "",
        "## Acceptance Criteria",
        ...issue.acceptanceCriteria.map((criterion) => `- ${criterion}`),
        "",
        "## Dependency Metadata",
        `Parent iteration: #${parentIssue.number}`,
        "Depends on: pending graph hydration",
        "Blocks: pending graph hydration",
        "Branch: pending branch creation",
        "Status: pending",
      ].join("\n"),
      filename: `child-issue-${index + 1}-body.md`,
      runDir,
    });

    createdIssues.push({
      ...issue,
      number: created.number,
      url: created.url,
      title: `[harness] ${issue.title}`,
    });
  }

  const issueNumberBySlug = Object.fromEntries(createdIssues.map((issue) => [issue.slug, issue.number]));
  const hydratedIssues = createdIssues.map((issue) => ({
    ...issue,
    branchName: buildIssueBranchName(parentIssue.number, issue.number, issue.slug),
    blockSlugs: blocksMap[issue.slug],
  }));

  for (const issue of hydratedIssues) {
    createBranch({
      ...context,
      branchName: issue.branchName,
      startPoint: baseRef,
    });
  }

  runState = createRunState({
    options,
    repoFullName,
    baseBranch,
    runId,
    runDir,
    parentIssue: {
      ...parentIssue,
      title: buildIterationTitle(options.goal),
      goal: options.goal,
    },
    issues: hydratedIssues.map((issue) => ({
      ...issue,
      blocksOn: issue.blockSlugs.map((slug) => issueNumberBySlug[slug]),
      dependsOnNumbers: issue.dependsOn.map((slug) => issueNumberBySlug[slug]),
    })),
  });
  persistRunState(runState, runStatePath);

  syncAllGitHubIssueBodies();
  syncParentIssueBody();

  recordEvent(runState, "iteration_started", {
    parentIssue: parentIssue.number,
    childIssues: hydratedIssues.map((issue) => issue.number),
  });
  persistRunState(runState, runStatePath);

  await runScheduler(baseRef);

  const notMerged = runState.issueOrder.filter((slug) => runState.issues[slug].status !== "merged");
  if (notMerged.length > 0) {
    throw new Error(`Iteration did not complete successfully. Unmerged issues: ${notMerged.join(", ")}`);
  }

  checkoutBaseBranch(context, baseBranch);
  pullBaseBranch(context, baseBranch);
  runCommand("npm", ["run", "verify"], context);

  const evaluation = renderFinalEvaluation({
    goal: options.goal,
    mergedIssues: runState.issueOrder.map((slug) => runState.issues[slug]),
    resetEvents: runState.issueOrder.flatMap((slug) => runState.issues[slug].resetEvents),
    reviewLoops: runState.issueOrder.reduce(
      (total, slug) => total + runState.issues[slug].reviewLoopsUsed,
      0,
    ),
    verificationLines: ["npm run verify"],
  });

  commentIssue({
    ...context,
    repoFullName,
    issueNumber: parentIssue.number,
    body: evaluation,
    filename: "parent-final-evaluation.md",
    runDir,
  });
  closeIssue({
    ...context,
    repoFullName,
    issueNumber: parentIssue.number,
  });

  if (!options.dryRun) {
    writeLatestIterationReport();
  }
  recordEvent(runState, "iteration_completed", {
    mergedIssues: runState.issueOrder.length,
  });
  persistRunState(runState, runStatePath);

  process.stdout.write(`Iteration complete. State: ${path.relative(cwd, runStatePath)}\n`);
}

async function runScheduler(baseRef) {
  const issueTemplates = runState.issueOrder.map((slug) => runState.issues[slug]);
  const active = new Map();
  let stopScheduling = false;

  while (true) {
    if (!stopScheduling) {
      const readyIssues = getReadyIssues(issueTemplates, runState.issues)
        .filter((issue) => !active.has(issue.slug))
        .slice(0, Math.max(0, options.maxParallel - active.size));

      for (const issue of readyIssues) {
        const promise = executeIssueLifecycle(issue.slug, baseRef)
          .then((result) => ({ slug: issue.slug, ...result }))
          .catch((error) => ({
            slug: issue.slug,
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
          }));
        active.set(issue.slug, promise);
      }
    }

    if (active.size === 0) {
      break;
    }

    const result = await waitForNextResult(active);
    active.delete(result.slug);

    if (result.status !== "merged") {
      stopScheduling = true;
    }
  }
}

function waitForNextResult(active) {
  return Promise.race(active.values());
}

async function executeIssueLifecycle(issueSlug, baseRef) {
  const issue = runState.issues[issueSlug];

  try {
    fetchOrigin(context);
    updateIssueStatus(issueSlug, "in_progress");
    const worktreePath = createIssueWorktree({
      ...context,
      worktreeRoot,
      branchName: issue.branchName,
      baseRef,
    });
    issue.worktreePath = worktreePath;
    persistRunState(runState, runStatePath);

    const developmentSucceeded = await runDevelopmentPhase(issueSlug, baseRef);
    if (!developmentSucceeded) {
      updateIssueStatus(issueSlug, "failed");
      cleanupIssueWorktree(issueSlug);
      return { status: "failed" };
    }

    pushBranch({
      ...context,
      worktreePath,
      branchName: issue.branchName,
      setUpstream: true,
    });

    const pr = createPullRequest({
      ...context,
      repoFullName: runState.repoFullName,
      baseBranch: runState.baseBranch,
      headBranch: issue.branchName,
      title: `[harness] ${issue.title}`,
      body: renderPrBody({
        parentIssueNumber: runState.parentIssue.number,
        issueNumber: issue.number,
        issue,
        verificationLines: ["npm run verify"],
      }),
      filename: `pr-${issue.number}-body.md`,
      runDir,
    });
    issue.pr = pr;
    updateIssueStatus(issueSlug, "review");
    persistRunState(runState, runStatePath);

    const reviewSucceeded = await runReviewPhase(issueSlug, baseRef);
    if (!reviewSucceeded) {
      closePullRequest({
        ...context,
        repoFullName: runState.repoFullName,
        prNumber: issue.pr.number,
      });
      updateIssueStatus(issueSlug, "failed");
      cleanupIssueWorktree(issueSlug);
      return { status: "failed" };
    }

    cleanupIssueWorktree(issueSlug);
    markPullRequestReady({
      ...context,
      repoFullName: runState.repoFullName,
      prNumber: issue.pr.number,
    });
    mergePullRequest({
      ...context,
      repoFullName: runState.repoFullName,
      prNumber: issue.pr.number,
    });
    fetchOrigin(context);
    deleteBranch({
      ...context,
      branchName: issue.branchName,
    });
    deleteRemoteBranch({
      ...context,
      branchName: issue.branchName,
    });

    updateIssueStatus(issueSlug, "merged");
    persistRunState(runState, runStatePath);
    syncParentIssueBody();
    return { status: "merged" };
  } catch (error) {
    if (issue.pr?.number) {
      closePullRequest({
        ...context,
        repoFullName: runState.repoFullName,
        prNumber: issue.pr.number,
      });
    }
    updateIssueStatus(issueSlug, "failed");
    cleanupIssueWorktree(issueSlug);
    recordEvent(runState, "issue_failed", {
      issue: issueSlug,
      message: error instanceof Error ? error.message : String(error),
    });
    persistRunState(runState, runStatePath);
    return { status: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}

async function runDevelopmentPhase(issueSlug, baseRef) {
  const issue = runState.issues[issueSlug];
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    recordEvent(runState, "issue_development_attempt", {
      issue: issueSlug,
      attempt,
    });
    persistRunState(runState, runStatePath);

    const result = await runIssueWorker({
      worktreePath: issue.worktreePath,
      dryRun: options.dryRun,
      issue,
      issueNumber: issue.number,
      branchName: issue.branchName,
      runDir,
      logName: `issue-${issue.number}-attempt-${attempt}`,
    });

    syncMilestoneCommits(issueSlug, baseRef);

    if (result.status === 0) {
      return true;
    }

    if (attempt === maxAttempts) {
      return false;
    }

    const rollbackTarget = getRollbackTarget(issueSlug, baseRef);
    issue.resetEvents.push({
      reason: "development failure",
      targetSha: rollbackTarget,
      at: new Date().toISOString(),
    });
    resetIssueWorktree({
      ...context,
      worktreePath: issue.worktreePath,
      targetSha: rollbackTarget,
    });
    persistRunState(runState, runStatePath);
  }

  return false;
}

async function runReviewPhase(issueSlug, baseRef) {
  const issue = runState.issues[issueSlug];
  const baseReviewRef = `origin/${runState.baseBranch}`;

  for (let loop = 0; loop <= options.reviewLoops; loop += 1) {
    const review = runReview({
      worktreePath: issue.worktreePath,
      dryRun: options.dryRun,
      baseRef: baseReviewRef,
      issueNumber: issue.number,
      runDir,
      logName: `issue-${issue.number}-review-${loop + 1}`,
    });

    commentPullRequest({
      ...context,
      repoFullName: runState.repoFullName,
      prNumber: issue.pr.number,
      body: renderReviewComment({
        outcome: review.passed ? "PASS" : "BLOCKED",
        findings: review.findings,
      }),
      filename: `pr-${issue.number}-review-${loop + 1}.md`,
      runDir,
    });

    if (review.passed) {
      issue.reviewLoopsUsed = loop;
      persistRunState(runState, runStatePath);
      return true;
    }

    if (loop === options.reviewLoops) {
      issue.reviewLoopsUsed = loop;
      persistRunState(runState, runStatePath);
      return false;
    }

    const fixResult = await runReviewFixWorker({
      worktreePath: issue.worktreePath,
      dryRun: options.dryRun,
      issueNumber: issue.number,
      findings: review.findings,
      runDir,
      logName: `issue-${issue.number}-review-fix-${loop + 1}`,
    });

    syncMilestoneCommits(issueSlug, baseRef);

    if (fixResult.status !== 0) {
      issue.reviewLoopsUsed = loop + 1;
      persistRunState(runState, runStatePath);
      return false;
    }

    pushBranch({
      ...context,
      worktreePath: issue.worktreePath,
      branchName: issue.branchName,
    });
  }

  return false;
}

function syncMilestoneCommits(issueSlug, baseRef) {
  const issue = runState.issues[issueSlug];
  const commits = listIssueCommits({
    ...context,
    baseRef,
    branchName: issue.branchName,
  });

  issue.milestoneCommits = commits.filter((commit) =>
    commit.message.startsWith(`milestone(issue-${issue.number}):`),
  );
  persistRunState(runState, runStatePath);
}

function getRollbackTarget(issueSlug, baseRef) {
  const issue = runState.issues[issueSlug];
  if (issue.milestoneCommits.length > 0) {
    return issue.milestoneCommits[0].sha;
  }

  return baseRef;
}

function updateIssueStatus(issueSlug, status) {
  const issue = runState.issues[issueSlug];
  issue.status = status;
  syncChildIssueBody(issueSlug);
  syncParentIssueBody();
  persistRunState(runState, runStatePath);
}

function syncAllGitHubIssueBodies() {
  for (const issueSlug of runState.issueOrder) {
    syncChildIssueBody(issueSlug);
  }
}

function syncChildIssueBody(issueSlug) {
  const issue = runState.issues[issueSlug];

  editIssue({
    ...context,
    repoFullName: runState.repoFullName,
    issueNumber: issue.number,
    title: issue.title,
    body: renderChildIssueBody({
      parentIssueNumber: runState.parentIssue.number,
      issue,
      branchName: issue.branchName,
      dependencyNumbers: issue.dependsOnNumbers,
      blockNumbers: issue.blocksOn,
      status: issue.status,
    }),
    filename: `issue-${issue.number}-body.md`,
    runDir,
  });
}

function syncParentIssueBody() {
  editIssue({
    ...context,
    repoFullName: runState.repoFullName,
    issueNumber: runState.parentIssue.number,
    title: runState.parentIssue.title,
    body: renderParentIssueBody({
      goal: runState.parentIssue.goal,
      spec: options.spec,
      runId,
      childIssues: runState.issueOrder.map((slug) => runState.issues[slug]),
    }),
    filename: "parent-issue-body.md",
    runDir,
  });
}

function cleanupIssueWorktree(issueSlug) {
  const issue = runState.issues[issueSlug];
  if (!issue.worktreePath) {
    return;
  }

  removeIssueWorktree({
    ...context,
    worktreePath: issue.worktreePath,
  });
  issue.worktreePath = null;
  persistRunState(runState, runStatePath);
}

function writeLatestIterationReport() {
  const mergedIssues = runState.issueOrder.map((slug) => runState.issues[slug]);
  const totalResetEvents = mergedIssues.flatMap((issue) => issue.resetEvents).length;
  const totalReviewLoops = mergedIssues.reduce((total, issue) => total + issue.reviewLoopsUsed, 0);

  const lines = [
    "# Latest Iteration",
    "",
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "## Summary",
    `- Goal: ${options.goal}`,
    `- Parent issue: #${runState.parentIssue.number}`,
    `- Merged issues: ${mergedIssues.length}`,
    `- Review fix loops: ${totalReviewLoops}`,
    `- Reset events: ${totalResetEvents}`,
    "",
    "## Pull Requests",
    ...mergedIssues.map((issue) => `- #${issue.pr.number} ${issue.pr.url}`),
    "",
    "## Verification",
    "- npm run verify",
    "",
    "## Remaining Risks",
    "- GitHub-backed harness execution requires `gh` CLI to remain installed and authenticated.",
  ];

  fs.writeFileSync(latestIterationPath, `${lines.join("\n")}\n`, "utf8");
}

function restoreLatestIteration() {
  if (latestIterationBackup === null) {
    fs.rmSync(latestIterationPath, { force: true });
  } else {
    fs.writeFileSync(latestIterationPath, latestIterationBackup, "utf8");
  }
}
