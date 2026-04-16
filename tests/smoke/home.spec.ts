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
  ) as { observedOperators?: Array<{ speakerId: string; aliases: string[] }> };
}

function hasBundledPortrait(speakerId: string) {
  return fs.existsSync(
    path.join(
      process.cwd(),
      "ark-str-web-app",
      "public",
      "generated",
      "portraits",
      "assistant",
      `${speakerId}.png`,
    ),
  );
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

const sampleStorySelection = resolveSampleStory();
const sampleStory = sampleStorySelection.story;
const sampleObservedOperator =
  sampleStorySelection.detail.observedOperators?.find((observedOperator) =>
    hasBundledPortrait(observedOperator.speakerId),
  ) ?? null;
const sampleObservedAlias =
  sampleObservedOperator?.aliases.find((alias) => alias.trim().length > 0 && alias !== "???") ??
  sampleObservedOperator?.aliases[0] ??
  null;

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

    await page.goto(
      toAppPath(`reader/${sampleStory.server}/${sampleStory.groupId}/${sampleStory.storyId}`),
    );
    await expect(page.getByTestId("reader-shell")).toBeVisible();
    await expect(page.getByTestId("story-body")).toBeVisible();
    await expect(page.getByTestId("summary-empty-state")).toBeVisible();

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
