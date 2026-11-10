/** @fileoverview Actual ContentNode text/attribute/wrong-list transitions and ContentAttribs style/tab lookup from the source owners. */
import { expect, it } from "vitest";
import { ContentNode, ContentAttribs } from "../../inc/ContentNode";
import { EditEngineItemPool } from "../../inc/editdoc";
import { EditCharAttrib, EditCharAttribTab, CH_FEATURE } from "../../inc/editattr";
import * as EE from "../../inc/eeitem";
import { SvxColorItem } from "../../inc/colritem";
import { SvxTabStop, SvxTabStopItem, SvxTabAdjust } from "../../inc/tstpitem";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import { SfxVoidItem } from "../../../svl/source/items/voiditem";
import { SfxItemState } from "../../../svl/source/items/itemset";
import { SfxStyleSheetPool, SfxStyleSheet, SfxStyleFamily } from "../../../svl/inc/style";
import { Color } from "../../../tools/inc/color";
import { MisspellRange } from "../../inc/misspellrange";
import type { WrongList } from "../../inc/edtspell";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";

/** Inserts exactly as the original EditDoc caller does, separating text mutation from range adjustment. @param node - Actual source node. @param value - Inserted text. @param position - Source position. @returns Nothing. */
function insert(node: ContentNode, value: string, position: number): void {
  const string = unicode(value);
  try {
    node.Insert(string, position);
    node.ExpandAttribs(position, string.getLength());
  } finally {
    string.dispose();
  }
}
/** Creates an actual color range in the node's actual edit pool. @param pool - Source pool. @param start - Source start. @param end - Source end. @returns Owned range. */
function range(pool: EditEngineItemPool, start: number, end: number): EditCharAttrib {
  const item = new SvxColorItem(new Color(0x123456), EE.EE_CHAR_COLOR);
  try {
    return new EditCharAttrib(pool, item, start, end);
  } finally {
    item.Dispose();
  }
}

it("owns raw UTF16 text independently and keeps attribute updates outside the text mutators", /** Embedded zeros, CR/LF and lone surrogates are not normalized by ContentNode. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    attributes = new ContentAttribs(pool),
    source = unicode("A\u0000\ud800\r\nB"),
    node = new ContentNode(source, attributes);
  try {
    source.clear();
    expect(text(node.GetString())).toBe("A\u0000\ud800\r\nB");
    const view = node.GetString();
    node.SetChar(0, 67);
    expect(node.GetString()).toBe(view);
    expect(node.GetChar(0)).toBe(67);
    const copy = node.Copy(1, 2);
    try {
      expect(text(copy)).toBe("\u0000\ud800");
    } finally {
      copy.dispose();
    }
    node.Erase(3);
    expect(text(node.GetString())).toBe("C\u0000\ud800");
    node.Append(Uint16Array.of(CH_FEATURE));
    expect(node.IsFeature(3)).toBe(true);
    expect(node.GetCharAttribs().Count()).toBe(0);
  } finally {
    node.dispose();
    attributes.dispose();
    source.dispose();
  }
});

it("moves a tab feature while independently expanding a surrounding range", /** A feature marker's range remains one unit after insertion at its start. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    node = new ContentNode(pool);
  insert(node, "ab\u0001cd", 0);
  const ordinary = range(pool, 0, 5),
    item = new SfxVoidItem(EE.EE_FEATURE_TAB),
    tab = new EditCharAttribTab(pool, item, 2);
  item.Dispose();
  node.GetCharAttribs().InsertAttrib(ordinary);
  node.GetCharAttribs().InsertAttrib(tab);
  try {
    insert(node, "XY", 2);
    expect(text(node.GetString())).toBe("abXY\u0001cd");
    expect([ordinary.GetStart(), ordinary.GetEnd(), tab.GetStart(), tab.GetEnd()]).toEqual([
      0, 7, 4, 5,
    ]);
    expect(node.GetCharAttribs().FindFeature(0)).toBe(tab);
  } finally {
    node.dispose();
  }
});

it("retains source empty-range precedence and one-shot edge clearing during expansion", /** A new empty range prevents an existing ending range from extending through inserted text. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    node = new ContentNode(pool);
  insert(node, "ab", 0);
  const ending = range(pool, 0, 2),
    empty = range(pool, 2, 2);
  ending.SetEdge(true);
  node.GetCharAttribs().InsertAttrib(ending);
  node.GetCharAttribs().InsertAttrib(empty);
  try {
    insert(node, "X", 2);
    expect([
      ending.GetStart(),
      ending.GetEnd(),
      ending.IsEdge(),
      empty.GetStart(),
      empty.GetEnd(),
    ]).toEqual([0, 2, false, 2, 3]);
  } finally {
    node.dispose();
  }
});

it("keeps an exactly deleted ordinary span empty while erasing the tab in that deletion", /** The source preserves formatting as an empty range until explicit nonempty-paragraph cleanup. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    node = new ContentNode(pool);
  insert(node, "a\u0001bc", 0);
  const ordinary = range(pool, 1, 3),
    item = new SfxVoidItem(EE.EE_FEATURE_TAB),
    tab = new EditCharAttribTab(pool, item, 1);
  item.Dispose();
  node.GetCharAttribs().InsertAttrib(ordinary);
  node.GetCharAttribs().InsertAttrib(tab);
  try {
    node.Erase(1, 2);
    node.CollapseAttribs(1, 2);
    expect(text(node.GetString())).toBe("ac");
    expect(node.GetCharAttribs().Count()).toBe(1);
    expect([
      ordinary.GetStart(),
      ordinary.GetEnd(),
      node.GetCharAttribs().HasEmptyAttribs(),
    ]).toEqual([1, 1, true]);
    node.checkAndDeleteEmptyAttribs();
    expect(node.GetCharAttribs().Count()).toBe(0);
  } finally {
    node.dispose();
  }
});

it("keeps empty attributes in an empty paragraph and preserves existing empty wrong-list identity", /** Empty-node cleanup and wrong-list replacement use different source gates. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    node = new ContentNode(pool);
  node.GetCharAttribs().InsertAttrib(range(pool, 0, 0));
  try {
    node.checkAndDeleteEmptyAttribs();
    expect(node.GetCharAttribs().Count()).toBe(1);
    node.CreateWrongList();
    const first = node.GetWrongList();
    node.CreateWrongList();
    expect(node.GetWrongList()).toBe(first);
    (first as WrongList).SetRanges([new MisspellRange(0n, 1n)]);
    node.CreateWrongList();
    expect(node.GetWrongList()).not.toBe(first);
    node.DestroyWrongList();
    expect(node.GetWrongList()).toBeNull();
  } finally {
    node.dispose();
  }
});

it("forwards source insertion/deletion updates to the real WrongList", /** The node identifies an inserted space/marker after text mutation. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    node = new ContentNode(pool);
  insert(node, "abcd", 0);
  node.CreateWrongList();
  const wrongs = node.GetWrongList() as WrongList;
  wrongs.SetRanges([new MisspellRange(0n, 4n)]);
  wrongs.SetValid();
  try {
    insert(node, " ", 2);
    expect(
      wrongs
        .GetRanges()
        .map(
          /** Reads actual source range values. @param value - Wrong range. @returns Endpoints. */ (
            value,
          ) => [value.mnStart, value.mnEnd],
        ),
    ).toEqual([
      [0n, 2n],
      [3n, 5n],
    ]);
    node.Erase(2, 1);
    node.CollapseAttribs(2, 1);
    expect(wrongs.GetInvalidStart()).toBe(2n);
  } finally {
    node.dispose();
  }
});

it("applies original changed-style clearing with bullet preservation and hard-value priority", /** Uses real style and pooled items; resetting the same style leaves new hard formatting intact. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    styles = new SfxStyleSheetPool(pool),
    name = unicode("paragraph"),
    style = styles.Make(name, SfxStyleFamily.Para) as SfxStyleSheet,
    attributes = new ContentAttribs(pool);
  name.dispose();
  const red = new SvxColorItem(new Color(0xaa0000), EE.EE_CHAR_COLOR),
    blue = new SvxColorItem(new Color(0x0000aa), EE.EE_CHAR_COLOR),
    bullet = new SfxBoolItem(EE.EE_PARA_BULLETSTATE, false);
  style.GetItemSet().Put(red);
  style.GetItemSet().Put(bullet);
  attributes.GetItems().Put(blue);
  attributes.GetItems().Put(bullet);
  try {
    attributes.SetStyleSheet(style);
    expect(attributes.GetItems().GetItemState(EE.EE_CHAR_COLOR, false)).not.toBe(SfxItemState.SET);
    expect(attributes.GetItems().GetItemState(EE.EE_PARA_BULLETSTATE, false)).toBe(
      SfxItemState.SET,
    );
    expect((attributes.GetItem(EE.EE_CHAR_COLOR) as SvxColorItem).GetValue().toInt32()).toBe(
      0xaa0000,
    );
    attributes.GetItems().Put(blue);
    attributes.SetStyleSheet(style);
    expect((attributes.GetItem(EE.EE_CHAR_COLOR) as SvxColorItem).GetValue().toInt32()).toBe(
      0x0000aa,
    );
    expect(attributes.HasItem(EE.EE_CHAR_COLOR)).toBe(true);
  } finally {
    attributes.dispose();
    red.Dispose();
    blue.Dispose();
    bullet.Dispose();
    styles.Dispose();
  }
});

it("uses explicit tab stops before original default-distance narrowing and signed division", /** The signed item distance is assigned to the source unsigned16 local before arithmetic. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    attributes = new ContentAttribs(pool),
    tabs = new SvxTabStopItem(0, 100, SvxTabAdjust.Left, EE.EE_PARA_TABS);
  tabs.Insert(new SvxTabStop(150));
  attributes.GetItems().Put(tabs);
  try {
    expect(attributes.FindTabStop(100, 80).GetTabPos()).toBe(150);
    tabs.Remove(0);
    tabs.SetDefaultDistance(-1);
    attributes.GetItems().Put(tabs);
    expect(attributes.FindTabStop(0, 80).GetTabPos()).toBe(65535);
    tabs.SetDefaultDistance(0);
    attributes.GetItems().Put(tabs);
    expect(attributes.FindTabStop(-81, 80).GetTabPos()).toBe(0);
  } finally {
    attributes.dispose();
    tabs.Dispose();
  }
});
