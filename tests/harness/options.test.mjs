import test from "node:test";
import assert from "node:assert/strict";
import { parseIterationArgs } from "../../scripts/harness/lib/options.mjs";

test("parseIterationArgs reads defaults", () => {
  const options = parseIterationArgs([]);
  assert.equal(options.maxParallel, 3);
  assert.equal(options.reviewLoops, 2);
  assert.equal(options.dryRun, false);
});

test("parseIterationArgs reads custom values", () => {
  const options = parseIterationArgs([
    "--goal",
    "Ship feature",
    "--spec",
    "docs/spec.md",
    "--max-parallel",
    "4",
    "--review-loops",
    "3",
    "--dry-run",
  ]);

  assert.equal(options.goal, "Ship feature");
  assert.equal(options.spec, "docs/spec.md");
  assert.equal(options.maxParallel, 4);
  assert.equal(options.reviewLoops, 3);
  assert.equal(options.dryRun, true);
});
