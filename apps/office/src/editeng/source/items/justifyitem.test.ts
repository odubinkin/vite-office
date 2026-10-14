/** @fileoverview Checks actual alignment items, real generated enum type bindings, original member conversions and failure histories. */
import { expect, it } from "vitest";
import {
  SvxHorJustifyItem as HI,
  SvxVerJustifyItem as VI,
  SvxJustifyMethodItem as JI,
} from "../../inc/justifyitem";
import {
  SvxCellHorJustify as H,
  SvxCellVerJustify as V,
  SvxCellJustifyMethod as J,
} from "../../inc/svxenum";
import { MID_HORJUST_HORJUST as CELL, MID_HORJUST_ADJUST as ADJUST } from "../../inc/memberids";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import {
  CellHoriJustify as UH,
  cppu_detail_getUnoType_CellHoriJustify as ht,
} from "../../../offapi/com/sun/star/table/CellHoriJustify";
import {
  VerticalAlignment as UV,
  cppu_detail_getUnoType_VerticalAlignment as vt,
} from "../../../offapi/com/sun/star/style/VerticalAlignment";
import { ParagraphAdjust as P } from "../../../offapi/com/sun/star/style/ParagraphAdjust";
import { CellJustifyMethod as CJ } from "../../../offapi/com/sun/star/table/CellJustifyMethod";
import { CellVertJustify2 as CV } from "../../../offapi/com/sun/star/table/CellVertJustify2";
it("preserves original IDs, literal enum values, default factories and copy-based Clone", /** Checks actual constructors and real shared generic inheritance. @returns Nothing. */ () => {
  expect([CELL, ADJUST]).toEqual([0, 1]);
  expect([H.Standard, H.Left, H.Center, H.Right, H.Block, H.Repeat]).toEqual([0, 1, 2, 3, 4, 5]);
  expect([V.Standard, V.Top, V.Center, V.Bottom, V.Block]).toEqual([0, 1, 2, 3, 4]);
  expect([J.Auto, J.Distribute, CJ.AUTO, CJ.DISTRIBUTE]).toEqual([0, 1, 0, 1]);
  expect([
    UH.STANDARD,
    UH.LEFT,
    UH.CENTER,
    UH.RIGHT,
    UH.BLOCK,
    UH.REPEAT,
    UH.MAKE_FIXED_SIZE,
  ]).toEqual([0, 1, 2, 3, 4, 5, 2147483647]);
  expect([UV.TOP, UV.MIDDLE, UV.BOTTOM, UV.MAKE_FIXED_SIZE]).toEqual([0, 1, 2, 2147483647]);
  expect([
    P.LEFT,
    P.RIGHT,
    P.BLOCK,
    P.CENTER,
    P.STRETCH,
    P.START,
    P.END,
    P.MAKE_FIXED_SIZE,
  ]).toEqual([0, 1, 2, 3, 4, 5, 6, 2147483647]);
  expect(CV).toEqual({ STANDARD: 0, TOP: 1, CENTER: 2, BOTTOM: 3, BLOCK: 4 });
  for (const item of [HI.CreateDefault(), VI.CreateDefault()])
    expect([item.Which(), item.GetValue()]).toEqual([0, 0]);
  expect(new HI(129).GetValue()).toBe(H.Standard);
  expect(new VI(132).GetValue()).toBe(V.Standard);
  const h = new HI(H.Right, 129);
  h.SetWhich(999);
  const hc = new HI(h);
  const hclone = h.Clone();
  h.SetValue(H.Left);
  expect([hc.Which(), hclone.Which(), hc.GetValue(), hclone.GetValue()]).toEqual([
    999,
    999,
    H.Right,
    H.Right,
  ]);
  const v = new VI(V.Bottom, 132);
  const vc = new VI(v);
  const vclone = v.Clone();
  v.SetValue(V.Top);
  expect([vc.Which(), vclone.Which(), vc.GetValue(), vclone.GetValue()]).toEqual([
    132,
    132,
    V.Bottom,
    V.Bottom,
  ]);
  const j = new JI(J.Distribute, 130);
  const jc = new JI(j);
  const jclone = j.Clone();
  j.SetValue(J.Auto);
  expect([jc.Which(), jclone.Which(), jc.GetValue(), jclone.GetValue()]).toEqual([
    130,
    130,
    J.Distribute,
    J.Distribute,
  ]);
});
it("queries every horizontal mapping with exact enum/short Any types and unknown-member untouched success", /** Uses original generated normal static enum getter cold/warm through real CPPU. @returns Nothing. */ () => {
  const out = new Any(true);
  const item = new HI(129);
  for (const [value, cell, paragraph] of [
    [H.Standard, 0, 0],
    [H.Left, 1, 0],
    [H.Center, 2, 3],
    [H.Right, 3, 1],
    [H.Block, 4, 2],
    [H.Repeat, 5, 0],
    [99 as H, 0, 0],
  ] as const) {
    item.SetValue(value);
    expect(item.QueryValue()).toBe(cell);
    expect(item.QueryValue(CELL | 128)).toBe(cell);
    expect(item.QueryValue(ADJUST)).toBe(paragraph);
    expect(item.QueryValue(out)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.ENUM);
    expect(out.getValueType().equals(ht())).toBe(true);
    const result: [number] = [9];
    expect(out.extract(result, ht)).toBe(true);
    expect(result[0]).toBe(cell);
    expect(item.QueryValue(out, 257)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.SHORT);
    expect(out.extract(result, "sal_Int16")).toBe(true);
    expect(result[0]).toBe(paragraph);
  }
  out.insert([true], "bool");
  expect(item.QueryValue(out, 2)).toBe(true);
  const keep: [boolean] = [false];
  expect(out.extract(keep, "bool")).toBe(true);
  expect(keep[0]).toBe(true);
  expect(item.QueryValue(2)).toBeUndefined();
  out.dispose();
  expect(ht()).toBe(ht());
});
it("writes horizontal enum/integer and paragraph-short inputs with original fallbacks", /** Tests unchanged failure and source-backed unknown/default mappings. @returns Nothing. */ () => {
  const item = new HI(H.Right, 129);
  for (const [input, expected] of [
    [0, H.Standard],
    [1, H.Left],
    [2, H.Center],
    [3, H.Right],
    [4, H.Block],
    [5, H.Repeat],
    [99, H.Standard],
  ] as const) {
    const a = new Any([input], ht);
    expect(item.PutValue(a)).toBe(true);
    expect(item.GetValue()).toBe(expected);
    a.dispose();
    const n = new Any([input], "sal_Int32");
    expect(item.PutValue(n, CELL | 128)).toBe(true);
    expect(item.GetValue()).toBe(expected);
    n.dispose();
    expect(item.PutValue(input)).toBe(true);
    expect(item.GetValue()).toBe(expected);
  }
  for (const [input, expected] of [
    [P.LEFT, H.Left],
    [P.RIGHT, H.Right],
    [P.BLOCK, H.Block],
    [P.CENTER, H.Center],
    [P.STRETCH, H.Block],
    [P.START, H.Standard],
    [P.END, H.Standard],
    [99, H.Standard],
  ] as const) {
    const a = new Any([input], "sal_Int16");
    expect(item.PutValue(a, ADJUST | 128)).toBe(true);
    expect(item.GetValue()).toBe(expected);
    a.dispose();
    expect(item.PutValue(input, 257)).toBe(true);
    expect(item.GetValue()).toBe(expected);
  }
  item.SetValue(H.Right);
  for (const a of [new Any(true), new Any([0], vt)]) {
    expect(item.PutValue(a)).toBe(false);
    expect(item.GetValue()).toBe(H.Right);
    a.dispose();
  }
  const long = new Any([0], "sal_Int32");
  expect(item.PutValue(long, ADJUST)).toBe(false);
  long.dispose();
  expect(item.GetValue()).toBe(H.Right);
  for (const [input, member] of [
    [null, 0],
    [true, 0],
    ["1", 0],
    [NaN, 0],
    [1.5, 0],
    [-2147483649, 0],
    [2147483648, 0],
    [-32769, 1],
    [32768, 1],
  ] as const)
    expect(item.PutValue(input, member)).toBe(false);
  expect(item.GetValue()).toBe(H.Right);
  expect(item.PutValue(null, 2)).toBe(true);
  expect(item.GetValue()).toBe(H.Right);
});
it("queries vertical enum versus integer members and preserves failed default write reset", /** Covers native default-member semantics and exact enum extraction. @returns Nothing. */ () => {
  const item = new VI(132);
  const out = new Any(true);
  for (const [value, cell, alignment] of [
    [V.Standard, 0, 0],
    [V.Top, 1, 0],
    [V.Center, 2, 1],
    [V.Bottom, 3, 2],
    [V.Block, 4, 0],
    [99 as V, 0, 0],
  ] as const) {
    item.SetValue(value);
    expect(item.QueryValue()).toBe(cell);
    expect(item.QueryValue(2)).toBe(cell);
    expect(item.QueryValue(out)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.LONG);
    const result: [number] = [9];
    expect(out.extract(result, "sal_Int32")).toBe(true);
    expect(result[0]).toBe(cell);
    expect(item.QueryValue(ADJUST)).toBe(alignment);
    expect(item.QueryValue(out, ADJUST | 128)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.ENUM);
    expect(out.getValueType().equals(vt())).toBe(true);
    expect(out.extract(result, vt)).toBe(true);
    expect(result[0]).toBe(alignment);
  }
  for (const [input, expected] of [
    [0, V.Standard],
    [1, V.Top],
    [2, V.Center],
    [3, V.Bottom],
    [4, V.Block],
    [99, V.Standard],
  ] as const) {
    const a = new Any([input], "sal_Int32");
    expect(item.PutValue(a)).toBe(true);
    expect(item.GetValue()).toBe(expected);
    a.dispose();
    expect(item.PutValue(input, 2)).toBe(true);
    expect(item.GetValue()).toBe(expected);
  }
  for (const [input, expected] of [
    [UV.TOP, V.Top],
    [UV.MIDDLE, V.Center],
    [UV.BOTTOM, V.Bottom],
    [99, V.Standard],
  ] as const) {
    const a = new Any([input], vt);
    expect(item.PutValue(a, ADJUST | 128)).toBe(true);
    expect(item.GetValue()).toBe(expected);
    a.dispose();
    expect(item.PutValue(input, ADJUST)).toBe(true);
    expect(item.GetValue()).toBe(expected);
  }
  item.SetValue(V.Bottom);
  const bad = new Any(true);
  expect(item.PutValue(bad, ADJUST)).toBe(false);
  expect(item.GetValue()).toBe(V.Bottom);
  expect(item.PutValue(bad)).toBe(true);
  expect(item.GetValue()).toBe(V.Standard);
  bad.dispose();
  item.SetValue(V.Bottom);
  expect(item.PutValue(null, 2)).toBe(true);
  expect(item.GetValue()).toBe(V.Standard);
  out.dispose();
  expect(vt()).toBe(vt());
});
it("preserves justification method integer mapping and failed-write immutability", /** Tests all source switches including valid fixed-int unknown values. @returns Nothing. */ () => {
  const item = new JI(J.Auto, 130);
  const out = new Any(true);
  for (const [value, expected] of [
    [J.Auto, 0],
    [J.Distribute, 1],
    [99 as J, 0],
  ] as const) {
    item.SetValue(value);
    expect(item.QueryValue()).toBe(expected);
    expect(item.QueryValue(out)).toBe(true);
    expect(item.QueryValue(out, 255)).toBe(true);
    const result: [number] = [9];
    expect(out.getValueTypeClass()).toBe(TypeClass.LONG);
    expect(out.extract(result, "sal_Int32")).toBe(true);
    expect(result[0]).toBe(expected);
  }
  for (const [input, expected] of [
    [0, J.Auto],
    [1, J.Distribute],
    [99, J.Auto],
  ] as const) {
    const a = new Any([input], "sal_Int32");
    expect(item.PutValue(a)).toBe(true);
    expect(item.GetValue()).toBe(expected);
    a.dispose();
    expect(item.PutValue(input, 255)).toBe(true);
    expect(item.GetValue()).toBe(expected);
  }
  item.SetValue(J.Distribute);
  const bad = new Any(true);
  expect(item.PutValue(bad)).toBe(false);
  expect(item.GetValue()).toBe(J.Distribute);
  bad.dispose();
  out.dispose();
});
