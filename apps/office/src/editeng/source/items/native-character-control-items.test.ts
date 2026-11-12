/** @fileoverview Native hidden/no-hyphen bool identity and unsigned revision-session item transport through real Any owners. */
import { expect, it } from "vitest";
import { SvxCharHiddenItem } from "../../inc/charhiddenitem";
import { SvxNoHyphenItem } from "../../inc/nhypitem";
import { SvxRsidItem } from "../../inc/rsiditem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { SfxItemPresentation } from "../../../svl/inc/poolitem";
import { MapUnit } from "../../../tools/inc/mapunit";

it.each([SvxCharHiddenItem, SvxNoHyphenItem])(
  "retains concrete bool identity, copy and native Any conversion for %s",
  /** Uses original inherited bool contracts without replacing their owner. @param Item - Concrete native class. @returns Nothing. */
  (Item) => {
    for (const flag of [false, true]) {
      const item = new Item(flag, 37),
        copy = item.Clone(),
        output = new Any(),
        input = new Any([!flag], "bool");
      try {
        expect(copy).toBeInstanceOf(Item);
        expect(copy).not.toBe(item);
        expect(copy.Which()).toBe(37);
        expect(copy.equals(item)).toBe(true);
        expect(item.QueryValue(output)).toBe(true);
        const value: [boolean] = [!flag];
        expect(output.extract(value, "bool")).toBe(true);
        expect(value[0]).toBe(flag);
        expect(copy.PutValue(input, 0)).toBe(true);
        expect(copy.GetValue()).toBe(!flag);
        expect(item.GetValue()).toBe(flag);
        expect(copy.equals(item)).toBe(false);
      } finally {
        input.dispose();
        output.dispose();
        copy.Dispose();
        item.Dispose();
      }
    }
    const hidden = new SvxCharHiddenItem(false, 37),
      noHyphen = new SvxNoHyphenItem(false, 37);
    expect(hidden.equals(noHyphen)).toBe(false);
    hidden.Dispose();
    noHyphen.Dispose();
  },
);

it.each([0, 0x7fffffff, 0x80000000, 0xffffffff])(
  "keeps native unsigned revision Any for %s independently of signed base transport",
  /** Pins unsigned extraction, output type and implicit copy. @param value - Native unsigned32 value. @returns Nothing. */
  (value) => {
    const item = new SvxRsidItem(value, 39),
      copy = item.Clone(),
      output = new Any(),
      input = new Any([value], "sal_uInt32");
    try {
      expect(copy).toBeInstanceOf(SvxRsidItem);
      expect(copy.Which()).toBe(39);
      expect(copy.equals(item)).toBe(true);
      expect(copy.QueryValue()).toBe(value);
      expect(item.QueryValue(output, 255)).toBe(true);
      const extracted: [number] = [0];
      expect(output.extract(extracted, "sal_uInt32")).toBe(true);
      expect(extracted[0]).toBe(value);
      copy.SetValue(17);
      expect(copy.PutValue(input)).toBe(true);
      expect(copy.GetValue()).toBe(value);
      expect(item.QueryValue(output)).toBe(true);
    } finally {
      output.dispose();
      input.dispose();
      copy.Dispose();
      item.Dispose();
    }
  },
);
it("rejects non-convertible revision values without mutation and preserves the original empty presentation", /** Real native values exercise failure and C++ parameter narrowing. @returns Nothing. */ () => {
  const item = new SvxRsidItem(-1, 39),
    wrong = new Any([true], "bool"),
    empty = new Any(),
    output = new OUString(new Uint8Array([120, 0]));
  try {
    expect(item.GetValue()).toBe(0xffffffff);
    expect(item.PutValue(wrong, 128)).toBe(false);
    expect(item.PutValue(empty, 0)).toBe(false);
    expect(item.PutValue(5, 0)).toBe(false);
    expect(item.GetValue()).toBe(0xffffffff);
    expect(
      item.GetPresentation(
        SfxItemPresentation.Complete,
        MapUnit.MapTwip,
        MapUnit.Map100thMM,
        output,
        undefined,
      ),
    ).toBe(false);
    expect(output.getLength()).toBe(0);
  } finally {
    output.dispose();
    empty.dispose();
    wrong.dispose();
    item.Dispose();
  }
});
