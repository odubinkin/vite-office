/** @fileoverview Exercises native table sidebar metrics and ordinary ODT export on desktop and mobile. */
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";
import { HoriOrientation as H } from "../src/offapi/com/sun/star/text/HoriOrientation";
import { SwFrameSize } from "../src/sw/inc/fmtfsize";

for (const width of [1280, 390]) {
  test(`Table metrics, alignment, history and ODT width=${width}` /** Changes actual native controls then inspects exported native attributes. @param fixtures - Test fixtures. @param fixtures.page - Browser. @param info - Artifact paths. @returns Completion. */, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Insert Table", exact: true }).click();
    await page.getByRole("button", { name: "2 columns, 2 rows", exact: true }).click();
    const panel = page
      .getByRole("complementary", { name: "Writer properties sidebar" })
      .getByRole("region", { name: "Table", exact: true });
    const height = panel.getByRole("spinbutton", { name: "Row height", exact: true });
    await height.fill("0.5 in");
    await height.blur();
    await expect(height).toHaveValue("1.27 cm");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(height).toHaveValue("0.04 cm");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(height).toHaveValue("1.27 cm");
    const column = panel.getByRole("spinbutton", { name: "Column width", exact: true });
    await column.fill("2 in");
    await column.blur();
    await expect(column).toHaveValue("5.08 cm");
    await panel.getByRole("combobox", { name: "Table alignment" }).selectOption(String(H.NONE));
    await panel.getByRole("spinbutton", { name: "Left spacing" }).fill("1 cm");
    await panel.getByRole("spinbutton", { name: "Right spacing" }).fill("2 cm");
    await panel.getByRole("combobox", { name: "Table alignment" }).selectOption(String(H.CENTER));
    await expect(panel.getByRole("spinbutton", { name: "Right spacing" })).toBeDisabled();
    await panel.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath("table-sidebar-metrics.png") });
    const pending = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const artifact = info.outputPath("table-sidebar-metrics.odt");
    await (await pending).saveAs(artifact);
    const imported = await readOdtDocument(new Uint8Array(await readFile(artifact)), {
      title: "Table metrics",
    });
    const table = imported.document.GetTables()[0];
    if (!table) throw new Error("Missing exported table");
    expect(table.GetFrameFormat().GetHoriOrient().GetHoriOrient()).toBe(H.CENTER);
    const pageFormat = imported.document.GetPageDesc().GetValue();
    expect(table.GetFrameFormat().GetFrameSize().GetWidth()).toBe(
      pageFormat.width - pageFormat.leftMargin - pageFormat.rightMargin - 1700,
    );
    const rows = table.GetTabLines();
    expect(
      rows.some(
        /** Finds the original edited row. @param row - Native row. @returns Whether height retained. */
        (row) =>
          row.GetFrameFormat().GetFrameSize().GetHeightSizeType() === SwFrameSize.Minimum &&
          row.GetFrameFormat().GetFrameSize().GetHeight() === 720,
      ),
    ).toBe(true);
    imported.document.Dispose();
  });
}
