import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const appBasePath = process.env.PLAYWRIGHT_APP_BASE_PATH ?? "/ark-str";
const readerSessionKey = "ark-str:reader-session:v1";
const preferencesKey = "ark-str:app-preferences:v1";
const characterObservationsKey = "ark-str:character-observations:v1";
const legacyBootstrapKey = "ark-str:reader-bootstrap:v1";
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
    blocks?: Array<{
      type?: string;
      backgroundId?: string;
      options?: Array<{ blocks?: unknown[] }>;
    }>;
  };
}

function hasBundledPortrait(speakerId: string) {
  return fs.existsSync(
    path.join(
      process.cwd(),
      "ark-str-web-app",
      "public",
      "generated",
      "portraits",
      "speakers",
      `${speakerId}.png`,
    ),
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
  backgroundId?: string;
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
    if (detail?.observedOperators?.some((observedOperator) => hasBundledPortrait(observedOperator.speakerId))) {
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
const sampleBackgroundStory = resolveBackgroundStory();
const sampleBackgroundIds = sampleBackgroundStory.backgroundIds;
const sampleBackgroundStoryEntry = sampleBackgroundStory.story;
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

if (!koreanMainStoryline) {
  throw new Error("The Korean reader archive must include the mainLine storyline.");
}

if (!koreanMainStorylineReference) {
  throw new Error("The Korean mainLine storyline must include at least one flow reference.");
}

if (!koreanMainStorylinePrimary) {
  throw new Error("The Korean mainLine storyline must include main_0 as a primary group.");
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
    await expect(page.getByTestId("readiness-panel")).toBeVisible();
    await expect(page.getByTestId("locale-select")).toBeEnabled();
    await expect(page.getByTestId("locale-select")).toHaveValue("kr");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByTestId("server-count")).not.toHaveText("0");
    await expect(page.getByTestId("story-count")).not.toHaveText("0");

    await page.getByTestId("locale-select").selectOption("en");
    await page.getByTestId("theme-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(page.getByTestId("locale-select")).toHaveValue("en");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.getByTestId("open-locale-archive-link").click();
    await expect(page).toHaveURL(/\/ark-str\/reader\/en\/$/);
    await expect(page.getByTestId("reader-shell")).toBeVisible();

    await page.goto(toAppPath("reader/kr"));
    await expect(page.getByTestId("reader-shell")).toBeVisible();
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
    await mainStorylineSection.getByTestId("storyline-toggle").click();
    await expect(mainStorylinePanel).toHaveAttribute("data-state", "open");
    await expect(mainStorylinePanel).toHaveAttribute("aria-hidden", "false");
    const panelTransitionDuration = await mainStorylinePanel.evaluate(
      (node) => window.getComputedStyle(node).transitionDuration,
    );
    expect(panelTransitionDuration).toContain("0.3s");
    const mainStorylineItemGrid = mainStorylineSection.getByTestId("storyline-item-grid");
    await expect(mainStorylineItemGrid).toHaveCSS("display", "grid");
    await expect(mainPrimaryRow).toBeVisible();
    await expect(mainPrimaryRow).toHaveAttribute("href", `/ark-str/reader/kr/${koreanMainStorylinePrimary.groupId}/`);
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
    await expect(
      page.locator('[data-testid="storyline-section"][data-storyline-id="synthetic_uncategorized"]'),
    ).toContainText("미분류");

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}`),
    );
    await expect(page.getByTestId("group-shell")).toBeVisible();
    await expect(page.getByTestId("group-stats")).toBeVisible();

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );
    await expect(page.getByTestId("reader-shell")).toBeVisible();
    await expect(page.getByTestId("story-backdrop")).toBeVisible();
    await expect(page.getByTestId("chrome-story-select")).toBeVisible();
    await expect(page.getByTestId("story-body")).toBeVisible();
    await expect(page.getByTestId("story-summary-section")).toBeVisible();

    const appBar = page.getByTestId("floating-app-bar");
    await expect(appBar.getByRole("link", { name: "스토리" })).toHaveAttribute(
      "href",
      `/ark-str/reader/${sampleStory.server}/`,
    );

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
    }

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

    const secondBackgroundBlock = page
      .locator(`[data-testid="background-block"][data-background-id="${sampleBackgroundIds[1]}"]`)
      .first();
    await secondBackgroundBlock.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await expect(page.getByTestId("story-backdrop-image")).toHaveAttribute(
      "src",
      `${appBasePath}${generatedBackgrounds[sampleBackgroundIds[1]]}`,
    );

    await page.goto(toAppPath());
    await expect(page.getByTestId("last-visited-story")).toContainText(sampleStory.title);
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
