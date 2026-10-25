/** @fileoverview Native paste error presentation through actual browser pointer and document lifetimes. */
import { expect, it } from "vitest";
import { CalcViewController } from "./calc-view-controller";
import { ScDocument } from "../../inc/document";
import { ScAddress, ScRange } from "../../inc/address";
import { scPasteResourcesEnglish } from "../../inc/globstr";
import { createDocument } from "../../../sfx2/source/doc/objsh";
it("stops actual marking and preserves native multi-selection feedback after document replacement", /** The active browser host receives real EnterBlock fallback errors on both document identities. @returns Nothing. */ () => {
  const c = new CalcViewController();
  for (const replace of [false, true]) {
    if (replace)
      c.shell.ReplaceDocument(
        new ScDocument(),
        createDocument({ id: crypto.randomUUID(), suiteId: "calc", title: "Replacement" }),
        { kind: "untitled", name: "Replacement" },
      );
    const doc = c.shell.GetDocument(),
      data = c.viewData,
      marks = data.GetMarkData();
    doc.SetValue(new ScAddress(), 3);
    data.SetCurX(0);
    data.SetCurY(1);
    marks.SetMultiMarkArea(new ScRange(0, 1, 0, 0, 1, 0), true);
    marks.SetMultiMarkArea(new ScRange(2, 1, 0, 2, 1, 0), true);
    marks.SetMarking(true);
    expect(c.AutoSum()).toBeUndefined();
    expect(c.error).toBe(scPasteResourcesEnglish.STR_MSSG_PASTEFROMCLIP_0);
    expect(marks.GetMarkingFlag()).toBe(false);
    expect(doc.GetValue(new ScAddress(0, 1, 0))).toBe(3);
    expect(doc.GetFormulaCell(new ScAddress(2, 1, 0))).toBeNull();
  }
  c.Close();
});
it("presents a genuine unsupported SUBTOTAL error without a replacement formula or evaluator", /** Actual filtered source data reaches the native formatter/function admission error. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    doc = c.shell.GetDocument();
  doc.SetValue(new ScAddress(), 3);
  doc.SetRowFiltered(0, 0, 0, true);
  c.viewData.SetCurY(1);
  expect(c.AutoSum()).toBeUndefined();
  expect(c.error).toContain("SUBTOTAL");
  expect(doc.GetFormulaCell(new ScAddress(0, 1, 0))).toBeNull();
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  c.Close();
});
