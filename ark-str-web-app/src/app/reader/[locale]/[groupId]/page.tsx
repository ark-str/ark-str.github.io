import { notFound } from "next/navigation";
import {
  CANONICAL_READER_LOCALES,
  READER_LOCALE_LABELS,
  isReaderLocale,
} from "@/features/content/config/canonical-reader-locales";
import {
  buildLocaleSwitchHref,
  findGroupEntry,
  getLocaleGroups,
  getLocaleStorylines,
  getGroupStories,
  getReaderGroupHref,
  getReaderGroupStaticParams,
  getReaderLocaleHref,
  readContentIndex,
  resolvePublicAssetPath,
} from "@/features/content/service/read-content-index";
import { ReaderGroupOverview } from "@/features/reader/ui/reader-group-overview";

export const dynamicParams = false;

export function generateStaticParams() {
  return getReaderGroupStaticParams();
}

export default async function ReaderGroupPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string }>;
}) {
  const { groupId, locale } = await params;

  if (!isReaderLocale(locale)) {
    notFound();
  }

  const index = readContentIndex();
  const group = findGroupEntry(index, locale, groupId);
  if (!group) {
    notFound();
  }

  const stories = getGroupStories(index, locale, groupId);
  const groupsById = new Map(getLocaleGroups(index, locale).map((item) => [item.groupId, item]));
  const primaryStoryline =
    getLocaleStorylines(index, locale).find((storyline) =>
      storyline.items.some((item) => item.role === "primary" && item.groupId === groupId),
    ) ?? null;
  const groupWithAssets = {
    ...group,
    backgroundImageHref: resolvePublicAssetPath(group.backgroundImagePath),
  };
  const groupFlowItems = (
    primaryStoryline?.items ?? [
      {
        displayTitle: group.title,
        groupId,
        locationId: null,
        locationType: null,
        role: "primary" as const,
        sortKey: 0,
        storySetId: null,
      },
    ]
  ).flatMap((item, index) => {
    const itemGroup = groupsById.get(item.groupId);
    if (!itemGroup) {
      return [];
    }

    return [
      {
        backgroundImageAspect: itemGroup.backgroundImageAspect,
        backgroundImageHref: resolvePublicAssetPath(itemGroup.backgroundImagePath),
        displayTitle: item.displayTitle || itemGroup.title,
        groupId: item.groupId,
        href: getReaderGroupHref(locale, item.groupId),
        isCurrent: item.groupId === groupId,
        itemKey: `${item.locationId ?? item.storySetId ?? item.groupId}:${item.role}:${index}`,
        role: item.role,
      },
    ];
  });

  return (
    <ReaderGroupOverview
      appBar={{
        currentLocale: locale,
        localeOptions: CANONICAL_READER_LOCALES.map((targetLocale) => ({
          locale: targetLocale,
          label: READER_LOCALE_LABELS[targetLocale].label,
          href: buildLocaleSwitchHref(index, targetLocale, groupId),
        })),
        storyRootHref: getReaderLocaleHref(locale),
        groupCrumb: {
          label: group.title,
          href: null,
        },
        storySelect: null,
      }}
      group={groupWithAssets}
      groupFlowItems={groupFlowItems}
      storylineTitle={primaryStoryline?.title ?? group.title}
      locale={locale}
      stories={stories}
    />
  );
}
