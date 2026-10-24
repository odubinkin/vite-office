/** @fileoverview Exact original-ICU captures for default fixed-direction bidi and every Unicode property; no source reference or native library is required when replaying these regression tests. */
import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import native from "./native-bidi-vectors.json";
import { resolveDefaultBidiLevels } from "./ubidi";
import {
  ubidi_getClass,
  u_charDirection,
  ubidi_getPairedBracketType,
  ubidi_getPairedBracket,
  getMirror,
} from "./ubidi_props";
import { UTRIE2_GET16 } from "./utrie2.h";
import { ubidi_props_trie } from "./ubidi_props_data";
import { UCharDirection } from "./unicode/uchar";
it("matches original ICU78.3 levels and logical-run counts over retained conformance/control/overflow/UTF16 captures", /** Uses compiled original API outputs,including removed-control levels,not only canonical UBA parity. @returns Nothing. */ () => {
  expect(native.icuVersion).toBe("78.3");
  expect(native.count).toBe(93808);
  expect(native.failures).toEqual([]);
  for (const item of native.vectors) {
    const levels = resolveDefaultBidiLevels(
      String.fromCharCode(...item.units),
      item.initial as 0 | 1,
    );
    expect(levels, JSON.stringify(item)).toEqual(item.levels);
    let count = levels.length === 0 ? 0 : 1;
    for (let i = 1; i < levels.length; ++i) if (levels[i] !== levels[i - 1]) ++count;
    expect(count).toBe(item.count);
  }
});
it("matches the complete original three-property byte stream for every Unicode code point", /** Original property values are compared independently of the bidi algorithm. @returns Nothing. */ () => {
  const bytes = Buffer.alloc(0x110000 * 12);
  for (let c = 0; c <= 0x10ffff; ++c) {
    bytes.writeUInt32LE(u_charDirection(c), c * 12);
    bytes.writeUInt32LE(ubidi_getPairedBracketType(c), c * 12 + 4);
    bytes.writeUInt32LE(ubidi_getPairedBracket(c), c * 12 + 8);
  }
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(native.propertySha256);
  expect(
    Object.values(UCharDirection).filter(
      /** Selects numeric enum members. @param value - Runtime member. @returns Whether numeric. */ (
        value,
      ) => typeof value === "number",
    ),
  ).toEqual(
    Array.from(
      { length: 24 },
      /** Retains original enum order. @param _unused - Unused value. @param index - Native identity. @returns Identity. */ (
        _unused,
        index,
      ) => index,
    ),
  );
});
it("preserves native empty,invalid scalar and trivial-direction optimization results", /** The source fast path deliberately collapses same-direction embedding levels;canonical conformance levels are not a substitute for this API capture. @returns Nothing. */ () => {
  expect(resolveDefaultBidiLevels("", 0)).toEqual([]);
  expect(resolveDefaultBidiLevels("", 1)).toEqual([]);
  expect(resolveDefaultBidiLevels("a\u202ab\u202c 1 2", 0)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  for (const c of [-1, 0x110000]) {
    expect(ubidi_getClass(c)).toBe(0);
    expect(ubidi_getPairedBracketType(c)).toBe(0);
    expect(ubidi_getPairedBracket(c)).toBe(c);
  }
});
it("retains original mirror fallback on explicitly inconsistent static-helper inputs", /** These mismatched property/codepoint pairs cannot occur through the immutable production trie. The direct original helper boundary preserves its defensive fallback without a coverage ignore or fabricated installed character. @returns Nothing. */ () => {
  expect(getMirror(0xab, UTRIE2_GET16(ubidi_props_trie, 0xab))).toBe(0xbb);
  expect(getMirror(0, 0x8000)).toBe(0);
  expect(getMirror(0x10ffff, 0x8000)).toBe(0x10ffff);
});
