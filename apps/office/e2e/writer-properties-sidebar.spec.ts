/** @fileoverview Exercises source-shaped Writer Properties panels,actual slot/history synchronization and genuine ODT output in Chromium. */
import { pickComboBoxEntry } from "./shared/combo-box";
import { pickWriterStyle } from "./writer-style-box";
import { expect, test } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";
import {
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_RIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_UL_SPACE,
} from "../src/sw/inc/hintids";
import {
  SvxTextLeftMarginItem,
  SvxRightMarginItem,
  SvxFirstLineIndentItem,
} from "../src/editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../src/editeng/inc/ulspitem";

for (const width of [1280, 390]) {
  test(`Properties sidebar shares native slots,history and ODT width=${width}`, /** Checks actual UI and exported values across supported browser layouts. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @param info - Artifact paths. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" }),
      toolbar = page.getByRole("toolbar", { name: "Writer formatting toolbar" });
    await expect(sidebar.locator("section")).toHaveCount(3);
    expect(
      await sidebar
        .locator("section")
        .evaluateAll(
          /** Reads actual native panel composition. @param panels - Mounted panel elements. @returns Ordered titles. */ (
            panels,
          ) =>
            panels.map(
              /** Reads one native panel title. @param panel - Mounted panel. @returns Accessible title. */ (
                panel,
              ) => panel.getAttribute("aria-label"),
            ),
        ),
    ).toEqual(["Style", "Character", "Paragraph"]);
    await pickWriterStyle(
      sidebar.getByRole("combobox", { name: "Paragraph style", exact: true }),
      "Heading 1",
    );
    await expect(
      toolbar.getByRole("combobox", { name: "Paragraph style", exact: true }),
    ).toHaveValue("Heading 1");
    await pickComboBoxEntry(
      sidebar.getByRole("combobox", { name: "Font name", exact: true }),
      "Liberation Sans",
    );
    await sidebar.getByRole("combobox", { name: "Font size", exact: true }).fill("14");
    await sidebar.getByRole("combobox", { name: "Font size", exact: true }).press("Tab");
    await expect(toolbar.getByRole("combobox", { name: "Font name", exact: true })).toHaveValue(
      "Liberation Sans",
    );
    await expect(toolbar.getByRole("combobox", { name: "Font size", exact: true })).toHaveValue(
      "14 pt",
    );
    const lower = sidebar.getByRole("spinbutton", { name: "Below Paragraph Spacing", exact: true }),
      previousLower = await lower.inputValue();
    for (const [name, value] of [
      ["Before Text Indent", "1 cm"],
      ["After Text Indent", "0.5 cm"],
      ["First Line Indent", "-0.5 cm"],
      ["Above Paragraph Spacing", "0.2 cm"],
      ["Below Paragraph Spacing", "0.3 cm"],
    ] as const) {
      await sidebar.getByRole("spinbutton", { name, exact: true }).fill(value);
    }
    await lower.blur();
    await expect(lower).toHaveValue("0.30 cm");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(lower).toHaveValue(previousLower);
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(lower).toHaveValue("0.30 cm");
    await sidebar.getByRole("button", { name: "Paragraph", exact: true }).click();
    await expect(
      sidebar.getByRole("spinbutton", { name: "Before Text Indent", exact: true }),
    ).toBeHidden();
    await sidebar.getByRole("button", { name: "More Options", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Paragraph", exact: true })).toBeVisible();
    await page
      .getByRole("dialog", { name: "Paragraph", exact: true })
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await sidebar.getByRole("button", { name: "Paragraph", exact: true }).click();
    await sidebar
      .getByRole("spinbutton", { name: "First Line Indent", exact: true })
      .scrollIntoViewIfNeeded();
    await writeFile(
      info.outputPath("sidebar-layout.json"),
      JSON.stringify(
        await page.evaluate(
          /** Records real viewport overflow for visual review. @returns Root dimensions and overflowing boxes. */ () => ({
            width: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            boxes: [...document.querySelectorAll("body *")]
              .map(
                /** Reads one actual layout box. @param element - Mounted element. @returns Visible geometry. */ (
                  element,
                ) => ({
                  tag: element.tagName,
                  role: element.getAttribute("role"),
                  classes: element.getAttribute("class"),
                  right: element.getBoundingClientRect().right,
                  width: element.getBoundingClientRect().width,
                }),
              )
              .filter(
                /** Keeps actual viewport overflow candidates. @param box - Measured element. @returns Whether beyond the browser width. */ (
                  box,
                ) => box.right > innerWidth + 1 && box.width > 0,
              ),
          }),
        ),
      ),
    );
    await page.screenshot({ path: info.outputPath("properties-sidebar.png"), fullPage: false });
    const pending = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const artifact = info.outputPath("sidebar-properties.odt");
    await (await pending).saveAs(artifact);
    const imported = await readOdtDocument(new Uint8Array(await readFile(artifact)), {
        title: "Sidebar properties",
      }),
      paragraph = imported.document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing actual imported paragraph");
    const left = paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem,
      right = paragraph.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem,
      first = paragraph.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem,
      ul = paragraph.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
    expect([
      left.ResolveTextLeft(),
      right.ResolveRight(),
      first.ResolveTextFirstLineOffset(),
      ul.GetUpper(),
      ul.GetLower(),
    ]).toEqual([567, 283, -283, 113, 170]);
    imported.document.Dispose();
  });
}

for (const width of [1280, 390]) {
  test(`Table context exposes native insertion and selection controls width=${width}`, /** Checks actual contextual panel ownership and compact controls in Chromium. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @param info - Artifact paths. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Insert Table", exact: true }).click();
    await page.getByRole("button", { name: "2 columns, 2 rows", exact: true }).click();
    const panel = page
        .getByRole("complementary", { name: "Writer properties sidebar" })
        .getByRole("region", { name: "Table", exact: true }),
      table = page.getByRole("table");
    await expect(panel).toBeVisible();
    const insert = panel.getByRole("group", { name: "Insert", exact: true });
    await expect(insert.getByRole("button")).toHaveCount(4);
    await insert.getByRole("button").nth(0).click();
    await insert.getByRole("button").nth(3).click();
    await expect(table.getByRole("row")).toHaveCount(3);
    await expect(table.getByRole("row").first().getByRole("columnheader")).toHaveCount(3);
    await panel
      .getByRole("group", { name: "Select", exact: true })
      .getByRole("button")
      .nth(3)
      .click();
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
    await sidebar.getByRole("spinbutton", { name: "Before Text Indent", exact: true }).fill("1 cm");
    await sidebar
      .getByRole("spinbutton", { name: "Above Paragraph Spacing", exact: true })
      .fill("0.2 cm");
    await panel.getByRole("button", { name: "Table Properties", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Table Properties", exact: true });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await panel.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: info.outputPath("table-properties-sidebar.png"),
      fullPage: false,
    });
    const pending = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const artifact = info.outputPath("table-sidebar-properties.odt");
    await (await pending).saveAs(artifact);
    const imported = await readOdtDocument(new Uint8Array(await readFile(artifact)), {
        title: "Table sidebar properties",
      }),
      nativeTable = imported.document.GetTables()[0];
    if (nativeTable === undefined) throw new Error("Missing imported native table");
    expect(nativeTable.GetTabLines()).toHaveLength(3);
    for (const line of nativeTable.GetTabLines())
      for (const box of line.GetTabBoxes())
        for (const paragraph of box.GetParagraphs()) {
          expect(
            (paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
          ).toBe(567);
          expect((paragraph.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(113);
        }
    imported.document.Dispose();
  });
}
