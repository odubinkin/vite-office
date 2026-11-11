/** @fileoverview Native table edit-text ownership destroys a rejected unique_ptr argument without allocating columns. */
import { assert, expect, it, vi } from "vitest";
import { ScDocument } from "../../../inc/document";
import { EditTextObjectImpl, TextRotation } from "../../../../editeng/inc/editobj";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("rejects invalid table positions and destroys the transferred edit-text owner", /** Matches the unique_ptr destructor at the original bounds guard. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const name = unicode("Data");
  doc.InsertTab(0, name);
  name.dispose();
  const table = doc.FetchTable(0);
  assert(table);
  try {
    const before = table.GetAllocatedColumnsCount();
    for (const [column, row] of [
      [-1, 0],
      [0, -1],
      [doc.MaxCol() + 1, 0],
      [0, doc.MaxRow() + 1],
    ] as const) {
      const edit = new EditTextObjectImpl(
        null,
        MapUnit.Map100thMM,
        false,
        TextRotation.NONE,
        SvtScriptType.LATIN,
      );
      const value = unicode("owned");
      edit.CreateAndInsertContent().SetText(value);
      value.dispose();
      const dispose = vi.spyOn(edit, "dispose");
      expect(table.SetEditText(column, row, edit)).toBe(false);
      expect(dispose).toHaveBeenCalledOnce();
      expect(edit.GetParagraphCount()).toBe(0);
      expect(table.GetAllocatedColumnsCount()).toBe(before);
    }
  } finally {
    doc.Dispose();
  }
});
