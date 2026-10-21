/** @fileoverview Generated SearchResult values and actual Sequence<sal_Int32> copy/assignment/COW across the represented search pipeline. */
import { expect, it, vi } from "vitest";
import { SearchResult } from "../../../offapi/com/sun/star/util/SearchResult";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { longSequence, offsets, searchResult } from "../../../test/search-result-values";
import { TextSearch } from "./textsearch";
import { TextSearch as Wrapper } from "../../../unotools/inc/textsearch";
import { SearchOptions2 } from "../../../i18nutil/inc/searchopt";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Original mutable scalar cell access after requesting real COW. @param sequence - Live native owner. @param index - Original index. @param value - Initialized signed32 value. @returns Nothing. */
function set(sequence: Sequence<[number]>, index: number, value: number): void {
  ((sequence.getArray() as SequenceElements).get(index * 4) as [number])[0] = value;
}
/** Creates an actual Unicode search input. @param value - Exact UTF16. @returns Native owner. */
function string(value: string): OUString {
  const units = Uint16Array.from(
    value.split(""),
    /** Encodes one unit. @param c - Unit. @returns Unit value. */ (c) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
it("constructs zero/default values with distinct owned sequence fields", /** No array-shaped or shared mutable result singleton is introduced. @returns Nothing. */ () => {
  const one = new SearchResult(),
    two = new SearchResult();
  expect(one.subRegExpressions).toBe(0);
  expect([one.startOffset.getLength(), one.endOffset.getLength()]).toEqual([0, 0]);
  expect(one.startOffset).toBeInstanceOf(Sequence);
  expect(one.startOffset).not.toBe(one.endOffset);
  expect(one.startOffset).not.toBe(two.startOffset);
  one.startOffset.realloc(1);
  set(one.startOffset, 0, -1);
  expect(offsets(two.startOffset)).toEqual([]);
  expect(offsets(one.endOffset)).toEqual([]);
  two.dispose();
  one.dispose();
});
it("copies native sequence values on full construction and preserves independently sized IDL fields", /** No count/length or offset-direction policy is invented by the struct. @returns Nothing. */ () => {
  const starts = longSequence([7, -1, -2147483648]),
    ends = longSequence([2, 2147483647]);
  const value = new SearchResult(99, starts, ends);
  expect(value.startOffset).not.toBe(starts);
  expect(value.startOffset.get()).toBe(starts.get());
  expect(value.endOffset.get()).toBe(ends.get());
  set(starts, 0, 100);
  set(ends, 0, 101);
  expect(offsets(value.startOffset)).toEqual([7, -1, -2147483648]);
  expect(offsets(value.endOffset)).toEqual([2, 2147483647]);
  expect(value.subRegExpressions).toBe(99);
  ends.dispose();
  starts.dispose();
  value.dispose();
});
it("retains copy sharing until the real mutable sequence accessor detaches", /** Const reads do not trigger copy-on-write. @returns Nothing. */ () => {
  const source = searchResult(2, [9, -1], [3, -1]),
    copy = new SearchResult(source);
  expect(copy.startOffset).not.toBe(source.startOffset);
  const shared = source.startOffset.get();
  expect(copy.startOffset.get()).toBe(shared);
  expect(copy.startOffset.operatorIndex(0)[0]).toBe(9);
  expect(copy.startOffset.get()).toBe(shared);
  set(copy.startOffset, 0, 5);
  expect(copy.startOffset.get()).not.toBe(shared);
  expect(offsets(source.startOffset)).toEqual([9, -1]);
  expect(offsets(copy.startOffset)).toEqual([5, -1]);
  source.dispose();
  expect(offsets(copy.endOffset)).toEqual([3, -1]);
  copy.dispose();
});
it("assigns fields into stable member owners and supports whole/self assignment", /** Original generated member semantics preserve borrowed sequence object identity. @returns Nothing. */ () => {
  const target = searchResult(1, [1], [2]),
    source = searchResult(2, [8, 9], [3, 4]);
  const starts = target.startOffset,
    ends = target.endOffset;
  expect(target.assign(source)).toBe(target);
  expect(target.startOffset).toBe(starts);
  expect(target.endOffset).toBe(ends);
  expect(starts.get()).toBe(source.startOffset.get());
  const handle = starts.get();
  target.assign(target);
  expect(starts.get()).toBe(handle);
  const replacement = longSequence([15]);
  target.startOffset = replacement;
  expect(target.startOffset).toBe(starts);
  replacement.dispose();
  set(starts, 0, 16);
  expect(offsets(source.startOffset)).toEqual([8, 9]);
  expect(offsets(target.startOffset)).toEqual([16]);
  target.dispose();
  source.dispose();
});
it.each([1, 4])(
  "returns actual independent engine values with native directional mapping algorithm=%i",
  /** Tests normal and wildcard producers, folding remapping and retained old copies. @param algorithm - Original engine identity. @returns Nothing. */ (
    algorithm,
  ) => {
    const options = new SearchOptions2();
    options.AlgorithmType2 = algorithm;
    options.transliterateFlags = TransliterationFlags.IGNORE_CASE;
    options.searchString = string(algorithm === 1 ? "ss" : "s?");
    const engine = new TextSearch(options),
      text = string("xßy");
    const first = engine.searchForward(text, 0, 3),
      saved = new SearchResult(first);
    expect(first).toBeInstanceOf(SearchResult);
    expect([offsets(first.startOffset), offsets(first.endOffset)]).toEqual([[1], [2]]);
    set(first.startOffset, 0, 0);
    expect(offsets(saved.startOffset)).toEqual([1]);
    const reverse = engine.searchBackward(text, 3, 0);
    expect([offsets(reverse.startOffset), offsets(reverse.endOffset)]).toEqual([
      [algorithm === 1 ? 2 : 3],
      [1],
    ]);
    const absent = engine.searchForward(string("none"), 0, 4);
    expect(absent).toBeInstanceOf(SearchResult);
    expect([
      absent.subRegExpressions,
      absent.startOffset.getLength(),
      absent.endOffset.getLength(),
    ]).toEqual([0, 0, 0]);
    absent.dispose();
    reverse.dispose();
    saved.dispose();
    first.dispose();
  },
);
it("assigns wrapper outputs into the same struct/sequence owners and leaves failure untouched", /** Native caller addresses remain stable while raw backward offsets stay reversed. @returns Nothing. */ () => {
  const options = new SearchOptions2();
  options.searchString = string("ab");
  const wrapper = new Wrapper(options),
    output = { value: new SearchResult() },
    text = string("x ab y");
  const original = output.value,
    starts = original.startOffset,
    ends = original.endOffset;
  const low: [number] = [0],
    high: [number] = [text.getLength()];
  expect(wrapper.SearchForward(text, low, high, output)).toBe(true);
  const snapshot = new SearchResult(output.value);
  expect(output.value).toBe(original);
  expect(original.startOffset).toBe(starts);
  expect(original.endOffset).toBe(ends);
  low[0] = text.getLength();
  high[0] = 0;
  expect(wrapper.SearchBackward(text, low, high, output)).toBe(true);
  expect([low[0], high[0], offsets(starts), offsets(ends)]).toEqual([2, 4, [4], [2]]);
  expect([offsets(snapshot.startOffset), offsets(snapshot.endOffset)]).toEqual([[2], [4]]);
  const handles = [starts.get(), ends.get()];
  low[0] = 0;
  high[0] = 1;
  expect(wrapper.SearchForward(text, low, high, output)).toBe(false);
  expect([low[0], high[0]]).toEqual([0, 1]);
  expect(starts.get()).toBe(handles[0]);
  expect(ends.get()).toBe(handles[1]);
  expect([offsets(starts), offsets(ends)]).toEqual([[4], [2]]);
  snapshot.dispose();
  output.value.dispose();
});

it.each([false, true])(
  "retains catch-only-UNO exceptions and caller state backward=%s",
  /** Native UNO failures become false; unrelated JS errors remain visible. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    const options = new SearchOptions2();
    options.searchString = string("ab");
    const wrapper = new Wrapper(options),
      output = { value: searchResult(1, [91], [92]) };
    const start: [number] = [5],
      end: [number] = [6];
    const spy = vi.spyOn(TextSearch.prototype, backward ? "searchBackward" : "searchForward");
    try {
      spy.mockImplementationOnce(
        /** Throws a real UNO exception. @returns Never. */ () => {
          throw new RuntimeException();
        },
      );
      expect(
        backward
          ? wrapper.SearchBackward(string("ab"), start, end, output)
          : wrapper.SearchForward(string("ab"), start, end, output),
      ).toBe(false);
      expect([
        start[0],
        end[0],
        offsets(output.value.startOffset),
        offsets(output.value.endOffset),
      ]).toEqual([5, 6, [91], [92]]);
      spy.mockImplementationOnce(
        /** Throws a non-UNO failure. @returns Never. */ () => {
          throw new RangeError("native-range-precondition");
        },
      );
      expect(
        /** Invokes the selected wrapper. @returns Whether found. */ () =>
          backward
            ? wrapper.SearchBackward(string("ab"), start, end, output)
            : wrapper.SearchForward(string("ab"), start, end, output),
      ).toThrow(RangeError);
    } finally {
      spy.mockRestore();
      output.value.dispose();
    }
  },
);
it("preserves native forward-positive versus backward-nonzero expression-count conditions", /** This source asymmetry is preserved even though represented engines only emit zero or one. @returns Nothing. */ () => {
  const options = new SearchOptions2();
  const wrapper = new Wrapper(options);
  const forward = vi
    .spyOn(TextSearch.prototype, "searchForward")
    .mockReturnValueOnce(searchResult(-2, [2], [4]));
  const backward = vi
    .spyOn(TextSearch.prototype, "searchBackward")
    .mockReturnValueOnce(searchResult(-2, [4], [2]));
  const start: [number] = [0],
    end: [number] = [6],
    output = { value: new SearchResult() };
  try {
    expect(wrapper.SearchForward(string("x ab y"), start, end, output)).toBe(false);
    expect([start[0], end[0], output.value.subRegExpressions]).toEqual([0, 6, 0]);
    start[0] = 6;
    end[0] = 0;
    expect(wrapper.SearchBackward(string("x ab y"), start, end, output)).toBe(true);
    expect([start[0], end[0], output.value.subRegExpressions]).toEqual([2, 4, -2]);
  } finally {
    backward.mockRestore();
    forward.mockRestore();
    output.value.dispose();
  }
});

it("compares every generated struct field with native sequence equality", /** Equal values may use different handles; count, start and end differences each matter. @returns Nothing. */ () => {
  const a = searchResult(2, [5, -1], [3, -1]),
    b = searchResult(2, [5, -1], [3, -1]);
  expect(a.startOffset.get()).not.toBe(b.startOffset.get());
  expect(a.equals(b)).toBe(true);
  expect(a.notEquals(b)).toBe(false);
  b.subRegExpressions = 1;
  expect(a.equals(b)).toBe(false);
  b.subRegExpressions = 2;
  set(b.startOffset, 1, 0);
  expect(a.notEquals(b)).toBe(true);
  set(b.startOffset, 1, -1);
  set(b.endOffset, 1, 0);
  expect(a.equals(b)).toBe(false);
  set(b.endOffset, 1, -1);
  expect(a.equals(b)).toBe(true);
  b.dispose();
  a.dispose();
});
