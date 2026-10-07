/** @fileoverview Checks actual Chromium before-label caret, pointer input and native text editing. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { applyWriterParagraphList } from "../src/sw/source/core/doc/list";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(`native before-label caret and input body cell width=${width}`, /** Checks actual marker geometry and editable host input. @param fixtures - Browser fixtures. @param fixtures.page - Browser page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = doc.paragraphs[0];
    if (body === undefined) throw Error("Missing body");
    body.SetText("Body label text");
    applyWriterParagraphList(body, { kind: "bullet", level: 0 });
    const table = doc.nodes.MakeTableNode("Labels", { width: 3000 });
    table.AddColumnWidth(3000);
    const cell = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
    if (cell === undefined) throw Error("Missing cell");
    cell.SetText("Cell label text");
    applyWriterParagraphList(cell, { kind: "numbered", level: 0 });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(writeOdtDocument(doc, { title: "Labels" })),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "labels.odt",
    });
    for (const text of ["Body label text", "Cell label text"]) {
      const editor = page.locator("p[data-writer-node-index]").filter({ hasText: text }).first(),
        wrapper = editor.locator(".."),
        marker = wrapper.locator("[data-writer-list-marker]");
      await expect(editor).toBeVisible();
      await editor.focus();
      await editor.evaluate(
        /** Establishes actual text caret away from beginning. @param element - Current paragraph. @returns Nothing. */ (
          element,
        ) => {
          const node = element.firstChild;
          if (node === null) throw Error("Missing text");
          window.getSelection()?.setBaseAndExtent(node, 2, node, 2);
          document.dispatchEvent(new Event("selectionchange"));
        },
      );
      await page.keyboard.press("Home");
      await expect(marker.locator("[data-writer-label-caret]")).toHaveCount(0);
      await page.keyboard.press("Home");
      await expect(marker.locator("[data-writer-label-caret]")).toBeVisible();
      const geometry = await marker.evaluate(
        /** Measures actual caret and marker coordinates. @param label - Real marker. @returns CSS-device geometry. */ (
          label,
        ) => {
          const caret = label.querySelector("[data-writer-label-caret]");
          if (caret === null) throw Error("Missing caret");
          return {
            labelX: label.getBoundingClientRect().left,
            caretX: caret.getBoundingClientRect().left,
            height: caret.getBoundingClientRect().height,
            focusBefore: window.getSelection()?.focusNode === label.parentNode,
            focusNode: window.getSelection()?.focusNode?.nodeName,
            focusOffset: window.getSelection()?.focusOffset,
            focusParent: window.getSelection()?.focusNode?.parentElement?.outerHTML.slice(0, 800),
          };
        },
      );
      expect(Math.abs(geometry.caretX - geometry.labelX)).toBeLessThanOrEqual(1);
      expect(geometry.height).toBeGreaterThan(5);
      expect(geometry.focusBefore, JSON.stringify(geometry)).toBe(true);
      await page.keyboard.press("Home");
      await expect(marker.locator("[data-writer-label-caret]")).toBeVisible();
      await page.keyboard.press("End");
      await expect(marker.locator("[data-writer-label-caret]")).toHaveCount(0);
      await marker.click();
      await expect(marker.locator("[data-writer-label-caret]")).toBeVisible();
      await page.keyboard.type("X");
      await expect(editor).toHaveText("X" + text);
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(editor).toHaveText(text);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect(editor).toHaveText("X" + text);
    }
  });
