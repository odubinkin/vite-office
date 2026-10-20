/** @fileoverview Contract checks for the native utl::TextSearch cache and directional pointer outputs. */
import { expect, it } from "vitest";
import { TextSearch } from "../../inc/textsearch";
import { SearchOptions2 } from "../../../i18nutil/inc/searchopt";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
/** Constructs an actual shared string. @param text - UTF-16 value. @returns Native value. */
function string(text: string): OUString {
  const units = Uint16Array.from(
    text.split(""),
    /** Encodes a code unit. @param c - Unit. @returns Number. */ (c) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
it("normalizes backward pointer outputs while retaining raw reversed offsets", /** Checks the public wrapper's asymmetric input/output contracts. @returns Nothing. */ () => {
  const options = new SearchOptions2();
  options.searchString.assign(string("ab"));
  const search = new TextSearch(options),
    raw = {
      value: {
        subRegExpressions: 0,
        startOffset: [] as readonly number[],
        endOffset: [] as readonly number[],
      },
    };
  const start: [number] = [7],
    end: [number] = [0];
  expect(search.SearchBackward(string("ab x ab"), start, end, raw)).toBe(true);
  expect([start[0], end[0], raw.value]).toEqual([
    5,
    7,
    { subRegExpressions: 1, startOffset: [7], endOffset: [5] },
  ]);
  start[0] = 2;
  end[0] = 7;
  expect(search.SearchForward(string("ab x ab"), start, end, raw)).toBe(true);
  expect([start[0], end[0], raw.value.startOffset, raw.value.endOffset]).toEqual([5, 7, [5], [7]]);
  const before = raw.value;
  start[0] = 2;
  end[0] = 4;
  expect(search.SearchForward(string("ab x ab"), start, end, raw)).toBe(false);
  expect([start[0], end[0], raw.value]).toEqual([2, 4, before]);
  start[0] = 4;
  end[0] = 2;
  expect(search.SearchBackward(string("ab x ab"), start, end, raw)).toBe(false);
  expect([start[0], end[0], raw.value]).toEqual([4, 2, before]);
});
it("keeps wrappers independent when the single-entry native cache is replaced", /** Checks copied options and locale rebinding instead of hidden lifetime state. @returns Nothing. */ () => {
  const options = new SearchOptions2();
  options.searchString.assign(string("first"));
  const one = new TextSearch(options),
    same = new TextSearch(options);
  options.searchString.assign(string("second"));
  const two = new TextSearch(options);
  expect(one.searchForward(string("first"))).toBe(true);
  expect(same.searchForward(string("first"))).toBe(true);
  expect(two.searchForward(string("first"))).toBe(false);
  two.SetLocale(options, new Locale());
  expect(two.searchForward(string("second"))).toBe(true);
  expect(one.searchForward(string("second"))).toBe(false);
  const start: [number] = [0],
    end: [number] = [5];
  expect(one.SearchForward(string("first"), start, end)).toBe(true);
  start[0] = 5;
  end[0] = 0;
  expect(one.SearchBackward(string("first"), start, end)).toBe(true);
});
