/** @fileoverview Native general clipboard column/table copying through actual typed storage and shared formula/metadata owners. */
import { expect, it } from "vitest";
import { BreakIteratorImpl } from "../../../../i18npool/source/breakiterator/breakiteratorImpl";
import { ScRangeList } from "../../../inc/rangelst";
import { BroadcastAction } from "./documen7";
import { ScMarkData } from "../../../inc/markdata";
import { ColumnSpanSet } from "../../../inc/columnspanset";
import { SfxHintId } from "../../../../svl/inc/hint";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScColumn } from "../../../inc/column";
import type { ScTable } from "../../../inc/table";
import { ScFormulaCell, ScMatrixMode } from "../../../inc/formulacell";
import { CopyFromClipContext } from "../../../inc/clipcontext";
import { ColumnBlockPosition } from "../../../inc/mtvelements";
import { CellType, InsertDeleteFlags } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { CopyCellsFromClipHandler, CopyTextAttrsFromClipHandler } from "./column3";
import { ParseBlock } from "../../../inc/mtvfunctions";
import { readOdsDocument, writeOdsDocument } from "../../filter/xml/xmlwrap";
/** Creates the actual admitted native clipboard operation context. @param doc - Destination. @param clip - Clipboard. @returns Context. */
function context(doc: ScDocument, clip: ScDocument): CopyFromClipContext {
  return new CopyFromClipContext(doc, null, clip, InsertDeleteFlags.CONTENTS, false, false);
}
const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
it("copies sparse source-tab content and original text metadata while preserving destination geometry and patterns", /** Sparse source indexes remain genuine clipboard slots. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  for (let tab = 0; tab < 3; ++tab) doc.InsertTab(tab, unicode(`Sheet${tab}`));
  clip.ResetClip(doc, 2);
  clip.SetClipArea(new ScRange(0, 0, 2, 1, 3, 2));
  clip.SetValue(new ScAddress(0, 0, 2), 17);
  clip.SetTextCell(new ScAddress(0, 1, 2), unicode("原文😀"));
  for (let row = 2; row <= 3; ++row)
    clip.SetFormulaCell(
      new ScAddress(0, row, 2),
      new ScFormulaCell(doc, new ScAddress(0, row, 2), unicode(`=B${row + 1}+$B$1`), grammar),
    );
  const source = clip.FetchTable(2) as ScTable,
    destination = doc.FetchTable(0) as ScTable,
    sourceColumn = source.CreateColumnIfNotExists(0),
    attr = sourceColumn.GetCellTextAttr(1);
  expect(attr).not.toBeNull();
  if (!attr) throw new Error("Source text must own native metadata");
  attr.mnTextWidth = 1234;
  attr.mnScriptType = SvtScriptType.LATIN;
  doc.SetColWidth(3, 0, 2400);
  const before = destination.CreateColumnIfNotExists(3).GetPattern(4),
    operation = context(doc, clip);
  doc.SetInsertingFromOtherDoc(true);
  try {
    destination.CopyFromClip(operation, 3, 4, 4, 7, 3, 4, source);
  } finally {
    doc.SetInsertingFromOtherDoc(false);
  }
  expect(doc.GetValue(new ScAddress(3, 4, 0))).toBe(17);
  const stored = doc.GetSharedString(new ScAddress(3, 5, 0));
  expect(text(stored.getString())).toBe("原文😀");
  stored.dispose();
  const target = destination.CreateColumnIfNotExists(3),
    copied = target.GetCellTextAttr(5);
  expect(copied).not.toBe(attr);
  expect(copied?.mnTextWidth).toBe(1234);
  expect(copied?.mnScriptType).toBe(SvtScriptType.LATIN);
  expect(target.GetPattern(4)).toBe(before);
  expect(doc.GetColWidth(3, 0)).toBe(2400);
  expect(target.GetFormulaCell(6)?.GetSharedLength()).toBe(2);
  const formula = target.GetFormulaCell(6) as ScFormulaCell;
  expect(text(formula.GetFormula(grammar))).toBe("=E7+$B$1");
  operation.setListeningFormulaSpans(0, 3, 4, 4, 7);
  operation.startListeningFormulas();
  doc.SetValue(new ScAddress(1, 0, 0), 2);
  doc.SetValue(new ScAddress(4, 6, 0), 7);
  formula.SetDirty();
  expect(formula.GetValue()).toBe(9);
  doc.SetValue(new ScAddress(4, 7, 0), 11);
  expect(doc.GetValue(new ScAddress(3, 7, 0))).toBe(13);
  const sparseMarks = new ScMarkData(doc.GetSheetLimits());
  sparseMarks.SelectTable(0, true);
  sparseMarks.SelectTable(2, true);
  clip.SetDirtyFromClip(0, 0, 0, 0, sparseMarks, InsertDeleteFlags.CONTENTS, new ColumnSpanSet());
  operation.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("re-interns actual foreign-pool strings and leaves empty source positions untouched until pre-deletion", /** General copy preserves the original content/metadata two-pass separation. @returns Nothing. */ () => {
  const sourceDoc = new ScDocument(),
    dest = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  sourceDoc.InsertTab(0, unicode("Source"));
  dest.InsertTab(0, unicode("Dest"));
  clip.ResetClip(sourceDoc, 0);
  clip.SetClipArea(new ScRange(0, 0, 0, 0, 2, 0));
  clip.SetTextCell(new ScAddress(0, 1, 0), unicode("foreign"));
  dest.SetValue(new ScAddress(0, 0, 0), 99);
  const operation = context(dest, clip),
    source = clip.FetchTable(0) as ScTable,
    target = dest.FetchTable(0) as ScTable;
  target.CopyFromClip(operation, 0, 0, 0, 2, 0, 0, source);
  expect(dest.GetValue(new ScAddress())).toBe(99);
  const stored = dest.GetSharedString(new ScAddress(0, 1, 0)),
    interned = dest.GetSharedStringPool().intern(unicode("foreign"));
  expect(stored.getData()).toBe(interned.getData());
  stored.dispose();
  interned.dispose();
  target.CopyFromClip(operation, -1, 0, 0, 2, 0, 0, source);
  target.CopyFromClip(operation, 0, -1, 0, 2, 0, 0, source);
  operation.Dispose();
  clip.Dispose();
  sourceDoc.Dispose();
  dest.Dispose();
});
it("retains actual hinted setter broadcast controls,invalid-row behavior and formula owner return contracts", /** Writes reach existing subscriptions and native formula groups. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0),
    block = new ColumnBlockPosition();
  column.InitBlockPosition(block);
  doc.SetFormula(new ScAddress(1, 0, 0), unicode("=A1+1"), grammar);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(1);
  column.SetValue(block, 0, 10, false);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(1);
  column.SetValue(block, 0, 11);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(12);
  const shared = doc.GetSharedStringPool().intern(unicode("text"));
  column.SetRawString(block, 0, shared, false);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(12);
  column.SetRawString(block, 0, shared);
  expect(doc.GetFormulaCell(new ScAddress(1, 0, 0))?.GetDirty()).toBe(true);
  column.SetValue(block, -1, 4);
  column.SetRawString(block, -1, shared);
  shared.dispose();
  const rejected = new ScFormulaCell(doc, new ScAddress(0, 1, 0), unicode("=1"), grammar);
  expect(column.SetFormulaCell(block, -1, rejected)).toBeUndefined();
  rejected.Dispose();
  const formula = new ScFormulaCell(doc, new ScAddress(0, 1, 0), unicode("=2"), grammar);
  expect(column.SetFormulaCell(block, 1, formula)).toBeUndefined();
  expect(doc.GetValue(new ScAddress(0, 1, 0))).toBe(2);
  expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_STRING);
  doc.Dispose();
});
it("retains original handler fallback cursors for genuine unadopted destination columns", /** Public source functors accept real owners without a destination sheet. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    sourceDoc = new ScDocument();
  sourceDoc.InsertTab(0, unicode("Source"));
  const source = (sourceDoc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0),
    destination = new ScColumn(doc),
    operation = context(doc, clip);
  source.SetValue(0, 3);
  destination.CopyFromClip(operation, 0, 0, 0, source);
  expect(destination.IsEmptyData()).toBe(true);
  const cellOperation = context(doc, clip),
    attrOperation = context(doc, clip);
  const cells = new CopyCellsFromClipHandler(cellOperation, source, destination, 0, 0, 0, null),
    attrs = new CopyTextAttrsFromClipHandler(
      attrOperation,
      destination.GetCellAttrStore(),
      destination,
      0,
      0,
      0,
    );
  ParseBlock(source.GetCellStore().cbegin(), source.GetCellStore(), cells, 0, 1);
  ParseBlock(source.GetCellAttrStore().cbegin(), source.GetCellAttrStore(), attrs, 0, 1);
  cells.Dispose();
  attrs.Dispose();
  cellOperation.Dispose();
  attrOperation.Dispose();
  expect(destination.GetValue(0)).toBe(3);
  destination.DisposeAttributes();
  operation.Dispose();
  clip.Dispose();
  sourceDoc.Dispose();
  doc.Dispose();
});
it("rejects actual matrix metadata at the admitted scalar clipboard boundary", /** The native precompiled constructor supplies represented matrix metadata without private edits. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  const scalar = new ScFormulaCell(doc, new ScAddress(), unicode("=1"), grammar);
  clip.SetFormulaCell(
    new ScAddress(),
    new ScFormulaCell(
      doc,
      new ScAddress(),
      scalar.GetCode().Clone(),
      grammar,
      ScMatrixMode.Reference,
    ),
  );
  scalar.Dispose();
  const operation = context(doc, clip),
    source = clip.FetchTable(0) as ScTable;
  expect(
    /** Invokes the actual scalar admission boundary. @returns Nothing. */ () =>
      (doc.FetchTable(0) as ScTable).CopyFromClip(operation, 0, 0, 0, 0, 0, 0, source),
  ).toThrow("Matrix clipboard copying");
  operation.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("reopens actual ODS bytes after general compiled formula copying", /** Fresh import creates independent native document/group/listener owners. @returns Nothing. */ async () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetFormulaCell(
    new ScAddress(),
    new ScFormulaCell(doc, new ScAddress(), unicode("=B1+$B$1"), grammar),
  );
  const operation = context(doc, clip);
  doc.SetInsertingFromOtherDoc(true);
  (doc.FetchTable(0) as ScTable).CopyFromClip(
    operation,
    2,
    2,
    2,
    2,
    2,
    2,
    clip.FetchTable(0) as ScTable,
  );
  doc.SetInsertingFromOtherDoc(false);
  operation.setListeningFormulaSpans(0, 2, 2, 2, 2);
  operation.startListeningFormulas();
  doc.SetValue(new ScAddress(1, 0, 0), 2);
  doc.SetValue(new ScAddress(3, 2, 0), 7);
  doc.GetFormulaCell(new ScAddress(2, 2, 0))?.SetDirty();
  const reopened = await readOdsDocument(writeOdsDocument(doc));
  expect(reopened.GetValue(new ScAddress(2, 2, 0))).toBe(9);
  reopened.SetValue(new ScAddress(3, 2, 0), 20);
  expect(reopened.GetValue(new ScAddress(2, 2, 0))).toBe(22);
  reopened.Dispose();
  operation.Dispose();
  clip.Dispose();
  doc.Dispose();
});

it("completes native pre-delete,copy,listening,dirty and deferred broadcast phases without reusing old cached formula results", /** Actual owners notify an existing area-dependent formula after insertion is complete. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange(0, 0, 0, 0, 1, 0));
  doc.SetValue(new ScAddress(2, 4, 0), 1);
  doc.SetValue(new ScAddress(3, 5, 0), 7);
  doc.SetFormula(new ScAddress(5, 0, 0), unicode("=SUM(C5:C6)"), grammar);
  expect(doc.GetValue(new ScAddress(5, 0, 0))).toBe(1);
  clip.SetValue(new ScAddress(), 13);
  const sourceFormula = new ScFormulaCell(doc, new ScAddress(0, 1, 0), unicode("=B2+1"), grammar);
  expect(sourceFormula.GetValue()).toBe(1);
  clip.SetFormulaCell(new ScAddress(0, 1, 0), sourceFormula);
  const operation = context(doc, clip),
    marks = new ScMarkData(doc.GetSheetLimits()),
    spans = new ColumnSpanSet(),
    table = doc.FetchTable(0) as ScTable;
  marks.SelectTable(0, true);
  marks.SelectTable(8, true);
  operation.setTabRange(0, 0);
  operation.setDestRange(2, 4, 2, 5);
  operation.setDeleteFlag(InsertDeleteFlags.CONTENTS);
  doc.SetAutoCalc(false);
  doc.SetInsertingFromOtherDoc(true);
  doc.DeleteBeforeCopyFromClip(operation, marks, spans);
  table.CopyFromClip(operation, 2, 4, 2, 5, 2, 4, clip.FetchTable(0) as ScTable);
  doc.SetInsertingFromOtherDoc(false);
  operation.setListeningFormulaSpans(0, 2, 4, 2, 5);
  operation.startListeningFormulas();
  const target = doc.GetFormulaCell(new ScAddress(2, 5, 0)) as ScFormulaCell;
  expect(target.GetDirty()).toBe(false);
  doc.SetDirtyFromClip(2, 4, 2, 5, marks, InsertDeleteFlags.NONE, spans);
  expect(target.GetDirty()).toBe(false);
  doc.SetDirtyFromClip(2, 4, 2, 5, marks, InsertDeleteFlags.CONTENTS, spans);
  expect(target.GetDirty()).toBe(true);
  doc.SetDirtyFromClip(2, 4, 2, 7, marks, InsertDeleteFlags.CONTENTS, spans);
  spans.executeColumnAction(doc, new BroadcastAction(doc));
  doc.SetAutoCalc(true);
  expect(doc.GetValue(new ScAddress(2, 5, 0))).toBe(8);
  expect(doc.GetValue(new ScAddress(5, 0, 0))).toBe(21);
  doc.SetValue(new ScAddress(3, 5, 0), 20);
  expect(doc.GetValue(new ScAddress(5, 0, 0))).toBe(34);
  const allocated = table.GetAllocatedColumnsCount();
  table.SetDirtyFromClip(-1, 0, 0, 0, spans);
  table.SetDirtyFromClip(0, 0, 0, -1, spans);
  expect(table.GetAllocatedColumnsCount()).toBe(allocated);
  operation.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("preserves rectangular individual-versus-area broadcast controls and native hard-recalc/clipboard early returns", /** Suppressed scalar writes isolate the actual bulk broadcast phase. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  doc.SetValue(new ScAddress(), 2);
  doc.SetFormula(new ScAddress(1, 0, 0), unicode("=A1"), grammar);
  doc.SetFormula(new ScAddress(2, 0, 0), unicode("=SUM(A1:A2)"), grammar);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(2);
  expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(2);
  const column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0),
    block = new ColumnBlockPosition();
  column.InitBlockPosition(block);
  column.SetValue(block, 0, 9, false);
  doc.BroadcastCells(new ScRange(0, 0, 0, 0, 1, 2), SfxHintId.ScDataChanged, false);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(2);
  expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(9);
  doc.BroadcastCells(new ScRange(0, 0, 0, 0, 1, 2), SfxHintId.ScDataChanged);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(9);
  doc.SetHardRecalcState(ScDocument.HardRecalcState.TEMPORARY);
  column.SetValue(block, 0, 18, false);
  doc.BroadcastCells(new ScRange(), SfxHintId.ScDataChanged);
  doc.SetHardRecalcState(ScDocument.HardRecalcState.OFF);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(9);
  doc.BroadcastCells(new ScRange(0, 100, 0, 0, 101, 0), SfxHintId.ScDataChanged);
  clip.BroadcastCells(new ScRange(), SfxHintId.ScDataChanged);
  const action = new BroadcastAction(doc);
  action.execute(0, 1, false);
  expect(
    /** Calls the original genuine initialization precondition. @returns Nothing. */ () =>
      action.execute(0, 1, true),
  ).toThrow("initialized column");
  clip.Dispose();
  doc.Dispose();
});

it("orchestrates real default-content range paste,subscriptions,recalculation and fresh ODS reopen", /** One source row repeats through actual document preparation and native final notification phases. @returns Completion. */ async () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  doc.SetValue(new ScAddress(), 3);
  doc.SetFormula(new ScAddress(1, 0, 0), unicode("=A1+1"), grammar);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(4);
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange(0, 0, 0, 1, 0, 0));
  doc.CopyToDocument(new ScRange(0, 0, 0, 1, 0, 0), InsertDeleteFlags.CONTENTS, false, clip);
  clip.GetBreakIterator(
    /** Binds the genuine native script service. @returns Service. */ () => new BreakIteratorImpl(),
  );
  const marks = new ScMarkData(doc.GetSheetLimits());
  marks.SelectTable(0, true);
  doc.SetFormula(new ScAddress(3, 3, 0), unicode("=$A$1+100"), grammar);
  doc.CopyFromClip(new ScRange(2, 3, 0, 5, 5, 0), marks, InsertDeleteFlags.CONTENTS, null, clip);
  expect(doc.GetAutoCalc()).toBe(true);
  expect(doc.IsInsertingFromOtherDoc()).toBe(false);
  expect(doc.GetFormatExchangeList()).toBeNull();
  expect(doc.GetValue(new ScAddress(3, 3, 0))).toBe(4);
  expect(doc.GetValue(new ScAddress(5, 5, 0))).toBe(4);
  doc.SetValue(new ScAddress(4, 5, 0), 20);
  expect(doc.GetValue(new ScAddress(5, 5, 0))).toBe(21);
  const reopened = await readOdsDocument(writeOdsDocument(doc));
  reopened.SetValue(new ScAddress(4, 5, 0), 40);
  expect(reopened.GetValue(new ScAddress(5, 5, 0))).toBe(41);
  reopened.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("tiles generic filtered source rows across multiple real destination ranges", /** Native source-row cursors reset for each column chunk and continue between destination ranges. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange(0, 0, 0, 1, 2, 0));
  for (let row = 0; row < 3; ++row) {
    clip.SetValue(new ScAddress(0, row, 0), [3, 7, 11][row] as number);
    clip.SetTextCell(new ScAddress(1, row, 0), unicode(["a", "b", "c"][row] as string));
  }
  clip.SetRowFiltered(1, 1, 0, true);
  const marks = new ScMarkData(doc.GetSheetLimits());
  marks.SelectTable(0, true);
  const ranges = new ScRangeList();
  ranges.push_back(new ScRange(4, 5, 0, 7, 6, 0));
  ranges.push_back(new ScRange(4, 10, 0, 7, 11, 0));
  doc.SetAutoCalc(false);
  doc.CopyFromClip(
    new ScRange(4, 5, 0, 7, 11, 0),
    marks,
    InsertDeleteFlags.CONTENTS,
    null,
    clip,
    false,
    false,
    false,
    false,
    ranges,
  );
  expect(doc.GetAutoCalc()).toBe(false);
  for (const row of [5, 6, 10, 11]) {
    expect(doc.GetValue(new ScAddress(4, row, 0))).toBe(row === 5 || row === 10 ? 3 : 11);
    expect(doc.GetValue(new ScAddress(6, row, 0))).toBe(row === 5 || row === 10 ? 3 : 11);
  }
  expect(doc.GetCellType(new ScAddress(4, 8, 0))).toBe(CellType.CELLTYPE_NONE);
  clip.Dispose();
  doc.Dispose();
});
it("preserves native clipboard no-op guards and explicit unported admission boundaries", /** Scoped auto-calc/formatter state is restored even when an unavailable service rejects. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    foreign = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  foreign.InsertTab(0, unicode("Other"));
  const marks = new ScMarkData(doc.GetSheetLimits());
  marks.SelectTable(0, true);
  const range = new ScRange();
  clip.CopyFromClip(range, marks, InsertDeleteFlags.CONTENTS, null, null);
  doc.CopyFromClip(range, marks, InsertDeleteFlags.CONTENTS, null, clip);
  doc.CopyFromClip(range, marks, InsertDeleteFlags.CONTENTS, null, foreign);
  expect(
    /** Native global clipboard dependency is not replaced with another document. @returns Nothing. */ () =>
      doc.CopyFromClip(range, marks, InsertDeleteFlags.CONTENTS, null, null),
  ).toThrow("Global clipboard");
  clip.ResetClip(foreign, 0);
  clip.SetClipArea(range);
  clip.SetValue(new ScAddress(), 7);
  expect(
    /** Real distinct formatters require the actual unported merge implementation. @returns Nothing. */ () =>
      doc.CopyFromClip(range, marks, InsertDeleteFlags.CONTENTS, null, clip),
  ).toThrow("Foreign number-formatter");
  expect(doc.GetAutoCalc()).toBe(true);
  clip.ResetClip(doc, 0);
  clip.SetClipArea(range);
  clip.SetValue(new ScAddress(), 8);
  for (const flags of [
    InsertDeleteFlags.NOTE | InsertDeleteFlags.ADDNOTES,
    InsertDeleteFlags.ATTRIB,
  ])
    expect(
      /** Nondefault contexts retain their real admission boundary. @returns Nothing. */ () =>
        doc.CopyFromClip(range, marks, flags, null, clip),
    ).toThrow("Nondefault clipboard");
  clip.SetClipArea(range, true);
  expect(
    /** Same-document cut reference movement remains explicit. @returns Nothing. */ () =>
      doc.CopyFromClip(range, marks, InsertDeleteFlags.CONTENTS, null, clip),
  ).toThrow("Same-document cut");
  expect(doc.GetAutoCalc()).toBe(true);
  expect(doc.IsInsertingFromOtherDoc()).toBe(false);
  expect(doc.GetFormatExchangeList()).toBeNull();
  clip.Dispose();
  foreign.Dispose();
  doc.Dispose();
});

it.each([true, false])(
  "preserves upstream fast-path sheet/filter behavior with includeFiltered=%s",
  /** The original fast path traverses the entire selected-sheet envelope and does not consult source row filters. @param filtered - Native include-filtered control. @returns Nothing. */ (
    filtered,
  ) => {
    const doc = new ScDocument(),
      clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
    for (let tab = 0; tab < 3; ++tab) doc.InsertTab(tab, unicode(`Sheet${tab}`));
    clip.ResetClip(doc, 0);
    clip.SetClipArea(new ScRange());
    clip.SetValue(new ScAddress(), 37);
    clip.SetRowFiltered(0, 0, 0, true);
    doc.SetValue(new ScAddress(2, 2, 1), 9);
    const marks = new ScMarkData(doc.GetSheetLimits());
    marks.SelectTable(0, true);
    marks.SelectTable(2, true);
    doc.CopyFromClip(
      new ScRange(2, 2, 0, 2, 2, 2),
      marks,
      InsertDeleteFlags.CONTENTS,
      null,
      clip,
      true,
      false,
      filtered,
    );
    expect(doc.GetValue(new ScAddress(2, 2, 0))).toBe(37);
    expect(doc.GetValue(new ScAddress(2, 2, 1))).toBe(37);
    expect(doc.GetValue(new ScAddress(2, 2, 2))).toBe(37);
    clip.Dispose();
    doc.Dispose();
  },
);
it("uses native populated selected-sheet ranges and keeps an empty selection envelope inert", /** Sparse Undo sheets and absent selected tabs are actual native vector slots. @returns Nothing. */ () => {
  const source = new ScDocument(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  for (let tab = 0; tab < 3; ++tab) source.InsertTab(tab, unicode(`Sheet${tab}`));
  const selected = new ScMarkData(source.GetSheetLimits());
  selected.SelectTable(0, true);
  selected.SelectTable(2, true);
  undo.InitUndoSelected(source, selected);
  clip.ResetClip(source, 0);
  clip.SetClipArea(new ScRange(0, 0, 0, 0, 1, 0));
  clip.SetValue(new ScAddress(), 5);
  clip.SetValue(new ScAddress(0, 1, 0), 6);
  const marks = new ScMarkData(source.GetSheetLimits());
  for (const tab of [0, 1, 2, 4]) marks.SelectTable(tab, true);
  undo.CopyFromClip(new ScRange(2, 2, 0, 2, 3, 2), marks, InsertDeleteFlags.CONTENTS, null, clip);
  expect(undo.FetchTable(1)).toBeNull();
  expect(undo.GetValue(new ScAddress(2, 2, 2))).toBe(5);
  const absent = new ScMarkData(source.GetSheetLimits());
  absent.SelectTable(4, true);
  undo.CopyFromClip(new ScRange(3, 2, 0, 3, 3, 2), absent, InsertDeleteFlags.CONTENTS, null, clip);
  expect(undo.GetCellType(new ScAddress(3, 2, 0))).toBe(CellType.CELLTYPE_NONE);
  undo.Dispose();
  clip.Dispose();
  source.Dispose();
});
