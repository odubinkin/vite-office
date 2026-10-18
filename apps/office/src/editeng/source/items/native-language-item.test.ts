/** @fileoverview Source language value defaults/casts and scalar Any behavior, without guessed Locale services. */
import { expect, it } from "vitest";
import { SvxLanguageItem as Item } from "../../inc/langitem";
import {
  LanguageType,
  primary,
  LANGUAGE_MASK_PRIMARY,
  LANGUAGE_DONTKNOW,
  LANGUAGE_NONE,
  LANGUAGE_SYSTEM,
  LANGUAGE_HID_HUMAN_INTERFACE_DEVICE,
  LANGUAGE_INVARIANT,
  LANGUAGE_GERMAN,
} from "../../../i18nlangtag/inc/lang";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { MID_LANG_INT as INT, MID_LANG_LOCALE as LOCALE } from "../../inc/memberids";
import { SfxInt16Item } from "../../../svl/inc/intitem";

it("retains native special/default identities and primitive unsigned16 conversion", /** Native strong_int is a compile-time tag, not a JS memory object. @returns Nothing. */ () => {
  expect([
    LANGUAGE_MASK_PRIMARY,
    LANGUAGE_DONTKNOW,
    LANGUAGE_NONE,
    LANGUAGE_SYSTEM,
    LANGUAGE_HID_HUMAN_INTERFACE_DEVICE,
    LANGUAGE_INVARIANT,
    LANGUAGE_GERMAN,
  ]).toEqual([0x3ff, 0x3ff, 0xff, 0, 0x4ff, 0x7f, 0x407]);
  expect([
    LanguageType(-1),
    LanguageType(65536),
    LanguageType(65537),
    primary(LANGUAGE_GERMAN),
    primary(0xffff),
  ]).toEqual([65535, 0, 1, 7, 1023]);
  const value = Item.CreateDefault();
  expect(value.Which()).toBe(0);
  expect(value.GetLanguage()).toBe(LANGUAGE_GERMAN);
  expect(typeof value.GetLanguage()).toBe("number");
});
it("copies actual language values and compares concrete payload independently of Which", /** Initialized enum assignment always receives the native unsigned16 value. @returns Nothing. */ () => {
  const item = new Item(LANGUAGE_DONTKNOW, 110),
    copy = new Item(item),
    clone = item.Clone();
  expect([copy.Which(), clone.Which(), clone.GetLanguage()]).toEqual([110, 110, LANGUAGE_DONTKNOW]);
  expect(copy).not.toBe(item);
  expect(clone.equals(item)).toBe(true);
  clone.SetWhich(115);
  expect(clone.equals(item)).toBe(true);
  clone.SetValue(65537);
  expect(clone.GetLanguage()).toBe(1);
  expect(clone.equals(item)).toBe(false);
  copy.SetEnumValue(-1);
  expect(copy.GetLanguage()).toBe(65535);
  expect(item.GetLanguage()).toBe(LANGUAGE_DONTKNOW);
  expect(item.equals(new SfxInt16Item(110, LANGUAGE_DONTKNOW))).toBe(false);
  expect(new Item(-1, 110).QueryValue()).toBe(65535);
});
it("queries signed16 Any and preserves unknown or unsupported Locale destinations", /** Real Locale conversion is pending; the existing Locale struct is not duplicated. @returns Nothing. */ () => {
  const item = new Item(0x8000, 110),
    out = new Any(),
    value: [number] = [0];
  expect(item.QueryValue(out)).toBe(true);
  expect(out.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(-32768);
  item.SetValue(0xffff);
  expect(item.QueryValue(out, INT | 0x180)).toBe(true);
  out.extract(value, "sal_Int16");
  expect(value[0]).toBe(-1);
  const before = new Any(out);
  expect(item.QueryValue(out, 99)).toBe(true);
  expect(out.operatorEquals(before)).toBe(true);
  expect(item.QueryValue(out, LOCALE)).toBe(false);
  expect(out.operatorEquals(before)).toBe(true);
});
it("extracts native int32 before unsigned16 narrowing and rejects wrong types unchanged", /** Query short and Put long are deliberately asymmetric native contracts. @returns Nothing. */ () => {
  const item = new Item(LANGUAGE_DONTKNOW, 110);
  expect(item.PutValue(new Any([-1], "sal_Int32"), INT)).toBe(true);
  expect(item.GetLanguage()).toBe(65535);
  expect(item.PutValue(new Any([65537], "sal_Int32"), INT | 0x80)).toBe(true);
  expect(item.GetLanguage()).toBe(1);
  expect(item.PutValue(new Any([-32768], "sal_Int16"), INT)).toBe(true);
  expect(item.GetLanguage()).toBe(32768);
  expect(item.PutValue(new Any(true), INT)).toBe(false);
  expect(item.GetLanguage()).toBe(32768);
  expect(item.PutValue(2147483647, INT)).toBe(true);
  expect(item.GetLanguage()).toBe(65535);
  for (const value of ["bad", 1.5, -2147483649, 2147483648])
    expect(item.PutValue(value, INT)).toBe(false);
  expect(item.PutValue({}, 99)).toBe(true);
  expect(item.GetLanguage()).toBe(65535);
  expect(item.PutValue({}, LOCALE)).toBe(false);
  expect(item.GetLanguage()).toBe(65535);
});
