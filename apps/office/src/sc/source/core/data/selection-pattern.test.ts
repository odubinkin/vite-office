/** @fileoverview Native document/table/column attribute selection merges,real defaults and compressed-run semantics. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScMarkData } from "../../../inc/markdata";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
import { ScAttrArray, ScMergePatternState } from "../../../inc/attarray";
import { SvxFontHeightItem as Height } from "../../../../editeng/inc/fhgtitem";
import { SfxItemSet, SfxItemState as State } from "../../../../svl/inc/itemset";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { InsertDeleteFlags } from "../../../inc/global";
/** Creates two actual sheet owners. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument();
  for (const name of ["One", "Two"]) {
    const value = unicode(name);
    doc.InsertTab(doc.GetTableCount(), value);
    value.dispose();
  }
  return doc;
}
/** Applies a real font-height delta. @param doc - Owner. @param col - Column. @param row - Row. @param height - Twips. @param tab - Sheet. @returns Nothing. */
function apply(doc: ScDocument, col: number, row: number, height: number, tab = 0): void {
  const delta = new ScPatternAttr(doc.getCellAttributeHelper());
  delta.ItemSetPut(new Height(height, 100, 101));
  doc.ApplyPatternAreaTab(col, row, col, row, tab, delta);
  delta.Dispose();
}

it("merges actual default,explicit and mixed values across sparse columns and grouped sheets", /** Full-axis marks traverse compressed runs without allocating cells or columns. @returns Nothing. */ () => {
  const doc = document(),
    marks = new ScMarkData(doc.GetSheetLimits());
  marks.SelectTable(0, true);
  try {
    const empty = doc.CreateSelectionPattern(marks);
    expect(empty.GetItemSet().Count()).toBe(0);
    empty.Dispose();
    marks.SetMarkArea(new ScRange(0, 0, 0, doc.MaxCol(), doc.MaxRow(), 0));
    expect(doc.GetSelectionPattern(marks).GetItemSet().GetItemState(101, false)).toBe(
      State.DEFAULT,
    );
    expect(
      (
        doc.FetchTable(0) as NonNullable<ReturnType<ScDocument["FetchTable"]>>
      ).GetAllocatedColumnsCount(),
    ).toBe(1);
    apply(doc, 0, 0, 240);
    marks.SetMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    const uniform = doc.CreateSelectionPattern(marks);
    expect((uniform.GetItem(101) as Height).GetHeight()).toBe(240);
    expect(uniform.GetPAKey()).toBe((doc.GetPattern(new ScAddress()) as ScPatternAttr).GetPAKey());
    uniform.Dispose();
    marks.SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
    expect(doc.GetSelectionPattern(marks).GetItemSet().GetItemState(101, false)).toBe(
      State.INVALID,
    );
    apply(doc, 1, 0, 240);
    expect((doc.GetSelectionPattern(marks).GetItem(101) as Height).GetHeight()).toBe(240);
    apply(doc, 1, 0, 260);
    expect(doc.GetSelectionPattern(marks).GetItemSet().GetItemState(101, false)).toBe(
      State.INVALID,
    );
    marks.SetMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    marks.SelectTable(1, true);
    expect(doc.GetSelectionPattern(marks).GetItemSet().GetItemState(101, false)).toBe(
      State.INVALID,
    );
    apply(doc, 0, 0, 240, 1);
    expect((doc.GetSelectionPattern(marks).GetItem(101) as Height).GetHeight()).toBe(240);
    marks.SelectTable(9, true);
    expect((doc.GetSelectionPattern(marks).GetItem(101) as Height).GetHeight()).toBe(240);
  } finally {
    doc.DisposeAttributes();
  }
});

it("uses original multi-mark row and column spans without allocating unselected columns", /** Disjoint selections preserve untouched gaps and source pattern-id invalidation. @returns Nothing. */ () => {
  const doc = document(),
    marks = new ScMarkData(doc.GetSheetLimits());
  marks.SelectTable(0, true);
  try {
    apply(doc, 0, 0, 240);
    apply(doc, 1, 3, 240);
    apply(doc, 1, 2, 300);
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    marks.SetMultiMarkArea(new ScRange(1, 3, 0, 1, 3, 0));
    expect((doc.GetSelectionPattern(marks).GetItem(101) as Height).GetHeight()).toBe(240);
    marks.SetMultiMarkArea(new ScRange(1, 2, 0, 1, 2, 0));
    expect(doc.GetSelectionPattern(marks).GetItemSet().GetItemState(101, false)).toBe(
      State.INVALID,
    );
    marks.SelectTable(9, true);
    expect(doc.GetSelectionPattern(marks).GetItemSet().GetItemState(101, false)).toBe(
      State.INVALID,
    );
    const state = new ScMergePatternState();
    (doc.FetchTable(0) as NonNullable<ReturnType<ScDocument["FetchTable"]>>)
      .CreateColumnIfNotExists(3)
      .MergeSelectionPattern(state, marks, true);
    expect(state.pItemSet).toBeUndefined();
    state.Dispose();
    const none = new ScMarkData(doc.GetSheetLimits());
    const again = new ScMergePatternState();
    (doc.FetchTable(0) as NonNullable<ReturnType<ScDocument["FetchTable"]>>)
      .CreateColumnIfNotExists(0)
      .MergeSelectionPattern(again, none, true);
    expect(again.pItemSet).toBeUndefined();
    again.Dispose();
  } finally {
    doc.DisposeAttributes();
  }
});

it("retains upstream multi-selection omission of unallocated default-column attributes", /** The native multi path lacks the default-column merge used by its simple range path. @returns Nothing. */ () => {
  const doc = document(),
    marks = new ScMarkData(doc.GetSheetLimits());
  marks.SelectTable(0, true);
  try {
    apply(doc, 0, 0, 240);
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    marks.SetMultiMarkArea(new ScRange(2, 0, 0, 2, 0, 0));
    expect((doc.GetSelectionPattern(marks).GetItem(101) as Height).GetHeight()).toBe(240);
    marks.ResetMark();
    marks.SelectTable(0, true);
    marks.SetMarkArea(new ScRange(0, 0, 0, 2, 0, 0));
    expect(doc.GetSelectionPattern(marks).GetItemSet().GetItemState(101, false)).toBe(
      State.INVALID,
    );
  } finally {
    doc.DisposeAttributes();
  }
});

it("retains native deep inherited versus shallow direct merge semantics", /** A real parent set participates only in the deep selection mode. @returns Nothing. */ () => {
  const doc = document(),
    array = new ScAttrArray(0, 0, doc),
    parent = new SfxItemSet(doc.GetPool()),
    pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  parent.Put(new Height(340, 100, 101));
  pattern.GetItemSetWritable().SetParent(parent);
  const holder = new CellAttributeHolder(pattern, true);
  array.SetPatternArea(0, 0, holder);
  holder.Dispose();
  try {
    for (const deep of [false, true]) {
      const state = new ScMergePatternState();
      array.MergePatternArea(0, 0, state, deep);
      expect(state.pItemSet?.GetItemState(101, false)).toBe(deep ? State.SET : State.DEFAULT);
      array.MergePatternArea(1, 1, state, deep);
      expect(state.pItemSet?.GetItemState(101, false)).toBe(deep ? State.INVALID : State.DEFAULT);
      state.Dispose();
    }
    const state = new ScMergePatternState();
    array.MergePatternArea(1, 1, state, true);
    array.MergePatternArea(0, 0, state, true);
    expect(state.pItemSet?.GetItemState(101, false)).toBe(State.INVALID);
    state.Dispose();
    const invalid = new ScMergePatternState();
    array.MergePatternArea(-1, 0, invalid, true);
    array.MergePatternArea(0, doc.MaxRow() + 1, invalid, true);
    expect(invalid.pItemSet).toBeUndefined();
    invalid.Dispose();
  } finally {
    array.Dispose();
    doc.DisposeAttributes();
  }
});

it("preserves explicit defaults,invalid accumulators and the native partial-run search guard", /** A partial ordered vector is valid input to upstream SetAttrEntries even though that importer boundary is not exposed here. @returns Nothing. */ () => {
  const doc = document(),
    array = new ScAttrArray(0, 0, doc),
    state = new ScMergePatternState();
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  pattern.ItemSetPut(new Height(200, 100, 101));
  const holder = new CellAttributeHolder(pattern, true);
  array.SetPatternArea(0, 0, holder);
  holder.Dispose();
  try {
    array.MergePatternArea(0, 1, state, true);
    expect(state.pItemSet?.GetItemState(101, false)).toBe(State.SET);
    const second = new ScPatternAttr(doc.getCellAttributeHelper());
    second.ItemSetPut(new Height(240, 100, 101));
    const held = new CellAttributeHolder(second, true);
    array.SetPatternArea(2, 2, held);
    held.Dispose();
    array.MergePatternArea(2, 2, state, true);
    expect(state.pItemSet?.GetItemState(101, false)).toBe(State.INVALID);
    array.MergePatternArea(0, 0, state, true);
    expect(state.pItemSet?.GetItemState(101, false)).toBe(State.INVALID);
    const entries = Reflect.get(array, "mvData") as { nEndRow: number }[];
    for (const [index, entry] of entries.entries()) entry.nEndRow = index;
    const missing = new ScMergePatternState();
    array.MergePatternArea(10, 10, missing, true);
    expect(missing.pItemSet).toBeUndefined();
    missing.Dispose();
  } finally {
    state.Dispose();
    array.Dispose();
    doc.DisposeAttributes();
  }
});

it("copies only actual clipped multi-mark spans and ignores empty attribute deltas", /** Real undo-document copies leave unselected and clipped cells untouched. @returns Nothing. */ () => {
  const source = document(),
    target = document(),
    marks = new ScMarkData(source.GetSheetLimits()),
    delta = new ScPatternAttr(source.getCellAttributeHelper());
  marks.SelectTable(0, true);
  marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
  marks.SetMultiMarkArea(new ScRange(2, 0, 0, 2, 0, 0));
  try {
    apply(source, 0, 0, 240);
    apply(source, 1, 0, 300);
    apply(source, 2, 0, 280);
    source.CopyToDocument(
      new ScRange(0, 0, 0, 2, 0, 1),
      InsertDeleteFlags.ATTRIB,
      true,
      target,
      marks,
    );
    expect(
      [0, 1, 2].map(
        /** Reads the actual copied pattern. @param col - Column. @returns Height. */ (col) =>
          (
            (target.GetPattern(new ScAddress(col, 0, 0)) as ScPatternAttr).GetItem(101) as Height
          ).GetHeight(),
      ),
    ).toEqual([240, 200, 280]);
    for (const range of [new ScRange(1, 0, 0, 1, 0, 0), new ScRange(0, 1, 0, 0, 2, 0)])
      source.CopyToDocument(range, InsertDeleteFlags.ATTRIB, true, target, marks);
    expect(
      target.ApplySelectionPattern(new ScPatternAttr(target.getCellAttributeHelper()), marks),
    ).toBe(false);
    delta.ItemSetPut(new Height(400, 100, 101));
    const absent = new ScMarkData(source.GetSheetLimits());
    absent.SelectTable(9, true);
    expect(source.ApplySelectionPattern(delta, absent)).toBe(false);
  } finally {
    delta.Dispose();
    source.DisposeAttributes();
    target.DisposeAttributes();
  }
});

it("clips native data bounds without growing ranges or counting formatting as content", /** Real sparse blocks cover empty,edge and partially clipped failure outputs. @returns Nothing. */ () => {
  const doc = document(),
    firstCol: [number] = [0],
    firstRow: [number] = [0],
    lastCol: [number] = [doc.MaxCol()],
    lastRow: [number] = [doc.MaxRow()];
  try {
    expect(doc.ShrinkToDataArea(99, firstCol, firstRow, lastCol, lastRow)).toBe(false);
    expect(doc.ShrinkToDataArea(0, firstCol, firstRow, lastCol, lastRow)).toBe(false);
    apply(doc, 4, 6, 280);
    expect(
      (doc.FetchTable(0) as NonNullable<ReturnType<ScDocument["FetchTable"]>>)
        .CreateColumnIfNotExists(0)
        .GetFirstDataPos(),
    ).toBe(0);
    expect(doc.ShrinkToDataArea(0, firstCol, firstRow, lastCol, lastRow)).toBe(false);
    doc.SetValue(new ScAddress(2, 3, 0), 1);
    doc.SetValue(new ScAddress(3, 7, 0), 2);
    expect(doc.ShrinkToDataArea(0, firstCol, firstRow, lastCol, lastRow)).toBe(true);
    expect([firstCol[0], firstRow[0], lastCol[0], lastRow[0]]).toEqual([2, 3, 3, 7]);
    expect(doc.ShrinkToDataArea(0, [2], [4], [2], [6])).toBe(true);
    const outsideCol: [number] = [8],
      outsideRow: [number] = [9],
      endCol: [number] = [9],
      endRow: [number] = [10];
    expect(doc.ShrinkToDataArea(0, outsideCol, outsideRow, endCol, endRow)).toBe(false);
    expect([outsideCol[0], outsideRow[0], endCol[0], endRow[0]]).toEqual([8, 9, 3, 7]);
    expect(doc.ShrinkToDataArea(0, [2], [8], [3], [9])).toBe(false);
    doc.SetValue(new ScAddress(0, 0, 0), 3);
    doc.SetValue(new ScAddress(1, doc.MaxRow(), 0), 4);
    const col: [number] = [0],
      row: [number] = [0];
    (doc.FetchTable(0) as NonNullable<ReturnType<ScDocument["FetchTable"]>>).GetFirstDataPos(
      col,
      row,
    );
    expect([col[0], row[0]]).toEqual([0, 0]);
    (doc.FetchTable(0) as NonNullable<ReturnType<ScDocument["FetchTable"]>>).GetLastDataPos(
      col,
      row,
    );
    expect([col[0], row[0]]).toEqual([3, doc.MaxRow()]);
  } finally {
    doc.DisposeAttributes();
  }
});
