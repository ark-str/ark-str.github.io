import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import sharp from "sharp";

const appBasePath = normalizeAppBasePath(process.env.PLAYWRIGHT_APP_BASE_PATH ?? "");
const readerSessionKey = "ark-str:reader-session:v1";
const preferencesKey = "ark-str:app-preferences:v1";
const characterObservationsKey = "ark-str:character-observations:v1";
const storyNotesKey = "ark-str:story-notes:v1";
const readProgressKey = "ark-str:read-progress:v1";
const legacyBootstrapKey = "ark-str:reader-bootstrap:v1";
const browserIconFile = path.join(process.cwd(), "ark-str-web-app", "public", "ark_str_icon.png");
const appChromeIconFile = path.join(process.cwd(), "ark-str-web-app", "public", "ark_str_app_icon.png");
const generatedIndex = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "ark-str-web-app", "public", "generated", "content", "index.json"),
    "utf8",
  ),
);
const generatedBackgrounds = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "ark-str-web-app", "src", "generated", "content", "backgrounds.json"),
    "utf8",
  ),
);
const generatedAssets = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "ark-str-web-app", "public", "generated", "content", "assets.json"),
    "utf8",
  ),
);
const generatedKoreanSearchIndex = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "ark-str-web-app", "public", "generated", "content", "search", "kr.json"),
    "utf8",
  ),
);

function readStoryDetail(story: { bodyPath?: string | null }) {
  if (!story.bodyPath) {
    return null;
  }

  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "ark-str-web-app",
        "public",
        "generated",
        "content",
        story.bodyPath,
      ),
      "utf8",
    ),
  ) as {
    observedOperators?: Array<{ speakerId: string; aliases: string[] }>;
    summaryText?: string | null;
    blocks?: Array<{
      type?: string;
      backgroundId?: string | null;
      options?: Array<{ blocks?: unknown[] }>;
    }>;
  };
}

function readPngColorType(filePath: string) {
  return fs.readFileSync(filePath)[25];
}

async function readPngPixelAlpha(filePath: string, x: number, y: number) {
  const image = sharp(filePath).ensureAlpha().raw();
  const { data, info } = await image.toBuffer({ resolveWithObject: true });
  return data[(y * info.width + x) * info.channels + 3];
}

function hasBundledPortrait(speakerId: string) {
  const portraitPath = generatedAssets.portraits?.[speakerId];
  return (
    typeof portraitPath === "string" &&
    fs.existsSync(
      path.join(process.cwd(), "ark-str-web-app", "public", portraitPath.replace(/^\/+/, "")),
    )
  );
}

function hasBundledBackground(backgroundId: string) {
  return (
    typeof generatedBackgrounds[backgroundId] === "string" &&
    fs.existsSync(
      path.join(
        process.cwd(),
        "ark-str-web-app",
        "public",
        generatedBackgrounds[backgroundId].replace(/^\/+/, ""),
      ),
    )
  );
}

function collectBackgroundIds(blocks: Array<{
  type?: string;
  backgroundId?: string | null;
  options?: Array<{ blocks?: unknown[] }>;
}> = []) {
  const ids: string[] = [];

  for (const block of blocks) {
    if (block.type === "background" && typeof block.backgroundId === "string") {
      ids.push(block.backgroundId);
    }

    if (block.type === "choice") {
      for (const option of block.options ?? []) {
        ids.push(...collectBackgroundIds(option.blocks as Parameters<typeof collectBackgroundIds>[0]));
      }
    }
  }

  return ids;
}

function resolveSampleStory() {
  const prioritizedStories = [
    ...generatedIndex.stories.filter(
      (story: { server: string; bodyAvailable?: boolean }) => story.server === "kr" && story.bodyAvailable,
    ),
    ...generatedIndex.stories.filter(
      (story: { server: string; bodyAvailable?: boolean }) => story.server !== "kr" && story.bodyAvailable,
    ),
  ];

  for (const story of prioritizedStories) {
    const detail = readStoryDetail(story);
    if (
      typeof detail?.summaryText === "string" &&
      detail.summaryText.length > 0 &&
      detail.observedOperators?.some((observedOperator) => hasBundledPortrait(observedOperator.speakerId))
    ) {
      return {
        story,
        detail,
      };
    }
  }

  throw new Error("A sample reader story with observedOperators and a bundled portrait is required for smoke tests.");
}

function resolveBackgroundStory() {
  const prioritizedStories = [
    ...generatedIndex.stories.filter(
      (story: { server: string; bodyAvailable?: boolean }) => story.server === "kr" && story.bodyAvailable,
    ),
    ...generatedIndex.stories.filter(
      (story: { server: string; bodyAvailable?: boolean }) => story.server !== "kr" && story.bodyAvailable,
    ),
  ];

  for (const story of prioritizedStories) {
    const detail = readStoryDetail(story);
    const backgroundIds = [
      ...new Set(collectBackgroundIds(detail?.blocks).filter((backgroundId) => hasBundledBackground(backgroundId))),
    ];
    if (backgroundIds.length >= 2) {
      return {
        story,
        backgroundIds,
      };
    }
  }

  throw new Error("A sample reader story with multiple bundled background blocks is required for smoke tests.");
}

const sampleStorySelection = resolveSampleStory();
const sampleStory = sampleStorySelection.story;
const sampleStoryGroup = generatedIndex.groups.find(
  (group: { server: string; groupId: string }) =>
    group.server === sampleStory.server && group.groupId === sampleStory.groupId,
);
const sampleSiblingStories = generatedIndex.stories.filter(
  (story: { server: string; groupId: string }) =>
    story.server === sampleStory.server && story.groupId === sampleStory.groupId,
);
const sampleStorySiblingIndex = sampleSiblingStories.findIndex(
  (story: { storyId: string }) => story.storyId === sampleStory.storyId,
);
const samplePreviousStory =
  sampleStorySiblingIndex > 0 ? sampleSiblingStories[sampleStorySiblingIndex - 1] : null;
const sampleNextStory =
  sampleStorySiblingIndex >= 0 && sampleStorySiblingIndex < sampleSiblingStories.length - 1
    ? sampleSiblingStories[sampleStorySiblingIndex + 1]
    : null;
const sampleAlternateLocaleStory = generatedIndex.stories.find(
  (story: { server: string; storyId: string }) =>
    story.storyId === sampleStory.storyId && story.server !== sampleStory.server,
);
const sampleAlternateLocaleGroup = sampleAlternateLocaleStory
  ? generatedIndex.groups.find(
      (group: { server: string; groupId: string }) =>
        group.server === sampleAlternateLocaleStory.server &&
        group.groupId === sampleAlternateLocaleStory.groupId,
    )
  : null;

if (!sampleStoryGroup) {
  throw new Error("A sample reader story must have a matching group entry.");
}

if (!sampleAlternateLocaleStory) {
  throw new Error("A sample reader story must have a matching alternate locale story.");
}

if (!sampleAlternateLocaleGroup) {
  throw new Error("The alternate locale story must have a matching group entry.");
}

const sampleObservedOperator =
  sampleStorySelection.detail.observedOperators?.find((observedOperator) =>
    hasBundledPortrait(observedOperator.speakerId),
  ) ?? null;
const sampleObservedAlias =
  sampleObservedOperator?.aliases.find((alias) => alias.trim().length > 0 && alias !== "???") ??
  sampleObservedOperator?.aliases[0] ??
  null;
const sampleSummaryText = sampleStorySelection.detail.summaryText;
const sampleBackgroundStory = resolveBackgroundStory();
const sampleBackgroundIds = sampleBackgroundStory.backgroundIds;
const sampleBackgroundStoryEntry = sampleBackgroundStory.story;
const sampleSearchQuery = "로도스";
const sampleSearchStory = generatedKoreanSearchIndex.stories.find(
  (story: { text: string }) => story.text.includes(sampleSearchQuery),
);
const broadSearchQuery = "W";
const broadSearchResultCount = generatedKoreanSearchIndex.stories.filter((story: { text: string }) =>
  story.text.toLocaleLowerCase().includes(broadSearchQuery.toLocaleLowerCase()),
).length;
const koreanFeaturedStory = generatedIndex.stories.find(
  (story: { server: string }) => story.server === "kr",
);
const koreanMainStoryline = generatedIndex.storylines.find(
  (storyline: { server: string; storylineId: string }) =>
    storyline.server === "kr" && storyline.storylineId === "mainLine",
);
const koreanMainStorylineReference = koreanMainStoryline?.items.find(
  (item: { role: string }) => item.role === "reference",
);
const koreanMainStorylinePrimary = koreanMainStoryline?.items.find(
  (item: { role: string; groupId: string }) => item.role === "primary" && item.groupId === "main_0",
);
const koreanOperatorStoryline = generatedIndex.storylines.find(
  (storyline: { server: string; storylineId: string }) =>
    storyline.server === "kr" && storyline.storylineId === "synthetic_operator_narratives",
);
const koreanOperatorStorylinePrimary = koreanOperatorStoryline?.items.find(
  (item: { role: string }) => item.role === "primary",
);
const koreanNicknameStory = generatedIndex.stories.find(
  (story: { server: string; storyId: string }) =>
    story.server === "kr" && story.storyId === "act12d0_level_act12d0_01_end",
);
const koreanCapitalNicknameStory = generatedIndex.stories.find(
  (story: { server: string; storyId: string }) =>
    story.server === "kr" && story.storyId === "main_1_level_main_01-12_beg",
);

if (!koreanMainStoryline) {
  throw new Error("The Korean reader archive must include the mainLine storyline.");
}

if (!koreanFeaturedStory) {
  throw new Error("The Korean reader archive must include a featured story sample.");
}

if (!koreanMainStorylineReference) {
  throw new Error("The Korean mainLine storyline must include at least one flow reference.");
}

if (!koreanMainStorylinePrimary) {
  throw new Error("The Korean mainLine storyline must include main_0 as a primary group.");
}

if (!koreanOperatorStoryline) {
  throw new Error("The Korean reader archive must include the operator narrative storyline.");
}

if (!koreanOperatorStorylinePrimary) {
  throw new Error("The Korean operator narrative storyline must include at least one primary group.");
}

if (!koreanNicknameStory) {
  throw new Error("The Korean content index must include a nickname-token story sample.");
}

if (!koreanCapitalNicknameStory) {
  throw new Error("The Korean content index must include a capitalized nickname-token story sample.");
}

if (!sampleSummaryText) {
  throw new Error("The sample reader story must include generated summary text.");
}

if (!sampleSearchStory) {
  throw new Error("The Korean search index must include a story matching the sample search query.");
}

if (broadSearchResultCount <= 40) {
  throw new Error("The Korean search index must include enough broad-query results for incremental rendering.");
}

function normalizeAppBasePath(basePath: string) {
  const normalizedBasePath = basePath.replace(/^\/+|\/+$/g, "");

  return normalizedBasePath.length > 0 ? `/${normalizedBasePath}` : "";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toAppPath(route = "") {
  const normalizedRoute = route.replace(/^\/+/, "");
  const [routePath = "", query = ""] = normalizedRoute.split("?", 2);
  const normalizedRoutePath = routePath.replace(/\/+$/g, "");
  const pathname = normalizedRoutePath.length > 0 ? `/${normalizedRoutePath}/` : "/";

  return `${appBasePath}${pathname}${query.length > 0 ? `?${query}` : ""}`;
}

function toPublicPath(publicPath: string) {
  return `${appBasePath}/${publicPath.replace(/^\/+/, "")}`;
}

function toAppPathPattern(route = "") {
  const path = toAppPath(route).replace(/\/$/g, "");
  return new RegExp(`${escapeRegExp(path)}/?$`);
}

function trackBrowserErrors(page: Page) {
  const consoleErrors: string[] = [];
  const notFoundResponses: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      const text = message.text();
      if (text !== "Failed to load resource: the server responded with a status of 503 (Service Unavailable)") {
        consoleErrors.push(text);
      }
    }
  });

  page.on("response", (response) => {
    if (response.status() === 404) {
      notFoundResponses.push(response.url());
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  return {
    assertClean() {
      expect(notFoundResponses, "unexpected 404 responses").toEqual([]);
      expect(consoleErrors, "unexpected browser console errors").toEqual([]);
      expect(pageErrors, "unexpected uncaught browser errors").toEqual([]);
    },
  };
}

async function readScrollbarTrackBackground(locator: Locator) {
  return locator.evaluate((node) => window.getComputedStyle(node, "::-webkit-scrollbar-track").backgroundColor);
}

test.describe("reader shell smoke", () => {
  test("opens locale archives, reads a story, and restores session without browser errors", async ({
    page,
  }) => {
    const browserErrors = trackBrowserErrors(page);

    await page.goto(toAppPath());
    await page.evaluate(([session, prefs, legacy, characterObservations, storyNotes, readProgress]) => {
      window.localStorage.removeItem(session);
      window.localStorage.removeItem(prefs);
      window.localStorage.removeItem(legacy);
      window.localStorage.removeItem(characterObservations);
      window.localStorage.removeItem(storyNotes);
      window.localStorage.removeItem(readProgress);
    }, [
      readerSessionKey,
      preferencesKey,
      legacyBootstrapKey,
      characterObservationsKey,
      storyNotesKey,
      readProgressKey,
    ]);
    await page.reload();

    await expect(page.getByTestId("bootstrap-shell")).toBeVisible();
    await expect(page.getByTestId("home-hero")).toBeVisible();
    await expect(page.getByTestId("readiness-panel")).toBeVisible();
    await expect(page.getByTestId("locale-select")).toBeEnabled();
    await expect(page.getByTestId("locale-select")).toHaveValue("kr");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator('link[rel="icon"][type="image/png"]')).toHaveAttribute(
      "href",
      toPublicPath("ark_str_icon.png"),
    );
    expect(readPngColorType(browserIconFile)).toBe(6);
    expect(await readPngPixelAlpha(browserIconFile, 0, 0)).toBe(0);
    expect(await readPngPixelAlpha(browserIconFile, 48, 48)).toBe(255);
    expect(readPngColorType(appChromeIconFile)).toBe(6);
    await expect(page.getByTestId("service-intro-icon")).toBeVisible();
    await expect(page.getByTestId("service-intro-section")).toContainText("ARK STR");
    await expect(page.getByTestId("service-intro-section")).toContainText("명일방주");
    const serviceIntroBounds = await page.getByTestId("service-intro-section").evaluate((node) => {
      const rect = node.getBoundingClientRect();

      return {
        left: rect.left,
        width: rect.width,
        viewportWidth: window.innerWidth,
      };
    });
    expect(Math.abs(serviceIntroBounds.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(serviceIntroBounds.width - serviceIntroBounds.viewportWidth)).toBeLessThanOrEqual(
      1,
    );
    const homeViewportWidth = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(homeViewportWidth.scrollWidth).toBeLessThanOrEqual(homeViewportWidth.clientWidth + 1);
    await expect(page.getByTestId("home-recommendations")).toContainText("관리자의 테라노트");
    await expect(page.getByTestId("home-recommendations")).not.toContainText("테라를 읽기 위한 네 가지 동선");
    await expect(page.getByTestId("home-recommendation-collection")).toHaveCount(4);
    const behemothCollection = page
      .getByTestId("home-recommendation-collection")
      .filter({ hasText: "탐색: 베헤모스" });
    const behemothHrefs = await behemothCollection.locator("a").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("href")),
    );
    expect(behemothHrefs).toEqual([
      toAppPath("reader/kr/act23side"),
      toAppPath("reader/kr/main_13"),
      toAppPath("reader/kr/act31side"),
      toAppPath("reader/kr/act34side"),
      toAppPath("reader/kr/act46side"),
    ]);
    await expect(page.getByTestId("site-footer")).toContainText("Maintainer - dev.Woong");
    await expect(page.getByTestId("site-footer")).toContainText("토루");
    await expect(page.getByTestId("site-footer-issue-link")).toHaveAttribute("target", "_blank");
    const nicknameInput = page.getByTestId("nickname-input");
    await expect(nicknameInput).toBeEnabled();
    await nicknameInput.fill("로도스");
    await expect(nicknameInput).toHaveValue("로도스");
    await expect(page.getByTestId("continue-reading-link")).toContainText(koreanFeaturedStory.title);
    await expect(page.getByTestId("continue-reading-link")).not.toContainText("로도스");
    await expect(page.getByTestId("server-count")).not.toHaveText("0");
    await expect(page.getByTestId("story-count")).not.toHaveText("0");

    await page.getByTestId("locale-select").selectOption("en");
    await expect(page.getByTestId("service-intro-section")).toContainText("Arknights");
    await page.getByTestId("theme-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(page.getByTestId("locale-select")).toHaveValue("en");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByTestId("nickname-input")).toHaveValue("로도스");
    await expect(page.getByTestId("home-recommendations")).toContainText("Administrator's Terra Notes");

    await page.getByRole("link", { name: "Story" }).click();
    await expect(page).toHaveURL(toAppPathPattern("reader/en"));
    await expect(page.getByTestId("reader-shell")).toBeVisible();

    await page.goto(toAppPath("reader/kr"));
    await expect(page.getByTestId("reader-shell")).toBeVisible();
    await expect(page.getByTestId("reader-shell")).not.toContainText(
      "locale archive는 group overview와 story reader의 출발점입니다.",
    );
    await page.setViewportSize({ width: 390, height: 820 });
    const archiveStorylinesAlignment = await page
      .getByTestId("archive-storylines-card")
      .evaluate((node) => {
        const cardRect = node.getBoundingClientRect();
        const parentRect = node.parentElement?.getBoundingClientRect();

        if (!parentRect) {
          throw new Error("Archive storylines card parent was not found.");
        }

        return {
          cardRight: Math.round(cardRect.right),
          parentRight: Math.round(parentRect.right),
        };
      });
    expect(
      Math.abs(archiveStorylinesAlignment.cardRight - archiveStorylinesAlignment.parentRight),
    ).toBeLessThanOrEqual(1);
    await page.setViewportSize({ width: 1280, height: 720 });
    const mainStorylineSection = page.locator(
      '[data-testid="storyline-section"][data-storyline-id="mainLine"]',
    );
    await expect(mainStorylineSection).toBeVisible();
    await expect(mainStorylineSection.getByRole("heading", { name: "내일을 위하여" })).toBeVisible();
    const storylineGrid = page.getByTestId("storyline-grid");
    const storylineIds = await storylineGrid.getByTestId("storyline-section").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-storyline-id")),
    );
    expect(storylineIds).not.toContain("synthetic_operator_narratives");
    const operatorStorylineSection = page.getByTestId("operator-storyline-section");
    await expect(
      operatorStorylineSection.locator(
        '[data-testid="storyline-section"][data-storyline-id="synthetic_operator_narratives"]',
      ),
    ).toBeVisible();

    const mainStorylinePanel = mainStorylineSection.getByTestId("storyline-panel");
    await expect(mainStorylinePanel).toHaveAttribute("data-state", "closed");
    await expect(mainStorylineSection.getByTestId("disclosure-toggle-icon")).toBeVisible();
    await expect(mainStorylineSection.getByTestId("storyline-toggle")).not.toContainText("+");
    const mainPrimaryRow = mainStorylineSection.locator(
      '[data-testid="storyline-primary-card"][data-group-id="main_0"]',
    );
    await expect(mainStorylinePanel).toHaveAttribute("aria-hidden", "true");
    await expect(mainStorylinePanel).toHaveAttribute("inert", "");
    await mainStorylineSection.getByTestId("storyline-toggle").click();
    await expect(mainStorylinePanel).toHaveAttribute("data-state", "open");
    await expect(mainStorylinePanel).toHaveAttribute("aria-hidden", "false");
    await expect(mainStorylinePanel).not.toHaveAttribute("inert", "");
    const mainStorylineGridPlacement = await mainStorylineSection.evaluate((node) => {
      const styles = window.getComputedStyle(node);
      return {
        gridColumnEnd: styles.gridColumnEnd,
        gridColumnStart: styles.gridColumnStart,
      };
    });
    expect(mainStorylineGridPlacement).toEqual({
      gridColumnEnd: "auto",
      gridColumnStart: "auto",
    });
    const panelTransitionDuration = await mainStorylinePanel.evaluate(
      (node) => window.getComputedStyle(node).transitionDuration,
    );
    expect(panelTransitionDuration).toContain("0.3s");
    const panelTransitionProperty = await mainStorylinePanel.evaluate(
      (node) => window.getComputedStyle(node).transitionProperty,
    );
    expect(panelTransitionProperty).not.toContain("opacity");
    const mainStorylineItemList = mainStorylineSection.getByTestId("storyline-item-list");
    await expect(mainStorylineItemList).toHaveCSS("display", "flex");
    await expect(mainStorylineItemList).toHaveCSS("flex-direction", "column");
    await expect(mainPrimaryRow).toBeVisible();
    await expect(mainPrimaryRow).toHaveAttribute(
      "href",
      toAppPath(`reader/kr/${koreanMainStorylinePrimary.groupId}`),
    );
    await expect(mainPrimaryRow.getByTestId("storyline-primary-card-title")).toHaveCSS(
      "color",
      "rgb(255, 255, 255)",
    );
    await expect(mainPrimaryRow.getByTestId("storyline-primary-card-metrics").locator("span")).toHaveCount(3);
    const archivePrimaryCardSpacing = await mainPrimaryRow.evaluate((card) => {
      const title = card.querySelector('[data-testid="storyline-primary-card-title"]');
      const metrics = card.querySelector('[data-testid="storyline-primary-card-metrics"]');
      const firstBadge = metrics?.querySelector("span");

      if (!title || !metrics || !firstBadge) {
        throw new Error("Archive primary card spacing targets were not found.");
      }

      const titleStyles = window.getComputedStyle(title);
      const metricsStyles = window.getComputedStyle(metrics);
      const badgeStyles = window.getComputedStyle(firstBadge);

      return {
        badgeHeight: badgeStyles.height,
        badgePaddingLeft: badgeStyles.paddingLeft,
        columnGap: metricsStyles.columnGap,
        rowGap: metricsStyles.rowGap,
        titleMarginBottom: titleStyles.marginBottom,
      };
    });
    expect(archivePrimaryCardSpacing).toEqual({
      badgeHeight: "24px",
      badgePaddingLeft: "10px",
      columnGap: "6px",
      rowGap: "6px",
      titleMarginBottom: "16px",
    });
    await expect(mainPrimaryRow).toContainText("스토리");
    await expect(mainPrimaryRow).toContainText("글자");
    await expect(mainPrimaryRow).not.toContainText("Open group");
    await expect(mainStorylineSection.getByTestId("storyline-reference-list")).toHaveCount(0);
    const firstReferenceRow = mainStorylineSection.getByTestId("storyline-reference-link").first();
    await expect(firstReferenceRow).toHaveText(koreanMainStorylineReference.displayTitle);
    await expect(firstReferenceRow).toHaveAttribute(
      "href",
      toAppPath(`reader/kr/${koreanMainStorylineReference.groupId}`),
    );
    await expect(
      page.locator(
        '[data-testid="storyline-section"][data-storyline-id="synthetic_operator_narratives"]',
      ),
    ).toContainText("오퍼레이터 서사");
    const operatorStorylineGrid = operatorStorylineSection.getByTestId("storyline-item-grid");
    await operatorStorylineSection.getByTestId("storyline-toggle").click();
    await expect(operatorStorylineGrid).toHaveCSS("display", "grid");
    await expect(
      page.locator('[data-testid="storyline-section"][data-storyline-id="synthetic_uncategorized"]'),
    ).toContainText("미분류");
    await page.goto(toAppPath("reader/en"));
    await expect(
      page.locator(
        '[data-testid="storyline-section"][data-storyline-id="synthetic_operator_narratives"]',
      ),
    ).toContainText("Operator Narratives");
    await expect(
      page.locator(
        '[data-testid="storyline-section"][data-storyline-id="synthetic_operator_narratives"]',
      ),
    ).not.toContainText("오퍼레이터 서사");
    await expect(
      page.locator('[data-testid="storyline-section"][data-storyline-id="synthetic_uncategorized"]'),
    ).toContainText("Uncategorized");

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}`),
    );
    await expect(page.getByTestId("group-shell")).toBeVisible();
    const groupPageCrumb = page.getByTestId("group-crumb-link");
    await expect(groupPageCrumb).toHaveAttribute(
      "href",
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}`),
    );
    await expect(groupPageCrumb).toHaveText(sampleStoryGroup.title);
    await expect(groupPageCrumb).toHaveCSS("border-top-left-radius", "6.8px");
    await page.setViewportSize({ width: 390, height: 820 });
    const groupHeroTitleBounds = await page.getByTestId("group-hero-title").evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        right: rect.right,
        viewportWidth: window.innerWidth,
        width: rect.width,
      };
    });
    expect(groupHeroTitleBounds.width).toBeLessThanOrEqual(groupHeroTitleBounds.viewportWidth);
    expect(groupHeroTitleBounds.right).toBeLessThanOrEqual(groupHeroTitleBounds.viewportWidth);
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByTestId("group-stats")).toBeVisible();
    await expect(page.getByTestId("group-flow-nav")).toBeVisible();
    expect(await readScrollbarTrackBackground(page.getByTestId("group-flow-scroll"))).toBe(
      "rgba(0, 0, 0, 0)",
    );
    await expect(
      page.locator(
        `[data-testid="group-flow-card"][data-group-id="${sampleStory.groupId}"][data-current="true"]`,
      ),
    ).toBeVisible();
    const sampleStoryCard = page.locator(
      `[data-testid="group-story-card"][href="${toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`)}"]`,
    );
    await expect(sampleStoryCard).toBeVisible();
    await expect(sampleStoryCard.getByTestId("group-story-metrics")).toContainText("글자");
    if (sampleStory.storyCode) {
      await expect(sampleStoryCard.getByTestId("story-stage-badge")).toContainText(sampleStory.storyCode);
    }
    if (sampleStory.avgTag) {
      await expect(sampleStoryCard.getByTestId("story-phase-badge")).toContainText(sampleStory.avgTag);
      const groupStoryPhaseBadgeBorderColor = await sampleStoryCard
        .getByTestId("story-phase-badge")
        .evaluate((node) => window.getComputedStyle(node).borderTopColor);
      const accentBorderColor = await page.evaluate(() => {
        const probe = document.createElement("span");
        probe.style.color = "var(--accent)";
        document.body.append(probe);
        const color = window.getComputedStyle(probe).color;
        probe.remove();
        return color;
      });
      expect(groupStoryPhaseBadgeBorderColor).toBe(accentBorderColor);
    }
    await expect(sampleStoryCard).not.toContainText(sampleStory.storyId);
    await expect(page.getByTestId("group-shell")).not.toContainText("Open story");
    await expect(page.getByTestId("group-shell")).not.toContainText("Bundled body ready");

    await page.goto(toAppPath(`reader/kr/${koreanMainStorylinePrimary.groupId}`));
    const mainGroupFlow = page.getByTestId("group-flow-nav");
    await expect(mainGroupFlow).toBeVisible();
    await expect(mainGroupFlow.getByRole("heading", { name: koreanMainStoryline.title })).toBeVisible();
    await expect(mainGroupFlow).not.toContainText("Storyline flow");
    const currentMainGroupFlowCard = mainGroupFlow.locator(
      `[data-testid="group-flow-card"][data-group-id="${koreanMainStorylinePrimary.groupId}"][data-current="true"]`,
    );
    await expect(currentMainGroupFlowCard).toBeVisible();
    await expect(currentMainGroupFlowCard.getByTestId("group-flow-card-title")).toHaveCSS(
      "color",
      "rgb(255, 255, 255)",
    );
    const currentMainGroupFlowImage = currentMainGroupFlowCard.getByTestId("group-flow-card-image");
    if ((await currentMainGroupFlowImage.count()) > 0) {
      await expect(currentMainGroupFlowImage).toBeVisible();
      const currentMainGroupFlowImageOpacity = Number(
        await currentMainGroupFlowImage.evaluate((node) => window.getComputedStyle(node).opacity),
      );
      expect(currentMainGroupFlowImageOpacity).toBeGreaterThanOrEqual(0.7);
    }
    const mainGroupFlowReferenceCard = mainGroupFlow.locator(
      `[data-testid="group-flow-card"][data-group-id="${koreanMainStorylineReference.groupId}"][data-role="reference"]`,
    ).first();
    await expect(mainGroupFlowReferenceCard).toBeVisible();
    await expect(mainGroupFlowReferenceCard.locator("svg")).toBeVisible();

    await page.goto(toAppPath(`reader/kr/${koreanOperatorStorylinePrimary.groupId}`));
    const operatorGroupFlow = page.getByTestId("group-flow-nav");
    await expect(operatorGroupFlow.getByRole("heading", { name: koreanOperatorStoryline.title })).toBeVisible();
    expect(await operatorGroupFlow.getByTestId("group-flow-card").count()).toBeLessThanOrEqual(24);
    await expect(
      operatorGroupFlow.locator(
        `[data-testid="group-flow-card"][data-group-id="${koreanOperatorStorylinePrimary.groupId}"][data-current="true"]`,
      ),
    ).toBeVisible();

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );
    await expect(page.getByTestId("reader-shell")).toBeVisible();
    await expect(page.getByTestId("story-backdrop")).toBeVisible();
    await expect(page.getByTestId("chrome-story-select")).toBeVisible();
    await expect(page.getByTestId("story-body")).toBeVisible();
    await expect(page.getByTestId("story-note-open-button")).toBeEnabled();
    await expect(page.getByTestId("story-control-stack")).toHaveCount(2);
    await expect(page.getByTestId("story-action-panel")).toHaveCount(2);
    const topStoryControls = page.locator('[data-testid="story-control-stack"][data-placement="top"]');
    const bottomStoryControls = page.locator('[data-testid="story-control-stack"][data-placement="bottom"]');
    await expect(topStoryControls.getByTestId("story-bottom-nav")).toBeVisible();
    await expect(bottomStoryControls.getByTestId("story-bottom-nav")).toBeVisible();
    await expect(topStoryControls.getByTestId("story-summary-section")).toBeVisible();
    await expect(bottomStoryControls.getByTestId("story-summary-section")).toBeVisible();
    const topReadToggle = topStoryControls.getByTestId("story-read-toggle");
    await expect(topReadToggle).toBeEnabled();
    await expect(topReadToggle).toHaveAttribute("data-read", "false");
    await bottomStoryControls.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await expect(page.getByTestId("story-read-toggle").first()).toHaveAttribute("data-read", "true");
    await expect(page.getByTestId("story-read-toggle").last()).toHaveAttribute("data-read", "true");
    await page.waitForFunction(
      ([key, storyId]) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          return false;
        }

        try {
          const parsed = JSON.parse(stored);
          return parsed?.readStories?.[storyId]?.storyId === storyId;
        } catch {
          return false;
        }
      },
      [readProgressKey, sampleStory.storyId],
    );
    await topStoryControls.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await page.waitForFunction(() => {
      const bottomControls = document.querySelector<HTMLElement>(
        '[data-testid="story-control-stack"][data-placement="bottom"]',
      );
      return Boolean(bottomControls && bottomControls.getBoundingClientRect().top > window.innerHeight);
    });
    await topReadToggle.click();
    await expect(topReadToggle).toHaveAttribute("data-read", "false");
    await bottomStoryControls.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await expect(topReadToggle).toHaveAttribute("data-read", "true");
    await page.waitForFunction(
      ([key, storyId]) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          return false;
        }

        try {
          const parsed = JSON.parse(stored);
          return parsed?.readStories?.[storyId]?.storyId === storyId;
        } catch {
          return false;
        }
      },
      [readProgressKey, sampleStory.storyId],
    );
    await page.getByTestId("story-ai-summary-button").first().click();
    await expect(page).toHaveURL(
      toAppPathPattern(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );
    await expect(page.getByTestId("story-ai-summary-card")).toHaveCount(2);
    await expect(page.getByTestId("story-ai-summary-error")).toHaveCount(2);
    await expect(page.getByTestId("story-ai-summary-settings-link")).toHaveCount(2);
    await page.getByTestId("story-ai-summary-settings-link").first().click();
    await expect(page).toHaveURL(toAppPathPattern("settings"));
    await page.goBack();
    await expect(page.getByTestId("reader-shell")).toBeVisible();
    let aiSummaryRequestCount = 0;
    let latestAiSummaryPrompt = "";
    await page.route("https://generativelanguage.googleapis.com/**", async (route) => {
      aiSummaryRequestCount += 1;
      const payload = route.request().postDataJSON() as {
        contents?: Array<{ parts?: Array<{ text?: string }> }>;
      };
      latestAiSummaryPrompt = payload.contents?.[0]?.parts?.[0]?.text ?? "";

      if (aiSummaryRequestCount === 1) {
        await route.fulfill({
          contentType: "application/json",
          status: 503,
          body: JSON.stringify({
            error: {
              code: 503,
              message: "The model is overloaded. Please try again later.",
              status: "UNAVAILABLE",
            },
          }),
        });
        return;
      }

      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text:
                      aiSummaryRequestCount === 2
                        ? "# Shared top action summary\n\n- **Plot**: top branch uses `Rhodes`."
                        : "## Shared bottom action summary\n\n1. **Outcome**: bottom branch.\n\n```txt\nshared markdown code\n```",
                  },
                ],
              },
            },
          ],
        }),
      });
    });
    await page.evaluate(([key]) => {
      const current = JSON.parse(window.localStorage.getItem(key) ?? "{}");
      window.localStorage.setItem(
        key,
        JSON.stringify({
          ...current,
          googleAiStudioApiKey: "smoke-api-key",
          theme: current.theme === "dark" ? "dark" : "light",
        }),
      );
    }, [preferencesKey]);
    await page.reload();
    await expect(page.getByTestId("story-body")).toBeVisible({ timeout: 15_000 });
    const firstSummarySpeaker = await page
      .locator("[data-ai-summary-speaker]")
      .first()
      .getAttribute("data-ai-summary-speaker");
    expect(firstSummarySpeaker).toBeTruthy();
    await page.getByTestId("story-ai-summary-button").first().click();
    await expect(page.getByTestId("story-ai-summary-card")).toHaveCount(2);
    await expect(page.getByTestId("story-ai-summary-error")).toHaveCount(2);
    await expect(page.getByTestId("story-ai-summary-error").first()).toContainText("응답 코드: 503");
    await expect(page.getByTestId("story-ai-summary-error").first()).not.toContainText(
      "요약에 실패했습니다: 요약에 실패했습니다",
    );
    expect(aiSummaryRequestCount).toBe(1);
    expect(latestAiSummaryPrompt).toContain("## 등장인물(이명 포함)");
    expect(latestAiSummaryPrompt).toContain("## 주요 내용");
    expect(latestAiSummaryPrompt).toContain("## 최종 요약");
    const latestAiSummaryTranscript = latestAiSummaryPrompt.split("Story text:\n")[1] ?? "";
    expect(latestAiSummaryTranscript).toContain(`${firstSummarySpeaker}:`);
    await page.getByTestId("story-ai-summary-button").first().click();
    await expect(page.getByTestId("story-ai-summary-card")).toHaveCount(2);
    await expect(page.getByTestId("story-ai-summary-result")).toHaveCount(2);
    await expect(page.getByTestId("story-ai-summary-card").first()).toContainText(
      "Shared top action summary",
    );
    await expect(page.getByTestId("story-ai-summary-card").last()).toContainText(
      "Shared top action summary",
    );
    await expect(page.getByTestId("story-ai-summary-heading")).toHaveCount(2);
    await expect(page.getByTestId("story-ai-summary-list")).toHaveCount(2);
    await expect(page.getByTestId("story-ai-summary-strong")).toHaveCount(2);
    await expect(page.getByTestId("story-ai-summary-inline-code")).toHaveCount(2);
    await page.getByTestId("story-ai-summary-button").last().click();
    await expect(page.getByTestId("story-ai-summary-card").first()).toContainText(
      "Shared bottom action summary",
    );
    await expect(page.getByTestId("story-ai-summary-card").last()).toContainText(
      "Shared bottom action summary",
    );
    await expect(page.getByTestId("story-ai-summary-code")).toHaveCount(2);
    if (samplePreviousStory) {
      await expect(page.getByTestId("story-previous-link")).toHaveCount(2);
      for (const controls of [topStoryControls, bottomStoryControls]) {
        await expect(controls.getByTestId("story-previous-link")).toHaveAttribute(
          "href",
          toAppPath(`reader/${samplePreviousStory.server}/${samplePreviousStory.groupId}/${samplePreviousStory.storyId}`),
        );
      }
    } else {
      await expect(page.getByTestId("story-previous-disabled")).toHaveCount(2);
    }
    if (sampleNextStory) {
      await expect(page.getByTestId("story-next-link")).toHaveCount(2);
      for (const controls of [topStoryControls, bottomStoryControls]) {
        await expect(controls.getByTestId("story-next-link")).toHaveAttribute(
          "href",
          toAppPath(`reader/${sampleNextStory.server}/${sampleNextStory.groupId}/${sampleNextStory.storyId}`),
        );
      }
    } else {
      await expect(page.getByTestId("story-next-disabled")).toHaveCount(2);
    }

    await page.goto(toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}`));
    const readSampleStoryCard = page.locator(
      `[data-testid="group-story-card"][href="${toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`)}"]`,
    );
    await expect(readSampleStoryCard).toHaveAttribute("data-read", "true");
    await expect(readSampleStoryCard.getByTestId("group-story-read-badge")).toContainText("읽음");
    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );
    await expect(page.getByTestId("reader-shell")).toBeVisible();

    const sampleNoteText = "Smoke test note for shared story memo.";
    const updatedSampleNoteText = `${sampleNoteText}\nEdited from another locale.`;
    await page.getByTestId("story-note-open-button").click();
    const desktopNotePanel = page.getByTestId("story-note-panel");
    await expect(desktopNotePanel).toBeVisible();
    const desktopNotePanelMetrics = await desktopNotePanel.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        bottom: Math.round(rect.bottom),
        height: Math.round(rect.height),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        top: Math.round(rect.top),
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        width: Math.round(rect.width),
      };
    });
    expect(desktopNotePanelMetrics.top).toBe(0);
    expect(Math.abs(desktopNotePanelMetrics.right - desktopNotePanelMetrics.viewportWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(desktopNotePanelMetrics.height - desktopNotePanelMetrics.viewportHeight)).toBeLessThanOrEqual(1);
    expect(desktopNotePanelMetrics.left).toBeGreaterThan(desktopNotePanelMetrics.viewportWidth / 2);
    expect(desktopNotePanelMetrics.width).toBeGreaterThan(320);
    await page.getByTestId("story-note-textarea").fill(sampleNoteText);
    await page.waitForFunction(
      ([key, storyId, text, locale, groupId]) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          return false;
        }

        try {
          const parsed = JSON.parse(stored);
          const note = parsed?.notes?.[storyId];
          return note?.text === text && note?.locale === locale && note?.groupId === groupId;
        } catch {
          return false;
        }
      },
      [storyNotesKey, sampleStory.storyId, sampleNoteText, sampleStory.server, sampleStory.groupId],
    );
    await expect(page.getByTestId("story-note-open-button")).toHaveAttribute("data-has-note", "true");
    await page.getByTestId("story-note-close-button").click();
    await page.reload();
    await page.getByTestId("story-note-open-button").click();
    await expect(page.getByTestId("story-note-textarea")).toHaveValue(sampleNoteText);
    await page.getByTestId("story-note-close-button").click();

    await page.goto(
      toAppPath(
        `reader/${sampleAlternateLocaleStory.server}/${sampleAlternateLocaleStory.groupId}/${sampleAlternateLocaleStory.storyId}`,
      ),
    );
    await expect(page.getByTestId("reader-shell")).toBeVisible();
    await expect(page.getByTestId("story-read-toggle").first()).toHaveAttribute("data-read", "true");
    await page.getByTestId("story-note-open-button").click();
    await expect(page.getByTestId("story-note-textarea")).toHaveValue(sampleNoteText);
    await page.getByTestId("story-note-textarea").fill(updatedSampleNoteText);
    await page.waitForFunction(
      ([key, storyId, text, locale, groupId]) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          return false;
        }

        try {
          const parsed = JSON.parse(stored);
          const note = parsed?.notes?.[storyId];
          return note?.text === text && note?.locale === locale && note?.groupId === groupId;
        } catch {
          return false;
        }
      },
      [
        storyNotesKey,
        sampleStory.storyId,
        updatedSampleNoteText,
        sampleAlternateLocaleStory.server,
        sampleAlternateLocaleStory.groupId,
      ],
    );
    await page.getByTestId("story-note-close-button").click();

    await page.setViewportSize({ width: 390, height: 820 });
    await page.getByTestId("story-note-open-button").click();
    const mobileNotePanel = page.getByTestId("story-note-panel");
    const mobileNotePanelMetrics = await mobileNotePanel.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        width: Math.round(rect.width),
      };
    });
    expect(Math.abs(mobileNotePanelMetrics.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(mobileNotePanelMetrics.width - mobileNotePanelMetrics.viewportWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(mobileNotePanelMetrics.bottom - mobileNotePanelMetrics.viewportHeight)).toBeLessThanOrEqual(1);
    expect(mobileNotePanelMetrics.top).toBeGreaterThan(100);
    await expect(mobileNotePanel.locator('[data-testid="story-note-panel-handle"]')).toHaveCount(0);
    const mobileNotePanelUrl = page.url();
    await page.goBack();
    await expect(page.getByTestId("story-note-panel")).toHaveCount(0);
    expect(page.url()).toBe(mobileNotePanelUrl);
    await page.getByTestId("story-note-open-button").click();
    await page.getByTestId("story-note-close-button").click();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.evaluate(() => window.scrollTo(0, 0));

    await page.getByTestId("notes-overview-link").click();
    await expect(page).toHaveURL(toAppPathPattern("notes"));
    await expect(page.getByTestId("notes-shell")).toBeVisible();
    await expect(page.getByTestId("notes-list")).toHaveCSS("display", "grid");
    const noteCard = page.getByTestId("note-card").filter({ hasText: sampleAlternateLocaleStory.title });
    await expect(noteCard).toBeVisible();
    await expect(noteCard).toContainText(sampleAlternateLocaleStory.title);
    await expect(noteCard).toContainText(sampleAlternateLocaleGroup.title);
    await expect(noteCard).not.toContainText("한국어");
    await expect(noteCard).not.toContainText("简体中文");
    if (sampleAlternateLocaleStory.storyCode) {
      await expect(noteCard.getByTestId("note-stage-badge")).toContainText(sampleAlternateLocaleStory.storyCode);
    }
    if (sampleAlternateLocaleStory.avgTag) {
      await expect(noteCard.getByTestId("note-phase-badge")).toContainText(sampleAlternateLocaleStory.avgTag);
    }
    await expect(noteCard.getByTestId("note-card-textarea")).toHaveValue(updatedSampleNoteText);
    await expect(noteCard.getByTestId("note-story-link")).toHaveAttribute(
      "href",
      toAppPath(
        `reader/${sampleAlternateLocaleStory.server}/${sampleAlternateLocaleStory.groupId}/${sampleAlternateLocaleStory.storyId}`,
      ),
    );
    const noteCardLayoutMetrics = await noteCard.evaluate((node) => {
      const titleBlock = node.querySelector('[data-testid="note-title-block"]');
      const storyLink = node.querySelector('[data-testid="note-story-link"]');
      const updatedAt = node.querySelector('[data-testid="note-updated-at"]');

      if (!titleBlock || !storyLink || !updatedAt) {
        throw new Error("Note card layout targets were not found.");
      }

      const cardRect = node.getBoundingClientRect();
      const titleRect = titleBlock.getBoundingClientRect();
      const linkRect = storyLink.getBoundingClientRect();
      const updatedAtRect = updatedAt.getBoundingClientRect();

      return {
        cardBottom: Math.round(cardRect.bottom),
        cardRight: Math.round(cardRect.right),
        linkLeft: Math.round(linkRect.left),
        linkRight: Math.round(linkRect.right),
        titleRight: Math.round(titleRect.right),
        updatedAtBottom: Math.round(updatedAtRect.bottom),
        updatedAtRight: Math.round(updatedAtRect.right),
      };
    });
    expect(noteCardLayoutMetrics.linkLeft).toBeGreaterThanOrEqual(noteCardLayoutMetrics.titleRight);
    expect(noteCardLayoutMetrics.cardRight - noteCardLayoutMetrics.linkRight).toBeLessThanOrEqual(24);
    expect(noteCardLayoutMetrics.cardBottom - noteCardLayoutMetrics.updatedAtBottom).toBeLessThanOrEqual(24);
    expect(noteCardLayoutMetrics.cardRight - noteCardLayoutMetrics.updatedAtRight).toBeLessThanOrEqual(24);
    const overviewEditedNoteText = `${updatedSampleNoteText}\nEdited in the notes overview.`;
    await noteCard.getByTestId("note-card-textarea").fill(overviewEditedNoteText);
    await page.waitForFunction(
      ([key, storyId, text]) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          return false;
        }

        try {
          const parsed = JSON.parse(stored);
          return parsed?.notes?.[storyId]?.text === text;
        } catch {
          return false;
        }
      },
      [storyNotesKey, sampleStory.storyId, overviewEditedNoteText],
    );
    await noteCard.getByTestId("note-card-textarea").fill("");
    await expect(noteCard).toBeVisible();
    await expect(noteCard.getByTestId("note-card-textarea")).toHaveValue("");
    await noteCard.getByTestId("note-card-textarea").fill(overviewEditedNoteText);
    await page.waitForFunction(
      ([key, storyId, text]) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          return false;
        }

        try {
          const parsed = JSON.parse(stored);
          return parsed?.notes?.[storyId]?.text === text;
        } catch {
          return false;
        }
      },
      [storyNotesKey, sampleStory.storyId, overviewEditedNoteText],
    );

    await page.getByTestId("settings-overview-link").click();
    await expect(page).toHaveURL(toAppPathPattern("settings"));
    await expect(page.getByTestId("settings-shell")).toBeVisible();
    await expect(page.getByTestId("settings-name-input")).toHaveValue("로도스");
    await page.getByTestId("settings-api-key-input").fill("smoke-secret-key");
    await expect(page.getByTestId("settings-api-key-input")).toHaveValue("smoke-secret-key");
    await expect(page.getByTestId("settings-api-key-warning")).toContainText(
      /공용|公共|shared|共有|共享/,
    );
    await expect(page.getByTestId("settings-api-key-link")).toBeVisible();
    await expect(page.getByTestId("settings-api-key-link")).toHaveAttribute(
      "href",
      "https://aistudio.google.com/app/apikey",
    );
    await expect(page.getByTestId("settings-api-key-link")).toHaveAttribute("target", "_blank");
    const apiKeyGuide = page.getByTestId("settings-api-key-guide");
    const apiKeyGuideToggle = page.getByTestId("settings-api-key-guide-toggle");
    const apiKeyGuidePanel = page.getByTestId("settings-api-key-guide-panel");
    await expect(apiKeyGuide).toContainText("API key");
    await expect(apiKeyGuideToggle).toHaveAttribute("aria-expanded", "false");
    await expect(apiKeyGuidePanel).toHaveAttribute("data-state", "closed");
    await expect(apiKeyGuidePanel).toHaveCSS("visibility", "hidden");
    const apiKeyGuideTransitionProperty = await apiKeyGuidePanel.evaluate(
      (node) => window.getComputedStyle(node).transitionProperty,
    );
    expect(apiKeyGuideTransitionProperty).toContain("max-height");
    await apiKeyGuideToggle.click();
    await expect(apiKeyGuideToggle).toHaveAttribute("aria-expanded", "true");
    await expect(apiKeyGuidePanel).toHaveAttribute("data-state", "open");
    await expect(apiKeyGuidePanel).toHaveCSS("visibility", "visible");
    await expect(apiKeyGuide.locator("li")).toHaveCount(3);
    await expect(page.getByTestId("settings-issue-link")).toHaveAttribute("target", "_blank");
    await expect(page.getByTestId("site-footer")).toContainText("토루");
    await expect(page.getByTestId("site-footer-issue-link")).toHaveAttribute("target", "_blank");
    const backupFilePath = path.join("/tmp", `ark-str-smoke-backup-${Date.now()}.json`);
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("settings-export-button").click();
    const download = await downloadPromise;
    await download.saveAs(backupFilePath);
    await expect(page.getByTestId("settings-status")).toContainText(
      /백업 JSON을 만들었습니다|Backup JSON created|バックアップ JSON|备份 JSON|備份 JSON/,
    );
    await page.getByTestId("settings-status-dismiss").click();
    await expect(page.getByTestId("settings-status")).toHaveCount(0);
    const backupJson = JSON.parse(fs.readFileSync(backupFilePath, "utf8"));
    expect(JSON.stringify(backupJson)).not.toContain("smoke-secret-key");
    expect(backupJson.storyNotes.notes[sampleStory.storyId].text).toBe(overviewEditedNoteText);
    expect(backupJson.readProgress.readStories[sampleStory.storyId].storyId).toBe(sampleStory.storyId);
    expect(backupJson.readerSession.nickName).toBe("로도스");

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId("settings-reset-notes-button").click();
    await page.waitForFunction(
      ([key, storyId]) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          return true;
        }

        try {
          const parsed = JSON.parse(stored);
          return !parsed?.notes?.[storyId];
        } catch {
          return false;
        }
      },
      [storyNotesKey, sampleStory.storyId],
    );
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId("settings-reset-read-progress-button").click();
    await page.waitForFunction(
      ([key, storyId]) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          return true;
        }

        try {
          const parsed = JSON.parse(stored);
          return !parsed?.readStories?.[storyId];
        } catch {
          return false;
        }
      },
      [readProgressKey, sampleStory.storyId],
    );
    await page.getByTestId("settings-import-input").setInputFiles(backupFilePath);
    await page.waitForFunction(
      ([notesKey, progressKey, storyId, text]) => {
        const notesStored = window.localStorage.getItem(notesKey);
        const progressStored = window.localStorage.getItem(progressKey);
        if (!notesStored || !progressStored) {
          return false;
        }

        try {
          const notesParsed = JSON.parse(notesStored);
          const progressParsed = JSON.parse(progressStored);
          return (
            notesParsed?.notes?.[storyId]?.text === text &&
            progressParsed?.readStories?.[storyId]?.storyId === storyId
          );
        } catch {
          return false;
        }
      },
      [storyNotesKey, readProgressKey, sampleStory.storyId, overviewEditedNoteText],
    );
    await expect(page.getByTestId("settings-api-key-input")).toHaveValue("smoke-secret-key");
    await page.goto(toAppPath("notes"));
    await expect(page.getByTestId("notes-list")).toBeVisible();
    await noteCard.getByTestId("note-story-link").click();
    await expect(page).toHaveURL(
      toAppPathPattern(
        `reader/${sampleAlternateLocaleStory.server}/${sampleAlternateLocaleStory.groupId}/${sampleAlternateLocaleStory.storyId}`,
      ),
    );
    await expect(page.getByTestId("reader-shell")).toBeVisible();
    await expect(page.getByTestId("story-note-open-button")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("story-body")).toBeVisible({ timeout: 15_000 });
    await page.evaluate(() => window.scrollTo(0, 1300));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(720);
    await expect(page.getByTestId("scroll-top-button")).toBeVisible();
    const floatingActionMetrics = await page.evaluate(() => {
      const noteButton = document.querySelector('[data-testid="story-note-open-button"]');
      const topButton = document.querySelector('[data-testid="scroll-top-button"]');

      if (!noteButton || !topButton) {
        throw new Error("Floating reader controls were not found.");
      }

      const noteRect = noteButton.getBoundingClientRect();
      const topRect = topButton.getBoundingClientRect();

      return {
        gap: Math.round(topRect.top - noteRect.bottom),
        noteBottom: Math.round(noteRect.bottom),
        noteRight: Math.round(noteRect.right),
        topRight: Math.round(topRect.right),
        topTop: Math.round(topRect.top),
      };
    });
    expect(floatingActionMetrics.noteBottom).toBeLessThanOrEqual(floatingActionMetrics.topTop);
    expect(floatingActionMetrics.gap).toBeLessThanOrEqual(12);
    expect(Math.abs(floatingActionMetrics.noteRight - floatingActionMetrics.topRight)).toBeLessThanOrEqual(1);
    await page.getByTestId("story-note-open-button").click();
    await expect(page.getByTestId("story-note-textarea")).toHaveValue(overviewEditedNoteText);
    await page.getByTestId("story-note-textarea").fill("   ");
    await page.waitForFunction(
      ([key, storyId]) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          return false;
        }

        try {
          const parsed = JSON.parse(stored);
          return !parsed?.notes?.[storyId];
        } catch {
          return false;
        }
      },
      [storyNotesKey, sampleStory.storyId],
    );
    await expect(page.getByTestId("story-note-textarea")).toHaveValue("");
    await page.getByTestId("story-note-close-button").click();
    await page.goto(toAppPath("notes"));
    await expect(page.getByTestId("notes-empty-state")).toBeVisible();

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );
    await expect(page.getByTestId("reader-shell")).toBeVisible();
    const storyControlStacks = page.getByTestId("story-control-stack");
    await expect(storyControlStacks).toHaveCount(2);
    const topSummaryControls = page.locator('[data-testid="story-control-stack"][data-placement="top"]');
    const bottomSummaryControls = page.locator('[data-testid="story-control-stack"][data-placement="bottom"]');
    await expect(page.getByTestId("story-summary-section")).toHaveCount(2);
    const summarySection = topSummaryControls.getByTestId("story-summary-section");
    await expect(summarySection).toBeVisible();
    await expect(bottomSummaryControls.getByTestId("story-summary-section")).toBeVisible();
    await expect(summarySection.getByText("요약")).toBeVisible();
    await expect(summarySection).not.toContainText("Story summary");
    await expect(summarySection).not.toContainText("이 스토리의 summary는 아직 생성되지 않았습니다");
    const summaryToggle = topSummaryControls.getByTestId("story-summary-toggle");
    const summaryPanel = topSummaryControls.getByTestId("story-summary-panel");
    const bottomSummaryToggle = bottomSummaryControls.getByTestId("story-summary-toggle");
    const bottomSummaryPanel = bottomSummaryControls.getByTestId("story-summary-panel");
    await expect(summaryToggle).toHaveAttribute("aria-expanded", "false");
    await expect(bottomSummaryToggle).toHaveAttribute("aria-expanded", "false");
    await expect(summaryPanel).toHaveAttribute("data-state", "closed");
    await expect(bottomSummaryPanel).toHaveAttribute("data-state", "closed");
    const closedSummaryHeight = await summaryPanel.evaluate((node) =>
      Math.round(node.getBoundingClientRect().height),
    );
    expect(closedSummaryHeight).toBeLessThanOrEqual(1);
    await expect(summaryPanel).toHaveCSS("visibility", "hidden");
    const summaryTransitionProperty = await summaryPanel.evaluate(
      (node) => window.getComputedStyle(node).transitionProperty,
    );
    expect(summaryTransitionProperty).toContain("max-height");
    expect(summaryTransitionProperty).not.toContain("opacity");
    await summaryToggle.click();
    await expect(summaryToggle).toHaveAttribute("aria-expanded", "true");
    await expect(bottomSummaryToggle).toHaveAttribute("aria-expanded", "true");
    await expect(summaryPanel).toHaveAttribute("data-state", "open");
    await expect(bottomSummaryPanel).toHaveAttribute("data-state", "open");
    await expect(summaryPanel).toHaveCSS("visibility", "visible");
    await expect(bottomSummaryPanel).toHaveCSS("visibility", "visible");
    await expect
      .poll(() => summaryPanel.evaluate((node) => Math.round(node.getBoundingClientRect().height)))
      .toBeGreaterThan(1);
    await expect(summaryPanel).toContainText(sampleSummaryText);
    await expect(bottomSummaryPanel).toContainText(sampleSummaryText);
    await expect(page.getByTestId("reader-shell")).not.toContainText(sampleStory.sourcePath);
    await expect(page.getByTestId("reader-shell")).not.toContainText(
      `${sampleStoryGroup.storyCount} stories in`,
    );
    await expect(page.getByTestId("story-header-metrics").getByTestId("story-metric-badge")).toHaveCount(2);
    const siblingNav = page.getByTestId("story-sibling-nav");
    await expect(siblingNav).toBeVisible();
    await expect(siblingNav.getByTestId("story-group-metrics").getByTestId("story-metric-badge")).toHaveCount(3);
    await expect(siblingNav).not.toContainText("Group");
    await expect(page.getByTestId("story-sibling-list")).toHaveCSS("overflow-y", "auto");
    expect(await readScrollbarTrackBackground(page.getByTestId("story-sibling-list"))).toBe(
      "rgba(0, 0, 0, 0)",
    );
    const activeSiblingCard = siblingNav.locator(
      `[data-testid="story-sibling-card"][href="${toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`)}"]`,
    );
    await expect(activeSiblingCard).toBeVisible();
    await expect(activeSiblingCard).not.toContainText(sampleStory.storyId);
    await expect(activeSiblingCard.getByTestId("story-sibling-metrics").getByTestId("story-metric-badge")).toHaveCount(2);
    if (sampleStory.storyCode) {
      await expect(activeSiblingCard.getByTestId("story-stage-badge")).toContainText(sampleStory.storyCode);
    }
    if (sampleStory.avgTag) {
      await expect(activeSiblingCard.getByTestId("story-phase-badge")).toContainText(sampleStory.avgTag);
      const phaseBadgeBorderColor = await activeSiblingCard
        .getByTestId("story-phase-badge")
        .evaluate((node) => window.getComputedStyle(node).borderTopColor);
      const accentBorderColor = await page.evaluate(() => {
        const probe = document.createElement("span");
        probe.style.color = "var(--accent)";
        document.body.append(probe);
        const color = window.getComputedStyle(probe).color;
        probe.remove();
        return color;
      });
      expect(phaseBadgeBorderColor).toBe(accentBorderColor);
    }
    await page.setViewportSize({ width: 390, height: 820 });
    await expect(siblingNav).toBeHidden();
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(siblingNav).toBeVisible();

    const appBar = page.getByTestId("floating-app-bar");
    await expect(appBar).toHaveCSS("position", "fixed");
    await expect(appBar).toHaveCSS("top", "0px");
    await expect(appBar).toHaveCSS("border-top-left-radius", "0px");
    await expect(appBar.getByTestId("app-home-icon")).toBeVisible();
    await expect(appBar.getByTestId("theme-toggle")).toHaveText("");
    await expect(appBar.getByTestId("search-overview-link")).toHaveText("");
    await expect(appBar.getByTestId("search-overview-link")).toHaveAttribute("href", toAppPath("search"));
    await expect(appBar.getByTestId("notes-overview-link")).toHaveText("");
    await expect(appBar.getByTestId("notes-overview-link")).toHaveAttribute("href", toAppPath("notes"));
    await expect(appBar.getByTestId("settings-overview-link")).toHaveText("");
    await expect(appBar.getByTestId("settings-overview-link")).toHaveAttribute("href", toAppPath("settings"));
    const appBarControlSizes = await appBar.evaluate((node, groupTitle) => {
      const homeControl = node.querySelector('a[aria-label="홈"]');
      const storyRootControl = [...node.querySelectorAll("a")].find(
        (item) => item.textContent?.trim() === "스토리",
      );
      const themeToggle = node.querySelector('[data-testid="theme-toggle"]');
      const searchControl = node.querySelector('[data-testid="search-overview-link"]');
      const notesControl = node.querySelector('[data-testid="notes-overview-link"]');
      const settingsControl = node.querySelector('[data-testid="settings-overview-link"]');
      const homeIcon = node.querySelector<HTMLImageElement>('[data-testid="app-home-icon"]');
      const localeSelect = node.querySelector('[data-testid="locale-select"]');
      const storySelect = node.querySelector('[data-testid="chrome-story-select"]');
      const groupCrumb = [...node.querySelectorAll("a, span")].find(
        (item) => item.textContent?.trim() === groupTitle,
      );

      if (
        !homeControl ||
        !storyRootControl ||
        !themeToggle ||
        !searchControl ||
        !notesControl ||
        !settingsControl ||
        !homeIcon ||
        !localeSelect ||
        !storySelect ||
        !groupCrumb
      ) {
        throw new Error("App bar controls were not found.");
      }

      const homeRect = homeControl.getBoundingClientRect();
      const storyRootRect = storyRootControl.getBoundingClientRect();
      const themeRect = themeToggle.getBoundingClientRect();
      const searchRect = searchControl.getBoundingClientRect();
      const notesRect = notesControl.getBoundingClientRect();
      const settingsRect = settingsControl.getBoundingClientRect();
      const iconRect = homeIcon.getBoundingClientRect();
      const homeStyles = window.getComputedStyle(homeControl);
      const storyRootStyles = window.getComputedStyle(storyRootControl);
      const localeRect = localeSelect.getBoundingClientRect();
      const localeStyles = window.getComputedStyle(localeSelect);
      const storySelectRect = storySelect.getBoundingClientRect();
      const storySelectStyles = window.getComputedStyle(storySelect);
      const themeStyles = window.getComputedStyle(themeToggle);
      const searchStyles = window.getComputedStyle(searchControl);
      const notesStyles = window.getComputedStyle(notesControl);
      const settingsStyles = window.getComputedStyle(settingsControl);

      return {
        groupFontSize: window.getComputedStyle(groupCrumb).fontSize,
        homeBackgroundColor: homeStyles.backgroundColor,
        homeHeight: Math.round(homeRect.height),
        homeIconSrc: homeIcon.getAttribute("src"),
        homeRadius: homeStyles.borderTopLeftRadius,
        homeWidth: Math.round(homeRect.width),
        iconHeight: Math.round(iconRect.height),
        localeFontSize: window.getComputedStyle(localeSelect).fontSize,
        localeHeight: Math.round(localeRect.height),
        localeRight: Math.round(localeRect.right),
        localeRadius: localeStyles.borderTopLeftRadius,
        notesBackgroundColor: notesStyles.backgroundColor,
        notesHeight: Math.round(notesRect.height),
        notesLeft: Math.round(notesRect.left),
        notesRadius: notesStyles.borderTopLeftRadius,
        notesRight: Math.round(notesRect.right),
        notesWidth: Math.round(notesRect.width),
        searchBackgroundColor: searchStyles.backgroundColor,
        searchHeight: Math.round(searchRect.height),
        searchLeft: Math.round(searchRect.left),
        searchRadius: searchStyles.borderTopLeftRadius,
        searchRight: Math.round(searchRect.right),
        searchWidth: Math.round(searchRect.width),
        settingsBackgroundColor: settingsStyles.backgroundColor,
        settingsHeight: Math.round(settingsRect.height),
        settingsLeft: Math.round(settingsRect.left),
        settingsRadius: settingsStyles.borderTopLeftRadius,
        settingsWidth: Math.round(settingsRect.width),
        storyRootHeight: Math.round(storyRootRect.height),
        storyRootRadius: storyRootStyles.borderTopLeftRadius,
        storySelectFontSize: window.getComputedStyle(storySelect).fontSize,
        storySelectHeight: Math.round(storySelectRect.height),
        storySelectRadius: storySelectStyles.borderTopLeftRadius,
        themeBackgroundColor: themeStyles.backgroundColor,
        themeHeight: Math.round(themeRect.height),
        themeLeft: Math.round(themeRect.left),
        themeRadius: themeStyles.borderTopLeftRadius,
        themeRight: Math.round(themeRect.right),
        themeWidth: Math.round(themeRect.width),
      };
    }, sampleStoryGroup.title);
    expect(appBarControlSizes.homeHeight).toBe(appBarControlSizes.themeHeight);
    expect(appBarControlSizes.searchHeight).toBe(appBarControlSizes.themeHeight);
    expect(appBarControlSizes.notesHeight).toBe(appBarControlSizes.themeHeight);
    expect(appBarControlSizes.settingsHeight).toBe(appBarControlSizes.themeHeight);
    expect(appBarControlSizes.homeHeight).toBe(appBarControlSizes.storyRootHeight);
    expect(appBarControlSizes.localeHeight).toBe(appBarControlSizes.storyRootHeight);
    expect(appBarControlSizes.storySelectHeight).toBe(appBarControlSizes.storyRootHeight);
    expect(appBarControlSizes.homeWidth).toBe(appBarControlSizes.themeWidth);
    expect(appBarControlSizes.searchWidth).toBe(appBarControlSizes.themeWidth);
    expect(appBarControlSizes.notesWidth).toBe(appBarControlSizes.themeWidth);
    expect(appBarControlSizes.settingsWidth).toBe(appBarControlSizes.themeWidth);
    expect(appBarControlSizes.homeHeight).toBe(36);
    expect(appBarControlSizes.homeRadius).toBe(appBarControlSizes.storyRootRadius);
    expect(appBarControlSizes.themeRadius).toBe(appBarControlSizes.storyRootRadius);
    expect(appBarControlSizes.searchRadius).toBe(appBarControlSizes.storyRootRadius);
    expect(appBarControlSizes.notesRadius).toBe(appBarControlSizes.storyRootRadius);
    expect(appBarControlSizes.settingsRadius).toBe(appBarControlSizes.storyRootRadius);
    expect(appBarControlSizes.localeRadius).toBe(appBarControlSizes.storyRootRadius);
    expect(appBarControlSizes.storySelectRadius).toBe(appBarControlSizes.storyRootRadius);
    expect(appBarControlSizes.iconHeight).toBeGreaterThanOrEqual(32);
    expect(appBarControlSizes.homeIconSrc).toBe(`${appBasePath}/ark_str_app_icon.png`);
    expect(appBarControlSizes.homeBackgroundColor).toBe(appBarControlSizes.themeBackgroundColor);
    expect(appBarControlSizes.searchBackgroundColor).toBe(appBarControlSizes.themeBackgroundColor);
    expect(appBarControlSizes.notesBackgroundColor).toBe(appBarControlSizes.themeBackgroundColor);
    expect(appBarControlSizes.settingsBackgroundColor).toBe(appBarControlSizes.themeBackgroundColor);
    expect(appBarControlSizes.localeRight).toBeLessThanOrEqual(appBarControlSizes.searchLeft);
    expect(appBarControlSizes.searchRight).toBeLessThanOrEqual(appBarControlSizes.notesLeft);
    expect(appBarControlSizes.notesRight).toBeLessThanOrEqual(appBarControlSizes.themeLeft);
    expect(appBarControlSizes.themeRight).toBeLessThanOrEqual(appBarControlSizes.settingsLeft);
    expect(appBarControlSizes.groupFontSize).toBe("12px");
    expect(appBarControlSizes.localeFontSize).toBe("12px");
    expect(appBarControlSizes.storySelectFontSize).toBe("12px");
    await expect(appBar.getByTestId("breadcrumb-separator-icon")).toHaveCount(2);
    const appBarBackdropFilter = await appBar.evaluate((node) => {
      const styles = window.getComputedStyle(node);
      return [
        styles.backdropFilter,
        styles.getPropertyValue("-webkit-backdrop-filter"),
      ].filter(Boolean);
    });
    expect(appBarBackdropFilter.every((value) => value === "none")).toBe(true);
    await expect(appBar.getByRole("link", { name: "스토리" })).toHaveAttribute(
      "href",
      toAppPath(`reader/${sampleStory.server}`),
    );
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(appBar).toHaveAttribute("data-hidden", "true");
    await appBar.getByRole("link", { name: "홈" }).focus();
    await expect(appBar).toHaveAttribute("data-hidden", "false");
    await page.evaluate(() => window.scrollTo(0, 1300));
    await expect(appBar).toHaveAttribute("data-hidden", "true");
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(appBar).toHaveAttribute("data-hidden", "false");
    await page.evaluate(async () => {
      for (let index = 0; index < 12; index += 1) {
        window.scrollBy(0, 1);
        await new Promise(requestAnimationFrame);
      }
    });
    await expect(appBar).toHaveAttribute("data-hidden", "true");
    await page.evaluate(async () => {
      for (let index = 0; index < 12; index += 1) {
        window.scrollBy(0, -1);
        await new Promise(requestAnimationFrame);
      }
    });
    await expect(appBar).toHaveAttribute("data-hidden", "false");

    await appBar.getByTestId("search-overview-link").click();
    await expect(page).toHaveURL(toAppPathPattern("search"));
    await expect(page.getByTestId("search-shell")).toBeVisible();
    await expect(page.getByTestId("search-empty-state")).toBeVisible();
    const searchFormMetrics = await page.getByTestId("search-form").evaluate((node) => {
      const input = node.querySelector<HTMLInputElement>('[data-testid="search-input"]');
      const icon = node.querySelector("svg");

      if (!input || !icon) {
        throw new Error("Search input layout targets were not found.");
      }

      const formRect = node.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();

      return {
        formCenter: Math.round(formRect.left + formRect.width / 2),
        iconCenter: Math.round(iconRect.top + iconRect.height / 2),
        inputCenter: Math.round(inputRect.top + inputRect.height / 2),
        inputLeftGap: Math.round(iconRect.left - inputRect.left),
        viewportCenter: Math.round(window.innerWidth / 2),
        width: Math.round(formRect.width),
      };
    });
    expect(searchFormMetrics.width).toBeGreaterThanOrEqual(496);
    expect(searchFormMetrics.width).toBeLessThanOrEqual(500);
    expect(Math.abs(searchFormMetrics.formCenter - searchFormMetrics.viewportCenter)).toBeLessThanOrEqual(1);
    expect(Math.abs(searchFormMetrics.iconCenter - searchFormMetrics.inputCenter)).toBeLessThanOrEqual(1);
    expect(searchFormMetrics.inputLeftGap).toBeGreaterThanOrEqual(12);
    await page.getByTestId("search-input").fill(sampleSearchQuery);
    await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe(sampleSearchQuery);
    await expect(page.getByTestId("search-results-list")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("search-results-list")).toHaveCSS("display", "grid");
    await expect(page.getByTestId("search-result-highlight").first()).toContainText(sampleSearchQuery);

    await page.goto(toAppPath(`search?q=${encodeURIComponent(broadSearchQuery)}`));
    await expect(page.getByTestId("search-input")).toHaveValue(broadSearchQuery);
    await expect(page.getByTestId("search-results-list")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("search-results-count")).toHaveText(
      `${new Intl.NumberFormat("ko-KR").format(broadSearchResultCount)}개 스토리`,
    );
    const initialRenderedSearchCards = await page.getByTestId("search-result-card").count();
    expect(initialRenderedSearchCards).toBeGreaterThanOrEqual(40);
    if (initialRenderedSearchCards < broadSearchResultCount) {
      await expect(page.getByTestId("search-results-sentinel").getByTestId("loading-indicator")).toBeVisible();
      await expect(page.getByTestId("search-results-sentinel")).not.toContainText("더 불러오는 중");
      await page.getByTestId("search-results-sentinel").scrollIntoViewIfNeeded();
      await expect.poll(() => page.getByTestId("search-result-card").count()).toBeGreaterThan(
        initialRenderedSearchCards,
      );
    }

    await page.goto(toAppPath(`search?q=${encodeURIComponent(sampleSearchQuery)}`));
    await expect(page.getByTestId("search-input")).toHaveValue(sampleSearchQuery);
    const firstSearchResult = page.getByTestId("search-result-card").first();
    await expect(firstSearchResult).toHaveAttribute(
      "href",
      toAppPath(`reader/kr/${sampleSearchStory.groupId}/${sampleSearchStory.storyId}`),
    );
    await expect(firstSearchResult.getByTestId("search-result-line")).toBeVisible();
    await expect(firstSearchResult.getByTestId("search-result-title-block")).toContainText(
      sampleSearchStory.title,
    );
    await expect(firstSearchResult.getByTestId("search-result-title-block")).toContainText(
      sampleSearchStory.groupTitle,
    );
    if (sampleSearchStory.storyCode) {
      await expect(firstSearchResult.getByTestId("search-result-stage-badge")).toContainText(
        sampleSearchStory.storyCode,
      );
    }
    if (sampleSearchStory.avgTag) {
      await expect(firstSearchResult.getByTestId("search-result-phase-badge")).toContainText(
        sampleSearchStory.avgTag,
      );
      const searchPhaseBadgeBorderColor = await firstSearchResult
        .getByTestId("search-result-phase-badge")
        .evaluate((node) => window.getComputedStyle(node).borderTopColor);
      const accentBorderColor = await page.evaluate(() => {
        const probe = document.createElement("span");
        probe.style.color = "var(--accent)";
        document.body.append(probe);
        const color = window.getComputedStyle(probe).color;
        probe.remove();
        return color;
      });
      expect(searchPhaseBadgeBorderColor).toBe(accentBorderColor);
    }
    const firstSearchResultLayout = await firstSearchResult.evaluate((node) => {
      const metrics = node.querySelector('[data-testid="search-result-metrics"]');
      const titleBlock = node.querySelector('[data-testid="search-result-title-block"]');

      if (!metrics || !titleBlock) {
        throw new Error("Search result layout targets were not found.");
      }

      const metricsRect = metrics.getBoundingClientRect();
      const titleRect = titleBlock.getBoundingClientRect();

      return {
        metricsTop: Math.round(metricsRect.top),
        titleTop: Math.round(titleRect.top),
      };
    });
    expect(Math.abs(firstSearchResultLayout.metricsTop - firstSearchResultLayout.titleTop)).toBeLessThanOrEqual(2);
    await firstSearchResult.click();
    await expect(page).toHaveURL(
      toAppPathPattern(`reader/kr/${sampleSearchStory.groupId}/${sampleSearchStory.storyId}`),
    );

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );
    await appBar.getByRole("link", { name: "스토리" }).click();
    await expect(page).toHaveURL(toAppPathPattern(`reader/${sampleStory.server}`));

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );
    await appBar.getByRole("link", { name: sampleStoryGroup.title }).click();
    await expect(page).toHaveURL(
      toAppPathPattern(`reader/${sampleStory.server}/${sampleStory.groupId}`),
    );

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );

    await page.waitForFunction(
      ([key, locale, speakerId]) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          return false;
        }

        try {
          const parsed = JSON.parse(stored);
          return Boolean(parsed?.locales?.[locale]?.[speakerId]?.aliases?.length);
        } catch {
          return false;
        }
      },
      [characterObservationsKey, sampleStory.server, sampleObservedOperator?.speakerId ?? ""],
    );

    const observedAliases = await page.evaluate(
      ([key, locale, speakerId]) => {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          return [];
        }

        try {
          const parsed = JSON.parse(stored);
          return parsed?.locales?.[locale]?.[speakerId]?.aliases ?? [];
        } catch {
          return [];
        }
      },
      [characterObservationsKey, sampleStory.server, sampleObservedOperator?.speakerId ?? ""],
    );

    for (const alias of sampleObservedOperator?.aliases ?? []) {
      expect(observedAliases).toContain(alias);
    }

    if (sampleObservedOperator?.speakerId && sampleObservedAlias) {
      const observedSpeakerArticle = page
        .locator("article")
        .filter({
          has: page.getByRole("heading", {
            name: sampleObservedAlias,
            exact: true,
          }),
        })
        .first();

      await observedSpeakerArticle.scrollIntoViewIfNeeded();
      await expect(observedSpeakerArticle.getByTestId("speaker-portrait-image")).toBeVisible();
      const portraitRenderMetrics = await observedSpeakerArticle.evaluate((article) => {
        const slot = article.querySelector('[data-testid="speaker-portrait-slot"]');
        const image = article.querySelector('[data-testid="speaker-portrait-image"]');

        if (!slot || !image) {
          throw new Error("Speaker portrait targets were not found.");
        }

        const slotRect = slot.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();

        return {
          imageHeight: Math.round(imageRect.height),
          imageTop: Math.round(imageRect.top),
          imageWidth: Math.round(imageRect.width),
          slotHeight: Math.round(slotRect.height),
          slotTop: Math.round(slotRect.top),
          slotWidth: Math.round(slotRect.width),
        };
      });
      expect(portraitRenderMetrics.slotHeight).toBe(96);
      expect(portraitRenderMetrics.slotWidth).toBe(80);
      expect(portraitRenderMetrics.imageHeight).toBeGreaterThanOrEqual(
        portraitRenderMetrics.slotHeight * 2 - 1,
      );
      expect(portraitRenderMetrics.imageWidth).toBeGreaterThan(
        portraitRenderMetrics.slotWidth,
      );
      expect(Math.abs(portraitRenderMetrics.imageTop - portraitRenderMetrics.slotTop)).toBeLessThanOrEqual(1);
    }

    await page.goto(
      toAppPath(`reader/kr/${koreanNicknameStory.groupId}/${koreanNicknameStory.storyId}`),
    );
    await expect(page.getByTestId("story-body")).toContainText("로도스 박사");
    await expect(page.getByTestId("story-body")).not.toContainText("{@nickname}");
    await expect(page.getByTestId("story-body")).not.toContainText("{@nickName}");

    await page.goto(
      toAppPath(`reader/kr/${koreanCapitalNicknameStory.groupId}/${koreanCapitalNicknameStory.storyId}`),
    );
    await expect(page.getByTestId("story-body")).toContainText("Dr.로도스");
    await expect(page.getByTestId("story-body")).not.toContainText("{@Nickname}");

    await page.goto(toAppPath());
    await page.getByTestId("nickname-input").fill("$&");
    await page.goto(
      toAppPath(`reader/kr/${koreanNicknameStory.groupId}/${koreanNicknameStory.storyId}`),
    );
    await expect(page.getByTestId("story-body")).toContainText("$& 박사");
    await expect(page.getByTestId("story-body")).not.toContainText("{@nickname}");

    await page.goto(
      toAppPath(
        `reader/${sampleBackgroundStoryEntry.server}/${sampleBackgroundStoryEntry.groupId}/${sampleBackgroundStoryEntry.storyId}`,
      ),
    );
    await expect
      .poll(() => page.evaluate(() => window.getComputedStyle(document.body, "::before").position))
      .toBe("fixed");
    await expect(page.getByTestId("background-block").first()).toBeVisible();
    await expect(page.getByTestId("background-preview-image").first()).toBeVisible();
    await expect(page.getByTestId("story-backdrop-image")).toHaveAttribute(
      "src",
      `${appBasePath}${generatedBackgrounds[sampleBackgroundIds[0]]}`,
    );
    await expect(page.getByTestId("story-backdrop-image")).toHaveCSS("filter", "none");

    const secondBackgroundBlock = page
      .locator(`[data-testid="background-block"][data-background-id="${sampleBackgroundIds[1]}"]`)
      .first();
    await secondBackgroundBlock.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await expect(page.getByTestId("story-backdrop-image")).toHaveAttribute(
      "src",
      `${appBasePath}${generatedBackgrounds[sampleBackgroundIds[1]]}`,
    );

    await page.goto(toAppPath());
    await expect(page.getByTestId("continue-reading-link")).toHaveAttribute(
      "href",
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );

    browserErrors.assertClean();
  });

  test("recovers from malformed persisted state without browser errors", async ({ page }) => {
    const browserErrors = trackBrowserErrors(page);

    await page.goto(toAppPath());
    await page.evaluate(([session, prefs, characterObservations, storyNotes, readProgress]) => {
      window.localStorage.setItem(session, "{broken-json");
      window.localStorage.setItem(prefs, "{broken-json");
      window.localStorage.setItem(characterObservations, "{broken-json");
      window.localStorage.setItem(storyNotes, "{broken-json");
      window.localStorage.setItem(readProgress, "{broken-json");
    }, [readerSessionKey, preferencesKey, characterObservationsKey, storyNotesKey, readProgressKey]);
    await page.reload();

    await expect(page.getByTestId("bootstrap-shell")).toBeVisible();
    await expect(page.getByTestId("locale-select")).toHaveValue("kr");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByTestId("continue-reading-link")).toBeVisible();

    browserErrors.assertClean();
  });
});
