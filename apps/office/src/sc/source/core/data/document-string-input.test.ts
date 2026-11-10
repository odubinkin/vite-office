/** @fileoverview Source document/table/column SetString, literal policies, shared-group teardown and actual cell-value ownership transfer. */
import { afterEach, assert, expect, it, vi } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScCellValue } from "../../../inc/cellvalue";
import { ScSetStringParam } from "../../../inc/stringutil";
import { CellType } from "../../../inc/global";
import { NoListening } from "../../../inc/types";
import { EndListeningContext } from "../../../inc/listenercontext";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { EditTextObjectImpl, TextRotation } from "../../../../editeng/inc/editobj";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
const documents: ScDocument[] = [];
afterEach(
  /** Releases actual document-owned cells and callbacks. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Actual document with one sheet, released after every scenario. @returns Owner. */
function document(): ScDocument {
  const doc = new ScDocument(),
    name = unicode("Data");
  try {
    doc.InsertTab(0, name);
  } finally {
    name.dispose();
  }
  documents.push(doc);
  return doc;
}
/** Original owned input lifetime around the real document setter. @param doc - Owner. @param value - Input. @param position - Target. @param parameter - Optional original policy. @returns Original format overwrite flag. */
function enter(
  doc: ScDocument,
  value: string,
  position = new ScAddress(),
  parameter: ScSetStringParam | null = null,
): boolean {
  const input = unicode(value);
  try {
    return doc.SetString(position, input, parameter);
  } finally {
    input.dispose();
  }
}
/** Prepared actual edit object observes transfer independently of engine construction. @returns Caller-owned object. */
function edit(): EditTextObjectImpl {
  const object = new EditTextObjectImpl(
      null,
      MapUnit.Map100thMM,
      false,
      TextRotation.NONE,
      SvtScriptType.LATIN,
    ),
    value = unicode("owned rich text");
  try {
    object.CreateAndInsertContent().SetText(value);
  } finally {
    value.dispose();
  }
  return object;
}
it("routes default scalar input through original parsing and literal text through original text policy", /** Real format attributes distinguish the native path from the old raw-string shortcut. @returns Nothing. */ () => {
  const doc = document(),
    position = new ScAddress();
  expect(enter(doc, "12.5%")).toBe(true);
  expect(doc.GetValue(position)).toBe(0.125);
  const literal = unicode("001");
  try {
    doc.SetTextCell(position, literal);
  } finally {
    literal.dispose();
  }
  expect(doc.GetCellType(position)).toBe(CellType.CELLTYPE_STRING);
  const value = doc.GetSharedString(position);
  try {
    expect(text(value.getString())).toBe("001");
  } finally {
    value.dispose();
  }
  const key = doc.GetPattern(position)?.GetNumberFormat(doc.GetFormatTable()) as number;
  expect(doc.GetFormatTable().GetType(key)).toBe(SvNumFormatType.TEXT);
});
it("preserves literal equals/apostrophe defaults and honors an explicit SetTextCell policy", /** The optional source parameter can deliberately select numeric input. @returns Nothing. */ () => {
  const doc = document(),
    formula = unicode("=1+1"),
    apostrophe = unicode("'12"),
    numeric = unicode("17"),
    parameter = new ScSetStringParam();
  try {
    doc.SetTextCell(new ScAddress(), formula);
    doc.SetTextCell(new ScAddress(1, 0, 0), apostrophe);
    expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_STRING);
    const stored = doc.GetSharedString(new ScAddress(1, 0, 0));
    try {
      expect(text(stored.getString())).toBe("'12");
    } finally {
      stored.dispose();
    }
    parameter.setNumericInput();
    doc.SetTextCell(new ScAddress(2, 0, 0), numeric, parameter);
    expect(doc.GetCellType(new ScAddress(2, 0, 0))).toBe(CellType.CELLTYPE_VALUE);
    expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(17);
  } finally {
    numeric.dispose();
    apostrophe.dispose();
    formula.dispose();
  }
});
it("adopts default formulas with real listeners and forwards explicit NoListening to the column", /** Formula ownership and listener mode use actual compiled cells. @returns Nothing. */ () => {
  const doc = document(),
    source = new ScAddress(),
    target = new ScAddress(1, 0, 0);
  doc.SetValue(source, 3);
  enter(doc, "=A1+1", target);
  expect(doc.GetValue(target)).toBe(4);
  expect(doc.GetBroadcaster(source)?.HasListeners()).toBe(true);
  doc.SetValue(source, 7);
  expect(doc.GetValue(target)).toBe(8);
  const column = doc.FetchTable(0)?.CreateColumnIfNotExists(2);
  assert(column);
  const adoption = vi.spyOn(column, "SetFormulaCell"),
    policy = new ScSetStringParam();
  policy.meStartListening = NoListening;
  enter(doc, "=A2+1", new ScAddress(2, 0, 0), policy);
  expect(adoption.mock.calls[0]?.[2]).toBe(NoListening);
  expect(doc.GetBroadcaster(new ScAddress(0, 1, 0))).toBeNull();
  adoption.mockRestore();
});
it("ends only the intersected shared group and records original top/last boundaries", /** The ordinary setter can replace a middle formula while preserving neighboring calculations. @returns Nothing. */ () => {
  const doc = document();
  for (let row = 0; row < 4; row++) {
    doc.SetValue(new ScAddress(1, row, 0), row + 2);
    enter(doc, `=B${row + 1}*2`, new ScAddress(0, row, 0));
  }
  expect(doc.GetFormulaCell(new ScAddress())?.GetSharedLength()).toBe(4);
  const context = new EndListeningContext(doc),
    groups: ScAddress[] = [];
  doc.EndListeningIntersectedGroup(context, new ScAddress(0, 1, 0), groups);
  expect(
    groups.map(
      /** Reports the actual original boundary rows. @param address - Position. @returns Row. */ (
        address,
      ) => address.Row(),
    ),
  ).toEqual([0, 3]);
  enter(doc, "text", new ScAddress(0, 1, 0));
  expect(doc.GetCellType(new ScAddress(0, 1, 0))).toBe(CellType.CELLTYPE_STRING);
  expect(doc.GetFormulaCell(new ScAddress())?.IsShared()).toBe(false);
  expect(doc.GetFormulaCell(new ScAddress(0, 2, 0))?.GetSharedLength()).toBe(2);
  doc.SetValue(new ScAddress(1, 3, 0), 20);
  expect(doc.GetValue(new ScAddress(0, 3, 0))).toBe(40);
});
it("uses content-only empty input without erasing the existing text-attribute alternative", /** Source DeleteContent differs from full Delete and preserves its metadata. @returns Nothing. */ () => {
  const doc = document();
  enter(doc, "text");
  const column = doc.FetchTable(0)?.FetchColumn(0);
  assert(column);
  const before = column["maCellTextAttrs"].get_type(0);
  enter(doc, "");
  expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_NONE);
  expect(column["maCellTextAttrs"].get_type(0)).toBe(before);
  expect(enter(doc, "7", new ScAddress(0, 0, 2))).toBe(false);
  expect(enter(doc, "7", new ScAddress(doc.MaxCol() + 1, 0, 0))).toBe(false);
});
it("transfers the exact edit owner to document and column destinations, then empties the source value", /** Release performs neither Clone nor destruction of the transferred object. @returns Nothing. */ () => {
  const doc = document(),
    source = edit(),
    first = new ScCellValue(source),
    second = new ScCellValue(source),
    owned = first.getEditText(),
    other = second.getEditText();
  assert(owned);
  assert(other);
  const clone = vi.spyOn(owned, "Clone"),
    disposal = vi.spyOn(owned, "dispose");
  first.release(doc, new ScAddress());
  expect(doc.GetRefCellValue(new ScAddress()).getEditText()).toBe(owned);
  expect(first.isEmpty()).toBe(true);
  expect(clone).not.toHaveBeenCalled();
  expect(disposal).not.toHaveBeenCalled();
  const column = doc.FetchTable(0)?.CreateColumnIfNotExists(1);
  assert(column);
  second.release(column, 0);
  expect(column.GetEditText(0)).toBe(other);
  expect(second.isEmpty()).toBe(true);
  first.clear();
  second.clear();
  source.dispose();
  clone.mockRestore();
  disposal.mockRestore();
});
it("keeps newline-bearing shared-string variants as strings during commit and release", /** Source cell-value transport uses SetString with text policy rather than promoting literal data through SetTextCell. @returns Nothing. */ () => {
  const doc = document(),
    input = unicode("A\nB"),
    shared = doc.GetSharedStringPool().intern(input),
    cell = new ScCellValue(shared);
  try {
    cell.commit(doc, new ScAddress());
    expect(cell.getType()).toBe(CellType.CELLTYPE_STRING);
    expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_STRING);
    cell.release(doc, new ScAddress(1, 0, 0));
    expect(cell.isEmpty()).toBe(true);
    expect(doc.GetCellType(new ScAddress(1, 0, 0))).toBe(CellType.CELLTYPE_STRING);
    const result = doc.GetSharedString(new ScAddress(1, 0, 0));
    try {
      expect(text(result.getString())).toBe("A\nB");
    } finally {
      result.dispose();
    }
  } finally {
    cell.clear();
    shared.dispose();
    input.dispose();
  }
});
it("keeps null EDIT release harmless and destroys transferred objects rejected by document/table bounds", /** Source unique_ptr argument destruction occurs even when no destination exists. @returns Nothing. */ () => {
  const doc = document(),
    source = edit(),
    cell = new ScCellValue(source),
    retained = cell.releaseEditText();
  doc.SetValue(new ScAddress(), 9);
  cell.release(doc, new ScAddress());
  expect(doc.GetValue(new ScAddress())).toBe(9);
  expect(cell.isEmpty()).toBe(true);
  retained?.dispose();
  source.dispose();
  for (const position of [new ScAddress(0, 0, 2), new ScAddress(doc.MaxCol() + 1, 0, 0)]) {
    const object = edit(),
      disposed = vi.spyOn(object, "dispose");
    expect(doc.SetEditText(position, object)).toBe(false);
    expect(disposed).toHaveBeenCalledTimes(1);
    disposed.mockRestore();
  }
});
