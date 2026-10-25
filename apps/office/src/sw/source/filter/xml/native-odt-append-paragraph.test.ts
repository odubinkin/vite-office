/** @fileoverview Native APPEND_PARAGRAPH import regressions retain ranges and paragraph properties for empty and populated table cells. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { text } from "../../core/unocore/unocrsrhelper";
import { APPEND_PARAGRAPH } from "../../../../offapi/com/sun/star/text/ControlCharacter";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { RES_CHRATR_ESCAPEMENT } from "../../../inc/hintids";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";

it("appends without splitting the source paragraph and moves only the supplied cursor", /** Matches SwXText::insertControlCharacter APPEND_PARAGRAPH range ownership. @returns Nothing. */ () => {
  const document = new SwDoc();
  const model = new SwXTextDocument(document);
  const body = model.getText();
  const cursor = body.createTextCursor();
  const original = cursor.getStart();
  try {
    body.insertControlCharacter(cursor, APPEND_PARAGRAPH, false);
    expect(document.paragraphs).toHaveLength(2);
    expect(original.GetPaM().GetPoint().GetNode()).toBe(document.paragraphs[0]);
    expect(cursor.GetPaM().GetPoint().GetNode()).toBe(document.paragraphs[1]);
    expect(cursor.isCollapsed()).toBe(true);
    expect(text(original.getString())).toBe("");
    const paragraphs = cursor.createEnumeration();
    expect(paragraphs.hasMoreElements()).toBe(true);
    const component = paragraphs.nextElement();
    expect(paragraphs.hasMoreElements()).toBe(false);
    expect(
      /** Native enumeration exhaustion remains an explicit failure. @returns No element. */ () =>
        paragraphs.nextElement(),
    ).toThrow();
    component.dispose();
    component.dispose();
    expect(document.paragraphs).toHaveLength(1);
    const last = cursor.createEnumeration().nextElement();
    last.dispose();
    expect(document.paragraphs).toHaveLength(1);
    last.Release();
  } finally {
    original.dispose();
    cursor.dispose();
    model.dispose();
    document.Dispose();
  }
});

it("reopens populated and empty superscript cells with their native paragraph items", /** Ensures XMLParaContext applies paragraph attributes to their original cell owners. @returns Completion. */ async () => {
  const document = new SwDoc();
  const table = document.GetNodes().MakeTableNode("Position cells");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const boxes = document.GetNodes().AppendTableRow(table, 2).GetTabBoxes();
  for (const [index, box] of boxes.entries()) {
    const paragraph = box.GetParagraphs()[0];
    assert(paragraph, "Each native cell has one paragraph");
    paragraph.SetText(index === 0 ? "S" : "");
    paragraph.SetAttr(new SvxEscapementItem(14000, 58, RES_CHRATR_ESCAPEMENT));
  }
  const bytes = writeOdtDocument(document, { title: "Position cells" });
  document.Dispose();
  const reopened = await readOdtDocument(bytes, { title: "Position cells" });
  try {
    const cells = reopened.document.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes();
    assert(cells, "The imported table retains its native cells");
    expect(cells).toHaveLength(2);
    for (const box of cells) {
      const paragraph = box.GetParagraphs()[0];
      assert(paragraph, "The imported cell retains its paragraph");
      const item = paragraph.GetAttr(RES_CHRATR_ESCAPEMENT) as SvxEscapementItem;
      expect([item.GetEsc(), item.GetProportionalHeight()]).toEqual([14000, 58]);
    }
  } finally {
    reopened.document.Dispose();
  }
});
