/** @fileoverview Source-backed quote/token offsets and range conversion using actual document/address/string owners; no injected parsers or grammar providers. */
import { expect, it } from "vitest";
import { ScRangeStringConverter as C } from "../../../inc/rangeutl";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { ScRangeList } from "../../../inc/rangelst";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const OOX = FormulaGrammar.AddressConvention.CONV_XL_OOX;
it("converts native Unicode parameters to unsigned16 before searching", /** Exercises native code-unit parameter conversions. @returns Nothing. */ () => {
  expect(C.IndexOf("A:B", 0x1003a, 0, 0x10027)).toBe(1);
  expect(C.IndexOfDifferent("  A", 0x10020, 0)).toBe(2);
});
it("appends valid ranges while retaining existing entries and reporting failed tokens", /** Exercises actual native owners and literal source outcomes. @returns Nothing. */ () => {
  const doc = document(),
    ranges = new ScRangeList(new ScRange(7, 8, 0));
  try {
    expect(C.GetRangeListFromString(ranges, "A1 A0 B2", doc, OOX)).toBe(false);
    expect(ranges.size()).toBe(3);
    expect(ranges.at(0).aStart.GetVars()).toEqual([7, 8, 0]);
    expect(ranges.at(1).aStart.GetVars()).toEqual([0, 0, 0]);
    expect(ranges.at(2).aStart.GetVars()).toEqual([1, 1, 0]);
    expect(C.GetRangeListFromString(ranges, "", doc, OOX)).toBe(true);
    expect(C.GetRangeListFromString(ranges, ".C3:.D4;E5", doc, OOX, 59)).toBe(true);
    expect(ranges.size()).toBe(5);
  } finally {
    doc.Dispose();
  }
});
/** Makes the real document grammar also OOXML so invalid parses need no unported OOO fallback. @returns Document owner. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.SetGrammar(FormulaGrammar.Grammar.GRAM_OOXML);
  return doc;
}
it.each([
  ["A:B", 58, 0, 1],
  ["'A:B':C", 58, 0, 5],
  ["'A:B", 58, 0, -1],
  ["A''B:C", 58, 0, 4],
  ["A:B", 58, 2, -1],
  ["A:B", 58, 3, -1],
  ["A:B", 58, -3, -3],
  ["", 58, 0, -1],
  ["'A'", 39, 0, 0],
  ["😀:B", 58, 0, 2],
  ["A\0:B", 58, 0, 2],
] as const)(
  "preserves quote search %s/%i/%i",
  /** Original search outputs. @param source - View. @param char - Code unit. @param offset - Start. @param result - Expected. @returns Nothing. */ (
    source,
    char,
    offset,
    result,
  ) => {
    expect(C.IndexOf(source, char, offset)).toBe(result);
  },
);
it.each([
  ["  A", 0, 2],
  ["   ", 0, -1],
  ["", 0, -1],
  [" A", -2, -2],
  ["A", 1, -1],
] as const)(
  "skips separator runs %s/%i",
  /** Original different-character search. @param source - View. @param offset - Start. @param result - Expected. @returns Nothing. */ (
    source,
    offset,
    result,
  ) => {
    expect(C.IndexOfDifferent(source, 32, offset)).toBe(result);
  },
);
it("retains native empty leading token, quote-aware offsets, terminal length and next-call -1", /** Exercises actual native owners and literal source outcomes. @returns Nothing. */ () => {
  const token = unicode("old"),
    offset: [number] = [0],
    source = "  'A B'  C\0😀 ";
  try {
    C.GetTokenByOffset(token, source, offset);
    expect(text(token)).toBe("");
    expect(offset[0]).toBe(2);
    C.GetTokenByOffset(token, source, offset);
    expect(text(token)).toBe("'A B'");
    expect(offset[0]).toBe(9);
    C.GetTokenByOffset(token, source, offset);
    expect(text(token)).toBe("C\0😀");
    expect(offset[0]).toBe(source.length);
    C.GetTokenByOffset(token, source, offset);
    expect(text(token)).toBe("");
    expect(offset[0]).toBe(-1);
    C.GetTokenByOffset(token, source, offset);
    expect(offset[0]).toBe(-1);
  } finally {
    token.dispose();
  }
});
it("honors explicit quote/separator and retains original GetTokenCount swapped arguments", /** Exercises actual native owners and literal source outcomes. @returns Nothing. */ () => {
  const token = new OUString(),
    offset: [number] = [0];
  try {
    C.GetTokenByOffset(token, '"A,B",C', offset, 44, 34);
    expect(text(token)).toBe('"A,B"');
    expect(offset[0]).toBe(6);
    expect(C.GetTokenCount("A1 B2")).toBe(1);
    expect(C.GetTokenCount("A1'B2")).toBe(2);
    expect(C.GetTokenCount("A1,B2", 44)).toBe(1);
    expect(C.GetTokenCount("")).toBe(0);
  } finally {
    token.dispose();
  }
});
it("projects actual stored grammar without substituting a fixed OOXML convention", /** Exercises actual native owners and literal source outcomes. @returns Nothing. */ () => {
  const doc = new ScDocument();
  try {
    expect(doc.GetAddressConvention()).toBe(FormulaGrammar.AddressConvention.CONV_OOO);
    doc.SetGrammar(FormulaGrammar.Grammar.GRAM_OOXML);
    expect(doc.GetAddressConvention()).toBe(OOX);
    doc.SetGrammar(FormulaGrammar.Grammar.GRAM_NATIVE_XL_A1);
    expect(doc.GetAddressConvention()).toBe(FormulaGrammar.AddressConvention.CONV_XL_A1);
  } finally {
    doc.Dispose();
  }
});
it("parses successive actual address outputs and preserves exhausted output", /** Exercises actual native owners and literal source outcomes. @returns Nothing. */ () => {
  const doc = document(),
    address = new ScAddress(8, 9, 2),
    offset: [number] = [0];
  try {
    expect(C.GetAddressFromString(address, "$B$3 D5", doc, OOX, offset)).toBe(true);
    expect(address.GetVars()).toEqual([1, 2, 2]);
    expect(C.GetAddressFromString(address, "$B$3 D5", doc, OOX, offset)).toBe(true);
    expect(address.GetVars()).toEqual([3, 4, 2]);
    expect(C.GetAddressFromString(address, "$B$3 D5", doc, OOX, offset)).toBe(false);
    expect(address.GetVars()).toEqual([3, 4, 2]);
    expect(C.GetAddressFromString(address, "A0", doc, OOX, [0])).toBe(false);
    expect(
      C.GetAddressFromString(address, "A0", doc, FormulaGrammar.AddressConvention.CONV_XL_A1, [0]),
    ).toBe(false);
  } finally {
    doc.Dispose();
  }
});
it.each([
  ["A1", [0, 0, 2, 0, 0, 2]],
  [".B3", [1, 2, 2, 1, 2, 2]],
  ["A1:B2", [0, 0, 2, 1, 1, 2]],
  [".A1:.B2", [0, 0, 2, 1, 1, 2]],
  [".A1:B2", [0, 0, 2, 1, 1, 2]],
  ["A1:.B2", [0, 0, 2, 1, 1, 2]],
  ["D5:B2", [3, 4, 2, 1, 1, 2]],
] as const)(
  "converts native local range %s",
  /** Literal expected unsorted native endpoints. @param source - Reference. @param vars - Expected coordinates. @returns Nothing. */ (
    source,
    vars,
  ) => {
    const doc = document(),
      range = new ScRange(new ScAddress(8, 9, 2)),
      offset: [number] = [0];
    try {
      expect(C.GetRangeFromString(range, source, doc, OOX, offset)).toBe(true);
      expect([...range.aStart.GetVars(), ...range.aEnd.GetVars()]).toEqual(vars);
      expect(offset[0]).toBe(source.length);
      expect(C.GetRangeFromString(range, source, doc, OOX, offset)).toBe(false);
    } finally {
      doc.Dispose();
    }
  },
);
it.each(["A0", "A0:B2", "A1:", ":B2", ":", ""])(
  "preserves invalid native range/fallback result for %s",
  /** Invalid parsing may still update endpoints. @param source - Input. @returns Nothing. */ (
    source,
  ) => {
    const doc = document(),
      range = new ScRange(new ScAddress(8, 9, 2));
    try {
      expect(C.GetRangeFromString(range, source, doc, OOX, [0])).toBe(false);
      expect(
        C.GetRangeFromString(range, source, doc, FormulaGrammar.AddressConvention.CONV_XL_A1, [0]),
      ).toBe(false);
    } finally {
      doc.Dispose();
    }
  },
);
it("retains partial second-row VALID behavior and performs actual document model writes", /** Exercises actual native owners and literal source outcomes. @returns Nothing. */ () => {
  const doc = document(),
    range = new ScRange(),
    name = unicode("Sheet1");
  try {
    doc.InsertTab(0, name);
    expect(C.GetRangeFromString(range, "B2:C0", doc, OOX, [0])).toBe(true);
    expect(range.aStart.GetVars()).toEqual([1, 1, 0]);
    expect(range.aEnd.GetVars()).toEqual([2, 1, 0]);
    doc.SetValue(range.aStart, 17);
    doc.SetValue(range.aEnd, 23);
    expect(doc.GetValue(range.aStart)).toBe(17);
    expect(doc.GetValue(range.aEnd)).toBe(23);
  } finally {
    name.dispose();
    doc.Dispose();
  }
});
