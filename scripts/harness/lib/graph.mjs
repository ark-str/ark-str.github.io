export function validateIssuePlan(plan) {
  if (!plan || typeof plan !== "object") {
    throw new Error("Issue plan must be an object");
  }

  if (!Array.isArray(plan.issues) || plan.issues.length === 0) {
    throw new Error("Issue plan must contain at least one issue");
  }

  if (plan.issues.length > 6) {
    throw new Error("Issue plan may contain at most 6 issues");
  }

  const slugSet = new Set();

  for (const issue of plan.issues) {
    if (!issue.slug || !/^[a-z0-9-]+$/.test(issue.slug)) {
      throw new Error(`Invalid issue slug: ${issue.slug ?? "<missing>"}`);
    }

    if (slugSet.has(issue.slug)) {
      throw new Error(`Duplicate issue slug: ${issue.slug}`);
    }

    slugSet.add(issue.slug);

    if (!issue.title || typeof issue.title !== "string") {
      throw new Error(`Issue ${issue.slug} is missing a title`);
    }

    if (!issue.objective || typeof issue.objective !== "string") {
      throw new Error(`Issue ${issue.slug} is missing an objective`);
    }

    if (!Array.isArray(issue.acceptanceCriteria) || issue.acceptanceCriteria.length === 0) {
      throw new Error(`Issue ${issue.slug} must define acceptance criteria`);
    }

    if (!Array.isArray(issue.dependsOn)) {
      throw new Error(`Issue ${issue.slug} must define dependsOn as an array`);
    }
  }

  for (const issue of plan.issues) {
    for (const dependencySlug of issue.dependsOn) {
      if (!slugSet.has(dependencySlug)) {
        throw new Error(`Issue ${issue.slug} depends on unknown issue ${dependencySlug}`);
      }

      if (dependencySlug === issue.slug) {
        throw new Error(`Issue ${issue.slug} cannot depend on itself`);
      }
    }
  }

  detectCycle(plan.issues);
  return plan;
}

export function buildBlocksMap(issues) {
  const blocksMap = Object.fromEntries(issues.map((issue) => [issue.slug, []]));

  for (const issue of issues) {
    for (const dependencySlug of issue.dependsOn) {
      blocksMap[dependencySlug].push(issue.slug);
    }
  }

  for (const issue of issues) {
    blocksMap[issue.slug].sort();
  }

  return blocksMap;
}

export function topologicallySortIssues(issues) {
  const issueMap = new Map(issues.map((issue) => [issue.slug, issue]));
  const inDegree = new Map(issues.map((issue) => [issue.slug, issue.dependsOn.length]));
  const adjacency = buildBlocksMap(issues);
  const ready = issues
    .filter((issue) => issue.dependsOn.length === 0)
    .map((issue) => issue.slug)
    .sort();
  const sorted = [];

  while (ready.length > 0) {
    const slug = ready.shift();
    sorted.push(issueMap.get(slug));

    for (const blockedSlug of adjacency[slug]) {
      const nextDegree = inDegree.get(blockedSlug) - 1;
      inDegree.set(blockedSlug, nextDegree);
      if (nextDegree === 0) {
        ready.push(blockedSlug);
        ready.sort();
      }
    }
  }

  if (sorted.length !== issues.length) {
    throw new Error("Issue graph contains a cycle");
  }

  return sorted;
}

export function getReadyIssues(issues, issueStateMap) {
  return issues.filter((issue) => {
    const state = issueStateMap[issue.slug];
    if (!state || state.status !== "pending") {
      return false;
    }

    return issue.dependsOn.every((dependencySlug) => issueStateMap[dependencySlug]?.status === "merged");
  });
}

function detectCycle(issues) {
  const visiting = new Set();
  const visited = new Set();
  const issueMap = new Map(issues.map((issue) => [issue.slug, issue]));

  function visit(slug) {
    if (visited.has(slug)) {
      return;
    }

    if (visiting.has(slug)) {
      throw new Error(`Issue graph contains a cycle involving ${slug}`);
    }

    visiting.add(slug);
    for (const dependencySlug of issueMap.get(slug).dependsOn) {
      visit(dependencySlug);
    }
    visiting.delete(slug);
    visited.add(slug);
  }

  for (const issue of issues) {
    visit(issue.slug);
  }
}
