/** @fileoverview Native paragraph adjustment bit/default/value/Any contracts and actual Writer persistence. */
import { describe, expect, it } from "vitest";
import { SvxAdjust, SvxAdjustItem } from "../../inc/adjustitem";
import {
  MID_PARA_ADJUST,
  MID_LAST_LINE_ADJUST,
  MID_EXPAND_SINGLE,
  MID_WORD_SPACING,
  MID_WORD_SPACING_MIN,
  MID_WORD_SPACING_MAX,
  MID_LETTER_SPACING_MIN,
  MID_LETTER_SPACING_MAX,
  MID_SCALE_WIDTH_MIN,
  MID_SCALE_WIDTH_MAX,
  MID_PARAGRAPH_COMPOSER,
} from "../../inc/memberids";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import { CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import {
  TabAlign,
  cppu_detail_getUnoType_TabAlign as alignType,
} from "../../../offapi/com/sun/star/style/TabAlign";
import { encodeSfxPoolItem, decodeSfxPoolItem } from "../../../sw/browser/filter/xml/item-codec";
import { createWriterDocument } from "../../../sw/source/core/doc/doc";
import { RES_PARATR_ADJUST } from "../../../sw/inc/hintids";

/** Reads the actual declared short/bool Any property rather than a JSON core facade. @param item - Native item. @param member - Native member. @returns Primitive scalar. */
function query(item: SvxAdjustItem, member: number): number | boolean {
  const output = new Any();
  expect(item.QueryValue(output, member)).toBe(true);
  const flag =
    (member & 255 & ~CONVERT_TWIPS) === MID_EXPAND_SINGLE ||
    (member & 255 & ~CONVERT_TWIPS) === MID_PARAGRAPH_COMPOSER;
  expect(output.getValueTypeClass()).toBe(flag ? TypeClass.BOOLEAN : TypeClass.SHORT);
  const result: [number | boolean] = [0];
  expect(output.extract(result, flag ? "bool" : "sal_Int16")).toBe(true);
  output.dispose();
  return result[0];
}

const numbers = [
  [MID_WORD_SPACING, "GetPropWordSpacing", "SetPropWordSpacing", 100, false],
  [MID_WORD_SPACING_MIN, "GetPropWordSpacingMinimum", "SetPropWordSpacingMinimum", 100, false],
  [MID_WORD_SPACING_MAX, "GetPropWordSpacingMaximum", "SetPropWordSpacingMaximum", 100, false],
  [MID_LETTER_SPACING_MIN, "GetPropLetterSpacingMinimum", "SetPropLetterSpacingMinimum", 0, true],
  [MID_LETTER_SPACING_MAX, "GetPropLetterSpacingMaximum", "SetPropLetterSpacingMaximum", 0, true],
  [MID_SCALE_WIDTH_MIN, "GetPropScaleWidthMinimum", "SetPropScaleWidthMinimum", 100, true],
  [MID_SCALE_WIDTH_MAX, "GetPropScaleWidthMaximum", "SetPropScaleWidthMaximum", 100, true],
] as const;

describe("native paragraph adjustment", /** Groups original complete item value and actual typed properties. @returns Nothing. */ () => {
  it("retains exact factory/defaults and primary bit mapping including BlockLine fallback", /** Checks declared enum IDs independently of legacy browser alignment mappings. @returns Nothing. */ () => {
    const value = SvxAdjustItem.CreateDefault();
    expect(value.Which()).toBe(0);
    expect(value.GetAdjust()).toBe(SvxAdjust.ParaStart);
    expect(value.GetOneWord()).toBe(SvxAdjust.Left);
    expect(value.GetLastBlock()).toBe(SvxAdjust.Left);
    expect(value.GetParagraphComposer()).toBe(false);
    expect([
      SvxAdjust.Left,
      SvxAdjust.Right,
      SvxAdjust.Block,
      SvxAdjust.Center,
      SvxAdjust.BlockLine,
      SvxAdjust.ParaStart,
      SvxAdjust.ParaEnd,
      SvxAdjust.End,
      SvxAdjust.LAST,
    ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 7]);
    for (const [member, getter, , initial] of numbers) {
      expect(value[getter]()).toBe(initial);
      expect(query(value, member | CONVERT_TWIPS | 256)).toBe(initial);
    }
    for (const [argument, want] of [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 0],
      [5, 5],
      [6, 6],
      [7, 0],
      [99, 0],
    ] as const) {
      const item = new SvxAdjustItem(argument as SvxAdjust, 4016);
      expect(item.GetAdjust()).toBe(want);
      item.SetAdjust(SvxAdjust.Center);
      item.SetAdjust(argument as SvxAdjust);
      expect(query(item, MID_PARA_ADJUST)).toBe(want);
    }
    expect(
      new SvxAdjustItem(SvxAdjust.BlockLine, 1).equals(new SvxAdjustItem(SvxAdjust.Left, 2)),
    ).toBe(true);
    expect(
      /** Rejects a nonnative fractional enum argument. @returns Invalid item. */ () =>
        new SvxAdjustItem(0.5 as SvxAdjust, 1),
    ).toThrow("adjustment");
    expect(value.QueryValue()).toBeUndefined();
  });
  it("copies independent complete state and compares/hashes every participating field", /** Tests inactive raw flags, numeric values and source field hashing without a native binary hash claim. @returns Nothing. */ () => {
    const base = new SvxAdjustItem(SvxAdjust.Left, 1);
    base.SetOneWord(SvxAdjust.Block);
    expect(base.GetOneWord()).toBe(SvxAdjust.Left);
    expect(query(base, MID_EXPAND_SINGLE)).toBe(true);
    const copy = new SvxAdjustItem(base);
    expect(copy.Which()).toBe(1);
    expect(copy.equals(base)).toBe(true);
    expect(copy.hashCode()).toBe(base.hashCode());
    copy.SetAdjust(SvxAdjust.Block);
    expect(copy.GetOneWord()).toBe(SvxAdjust.Block);
    expect(base.GetAdjust()).toBe(SvxAdjust.Left);
    const fresh = new SvxAdjustItem(SvxAdjust.Block, 4);
    expect(fresh.GetOneWord()).toBe(SvxAdjust.Left);
    fresh.SetOneWord(SvxAdjust.Block);
    expect(fresh.GetOneWord()).toBe(SvxAdjust.Block);
    fresh.SetOneWord(SvxAdjust.Center);
    expect(fresh.GetOneWord()).toBe(SvxAdjust.Left);
    expect(base.supportsHashCode()).toBe(true);
    expect(base.equals(new SfxBoolItem(1, false))).toBe(false);
    const original = new SvxAdjustItem(SvxAdjust.ParaStart, 1);
    const mutations = [
      /** Changes the primary mode. @param item - Native copy. @returns Nothing. */ (
        item: SvxAdjustItem,
      ) => item.SetAdjust(SvxAdjust.Right),
      /** Changes the raw single-word flag. @param item - Native copy. @returns Nothing. */ (
        item: SvxAdjustItem,
      ) => item.SetOneWord(SvxAdjust.Block),
      /** Changes the last-center bit. @param item - Native copy. @returns Nothing. */ (
        item: SvxAdjustItem,
      ) => item.SetLastBlock(SvxAdjust.Center),
      /** Changes the last-block bit. @param item - Native copy. @returns Nothing. */ (
        item: SvxAdjustItem,
      ) => item.SetLastBlock(SvxAdjust.Block),
      /** Changes paragraph composer. @param item - Native copy. @returns Nothing. */ (
        item: SvxAdjustItem,
      ) => item.SetParagraphComposer(true),
    ];
    for (const change of mutations) {
      const item = original.Clone();
      change(item);
      expect(original.equals(item)).toBe(false);
      expect(original.hashCode()).not.toBe(item.hashCode());
      expect(item.Clone().equals(item)).toBe(true);
    }
    for (const [, getter, setter] of numbers) {
      const item = original.Clone();
      item[setter](item[getter]() + 1);
      expect(original.equals(item)).toBe(false);
      expect(original.hashCode()).not.toBe(item.hashCode());
      expect(item.Clone().equals(item)).toBe(true);
    }
    const other = new SvxAdjustItem(SvxAdjust.ParaStart, 999);
    expect(other.equals(original)).toBe(true);
    expect(other.hashCode()).toBe(original.hashCode());
  });
  it("preserves declared direct numeric widths and unchecked property extraction defaults", /** Checks short transport over unsigned word state and signed letter/glyph state. @returns Nothing. */ () => {
    const item = new SvxAdjustItem(SvxAdjust.Left, 1);
    for (const [member, getter, setter, , signed] of numbers) {
      item[setter](65535);
      expect(item[getter]()).toBe(signed ? -1 : 65535);
      expect(query(item, member)).toBe(-1);
      item[setter](65536);
      expect(item[getter]()).toBe(0);
      item[setter](-32769);
      expect(item[getter]()).toBe(32767);
      const valid = new Any([-32768], "sal_Int16");
      expect(item.PutValue(valid, member | CONVERT_TWIPS | 256)).toBe(true);
      valid.dispose();
      expect(item[getter]()).toBe(signed ? -32768 : 32768);
      expect(query(item, member)).toBe(-32768);
      const invalid = new Any(true);
      expect(item.PutValue(invalid, member)).toBe(true);
      invalid.dispose();
      expect(item[getter]()).toBe(signed ? -1 : 65535);
      expect(query(item, member)).toBe(-1);
    }
  });
  it("uses actual enum2int admission and distinct last-line validation without invented failures", /** Checks enum/numeric Any values and original untouched success cases. @returns Nothing. */ () => {
    const item = new SvxAdjustItem(SvxAdjust.Center, 1);
    for (const n of [0, 1, 2, 3, 4, 5, 6]) {
      const input = new Any([n], "sal_Int32");
      expect(item.PutValue(input, 0)).toBe(true);
      input.dispose();
      expect(item.GetAdjust()).toBe(n === 4 ? SvxAdjust.Left : n);
    }
    const enumValue = new Any([TabAlign.CENTER], alignType);
    expect(item.PutValue(enumValue, 0)).toBe(true);
    expect(item.GetAdjust()).toBe(SvxAdjust.Right);
    enumValue.dispose();
    for (const n of [-1, 7, 99]) {
      const input = new Any([n], "sal_Int32");
      const before = item.Clone();
      expect(item.PutValue(input, 0)).toBe(true);
      expect(item.PutValue(input, 1)).toBe(true);
      expect(item.equals(before)).toBe(true);
      input.dispose();
    }
    const invalid = new Any(true),
      before = item.Clone();
    expect(item.PutValue(invalid, 0)).toBe(true);
    expect(item.PutValue(invalid, 1)).toBe(true);
    expect(item.equals(before)).toBe(true);
    invalid.dispose();
    for (const n of [0, 2, 3]) {
      const input = new Any([n], "sal_Int16");
      expect(item.PutValue(input, MID_LAST_LINE_ADJUST)).toBe(true);
      input.dispose();
      expect(query(item, MID_LAST_LINE_ADJUST)).toBe(n);
    }
    for (const n of [1, 4, 5, 6]) {
      const input = new Any([n], "sal_Int16"),
        prior = item.Clone();
      expect(item.PutValue(input, MID_LAST_LINE_ADJUST)).toBe(false);
      expect(item.equals(prior)).toBe(true);
      input.dispose();
    }
    const zero = new Any([0], "sal_Int32");
    expect(item.PutValue(zero, MID_PARA_ADJUST | CONVERT_TWIPS | 256)).toBe(true);
    zero.dispose();
    expect(item.GetAdjust()).toBe(SvxAdjust.Left);
  });
  it("reuses actual Any2Bool fallback and preserves unknown members without mutating output", /** Checks independent boolean state even when primary mode hides it. @returns Nothing. */ () => {
    const item = new SvxAdjustItem(SvxAdjust.Left, 1);
    for (const member of [MID_EXPAND_SINGLE, MID_PARAGRAPH_COMPOSER]) {
      for (const [value, want] of [
        [true, true],
        [false, false],
        [2, true],
        [0, false],
      ] as const) {
        const input = typeof value === "boolean" ? new Any(value) : new Any([value], "sal_Int32");
        expect(item.PutValue(input, member | CONVERT_TWIPS)).toBe(true);
        input.dispose();
        expect(query(item, member)).toBe(want);
      }
      const invalid = new Any();
      expect(item.PutValue(invalid, member)).toBe(true);
      expect(query(item, member)).toBe(false);
      invalid.dispose();
    }
    const input = new Any(),
      output = new Any([77], "sal_Int32"),
      before = item.Clone();
    expect(item.PutValue(input, 127)).toBe(true);
    expect(item.QueryValue(output, 127 | CONVERT_TWIPS)).toBe(true);
    expect(item.equals(before)).toBe(true);
    const value: [number] = [0];
    expect(output.extract(value, "sal_Int32")).toBe(true);
    expect(value[0]).toBe(77);
    input.dispose();
    output.dispose();
  });
  it("preserves every reachable flag and numeric field through the existing Writer JSON boundary", /** Keeps raw single-word state that a primary-mode getter intentionally hides. @returns Nothing. */ () => {
    const item = new SvxAdjustItem(SvxAdjust.Left, RES_PARATR_ADJUST);
    item.SetOneWord(SvxAdjust.Block);
    item.SetLastBlock(SvxAdjust.Center);
    item.SetParagraphComposer(true);
    for (const [, getter, setter] of numbers) item[setter](item[getter]() + 7);
    const pool = createWriterDocument().GetAttrPool(),
      snapshot = encodeSfxPoolItem(item),
      restored = decodeSfxPoolItem(pool, snapshot) as SvxAdjustItem;
    expect(snapshot.value.expandSingle).toBe(true);
    expect(restored.GetOneWord()).toBe(SvxAdjust.Left);
    expect(restored.equals(item)).toBe(true);
    restored.SetAdjust(SvxAdjust.Block);
    expect(restored.GetOneWord()).toBe(SvxAdjust.Block);
    expect(item.GetAdjust()).toBe(SvxAdjust.Left);
    const legacy = decodeSfxPoolItem(pool, {
      which: RES_PARATR_ADJUST,
      value: SvxAdjust.Center,
    }) as SvxAdjustItem;
    expect(legacy.equals(new SvxAdjustItem(SvxAdjust.Center, RES_PARATR_ADJUST))).toBe(true);
  });
});
