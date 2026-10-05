/** @fileoverview Measures independent counted list axes through actual body/cell paragraph edits. */
import { expect, test } from "@playwright/test";
import { SvxTextLeftMarginItem } from "../src/editeng/source/items/frmitems";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { RES_MARGIN_TEXTLEFT } from "../src/sw/inc/hintids";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { createWriterNumFormat } from "../src/sw/source/core/doc/number";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
for (const cell of [false, true])
  test(`Writer counted axes stay independent through paragraph history cell=${cell}`, /** Checks real import,marker geometry,dialog edits and history. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
    page,
  }) => {
    const doc = createWriterDocument(),
      meta = createDocument({ id: "counted-axes", suiteId: "writer", title: "Counted axes" }),
      body = doc.paragraphs[0];
    if (body === undefined) throw new Error("Missing body");
    const table = doc.nodes.MakeTableNode("AxesTable", {}, body);
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const boxes = doc.nodes.AppendTableRow(table, 2).GetTabBoxes(),
      first = boxes[0]?.GetParagraphs()[0],
      other = boxes[1]?.GetParagraphs()[0];
    if (first === undefined || other === undefined) throw new Error("Missing cell");
    const node = cell ? first : body;
    node.SetText("CountedGeometryProof");
    other.SetText("NeighborProof");
    const rule = doc.EnsureNumRule("AxesRule", "numbered");
    rule.Set(
      0,
      createWriterNumFormat("numbered", "", {
        positionAndSpaceMode: "label-alignment",
        indentAt: 1440,
        firstLineIndent: -360,
        listTabPosition: 2160,
        labelFollowedBy: "listtab",
        suffix: ".",
      }),
    );
    if (!cell) {
      node.SetNumRule("AxesRule");
      node.AddToList();
    }
    node.SetAttr(new SvxTextLeftMarginItem(1680, RES_MARGIN_TEXTLEFT));
    const shell = new SwDocShell(doc, meta),
      bytes = writeOdtDocument(doc, meta);
    shell.Close();
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "counted-axes.odt",
    });
    const paragraph = page
      .locator("[data-writer-paragraph-id]")
      .filter({ hasText: "CountedGeometryProof" });
    const neighbor = page
      .locator("[data-writer-paragraph-id]")
      .filter({ hasText: "NeighborProof" });
    await expect(paragraph).toHaveText("CountedGeometryProof");
    await expect(neighbor).toHaveText("NeighborProof");
    if (cell) {
      await paragraph.click();
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
      await page.getByRole("menuitemradio", { name: "Ordered List", exact: true }).click();
    }
    const measure =
      /** Measures real counted marker placement relative to paragraph flow. @returns Marker offset in CSS pixels. */ () =>
        paragraph.evaluate(
          /** Reads actual marker geometry without model introspection. @param p - Editable host. @returns Relative left. */ (
            p,
          ) => {
            const wrapper = p.parentElement,
              outer = wrapper?.parentElement,
              marker = wrapper?.querySelector("[data-writer-list-marker]");
            if (outer === null || outer === undefined || marker === null || marker === undefined)
              throw new Error("Missing marker geometry");
            return marker.getBoundingClientRect().left - outer.getBoundingClientRect().left;
          },
        );
    // Native label-alignment activation resets cell direct margins; imported body margins remain.
    await expect.poll(measure).toBeCloseTo(cell ? 24 : 88, 1);
    await paragraph.click();
    await page.getByRole("button", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });
    await dialog.getByLabel("First line indent (pt)").fill("6");
    await dialog.getByRole("button", { name: "OK", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect.poll(measure).toBeCloseTo(cell ? 56 : 120, 1);
    await paragraph.press("Control+z");
    await expect.poll(measure).toBeCloseTo(cell ? 24 : 88, 1);
    await paragraph.press("Control+Shift+z");
    await expect.poll(measure).toBeCloseTo(cell ? 56 : 120, 1);
    await expect(paragraph).toHaveText("CountedGeometryProof");
    await expect(neighbor).toHaveText("NeighborProof");
    await expect(paragraph).toHaveAttribute("data-list-kind", "numbered");
  });
