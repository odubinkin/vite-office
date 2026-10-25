/** @fileoverview Production Writer style dropdown source fonts,script painting,selection/focus and actual viewport geometry. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(`actual Writer style previews width=${width}`, /** Exercises the real application and actual browser font rendering. @param fixtures - Product page. @param testInfo - Screenshot output. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Records real browser failures. @param error - Exception. @returns Nothing. */ (error) =>
        errors.push(error.message),
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    const toolbar = page.getByRole("toolbar", { name: "Writer formatting toolbar" }),
      input = toolbar.getByRole("combobox", { name: "Paragraph style", exact: true });
    await input.locator("..").locator("[data-office-combobox-toggle]").click();
    const popup = page.locator(`id=${await input.getAttribute("aria-controls")}`);
    const heading = popup.getByRole("option", { name: "Heading 1", exact: true });
    await expect(heading.locator("[data-office-style-preview]")).toHaveAttribute(
      "data-preview-ready",
      "true",
    );
    const headingText = heading.locator("svg text");
    await expect(headingText).toHaveText("Heading 1");
    await expect(headingText).toHaveCSS("font-family", '"Liberation Sans"');
    await expect(headingText).toHaveCSS("font-size", "24px");
    await expect(headingText).toHaveCSS("font-weight", "700");
    const fourth = popup
      .getByRole("option", { name: "Heading 4", exact: true })
      .locator("svg text");
    await expect(fourth).toHaveCSS("font-style", "italic");
    const mono = popup
      .getByRole("option", { name: "Preformatted Text", exact: true })
      .locator("svg text");
    await expect(mono).toHaveCSS("font-family", '"Liberation Mono"');
    const bounds = await popup.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width + 1);
    expect(
      await heading
        .locator("svg text")
        .evaluate(
          /** Observes actual SVG ink geometry. @param element - Native browser text. @returns Ink width. */ (
            element,
          ) => (element as SVGGraphicsElement).getBBox().width,
        ),
    ).toBeGreaterThan(20);
    await page.screenshot({ path: testInfo.outputPath("style-name-previews.png"), fullPage: true });
    await input.press("ArrowDown");
    await expect(input).toBeFocused();
    const selected = popup.getByRole("option", { selected: true });
    const colors = await selected.evaluate(
      /** Reads actual host and painted selected text colors. @param element - Selected actual row. @returns Computed colors. */ (
        element,
      ) => ({
        host: getComputedStyle(element).color,
        text: getComputedStyle(element.querySelector("svg text") as Element).fill,
      }),
    );
    expect(colors.text).toBe(colors.host);
    await input.press("Escape");
    await expect(input).toHaveValue("Default Paragraph Style");
    await input.locator("..").locator("[data-office-combobox-toggle]").click();
    await popup.getByRole("option", { name: "Heading 1", exact: true }).click();
    await expect(input).toHaveValue("Heading 1");
    await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
    const sidebarInput = sidebar.getByRole("combobox", { name: "Paragraph style", exact: true });
    await expect(sidebarInput).toHaveValue("Heading 1");
    await sidebarInput.locator("..").locator("[data-office-combobox-toggle]").click();
    const sidebarPopup = page.locator(`id=${await sidebarInput.getAttribute("aria-controls")}`);
    const sidebarHeading = sidebarPopup.getByRole("option", { name: "Heading 4", exact: true });
    await expect(sidebarHeading.locator("svg text")).toHaveCSS("font-style", "italic");
    await page.screenshot({
      path: testInfo.outputPath("style-sidebar-previews.png"),
      fullPage: true,
    });
    const sidebarBounds = await sidebarPopup.boundingBox();
    expect(sidebarBounds?.x).toBeGreaterThanOrEqual(0);
    expect((sidebarBounds?.x ?? 0) + (sidebarBounds?.width ?? 0)).toBeLessThanOrEqual(width + 1);
    await sidebarHeading.click();
    await expect(input).toHaveValue("Heading 4");
    await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();
    expect(errors).toEqual([]);
  });
