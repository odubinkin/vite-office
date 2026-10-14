/** @fileoverview Original direction and Asian bool values over actual shared Any and item owners. */
import { expect, it } from "vitest";
import { SvxFrameDirectionItem as Item } from "../../inc/frmdiritem";
import { SvxFrameDirection as D } from "../../inc/frmdir";
import { WritingMode2 as W } from "../../../offapi/com/sun/star/text/WritingMode2";
import { SvxScriptSpaceItem as Script } from "../../inc/scriptspaceitem";
import { SvxHangingPunctuationItem as Hanging } from "../../inc/hngpnctitem";
import { SvxForbiddenRuleItem as Forbidden } from "../../inc/forbiddenruleitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { SfxItemPool } from "../../../svl/source/items/itempool";
/** Native internal-to-wire mapping. */
const mapping = [
  [D.Horizontal_LR_TB, 0],
  [D.Horizontal_RL_TB, 1],
  [D.Vertical_RL_TB, 2],
  [D.Vertical_LR_TB, 3],
  [D.Environment, 4],
  [D.Vertical_LR_BT, 5],
  [D.Vertical_RL_TB90, 6],
  [D.Stacked, 7],
] as const;
it("maps every original direction using signed16 Any and ignores members", /** Actual native wire conversion. @returns Nothing. */ () => {
  expect([D.Unknown, W.PAGE, W.CONTEXT, W.STACKED]).toEqual([-1, 4, 4, 7]);
  const item = new Item(D.Unknown, 138),
    out = new Any(true);
  for (const [direction, wire] of mapping) {
    expect(item.PutValue(wire, 255)).toBe(true);
    expect(item.GetValue()).toBe(direction);
    expect(item.QueryValue()).toBe(wire);
    expect(item.QueryValue(out, 128)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.SHORT);
    const value: [number] = [-1];
    expect(out.extract(value, "sal_Int16")).toBe(true);
    expect(value[0]).toBe(wire);
    item.SetValue(D.Unknown);
    expect(item.PutValue(out)).toBe(true);
    expect(item.GetValue()).toBe(direction);
  }
  out.dispose();
});
it("retains failed typed writes and invalid native query output unchanged", /** Exact signed short domain and native unknown enum query failure. @returns Nothing. */ () => {
  const item = new Item(D.Environment, 138),
    out = new Any(true);
  for (const wrong of [
    undefined,
    null,
    true,
    "1",
    {},
    [],
    1.5,
    NaN,
    Infinity,
    -32769,
    32768,
    -1,
    8,
  ]) {
    expect(item.PutValue(wrong)).toBe(false);
    expect(item.GetValue()).toBe(D.Environment);
  }
  for (const wrong of [
    new Any(true),
    new Any([65535], "sal_uInt16"),
    new Any([65536], "sal_Int32"),
    new Any([8], "sal_Int16"),
  ]) {
    expect(item.PutValue(wrong)).toBe(false);
    expect(item.GetValue()).toBe(D.Environment);
    wrong.dispose();
  }
  item.SetValue(D.Unknown);
  expect(item.QueryValue(out)).toBe(false);
  const value: [boolean] = [false];
  expect(out.extract(value, "bool")).toBe(true);
  expect(value[0]).toBe(true);
  expect(item.QueryValue()).toBe(65535);
  out.dispose();
});
it("copies direction identity and independent values using original enum base", /** Copy and Clone retain Which. @returns Nothing. */ () => {
  const item = new Item(D.Stacked, 138),
    copy = new Item(item),
    clone = item.Clone(new SfxItemPool());
  expect(copy).not.toBe(item);
  expect(clone).not.toBe(item);
  expect([copy.Which(), clone.Which(), clone.GetValue()]).toEqual([138, 138, D.Stacked]);
  expect(item.equals(copy)).toBe(true);
  copy.SetWhich(99);
  expect(item.equals(copy)).toBe(true);
  expect(item.hashCode()).toBe(138 ^ 7);
  expect(item.supportsHashCode()).toBe(true);
  item.SetEnumValue(0);
  expect(item.GetValue()).toBe(D.Horizontal_LR_TB);
  expect(copy.GetValue()).toBe(D.Stacked);
  expect(item.equals(copy)).toBe(false);
  expect(item.equals(new Script(true, 138))).toBe(false);
});
it("preserves all3Asian bool subclass argument orders copy Clone and inherited typed transport", /** Uses native shared bool implementation once. @returns Nothing. */ () => {
  for (const Class of [Script, Hanging, Forbidden]) {
    const item = new Class(false, 126),
      copy = new Class(item),
      clone = item.Clone(new SfxItemPool()),
      out = new Any();
    expect(item.QueryValue(out, 255)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.BOOLEAN);
    expect(item.PutValue(out, 128)).toBe(true);
    expect(item.QueryValue()).toBe(false);
    const yes = new Any(true);
    expect(item.PutValue(yes, 0)).toBe(true);
    expect(item.PutValue(yes, 0)).toBe(true);
    yes.dispose();
    const no = new Any(false);
    expect(item.PutValue(no, 0)).toBe(true);
    no.dispose();
    const wrong = new Any([1], "sal_Int16");
    expect(item.PutValue(wrong, 0)).toBe(false);
    wrong.dispose();
    expect(item.PutValue(true, 0)).toBe(true);
    expect(item.equals(new Class(true, 199))).toBe(true);
    expect(item.equals(new Class(false, 126))).toBe(false);
    expect([copy.Which(), clone.Which(), copy.GetValue(), clone.QueryValue()]).toEqual([
      126,
      126,
      false,
      false,
    ]);
    expect(clone).toBeInstanceOf(Class);
    out.dispose();
  }
});
