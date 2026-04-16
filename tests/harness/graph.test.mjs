import test from "node:test";
import assert from "node:assert/strict";
import {
  buildBlocksMap,
  getReadyIssues,
  topologicallySortIssues,
  validateIssuePlan,
} from "../../scripts/harness/lib/graph.mjs";

const samplePlan = {
  summary: "sample",
  issues: [
    {
      slug: "foundation",
      title: "Foundation",
      objective: "Build the base",
      acceptanceCriteria: ["done"],
      dependsOn: [],
    },
    {
      slug: "ui",
      title: "UI",
      objective: "Build UI",
      acceptanceCriteria: ["done"],
      dependsOn: ["foundation"],
    },
    {
      slug: "docs",
      title: "Docs",
      objective: "Write docs",
      acceptanceCriteria: ["done"],
      dependsOn: [],
    },
  ],
};

test("validateIssuePlan accepts a valid DAG", () => {
  assert.doesNotThrow(() => validateIssuePlan(samplePlan));
});

test("topologicallySortIssues sorts dependencies first", () => {
  const sorted = topologicallySortIssues(samplePlan.issues).map((issue) => issue.slug);
  assert.deepEqual(sorted, ["docs", "foundation", "ui"]);
});

test("buildBlocksMap derives reverse dependencies", () => {
  const blocks = buildBlocksMap(samplePlan.issues);
  assert.deepEqual(blocks.foundation, ["ui"]);
  assert.deepEqual(blocks.docs, []);
});

test("getReadyIssues returns only pending issues whose deps are merged", () => {
  const issueStateMap = {
    foundation: { status: "merged" },
    ui: { status: "pending" },
    docs: { status: "pending" },
  };

  const ready = getReadyIssues(samplePlan.issues, issueStateMap).map((issue) => issue.slug);
  assert.deepEqual(ready, ["ui", "docs"]);
});

test("validateIssuePlan rejects cycles", () => {
  assert.throws(() =>
    validateIssuePlan({
      summary: "cycle",
      issues: [
        {
          slug: "a",
          title: "A",
          objective: "A",
          acceptanceCriteria: ["a"],
          dependsOn: ["b"],
        },
        {
          slug: "b",
          title: "B",
          objective: "B",
          acceptanceCriteria: ["b"],
          dependsOn: ["a"],
        },
      ],
    }),
  );
});
