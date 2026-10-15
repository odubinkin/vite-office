/** @fileoverview Native case-mode/script-hint/optical-size values and actual numeric/bool Any contracts, without UI labels or scanner services. */
import { expect, it } from "vitest";
import { SvxCaseMapItem as Case } from "../../inc/cmapitem";
import { SvxScriptHintItem as Hint } from "../../inc/scripthintitem";
import { SvxOpticalSizingItem as Optical } from "../../inc/opticalsizingitem";
import { SvxCaseMap as Mode } from "../../inc/svxenum";
import { ScriptHintType as Script } from "../../../i18nutil/inc/scriptchangescanner";
import * as PublishedCase from "../../../offapi/com/sun/star/style/CaseMap";
import * as PublishedScript from "../../../offapi/com/sun/star/text/ScriptHintType";
import { MID_SCRIPTHINT } from "../../inc/memberids";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SfxPoolItem } from "../../../svl/inc/poolitem";
import { SfxItemPool } from "../../../svl/source/items/itempool";

/** Extracts a real numeric member query. @param item - Actual mode item. @param type - Original numeric type. @param member - Selector. @returns Result. */
function read(item: Case | Hint, type: "sal_Int16" | "sal_uInt16", member = 0): number {
  const output = new Any(),
    value: [number] = [0];
  expect(item.QueryValue(output, member)).toBe(true);
  expect(output.extract(value, type)).toBe(true);
  return value[0];
}
it("retains exact native and IDL declarations and genuine EditEngine defaults", /** Default ids are from original solar/eeitem/eerdll, not a fabricated pool. @returns Nothing. */ () => {
  expect([
    Mode.NotMapped,
    Mode.Uppercase,
    Mode.Lowercase,
    Mode.Capitalize,
    Mode.SmallCaps,
    Mode.End,
  ]).toEqual([0, 1, 2, 3, 4, 5]);
  expect([
    PublishedCase.NONE,
    PublishedCase.UPPERCASE,
    PublishedCase.LOWERCASE,
    PublishedCase.TITLE,
    PublishedCase.SMALLCAPS,
  ]).toEqual([0, 1, 2, 3, 4]);
  expect([Script.Automatic, Script.Ignore, Script.Latin, Script.Asian, Script.Complex]).toEqual([
    0, 1, 2, 3, 4,
  ]);
  expect([
    PublishedScript.AUTOMATIC,
    PublishedScript.IGNORE,
    PublishedScript.LATIN,
    PublishedScript.ASIAN,
    PublishedScript.COMPLEX,
  ]).toEqual([0, 1, 2, 3, 4]);
  expect(MID_SCRIPTHINT).toBe(0);
  const factory = Case.CreateDefault();
  expect([factory.Which(), factory.GetCaseMap()]).toEqual([0, Mode.NotMapped]);
  const mode = new Case(Mode.NotMapped, 4071),
    hint = new Hint(4075),
    optical = new Optical(false, 4076);
  expect([
    mode.Which(),
    mode.GetValue(),
    hint.Which(),
    hint.GetValue(),
    optical.Which(),
    optical.GetValue(),
  ]).toEqual([4071, 0, 4075, 0, 4076, false]);
  expect([mode.QueryValue(), hint.QueryValue(), optical.QueryValue()]).toEqual([0, 0, false]);
});
it("copies complete actual values and concrete clones independently with original type/Which separation", /** No native cache/refcount manager is ported. @returns Nothing. */ () => {
  const mode = new Case(Mode.SmallCaps, 3),
    modeCopy = new Case(mode),
    hint = new Hint(Script.Asian, 4),
    hintCopy = new Hint(hint),
    optical = new Optical(true, 5),
    opticalCopy = new Optical(optical);
  const clones = [mode.Clone(new SfxItemPool()), hint.Clone(), optical.Clone()];
  for (const [item, copy] of [
    [mode, modeCopy],
    [hint, hintCopy],
    [optical, opticalCopy],
  ] as const) {
    expect(copy).not.toBe(item);
    expect(copy.equals(item)).toBe(true);
    const clone = item.Clone();
    expect(clone).not.toBe(item);
    expect(clone.Which()).toBe(item.Which());
    clone.SetWhich(8);
    expect(clone.equals(item)).toBe(true);
    expect(SfxPoolItem.areSame(clone, item)).toBe(false);
  }
  expect(clones[0]).toBeInstanceOf(Case);
  expect(clones[1]).toBeInstanceOf(Hint);
  expect(clones[2]).toBeInstanceOf(Optical);
  mode.SetValue(Mode.NotMapped);
  hint.SetValue(Script.Latin);
  optical.SetValue(false);
  expect([modeCopy.GetValue(), hintCopy.GetValue(), opticalCopy.GetValue()]).toEqual([4, 3, true]);
  expect(mode.equals(hint)).toBe(false);
});
it("maps every admitted case value through the original short query and unsigned16 write", /** Member selectors are ignored, including twips and unknown values. @returns Nothing. */ () => {
  const values: [Mode, number][] = [
    [Mode.NotMapped, 0],
    [Mode.Uppercase, 1],
    [Mode.Lowercase, 2],
    [Mode.Capitalize, 3],
    [Mode.SmallCaps, 4],
  ];
  const item = new Case(Mode.NotMapped, 1);
  for (const [mode, published] of values) {
    item.SetValue(mode);
    expect(item.GetCaseMap()).toBe(mode);
    expect(read(item, "sal_Int16")).toBe(published);
    expect(read(item, "sal_Int16", 255)).toBe(published);
    expect(item.PutValue(new Any([published], "sal_uInt16"), 255)).toBe(true);
    expect(item.GetCaseMap()).toBe(mode);
  }
  expect(item.PutValue(new Any([1], "sal_Int16"), 0)).toBe(true);
  expect(item.GetCaseMap()).toBe(Mode.Uppercase);
  const output = new Any(),
    value: [number] = [0];
  expect(item.QueryValue(output)).toBe(true);
  expect(output.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(1);
});
it("queries NONE for unknown stored case modes and rejects invalid writes without mutation", /** Native raw enum and property admission are separate contracts. @returns Nothing. */ () => {
  const item = new Case(Mode.End, 1);
  expect(item.QueryValue()).toBe(5);
  expect(read(item, "sal_Int16")).toBe(0);
  for (const value of [5, 6, 65535]) {
    expect(item.PutValue(new Any([value], "sal_uInt16"), 0)).toBe(false);
    expect(item.GetCaseMap()).toBe(Mode.End);
  }
  for (const bad of [new Any(), new Any([true], "bool"), 1]) {
    expect(item.PutValue(bad, 0)).toBe(false);
    expect(item.GetCaseMap()).toBe(Mode.End);
  }
});
it("preserves fixed unsigned16 hint storage, native aliases and all represented hint values", /** Direct enum argument conversion does not invent a declared-enum bound. @returns Nothing. */ () => {
  const item = new Hint(1);
  for (const value of [0, 1, 2, 3, 4, 5, 65535]) {
    expect(item.PutValue(new Any([value], "sal_uInt16"), 128)).toBe(true);
    expect(item.GetValue()).toBe(value);
    expect(read(item, "sal_uInt16")).toBe(value);
    expect(read(item, "sal_uInt16", 128)).toBe(value);
    expect(read(item, "sal_uInt16", 256)).toBe(value);
  }
  item.SetValue(-1 as Script);
  expect(item.GetValue()).toBe(65535);
  expect(new Hint(65536 as Script, 1).GetValue()).toBe(0);
  const output = new Any(),
    value: [number] = [0];
  expect(item.QueryValue(output)).toBe(true);
  expect(output.extract(value, "sal_uInt16")).toBe(true);
  expect(value[0]).toBe(65535);
  expect(item.PutValue(new Any([2], "sal_Int16"), 0)).toBe(true);
  expect(item.GetValue()).toBe(Script.Latin);
});
it("leaves unknown hint members untouched and retains values on native extraction failure", /** Unknown-member success does not run extraction or localization lookup. @returns Nothing. */ () => {
  const item = new Hint(Script.Complex, 1),
    output = new Any([77], "sal_Int32"),
    value: [number] = [0];
  expect(item.QueryValue(output, 7)).toBe(true);
  expect(output.extract(value, "sal_Int32")).toBe(true);
  expect(value[0]).toBe(77);
  expect(item.PutValue(new Any(), 7)).toBe(true);
  expect(item.GetValue()).toBe(Script.Complex);
  for (const bad of [new Any(), new Any([true], "bool"), 1]) {
    expect(item.PutValue(bad, 0)).toBe(false);
    expect(item.GetValue()).toBe(Script.Complex);
  }
});
it("uses the genuine shared bool contract for optical sizing without font-axis or UI providers", /** Actual Any type checks, scalar boundary and inherited metric default remain available. @returns Nothing. */ () => {
  const item = new Optical(false, 1),
    output = new Any(),
    value: [boolean] = [false];
  expect(item.PutValue(new Any([true], "bool"), 255)).toBe(true);
  expect(item.QueryValue(output, 128)).toBe(true);
  expect(output.extract(value, "bool")).toBe(true);
  expect(value[0]).toBe(true);
  expect(item.PutValue(new Any([2], "sal_Int16"), 0)).toBe(false);
  expect(item.GetValue()).toBe(true);
  expect(item.HasMetrics()).toBe(false);
});
