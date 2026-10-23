/** @fileoverview Exercises actual table toolbar/menu/sidebar commands and exported ODT on desktop and mobile. */
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";
import { VertOrientation } from "../src/offapi/com/sun/star/text/VertOrientation";
import { SwFrameSize } from "../src/sw/inc/fmtfsize";

for (const width of [1280, 390]) {
  test(`Native table flow controls and ODT width=${width}`, /** Checks actual model effects through normal UI and document I/O. @param fixtures - Fixtures. @param fixtures.page - Browser. @param info - Artifact paths. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await expect(page.getByRole("toolbar", { name: "Writer table toolbar" })).toHaveCount(0);
    await page.getByRole("button", { name: "Insert Table", exact: true }).click();
    await page.getByRole("button", { name: "2 columns, 2 rows", exact: true }).click();
    const bar = page.getByRole("toolbar", { name: "Writer table toolbar" });
    const bottom = bar.getByRole("button", { name: "Bottom", exact: true });
    await bottom.click();
    await expect(bottom).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(bar.getByRole("button", { name: "Top", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(bottom).toHaveAttribute("aria-pressed", "true");
    if (width === 390)
      await page.getByRole("menuitem", { name: "More menus", exact: true }).click();
    await page.getByRole("menuitem", { name: "Table", exact: true }).click();
    const header = page.getByRole("menuitemcheckbox", {
      name: "Header Rows Repeat Across Pages",
      exact: true,
    });
    await expect(header).toHaveAttribute("aria-checked", "true");
    await header.click();
    if (width === 390)
      await page.getByRole("menuitem", { name: "More menus", exact: true }).click();
    await page.getByRole("menuitem", { name: "Table", exact: true }).click();
    await expect(header).toHaveAttribute("aria-checked", "false");
    await header.click();
    if (width === 390)
      await page.getByRole("menuitem", { name: "More menus", exact: true }).click();
    await page.getByRole("menuitem", { name: "Table", exact: true }).click();
    const split = page.getByRole("menuitemcheckbox", {
      name: "Row to Break Across Pages",
      exact: true,
    });
    await expect(split).toHaveAttribute("aria-checked", "true");
    await split.click();
    const panel = page
      .getByRole("complementary", { name: "Writer properties sidebar" })
      .getByRole("region", { name: "Table", exact: true });
    const minimal = panel.getByRole("button", { name: "Minimal Row Height", exact: true });
    await expect(minimal).toBeDisabled();
    await panel.getByRole("spinbutton", { name: "Row height", exact: true }).fill("1 cm");
    await panel.getByRole("spinbutton", { name: "Row height", exact: true }).blur();
    await expect(minimal).toBeEnabled();
    await minimal.click();
    await expect(minimal).toBeDisabled();
    await panel.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath("table-flow.png") });
    const pending = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const path = info.outputPath("table-flow.odt");
    await (await pending).saveAs(path);
    const opened = await readOdtDocument(new Uint8Array(await readFile(path)), { title: "Flow" });
    try {
      const table = opened.document.GetTables()[0];
      if (!table) throw new Error("Missing exported table");
      expect(table.GetRowsToRepeat()).toBe(1);
      const first = table.GetTabLines()[0];
      if (!first) throw new Error("Missing exported row");
      expect(first.GetFrameFormat().GetRowSplit().GetValue()).toBe(false);
      expect(first.GetFrameFormat().GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Variable);
      expect(first.GetTabBoxes()[0]?.GetFrameFormat().GetVertOrient().GetVertOrient()).toBe(
        VertOrientation.BOTTOM,
      );
    } finally {
      opened.document.Dispose();
    }
  });
}
