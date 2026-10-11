/** @fileoverview Replays complete unchanged SAL/OUString search and substring ownership observations, including native checked assertions. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import fixture from "../../cppu/source/typelib/native-type-primitives-cases.json";
import * as c from "../inc/rtl/ustring.h";
import { OUString } from "../inc/rtl/ustring";
import type { rtl_uString } from "../inc/rtl/ustring.h";

describe("original bounded UTF16 search and copy", /** Groups actual original owner observations. @returns Nothing. */ () => {
  it("matches every native search word and complete substring ownership observation", /** Executes the entire original scalar/view/value corpus. @returns Nothing. */ () => {
    const words: number[] = [];
    /** Records complete original signed words. @param values - All observed fields. @returns Nothing. */
    function emit(...values: (number | boolean)[]): void {
      words.push(...values.map(Number));
    }
    /** Observes the full live original string record. @param value - Actual live allocation. @returns Nothing. */
    function observe(value: rtl_uString): void {
      emit(value.refCount, value.length);
      for (let i = 0; i <= value.length; i++) emit(value.buffer[i] as number);
    }
    for (let word = 0; word < 65536; word++) {
      const data = Uint16Array.from([0, word, word, 0xffff, 0]);
      for (const length of fixture.search.lengths)
        for (const character of fixture.search.characters)
          emit(
            c.rtl_ustr_indexOfChar_WithLength(length ? data : null, length, character),
            c.rtl_ustr_lastIndexOfChar_WithLength(length ? data : null, length, character),
          );
    }
    for (const length of [-2147483648, -65536, -1])
      emit(c.rtl_ustr_indexOfChar_WithLength(null, length, 0));
    emit(
      c.rtl_ustr_indexOfStr_WithLength(null, 0, null, 0),
      c.rtl_ustr_lastIndexOfStr_WithLength(null, 0, null, 0),
    );
    for (const h of fixture.search.inputs) {
      const hay = new OUString(Uint16Array.from(h), h.length);
      for (const n of fixture.search.inputs) {
        const needle = new OUString(Uint16Array.from(n), n.length),
          view = needle.getStr().subarray(0, needle.getLength());
        for (let from = 0; from <= hay.getLength(); from++)
          emit(
            c.rtl_ustr_indexOfStr_WithLength(
              hay.getStr().subarray(from),
              hay.getLength() - from,
              needle.getStr(),
              needle.getLength(),
            ),
            c.rtl_ustr_lastIndexOfStr_WithLength(
              hay.getStr(),
              from,
              needle.getStr(),
              needle.getLength(),
            ),
            hay.indexOf(view, from),
            hay.lastIndexOf(view, from),
            hay.indexOf(needle, from),
            hay.lastIndexOf(needle, from),
            hay.indexOf(view),
            hay.lastIndexOf(view),
          );
        needle.dispose();
      }
      for (const character of [0, 65, 0xffff, 0xd800, 0xdc00])
        for (let from = 0; from <= hay.getLength(); from++)
          emit(
            hay.indexOf(character, from),
            hay.lastIndexOf(character, from),
            hay.indexOf(character),
            hay.lastIndexOf(character),
          );
      for (let begin = 0; begin <= hay.getLength(); begin++)
        for (let count = 0; count <= hay.getLength() - begin; count++) {
          const out: [rtl_uString | null] = [null];
          c.rtl_uString_newFromSubString(out, hay.pData, begin, count);
          emit(out[0] === hay.pData, hay.pData.refCount);
          observe(out[0] as unknown as rtl_uString);
          c.rtl_uString_release(out[0] as unknown as rtl_uString);
          out[0] = null;
          c.rtl_uString_newFromStr_WithLength(out, Uint16Array.from([111, 108, 100]), 3);
          c.rtl_uString_newFromSubString(out, hay.pData, begin, count);
          emit(out[0] === hay.pData, hay.pData.refCount);
          observe(out[0] as unknown as rtl_uString);
          c.rtl_uString_release(out[0] as unknown as rtl_uString);
          {
            const copy = hay.copy(begin, count);
            emit(copy.pData === hay.pData, hay.pData.refCount);
            observe(copy.pData);
            copy.dispose();
          }
          {
            const copy = hay.copy(begin);
            emit(copy.pData === hay.pData, hay.pData.refCount);
            observe(copy.pData);
            copy.dispose();
          }
          {
            const value = new OUString(hay),
              original = value.pData,
              field: [rtl_uString | null] = [value.pData];
            c.rtl_uString_newFromSubString(field, field[0] as unknown as rtl_uString, begin, count);
            value.pData = field[0] as unknown as rtl_uString;
            emit(value.pData === original, hay.pData.refCount);
            observe(value.pData);
            value.dispose();
          }
          observe(hay.pData);
        }
      hay.dispose();
    }
    const actual = Buffer.alloc(words.length * 4);
    words.forEach(
      /** Writes each exact original little-endian word. @param word - Native signed word. @param i - Offset. @returns Nothing. */ (
        word,
        i,
      ) => {
        actual.writeInt32LE(word, i * 4);
      },
    );
    const expected = gunzipSync(Buffer.from(fixture.search.gzipBase64, "base64"));
    expect(createHash("sha256").update(expected).digest("hex")).toBe(fixture.search.rawHash);
    expect(actual.length).toBe(expected.length);
    expect(actual.equals(expected)).toBe(true);
  });
  it("retains each genuine checked search/copy assertion", /** Keeps fatal native outcomes separate from returned value contracts. @returns Nothing. */ () => {
    expect(fixture.searchAssertions).toHaveLength(11);
    for (const observed of fixture.searchAssertions) {
      const value = new OUString(Uint16Array.from([97, 98, 99]), 3),
        needle = Uint16Array.from([97]),
        out: [rtl_uString | null] = [null];
      let actual: unknown;
      try {
        switch (observed.index) {
          case 0:
            c.rtl_ustr_lastIndexOfChar_WithLength(value.getStr(), -1, 97);
            break;
          case 1:
            c.rtl_ustr_indexOfStr_WithLength(value.getStr(), -1, needle, 1);
            break;
          case 2:
            c.rtl_ustr_indexOfStr_WithLength(value.getStr(), 3, needle, -1);
            break;
          case 3:
            c.rtl_ustr_lastIndexOfStr_WithLength(value.getStr(), -1, needle, 1);
            break;
          case 4:
            c.rtl_ustr_lastIndexOfStr_WithLength(value.getStr(), 3, needle, -1);
            break;
          case 5:
            c.rtl_uString_newFromSubString(null, value.pData, 0, 3);
            break;
          case 6:
            c.rtl_uString_newFromSubString(out, value.pData, 0, -1);
            break;
          case 7:
            c.rtl_uString_newFromSubString(out, value.pData, -1, 0);
            break;
          case 8:
            c.rtl_uString_newFromSubString(out, value.pData, 1, 3);
            break;
          case 9:
            value.indexOf(97, -1);
            break;
          case 10:
            value.indexOf(needle, -1);
            break;
        }
      } catch (error) {
        actual = error;
      }
      expect(observed.signal).toBe("SIGABRT");
      expect(actual).toBeInstanceOf(Error);
      expect((actual as Error).message.replace(/\s/g, "")).toBe(
        `assert(${observed.expression})`.replace(/\s/g, ""),
      );
      expect(out[0]).toBe(null);
      value.dispose();
    }
  });
});
