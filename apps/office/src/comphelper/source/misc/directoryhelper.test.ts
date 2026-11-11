/** @fileoverview Source-backed DirectoryHelper token splitting, retained output boundaries and native UTF16 ownership. */
import { expect, it } from "vitest";
import { splitAtLastToken } from "./directoryhelper";
import { nativeString, nativeText } from "../../../test/ofopxml-values";
import { OUString } from "../../../sal/inc/rtl/ustring";
it.each([
  ["", "", ""],
  ["plain", "plain", ""],
  ["a.xml", "a", "xml"],
  ["a.b.xml", "a.b", "xml"],
  [".xml", "", "old"],
  ["a.", "a", "old"],
  [".", "", "old"],
  ["..", ".", "old"],
  ["😀.文😀", "😀", "文😀"],
])(
  "preserves splitAtLastToken(%s) output",
  /** Replays the original branch table without normalizing its output parameter. @param input - Source. @param expectedLeft - Left view. @param expectedRight - Output value. @returns Nothing. */ (
    input,
    expectedLeft,
    expectedRight,
  ) => {
    const source = nativeString(input),
      right = nativeString("old");
    try {
      const left = splitAtLastToken(source.subView(0), 46, right);
      expect(String.fromCharCode(...left)).toBe(expectedLeft);
      expect(nativeText(right)).toBe(expectedRight);
      if (left.length > 0) expect(left.buffer).toBe(source.getStr().buffer);
    } finally {
      right.dispose();
      source.dispose();
    }
  },
);
it("assigns a suffix into a shared actual string without altering the retained original", /** A real owner keeps the source view alive while the output pointer changes. @returns Nothing. */ () => {
  const right = nativeString("a.😀"),
    source = new OUString(right);
  try {
    const left = splitAtLastToken(source.subView(0), 46, right);
    expect(String.fromCharCode(...left)).toBe("a");
    expect(nativeText(right)).toBe("😀");
    expect(nativeText(source)).toBe("a.😀");
  } finally {
    source.dispose();
    right.dispose();
  }
});
