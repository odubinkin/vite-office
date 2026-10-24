/** @fileoverview Native attribute CopyArea and MigrateToDocument used by actual paste Undo snapshots. */
import { expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import type { ScDocumentPool } from "./docpool";
import { ScAttrArray } from "../../../inc/attarray";
import { ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
import { ScMF, ScMergeFlagAttr } from "../../../inc/attrib";
import { ATTR_MERGE_FLAG } from "../../../inc/scitems";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SfxUInt32Item } from "../../../../svl/inc/intitem";
import { SfxItemState } from "../../../../svl/inc/itemset";
import {
  SfxStyleSheetPool,
  SfxStyleSheet,
  SfxStyleFamily,
  SfxStyleSearchBits,
} from "../../../../svl/inc/style";
import { CopyToDocContext } from "../../../inc/clipcontext";
import { InsertDeleteFlags } from "../../../inc/global";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates the actual native document. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  return doc;
}
/** Applies a canonical actual row pattern. @param array - Native run owner. @param doc - Document owner. @param first - First row. @param last - Last row. @param height - Font height. @param flags - Merge flags. @returns Nothing. */
function set(
  array: ScAttrArray,
  doc: ScDocument,
  first: number,
  last: number,
  height: number,
  flags = ScMF.NONE,
): void {
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  pattern.ItemSetPut(new SvxFontHeightItem(height, 100, 101));
  pattern.ItemSetPut(new ScMergeFlagAttr(flags));
  const holder = new CellAttributeHolder(pattern, true);
  try {
    array.SetPatternArea(first, last, holder);
  } finally {
    holder.Dispose();
  }
}
/** Borrows actual font height. @param array - Native run owner. @param row - Row. @returns Twips. */
function height(array: ScAttrArray, row: number): number {
  return ((array.GetPattern(row) as ScPatternAttr).GetItem(101) as SvxFontHeightItem).GetHeight();
}
/** Borrows actual merge flags. @param array - Native run owner. @param row - Row. @returns Flags. */
function flags(array: ScAttrArray, row: number): ScMF {
  return (
    (array.GetPattern(row) as ScPatternAttr).GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr
  ).GetValue();
}
it("copies canonical defaults and native clipped offset runs without touching outside rows", /** Actual compressed runs retain source boundaries and destination defaults. @returns Nothing. */ () => {
  const doc = document(),
    source = new ScAttrArray(0, 0, doc),
    target = new ScAttrArray(1, 0, doc),
    defaultHeight = height(source, 0);
  set(target, doc, 0, 20, 400);
  source.CopyArea(4, 8, 0, target);
  expect([height(target, 3), height(target, 4), height(target, 8), height(target, 9)]).toEqual([
    400,
    defaultHeight,
    defaultHeight,
    400,
  ]);
  set(source, doc, 0, 4, 300);
  set(source, doc, 5, 8, 600);
  source.CopyArea(4, 12, 3, target);
  expect(
    [3, 4, 7, 8, 11, 12, 13].map(
      /** Reads actual copied boundaries. @param row - Row. @returns Height. */ (row) =>
        height(target, row),
    ),
  ).toEqual([400, 300, 300, 600, 600, defaultHeight, 400]);
  source.CopyArea(-2, 2, -3, target);
  expect([height(target, 0), height(target, 1), height(target, 2)]).toEqual([300, 300, 600]);
  source.CopyArea(9, 10, 0, target);
  expect(height(target, 9)).toBe(defaultHeight);
  source.CopyArea(doc.MaxRow() - 1, doc.MaxRow() + 3, 0, target);
  expect(height(target, doc.MaxRow())).toBe(defaultHeight);
  source.Dispose();
  target.Dispose();
  doc.Dispose();
});
it.each([false, true])(
  "strips native merge flags through actual same/foreign helper migration=%s",
  /** Canonical source patterns remain unchanged while each target receives stripped values. @param foreign - Use another document helper. @returns Nothing. */ (
    foreign,
  ) => {
    const doc = document(),
      other = foreign ? document() : doc,
      source = new ScAttrArray(0, 0, doc),
      target = new ScAttrArray(1, 0, other);
    set(source, doc, 1, 3, 300, ScMF.Hor | ScMF.Ver | ScMF.Auto);
    source.CopyArea(1, 3, 0, target);
    expect(flags(target, 1)).toBe(ScMF.Hor | ScMF.Ver | ScMF.Auto);
    source.CopyArea(1, 3, 0, target, ScMF.Hor);
    expect(flags(target, 1)).toBe(ScMF.Ver | ScMF.Auto);
    expect(flags(source, 1)).toBe(ScMF.Hor | ScMF.Ver | ScMF.Auto);
    source.CopyArea(1, 3, 0, target, ScMF.All);
    expect(flags(target, 1)).toBe(ScMF.NONE);
    source.CopyArea(1, 3, 0, target, ScMF.Hor | ScMF.Ver | ScMF.Auto);
    expect(flags(target, 1)).toBe(ScMF.NONE);
    expect((target.GetPattern(1) as ScPatternAttr).getCellAttributeHelper()).toBe(
      other.getCellAttributeHelper(),
    );
    source.Dispose();
    target.Dispose();
    if (foreign) other.Dispose();
    doc.Dispose();
  },
);
it("migrates direct SET fields to the actual destination helper and retains the native absent-validation-list branch", /** Native migration drops INVALID/inherited/unbound-name metadata and resets unavailable validation indices. @returns Nothing. */ () => {
  const doc = document(),
    other = document(),
    source = new ScPatternAttr(doc.getCellAttributeHelper(), undefined, unicode("DetachedName"));
  source.ItemSetPut(new SvxFontHeightItem(300, 100, 101));
  source.ItemSetPut(new SfxUInt32Item(153, 99));
  source.ItemSetPut(new SfxUInt32Item(146, 7));
  source.GetItemSetWritable().InvalidateItem(102);
  const holder = source.MigrateToDocument(other, doc),
    migrated = holder.getScPatternAttr() as ScPatternAttr;
  expect(migrated.getCellAttributeHelper()).toBe(other.getCellAttributeHelper());
  expect(migrated.GetStyleName()).toBe(null);
  expect((migrated.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(300);
  expect((migrated.GetItem(153) as SfxUInt32Item).GetValue()).toBe(0);
  expect(migrated.GetNumberFormatKey()).toBe(7);
  expect(migrated.GetItemSet().GetItemState(102, false)).not.toBe(SfxItemState.INVALID);
  const same = source.MigrateToDocument(doc, doc);
  expect(same.getScPatternAttr()?.GetStyleName()).toBe(null);
  same.Dispose();
  holder.Dispose();
  source.Dispose();
  other.Dispose();
  doc.Dispose();
});
it("keeps foreign bound-style migration explicit and preserves actual target styles for hard-only copies", /** Real shared style owners provide native borrowed pointers;the unported Calc style factory is not substituted. @returns Nothing. */ () => {
  const doc = document(),
    other = document(),
    pool = new SfxStyleSheetPool(doc.GetPool() as ScDocumentPool),
    style = pool.Make(
      unicode("Target"),
      SfxStyleFamily.Para,
      SfxStyleSearchBits.UserDefined,
    ) as SfxStyleSheet;
  style.GetItemSet().Put(new SvxFontHeightItem(440, 100, 101));
  const source = doc.FetchTable(0)?.CreateColumnIfNotExists(0),
    target = doc.FetchTable(0)?.CreateColumnIfNotExists(1);
  if (!source || !target) throw Error("Missing native columns");
  const original = new ScPatternAttr(doc.getCellAttributeHelper());
  original.SetStyleSheet(style);
  const holder = new CellAttributeHolder(original, true);
  target.SetPattern(0, holder);
  holder.Dispose();
  const delta = new ScPatternAttr(doc.getCellAttributeHelper());
  delta.ItemSetPut(new SvxFontHeightItem(300, 100, 101));
  source.ApplyPattern(0, delta);
  source.CopyToColumn(new CopyToDocContext(doc), 0, 0, InsertDeleteFlags.HARDATTR, false, target);
  expect(target.GetPattern(0)?.GetStyleSheet()).toBe(style);
  expect((target.GetPattern(0)?.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(440);
  const bound = new ScPatternAttr(doc.getCellAttributeHelper());
  bound.SetStyleSheet(style);
  expect(
    /** A genuine bound style requires the missing Calc style-copy factory. @returns Owned pattern. */ () =>
      bound.MigrateToDocument(other, doc),
  ).toThrow("style-pool");
  expect(
    /** Foreign hard-only copying requires that same native owner. @returns Nothing. */ () =>
      source.CopyToColumn(
        new CopyToDocContext(other),
        0,
        0,
        InsertDeleteFlags.HARDATTR,
        false,
        other.FetchTable(0)?.CreateColumnIfNotExists(0) as NonNullable<typeof source>,
      ),
  ).toThrow("style migration");
  bound.Dispose();
  delta.Dispose();
  doc.getCellAttributeHelper().AllStylesToNames();
  pool.Dispose();
  other.Dispose();
  doc.Dispose();
});
it("saves and restores actual content and attributes through a genuine shared-pool Undo document", /** CONTENTS plus ATTRIB preserves the font pattern needed by native EnterBlock undo. @returns Nothing. */ () => {
  const doc = document(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
    live = doc.FetchTable(0)?.CreateColumnIfNotExists(0);
  if (!live) throw Error("Missing native column");
  undo.InitUndo(doc, 0, 0);
  const saved = undo.FetchTable(0)?.CreateColumnIfNotExists(0);
  if (!saved) throw Error("Missing Undo column");
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  pattern.ItemSetPut(new SvxFontHeightItem(300, 100, 101));
  live.ApplyPattern(0, pattern);
  live.SetValue(0, 2);
  const context = new CopyToDocContext(undo);
  context.setStartListening(false);
  live.CopyToColumn(
    context,
    0,
    0,
    InsertDeleteFlags.CONTENTS | InsertDeleteFlags.ATTRIB,
    false,
    saved,
  );
  pattern.ItemSetPut(new SvxFontHeightItem(500, 100, 101));
  live.ApplyPattern(0, pattern);
  live.SetValue(0, 9);
  saved.CopyToColumn(
    new CopyToDocContext(doc),
    0,
    0,
    InsertDeleteFlags.CONTENTS | InsertDeleteFlags.ATTRIB,
    false,
    live,
  );
  expect(live.GetValue(0)).toBe(2);
  expect((live.GetPattern(0)?.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(300);
  pattern.Dispose();
  undo.Dispose();
  doc.Dispose();
});
