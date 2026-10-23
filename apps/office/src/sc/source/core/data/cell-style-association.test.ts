/** @fileoverview Native pattern style association and registered-style ownership using genuine shared style classes;no Calc style-pool substitute. */
import type { ScDocumentPool } from "./docpool";
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScPatternAttr, CellAttributeHolder, CellAttributeHelper } from "../../../inc/patattr";
import {
  SfxStyleSheetPool,
  SfxStyleSheet,
  SfxStyleFamily,
  SfxStyleSearchBits,
} from "../../../../svl/inc/style";
import { SfxItemPool } from "../../../../svl/inc/itempool";
import { SfxItemState } from "../../../../svl/inc/itemset";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_SYMBOL } from "../../../../sal/inc/rtl/textenc";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates actual shared styles;this does not claim the missing Calc subclass or its standard-style defaults. @param pool - Real source pool. @param value - Native name. @returns Actual shared owner. */
function make(pool: SfxStyleSheetPool, value: string): SfxStyleSheet {
  const n = unicode(value);
  try {
    return pool.Make(n, SfxStyleFamily.Para, SfxStyleSearchBits.UserDefined) as SfxStyleSheet;
  } finally {
    n.dispose();
  }
}
/** Real Calc pool/helper plus actual shared style pool. @returns Owners. */
function fixture() {
  const doc = new ScDocument(),
    pool = new SfxStyleSheetPool(doc.GetPool() as ScDocumentPool),
    helper = doc.getCellAttributeHelper();
  return {
    doc,
    pool,
    helper,
    /** Releases actual owners without inventing a style resolver. @returns Nothing. */ close() {
      helper.AllStylesToNames();
      pool.Dispose();
      doc.DisposeAttributes();
    },
  };
}
it("inherits actual style SET fields,clears only those direct fields by default,and copies the borrowed style and parent", /** Tests native parent identity and scalar state distinctions. @returns Nothing. */ () => {
  const f = fixture(),
    style = make(f.pool, "CellStyle"),
    base = make(f.pool, "Parent"),
    p = new ScPatternAttr(f.helper);
  try {
    base.GetItemSet().Put(new SvxFontHeightItem(400, 100, 101));
    style.GetItemSet().SetParent(base.GetItemSet());
    p.ItemSetPut(new SvxFontHeightItem(300, 100, 101));
    p.ItemSetPut(new SvxWeightItem(FontWeight.WEIGHT_BOLD, 102));
    p.SetStyleSheet(style);
    expect(p.GetStyleSheet()).toBe(style);
    expect(p.GetStyleName()).toBe(style.GetName());
    expect(p.GetItemSet().GetParent()).toBe(style.GetItemSet());
    expect(p.GetItemSet().GetItemState(101, false)).toBe(SfxItemState.DEFAULT);
    expect((p.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(400);
    expect(p.GetItemSet().GetItemState(102, false)).toBe(SfxItemState.SET);
    const copy = new ScPatternAttr(p);
    try {
      expect(copy.GetStyleSheet()).toBe(style);
      expect(copy.GetItemSet().GetParent()).toBe(p.GetItemSet().GetParent());
      expect(copy.equals(p)).toBe(true);
    } finally {
      copy.Dispose();
    }
    p.ItemSetPut(new SvxFontHeightItem(250, 100, 101));
    p.SetStyleSheet(style, false);
    expect((p.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(250);
    style.GetItemSet().InvalidateItem(101);
    p.SetStyleSheet(style);
    expect((p.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(250);
    style.GetItemSet().ClearItem(101);
    p.GetItemSetWritable().InvalidateItem(101);
    p.SetStyleSheet(style);
    expect(p.GetItemSet().GetItemState(101, false)).toBe(SfxItemState.DEFAULT);
  } finally {
    p.Dispose();
    f.close();
  }
});
it("retains unbound names on null attachment,copies names on detachment,and distinguishes equal names with different parents", /** Native null attach is not a name reset. @returns Nothing. */ () => {
  const f = fixture(),
    name = unicode("Unbound"),
    p = new ScPatternAttr(f.helper, undefined, name),
    style = make(f.pool, "Linked"),
    otherPool = new SfxStyleSheetPool(f.doc.GetPool() as ScDocumentPool),
    other = make(otherPool, "Linked"),
    q = new ScPatternAttr(f.helper),
    renamed = unicode("Changed");
  try {
    p.SetStyleSheet(null);
    expect(text(required(p.GetStyleName()))).toBe("Unbound");
    expect(p.GetStyleSheet()).toBeNull();
    p.SetStyleSheet(style);
    q.SetStyleSheet(other);
    expect(p.equals(q)).toBe(false);
    p.StyleToName();
    const saved = p.GetStyleName();
    expect(text(required(saved))).toBe("Linked");
    expect(p.GetStyleSheet()).toBeNull();
    expect(p.GetItemSet().GetParent()).toBeUndefined();
    style.SetName(renamed);
    expect(text(required(saved))).toBe("Linked");
    p.StyleToName();
    expect(p.GetStyleName()).toBe(saved);
    p.SetStyleSheet(null);
    expect(p.GetStyleName()).toBe(saved);
  } finally {
    p.Dispose();
    q.Dispose();
    otherPool.Dispose();
    renamed.dispose();
    name.dispose();
    f.close();
  }
});
it("uses only explicitly SET direct or inherited symbol fonts rather than pool defaults", /** Reads real font encoding from the native item set. @returns Nothing. */ () => {
  const f = fixture(),
    style = make(f.pool, "Symbols"),
    p = new ScPatternAttr(f.helper),
    symbol = (
      (f.doc.GetPool() as ScDocumentPool).GetUserOrPoolDefaultItem(100) as SvxFontItem
    ).Clone();
  try {
    expect(p.IsSymbolFont()).toBe(false);
    symbol.SetCharSet(RTL_TEXTENCODING_SYMBOL);
    (f.doc.GetPool() as ScDocumentPool).SetUserDefaultItem(symbol);
    expect(p.IsSymbolFont()).toBe(false);
    style.GetItemSet().Put(symbol);
    p.SetStyleSheet(style);
    expect(p.IsSymbolFont()).toBe(true);
    const ordinary = symbol.Clone();
    ordinary.SetCharSet(0);
    p.ItemSetPut(ordinary);
    expect(p.IsSymbolFont()).toBe(false);
    p.ItemSetClearItem(100);
    expect(p.IsSymbolFont()).toBe(true);
    p.StyleToName();
    expect(p.IsSymbolFont()).toBe(false);
  } finally {
    p.Dispose();
    f.close();
  }
});
it("renames only exact borrowed style identities and reindexes canonical holders while preserving same-named unbound and other styles", /** Exercises source remove/rename/reinsert ordering on real registry owners. @returns Nothing. */ () => {
  const f = fixture(),
    style = make(f.pool, "旧😀\u0000Name"),
    otherPool = new SfxStyleSheetPool(f.doc.GetPool() as ScDocumentPool),
    other = make(otherPool, "旧😀\u0000Name"),
    name = unicode("旧😀\u0000Name"),
    next = unicode("New"),
    p = new ScPatternAttr(f.helper),
    q = new ScPatternAttr(f.helper),
    unbound = new ScPatternAttr(f.helper, undefined, name),
    holders: CellAttributeHolder[] = [];
  try {
    p.SetStyleSheet(style);
    q.SetStyleSheet(other);
    holders.push(
      new CellAttributeHolder(p),
      new CellAttributeHolder(q),
      new CellAttributeHolder(unbound),
    );
    const registered = required(holders[0]).getScPatternAttr();
    f.helper.RenameCellStyle(style, next);
    expect(text(required(required(registered).GetStyleName()))).toBe("New");
    expect(text(required(required(required(holders[1]).getScPatternAttr()).GetStyleName()))).toBe(
      "旧😀\u0000Name",
    );
    expect(text(required(required(required(holders[2]).getScPatternAttr()).GetStyleName()))).toBe(
      "旧😀\u0000Name",
    );
    const candidate = new ScPatternAttr(f.helper);
    try {
      candidate.SetStyleSheet(style);
      holders.push(new CellAttributeHolder(candidate));
      expect(required(holders.at(-1)).getScPatternAttr()).toBe(registered);
    } finally {
      candidate.Dispose();
    }
    const collisionPattern = new ScPatternAttr(f.helper);
    try {
      collisionPattern.SetStyleSheet(make(otherPool, "New"));
      holders.push(new CellAttributeHolder(collisionPattern));
      const blocked = make(f.pool, "Blocked");
      f.helper.RenameCellStyle(style, blocked.GetName());
      expect(text(required(required(registered).GetStyleName()))).toBe("New");
    } finally {
      collisionPattern.Dispose();
    }
    const absent = make(f.pool, "NoPattern"),
      free = unicode("NoPatternNew");
    try {
      f.helper.RenameCellStyle(absent, free);
      expect(text(absent.GetName())).toBe("NoPatternNew");
      const alone = new ScPatternAttr(f.helper),
        again = unicode("AloneAgain");
      try {
        alone.SetStyleSheet(absent);
        holders.push(new CellAttributeHolder(alone));
        f.helper.RenameCellStyle(absent, again);
        expect(text(absent.GetName())).toBe("AloneAgain");
      } finally {
        alone.Dispose();
        again.dispose();
      }
    } finally {
      free.dispose();
    }
  } finally {
    for (const h of holders) h.Dispose();
    p.Dispose();
    q.Dispose();
    unbound.Dispose();
    name.dispose();
    next.dispose();
    otherPool.Dispose();
    f.close();
  }
});
it("detaches only registered patterns borrowing a deleted style and preserves name ownership and canonical release", /** Unregistered source values and same-named detached values are not rewritten. @returns Nothing. */ () => {
  const f = fixture(),
    style = make(f.pool, "Deleted"),
    other = make(f.pool, "Other"),
    p = new ScPatternAttr(f.helper),
    namedName = unicode("Deleted"),
    named = new ScPatternAttr(f.helper, undefined, namedName),
    holders: CellAttributeHolder[] = [];
  try {
    p.SetStyleSheet(style);
    holders.push(new CellAttributeHolder(p), new CellAttributeHolder(named));
    const registered = required(required(holders[0]).getScPatternAttr()),
      unbound = required(required(holders[1]).getScPatternAttr());
    f.helper.CellStyleDeleted(other);
    expect(registered.GetStyleSheet()).toBe(style);
    f.helper.CellStyleDeleted(style);
    expect(registered.GetStyleSheet()).toBeNull();
    expect(registered.GetItemSet().GetParent()).toBeUndefined();
    expect(text(required(registered.GetStyleName()))).toBe("Deleted");
    expect(unbound.GetStyleName()).not.toBe(registered.GetStyleName());
    expect(p.GetStyleSheet()).toBe(style);
    const changed = unicode("AfterDeletion");
    try {
      style.SetName(changed);
      expect(text(required(registered.GetStyleName()))).toBe("Deleted");
    } finally {
      changed.dispose();
    }
  } finally {
    for (const h of holders) h.Dispose();
    p.Dispose();
    named.Dispose();
    namedName.dispose();
    f.close();
  }
});
it("converts all registered and default patterns to independent names and forces absent default creation", /** Exercises native teardown preparation without pool or document facades. @returns Nothing. */ () => {
  const empty = new CellAttributeHelper(new SfxItemPool());
  expect(Reflect.get(empty, "mpDefaultCellAttribute")).toBeNull();
  empty.AllStylesToNames();
  expect(empty.getDefaultCellAttribute().GetStyleName()).toBeNull();
  const f = fixture(),
    style = make(f.pool, "All"),
    p = new ScPatternAttr(f.helper);
  p.SetStyleSheet(style);
  const h = new CellAttributeHolder(p),
    def = f.helper.getDefaultCellAttribute();
  try {
    def.SetStyleSheet(style);
    f.helper.AllStylesToNames();
    expect(required(h.getScPatternAttr()).GetStyleSheet()).toBeNull();
    expect(text(required(required(h.getScPatternAttr()).GetStyleName()))).toBe("All");
    expect(def.GetStyleSheet()).toBeNull();
    expect(text(required(def.GetStyleName()))).toBe("All");
    expect(p.GetStyleSheet()).toBe(style);
  } finally {
    h.Dispose();
    p.Dispose();
    f.close();
  }
});

/** Requires a real native owner or value before observing its contract. @param value - Actual source result. @returns Present value. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw Error("Missing native source value");
  return value;
}
