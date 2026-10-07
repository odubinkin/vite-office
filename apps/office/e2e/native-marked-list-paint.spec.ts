/** @fileoverview Checks actual device marked-label painting, sibling scope and glyph separation in Chromium. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { applyWriterParagraphList } from "../src/sw/source/core/doc/list";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(`native marked label paint body cell width=${width}`, /** Checks original imported lists through production pointer, keyboard, print and text editing. @param fixtures - Browser fixtures. @param fixtures.page - Production browser. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = doc.paragraphs[0];
    if (body === undefined) throw Error("Missing body");
    const table = doc.GetNodes().MakeTableNode("MarkedLabels");
    table.AddColumnWidth(6000);
    for (const cell of [false, true])
      for (const index of [0, 1, 2, 3]) {
        const node = cell
          ? doc.GetNodes().AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]
          : index === 0
            ? body
            : doc.GetNodes().MakeTextNode();
        if (node === undefined) throw Error("Missing item");
        node.SetText(`${cell ? "Cell" : "Body"} Paint ${index}`);
        applyWriterParagraphList(node, {
          kind: cell ? "numbered" : "bullet",
          level: index === 2 ? 1 : 0,
          listId: `${cell ? "Cell" : "Body"}${index === 3 ? "Other" : "Marked"}`,
          ruleName: cell ? "CellRule" : "BodyRule",
        });
      }
    const bytes = writeOdtDocument(doc, { title: "Marked labels" });
    doc.Dispose();
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "marked-labels.odt",
    });
    for (const scope of ["Body", "Cell"]) {
      const editor = page
        .locator("p[data-writer-node-index]")
        .filter({ hasText: `${scope} Paint 0` })
        .first();
      const marker = editor.locator("..").locator("[data-writer-list-marker]");
      const sibling = page
        .locator("p[data-writer-node-index]")
        .filter({ hasText: `${scope} Paint 1` })
        .first()
        .locator("..")
        .locator("[data-writer-list-marker]");
      await expect(marker).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await marker.click();
      await expect(marker).toHaveCSS("background-color", "rgb(192, 192, 192)");
      await expect(sibling).toHaveCSS("background-color", "rgb(192, 192, 192)");
      for (const other of [
        `${scope} Paint 2`,
        `${scope} Paint 3`,
        `${scope === "Body" ? "Cell" : "Body"} Paint 0`,
      ])
        await expect(
          page
            .locator("p[data-writer-node-index]")
            .filter({ hasText: other })
            .first()
            .locator("..")
            .locator("[data-writer-list-marker]"),
        ).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      const geometry = await editor.evaluate(
        /** Measures actual label and text glyph separation while background is painted. @param paragraph - Mounted text host. @returns Device geometry. */ (
          paragraph,
        ) => {
          const label = paragraph.parentElement?.querySelector("[data-writer-list-marker]"),
            text = paragraph.firstChild;
          if (label == null || text === null) throw Error("Missing device owners");
          const labelRange = document.createRange(),
            textRange = document.createRange();
          labelRange.selectNodeContents(label);
          textRange.setStart(text, 0);
          textRange.setEnd(text, 1);
          return {
            gap: textRange.getBoundingClientRect().left - labelRange.getBoundingClientRect().right,
            slot: label.getBoundingClientRect().width,
            glyph: labelRange.getBoundingClientRect().width,
          };
        },
      );
      expect(geometry.gap).toBeGreaterThanOrEqual(-0.1);
      expect(geometry.slot).toBeGreaterThanOrEqual(geometry.glyph - 0.1);
      await page.emulateMedia({ media: "print" });
      await expect(marker).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(marker.locator("[data-writer-label-caret]")).toBeHidden();
      await page.emulateMedia({ media: "screen" });
      await expect(marker).toHaveCSS("background-color", "rgb(192, 192, 192)");
      await page.keyboard.press("End");
      await expect(marker).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(sibling).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await marker.click();
      await page.keyboard.type("X");
      await expect(editor).toHaveText(`X${scope} Paint 0`);
      await expect(marker).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(sibling).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(editor).toHaveText(`${scope} Paint 0`);
    }
  });
