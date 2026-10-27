/** @fileoverview Native document font order, early exit and automatic-style owner lifetimes. */
import { assert, expect, it } from "vitest";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { SfxItemSet, SfxPoolItemHolder } from "../../../../svl/source/items/itemset";
import {
  releaseStyleHandle,
  StylePool,
  styleHandleUseCount,
} from "../../../../svl/source/items/stylepool";
import {
  RES_CHRATR_FONT,
  RES_TXTATR_AUTOFMT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { SetAttrMode } from "../../../inc/swtypes";
import { MakeTextAttr, ClearTextNodeHints } from "../txtnode/thints";
import { SwFormatAutoFormat } from "../txtnode/txatbase";
import { SwDoc } from "./doc";
/** Actual character font item. @param name - Family value. @returns Font item. */
function font(name: string): SvxFontItem {
  return new SvxFontItem(
    FontFamily.FAMILY_ROMAN,
    name,
    "",
    FontPitch.PITCH_VARIABLE,
    1,
    RES_CHRATR_FONT,
  );
}
/** Collects original callback order without deduplicating inherited values. @param doc - Actual document. @param ignore - Original auto-style gate. @returns Names. */
function names(doc: SwDoc, ignore = false): string[] {
  const result: string[] = [];
  doc.ForEachCharacterFontItem(
    RES_CHRATR_FONT,
    ignore,
    /** Applies ForEachCharacterFontItem to item. @param item - item value. @returns Callback result. */ (
      item,
    ) => {
      result.push(item.GetFamilyName());
      return true;
    },
  );
  return result;
}
it("visits named characters, inherited paragraph collections, nodes and automatic styles in source order", /** Verifies visits named characters, inherited paragraph collections, nodes and automatic styles in source order. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const char = doc.MakeCharFormat("Char", undefined);
    char.SetFormatAttr(font("Character"));
    const paragraph = doc.MakeTextFormatColl("Paragraph", doc.GetDfltTextFormatColl());
    paragraph.SetFormatAttr(font("Paragraph"));
    const node = doc.paragraphs[0];
    assert(node);
    node.ChgFormatColl(paragraph);
    node.SetAttr(font("Node"));
    const set = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
    set.Put(font("Auto"));
    const handle = doc.GetIStyleAccess().getAutomaticStyle(set, SwAutoStyleFamily.AUTO_STYLE_CHAR);
    try {
      expect(names(doc)).toEqual(["Character", "Paragraph", "Node", "Auto"]);
      expect(names(doc, true)).toEqual(["Character", "Paragraph", "Node"]);
      const first: string[] = [];
      doc.ForEachCharacterFontItem(
        RES_CHRATR_FONT,
        false,
        /** Verifies visits named characters, inherited paragraph collections, nodes and automatic styles in source order. @param item - item value. @returns Callback result. */ (
          item,
        ) => {
          first.push(item.GetFamilyName());
          return false;
        },
      );
      expect(first).toEqual(["Character"]);
    } finally {
      releaseStyleHandle(handle);
      set.Dispose();
    }
    expect(names(doc)).toEqual(["Character", "Paragraph", "Node"]);
  } finally {
    doc.Dispose();
  }
});
it("retains styles through actual hint snapshots and cache owners, then skips them after the last external owner", /** Verifies retains styles through actual hint snapshots and cache owners, then skips them after the last external owner. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("A");
    const set = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
    set.Put(font("Hint"));
    const hint = MakeTextAttr(doc, set, 0, 1);
    assert(hint.format instanceof SwFormatAutoFormat);
    const handle = hint.format.GetStyleHandle();
    node.InsertHint(hint, SetAttrMode.NOHINTADJUST);
    expect(styleHandleUseCount(handle)).toBe(2);
    expect(names(doc)).toEqual(["Hint"]);
    const snapshot = node.GetpSwpHints()?.clone();
    assert(snapshot);
    ClearTextNodeHints(node, true);
    expect(names(doc)).toEqual(["Hint"]);
    snapshot.Dispose();
    expect(names(doc)).toEqual([]);
    const cached = doc
      .GetIStyleAccess()
      .getByName(StylePool.nameOf(handle), SwAutoStyleFamily.AUTO_STYLE_CHAR);
    assert(cached);
    releaseStyleHandle(cached);
    expect(names(doc)).toEqual(["Hint"]);
    doc.GetIStyleAccess().clearCaches();
    expect(names(doc)).toEqual([]);
    set.Dispose();
  } finally {
    doc.Dispose();
  }
});
it("releases non-shareable automatic items through actual item-set, and holder destruction", /** Verifies releases non-shareable automatic items through actual item-set, and holder destruction. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const set = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
    set.Put(font("Owned"));
    const handle = doc.GetIStyleAccess().getAutomaticStyle(set, SwAutoStyleFamily.AUTO_STYLE_CHAR),
      item = new SwFormatAutoFormat(handle);
    releaseStyleHandle(handle);
    const entries = new SfxItemSet(doc.GetAttrPool(), [[RES_TXTATR_AUTOFMT, RES_TXTATR_AUTOFMT]]),
      holder = new SfxPoolItemHolder(doc.GetAttrPool(), item);
    expect(entries.Put(item)).toBeInstanceOf(SwFormatAutoFormat);
    item.Dispose();
    expect(names(doc)).toEqual(["Owned"]);
    entries.Dispose();
    expect(names(doc)).toEqual(["Owned"]);
    holder.Dispose();
    expect(names(doc)).toEqual([]);
    set.Dispose();
  } finally {
    doc.Dispose();
  }
});

it.each(["false", "throw"])(
  "releases the complete native automatic-style vector on callback %s",
  /** Verifies releases the complete native automatic-style vector on callback %s. @param policy - policy value. @returns Nothing. */ (
    policy,
  ) => {
    const doc = new SwDoc(),
      handles: SfxItemSet[] = [];
    try {
      for (const name of ["First", "Second"]) {
        const set = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
        set.Put(font(name));
        handles.push(
          doc.GetIStyleAccess().getAutomaticStyle(set, SwAutoStyleFamily.AUTO_STYLE_CHAR),
        );
        set.Dispose();
      }
      const visit =
        /** Verifies releases the complete native automatic-style vector on callback %s. @returns Callback result. */ (): void =>
          doc.ForEachCharacterFontItem(
            RES_CHRATR_FONT,
            false,
            /** Verifies releases the complete native automatic-style vector on callback %s. @returns Callback result. */ () => {
              if (policy === "throw") throw new Error("callback stop");
              return false;
            },
          );
      if (policy === "throw") expect(visit).toThrow("callback stop");
      else visit();
      expect(handles.map(styleHandleUseCount)).toEqual([2, 2]);
    } finally {
      for (const handle of handles) releaseStyleHandle(handle);
      doc.Dispose();
    }
  },
);
