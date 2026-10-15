/** @fileoverview Source-derived SfxStyleSheetIterator contracts over the real shared index; caller witnesses implement only borrowed style/pool operations, not replacement production owners. */
import { afterEach, expect, it, vi } from "vitest";
import {
  SfxStyleFamily as Family,
  SfxStyleSearchBits as Bits,
  type SfxStyleSheetSearchReference,
} from "../../inc/style";
import { IndexedStyleSheets } from "./IndexedStyleSheets";
import { SfxStyleSheetIterator } from "./style";
import { OUString } from "../../../sal/inc/rtl/ustring";
const strings: OUString[] = [];
/** Allocates the original shared UTF16 value. @param text - Logical text. @returns Owned native string. */
function unicode(text: string): OUString {
  const units = Uint16Array.from(
    text.split(""),
    /** Reads one UTF16 unit. @param c - Unit. @returns Code unit. */ (c) => c.charCodeAt(0),
  );
  const result = new OUString(units, units.length);
  strings.push(result);
  return result;
}
/** Supplies exactly the original methods consumed by search, without claiming a full stylesheet model. @param name - Name. @param family - Family. @param mask - Flags. @param used - Usage. @param hidden - Visibility. @returns Caller identity. */
function sheet(
  name: string,
  family = Family.Char,
  mask = Bits.UserDefined,
  used = false,
  hidden = false,
) {
  return {
    name: unicode(name),
    family,
    mask,
    used,
    hidden,
    /** Borrows native name. @returns Name. */ GetName() {
      return this.name;
    },
    /** Borrows native family. @returns Family. */ GetFamily() {
      return this.family;
    },
    /** Borrows native mask. @returns Mask. */ GetMask() {
      return this.mask;
    },
    /** Queries caller usage. @returns Usage. */ IsUsed() {
      return this.used;
    },
    /** Queries caller visibility. @returns Visibility. */ IsHidden() {
      return this.hidden;
    },
  };
}
/** Binds the native borrowed pool operation to an actual index, without constructing a substitute pool owner. @param sheets - Caller identities. @returns Index and original pool operation. */
function indexed(...sheets: SfxStyleSheetSearchReference[]) {
  const index = new IndexedStyleSheets();
  for (const s of sheets) index.AddStyleSheet(s);
  return {
    index,
    pool: {
      /** Native protected friend view. @returns Actual index. */ GetIndexedStyleSheets() {
        return index;
      },
    },
  };
}
afterEach(
  /** Releases test-owned string values and method observations. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const s of strings) s.dispose();
    strings.length = 0;
  },
);

it("uses the all-family trivial path and preserves initial, failed and terminal cursor positions", /** Exercises direct vector traversal. @returns Nothing. */ () => {
  const a = sheet("a"),
    b = sheet("b", Family.Para),
    c = sheet("c", Family.Table),
    { index, pool } = indexed(a, b, c),
    it = new SfxStyleSheetIterator(pool, Family.All);
  expect(it.GetSearchMask()).toBe(Bits.All);
  expect(it.GetSearchFamily()).toBe(Family.All);
  expect(it.SearchUsed()).toBe(false);
  expect(it.Count()).toBe(3);
  expect(it.Next()).toBe(b);
  expect(it.First()).toBe(a);
  expect(it.Next()).toBe(b);
  expect(it.Next()).toBe(c);
  expect(it.Next()).toBeNull();
  expect(it.Next()).toBeNull();
  expect(it.at(99)).toBeNull();
  expect(it.Next()).toBeNull();
  expect(it.First()).toBe(a);
  expect(it.Find(unicode("b"))).toBe(b);
  expect(it.Find(unicode("absent"))).toBeNull();
  expect(it.Next()).toBe(c);
  index.RemoveStyleSheet(a);
  expect(it.Count()).toBe(2);
  expect(it.First()).toBe(b);
  expect(/** Violates native vector bounds. @returns Result. */ () => it.at(-1)).toThrow(
    RangeError,
  );
});
it("uses the exact-All family path with checked indexing and live family vectors", /** Exercises native family traversal. @returns Nothing. */ () => {
  const a = sheet("a", Family.Para),
    b = sheet("b"),
    c = sheet("c", Family.Para),
    { index, pool } = indexed(a, b, c),
    it = new SfxStyleSheetIterator(pool, Family.Para);
  expect(it.Count()).toBe(2);
  expect(it.First()).toBe(a);
  expect(it.Next()).toBe(c);
  expect(it.Next()).toBeNull();
  expect(/** Checks native std::vector::at. @returns Result. */ () => it.at(2)).toThrow(RangeError);
  expect(/** Checks negative vector index. @returns Result. */ () => it.at(-1)).toThrow(RangeError);
  const d = sheet("d", Family.Para);
  index.AddStyleSheet(d);
  expect(it.Next()).toBe(d);
  expect(it.Count()).toBe(3);
});
it("preserves empty First and all filtered cursor assignment rules", /** Exercises predicate ordinal and absolute-index transitions. @returns Nothing. */ () => {
  const a = sheet("skip", Family.Char, Bits.Auto),
    b = sheet("b", Family.Para, Bits.SwText),
    c = sheet("c", Family.Para, Bits.SwChapter),
    d = sheet("d", Family.Para, Bits.SwText),
    { pool } = indexed(a, b, c, d),
    it = new SfxStyleSheetIterator(pool, Family.Para, Bits.SwText);
  expect(it.Count()).toBe(2);
  expect(it.First()).toBe(b);
  expect(it.at(1)).toBe(d);
  expect(it.at(7)).toBeNull();
  expect(it.Next()).toBeNull();
  expect(it.First()).toBe(b);
  expect(it.at(-1)).toBeNull();
  expect(it.Next()).toBe(d);
  expect(it.Find(unicode("b"))).toBe(b);
  expect(it.Find(unicode("skip"))).toBeNull();
  expect(it.Next()).toBe(d);
  expect(it.Next()).toBeNull();
  const empty = new SfxStyleSheetIterator(indexed().pool, Family.All);
  expect(empty.First()).toBeNull();
  expect(empty.Find(unicode("x"))).toBeNull();
  expect(new SfxStyleSheetIterator(pool, Family.All, Bits.Auto).First()).toBeNull();
});
it("uses exact UTF16 names and predicate-selected duplicate families", /** Checks original exact-name find. @returns Nothing. */ () => {
  const a = sheet("a\0b", Family.Char, Bits.SwChapter),
    b = sheet("a\0b", Family.Para, Bits.SwText),
    c = sheet("a\0b", Family.Char, Bits.SwText),
    { pool } = indexed(a, b, c);
  expect(new SfxStyleSheetIterator(pool, Family.Para, Bits.SwText).Find(unicode("a\0b"))).toBe(b);
  expect(new SfxStyleSheetIterator(pool, Family.Char, Bits.SwText).Find(unicode("a\0b"))).toBe(c);
  expect(new SfxStyleSheetIterator(pool, Family.All).Find(unicode("A\0b"))).toBeNull();
  const any = new SfxStyleSheetIterator(pool, Family.All);
  expect([a, b, c]).toContain(any.Find(unicode("a\0b")));
});
it("separates Used from flags, preserves its OR semantics and evaluates usage before family rejection", /** Checks original predicate call order. @returns Nothing. */ () => {
  const a = sheet("unused", Family.Char, Bits.SwText),
    b = sheet("used", Family.Char, Bits.Auto, true),
    c = sheet("foreign", Family.Para, Bits.Auto, true),
    { pool } = indexed(a, b, c);
  const used = vi.spyOn(c, "IsUsed"),
    mask = vi.spyOn(c, "GetMask");
  const only = new SfxStyleSheetIterator(pool, Family.Char, Bits.Used);
  expect(only.SearchUsed()).toBe(true);
  expect(only.GetSearchMask()).toBe(Bits.Used);
  expect(only.Count()).toBe(1);
  expect(only.First()).toBe(b);
  expect(only.Next()).toBeNull();
  expect(used).toHaveBeenCalled();
  expect(mask).not.toHaveBeenCalled();
  const combined = new SfxStyleSheetIterator(pool, Family.Char, Bits.Used | Bits.SwText);
  expect(combined.Count()).toBe(2);
  expect(combined.First()).toBe(a);
  expect(combined.Next()).toBe(b);
  const allVisible = new SfxStyleSheetIterator(pool, Family.All, Bits.AllVisible);
  expect(allVisible.SearchUsed()).toBe(false);
  expect(allVisible.Count()).toBe(3);
});
it("preserves disabled visibility filtering and the special Hidden-only expression (CALC147)", /** Preserves the suspicious native predicate. @returns Nothing. */ () => {
  const a = sheet("hidden", Family.Char, Bits.SwText, false, true),
    b = sheet("visible", Family.Char, Bits.SwText),
    c = sheet("used", Family.Char, Bits.Auto, true),
    d = sheet("mask", Family.Char, Bits.Hidden),
    { pool } = indexed(a, b, c, d);
  expect(new SfxStyleSheetIterator(pool, Family.Char, Bits.SwText).Count()).toBe(2);
  const hidden = new SfxStyleSheetIterator(pool, Family.Char, Bits.Hidden);
  expect(hidden.Count()).toBe(2);
  expect(hidden.First()).toBe(a);
  expect(hidden.Next()).toBe(d);
  const combined = new SfxStyleSheetIterator(pool, Family.Char, Bits.Hidden | Bits.Used);
  expect(combined.Count()).toBe(2);
  expect(combined.First()).toBe(c);
  expect(combined.Next()).toBe(d);
  expect(new SfxStyleSheetIterator(pool, Family.All, Bits.AllVisible).Count()).toBe(4);
});
it("preserves Find primary position followed by family-vector Next indexing (CALC148)", /** Keeps original index-space mismatch. @returns Nothing. */ () => {
  const a = sheet("a", Family.Char),
    b = sheet("b", Family.Para),
    c = sheet("c", Family.Para),
    { pool } = indexed(a, b, c),
    it = new SfxStyleSheetIterator(pool, Family.Para);
  expect(it.First()).toBe(b);
  expect(it.Next()).toBe(c);
  expect(it.Find(unicode("b"))).toBe(b);
  expect(it.Next()).toBeNull();
  const filtered = new SfxStyleSheetIterator(pool, Family.Para, Bits.UserDefined);
  expect(filtered.Find(unicode("b"))).toBe(b);
  expect(filtered.Next()).toBe(c);
});
it("preserves all-visible family predicate path and native unsupported-family boundaries", /** Distinguishes exact-All family optimization. @returns Nothing. */ () => {
  const a = sheet("a", Family.Char, Bits.Auto),
    b = sheet("b", Family.Para),
    { pool } = indexed(a, b);
  const it = new SfxStyleSheetIterator(pool, Family.Char, Bits.AllVisible);
  expect(it.Count()).toBe(1);
  expect(it.First()).toBe(a);
  expect(it.Next()).toBeNull();
  expect(new SfxStyleSheetIterator(pool, Family.Cell, Bits.AllVisible).Count()).toBe(0);
  expect(
    /** Violates native six-family index assertion. @returns Count. */ () =>
      new SfxStyleSheetIterator(pool, Family.Cell).Count(),
  ).toThrow("unsupported");
});
it("narrows only fast-path counts at the native uint16 boundary", /** Uses actual large indexed collection. @returns Nothing. */ () => {
  const { index, pool } = indexed();
  for (let n = 0; n < 65536; n++) index.AddStyleSheet(sheet(String(n), Family.Char, Bits.SwText));
  const all = new SfxStyleSheetIterator(pool, Family.All),
    family = new SfxStyleSheetIterator(pool, Family.Char),
    filtered = new SfxStyleSheetIterator(pool, Family.Char, Bits.SwText);
  expect(all.Count()).toBe(0);
  expect(family.Count()).toBe(0);
  expect(filtered.Count()).toBe(65536);
  expect(all.First()).toBeNull();
  expect(family.First()).toBeNull();
  expect(filtered.First()).toBe(index.GetStyleSheetByPosition(0));
});
