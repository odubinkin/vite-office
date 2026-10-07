/** @fileoverview Checks zero bullet ODT import and native text editing/history in real body and table UI. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { applyWriterParagraphList } from "../src/sw/source/core/doc/list";
import { createWriterNumFormat } from "../src/sw/source/core/doc/number";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(`native zero bullet body cell width=${width}`, /** Checks native zero labels through production Open and existing history. @param fixtures - Browser fixtures. @param fixtures.page - Real production browser. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = doc.paragraphs[0];
    if (body === undefined) throw Error("Missing body");
    const table = doc.GetNodes().MakeTableNode("Zero");
    table.AddColumnWidth(6000);
    const cell = doc.GetNodes().AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
    if (cell === undefined) throw Error("Missing cell");
    for (const [node, name] of [
      [body, "Body zero bullet"],
      [cell, "Cell zero bullet"],
    ] as const) {
      node.SetText(name);
      applyWriterParagraphList(node, { kind: "bullet", level: 0, ruleName: name });
      const rule = node.GetNumRule();
      if (rule === undefined) throw Error("Missing rule");
      rule.Set(
        0,
        createWriterNumFormat("bullet", "\0", {
          firstLineIndent: 0,
          indentAt: 720,
          listTabPosition: 720,
          positionAndSpaceMode: "label-alignment",
        }),
      );
    }
    const bytes = writeOdtDocument(doc, { title: "Zero" });
    doc.Dispose();
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "zero.odt",
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    for (const text of ["Body zero bullet", "Cell zero bullet"]) {
      const paragraph = page.locator("p[data-writer-node-index]").filter({ hasText: text }).first();
      await expect(paragraph).toHaveAttribute("data-list-kind", "bullet");
      await expect(paragraph).toHaveAttribute("data-list-marker", "");
      const label = await paragraph.evaluate(
        /** Reads the actual rendered label without assuming an empty DOM marker exists. @param element - Text owner. @returns Visible label text or absence. */ (
          element,
        ) => element.parentElement?.querySelector("[data-writer-list-marker]")?.textContent ?? "",
      );
      expect(label).toBe("");
      await paragraph.focus();
      await paragraph.evaluate(
        /** Places a native editable text caret. @param element - Text owner. @returns Nothing. */ (
          element,
        ) => {
          const node = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
          if (node === null) throw Error("Missing text");
          window.getSelection()?.setBaseAndExtent(node, 0, node, 0);
          document.dispatchEvent(new Event("selectionchange"));
        },
      );
      await page.keyboard.type("X");
      await expect(paragraph).toHaveText("X" + text);
      await expect(paragraph).toHaveAttribute("data-list-marker", "");
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(paragraph).toHaveText(text);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect(paragraph).toHaveText("X" + text);
      await expect(paragraph).toHaveAttribute("data-list-kind", "bullet");
      await expect(paragraph).toHaveAttribute("data-list-marker", "");
    }
  });
