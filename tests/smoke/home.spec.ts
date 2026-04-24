import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const appBasePath = process.env.PLAYWRIGHT_APP_BASE_PATH ?? "/ark-str";
const readerSessionKey = "ark-str:reader-session:v1";
const preferencesKey = "ark-str:app-preferences:v1";
const characterObservationsKey = "ark-str:character-observations:v1";
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

if (!sampleStoryGroup) {
  throw new Error("A sample reader story must have a matching group entry.");
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

function toAppPath(route = "") {
  const normalizedRoute = route.replace(/^\/+/, "");
  const normalizedBasePath = `/${appBasePath.replace(/^\/+|\/+$/g, "")}`;

  return normalizedRoute.length > 0
    ? `${normalizedBasePath}/${normalizedRoute}`
    : `${normalizedBasePath}/`;
}

function trackBrowserErrors(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  return {
    assertClean() {
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
    await page.evaluate(([session, prefs, legacy, characterObservations]) => {
      window.localStorage.removeItem(session);
      window.localStorage.removeItem(prefs);
      window.localStorage.removeItem(legacy);
      window.localStorage.removeItem(characterObservations);
    }, [readerSessionKey, preferencesKey, legacyBootstrapKey, characterObservationsKey]);
    await page.reload();

    await expect(page.getByTestId("bootstrap-shell")).toBeVisible();
    await expect(page.getByTestId("home-hero")).toBeVisible();
    await expect(page.getByTestId("readiness-panel")).toBeVisible();
    await expect(page.getByTestId("locale-select")).toBeEnabled();
    await expect(page.getByTestId("locale-select")).toHaveValue("kr");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      "href",
      `${appBasePath}/ark_str_icon.png`,
    );
    expect(readPngColorType(browserIconFile)).toBe(2);
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
    await expect(page.getByTestId("home-footer")).toContainText("Maintainer - dev.Woong");
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

    await page.getByRole("link", { name: "스토리" }).click();
    await expect(page).toHaveURL(/\/ark-str\/reader\/en\/$/);
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
    await expect(mainPrimaryRow).toHaveAttribute("href", `/ark-str/reader/kr/${koreanMainStorylinePrimary.groupId}/`);
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
    await expect(mainPrimaryRow).toContainText("stories");
    await expect(mainPrimaryRow).toContainText("chars");
    await expect(mainPrimaryRow).not.toContainText("Open group");
    await expect(mainStorylineSection.getByTestId("storyline-reference-list")).toHaveCount(0);
    const firstReferenceRow = mainStorylineSection.getByTestId("storyline-reference-link").first();
    await expect(firstReferenceRow).toHaveText(koreanMainStorylineReference.displayTitle);
    await expect(firstReferenceRow).toHaveAttribute(
      "href",
      `/ark-str/reader/kr/${koreanMainStorylineReference.groupId}/`,
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

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}`),
    );
    await expect(page.getByTestId("group-shell")).toBeVisible();
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
      `[data-testid="group-story-card"][href="/ark-str/reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}/"]`,
    );
    await expect(sampleStoryCard).toBeVisible();
    await expect(sampleStoryCard.getByTestId("group-story-metrics")).toContainText("chars");
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
    await expect(page.getByTestId("story-bottom-nav")).toBeVisible();
    if (samplePreviousStory) {
      await expect(page.getByTestId("story-previous-link")).toHaveAttribute(
        "href",
        `/ark-str/reader/${samplePreviousStory.server}/${samplePreviousStory.groupId}/${samplePreviousStory.storyId}/`,
      );
    } else {
      await expect(page.getByTestId("story-previous-disabled")).toBeVisible();
    }
    if (sampleNextStory) {
      await expect(page.getByTestId("story-next-link")).toHaveAttribute(
        "href",
        `/ark-str/reader/${sampleNextStory.server}/${sampleNextStory.groupId}/${sampleNextStory.storyId}/`,
      );
    } else {
      await expect(page.getByTestId("story-next-disabled")).toBeVisible();
    }
    const summarySection = page.getByTestId("story-summary-section");
    await expect(summarySection).toBeVisible();
    await expect(summarySection.getByText("SUMMARY")).toBeVisible();
    await expect(summarySection).not.toContainText("Story summary");
    await expect(summarySection).not.toContainText("이 스토리의 summary는 아직 생성되지 않았습니다");
    const summaryToggle = page.getByTestId("story-summary-toggle");
    const summaryPanel = page.getByTestId("story-summary-panel");
    await expect(summaryToggle).toHaveAttribute("aria-expanded", "false");
    await expect(summaryPanel).toHaveAttribute("data-state", "closed");
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
    await expect(summaryPanel).toHaveAttribute("data-state", "open");
    await expect(summaryPanel).toHaveCSS("visibility", "visible");
    await expect
      .poll(() => summaryPanel.evaluate((node) => Math.round(node.getBoundingClientRect().height)))
      .toBeGreaterThan(1);
    await expect(summaryPanel).toContainText(sampleSummaryText);
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
      `[data-testid="story-sibling-card"][href="/ark-str/reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}/"]`,
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
    const appBarControlSizes = await appBar.evaluate((node, groupTitle) => {
      const homeControl = node.querySelector('a[aria-label="홈"]');
      const storyRootControl = [...node.querySelectorAll("a")].find(
        (item) => item.textContent?.trim() === "스토리",
      );
      const themeToggle = node.querySelector('[data-testid="theme-toggle"]');
      const homeIcon = node.querySelector<HTMLImageElement>('[data-testid="app-home-icon"]');
      const localeSelect = node.querySelector('[data-testid="locale-select"]');
      const storySelect = node.querySelector('[data-testid="chrome-story-select"]');
      const groupCrumb = [...node.querySelectorAll("a, span")].find(
        (item) => item.textContent?.trim() === groupTitle,
      );

      if (!homeControl || !storyRootControl || !themeToggle || !homeIcon || !localeSelect || !storySelect || !groupCrumb) {
        throw new Error("App bar controls were not found.");
      }

      const homeRect = homeControl.getBoundingClientRect();
      const storyRootRect = storyRootControl.getBoundingClientRect();
      const themeRect = themeToggle.getBoundingClientRect();
      const iconRect = homeIcon.getBoundingClientRect();
      const homeStyles = window.getComputedStyle(homeControl);
      const storyRootStyles = window.getComputedStyle(storyRootControl);
      const localeRect = localeSelect.getBoundingClientRect();
      const localeStyles = window.getComputedStyle(localeSelect);
      const storySelectRect = storySelect.getBoundingClientRect();
      const storySelectStyles = window.getComputedStyle(storySelect);
      const themeStyles = window.getComputedStyle(themeToggle);

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
        localeRadius: localeStyles.borderTopLeftRadius,
        storyRootHeight: Math.round(storyRootRect.height),
        storyRootRadius: storyRootStyles.borderTopLeftRadius,
        storySelectFontSize: window.getComputedStyle(storySelect).fontSize,
        storySelectHeight: Math.round(storySelectRect.height),
        storySelectRadius: storySelectStyles.borderTopLeftRadius,
        themeBackgroundColor: themeStyles.backgroundColor,
        themeHeight: Math.round(themeRect.height),
        themeRadius: themeStyles.borderTopLeftRadius,
        themeWidth: Math.round(themeRect.width),
      };
    }, sampleStoryGroup.title);
    expect(appBarControlSizes.homeHeight).toBe(appBarControlSizes.themeHeight);
    expect(appBarControlSizes.homeHeight).toBe(appBarControlSizes.storyRootHeight);
    expect(appBarControlSizes.localeHeight).toBe(appBarControlSizes.storyRootHeight);
    expect(appBarControlSizes.storySelectHeight).toBe(appBarControlSizes.storyRootHeight);
    expect(appBarControlSizes.homeWidth).toBe(appBarControlSizes.themeWidth);
    expect(appBarControlSizes.homeHeight).toBe(36);
    expect(appBarControlSizes.homeRadius).toBe(appBarControlSizes.storyRootRadius);
    expect(appBarControlSizes.themeRadius).toBe(appBarControlSizes.storyRootRadius);
    expect(appBarControlSizes.localeRadius).toBe(appBarControlSizes.storyRootRadius);
    expect(appBarControlSizes.storySelectRadius).toBe(appBarControlSizes.storyRootRadius);
    expect(appBarControlSizes.iconHeight).toBeGreaterThanOrEqual(32);
    expect(appBarControlSizes.homeIconSrc).toBe(`${appBasePath}/ark_str_app_icon.png`);
    expect(appBarControlSizes.homeBackgroundColor).toBe(appBarControlSizes.themeBackgroundColor);
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
      `/ark-str/reader/${sampleStory.server}/`,
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

    await appBar.getByRole("link", { name: "스토리" }).click();
    await expect(page).toHaveURL(new RegExp(`/ark-str/reader/${sampleStory.server}/$`));

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );
    await appBar.getByRole("link", { name: sampleStoryGroup.title }).click();
    await expect(page).toHaveURL(
      new RegExp(`/ark-str/reader/${sampleStory.server}/${sampleStory.groupId}/$`),
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
        const backdrop = article.querySelector('[data-testid="speaker-portrait-backdrop"]');
        const image = article.querySelector('[data-testid="speaker-portrait-image"]');

        if (!backdrop || !image) {
          throw new Error("Speaker portrait targets were not found.");
        }

        const articleRect = article.getBoundingClientRect();
        const backdropRect = backdrop.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();

        return {
          articleHeight: Math.round(articleRect.height),
          articleTop: Math.round(articleRect.top),
          articleWidth: Math.round(articleRect.width),
          backdropHeight: Math.round(backdropRect.height),
          backdropTop: Math.round(backdropRect.top),
          backdropWidth: Math.round(backdropRect.width),
          imageHeight: Math.round(imageRect.height),
          imageTop: Math.round(imageRect.top),
          imageWidth: Math.round(imageRect.width),
        };
      });
      expect(portraitRenderMetrics.articleHeight).toBeGreaterThanOrEqual(224);
      expect(
        Math.abs(portraitRenderMetrics.backdropHeight - portraitRenderMetrics.articleHeight),
      ).toBeLessThanOrEqual(2);
      expect(
        Math.abs(portraitRenderMetrics.backdropWidth - portraitRenderMetrics.articleWidth),
      ).toBeLessThanOrEqual(2);
      expect(Math.abs(portraitRenderMetrics.backdropTop - portraitRenderMetrics.articleTop)).toBeLessThanOrEqual(1);
      expect(portraitRenderMetrics.imageHeight).toBeGreaterThanOrEqual(
        portraitRenderMetrics.backdropHeight * 2 - 1,
      );
      expect(portraitRenderMetrics.imageWidth).toBe(portraitRenderMetrics.backdropWidth);
      expect(portraitRenderMetrics.imageTop).toBe(portraitRenderMetrics.backdropTop);
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
      `/ark-str/reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}/`,
    );

    browserErrors.assertClean();
  });

  test("recovers from malformed persisted state without browser errors", async ({ page }) => {
    const browserErrors = trackBrowserErrors(page);

    await page.goto(toAppPath());
    await page.evaluate(([session, prefs, characterObservations]) => {
      window.localStorage.setItem(session, "{broken-json");
      window.localStorage.setItem(prefs, "{broken-json");
      window.localStorage.setItem(characterObservations, "{broken-json");
    }, [readerSessionKey, preferencesKey, characterObservationsKey]);
    await page.reload();

    await expect(page.getByTestId("bootstrap-shell")).toBeVisible();
    await expect(page.getByTestId("locale-select")).toHaveValue("kr");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByTestId("continue-reading-link")).toBeVisible();

    browserErrors.assertClean();
  });
});
