/** @fileoverview Checks native ordinary zero-margin toolbar admission and history in actual Chromium body/cell editing. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const cell of [false, true])
  test(
    "Writer ordinary native decrease owns no-op history cell=" + cell,
    /** Verifies real command enabledness, rendered glyph movement, repeated history and continued typing. @param fixtures - Browser fixtures. @param fixtures.page - Actual Chromium page. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        body = doc.paragraphs[0],
        table = doc.nodes.MakeTableNode("BrowserAdmission"),
        boxes = doc.nodes.AppendTableRow(table, 2).GetTabBoxes(),
        first = boxes[0]?.GetParagraphs()[0],
        other = boxes[1]?.GetParagraphs()[0];
      if (body === undefined || first === undefined || other === undefined)
        throw Error("Missing native fixture");
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      const target = cell ? first : body;
      target.SetText("BrowserAdmissionProof");
      other.SetText("AdmissionNeighbor");
      const bytes = writeOdtDocument(
        doc,
        createDocument({ id: "native-admission", suiteId: "writer", title: "NativeAdmission" }),
      );
      doc.Dispose();
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "native-admission.odt",
      });
      const paragraph = page
          .locator("[data-writer-paragraph-id]")
          .filter({ hasText: "BrowserAdmissionProof" }),
        neighbor = page
          .locator("[data-writer-paragraph-id]")
          .filter({ hasText: "AdmissionNeighbor" }),
        toolbar = page.getByRole("toolbar", { name: "Writer formatting toolbar" }),
        decrease = toolbar.getByRole("button", { name: "Decrease", exact: true }),
        undo = page.getByRole("button", { name: "Undo", exact: true }),
        redo = page.getByRole("button", { name: "Redo", exact: true });
      await expect(paragraph).toHaveText("BrowserAdmissionProof");
      await paragraph.click();
      const glyphLeft =
        /** Reads an actual rendered glyph independent of model fields. @returns Measured x coordinate. */ () =>
          paragraph.evaluate(
            /** Measures the first original text glyph. @param p - Actual editable host. @returns CSS coordinate. */ (
              p,
            ) => {
              const text = p.ownerDocument.createTreeWalker(p, NodeFilter.SHOW_TEXT).nextNode();
              if (text === null) throw Error("Missing glyph");
              const range = p.ownerDocument.createRange();
              range.setStart(text, 0);
              range.setEnd(text, 1);
              return range.getBoundingClientRect().left;
            },
          );
      const before = await glyphLeft();
      await expect(decrease).toBeEnabled();
      await expect(undo).toBeDisabled();
      await decrease.click();
      await expect(undo).toBeEnabled();
      await expect(paragraph).toHaveText("BrowserAdmissionProof");
      await expect.poll(glyphLeft).toBeCloseTo(before, 1);
      await undo.click();
      await expect(undo).toBeDisabled();
      await expect(redo).toBeEnabled();
      await redo.click();
      await expect(undo).toBeEnabled();
      await toolbar.getByRole("button", { name: "Increase", exact: true }).click();
      await expect.poll(glyphLeft).toBeGreaterThan(before + 10);
      await undo.click();
      await expect.poll(glyphLeft).toBeCloseTo(before, 1);
      await paragraph.click();
      await paragraph.press("End");
      await page.keyboard.type("X");
      await expect(paragraph).toHaveText("BrowserAdmissionProofX");
      await expect(neighbor).toHaveText("AdmissionNeighbor");
    },
  );
