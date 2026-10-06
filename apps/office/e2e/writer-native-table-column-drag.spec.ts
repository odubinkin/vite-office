/** @fileoverview Reproduces real Chromium editable-text column dragging and cancellation at desktop/mobile widths. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { HoriOrientation } from "../src/offapi/com/sun/star/text/HoriOrientation";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { exposeBrowserTableEdge } from "../test-support/table-mouse-e2e";
for (const viewport of [1280, 390])
  test(`native mouse column tracking width=${viewport}`, /** Checks physical production boundaries with actual mouse and editable text. @param fixtures - Browser fixtures. @param fixtures.page - Real Chromium page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Drag", { width: 4500, horiOrient: HoriOrientation.LEFT });
    for (let c = 0; c < 3; c++) table.AddColumnWidth(1500);
    for (let r = 0; r < 2; r++)
      for (const box of doc.nodes.AppendTableRow(table, 3).GetTabBoxes()) {
        const node = box.GetParagraphs()[0];
        if (node === undefined) throw new Error("Missing native cell");
        node.SetText("Text near a border");
      }
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(writeOdtDocument(doc, { title: "Drag" })),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "drag.odt",
    });
    const rendered = page.getByRole("table", { name: "Drag", exact: true }),
      first = rendered.locator("tr").first().locator("td,th").first();
    await expect(rendered).toHaveCount(1);
    await first.scrollIntoViewIfNeeded();
    let bounds = await first.boundingBox();
    if (bounds === null) throw new Error("Missing cell geometry");
    if (bounds.x + bounds.width + 35 > viewport) {
      await page.mouse.move(Math.min(viewport - 20, bounds.x + 20), bounds.y + 20);
      await page.mouse.wheel(150, 0);
      await expect
        .poll(
          /** Waits for actual device scrolling. @returns Current cell edge. */ async () =>
            (await first.boundingBox())?.x,
        )
        .not.toBe(bounds.x);
      bounds = await first.boundingBox();
      if (bounds === null) throw new Error("Missing scrolled cell");
    }
    const x = bounds.x + bounds.width,
      y = bounds.y + bounds.height / 2;
    await page.mouse.move(x, y);
    await expect(page.locator("[data-writer-editing-host]")).toHaveCSS("cursor", "col-resize");
    await page.evaluate(
      /** Observes real browser drag events without mutating document models. @returns Nothing. */ () => {
        document.body.dataset.columnDragStarts = "0";
        document.addEventListener(
          "dragstart",
          /** Counts real platform drag events. @returns Nothing. */ () => {
            document.body.dataset.columnDragStarts = String(
              Number(document.body.dataset.columnDragStarts) + 1,
            );
          },
        );
      },
    );
    await page.mouse.down();
    await page.mouse.move(x + 20, y, { steps: 5 });
    await expect(page.locator("[data-writer-table-column-guide]")).toHaveCount(1);
    await expect
      .poll(
        /** Reads unchanged physical cell width during preview. @returns Current width. */ async () =>
          (await first.boundingBox())?.width,
      )
      .toBeCloseTo(bounds.width, 0);
    await page.mouse.up();
    await expect(page.locator("[data-writer-table-column-guide]")).toHaveCount(0);
    await expect
      .poll(
        /** Waits for model-driven physical resize. @returns Current width. */ async () =>
          (await first.boundingBox())?.width,
      )
      .toBeCloseTo(bounds.width + 20, 0);
    await expect(page.locator("body")).toHaveAttribute("data-column-drag-starts", "0");
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect
        .poll(
          /** Reads native undo layout. @returns Width. */ async () =>
            (await first.boundingBox())?.width,
        )
        .toBeCloseTo(bounds.width, 0);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect
        .poll(
          /** Reads native redo layout. @returns Width. */ async () =>
            (await first.boundingBox())?.width,
        )
        .toBeCloseTo(bounds.width + 20, 0);
    }
    let next = await first.boundingBox();
    if (next === null) throw new Error("Missing resized cell");
    await page.mouse.move(next.x + next.width, y);
    await page.mouse.down();
    await page.mouse.move(next.x + next.width + 20, y);
    await page.keyboard.press("Escape");
    await page.mouse.up();
    await expect
      .poll(
        /** Reads unchanged geometry after Escape. @returns Width. */ async () =>
          (await first.boundingBox())?.width,
      )
      .toBeCloseTo(bounds.width + 20, 0);
    const last = rendered.locator("tr").first().locator("td,th").last();
    await last.scrollIntoViewIfNeeded();
    next = await last.boundingBox();
    if (next === null) throw new Error("Missing outer edge");
    await page.mouse.move(next.x + next.width, y);
    await page.mouse.down();
    await page.mouse.move(next.x + next.width - 15, y);
    await page.mouse.up();
    await expect
      .poll(
        /** Reads accepted outer table edge movement. @returns Width. */ async () =>
          (await last.boundingBox())?.width,
      )
      .toBeCloseTo(next.width - 15, 0);
    await expect(rendered.locator("tr")).toHaveCount(2);
    await expect(
      page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
    ).toHaveText("Text near a border");
  });
test("native outer-left tracking accepts Enter and preserves the editing cursor", /** Checks a newly accepted native mouse ingress branch with real keyboard termination and input. @param fixtures - Browser fixtures. @param fixtures.page - Actual Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("EnterDrag", { width: 4500, horiOrient: HoriOrientation.LEFT });
  for (let c = 0; c < 3; c++) table.AddColumnWidth(1500);
  for (const box of doc.nodes.AppendTableRow(table, 3).GetTabBoxes()) {
    const node = box.GetParagraphs()[0];
    if (node === undefined) throw new Error("Missing native input cell");
    node.SetText("Cell");
  }
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(writeOdtDocument(doc, { title: "EnterDrag" })),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "enter-drag.odt",
  });
  const rendered = page.getByRole("table", { name: "EnterDrag", exact: true }),
    cell = rendered.locator("tr").first().locator("td,th").first(),
    editor = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
  await editor.click();
  await page.keyboard.press("End");
  const before = await exposeBrowserTableEdge(page, cell);
  if (before === null) throw new Error("Missing left border");
  await page.mouse.move(before.x, before.y + before.height / 2);
  await page.mouse.down();
  await expect(page.locator("[data-writer-table-column-guide]")).toHaveCount(1);
  await page.mouse.move(before.x + 15, before.y + before.height / 2);
  await page.keyboard.press("Enter");
  await page.mouse.up();
  await expect
    .poll(
      /** Waits for accepted native margin/box geometry. @returns First box width. */ async () =>
        (await cell.boundingBox())?.width,
    )
    .toBeCloseTo(before.width - 15, 0);
  await expect(page.locator("[data-writer-table-column-guide]")).toHaveCount(0);
  await page.keyboard.type("X");
  await expect(editor).toHaveText("CellX");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(editor).toHaveText("Cell");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect
    .poll(
      /** Reads original box layout after separate input and resize undo. @returns Original width. */ async () =>
        (await cell.boundingBox())?.width,
    )
    .toBeCloseTo(before.width, 0);
});
