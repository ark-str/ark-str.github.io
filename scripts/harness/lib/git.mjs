import path from "node:path";
import { buildWorktreeName } from "./naming.mjs";
import { runCommand } from "./commands.mjs";

export function ensureCleanWorkingTree({ cwd, dryRun }) {
  const result = runCommand("git", ["status", "--porcelain"], { cwd, dryRun });
  if (!result.dryRun && result.stdout.trim().length > 0) {
    throw new Error("Harness requires a clean working tree before starting");
  }
}

export function getCurrentBranch({ cwd, dryRun }) {
  const result = runCommand("git", ["branch", "--show-current"], { cwd, dryRun });
  return result.dryRun ? "main" : result.stdout.trim();
}

export function getRepoFullName({ cwd, dryRun }) {
  const result = runCommand("git", ["remote", "get-url", "origin"], { cwd, dryRun });
  const remoteUrl = result.dryRun ? "https://github.com/example/example.git" : result.stdout.trim();
  const match = remoteUrl.match(/github\.com[:/](.+?)\/(.+?)(?:\.git)?$/);

  if (!match) {
    throw new Error(`Unable to parse GitHub repository from remote URL: ${remoteUrl}`);
  }

  return `${match[1]}/${match[2]}`;
}

export function getDefaultBranch({ cwd, dryRun }) {
  const result = runCommand(
    "git",
    ["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"],
    { cwd, dryRun, allowFailure: true },
  );

  if (result.dryRun) {
    return "main";
  }

  if (result.status === 0 && result.stdout.trim()) {
    return result.stdout.trim().replace(/^origin\//, "");
  }

  return "main";
}

export function fetchOrigin({ cwd, dryRun }) {
  runCommand("git", ["fetch", "origin"], { cwd, dryRun });
}

export function createBranch({ cwd, dryRun, branchName, startPoint }) {
  runCommand("git", ["branch", "--force", branchName, startPoint], { cwd, dryRun });
}

export function createIssueWorktree({ cwd, dryRun, worktreeRoot, branchName, baseRef }) {
  const worktreePath = path.join(worktreeRoot, buildWorktreeName(branchName));
  runCommand("git", ["worktree", "remove", "--force", worktreePath], {
    cwd,
    dryRun,
    allowFailure: true,
  });
  runCommand("git", ["worktree", "add", "--force", "-B", branchName, worktreePath, baseRef], {
    cwd,
    dryRun,
  });
  return worktreePath;
}

export function removeIssueWorktree({ cwd, dryRun, worktreePath }) {
  runCommand("git", ["worktree", "remove", "--force", worktreePath], {
    cwd,
    dryRun,
    allowFailure: true,
  });
}

export function listIssueCommits({ cwd, dryRun, baseRef, branchName }) {
  const result = runCommand(
    "git",
    ["log", "--format=%H%x09%s", `${baseRef}..${branchName}`],
    { cwd, dryRun },
  );

  if (result.dryRun || result.stdout.trim().length === 0) {
    return [];
  }

  return result.stdout
    .trim()
    .split("\n")
    .map((line) => {
      const [sha, message] = line.split("\t");
      return { sha, message };
    });
}

export function resetIssueWorktree({ dryRun, worktreePath, targetSha }) {
  runCommand("git", ["reset", "--hard", targetSha], { cwd: worktreePath, dryRun });
  runCommand("git", ["clean", "-fd"], { cwd: worktreePath, dryRun });
}

export function pushBranch({ cwd, dryRun, worktreePath, branchName, setUpstream = false, force = false }) {
  const args = ["push"];

  if (force) {
    args.push("--force-with-lease");
  }

  if (setUpstream) {
    args.push("-u");
  }

  args.push("origin", branchName);
  runCommand("git", args, { cwd: worktreePath ?? cwd, dryRun });
}

export function deleteBranch({ cwd, dryRun, branchName }) {
  runCommand("git", ["branch", "-D", branchName], { cwd, dryRun, allowFailure: true });
}

export function deleteRemoteBranch({ cwd, dryRun, branchName }) {
  runCommand("git", ["push", "origin", "--delete", branchName], {
    cwd,
    dryRun,
    allowFailure: true,
  });
}

export function checkoutBaseBranch({ cwd, dryRun, baseBranch }) {
  runCommand("git", ["checkout", baseBranch], { cwd, dryRun });
}

export function pullBaseBranch({ cwd, dryRun, baseBranch }) {
  runCommand("git", ["pull", "--ff-only", "origin", baseBranch], { cwd, dryRun });
}
