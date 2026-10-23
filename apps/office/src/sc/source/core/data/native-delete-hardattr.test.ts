/** @fileoverview Source DeleteHardAttr run mutation,style/merge preservation and original allocated-column deletion witnesses. */
import type { ScDocumentPool } from "./docpool";
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScMarkData } from "../../../inc/markdata";
import { ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
import { ScAttrArray } from "./attarray";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { ScMergeAttr, ScMergeFlagAttr, ScMF } from "../../../inc/attrib";
import { InsertDeleteFlags } from "../../../inc/global";
import { SfxItemSet, SfxItemState } from "../../../../svl/inc/itemset";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Constructs a real source pattern with optional preserved style name and merge flags. @param doc - Actual document. @param named - Whether named. @returns Holder. */
function pattern(doc: ScDocument, named = false): CellAttributeHolder {
  const set = new SfxItemSet(doc.GetPool() as ScDocumentPool, [[100, 155]]),
    name = unicode("Named"),
    p = new ScPatternAttr(doc.getCellAttributeHelper(), set, named ? name : undefined);
  set.ClearItem();
  name.dispose();
  p.ItemSetPut(new SvxFontHeightItem(500, 100, 101));
  if (named) {
    p.ItemSetPut(new ScMergeAttr(2, 3));
    p.ItemSetPut(new ScMergeFlagAttr(ScMF.Hor));
  }
  return new CellAttributeHolder(p, true);
}
it("deletes only direct items through actual split/coalesced runs and retains merge/style metadata", /** Uses real pool/canonical holders,not row-value replacement models. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    a = new ScAttrArray(0, 0, doc),
    plain = pattern(doc),
    named = pattern(doc, true);
  try {
    a.DeleteHardAttr(0, 5);
    a.SetPatternArea(2, 8, plain);
    a.SetPatternArea(12, 18, named);
    a.DeleteHardAttr(4, 15);
    expect((a.GetPattern(3)?.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(500);
    expect(a.GetPattern(4)?.isDefault()).toBe(true);
    expect(a.GetPattern(11)?.isDefault()).toBe(true);
    const kept = a.GetPattern(12) as ScPatternAttr;
    expect(text(kept.GetStyleName() as NonNullable<ReturnType<typeof kept.GetStyleName>>)).toBe(
      "Named",
    );
    expect(kept.GetItemSet().GetItemState(101, false)).toBe(SfxItemState.DEFAULT);
    expect((kept.GetItem(144) as ScMergeAttr).GetColMerge()).toBe(2);
    expect((kept.GetItem(145) as ScMergeFlagAttr).GetValue()).toBe(ScMF.Hor);
    expect((a.GetPattern(16)?.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(500);
    a.DeleteHardAttr(0, doc.MaxRow());
    expect(a.GetPattern(12)?.GetItemSet().Count()).toBe(2);
    a.DeleteHardAttr(12, 18);
    expect(a.GetPattern(12)?.GetItemSet().Count()).toBe(2);
  } finally {
    a.Dispose();
    plain.Dispose();
    named.Dispose();
    doc.DisposeAttributes();
  }
});
it("preserves original allocated-column clamp and leaves default-column tails untouched", /** Exercises actual sparse/native table owners and selected sheet routing. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    name = unicode("Sheet"),
    mark = new ScMarkData(doc.GetSheetLimits());
  doc.InsertTab(0, name);
  name.dispose();
  mark.SelectOneTable(0);
  const p = pattern(doc);
  try {
    doc.SetValue(new ScAddress(), 7);
    doc.ApplyPatternAreaTab(
      0,
      0,
      doc.MaxCol(),
      doc.MaxRow(),
      0,
      p.getScPatternAttr() as ScPatternAttr,
    );
    doc.DeleteArea(
      0,
      doc.MaxRow() + 3,
      doc.MaxCol(),
      doc.MaxRow() + 5,
      mark,
      InsertDeleteFlags.HARDATTR,
    );
    doc.DeleteArea(2, 4, 0, 0, mark, InsertDeleteFlags.HARDATTR);
    expect(doc.GetPattern(new ScAddress())?.GetItemSet().GetItemState(101, false)).toBe(
      SfxItemState.DEFAULT,
    );
    expect(
      (
        doc.GetPattern(new ScAddress(doc.MaxCol(), 0, 0))?.GetItem(101) as SvxFontHeightItem
      ).GetHeight(),
    ).toBe(500);
    mark.SelectTable(0, false);
    doc.SetAutoCalc(false);
    doc.DeleteArea(0, 6, 0, 6, mark, InsertDeleteFlags.HARDATTR);
    expect(
      (doc.GetPattern(new ScAddress(0, 6, 0))?.GetItem(101) as SvxFontHeightItem).GetHeight(),
    ).toBe(500);
    expect(doc.GetAutoCalc()).toBe(false);
    doc.SetAutoCalc(true);
    mark.SelectTable(0, true);
    mark.SetMarkArea(new ScRange(0, 5, 0, 0, 5, 0));
    doc.DeleteSelection(InsertDeleteFlags.HARDATTR, mark);
    expect(
      (doc.GetPattern(new ScAddress(0, 5, 0))?.GetItem(101) as SvxFontHeightItem).GetHeight(),
    ).toBe(500);
    mark.MarkToMulti();
    doc.DeleteSelection(InsertDeleteFlags.HARDATTR, mark);
    expect(
      doc
        .GetPattern(new ScAddress(0, 5, 0))
        ?.GetItemSet()
        .GetItemState(101, false),
    ).toBe(SfxItemState.DEFAULT);
    mark.SelectTable(2, true);
    doc.DeleteSelection(InsertDeleteFlags.EDITATTR, mark);
    const col = (
      doc.FetchTable(0) as NonNullable<ReturnType<typeof doc.FetchTable>>
    ).CreateColumnIfNotExists(0);
    expect(
      /** Rejects unrepresented style deletion without changing the document. @returns Nothing. */ () =>
        col.DeleteArea(0, 0, InsertDeleteFlags.STYLES),
    ).toThrow("hard-attribute deletion");
    col.DeleteArea(0, 0, InsertDeleteFlags.NONE);
  } finally {
    p.Dispose();
    doc.DisposeAttributes();
  }
});

it("reveals actual inherited item values while retaining original parent identity and style name", /** Uses a genuine SfxItemSet parent rather than a browser style projection. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    parent = new SfxItemSet(doc.GetPool() as ScDocumentPool, [[100, 155]]),
    name = unicode("Named"),
    source = new ScPatternAttr(doc.getCellAttributeHelper(), undefined, name),
    a = new ScAttrArray(0, 0, doc);
  name.dispose();
  parent.Put(new SvxFontHeightItem(700, 100, 101));
  source.GetItemSetWritable().SetParent(parent);
  source.ItemSetPut(new SvxFontHeightItem(500, 100, 101));
  const holder = new CellAttributeHolder(source, true);
  try {
    a.SetPatternArea(0, 4, holder);
    a.DeleteHardAttr(0, 4);
    const cleared = a.GetPattern(0) as ScPatternAttr;
    expect(cleared.GetItemSet().GetParent()).toBe(parent);
    expect(cleared.GetItemSet().Count()).toBe(0);
    expect((cleared.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(700);
    expect(
      text(cleared.GetStyleName() as NonNullable<ReturnType<typeof cleared.GetStyleName>>),
    ).toBe("Named");
  } finally {
    a.Dispose();
    holder.Dispose();
    parent.ClearItem();
    doc.DisposeAttributes();
  }
});
it("copies native string blocks,including empty-string removal markers,without changing numeric cells", /** Real typed stores exercise same-pool and re-interned cross-pool paths. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    other = new ScDocument(),
    name = unicode("Sheet");
  doc.InsertTab(0, name);
  other.InsertTab(0, name);
  name.dispose();
  const table = doc.FetchTable(0) as NonNullable<ReturnType<typeof doc.FetchTable>>,
    source = table.CreateColumnIfNotExists(0),
    target = table.CreateColumnIfNotExists(1),
    foreign = (
      other.FetchTable(0) as NonNullable<ReturnType<typeof other.FetchTable>>
    ).CreateColumnIfNotExists(0),
    alpha = unicode("Alpha"),
    empty = unicode("");
  try {
    source.SetRawString(2, alpha);
    source.SetRawString(4, empty);
    source.SetValue(6, 9);
    target.SetValue(4, 5);
    target.SetValue(6, 11);
    source.CopyToColumn(1, 5, target);
    const copy = target.GetSharedString(2);
    try {
      expect(text(copy.getString())).toBe("Alpha");
    } finally {
      copy.dispose();
    }
    expect(target.GetCellType(4)).toBe(0);
    expect(target.GetValue(6)).toBe(11);
    source.CopyToColumn(0, doc.MaxRow(), foreign);
    const across = foreign.GetSharedString(2);
    try {
      expect(text(across.getString())).toBe("Alpha");
    } finally {
      across.dispose();
    }
    expect(foreign.GetCellType(6)).toBe(0);
  } finally {
    alpha.dispose();
    empty.dispose();
    doc.DisposeAttributes();
    other.DisposeAttributes();
  }
});
