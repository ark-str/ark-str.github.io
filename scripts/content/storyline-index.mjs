const OPERATOR_STORYLINE_ID = "synthetic_operator_narratives";
const UNCATEGORIZED_STORYLINE_ID = "synthetic_uncategorized";

function estimateReadingMinutes(visibleCharacterCount) {
  if (!Number.isFinite(visibleCharacterCount) || visibleCharacterCount <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(visibleCharacterCount / 450));
}

function isNoneReviewGroup(groupRecord) {
  return groupRecord?.entryType === "NONE" && groupRecord?.actType === "NONE";
}

function getNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function getMilestoneGroupIdsForActivity(activityId, zoneTable) {
  if (typeof activityId !== "string" || activityId.length === 0) {
    return [];
  }

  return Object.values(zoneTable?.zones ?? {})
    .filter((zone) => typeof zone?.zoneID === "string" && zone.zoneID.startsWith(`${activityId}_`))
    .map((zone) => zone.sixStarMilestoneGroupId)
    .filter((groupId) => typeof groupId === "string" && groupId.length > 0);
}

function resolveStorySetGroupId(storySet, storyReviewTable, zoneTable) {
  const candidates = [];

  if (typeof storySet?.mainlineData?.zoneId === "string") {
    candidates.push(storySet.mainlineData.zoneId);
  }

  if (typeof storySet?.relevantActivityId === "string") {
    candidates.push(storySet.relevantActivityId);
    candidates.push(...getMilestoneGroupIdsForActivity(storySet.relevantActivityId, zoneTable));
  }

  if (typeof storySet?.mainlineData?.retroId === "string") {
    candidates.push(storySet.mainlineData.retroId);
  }

  if (typeof storySet?.ssData?.retroActivityId === "string") {
    candidates.push(storySet.ssData.retroActivityId);
  }

  for (const candidate of [...new Set(candidates)]) {
    if (Object.hasOwn(storyReviewTable, candidate)) {
      return candidate;
    }
  }

  return null;
}

function getStorySetDisplayTitle(storySet, group) {
  return (
    group?.title ??
    storySet?.ssData?.name ??
    storySet?.collectData?.name ??
    storySet?.mainlineData?.zoneId ??
    storySet?.mainlineData?.retroId ??
    storySet?.storySetId ??
    "Untitled story set"
  );
}

function createStorylineEntry({
  isSynthetic = false,
  items,
  server,
  sortKey,
  storylineId,
  storylineType,
  title,
  groupsById,
}) {
  const primaryItems = items.filter((item) => item.role === "primary");
  const totalVisibleCharacterCount = primaryItems.reduce((total, item) => {
    const group = groupsById.get(item.groupId);
    return total + (group?.totalVisibleCharacterCount ?? 0);
  }, 0);

  return {
    server,
    storylineId,
    title,
    storylineType,
    sortKey,
    isSynthetic,
    primaryGroupCount: primaryItems.length,
    referenceCount: items.length - primaryItems.length,
    totalVisibleCharacterCount,
    estimatedMinutes: estimateReadingMinutes(totalVisibleCharacterCount),
    items,
  };
}

function createSyntheticItems(groups) {
  return groups
    .slice()
    .sort((left, right) => left.groupId.localeCompare(right.groupId))
    .map((group, index) => ({
      groupId: group.groupId,
      storySetId: null,
      locationId: null,
      locationType: null,
      role: "primary",
      sortKey: index + 1,
      displayTitle: group.title,
    }));
}

export function buildStorylineIndex({
  groups,
  server,
  stageTable,
  storyReviewTable,
  zoneTable,
}) {
  const groupsById = new Map(groups.map((group) => [group.groupId, group]));
  const primaryGroupIds = new Set();
  const storylines = [];
  const storylineRecords = Object.values(stageTable?.storylines ?? {}).sort(
    (left, right) => getNumber(left.sortId) - getNumber(right.sortId) || left.storylineId.localeCompare(right.storylineId),
  );

  for (const storylineRecord of storylineRecords) {
    const items = Object.values(storylineRecord.locations ?? {})
      .filter((location) => typeof location?.relevantStorySetId === "string")
      .sort(
        (left, right) =>
          getNumber(left.sortId) - getNumber(right.sortId) ||
          left.locationId.localeCompare(right.locationId),
      )
      .flatMap((location) => {
        const storySet = stageTable?.storylineStorySets?.[location.relevantStorySetId];
        const groupId = resolveStorySetGroupId(storySet, storyReviewTable, zoneTable);

        if (!groupId || !groupsById.has(groupId)) {
          return [];
        }

        const role = location.locationType === "STORY_SET" ? "primary" : "reference";
        if (role === "primary") {
          primaryGroupIds.add(groupId);
        }

        return [
          {
            groupId,
            storySetId: location.relevantStorySetId,
            locationId: location.locationId ?? null,
            locationType: location.locationType ?? null,
            role,
            sortKey: getNumber(location.sortId),
            displayTitle: getStorySetDisplayTitle(storySet, groupsById.get(groupId)),
          },
        ];
      });

    if (items.length === 0) {
      continue;
    }

    storylines.push(
      createStorylineEntry({
        groupsById,
        items,
        server,
        sortKey: getNumber(storylineRecord.sortId),
        storylineId: storylineRecord.storylineId,
        storylineType: storylineRecord.storylineType ?? null,
        title: storylineRecord.storylineName ?? storylineRecord.storylineId,
      }),
    );
  }

  const operatorGroups = groups.filter((group) => isNoneReviewGroup(storyReviewTable[group.groupId]));
  if (operatorGroups.length > 0) {
    storylines.push(
      createStorylineEntry({
        groupsById,
        isSynthetic: true,
        items: createSyntheticItems(operatorGroups),
        server,
        sortKey: 900100,
        storylineId: OPERATOR_STORYLINE_ID,
        storylineType: "SYNTHETIC",
        title: "오퍼레이터 서사",
      }),
    );
  }

  const uncategorizedGroups = groups.filter(
    (group) => !primaryGroupIds.has(group.groupId) && !isNoneReviewGroup(storyReviewTable[group.groupId]),
  );
  if (uncategorizedGroups.length > 0) {
    storylines.push(
      createStorylineEntry({
        groupsById,
        isSynthetic: true,
        items: createSyntheticItems(uncategorizedGroups),
        server,
        sortKey: 900000,
        storylineId: UNCATEGORIZED_STORYLINE_ID,
        storylineType: "SYNTHETIC",
        title: "미분류",
      }),
    );
  }

  return storylines.sort(
    (left, right) => left.sortKey - right.sortKey || left.storylineId.localeCompare(right.storylineId),
  );
}
