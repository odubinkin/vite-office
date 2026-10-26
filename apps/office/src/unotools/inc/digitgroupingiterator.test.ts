/** @fileoverview Pinned DigitGroupingIterator order, terminal grouping and forward positions. */
import { expect, it } from "vitest";
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { unicode } from "../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../udkapi/com/sun/star/lang/Locale";
import { LocaleDataWrapper } from "../source/i18n/localedatawrapper";
import { DigitGroupingIterator } from "./digitgroupingiterator";

const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
/** Constructs one source integer grouping sequence. @param widths - Native widths. @returns Owned values. */
function groups(widths: readonly number[]): Sequence<[number]> {
  return new Integers(
    new Map(widths.map((width, index) => [index * 4, [width] as [number]])),
    widths.length,
  );
}

it("repeats the final Indian two-digit group after the zero sentinel", () => {
  const values = groups([3, 2, 0]),
    iterator = new DigitGroupingIterator(values);
  try {
    expect([iterator.get(), iterator.getPos()]).toEqual([3, 3]);
    expect([iterator.advance().get(), iterator.getPos()]).toEqual([2, 5]);
    expect([iterator.advance().get(), iterator.getPos()]).toEqual([2, 7]);
    expect([iterator.advance().get(), iterator.getPos()]).toEqual([2, 9]);
    iterator.reset();
    expect([iterator.get(), iterator.getPos()]).toEqual([3, 3]);
  } finally {
    iterator.dispose();
    values.dispose();
  }
});

it("uses three digits for an empty or negative initial grouping", () => {
  for (const widths of [[], [-1, 0, 0]]) {
    const values = groups(widths),
      iterator = new DigitGroupingIterator(values);
    try {
      expect([iterator.get(), iterator.getPos()]).toEqual([3, 3]);
      expect([iterator.advance().get(), iterator.getPos()]).toEqual([3, 6]);
    } finally {
      iterator.dispose();
      values.dispose();
    }
  }
});

it("returns source forward separator positions from the right-hand iterator", () => {
  const values = groups([3, 0, 0]),
    positions = DigitGroupingIterator.createForwardSequence(7, values),
    empty = DigitGroupingIterator.createForwardSequence(0, values);
  try {
    expect(
      Array.from({ length: positions.getLength() }, (_, i) => positions.operatorIndex(i)[0]),
    ).toEqual([true, false, false, true, false, false, false]);
    expect(empty.getLength()).toBe(0);
  } finally {
    empty.dispose();
    positions.dispose();
    values.dispose();
  }
});

it("loads the native India/Bhutan grouping exception from LC_INFO country", () => {
  for (const [languageName, countryName, expected] of [
    ["en", "IN", [3, 2, 0]],
    ["dz", "BT", [3, 2, 0]],
    ["en", "US", [3, 0, 0]],
  ] as const) {
    const language = unicode(languageName),
      country = unicode(countryName),
      variant = unicode(""),
      locale = new Locale(language, country, variant),
      wrapper = new LocaleDataWrapper(locale);
    try {
      const grouping = wrapper.getDigitGrouping();
      expect(
        Array.from({ length: grouping.getLength() }, (_, i) => grouping.operatorIndex(i)[0]),
      ).toEqual(expected);
    } finally {
      wrapper.dispose();
      locale.dispose();
      variant.dispose();
      country.dispose();
      language.dispose();
    }
  }
});
