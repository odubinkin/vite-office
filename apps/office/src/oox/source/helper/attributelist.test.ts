/** @fileoverview Original XString decoding, surrogate truncation and actual FastAttributeList optional/defaulted Unicode ownership. */
import { assert, expect, it } from "vitest";
import { AttributeConversion as C, AttributeList } from "./attributelist";
import { sanitizeStringSurrogates } from "../../../comphelper/source/misc/string";
import { FastAttributeList } from "../../../sax/source/tools/fastattribs";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
it.each([
  ["", ""],
  ["short", "short"],
  ["long plain text", "long plain text"],
  ["pre_x0041_Ω", "preAΩ"],
  ["_x00af__x00AF_", "¯¯"],
  ["_x005F_x0041_", "_x0041_"],
  ["_x0000_", "\0"],
  ["_x000A_", "\n"],
  ["_xD83D__xDE00_", "😀"],
  ["_xD800_tail", ""],
  ["ok_xDC00_tail", "ok"],
  ["ok_xD800__x0041_tail", "ok"],
  ["_X0041_", "_X0041_"],
  ["_x0041", "_x0041"],
  ["_x0041!", "_x0041!"],
  ["_y0041_", "_y0041_"],
  ["_xg041_", "_xg041_"],
  ["_x0g41_", "_x0g41_"],
  ["_x00g1_", "_x00g1_"],
  ["_x004g_", "_x004g_"],
  ["_x0041_x0042_", "Ax0042_"],
  ["a\0_x0042_", "a\0B"],
  ["long\ud800plain", "long\ud800plain"],
  ["\ud800_xZZZZ_", ""],
  ["_xD83D_😀", ""],
  ["😀_x0041_", "😀A"],
] as const)(
  "retains original XString %j",
  /** Literal original decoder outputs. @param source - Unicode text. @param expected - Original result. @returns Nothing. */ (
    source,
    expected,
  ) => {
    const input = unicode(source),
      result = C.decodeXString(input);
    try {
      expect(text(result)).toBe(expected);
      expect(text(input)).toBe(source);
    } finally {
      result.dispose();
      input.dispose();
    }
  },
);
it.each([
  ["😀ok", "😀ok"],
  ["ok\ud800", "ok"],
  ["ok\ud800x", "ok"],
  ["ok\udc00tail", "ok"],
  ["", ""],
] as const)(
  "sanitizes %j with original prefix truncation",
  /** Actual SAL Unicode sanitizer. @param source - Input. @param expected - Prefix. @returns Nothing. */ (
    source,
    expected,
  ) => {
    const input = unicode(source),
      result = sanitizeStringSurrogates(input);
    try {
      expect(text(result)).toBe(expected);
      if (source === expected) expect(result.pData).toBe(input.pData);
    } finally {
      result.dispose();
      input.dispose();
    }
  },
);
it("uses first duplicate, counted UTF8 values and distinct missing/empty/default semantics", /** Exercises real contiguous attribute storage and SAL ownership. @returns Nothing. */ () => {
  const fast = new FastAttributeList();
  fast.add(1, "A\0😀");
  fast.add(1, "ignored");
  fast.add(2, "");
  fast.add(3, "_x0041_");
  const attrs = new AttributeList(fast),
    fallback = unicode("_x0042_");
  const first = attrs.getString(1),
    empty = attrs.getString(2),
    defaulted = attrs.getStringDefaulted(4),
    present = attrs.getStringDefaulted(1),
    decoded = attrs.getXString(3),
    value = attrs.getString(4, fallback),
    missing = attrs.getXString(4, fallback),
    existing = attrs.getString(1, fallback),
    withDefault = attrs.getXString(3, fallback);
  assert(first !== undefined && empty !== undefined && decoded !== undefined);
  try {
    expect(attrs.getFastAttributeList()).toBe(fast);
    expect(attrs.hasAttribute(1)).toBe(true);
    expect(attrs.hasAttribute(4)).toBe(false);
    expect(attrs.getString(4)).toBeUndefined();
    expect(attrs.getXString(4)).toBeUndefined();
    expect(text(first)).toBe("A\0😀");
    expect(text(empty)).toBe("");
    expect(text(defaulted)).toBe("");
    expect(text(present)).toBe("A\0😀");
    expect(text(decoded)).toBe("A");
    expect(text(withDefault)).toBe("A");
    expect(text(value)).toBe("_x0042_");
    expect(text(missing)).toBe("_x0042_");
    expect(text(existing)).toBe("A\0😀");
    expect(value.pData).toBe(fallback.pData);
    fast.clear();
    expect(text(first)).toBe("A\0😀");
  } finally {
    for (const owned of [
      first,
      empty,
      defaulted,
      present,
      decoded,
      value,
      missing,
      existing,
      withDefault,
      fallback,
    ])
      owned.dispose();
  }
});
