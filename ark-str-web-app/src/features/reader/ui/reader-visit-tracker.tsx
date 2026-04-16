"use client";

import { useEffect, useEffectEvent } from "react";
import { useReaderSession } from "@/features/reader/runtime/reader-session-context";
import type { LastVisitedStory } from "@/features/reader/types";

export function ReaderVisitTracker({ story }: { story: LastVisitedStory }) {
  const { isHydrated, setLastVisitedStory } = useReaderSession();
  const syncVisit = useEffectEvent(() => {
    setLastVisitedStory(story);
  });

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    syncVisit();
  }, [isHydrated, story.groupId, story.locale, story.storyId, story.title]);

  return null;
}
