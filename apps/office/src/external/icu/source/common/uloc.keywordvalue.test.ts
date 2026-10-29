/** @fileoverview Source keyword lookup and mutable C-buffer effects, distinct Locale overload guards and Unicode map conversion. */
import { expect, it } from "vitest";
import { uloc_getKeywordValue, ulocimp_getKeywordValue } from "./uloc.keywordvalue";
import { uloc_getLanguage, uloc_getCountry, uloc_getName } from "./uloc.buffer";
import { Locale } from "./locid";
it("validates only the chosen value and preserves its case", /** Unselected value bytes do not become a whole-locale validation pass. @returns Nothing. */ () => {
  let value = "seed";
  const s: [number] = [0];
  ulocimp_getKeywordValue(
    "en@bad=oops!;a=AbC_1/x+y",
    "A",
    {
      /** Appends actual getter output. @param text - Span. @returns Nothing. */ Append(
        text: string,
      ) {
        value += text;
      },
    },
    s,
  );
  expect(value).toBe("seedAbC_1/x+y");
  expect(s[0]).toBe(0);
});
it("retains partial selected-value output without writing a final NUL on failure", /** The result length zero does not erase already-written bytes. @returns Nothing. */ () => {
  const buffer = new Uint8Array(8).fill(77),
    s: [number] = [0];
  expect(uloc_getKeywordValue("en@a=AB!CD", "a", buffer, 8, s)).toBe(0);
  expect(s[0]).toBe(1);
  expect([...buffer]).toEqual([65, 66, 77, 77, 77, 77, 77, 77]);
});
it("keeps C and counted keyword boundaries distinct", /** Native C strings terminate at NUL; the internal query key remains counted. @returns Nothing. */ () => {
  const buffer = new Uint8Array(8).fill(77),
    s: [number] = [0];
  expect(uloc_getKeywordValue("en@a=ok", "a\0bad", buffer, 8, s)).toBe(2);
  expect([...buffer.slice(0, 4)]).toEqual([111, 107, 0, 77]);
  let output = "";
  s[0] = 0;
  ulocimp_getKeywordValue(
    "en@a=ok",
    "a\0bad",
    {
      /** Observes the actual append owner. @param text - Span. @returns Nothing. */ Append(
        text: string,
      ) {
        output += text;
      },
    },
    s,
  );
  expect(s[0]).toBe(1);
  expect(output).toBe("");
  s[0] = 0;
  expect(uloc_getKeywordValue(null, "a", buffer, 8, s)).toBe(0);
  expect(s[0]).toBe(1);
});
it("preserves direct append-buffer writes beyond the aliased final ISO name", /** Native ISO scratch-in-output mutation precedes alias Append and termination. @returns Nothing. */ () => {
  const buffer = new Uint8Array(8).fill(77),
    s: [number] = [0];
  expect(uloc_getLanguage("ENG", buffer, 8, s)).toBe(2);
  expect([...buffer]).toEqual([101, 110, 0, 0, 77, 77, 77, 77]);
  buffer.fill(77);
  expect(uloc_getCountry("en_USA", buffer, 8, s)).toBe(2);
  expect([...buffer]).toEqual([85, 83, 0, 0, 77, 77, 77, 77]);
  buffer.fill(77);
  expect(uloc_getName("ENG", buffer, 8, s)).toBe(2);
  expect([...buffer]).toEqual([101, 110, 0, 77, 77, 77, 77, 77]);
});
it("retains the distinct bogus guard in Locale overloads", /** C getter operates on the empty name, while counted ByteSink getter rejects bogus. @returns Nothing. */ () => {
  const locale = new Locale("");
  locale.setToBogus();
  const s: [number] = [0],
    buffer = new Uint8Array(8).fill(77);
  expect(locale.getKeywordValue("calendar", buffer, 8, s)).toBe(0);
  expect(s[0]).toBe(0);
  expect(buffer[0]).toBe(0);
  let value = "seed";
  locale.getKeywordValue(
    "calendar",
    {
      /** Observes no append on bogus. @param text - Span. @returns Nothing. */ Append(
        text: string,
      ) {
        value += text;
      },
    },
    s,
  );
  expect(s[0]).toBe(1);
  expect(value).toBe("seed");
});
it("uses actual canonical key/type maps for Unicode values and preserves missing-key error", /** No guessed normalization is added for absent values. @returns Nothing. */ () => {
  const locale = new Locale("en@calendar=gregorian"),
    s: [number] = [0];
  let value = "";
  locale.getUnicodeKeywordValue(
    "ca",
    {
      /** Owns converted source bytes. @param text - Span. @returns Nothing. */ Append(
        text: string,
      ) {
        value += text;
      },
    },
    s,
  );
  expect(value).toBe("gregory");
  expect(s[0]).toBe(0);
  value = "";
  locale.getUnicodeKeywordValue(
    "zz",
    {
      /** Owns the missing-value output. @param text - Span. @returns Nothing. */ Append(
        text: string,
      ) {
        value += text;
      },
    },
    s,
  );
  expect(s[0]).toBe(1);
  expect(value).toBe("");
});

it("trims both edges of the selected legacy keyword value without reading the next key", /** Exercises real counted spaces in the selected value. @returns Nothing. */ () => {
  const buffer = new Uint8Array(12).fill(77),
    status: [number] = [0];
  expect(uloc_getKeywordValue("en@a=   AbC   ;b=next", "a", buffer, 12, status)).toBe(3);
  expect(status[0]).toBe(0);
  expect([...buffer.slice(0, 5)]).toEqual([65, 98, 67, 0, 77]);
});
