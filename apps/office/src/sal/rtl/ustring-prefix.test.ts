/** @fileoverview Native OUString match/startsWith contracts preserve logical UTF16 length, embedded zero and aliased output ownership. */
import { expect, it } from "vitest";
import { unicode, text } from "../../i18nlangtag/source/isolang/isolang.tables";
import { rtl_ustr_shortenedCompare_WithLength } from "../inc/rtl/ustring.h";

it("uses bounded comparisons rather than terminated-string matching", /** The shortened known-length specialization retains embedded NUL and exact span boundaries. @returns Nothing. */ () => {
  const value = unicode("a\u0000bc"),
    prefix = unicode("a\u0000b"),
    empty = unicode("");
  try {
    expect(value.match(prefix)).toBe(true);
    expect(value.match(prefix, 1)).toBe(false);
    expect(value.match(empty, 4)).toBe(true);
    expect(value.match(Uint16Array.of(0, 98), 1)).toBe(true);
    expect(value.match(Uint16Array.of(99, 100), 3)).toBe(false);
    expect(rtl_ustr_shortenedCompare_WithLength(value.getStr(), 4, prefix.getStr(), 3, 2)).toBe(0);
    expect(rtl_ustr_shortenedCompare_WithLength(value.getStr(), 4, prefix.getStr(), 3, 4)).toBe(1);
    expect(
      /** Exercises native fromIndex assertion. @returns Match. */ () => value.match(empty, -1),
    ).toThrow("assert(fromIndex >= 0)");
    expect(
      /** Preserves native known-length guard before shortening. @returns Result. */ () =>
        rtl_ustr_shortenedCompare_WithLength(null, -1, null, 0, -1),
    ).toThrow("assert(len >= 0)");
  } finally {
    value.dispose();
    prefix.dispose();
    empty.dispose();
  }
});
it("assigns remainder only on a match and preserves source/prefix/output aliasing", /** The suffix is an actual OUString copy before assigning any output alias. @returns Nothing. */ () => {
  const value = unicode("abcdef"),
    prefix = unicode("abc"),
    rest = unicode("keep"),
    missing = unicode("z");
  try {
    expect(value.startsWith(missing, rest)).toBe(false);
    expect(text(rest)).toBe("keep");
    expect(value.startsWith(prefix, prefix)).toBe(true);
    expect(text(prefix)).toBe("def");
    expect(value.startsWith(Uint16Array.of(97, 98), value)).toBe(true);
    expect(text(value)).toBe("cdef");
    expect(value.startsWith(value, value)).toBe(true);
    expect(text(value)).toBe("");
    expect(
      /** Original explicit view-rest overload requires a real pointer. @returns Result. */ () =>
        rest.startsWith(Uint16Array.of(107), null),
    ).toThrow("assert(rest)");
    expect(rest.startsWith(rest)).toBe(true);
  } finally {
    value.dispose();
    prefix.dispose();
    rest.dispose();
    missing.dispose();
  }
});

it("appends through native temporary ownership and preserves empty and self aliases", /** Uses the actual C concatenation allocator rather than JS string concatenation. @returns Nothing. */ () => {
  const value = unicode("a\u0000b"),
    empty = unicode("");
  try {
    const original = value.pData;
    expect(value.append(empty)).toBe(value);
    expect(value.pData).toBe(original);
    value.append(value);
    expect(text(value)).toBe("a\u0000ba\u0000b");
    expect(value.pData).not.toBe(original);
    empty.append(value);
    expect(empty.pData).toBe(value.pData);
    expect(value.pData.refCount).toBe(2);
    value.append(value);
    expect(text(empty)).toBe("a\u0000ba\u0000b");
    expect(value.pData.refCount).toBe(1);
  } finally {
    value.dispose();
    empty.dispose();
  }
});
