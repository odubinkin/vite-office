/** @fileoverview Native two-line UTF16 bracket and rotation member contracts through actual shared pool items and typed Any values. */
import { expect, it } from "vitest";
import { SvxTwoLinesItem } from "../../inc/twolinesitem";
import { SvxTextRotateItem, SvxCharRotateItem } from "../../inc/charrotateitem";
import { SvxBlinkItem } from "../../inc/blinkitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { SfxPoolItem } from "../../../svl/inc/poolitem";
import { SfxBoolItem } from "../../../svl/inc/eitem";

/** Creates an actual owned UNO string value. @param units - UTF16 input. @returns Typed Any. */
function stringAny(units: readonly number[]): Any {
  const string = new OUString(new Uint16Array(units), units.length);
  try {
    return new Any(string.getDataAddress(), "OUString");
  } finally {
    string.dispose();
  }
}
/** Extracts the actual UTF16 units of a queried UNO string. @param value - Typed Any. @returns Units. */
function units(value: Any): number[] {
  const string = new OUString();
  try {
    expect(value.extract(string, "OUString")).toBe(true);
    return [...string.getStr().slice(0, string.getLength())];
  } finally {
    string.dispose();
  }
}

it("copies all two-line fields, narrows constructor units and compares payloads independently of pool identity", /** Pins actual owned copy fields and shared type/Which comparison. @returns Nothing. */ () => {
  const item = new SvxTwoLinesItem(true, 0x1007b, -1, 12),
    clone = item.Clone();
  expect([clone.Which(), clone.GetValue(), clone.GetStartBracket(), clone.GetEndBracket()]).toEqual(
    [12, true, 123, 65535],
  );
  expect(clone).not.toBe(item);
  expect(item.equals(clone)).toBe(true);
  expect(item.equals(new SfxBoolItem(12, true))).toBe(false);
  expect(item.equals(new SvxTwoLinesItem(false, 123, 65535, 12))).toBe(false);
  expect(item.equals(new SvxTwoLinesItem(true, 124, 65535, 12))).toBe(false);
  expect(item.equals(new SvxTwoLinesItem(true, 123, 125, 12))).toBe(false);
  clone.SetWhich(13);
  expect(SfxPoolItem.areSame(item, clone)).toBe(false);
  expect(item.QueryValue()).toBeUndefined();
});

it("queries native bool and empty/nonempty single-unit strings with conversion-bit and byte selector behavior", /** Unknown members leave the original output intact. @returns Nothing. */ () => {
  const item = new SvxTwoLinesItem(true, 123, 0, 12),
    output = new Any(),
    flag: [boolean] = [false];
  expect(item.QueryValue(output, 0x180)).toBe(true);
  expect(output.extract(flag, "bool")).toBe(true);
  expect(flag[0]).toBe(true);
  expect(item.QueryValue(output, 1)).toBe(true);
  expect(units(output)).toEqual([123]);
  expect(item.QueryValue(output, 0x82)).toBe(true);
  expect(units(output)).toEqual([]);
  expect(item.QueryValue(output, 3)).toBe(false);
  expect(units(output)).toEqual([]);
  const inverse = new SvxTwoLinesItem(false, 0, 125, 12);
  expect(inverse.QueryValue(output, 1)).toBe(true);
  expect(units(output)).toEqual([]);
  expect(inverse.QueryValue(output, 2)).toBe(true);
  expect(units(output)).toEqual([125]);
  output.dispose();
});

it("keeps only the first UTF16 bracket unit and preserves fields after unknown or failed string extraction", /** Includes a surrogate pair and independent bracket clearing. @returns Nothing. */ () => {
  const item = new SvxTwoLinesItem(false, 123, 125, 12),
    pair = stringAny([0xd83d, 0xde00, 91]),
    empty = stringAny([]),
    end = stringAny([93, 125]);
  expect(item.PutValue(pair, 0x81)).toBe(true);
  expect(item.GetStartBracket()).toBe(0xd83d);
  expect(item.PutValue(end, 0x102)).toBe(true);
  expect(item.GetEndBracket()).toBe(93);
  expect(item.PutValue(empty, 1)).toBe(true);
  expect(item.GetStartBracket()).toBe(0);
  expect(item.PutValue(empty, 2)).toBe(true);
  expect(item.GetEndBracket()).toBe(0);
  expect(item.PutValue(true, 1)).toBe(false);
  const wrong = new Any([2], "sal_Int16");
  expect(item.PutValue(wrong, 2)).toBe(false);
  expect(item.PutValue(pair, 3)).toBe(false);
  const enabled = new Any([true], "bool");
  expect(item.PutValue(enabled, 0)).toBe(true);
  expect(item.GetValue()).toBe(true);
  expect(item.PutValue(pair, 0)).toBe(true);
  expect(item.GetValue()).toBe(false);
  for (const value of [pair, empty, end, wrong, enabled]) value.dispose();
});

it("retains unsigned text rotation storage and signed short query while limiting UNO writes", /** Constructor and setter storage are wider than the wire producer admission. @returns Nothing. */ () => {
  const item = new SvxTextRotateItem(-1, 15),
    output = new Any(),
    value: [number] = [0];
  expect(item.GetValue()).toBe(-1);
  expect(item.QueryValue()).toBe(65535);
  const negativeCopy = item.Clone();
  expect(negativeCopy.GetValue()).toBe(-1);
  expect(negativeCopy.QueryValue()).toBe(65535);
  negativeCopy.SetValue(-32768);
  expect(negativeCopy.GetValue()).toBe(-32768);
  expect(negativeCopy.QueryValue()).toBe(32768);
  expect(item.QueryValue(output, 0x180)).toBe(true);
  expect(output.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(-1);
  expect(item.QueryValue(output, 1)).toBe(false);
  for (const angle of [0, 900, 2700]) {
    const input = new Any([angle], "sal_Int16");
    expect(item.PutValue(input, 0x80)).toBe(true);
    expect(item.GetValue()).toBe(angle);
    input.dispose();
  }
  for (const angle of [-1, 1, 899, 901, 2701]) {
    const input = new Any([angle], "sal_Int16");
    expect(item.PutValue(input, 0)).toBe(false);
    expect(item.GetValue()).toBe(2700);
    input.dispose();
  }
  expect(item.PutValue(900, 0)).toBe(false);
  const wrong = stringAny([57, 48, 48]);
  expect(item.PutValue(wrong, 0)).toBe(false);
  expect(item.PutValue(wrong, 1)).toBe(false);
  const clone = item.Clone();
  expect(clone).not.toBe(item);
  expect(clone.Which()).toBe(15);
  expect(clone.GetValue()).toBe(2700);
  expect(clone.IsTopToBottom()).toBe(true);
  expect(clone.IsBottomToTop()).toBe(false);
  expect(clone.IsVertical()).toBe(true);
  clone.SetBottomToTop();
  expect(clone.IsBottomToTop()).toBe(true);
  expect(clone.IsVertical()).toBe(true);
  clone.SetTopToBottom();
  expect(clone.IsTopToBottom()).toBe(true);
  clone.SetValue(1);
  expect(clone.IsVertical()).toBe(false);
  expect(item.IsTopToBottom()).toBe(true);
  output.dispose();
  wrong.dispose();
});

it("owns rotation and fit independently and delegates exactly the native typed selectors", /** Clones, direct setters and Any2Bool fallback retain original behavior. @returns Nothing. */ () => {
  const item = SvxCharRotateItem.CreateDefault(),
    output = new Any(),
    flag: [boolean] = [true],
    value: [number] = [-1];
  expect([item.Which(), item.GetValue(), item.IsFitToLine()]).toEqual([0, 0, false]);
  item.SetTopToBottom();
  item.SetFitToLine(true);
  const clone = item.Clone();
  expect(clone).not.toBe(item);
  expect(clone.equals(item)).toBe(true);
  expect(clone.QueryValue()).toBe(2700);
  expect(clone.QueryValue(output, 0)).toBe(true);
  expect(output.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(2700);
  expect(clone.QueryValue(output, 0x81)).toBe(true);
  expect(output.extract(flag, "bool")).toBe(true);
  expect(flag[0]).toBe(true);
  expect(clone.QueryValue(output, 2)).toBe(false);
  expect(clone.PutValue(false, 0x81)).toBe(true);
  expect(clone.IsFitToLine()).toBe(false);
  expect(item.IsFitToLine()).toBe(true);
  expect(clone.equals(item)).toBe(false);
  const input = new Any([900], "sal_Int16");
  expect(clone.PutValue(input, 0)).toBe(true);
  expect(clone.equals(item)).toBe(false);
  expect(clone.PutValue(input, 2)).toBe(false);
  const empty = stringAny([]);
  expect(clone.PutValue(empty, 0)).toBe(false);
  expect(clone.equals(new SvxTextRotateItem(900, 0))).toBe(false);
  expect(new SvxCharRotateItem(900, true, 0).IsFitToLine()).toBe(true);
  output.dispose();
  input.dispose();
  empty.dispose();
});

it("reuses native bool ownership for blink without a second value model", /** Concrete cloning retains the independent source value and Which. @returns Nothing. */ () => {
  const item = new SvxBlinkItem(true, 20),
    clone = item.Clone();
  expect(clone).not.toBe(item);
  expect(clone.Which()).toBe(20);
  expect(clone.GetValue()).toBe(true);
  clone.SetValue(false);
  expect(item.GetValue()).toBe(true);
  expect(clone.GetValue()).toBe(false);
});
