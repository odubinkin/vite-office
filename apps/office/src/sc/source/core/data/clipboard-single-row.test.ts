/** @fileoverview Original table7 single-source-row repetition and geometry propagation through real clipboard stores. */
import { CopyOneCellFromClip } from "./document10";
import { UpdateScriptTypes } from "./column4";
import { BreakIteratorImpl } from "../../../../i18npool/source/breakiterator/breakiteratorImpl";
import { ScCondFormatItem, ScCondFormatIndexes } from "../../../inc/attrib";
import { expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScTable } from "../../../inc/table";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScFormulaCell } from "../../../inc/formulacell";
import { ScMarkData } from "../../../inc/markdata";
import { CopyFromClipContext } from "../../../inc/clipcontext";
import { ColumnSpanSet } from "../../../inc/columnspanset";
import { RefUpdateContext } from "../../../inc/refupdatecontext";
import { InsertDeleteFlags, CRFlags, UpdateRefMode } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { BroadcastAction } from "./documen7";
import { ScMergeAttr, ScMergeFlagAttr, ScMF } from "../../../inc/attrib";
import { ScPatternAttr } from "../../../inc/patattr";
import { readOdsDocument, writeOdsDocument } from "../../filter/xml/xmlwrap";

it("queries merged anchors through actual attribute runs without allocating absent columns or sheets", /** The single-row paste guard distinguishes anchor spans from overlap flags. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const table = doc.FetchTable(0) as ScTable,
    count = table.GetAllocatedColumnsCount(),
    pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  try {
    expect(doc.IsMerged(new ScAddress(0, 0, 1))).toBe(false);
    expect(doc.IsMerged(new ScAddress(-1, 0, 0))).toBe(false);
    expect(doc.IsMerged(new ScAddress(doc.MaxCol() + 1, 0, 0))).toBe(false);
    expect(doc.IsMerged(new ScAddress(count, 0, 0))).toBe(false);
    expect(table.GetAllocatedColumnsCount()).toBe(count);
    expect(doc.IsMerged(new ScAddress())).toBe(false);
    pattern.ItemSetPut(new ScMergeAttr(2, 1));
    doc.ApplyPattern(0, 3, 0, pattern);
    expect(doc.IsMerged(new ScAddress(0, 3, 0))).toBe(true);
    expect(doc.IsMerged(new ScAddress(0, 2, 0))).toBe(false);
    expect(doc.IsMerged(new ScAddress(0, 4, 0))).toBe(false);
    pattern.ItemSetPut(new ScMergeAttr(1, 3));
    doc.ApplyPattern(0, 7, 0, pattern);
    expect(doc.IsMerged(new ScAddress(0, 7, 0))).toBe(true);
    pattern.ItemSetPut(new ScMergeAttr(1, 1));
    pattern.ItemSetPut(new ScMergeFlagAttr(ScMF.Hor | ScMF.Ver));
    doc.ApplyPattern(0, 8, 0, pattern);
    expect(doc.IsMerged(new ScAddress(0, 8, 0))).toBe(false);
  } finally {
    pattern.Dispose();
    doc.Dispose();
  }
});
/** Prepares the actual source row's owned cell/text-attribute values,as required by the native table entry. @param doc - Destination. @param clip - Actual clipboard. @returns Prepared native context. */
function context(doc: ScDocument, clip: ScDocument): CopyFromClipContext {
  const operation = new CopyFromClipContext(
      doc,
      null,
      clip,
      InsertDeleteFlags.CONTENTS,
      false,
      false,
    ),
    area = clip.GetClipParam().getWholeRange();
  operation.setSingleCellColumnSize(area.aEnd.Col() - area.aStart.Col() + 1);
  for (let col = area.aStart.Col(); col <= area.aEnd.Col(); col++)
    operation.setSingleCell(
      new ScAddress(col, area.aStart.Row(), area.aStart.Tab()),
      (clip.FetchTable(area.aStart.Tab()) as ScTable).CreateColumnIfNotExists(col),
    );
  return operation;
}
it("repeats prepared source columns across a destination rectangle without changing column geometry", /** Source values and text metadata are actual native owned payloads. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange(1, 2, 0, 2, 2, 0));
  clip.SetValue(new ScAddress(1, 2, 0), 3);
  clip.SetValue(new ScAddress(2, 2, 0), 7);
  const source = clip.FetchTable(0) as ScTable,
    target = doc.FetchTable(0) as ScTable;
  source.CreateColumnIfNotExists(1).SetScriptType(2, SvtScriptType.LATIN);
  target.SetColWidth(4, 777);
  const operation = context(doc, clip);
  target.CopyOneCellFromClip(operation, 3, 5, 7, 7, 2, source);
  for (let row = 5; row <= 7; row++)
    expect(
      [3, 4, 5, 6, 7].map(
        /** Reads actual destination cells. @param col - Column. @returns Value. */ (col) =>
          doc.GetValue(new ScAddress(col, row, 0)),
      ),
    ).toEqual([3, 7, 3, 7, 3]);
  expect(target.GetScriptType(3, 6)).toBe(SvtScriptType.LATIN);
  expect(target.GetColWidth(4)).toBe(777);
  operation.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("copies a formula row as a genuine shared group and preserves recalculation after ODS reopen", /** Caller phases use the same native context,reference,listening and dirty owners as block copying. @returns Completion. */ async () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange());
  doc.SetValue(new ScAddress(1, 0, 0), 2);
  doc.SetValue(new ScAddress(3, 3, 0), 7);
  const sourceCell = new ScFormulaCell(
    doc,
    new ScAddress(),
    unicode("=B1+$B$1"),
    FormulaGrammar.Grammar.GRAM_NATIVE,
  );
  sourceCell.GetValue();
  clip.SetFormulaCell(new ScAddress(), new ScFormulaCell(sourceCell, clip, new ScAddress()));
  sourceCell.Dispose();
  const operation = context(doc, clip),
    marks = new ScMarkData(doc.GetSheetLimits()),
    spans = new ColumnSpanSet(),
    target = doc.FetchTable(0) as ScTable;
  marks.SelectTable(0, true);
  operation.setTabRange(0, 0);
  operation.setDestRange(2, 3, 2, 5);
  operation.setDeleteFlag(InsertDeleteFlags.CONTENTS);
  doc.SetAutoCalc(false);
  doc.SetInsertingFromOtherDoc(true);
  doc.DeleteBeforeCopyFromClip(operation, marks, spans);
  target.CopyOneCellFromClip(operation, 2, 3, 2, 5, 0, clip.FetchTable(0) as ScTable);
  const references = new RefUpdateContext(doc);
  references.meMode = UpdateRefMode.URM_COPY;
  references.maRange.assign(new ScRange(2, 3, 0, 2, 5, 0));
  references.mnColDelta = 2;
  references.mnRowDelta = 3;
  doc.UpdateReference(references, null, false);
  doc.SetInsertingFromOtherDoc(false);
  operation.setListeningFormulaSpans(0, 2, 3, 2, 5);
  operation.startListeningFormulas();
  doc.SetDirtyFromClip(2, 3, 2, 5, marks, InsertDeleteFlags.CONTENTS, spans);
  spans.executeColumnAction(doc, new BroadcastAction(doc));
  doc.SetAutoCalc(true);
  const copied = doc.GetFormulaCell(new ScAddress(2, 3, 0)) as ScFormulaCell;
  expect(copied.GetSharedLength()).toBe(3);
  expect(doc.GetValue(new ScAddress(2, 3, 0))).toBe(9);
  const formula = copied.GetFormula(FormulaGrammar.Grammar.GRAM_NATIVE);
  expect(text(formula)).toBe("=D4+$B$1");
  formula.dispose();
  const reopened = await readOdsDocument(writeOdsDocument(doc));
  reopened.SetValue(new ScAddress(3, 3, 0), 20);
  expect(reopened.GetValue(new ScAddress(2, 3, 0))).toBe(22);
  reopened.Dispose();
  operation.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("copies whole-row heights but updates only the first destination row's manual-size flag", /** Every real column participates in the source whole-row path. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange(0, 1, 0, 0, 1, 0));
  const source = clip.FetchTable(0) as ScTable,
    target = doc.FetchTable(0) as ScTable;
  source.SetRowHeightOnly(1, 1, 540);
  source.SetManualHeight(1, 1, true);
  source.SetRowHidden(1, 1, true);
  const operation = context(doc, clip);
  target.CopyOneCellFromClip(operation, 0, 2, doc.MaxCol(), 4, 1, source);
  expect(
    [2, 3, 4].map(
      /** Reads actual raw heights. @param row - Row. @returns Height. */ (row) =>
        target.GetOriginalHeight(row),
    ),
  ).toEqual([540, 540, 540]);
  expect(
    [2, 3, 4].map(
      /** Reads native manual-size bits. @param row - Row. @returns Manual flag. */ (row) =>
        Boolean(target.GetRowFlagsRange(row).maValue & CRFlags.ManualSize),
    ),
  ).toEqual([true, false, false]);
  target.SetManualHeight(2, 4, true);
  source.SetManualHeight(1, 1, false);
  target.CopyOneCellFromClip(operation, 0, 2, doc.MaxCol(), 4, 1, source);
  expect(
    [2, 3, 4].map(
      /** Reads the second actual flag state. @param row - Row. @returns Manual flag. */ (row) =>
        Boolean(target.GetRowFlagsRange(row).maValue & CRFlags.ManualSize),
    ),
  ).toEqual([false, true, true]);
  expect(target.RowHidden(2)).toBe(false);
  expect(source.GetOriginalHeight(-1)).toBe(source.GetOptimalMinRowHeight());
  operation.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("retains genuine optional source and destination geometry owners", /** A native unadopted source table supplies a defined absent-height/flag path without fake peers. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange());
  undo.InitUndo(doc, 0, 0);
  const source = new ScTable(clip, 0, unicode(""), false, false),
    target = doc.FetchTable(0) as ScTable,
    operation = context(doc, clip);
  target.SetManualHeight(2, 3, true);
  target.CopyOneCellFromClip(operation, 0, 2, doc.MaxCol(), 3, 0, source);
  expect(target.GetOriginalHeight(2)).toBe(source.GetOptimalMinRowHeight());
  expect(Boolean(target.GetRowFlagsRange(2).maValue & CRFlags.ManualSize)).toBe(true);
  const undoOperation = context(undo, clip),
    undoTarget = undo.FetchTable(0) as ScTable;
  undoTarget.CopyOneCellFromClip(undoOperation, 0, 2, undo.MaxCol(), 3, 0, source);
  expect(undoTarget.GetOriginalHeight(2)).toBe(undoTarget.GetOptimalMinRowHeight());
  expect(undoTarget.GetAllocatedColumnsCount()).toBe(undo.MaxCol() + 1);
  source.DisposeAttributes();
  undoOperation.Dispose();
  operation.Dispose();
  undo.Dispose();
  clip.Dispose();
  doc.Dispose();
});

it("prepares and pastes a real source row through the original document fast path", /** Full preparation supplies patterns,formatted scripts and native reference completion to existing shared-formula copy. @returns Completion. */ async () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange(0, 0, 0, 1, 0, 0));
  clip.GetBreakIterator(
    /** Binds the actual existing native script service. @returns Service. */ () =>
      new BreakIteratorImpl(),
  );
  clip.SetValue(new ScAddress(), 13);
  const original = new ScFormulaCell(
    doc,
    new ScAddress(1, 0, 0),
    unicode("=A1+1"),
    FormulaGrammar.Grammar.GRAM_NATIVE,
  );
  original.GetValue();
  clip.SetFormulaCell(
    new ScAddress(1, 0, 0),
    new ScFormulaCell(original, clip, new ScAddress(1, 0, 0)),
  );
  original.Dispose();
  const operation = context(doc, clip);
  operation.setTabRange(0, 0);
  operation.setDestRange(2, 3, 5, 5);
  doc.SetAutoCalc(false);
  doc.SetInsertingFromOtherDoc(true);
  expect(CopyOneCellFromClip.call(doc, operation, 2, 3, 5, 5)).toBe(true);
  expect(operation.getSingleCellPattern(0)).toBe(clip.GetPattern(new ScAddress()));
  expect(operation.getSingleCellAttr(0).mnScriptType).toBe(SvtScriptType.LATIN);
  doc.StartAllListeners(new ScRange(2, 3, 0, 5, 5, 0));
  doc.SetInsertingFromOtherDoc(false);
  doc.SetAutoCalc(true);
  expect(doc.GetValue(new ScAddress(2, 3, 0))).toBe(13);
  expect(doc.GetValue(new ScAddress(3, 3, 0))).toBe(14);
  expect(doc.GetValue(new ScAddress(5, 5, 0))).toBe(14);
  doc.SetValue(new ScAddress(4, 5, 0), 27);
  expect(doc.GetValue(new ScAddress(5, 5, 0))).toBe(28);
  const reopened = await readOdsDocument(writeOdsDocument(doc));
  expect(reopened.GetValue(new ScAddress(5, 5, 0))).toBe(28);
  reopened.SetValue(new ScAddress(4, 5, 0), 40);
  expect(reopened.GetValue(new ScAddress(5, 5, 0))).toBe(41);
  reopened.Dispose();
  operation.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("retains original single-row fast-path rejection guards", /** Native false results leave generic paste available;no replacement fill fallback runs. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  const operation = context(doc, clip);
  clip.SetClipArea(new ScRange(), true);
  expect(CopyOneCellFromClip.call(doc, operation, 0, 1, 1, 2)).toBe(false);
  clip.SetClipArea(new ScRange(0, 0, 0, 0, 1, 0));
  expect(CopyOneCellFromClip.call(doc, operation, 0, 1, 1, 2)).toBe(false);
  clip.SetClipArea(new ScRange(0, 0, 0, 2, 0, 0));
  expect(CopyOneCellFromClip.call(doc, operation, 0, 1, 1, 2)).toBe(false);
  clip.SetClipArea(new ScRange(0, 0, 0, 0, 0, 0));
  const merged = new ScPatternAttr(clip.getCellAttributeHelper());
  merged.ItemSetPut(new ScMergeAttr(2, 1));
  clip.ApplyPattern(0, 0, 0, merged);
  expect(CopyOneCellFromClip.call(doc, operation, 0, 1, 1, 2)).toBe(false);
  merged.Dispose();
  clip.ResetClip(doc, 1);
  clip.SetClipArea(new ScRange(0, 0, 1, 0, 0, 1));
  expect(CopyOneCellFromClip.call(doc, operation, 0, 1, 1, 2)).toBe(false);
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange(8, 0, 0, 8, 0, 0));
  expect(
    /** A malformed manually prepared clipboard lacks its required source column. @returns No paste. */ () =>
      CopyOneCellFromClip.call(doc, operation, 0, 1, 1, 2),
  ).toThrow("source column assertion");
  clip.SetValue(new ScAddress(), 1);
  clip.SetClipArea(new ScRange());
  operation.setTabRange(-1, -1);
  expect(
    /** An uninitialized destination span violates the native table-dereference precondition. @returns No paste. */ () =>
      CopyOneCellFromClip.call(doc, operation, 0, 1, 1, 2),
  ).toThrow("destination table assertion");
  clip.Clear();
  clip.SetClipArea(new ScRange());
  expect(CopyOneCellFromClip.call(doc, operation, 0, 1, 1, 2)).toBe(false);
  operation.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("updates only unknown scripts in actual nonempty metadata and rejects unported conditional evaluation", /** Original invalid-span,empty-attribute and cached-script guards preserve stores. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.GetBreakIterator(
    /** Binds actual script classification. @returns Service. */ () => new BreakIteratorImpl(),
  );
  const col = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0);
  col.SetValue(0, 1);
  col.SetValue(2, 3);
  doc.SetTextCell(new ScAddress(0, 3, 0), unicode("漢字"));
  UpdateScriptTypes.call(col, -1, 0);
  UpdateScriptTypes.call(col, 1, doc.MaxRow() + 1);
  UpdateScriptTypes.call(col, 2, 1);
  expect(col.GetScriptType(0)).toBe(SvtScriptType.UNKNOWN);
  UpdateScriptTypes.call(col, 0, 3);
  expect(col.GetScriptType(0)).toBe(SvtScriptType.LATIN);
  expect(col.GetScriptType(3)).toBe(SvtScriptType.ASIAN);
  UpdateScriptTypes.call(col, 0, 3);
  col.GetCellAttrStore().set_empty(2, 2);
  UpdateScriptTypes.call(col, 2, 2);
  const conditional = new ScPatternAttr(doc.getCellAttributeHelper());
  conditional.ItemSetPut(new ScCondFormatItem(new ScCondFormatIndexes([1])));
  doc.ApplyPattern(0, 3, 0, conditional);
  col.SetScriptType(3, SvtScriptType.UNKNOWN);
  expect(
    /** Missing real conditional backend must remain explicit. @returns Nothing. */ () =>
      UpdateScriptTypes.call(col, 3, 3),
  ).toThrow("Conditional-result");
  conditional.Dispose();
  doc.Dispose();
});
