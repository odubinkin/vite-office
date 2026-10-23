/** @fileoverview Native fontitem.hxx/textitem.cxx value construction, defaults, mutations, equality, hashing and full browser state; no replacement font or descriptor provider. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { expect, it } from "vitest";
import { SvxFontItem } from "../../inc/fontitem";
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import * as Encoding from "../../../sal/inc/rtl/textenc";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import {
  getFontFamilyFromGeneric,
  getFontFamilyGeneric,
  getFontPitchGeneric,
  getFontPitchFromGeneric,
} from "../../../xmloff/source/style/fonthdl";
it("retains original empty Swiss variable-pitch unknown-encoding defaults and all native constructors", /** Native valid Unicode values are never CSS-validated by the item. @returns Nothing. */ () => {
  const item = new SvxFontItem(77),
    defaultItem = SvxFontItem.CreateDefault();
  expect(defaultItem.Which()).toBe(0);
  expect(item.QueryValue()).toEqual({
    familyName: "",
    styleName: "",
    family: FontFamily.FAMILY_SWISS,
    pitch: FontPitch.PITCH_VARIABLE,
    charSet: Encoding.RTL_TEXTENCODING_DONTKNOW,
  });
  expect(defaultItem.QueryValue()).toEqual(item.QueryValue());
  const source = new SvxFontItem(
      FontFamily.FAMILY_ROMAN,
      "😀\0Face",
      " Regular ",
      FontPitch.PITCH_FIXED,
      Encoding.RTL_TEXTENCODING_UNICODE,
      100,
    ),
    copy = new SvxFontItem(source),
    clone = source.Clone(new SfxItemPool());
  expect(copy).not.toBe(source);
  expect(clone).not.toBe(source);
  expect(copy.QueryValue()).toEqual(source.QueryValue());
  expect(clone.Which()).toBe(100);
  expect(source.equals(source)).toBe(true);
  expect(copy.equals(source)).toBe(true);
  expect(copy.hashCode()).toBe(source.hashCode());
  expect(source.equals(new SfxInt16Item(100, 0))).toBe(false);
  clone.SetWhich(111);
  expect(clone.equals(source)).toBe(true);
  expect(clone.hashCode()).not.toBe(source.hashCode());
  source.SetFamilyName(" ");
  expect(copy.GetFamilyName()).toBe("😀\0Face");
  expect(source.GetFamilyName()).toBe(" ");
  expect(
    new SvxFontItem(
      FontFamily.FAMILY_DONTKNOW,
      "",
      "",
      FontPitch.PITCH_DONTKNOW,
      -1,
      1,
    ).GetCharSet(),
  ).toBe(65535);
});
it("retains every native field, idempotent setters and independent clone comparisons", /** Each native state field participates in equality and the declared native hash fold. @returns Nothing. */ () => {
  const base = new SvxFontItem(7),
    operations = [
      /** Changes the native family name. @param item - Owned font item. @returns Nothing. */
      (item: SvxFontItem) => item.SetFamilyName("Face"),
      /** Changes the native style name. @param item - Owned font item. @returns Nothing. */
      (item: SvxFontItem) => item.SetStyleName("Bold"),
      /** Changes the native family enum. @param item - Owned font item. @returns Nothing. */
      (item: SvxFontItem) => item.SetFamily(FontFamily.FAMILY_MODERN),
      /** Changes the native pitch enum. @param item - Owned font item. @returns Nothing. */
      (item: SvxFontItem) => item.SetPitch(FontPitch.PITCH_FIXED),
      /** Changes the native charset. @param item - Owned font item. @returns Nothing. */
      (item: SvxFontItem) => item.SetCharSet(Encoding.RTL_TEXTENCODING_SYMBOL),
    ];
  base.SetFamilyName("");
  base.SetStyleName("");
  base.SetFamily(FontFamily.FAMILY_SWISS);
  base.SetPitch(FontPitch.PITCH_VARIABLE);
  base.SetCharSet(Encoding.RTL_TEXTENCODING_DONTKNOW);
  for (const operation of operations) {
    const item = base.Clone();
    operation(item);
    operation(item);
    expect(item.equals(base)).toBe(false);
    expect(item.hashCode()).not.toBe(base.hashCode());
    expect(item.Clone().equals(item)).toBe(true);
  }
  expect([base.GetFamily(), base.GetPitch(), base.GetCharSet(), base.GetStyleName()]).toEqual([
    FontFamily.FAMILY_SWISS,
    FontPitch.PITCH_VARIABLE,
    Encoding.RTL_TEXTENCODING_DONTKNOW,
    "",
  ]);
});
it("retains original numeric declarations and the exact shared ODF font-family enum table", /** No encoding conversion engine or inferred default font is introduced. @returns Nothing. */ () => {
  expect([
    FontFamily.FAMILY_DONTKNOW,
    FontFamily.FAMILY_SWISS,
    FontFamily.FontFamily_FORCE_EQUAL_SIZE,
  ]).toEqual([0, 5, 2147483647]);
  expect([
    FontPitch.PITCH_DONTKNOW,
    FontPitch.PITCH_FIXED,
    FontPitch.PITCH_VARIABLE,
    FontPitch.FontPitch_FORCE_EQUAL_SIZE,
  ]).toEqual([0, 1, 2, 2147483647]);
  expect([
    Encoding.RTL_TEXTENCODING_DONTKNOW,
    Encoding.RTL_TEXTENCODING_SYMBOL,
    Encoding.RTL_TEXTENCODING_USER_START,
    Encoding.RTL_TEXTENCODING_USER_DETECTED,
    Encoding.RTL_TEXTENCODING_USER_END,
    Encoding.RTL_TEXTENCODING_UCS4,
    Encoding.RTL_TEXTENCODING_UCS2,
    Encoding.RTL_TEXTENCODING_UNICODE,
  ]).toEqual([0, 10, 32768, 32768, 61439, 65534, 65535, 65535]);
  for (const [name, family] of [
    ["decorative", 1],
    ["modern", 2],
    ["roman", 3],
    ["script", 4],
    ["swiss", 5],
    ["system", 6],
  ] as const) {
    expect(getFontFamilyFromGeneric(name)).toBe(family);
    expect(getFontFamilyGeneric(family)).toBe(name);
  }
  expect(getFontFamilyFromGeneric(undefined)).toBe(FontFamily.FAMILY_DONTKNOW);
  expect(getFontFamilyFromGeneric("unknown")).toBe(FontFamily.FAMILY_DONTKNOW);
  expect(getFontFamilyGeneric(FontFamily.FAMILY_DONTKNOW)).toBeUndefined();
  expect(getFontFamilyGeneric(0x10003 as FontFamily)).toBe("roman");
  expect(getFontPitchGeneric(0x10000 as FontPitch)).toBeUndefined();
  expect(getFontPitchGeneric(FontPitch.FontPitch_FORCE_EQUAL_SIZE)).toBe("fixed");
  expect(getFontPitchFromGeneric("fixed")).toBe(FontPitch.PITCH_FIXED);
  expect(getFontPitchFromGeneric("variable")).toBe(FontPitch.PITCH_VARIABLE);
  expect(getFontPitchFromGeneric("invalid")).toBe(FontPitch.PITCH_DONTKNOW);
});

it("transports independent native font members through typed Any without mutating on failed extraction", /** Covers exact fontitem scalar members consumed by Writer property maps. @returns Nothing. */ () => {
  const item = new SvxFontItem(77),
    input = new Any(),
    output = new Any(),
    name = new OUString(new Uint16Array([0x41, 0, 0x42]), 3),
    extracted = new OUString();
  try {
    input.insert(name.getDataAddress(), "OUString");
    for (const member of [1, 2]) {
      expect(item.PutValue(input, member | 0x80)).toBe(true);
      expect(item.QueryValue(output, member)).toBe(true);
      expect(output.extract(extracted, "OUString")).toBe(true);
      expect(extracted.equals(name)).toBe(true);
    }
    for (const [member, expected] of [
      [3, 3],
      [4, 76],
      [5, 1],
    ] as const) {
      input.insert([expected], "sal_Int16");
      expect(item.PutValue(input, member)).toBe(true);
      expect(item.QueryValue(output, member | 0x80)).toBe(true);
      const actual: [number] = [0];
      expect(output.extract(actual, "sal_Int16")).toBe(true);
      expect(actual[0]).toBe(expected);
    }
    const before = item.QueryValue();
    input.insert([true], "bool");
    expect(item.PutValue(input, 1)).toBe(false);
    expect(item.QueryValue()).toEqual(before);
    const retained = new Any(output);
    try {
      expect(item.QueryValue(output, 127)).toBe(true);
      expect(output.operatorEquals(retained)).toBe(true);
    } finally {
      retained.dispose();
    }
  } finally {
    input.dispose();
    output.dispose();
    name.dispose();
    extracted.dispose();
  }
});
