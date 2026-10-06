/** @fileoverview Checks physical native row-border capture, following-row translation and minimum content layout in Chromium. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { HoriOrientation } from "../src/offapi/com/sun/star/text/HoriOrientation";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const viewport of [1280, 390])
  test(`native mouse row tracking width=${viewport}`, /** Checks actual production geometry and keyboard lifetime. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Rows", { width: 4500, horiOrient: HoriOrientation.LEFT });
    for (let c = 0; c < 3; c++) table.AddColumnWidth(1500);
    for (let r = 0; r < 3; r++)
      for (const box of doc.nodes.AppendTableRow(table, 3).GetTabBoxes()) {
        const node = box.GetParagraphs()[0];
        if (node === undefined) throw new Error("Missing row cell");
        node.SetText(r === 0 ? "Cell" : "Following row");
      }
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(writeOdtDocument(doc, { title: "Rows" })),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "rows.odt",
    });
    const rendered = page.getByRole("table", { name: "Rows", exact: true }),
      first = rendered.locator("tr").first().locator("td,th").first(),
      second = rendered.locator("tr").nth(1),
      last = rendered.locator("tr").last(),
      editor = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
    await expect(rendered).toHaveCount(1);
    await first.scrollIntoViewIfNeeded();
    const before = await first.boundingBox(),
      later = await second.boundingBox(),
      bottom = await rendered.boundingBox();
    if (before === null || later === null || bottom === null)
      throw new Error("Missing native row geometry");
    const x = Math.max(before.x + 10, Math.min(viewport - 15, before.x + before.width / 2)),
      y = before.y + before.height;
    await editor.focus();
    await editor.evaluate(
      /** Retains a collapsed native editing cursor at the actual cell end. @param element - Actual editable paragraph. @returns Nothing. */ (
        element,
      ) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const selection = document.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.dispatchEvent(new Event("selectionchange"));
      },
    );
    await page.mouse.move(x, y);
    await expect(page.locator("[data-writer-editing-host]")).toHaveCSS("cursor", "row-resize");
    await page.mouse.down();
    await page.mouse.move(x + 90, y + 30, { steps: 5 });
    await expect(page.locator("[data-writer-table-row-guide]")).toHaveCount(1);
    await expect
      .poll(
        /** Reads immutable preview layout. @returns Actual height. */ async () =>
          (await first.boundingBox())?.height,
      )
      .toBeCloseTo(before.height, 0);
    await page.mouse.up();
    await expect(page.locator("[data-writer-table-row-guide]")).toHaveCount(0);
    await expect
      .poll(
        /** Reads committed first row height. @returns Actual height. */ async () =>
          (await first.boundingBox())?.height,
      )
      .toBeCloseTo(before.height + 30, 0);
    await expect
      .poll(
        /** Reads translated following row. @returns Actual top. */ async () =>
          (await second.boundingBox())?.y,
      )
      .toBeCloseTo(later.y + 30, 0);
    await expect
      .poll(
        /** Reads translated lower table edge. @returns Actual table height. */ async () =>
          (await rendered.boundingBox())?.height,
      )
      .toBeCloseTo(bottom.height + 30, 0);
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect
        .poll(
          /** Reads original row after native undo. @returns Height. */ async () =>
            (await first.boundingBox())?.height,
        )
        .toBeCloseTo(before.height, 0);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect
        .poll(
          /** Reads accepted row after native redo. @returns Height. */ async () =>
            (await first.boundingBox())?.height,
        )
        .toBeCloseTo(before.height + 30, 0);
    }
    await page.mouse.move(x, y + 30);
    await page.mouse.down();
    await page.mouse.move(x, y + 60);
    await page.keyboard.press("Escape");
    await page.mouse.up();
    await expect
      .poll(
        /** Reads cancelled row geometry. @returns Height. */ async () =>
          (await first.boundingBox())?.height,
      )
      .toBeCloseTo(before.height + 30, 0);
    const lastBefore = await last.boundingBox();
    if (lastBefore === null) throw new Error("Missing native bottom row");
    await page.mouse.move(x, lastBefore.y + lastBefore.height);
    await page.mouse.down();
    await page.mouse.move(x, lastBefore.y + lastBefore.height + 20);
    await page.keyboard.press("Enter");
    await page.mouse.up();
    await expect
      .poll(
        /** Reads accepted bottom border. @returns Height. */ async () =>
          (await last.boundingBox())?.height,
      )
      .toBeCloseTo(lastBefore.height + 20, 0);
    await page.keyboard.type("X");
    await expect(editor).toHaveText("CellX");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(editor).toHaveText("Cell");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect
      .poll(
        /** Reads separate resize undo. @returns Height. */ async () =>
          (await last.boundingBox())?.height,
      )
      .toBeCloseTo(lastBefore.height, 0);
    await page.mouse.move(x, y + 30);
    await page.mouse.down();
    await page.mouse.move(x, before.y - 100);
    await page.mouse.up();
    await expect
      .poll(
        /** Reads minimum content-constrained row. @returns Height. */ async () =>
          (await first.boundingBox())?.height,
      )
      .toBeLessThan(before.height + 30);
    const shrunk = await first.boundingBox();
    if (shrunk === null) throw new Error("Missing content minimum");
    expect(shrunk.height).toBeGreaterThan(5);
    await expect(editor).toHaveText("Cell");
    await expect(rendered.locator("tr")).toHaveCount(3);
  });
