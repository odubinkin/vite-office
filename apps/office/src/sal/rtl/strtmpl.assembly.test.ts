/** @fileoverview Original Unicode concatenation and replacement contracts over real RTL slots, allocations and borrowed spans. */
import { expect, it } from "vitest";
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";
import * as str from "./strtmpl";

/** Copies caller UTF16 code units without scalar iteration or normalization. @param text - Counted text. @returns Initialized borrowed span. */
function units(text: string): Uint16Array {
  const result = new Uint16Array(text.length);
  for (let index = 0; index < text.length; ++index) result[index] = text.charCodeAt(index);
  return result;
}

/** Allocates an actual counted source through its original constructor. @param text - Initialized UTF16 units. @returns Owned slot. */
function owner(text: string): rtl_uStringSlot {
  const result: rtl_uStringSlot = [null],
    span = units(text);
  str.newFromStr_WithLength(result, span, span.length);
  return result;
}
/** Borrows initialized counted data. @param slot - Actual pointer slot. @returns Original data. */
function data(slot: rtl_uStringSlot): rtl_uString {
  const value = slot[0];
  if (!value) throw new Error("Missing actual RTL data");
  return value;
}
/** Reads initialized units including embedded nulls, without terminator scanning. @param slot - Actual pointer slot. @returns Counted text. */
function value(slot: rtl_uStringSlot): string {
  const source = data(slot);
  return String.fromCharCode(...source.buffer.subarray(0, source.length));
}
/** Releases each distinct caller slot's counted ownership. @param slots - Actual independently owned pointer slots. @returns Nothing. */
function dispose(...slots: rtl_uStringSlot[]): void {
  for (const slot of slots) {
    if (slot[0]) str.release(slot[0]);
    slot[0] = null;
  }
}

it("concatenates into a destination alias while preserving both independently owned inputs", /** The original output release occurs after copying all borrowed input units. @returns Nothing. */ () => {
  const left = owner("ab"),
    right = owner("c\0d"),
    output: rtl_uStringSlot = [null];
  try {
    str.assign(output, data(left));
    str.newConcat(output, data(left), data(right));
    expect(value(output)).toBe("abc\0d");
    expect(value(left)).toBe("ab");
    expect(value(right)).toBe("c\0d");
    expect(data(left).refCount).toBe(1);
    expect(data(output).buffer[data(output).length]).toBe(0);
  } finally {
    dispose(output, right, left);
  }
});

it.each([
  ["", "", 3, 0],
  ["A", "a", 1, 0],
  ["Abc", "aBD", 2, 0],
  ["Abc", "aBD", 3, -1],
  ["Abc", "aB", 3, 1],
  ["aB", "Abc", 3, -1],
  ["A", "b", 0, 0],
] as const)(
  "compares the original bounded ASCII-insensitive spans %s/%s",
  /** Literal expectations cover shortening, equality and either source ending first. @param left - Left initialized units. @param right - Right initialized units. @param shortened - Comparison bound. @param expected - Original exact comparator result. @returns Nothing. */ (
    left,
    right,
    shortened,
    expected,
  ) => {
    const first = units(left),
      second = units(right);
    expect(
      str.compare_ShortenedIgnoreAsciiCaseWithLengths(
        first,
        first.length,
        second,
        second.length,
        shortened,
      ),
    ).toBe(expected);
  },
);

it("checks negative comparison lengths before reading source pointers", /** These signed32 assertion inputs need no fabricated string allocation or private state. @returns Nothing. */ () => {
  for (const operation of [
    /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
      str.compare_ShortenedIgnoreAsciiCaseWithLengths(null, -1, null, 0, 0),
    /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
      str.compare_ShortenedIgnoreAsciiCaseWithLengths(null, 0, null, -1, 0),
    /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
      str.compare_ShortenedIgnoreAsciiCaseWithLengths(null, 0, null, 0, -1),
    /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
      str.compare_ShortenedWithLengths(null, 0, null, 0, -1),
  ])
    expect(operation).toThrow("assert(");
});

it.each([
  ["", "", 0],
  ["", "A", -1],
  ["A", "", 1],
  ["AB", "ABC", -1],
  ["ABC", "AB", 1],
  ["A", "Z", -25],
  ["Z", "A", 25],
  ["A\0Z", "A\0B", 0],
] as const)(
  "compares terminated source storage %s/%s independently of counted suffixes",
  /** Original NoShortening comparison stops on nulls, uses prefix ordering and retains exact code-unit mismatch subtraction. @param left - First initialized storage. @param right - Second initialized storage. @param expected - Independent source result. @returns Nothing. */ (
    left,
    right,
    expected,
  ) => {
    expect(
      str.compare(
        new Uint16Array([...units(left), 0]),
        new Uint16Array([...units(right), 0]),
        str.CompareNormal,
      ),
    ).toBe(expected);
  },
);

it("checks both terminated input pointers before starting comparison", /** The source API requires pointers even for empty terminated inputs. @returns Nothing. */ () => {
  const empty = Uint16Array.of(0);
  expect(
    /** Calls the original null first-pointer precondition. @returns Comparison if validation unexpectedly succeeds. */ () =>
      str.compare(null, empty, str.CompareNormal),
  ).toThrow("assert(pStr)");
  expect(
    /** Calls the original null second-pointer precondition. @returns Comparison if validation unexpectedly succeeds. */ () =>
      str.compare(empty, null, str.CompareNormal),
  ).toThrow("assert(pStr)");
});

it("shares original empty-side concatenation results and rejects two null source pointers", /** These are original newConcat fast paths, not substitute string operations. @returns Nothing. */ () => {
  const left = owner("left"),
    empty = owner(""),
    right = owner("right"),
    output: rtl_uStringSlot = [null];
  try {
    str.newConcat(output, data(left), null);
    expect(data(output)).toBe(data(left));
    str.newConcat(output, data(left), data(empty));
    expect(data(output)).toBe(data(left));
    str.newConcat(output, null, data(right));
    expect(data(output)).toBe(data(right));
    str.newConcat(output, data(empty), data(right));
    expect(data(output)).toBe(data(right));
    expect(
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newConcat(output, null, null),
    ).toThrow("assert(pLeft != nullptr)");
    expect(data(output)).toBe(data(right));
  } finally {
    dispose(output, right, empty, left);
  }
});

it("uses the raw-span overload's counted length and zero-length assignment path", /** Borrowed raw spans retain embedded nulls and may be null only when their declared length is zero. @returns Nothing. */ () => {
  const left = owner("a"),
    output: rtl_uStringSlot = [null];
  try {
    str.newConcat_Utf16(output, data(left), null, 0);
    expect(data(output)).toBe(data(left));
    str.newConcat_Utf16(output, data(left), Uint16Array.of(0, 98, 99), 2);
    expect(value(output)).toBe("a\0b");
    expect(
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newConcat_Utf16(output, null, null, 0),
    ).toThrow("assert(pLeft != nullptr)");
  } finally {
    dispose(output, left);
  }
});

it.each([
  [0, 1, "XY", "XYbcd"],
  [1, 2, "XY", "aXYd"],
  [2, 2, "XY", "abXY"],
  [4, 0, "XY", "abcdXY"],
  [0, 4, "XY", "XY"],
  [1, 2, null, "ad"],
  [0, 4, null, ""],
  [2, 0, null, "abcd"],
] as const)(
  "replaces the actual owned span at %i/%i with %s",
  /** Native original prefix/replacement/tail copying preserves caller aliases. @param index - Removal start. @param count - Removed units. @param replacement - Replacement or null deletion. @param expected - Independent literal result. @returns Nothing. */ (
    index,
    count,
    replacement,
    expected,
  ) => {
    const original = owner("abcd"),
      insert = owner(replacement ?? ""),
      output: rtl_uStringSlot = [null];
    try {
      str.assign(output, data(original));
      str.newReplaceStrAt(
        output,
        data(original),
        index,
        count,
        replacement === null ? null : data(insert),
      );
      expect(value(output)).toBe(expected);
      expect(value(original)).toBe("abcd");
      if (index === 0 && count === 4 && replacement !== null)
        expect(data(output)).toBe(data(insert));
      if (count === 0 && replacement === null) expect(data(output)).toBe(data(original));
    } finally {
      dispose(output, insert, original);
    }
  },
);

it.each([
  ["abcabc", "ab", "XYZ", 0, "XYZcXYZc"],
  ["abcabc", "ab", "", 0, "cc"],
  ["abcabc", "ab", "X", 1, "abcXc"],
  ["abcabc", "zz", "X", 0, "abcabc"],
  ["aaaa", "aa", "a", 0, "aa"],
] as const)(
  "replaces nonoverlapping source spans in %s",
  /** Source iteration does not rescan inserted replacement units and respects the caller start offset. @param source - Original text. @param from - Search span. @param to - Replacement span. @param start - Original start offset. @param expected - Independent literal result. @returns Nothing. */ (
    source,
    from,
    to,
    start,
    expected,
  ) => {
    const original = owner(source),
      output: rtl_uStringSlot = [null],
      search = units(from),
      replacement = units(to);
    try {
      str.assign(output, data(original));
      str.newReplaceAllFromIndex(
        output,
        data(original),
        search,
        search.length,
        replacement,
        replacement.length,
        start,
      );
      expect(value(output)).toBe(expected);
      expect(value(original)).toBe(source);
      if (from === "zz") expect(data(output)).toBe(data(original));
    } finally {
      dispose(output, original);
    }
  },
);

it("checks concat and replacement caller preconditions before changing an existing destination", /** Checked source assertions use their existing Error binding; no native exception or allocation-failure equivalence is claimed. @returns Nothing. */ () => {
  const original = owner("abcd"),
    output = owner("old"),
    units = Uint16Array.of(97);
  const previous = data(output);
  try {
    for (const operation of [
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newConcat_WithLengths(null, null, 0, null, 0),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newConcat_WithLengths(output, units, -1, null, 0),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newConcat_WithLengths(output, null, 1, null, 0),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newConcat_WithLengths(output, units, 1, units, -1),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newConcat_WithLengths(output, units, 1, null, 1),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceStrAt(null, data(original), 0, 0, null),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceStrAt(output, data(original), -1, 0, null),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceStrAt(output, data(original), 5, 0, null),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceStrAt(output, data(original), 0, -1, null),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceStrAt(output, data(original), 3, 2, null),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceAllFromIndex(null, data(original), units, 1, null, 0, 0),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceAllFromIndex(output, data(original), units, -1, null, 0, 0),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceAllFromIndex(output, data(original), null, 1, null, 0, 0),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceAllFromIndex(output, data(original), units, 1, null, -1, 0),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceAllFromIndex(output, data(original), units, 1, null, 1, 0),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceAllFromIndex(output, data(original), units, 1, null, 0, -1),
      /** Calls the actual API with a source assertion violation. @returns Original result if validation unexpectedly succeeds. */ () =>
        str.newReplaceAllFromIndex(output, data(original), units, 1, null, 0, 5),
    ]) {
      expect(operation).toThrow("assert(");
      expect(data(output)).toBe(previous);
      expect(value(output)).toBe("old");
    }
  } finally {
    dispose(output, original);
  }
});
