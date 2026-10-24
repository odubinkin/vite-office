/** @fileoverview Actual default clipboard contexts and typed single-cell row replication. */
import type { ScTable } from "../../../inc/table";
import { expect, it } from "vitest";
import { ScColumn } from "../../../inc/column";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { CopyFromClipContext } from "../../../inc/clipcontext";
import { InsertDeleteFlags, CellType } from "../../../inc/global";
import { ScFormulaCell } from "../../../inc/formulacell";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
it("retains source context defaults and deferred real formula listening spans", /** Context fields and owners are borrowed from genuine documents. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange());
  const context = new CopyFromClipContext(
    doc,
    null,
    clip,
    InsertDeleteFlags.CONTENTS,
    false,
    false,
  );
  expect(InsertDeleteFlags.CONTENTS).toBe(0x481f);
  expect(InsertDeleteFlags.ALL).toBe(0x49ff);
  expect(InsertDeleteFlags.AUTOFILL).toBe(0x4977);
  expect([context.getTabStart(), context.getTabEnd()]).toEqual([-1, -1]);
  expect(context.getDestRange()).toEqual({ mnCol1: -1, mnCol2: -1, mnRow1: -1, mnRow2: -1 });
  expect(context.getDeleteFlag()).toBe(InsertDeleteFlags.NONE);
  expect(context.getInsertFlag()).toBe(InsertDeleteFlags.CONTENTS);
  expect(context.getClipDoc()).toBe(clip);
  expect(context.getDestDoc()).toBe(doc);
  expect(context.getUndoDoc()).toBe(null);
  expect(context.isAsLink()).toBe(false);
  expect(context.isSkipEmptyCells()).toBe(false);
  expect(context.getBlockPositionSet()).toBe(context.getBlockPositionSet());
  context.setTabRange(0, 1);
  context.setDestRange(1, 2, 3, 4);
  context.setDeleteFlag(InsertDeleteFlags.CONTENTS);
  expect([context.getTabStart(), context.getTabEnd()]).toEqual([0, 1]);
  expect(context.getDestRange()).toEqual({ mnCol1: 1, mnCol2: 3, mnRow1: 2, mnRow2: 4 });
  expect(context.getDeleteFlag()).toBe(InsertDeleteFlags.CONTENTS);
  clip.SetFormulaCell(
    new ScAddress(),
    new ScFormulaCell(doc, new ScAddress(), unicode("=B1+1"), FormulaGrammar.Grammar.GRAM_NATIVE),
  );
  context.setSingleCellColumnSize(1);
  context.setSingleCell(
    new ScAddress(),
    (clip.FetchTable(0) as ScTable).CreateColumnIfNotExists(0),
  );
  (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0).CopyOneCellFromClip(context, 1, 3, 0);
  context.setListeningFormulaSpans(0, 0, 1, 0, 3);
  context.startListeningFormulas();
  doc.SetValue(new ScAddress(1, 2, 0), 9);
  expect(doc.GetValue(new ScAddress(0, 2, 0))).toBe(10);
  const start = new StartListeningContext(doc),
    end = new EndListeningContext(doc);
  doc.StartListeningFromClip(start, end, 9, 0, 0, 0, 0);
  doc.StartListeningFromClip(start, end, 0, -1, 0, 0, 0);
  doc.StartListeningFromClip(start, end, 0, 0, 0, doc.MaxCol() + 1, doc.MaxRow() + 1);
  context.setSingleCellColumnSize(0);
  context.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("copies default numeric,string and empty cells into typed stores without changing patterns", /** Source clipboard and destination share original pools. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange());
  const context = new CopyFromClipContext(doc, doc, clip, InsertDeleteFlags.CONTENTS, false, false),
    source = (clip.FetchTable(0) as ScTable).CreateColumnIfNotExists(0),
    destination = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0);
  expect(context.getUndoDoc()).toBe(doc);
  context.setSingleCellColumnSize(1);
  clip.SetValue(new ScAddress(), 8);
  context.setSingleCell(new ScAddress(), source);
  destination.CopyOneCellFromClip(context, 1, 4, 0);
  expect(doc.GetValue(new ScAddress(0, 4, 0))).toBe(8);
  clip.SetTextCell(new ScAddress(), unicode("shared"));
  context.setSingleCell(new ScAddress(), source);
  destination.CopyOneCellFromClip(context, 6, 8, 0);
  expect(doc.GetCellType(new ScAddress(0, 8, 0))).toBe(CellType.CELLTYPE_STRING);
  clip.SetEmptyCell(new ScAddress());
  context.setSingleCell(new ScAddress(), source);
  destination.CopyOneCellFromClip(context, 9, 10, 0);
  expect(doc.GetCellType(new ScAddress(0, 10, 0))).toBe(CellType.CELLTYPE_NONE);
  expect(
    /** Calls the actual native invalid-input boundary. @returns Native result. */ () =>
      destination.CopyOneCellFromClip(context, 3, 2, 0),
  ).toThrow("span is reversed");
  expect(
    /** Calls the actual native invalid-input boundary. @returns Native result. */ () =>
      context.getSingleCell(1),
  ).toThrow("offset out of range");
  expect(
    /** Calls the actual native invalid-input boundary. @returns Native result. */ () =>
      context.getSingleCellAttr(1),
  ).toThrow("offset out of range");
  context.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("re-interns foreign-pool strings and rejects unrepresented paste context options", /** Foreign string storage uses the real destination shared pool. @returns Nothing. */ () => {
  const source = new ScDocument(),
    dest = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  source.InsertTab(0, unicode("Source"));
  dest.InsertTab(0, unicode("Dest"));
  clip.ResetClip(source, 0);
  clip.SetClipArea(new ScRange());
  clip.SetTextCell(new ScAddress(), unicode("foreign"));
  const context = new CopyFromClipContext(
    dest,
    null,
    clip,
    InsertDeleteFlags.CONTENTS,
    false,
    false,
  );
  context.setSingleCellColumnSize(1);
  context.setSingleCell(
    new ScAddress(),
    (clip.FetchTable(0) as ScTable).CreateColumnIfNotExists(0),
  );
  (dest.FetchTable(0) as ScTable).CreateColumnIfNotExists(0).CopyOneCellFromClip(context, 0, 2, 0);
  const stored = dest.GetSharedString(new ScAddress()),
    interned = dest.GetSharedStringPool().intern(unicode("foreign"));
  expect(stored.getData()).toBe(interned.getData());
  stored.dispose();
  interned.dispose();
  for (const [flags, link, skip] of [
    [InsertDeleteFlags.ATTRIB, false, false],
    [InsertDeleteFlags.CONTENTS, true, false],
    [InsertDeleteFlags.CONTENTS, false, true],
  ] as const)
    expect(
      /** Calls the actual native invalid-input boundary. @returns Native result. */ () =>
        new CopyFromClipContext(dest, null, clip, flags, link, skip),
    ).toThrow("Nondefault clipboard");
  context.Dispose();
  clip.Dispose();
  source.Dispose();
  dest.Dispose();
});

it("defers insertion listeners and broadcasts until the native paste completion phase", /** Inserted source copies retain cached values until genuine deferred listening and dirty propagation. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.SetValue(new ScAddress(), 3);
  doc.SetFormula(new ScAddress(1, 0, 0), unicode("=A1*2"), FormulaGrammar.Grammar.GRAM_NATIVE);
  const source = doc.GetFormulaCell(new ScAddress(1, 0, 0)) as ScFormulaCell;
  expect(source.GetValue()).toBe(6);
  expect(doc.IsInsertingFromOtherDoc()).toBe(false);
  doc.SetInsertingFromOtherDoc(true);
  const target = new ScAddress(1, 1, 0),
    copy = source.Clone(target);
  doc.SetFormulaCell(target, copy);
  doc.SetValue(new ScAddress(0, 1, 0), 7);
  expect(copy.GetDirty()).toBe(false);
  expect(copy.GetValue()).toBe(6);
  doc.SetInsertingFromOtherDoc(false);
  doc.StartListeningFromClip(
    new StartListeningContext(doc),
    new EndListeningContext(doc),
    0,
    1,
    1,
    1,
    1,
  );
  copy.SetDirty();
  expect(copy.GetValue()).toBe(14);
  doc.SetValue(new ScAddress(0, 1, 0), 11);
  expect(copy.GetValue()).toBe(22);
  doc.Dispose();
});

it("retains the original early return when the real context cannot initialize an unadopted column cursor", /** The actual public column constructor owns genuine storage,while the destination has no sheet. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    column = new ScColumn(doc),
    context = new CopyFromClipContext(doc, null, clip, InsertDeleteFlags.CONTENTS, false, false);
  column.CopyOneCellFromClip(context, 0, 1, 0);
  expect(column.IsEmptyData()).toBe(true);
  context.Dispose();
  clip.Dispose();
  column.DisposeAttributes();
  doc.Dispose();
});

it("retains borrowed single-row patterns across native vector resize without owning their lifetime", /** The prepared pattern vector preserves existing pointers and initializes only new slots to null. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  const context = new CopyFromClipContext(
      doc,
      null,
      clip,
      InsertDeleteFlags.CONTENTS,
      false,
      false,
    ),
    pattern = clip.GetPattern(new ScAddress());
  try {
    context.setSingleCellColumnSize(2);
    expect([context.getSingleCellPattern(0), context.getSingleCellPattern(1)]).toEqual([
      null,
      null,
    ]);
    context.setSingleCellPattern(0, pattern);
    context.setSingleCellPattern(1, pattern);
    context.setSingleCellColumnSize(1);
    expect(context.getSingleCellPattern(0)).toBe(pattern);
    context.setSingleCellColumnSize(2);
    expect(context.getSingleCellPattern(0)).toBe(pattern);
    expect(context.getSingleCellPattern(1)).toBeNull();
    context.setSingleCellPattern(0, null);
    expect(context.getSingleCellPattern(0)).toBeNull();
    expect(
      /** Exercises the native vector assertion boundary. @returns Invalid borrow. */ () =>
        context.getSingleCellPattern(2),
    ).toThrow("pattern offset out of range");
    expect(
      /** Exercises the native vector assertion boundary. @returns Nothing. */ () =>
        context.setSingleCellPattern(2, pattern),
    ).toThrow("pattern offset out of range");
    context.setSingleCellPattern(0, pattern);
    context.Dispose();
    expect(clip.GetPattern(new ScAddress())).toBe(pattern);
  } finally {
    context.Dispose();
    clip.Dispose();
    doc.Dispose();
  }
});
