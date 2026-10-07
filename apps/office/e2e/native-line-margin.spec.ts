/** @fileoverview Checks real Chromium visual-line Home/End and native editing for body and tables. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const viewport of [1280, 390])
  test(`native visual-line Home End and Shift body cell width=${viewport}`, /** Checks actual soft-wrap geometry and continued native edits. @param fixtures - Browser fixtures. @param fixtures.page - Page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = doc.paragraphs[0];
    if (body === undefined) throw Error("Missing body");
    const text = "First line words repeated across the paragraph until the browser wraps. ".repeat(
      12,
    );
    body.SetText(text);
    const table = doc.nodes.MakeTableNode("Margins", { width: 3000 });
    table.AddColumnWidth(3000);
    const cell = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
    if (cell === undefined) throw Error("Missing cell");
    cell.SetText(text);
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(writeOdtDocument(doc, { title: "Margins" })),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "margins.odt",
    });
    const paragraphs = [
      page.locator("p[data-writer-node-index]").filter({ hasText: text }).first(),
      page.getByRole("table", { name: "Margins", exact: true }).getByRole("textbox"),
    ];
    for (const editor of paragraphs) {
      await expect(editor).toBeVisible();
      await editor.focus();
      const geometry = await editor.evaluate(
        /** Measures an independent literal target from real character rectangles. @param element - Actual paragraph. @returns End/start geometry and source offset. */ (
          element,
        ) => {
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT),
            characters: { node: Text; index: number; offset: number; top: number }[] = [];
          let node = walker.nextNode(),
            offset = 0;
          while (node instanceof Text) {
            for (let index = 0; index < node.length; index++, offset++) {
              const range = document.createRange();
              range.setStart(node, index);
              range.setEnd(node, index + 1);
              const rect = range.getClientRects()[0];
              if (rect !== undefined && rect.height > 0)
                characters.push({ node, index, offset, top: rect.top });
            }
            node = walker.nextNode();
          }
          const first = characters[0];
          if (first === undefined) throw Error("No browser line");
          const next = characters.find(
            /** Finds the next shaped line independently. @param character - Character geometry. @returns Whether next line. */ (
              character,
            ) => character.top > first.top + 5,
          );
          if (next === undefined) throw Error("Fixture must wrap");
          const text = element.textContent ?? "";
          let end = next.offset;
          while (end > 0 && text[end - 1] === " ") end--;
          const selection = window.getSelection();
          selection?.setBaseAndExtent(first.node, first.index + 2, first.node, first.index + 2);
          document.dispatchEvent(new Event("selectionchange"));
          return { end, start: 0 };
        },
      );
      await page.keyboard.press("End");
      const point = await editor.evaluate(
        /** Reads the actual DOM point as UTF16 text length. @param element - Current paragraph. @returns Native-projected offset. */ (
          element,
        ) => {
          const selection = window.getSelection();
          if (selection?.focusNode === null || selection === null) throw Error("No selection");
          const range = document.createRange();
          range.selectNodeContents(element);
          range.setEnd(selection.focusNode, selection.focusOffset);
          return range.toString().length;
        },
      );
      expect(point).toBe(geometry.end);
      await page.keyboard.press("Shift+Home");
      await expect
        .poll(
          /** Reads actual selected first-line content. @returns Selected text. */ async () =>
            page.evaluate(
              /** Reads browser selection. @returns Text. */ () =>
                window.getSelection()?.toString(),
            ),
        )
        .toBe(text.slice(geometry.start, geometry.end));
      await page.keyboard.press("Home");
      await page.keyboard.type("X");
      await expect(editor).toHaveText("X" + text);
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(editor).toHaveText(text);
    }
  });
