/** @fileoverview Actual table rich-text ownership stays with the caller when a position fails the original document bounds guard. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { EditTextObjectImpl, TextRotation } from "../../../../editeng/inc/editobj";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("rejects invalid table positions before allocating columns or taking edit-text ownership", /** Guarded calls do not transfer ownership or create a cell. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const table = doc.FetchTable(0);
  assert(table);
  const edit = new EditTextObjectImpl(
    null,
    MapUnit.Map100thMM,
    false,
    TextRotation.NONE,
    SvtScriptType.LATIN,
  );
  const value = unicode("retained");
  try {
    edit.CreateAndInsertContent().SetText(value);
    const before = table.GetAllocatedColumnsCount();
    for (const [column, row] of [
      [-1, 0],
      [0, -1],
      [doc.MaxCol() + 1, 0],
      [0, doc.MaxRow() + 1],
    ] as const) {
      table.SetEditText(column, row, edit);
      expect(table.GetAllocatedColumnsCount()).toBe(before);
      expect(edit.GetParagraphCount()).toBe(1);
      const retained = edit.GetText(0);
      try {
        expect(text(retained)).toBe("retained");
      } finally {
        retained.dispose();
      }
    }
  } finally {
    value.dispose();
    edit.dispose();
    doc.Dispose();
  }
});
