/** @fileoverview Native block-copy source cycling,selected sheets and filtered-row cursor acceptance. */
import { expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScMarkData } from "../../../inc/markdata";
import { CopyFromClipContext } from "../../../inc/clipcontext";
import { ColumnSpanSet } from "../../../inc/columnspanset";
import { InsertDeleteFlags } from "../../../inc/global";
import { ScFormulaCell } from "../../../inc/formulacell";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { BroadcastAction } from "./documen7";
import { readOdsDocument, writeOdsDocument } from "../../filter/xml/xmlwrap";
const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
it("cycles genuine sparse clipboard tabs only for selected existing destination sheets", /** Native selected destinations consume sources in their original vector order. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  for (let tab = 0; tab < 4; tab++) doc.InsertTab(tab, unicode(`Sheet${tab}`));
  const sourceMarks = new ScMarkData(doc.GetSheetLimits());
  sourceMarks.SelectTable(1, true);
  sourceMarks.SelectTable(3, true);
  clip.ResetClip(doc, sourceMarks);
  clip.SetClipArea(new ScRange(0, 0, 1, 0, 0, 3));
  clip.SetValue(new ScAddress(0, 0, 1), 10);
  clip.SetValue(new ScAddress(0, 0, 3), 20);
  const marks = new ScMarkData(doc.GetSheetLimits());
  for (const tab of [0, 2, 3]) marks.SelectTable(tab, true);
  const context = new CopyFromClipContext(
    doc,
    null,
    clip,
    InsertDeleteFlags.CONTENTS,
    false,
    false,
  );
  context.setTabRange(0, 5);
  doc.CopyBlockFromClip(context, 2, 2, 2, 2, marks, 2, 2);
  expect(
    [0, 1, 2, 3].map(
      /** Reads actual target sheets. @param tab - Sheet. @returns Cell value. */ (tab) =>
        doc.GetValue(new ScAddress(2, 2, tab)),
    ),
  ).toEqual([10, 0, 20, 10]);
  context.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("copies consecutive selected sheets and completes native dependency notifications before fresh ODS reopen", /** Actual compile,copy,reference,listening and dirty owners preserve relative and absolute references. @returns Completion. */ async () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  for (let tab = 0; tab < 3; tab++) doc.InsertTab(tab, unicode(`Sheet${tab}`));
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange(0, 0, 0, 0, 1, 0));
  clip.SetValue(new ScAddress(), 13);
  const source = new ScFormulaCell(doc, new ScAddress(0, 1, 0), unicode("=B2+$B$1"), grammar);
  clip.SetFormulaCell(
    new ScAddress(0, 1, 0),
    new ScFormulaCell(source, clip, new ScAddress(0, 1, 0)),
  );
  source.Dispose();
  const marks = new ScMarkData(doc.GetSheetLimits());
  for (let tab = 0; tab < 3; tab++) {
    marks.SelectTable(tab, true);
    doc.SetValue(new ScAddress(1, 0, tab), 2);
    doc.SetValue(new ScAddress(3, 5, tab), 7);
  }
  const context = new CopyFromClipContext(
      doc,
      null,
      clip,
      InsertDeleteFlags.CONTENTS,
      false,
      false,
    ),
    spans = new ColumnSpanSet();
  context.setTabRange(0, 2);
  context.setDestRange(2, 4, 2, 5);
  context.setDeleteFlag(InsertDeleteFlags.CONTENTS);
  doc.SetAutoCalc(false);
  doc.SetInsertingFromOtherDoc(true);
  doc.DeleteBeforeCopyFromClip(context, marks, spans);
  doc.CopyBlockFromClip(context, 2, 4, 2, 5, marks, 2, 4);
  doc.SetInsertingFromOtherDoc(false);
  for (let tab = 0; tab < 3; tab++) context.setListeningFormulaSpans(tab, 2, 4, 2, 5);
  context.startListeningFormulas();
  doc.SetDirtyFromClip(2, 4, 2, 5, marks, InsertDeleteFlags.CONTENTS, spans);
  spans.executeColumnAction(doc, new BroadcastAction(doc));
  doc.SetAutoCalc(true);
  for (let tab = 0; tab < 3; tab++) expect(doc.GetValue(new ScAddress(2, 5, tab))).toBe(9);
  const reopened = await readOdsDocument(writeOdsDocument(doc));
  expect(reopened.GetValue(new ScAddress(2, 5, 2))).toBe(9);
  reopened.SetValue(new ScAddress(3, 5, 2), 20);
  expect(reopened.GetValue(new ScAddress(2, 5, 2))).toBe(22);
  const formula = (reopened.GetFormulaCell(new ScAddress(2, 5, 2)) as ScFormulaCell).GetFormula(
    grammar,
  );
  expect(text(formula)).toBe("=D6+$B$1");
  formula.dispose();
  reopened.Dispose();
  context.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("skips genuine null destination slots and preserves foreign-pool cut behavior", /** Public block traversal uses actual sparse sheet vectors. @returns Nothing. */ () => {
  const source = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    destination = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  for (let tab = 0; tab < 3; tab++) source.InsertTab(tab, unicode(`Sheet${tab}`));
  destination.ResetClip(source, 2);
  clip.InsertTab(0, unicode("Clip"));
  clip.SetValue(new ScAddress(), 8);
  clip.GetClipParam().mbCutMode = true;
  const marks = new ScMarkData(source.GetSheetLimits());
  for (let tab = 0; tab < 3; tab++) marks.SelectTable(tab, true);
  const context = new CopyFromClipContext(
    destination,
    null,
    clip,
    InsertDeleteFlags.CONTENTS,
    false,
    false,
  );
  context.setTabRange(0, 2);
  destination.CopyBlockFromClip(context, 0, 0, 0, 0, marks, 0, 0);
  expect(destination.GetValue(new ScAddress(0, 0, 2))).toBe(8);
  context.Dispose();
  clip.Dispose();
  destination.Dispose();
  source.Dispose();
});
it("rejects unavailable same-document cut updates before changing destination content", /** No partial cut mutation is published across the explicit move-engine boundary. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.GetClipParam().mbCutMode = true;
  doc.SetValue(new ScAddress(), 77);
  const context = new CopyFromClipContext(
      doc,
      null,
      clip,
      InsertDeleteFlags.CONTENTS,
      false,
      false,
    ),
    marks = new ScMarkData(doc.GetSheetLimits());
  context.setTabRange(0, 0);
  marks.SelectTable(0, true);
  expect(
    /** Calls the real unsupported move boundary. @returns Nothing. */ () =>
      doc.CopyBlockFromClip(context, 0, 0, 0, 0, marks, 0, 0),
  ).toThrow("cut reference");
  expect(doc.GetValue(new ScAddress())).toBe(77);
  context.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("copies nonfiltered source runs from the first populated clipboard sheet and advances the actual source cursor", /** Hidden source rows remain eligible;filtered rows are excluded. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  for (let tab = 0; tab < 3; tab++) doc.InsertTab(tab, unicode(`Sheet${tab}`));
  clip.ResetClip(doc, 2);
  for (let row = 0; row < 6; row++) clip.SetValue(new ScAddress(0, row, 2), row + 10);
  clip.SetRowFiltered(1, 2, 2, true);
  clip.SetRowHidden(3, 3, 2, true);
  const context = new CopyFromClipContext(
      doc,
      null,
      clip,
      InsertDeleteFlags.CONTENTS,
      false,
      false,
    ),
    marks = new ScMarkData(doc.GetSheetLimits()),
    row: [number] = [0];
  context.setTabRange(0, 0);
  marks.SelectTable(0, true);
  expect(doc.CopyNonFilteredFromClip(context, 2, 4, 2, 6, marks, 2, row, 5)).toBe(2);
  expect(row[0]).toBe(5);
  expect(
    [4, 5, 6].map(
      /** Reads the native destination rows. @param value - Row. @returns Cell value. */ (value) =>
        doc.GetValue(new ScAddress(2, value, 0)),
    ),
  ).toEqual([10, 13, 14]);
  row[0] = 5;
  expect(doc.CopyNonFilteredFromClip(context, 2, 8, 2, 12, marks, 2, row, 5)).toBe(0);
  expect(row[0]).toBe(6);
  expect(doc.GetValue(new ScAddress(2, 8, 0))).toBe(15);
  context.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("retains signed SCROW-max sentinel and its original filtered-row count accumulation", /** An all-filtered tail does not report a bounded range length in the original helper. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetRowFiltered(1, 5, 0, true);
  expect(clip.FirstNonFilteredRow(1, 5, 0)).toBe(2147483647);
  expect(clip.FirstNonFilteredRow(-1, 5, 0)).toBe(2147483647);
  expect(clip.FirstNonFilteredRow(2, 1, 0)).toBe(2147483647);
  expect(clip.FirstNonFilteredRow(0, 1, 9)).toBe(2147483647);
  const context = new CopyFromClipContext(
      doc,
      null,
      clip,
      InsertDeleteFlags.CONTENTS,
      false,
      false,
    ),
    marks = new ScMarkData(doc.GetSheetLimits()),
    row: [number] = [1];
  context.setTabRange(0, 0);
  marks.SelectTable(0, true);
  expect(doc.CopyNonFilteredFromClip(context, 0, 0, 0, 5, marks, 0, row, 5)).toBe(2147483646);
  expect(row[0]).toBe(2147483647);
  const empty = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    emptyContext = new CopyFromClipContext(
      doc,
      null,
      empty,
      InsertDeleteFlags.CONTENTS,
      false,
      false,
    );
  row[0] = 8;
  expect(doc.CopyNonFilteredFromClip(emptyContext, 0, 0, 0, 5, marks, 0, row, 5)).toBe(0);
  emptyContext.Dispose();
  empty.Dispose();
  context.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("retains the native maximum source-sheet guard without allocating intervening sheets", /** ResetClip explicitly permits a source-missing sheet and creates its actual sparse clipboard slot. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("First"));
  doc.InsertTab(1, unicode("Second"));
  clip.ResetClip(doc, 9999);
  clip.SetValue(new ScAddress(0, 0, 9999), 31);
  const marks = new ScMarkData(doc.GetSheetLimits()),
    context = new CopyFromClipContext(doc, null, clip, InsertDeleteFlags.CONTENTS, false, false);
  marks.SelectTable(0, true);
  marks.SelectTable(1, true);
  context.setTabRange(0, 1);
  doc.CopyBlockFromClip(context, 0, 0, 0, 0, marks, 0, 0);
  expect(doc.GetValue(new ScAddress())).toBe(31);
  expect(doc.GetValue(new ScAddress(0, 0, 1))).toBe(31);
  expect(clip.GetTableCount()).toBe(10000);
  expect(clip.FetchTable(9998)).toBe(null);
  context.Dispose();
  clip.Dispose();
  doc.Dispose();
});
