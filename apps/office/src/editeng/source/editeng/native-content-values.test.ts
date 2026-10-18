/** @fileoverview Verifies original paragraph text/style/set/character value boundaries against editobj.cxx. */
import { expect, it } from "vitest";
import { ContentInfo, XEditAttribute } from "./editobj2";
import { WrongList } from "../../inc/edtspell";
import { MisspellRange } from "../../inc/misspellrange";
import * as EE from "../../inc/eeitem";
import { SfxStyleFamily } from "../../../svl/inc/style";
import { SfxItemPool } from "../../../svl/inc/itempool";
import { SfxPoolItemHolder } from "../../../svl/inc/itemset";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Builds an actual Unicode value including embedded nulls and individual surrogate units. @param text - UTF16 input. @returns Unicode string. */
function unicode(text: string): OUString {
  const units = Uint16Array.from(
    { length: text.length },
    /** Reads one actual code unit. @param _ - Unused element. @param index - Unit index. @returns Unit. */ (
      _,
      index,
    ) => text.charCodeAt(index),
  );
  return new OUString(units, units.length);
}
/** Creates initialized content through the actual native producer boundary. @param pool - Actual owning pool. @param text - Text. @returns Content. */
function content(pool: SfxItemPool, text = "abc"): ContentInfo {
  const value = new ContentInfo(pool);
  value.SetText(unicode(text));
  return value;
}
it("declares original paragraph/character/feature identities and style-family values", /** Prevents the old paragraph-Which literal from surviving another caller. @returns Nothing. */ () => {
  expect([
    EE.EE_ITEMS_START,
    EE.EE_PARA_START,
    EE.EE_PARA_JUST,
    EE.EE_CHAR_START,
    EE.EE_CHAR_END,
    EE.EE_FEATURE_START,
    EE.EE_FEATURE_END,
    EE.EDITITEMCOUNT,
  ]).toEqual([4021, 4021, 4037, 4042, 4077, 4078, 4081, 61]);
  expect(
    Object.values(EE).every(
      /** Checks all exported declarations are actual numeric identities. @param value - Constant. @returns Predicate. */ (
        value,
      ) => typeof value === "number",
    ),
  ).toBe(true);
  expect([
    SfxStyleFamily.None,
    SfxStyleFamily.Char,
    SfxStyleFamily.Para,
    SfxStyleFamily.Frame,
    SfxStyleFamily.Page,
    SfxStyleFamily.Pseudo,
    SfxStyleFamily.Table,
    SfxStyleFamily.Cell,
    SfxStyleFamily.All,
  ]).toEqual([0, 1, 2, 4, 8, 16, 32, 64, 32767]);
});
it("retains original uninitialized text state and stable initialized text/style member views", /** Uses real string values rather than a made-up string provider. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    value = new ContentInfo(pool),
    textView = value.GetSharedString(),
    styleView = value.GetStyle();
  expect(textView.isValid()).toBe(false);
  expect(styleView.getLength()).toBe(0);
  expect(value.GetFamily()).toBe(SfxStyleFamily.Para);
  expect(value.GetParaAttribs().GetPool()).toBe(pool);
  expect(value.GetParaAttribs().GetRanges()).toEqual([[4021, 4077]]);
  expect(value.GetWrongList()).toBeNull();
  expect(value.GetCharAttribs()).toEqual([]);
  const source = unicode("a\0😀z");
  value.SetText(source);
  expect(value.GetSharedString()).toBe(textView);
  expect(value.GetTextLen()).toBe(5);
  expect(value.GetText().equals(source)).toBe(true);
  source.assign(unicode("changed"));
  expect(value.GetTextLen()).toBe(5);
  const returned = value.GetText();
  returned.assign(unicode("independent"));
  expect(value.GetTextLen()).toBe(5);
  value.SetText(unicode(""));
  expect(value.GetTextLen()).toBe(0);
  const style = unicode("Heading");
  value.SetStyle(style);
  style.assign(unicode("Other"));
  expect(value.GetStyle()).toBe(styleView);
  expect(styleView.equals(unicode("Heading"))).toBe(true);
  value.SetStyle(styleView);
  expect(styleView.getLength()).toBe(7);
  value.SetFamily(SfxStyleFamily.Cell);
  expect(value.GetFamily()).toBe(SfxStyleFamily.Cell);
});
it("copies text and independent paragraph/character/spelling values into the destination pool", /** Tests actual public item/set boundaries and subsequent independent mutations. @returns Nothing. */ () => {
  const sourcePool = new SfxItemPool(),
    target = new SfxItemPool(),
    source = content(sourcePool);
  source.SetStyle(unicode("Body"));
  source.SetFamily(SfxStyleFamily.Cell);
  source.GetParaAttribs().Put(new SfxInt16Item(EE.EE_PARA_JUST, 3));
  source
    .GetCharAttribs()
    .push(new XEditAttribute(sourcePool, new SfxInt16Item(EE.EE_CHAR_START, 7), 1, 3));
  const wrong = new WrongList();
  wrong.push_back(new MisspellRange(1n, 3n));
  source.SetWrongList(wrong);
  expect(source.GetWrongList()).toBe(wrong);
  const copy = new ContentInfo(source, target);
  expect(copy.Equals(source, false)).toBe(true);
  expect(copy.Equals(source, true)).toBe(false);
  expect(copy.GetParaAttribs().GetPool()).toBe(target);
  expect(copy.GetCharAttribs()[0]?.GetItemHolder().getPool()).toBe(target);
  expect(copy.GetCharAttribs()).not.toBe(source.GetCharAttribs());
  expect(copy.GetCharAttribs()[0]).not.toBe(source.GetCharAttribs()[0]);
  expect(copy.GetWrongList()).not.toBe(wrong);
  expect(copy.isWrongListEqual(source)).toBe(true);
  source.GetParaAttribs().Put(new SfxInt16Item(EE.EE_PARA_JUST, 2));
  (source.GetCharAttribs()[0] as XEditAttribute).GetStart(true)[0] = 0;
  wrong.back().mnEnd = 4n;
  source.SetText(unicode("new"));
  source.SetStyle(unicode("new"));
  source.SetFamily(SfxStyleFamily.Page);
  expect(copy.GetText().equals(unicode("abc"))).toBe(true);
  expect(copy.GetStyle().equals(unicode("Body"))).toBe(true);
  expect(copy.GetFamily()).toBe(SfxStyleFamily.Cell);
  expect(copy.GetParaAttribs().Get(EE.EE_PARA_JUST).QueryValue()).toBe(3);
  expect(copy.GetCharAttribs()[0]?.GetStart()).toBe(1);
  expect(copy.GetWrongList()?.GetRanges()[0]?.mnEnd).toBe(3n);
  expect(copy.isWrongListEqual(source)).toBe(false);
  const uninitialized = new ContentInfo(new ContentInfo(sourcePool), target);
  expect(uninitialized.GetSharedString().isValid()).toBe(false);
  expect(uninitialized.GetWrongList()).toBeNull();
});
it("separates ordered payload equality from spelling equality and pool identity", /** Varies one native field at a time, including null spell states. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    a = content(pool),
    b = content(pool);
  expect(a.Equals(b, true)).toBe(true);
  expect(a.isWrongListEqual(b)).toBe(true);
  b.SetText(unicode("different"));
  expect(a.Equals(b, false)).toBe(false);
  b.SetText(a.GetText());
  b.SetStyle(unicode("style"));
  expect(a.Equals(b, false)).toBe(false);
  b.SetStyle(a.GetStyle());
  b.SetFamily(SfxStyleFamily.Page);
  expect(a.Equals(b, false)).toBe(false);
  b.SetFamily(a.GetFamily());
  b.GetParaAttribs().Put(new SfxInt16Item(EE.EE_PARA_START, 1));
  expect(a.Equals(b, false)).toBe(false);
  b.GetParaAttribs().ClearItem();
  const attr = new XEditAttribute(pool, new SfxInt16Item(EE.EE_CHAR_START, 1), 0, 1);
  a.GetCharAttribs().push(attr);
  expect(a.Equals(b, false)).toBe(false);
  b.GetCharAttribs().push(new XEditAttribute(attr));
  expect(a.Equals(b, true)).toBe(true);
  (b.GetCharAttribs()[0] as XEditAttribute).GetEnd(true)[0] = 2;
  expect(a.Equals(b, false)).toBe(false);
  (b.GetCharAttribs()[0] as XEditAttribute).GetEnd(true)[0] = 1;
  const wrong = new WrongList();
  a.SetWrongList(wrong);
  expect(a.Equals(b, true)).toBe(true);
  expect(a.isWrongListEqual(b)).toBe(false);
  expect(b.isWrongListEqual(a)).toBe(false);
  b.SetWrongList(wrong);
  expect(a.isWrongListEqual(b)).toBe(true);
  b.SetWrongList(wrong.Clone());
  expect(a.isWrongListEqual(b)).toBe(true);
  wrong.SetValid();
  expect(a.isWrongListEqual(b)).toBe(false);
});
it("preserves attribute lvalues, independent spans, feature limits and concrete item equality", /** Holder identity and item payload equality are intentionally distinct operations. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    item = new SfxInt16Item(EE.EE_CHAR_START, 4),
    a = new XEditAttribute(pool, item, -2, 3),
    b = new XEditAttribute(a),
    holder = a.GetItemHolder();
  expect(a.GetItem()).not.toBe(item);
  expect(holder).toBe(a.GetItemHolder());
  expect(a.GetLen()).toBe(5);
  expect(a.GetStart(true)).toBe(a.GetStart(true));
  expect(a.GetEnd(true)).toBe(a.GetEnd(true));
  expect(a.equals(b)).toBe(true);
  b.GetStart(true)[0] = -1;
  expect(a.equals(b)).toBe(false);
  b.GetStart(true)[0] = -2;
  b.GetEnd(true)[0] = 4;
  expect(a.equals(b)).toBe(false);
  b.GetEnd(true)[0] = 3;
  const target = new SfxItemPool();
  b.SetItem(target, new SfxInt16Item(EE.EE_CHAR_START, 5));
  expect(a.equals(b)).toBe(false);
  b.SetItem(target, new SfxInt16Item(EE.EE_CHAR_START, 4));
  expect(a.equals(b)).toBe(true);
  expect(b.GetItemHolder().getPool()).toBe(target);
  expect(b.GetStart()).toBe(-2);
  expect(b.GetEnd()).toBe(3);
  for (const [which, expected] of [
    [4077, false],
    [4078, true],
    [4081, true],
    [4082, false],
  ] as const) {
    a.SetItem(pool, new SfxInt16Item(which, 0));
    expect(a.IsFeature()).toBe(expected);
  }
  a.GetItemHolder().assign(new SfxPoolItemHolder());
  expect(a.GetItem()).toBeNull();
});
