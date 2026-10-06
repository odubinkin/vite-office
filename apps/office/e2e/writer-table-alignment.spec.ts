/** @fileoverview Real Chromium native table alignment, linked metrics and history at desktop and narrow widths. */
import { selectBrowserTableRow } from "../test-support/table-mouse-e2e";
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

for (const viewport of [1280, 390])
  test(`native automatic restores edited width viewport=${viewport}`, /** Exercises native saved width through actual radio transitions. @param fixtures - Browser fixtures. @param fixtures.page - Browser. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Restore", { width: 3000, align: "left" });
    table.AddColumnWidth(1000);
    table.AddColumnWidth(2000);
    doc.nodes.AppendTableRow(table, 2);
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(writeOdtDocument(doc, { title: "Restore" })),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "restore.odt",
    });
    await selectBrowserTableRow(page, "Restore", 1);
    await page.getByRole("button", { name: "Table Properties", exact: true }).click();
    const width = page.getByRole("spinbutton", { name: "Table width (cm)" });
    await width.fill("4");
    await page.getByRole("radio", { name: "Automatic", exact: true }).check();
    await expect(width).toBeDisabled();
    await page.getByRole("radio", { name: "Left", exact: true }).check();
    await expect(width).toBeEnabled();
    await expect(width).toHaveValue("4");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await expect(page.getByRole("table", { name: "Restore" })).toHaveCSS("width", "151.188px");
  });

for (const viewport of [1280, 390])
  for (const [label, width, left, right] of [
    ["Automatic", 8000, 0, 0],
    ["Left", 3000, 0, 5000],
    ["From left", 3000, 300, 4700],
    ["Right", 3000, 5000, 0],
    ["Center", 3000, 2500, 2500],
    ["Manual", 7100, 300, 600],
  ] as const)
    test(`native table ${label} viewport=${viewport}`, /** Exercises ordinary Open, format page and native history. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        desc = doc.GetPageDesc();
      desc.SetValue({ ...desc.GetValue(), width: 9200, leftMargin: 600, rightMargin: 600 });
      const table = doc.nodes.MakeTableNode("Geometry", {
        width: 3000,
        align: "left",
        headerRows: 0,
        repeatHeaderRows: false,
      });
      table.AddColumnWidth(1000);
      table.AddColumnWidth(2000);
      doc.nodes
        .AppendTableRow(table, 2, {}, [
          { border: "none", padding: 0 },
          { border: "none", padding: 0 },
        ])
        .GetTabBoxes()[0]
        ?.GetParagraphs()[0]
        ?.SetText("Original");
      const bytes = writeOdtDocument(doc, { title: "Geometry" });
      await page.setViewportSize({ width: viewport, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "geometry.odt",
      });
      const rendered = page.getByRole("table", { name: "Geometry" });
      await expect(rendered).toHaveCount(1);
      await selectBrowserTableRow(page, "Geometry", 1);
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await expect(page.getByRole("radio")).toHaveCount(6);
      await page.getByRole("radio", { name: label, exact: true }).check();
      const metric = page.getByRole("spinbutton", { name: "Table width (cm)" });
      if (label === "Automatic") await expect(metric).toBeDisabled();
      else await expect(metric).toBeEnabled();
      if (label === "From left" || label === "Manual")
        await page.getByRole("spinbutton", { name: "Left (cm)" }).fill("0.53");
      if (label === "Manual")
        await page.getByRole("spinbutton", { name: "Right (cm)" }).fill("1.058333");
      await page.getByRole("spinbutton", { name: "Above (cm)" }).fill("0.2");
      await page.getByRole("spinbutton", { name: "Below (cm)" }).fill("0.3");
      await page.getByRole("button", { name: "OK", exact: true }).click();
      const geometry =
        /** Reads real computed CSS, including native table print offsets. @returns Physical CSS geometry. */ async () =>
          rendered.evaluate(
            /** Returns actual table style fields. @param element - Real table. @returns Numbers. */ (
              element,
            ) => {
              const style = getComputedStyle(element);
              return [
                style.width,
                style.marginLeft,
                style.marginRight,
                style.marginTop,
                style.marginBottom,
              ].map(
                /** Converts computed physical lengths. @param value - CSS length. @returns Pixels. */ (
                  value,
                ) => parseFloat(value),
              );
            },
          );
      for (let cycle = 0; cycle < 2; cycle++) {
        const values = await geometry();
        for (const [index, expected] of [width, left, right, 113, 170].entries())
          expect(values[index]).toBeCloseTo(expected / 15, 1);
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        expect((await geometry())[0]).toBeCloseTo(200, 1);
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(
          page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
        ).toHaveText("Original");
      }
    });
