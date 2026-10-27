/** @fileoverview Native fill item Any rejection and untrusted browser transport boundaries. */
import { expect, it } from "vitest";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import {
  MID_COMPLEX_COLOR,
  MID_COLOR_LUM_MOD,
  MID_COLOR_LUM_OFF,
  MID_COLOR_THEME_INDEX,
} from "../../editeng/inc/memberids";
import { Color } from "../../tools/inc/color";
import { XColorItem } from "../inc/xcolit";
import { NameOrIndex } from "../inc/xit";
import { XFillStyleItem } from "../inc/xfillit0";
import { XFillColorItem } from "../inc/xflclit";
import { XFillTransparenceItem } from "../inc/xfltrit";
import {
  XATTR_FILLSTYLE,
  XATTR_FILLTRANSPARENCE,
  XATTR_FILLUSESLIDEBACKGROUND,
  XATTR_FILLCOLOR,
} from "../inc/xdef";
import { encodeFillItem, decodeFillItem } from "./fill-item-codec";

it.each([
  [XATTR_FILLSTYLE, NaN],
  [XATTR_FILLSTYLE, 2147483648],
  [XATTR_FILLSTYLE, -2147483649],
  [XATTR_FILLSTYLE, 1.5],
  [XATTR_FILLTRANSPARENCE, -1],
  [XATTR_FILLTRANSPARENCE, 101],
  [XATTR_FILLTRANSPARENCE, "50"],
  [XATTR_FILLUSESLIDEBACKGROUND, 1],
  [XATTR_FILLCOLOR, null],
  [XATTR_FILLCOLOR, []],
  [XATTR_FILLCOLOR, 4],
  [XATTR_FILLCOLOR, { name: 0, index: -1, color: 0 }],
  [XATTR_FILLCOLOR, { name: "Color", index: 2147483648, color: 0 }],
  [XATTR_FILLCOLOR, { name: "Color", index: -1, color: 4294967296 }],
  [XATTR_FILLCOLOR, { name: "Color", index: -1, color: -1 }],
] as const)(
  "rejects invalid fill wire value for Which %i",
  /** Checks actual external data validation before constructing a native item. @param which - Native identity. @param value - Malformed wire payload. @returns Nothing. */ (
    which,
    value,
  ) => {
    expect(
      /** Decodes the untrusted record. @returns Native item or failure. */ () =>
        decodeFillItem({ which, value } as unknown as Parameters<typeof decodeFillItem>[0]),
    ).toThrow("invalid");
  },
);

it("preserves RGB Any rejection and indexed color preconditions", /** Exercises original native color member guards without flattening palette identity. @returns Nothing. */ () => {
  const item = new XColorItem(1015, new Color(0x123456)),
    output = new Any(),
    wrong = new Any(true);
  try {
    expect(item.QueryValue()).toBeUndefined();
    expect(item.QueryValue(output, MID_COMPLEX_COLOR)).toBe(false);
    expect(item.PutValue({}, 0)).toBe(false);
    expect(item.PutValue(wrong, 0)).toBe(false);
    expect(item.PutValue(output, MID_COMPLEX_COLOR)).toBe(false);
    const indexed = new XColorItem(1015, 2, new Color(0xabcdef));
    expect(
      /** Reads a forbidden non-indexed reference. @returns Resolved color. */ () =>
        indexed.GetColorValue(),
    ).toThrow("assert(!IsIndex())");
    expect(item.GetColorValue().toUInt32()).toBe(0x123456);
    expect(new NameOrIndex().supportsHashCode()).toBe(false);
  } finally {
    output.dispose();
    wrong.dispose();
  }
});

it("preserves typed fill defaults and transparency hash/value rejection", /** Covers real Any ownership, scalar queries and narrowing assertions. @returns Nothing. */ () => {
  const style = XFillStyleItem.CreateDefault(),
    transparency = new XFillTransparenceItem(37),
    wrong = new Any(true),
    excessive = new Any([101], "sal_Int32");
  try {
    expect(style.QueryValue()).toBe(1);
    expect(style.PutValue({}, 0)).toBe(false);
    expect(transparency.QueryValue()).toBe(37);
    expect(transparency.supportsHashCode()).toBe(true);
    expect(transparency.hashCode()).toBe(transparency.Clone().hashCode());
    expect(transparency.hashCode()).not.toBe(new XFillTransparenceItem(38).hashCode());
    expect(transparency.PutValue({}, 0)).toBe(false);
    expect(transparency.PutValue(wrong, 0)).toBe(false);
    expect(
      /** Calls the native unsigned value constructor. @returns Item or assertion. */ () =>
        new XFillTransparenceItem(101),
    ).toThrow("assert(m_nValue <= 100)");
    expect(
      /** Tests the native post-extraction range assertion. @returns Success or assertion. */ () =>
        transparency.PutValue(excessive, 0),
    ).toThrow("assert(m_nValue <= 100)");
  } finally {
    wrong.dispose();
    excessive.dispose();
  }
});

it.each([MID_COLOR_LUM_MOD, MID_COLOR_LUM_OFF, MID_COLOR_THEME_INDEX])(
  "rejects invalid native fill color Any member %i",
  /** Ensures malformed properties do not mutate native complex state. @param member - Native property selector. @returns Nothing. */ (
    member,
  ) => {
    const color = new XFillColorItem("Fill", new Color(0)),
      value = new Any(true);
    try {
      expect(color.QueryValue()).toBeUndefined();
      expect(color.PutValue({}, member)).toBe(false);
      expect(color.PutValue(value, member)).toBe(false);
    } finally {
      value.dispose();
    }
  },
);

it("distinguishes unsupported item families and roundtrips direct resolved colors", /** Verifies the browser transport family switch without palette detachment. @returns Nothing. */ () => {
  const color = new XFillColorItem("Direct", new Color(0x123456));
  const record = encodeFillItem(color);
  expect(record?.value).toMatchObject({ name: "Direct", index: -1, color: 0x123456 });
  expect(encodeFillItem(new XColorItem(1015, new Color(0)))).toBeNull();
  expect(decodeFillItem({ which: 9999, value: 0 })).toBeNull();
  const input = new Any([500], "sal_Int16"),
    output = new Any();
  try {
    expect(color.PutValue(input, MID_COLOR_LUM_OFF)).toBe(true);
    expect(color.QueryValue(output, MID_COLOR_LUM_OFF)).toBe(true);
    const result: [number] = [0];
    expect(output.extract(result, "sal_Int16")).toBe(true);
    expect(result[0]).toBe(500);
  } finally {
    input.dispose();
    output.dispose();
  }
});
