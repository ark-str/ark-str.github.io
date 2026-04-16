import test from "node:test";
import assert from "node:assert/strict";
import {
  renderChildIssueBody,
  renderParentIssueBody,
  renderPrBody,
} from "../../scripts/harness/lib/render.mjs";

test("renderChildIssueBody includes dependency metadata", () => {
  const body = renderChildIssueBody({
    parentIssueNumber: 10,
    issue: {
      objective: "Ship feature",
      acceptanceCriteria: ["It works"],
    },
    branchName: "codex/iter-10/issue-11-feature",
    dependencyNumbers: [9],
    blockNumbers: [12],
    status: "pending",
  });

  assert.match(body, /Depends on: #9/);
  assert.match(body, /Blocks: #12/);
  assert.match(body, /Status: pending/);
});

test("renderParentIssueBody lists child issues", () => {
  const body = renderParentIssueBody({
    goal: "Ship feature",
    spec: "docs/spec.md",
    runId: "run-1",
    childIssues: [
      {
        number: 12,
        title: "Child",
        slug: "child",
        branchName: "codex/iter-1/issue-12-child",
      },
    ],
  });

  assert.match(body, /#12 Child/);
  assert.match(body, /Run ID: `run-1`/);
});

test("renderPrBody closes the linked issue", () => {
  const body = renderPrBody({
    parentIssueNumber: 10,
    issueNumber: 12,
    issue: {
      objective: "Ship feature",
      acceptanceCriteria: ["It works"],
    },
    verificationLines: ["npm run verify"],
  });

  assert.match(body, /Closes #12/);
  assert.match(body, /Part of #10/);
});
