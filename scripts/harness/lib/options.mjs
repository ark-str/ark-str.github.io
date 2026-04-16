export function parseIterationArgs(argv) {
  const options = {
    goal: "Advance the single-page local-first product by one coherent, verified iteration.",
    spec: "docs/product-specs/single-page-local-first.md",
    maxParallel: 3,
    reviewLoops: 2,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if (token === "--goal" && next) {
      options.goal = next;
      index += 1;
      continue;
    }

    if (token === "--spec" && next) {
      options.spec = next;
      index += 1;
      continue;
    }

    if (token === "--max-parallel" && next) {
      options.maxParallel = Number.parseInt(next, 10);
      index += 1;
      continue;
    }

    if (token === "--review-loops" && next) {
      options.reviewLoops = Number.parseInt(next, 10);
      index += 1;
      continue;
    }

    if (token === "--dry-run") {
      options.dryRun = true;
    }
  }

  if (!Number.isInteger(options.maxParallel) || options.maxParallel < 1) {
    throw new Error("--max-parallel must be a positive integer");
  }

  if (!Number.isInteger(options.reviewLoops) || options.reviewLoops < 0) {
    throw new Error("--review-loops must be zero or a positive integer");
  }

  return options;
}
