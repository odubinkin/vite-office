/** @fileoverview Exhaustively replays complete unchanged ICU78.3 scalar/trie/exception observations without original sources. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { describe, it, expect } from "vitest";
import fixture from "./native-case-cases.json";
import data from "./ucase_props_data.json";
import { u_tolower, u_toupper, u_totitle, u_foldCase } from "./unicode/uchar";
import { GET_EXCEPTIONS, GET_SLOT_VALUE, HAS_SLOT, SLOT_OFFSET } from "./ucase";
import { UCASE_HAS_EXCEPTION } from "./ucase.h";
import { UTRIE2_GET16, _UTRIE2_INDEX_FROM_CP } from "./utrie2.h";
import {
  ucase_props_dataVersion,
  ucase_props_indexes,
  ucase_props_exceptions,
  ucase_props_unfold,
  ucase_props_trieIndex,
  ucase_props_singleton,
} from "./ucase_props_data";
import { U_FOLD_CASE_DEFAULT, U_FOLD_CASE_EXCLUDE_SPECIAL_I } from "./unicode/stringoptions";

/** Observes complete native-equivalent initialized scalar fields. @param c - Integral UChar32. @returns Original row shape. */
function observe(c: number): number[] {
  const trie = ucase_props_singleton.trie;
  const props = UTRIE2_GET16(trie, c);
  const pe = UCASE_HAS_EXCEPTION(props) ? GET_EXCEPTIONS(ucase_props_singleton, props) : null;
  return [
    c >>> 0,
    _UTRIE2_INDEX_FROM_CP(trie, trie.indexLength, c),
    props,
    pe ? pe.index : 0xffffffff,
    pe ? (pe.data[pe.index] as number) : 0xffffffff,
    u_tolower(c) >>> 0,
    u_toupper(c) >>> 0,
    u_totitle(c) >>> 0,
    ...Array.from(
      { length: 8 },
      /** Observes the complete original folding mask domain. @param unused - Placeholder. @param options - Original option. @returns Original fold. */ (
        _,
        options,
      ) => u_foldCase(c, options) >>> 0,
    ),
  ];
}

describe("original ICU scalar dependency", /** Groups unchanged native replay evidence. @returns Nothing. */ () => {
  // Exhaustive native fixture replay retains every assertion under full-suite coverage instrumentation.
  it("matches every unchanged native Unicode codepoint and complete initialized trie observation", /** Verifies complete native rows and raw digest. @returns Nothing. */ () => {
    const encoded = JSON.parse(
      gunzipSync(Buffer.from(fixture.compressedRows, "base64")).toString("utf8"),
    ) as { initial: number[]; runs: [number, ...number[]][] };
    const expected = Buffer.alloc(fixture.rawBytes);
    let decoded = [...encoded.initial],
      position = 0;
    /** Writes one complete observed row without Unicode rules. @returns Nothing. */
    function storeObserved() {
      for (const value of decoded) {
        expected.writeUInt32LE(value, position);
        position += 4;
      }
    }
    storeObserved();
    for (const [n, ...delta] of encoded.runs)
      for (let i = 0; i < n; i++) {
        decoded = decoded.map(
          /** Decodes only captured neighboring field deltas. @param value - Prior original field. @param c - Column. @returns Original field. */ (
            value,
            c,
          ) => value + (delta[c] as number),
        );
        storeObserved();
      }
    expect(position).toBe(fixture.rawBytes);
    expect(expected.length).toBe(fixture.rawBytes);
    expect(createHash("sha256").update(expected).digest("hex")).toBe(fixture.rawHash);
    const actual = Buffer.alloc(expected.length);
    const width = fixture.fields.length;
    for (let c = 0; c < fixture.count; c++) {
      const row = observe(c);
      for (let column = 0; column < width; column++) {
        const offset = (c * width + column) * 4;
        const wanted = expected.readUInt32LE(offset);
        if (row[column] !== wanted)
          throw new Error(
            `Original U+${c.toString(16)} ${fixture.fields[column]}: ${row[column]} != ${wanted}`,
          );
        actual.writeUInt32LE(row[column] as number, offset);
      }
    }
    expect(createHash("sha256").update(actual).digest("hex")).toBe(fixture.rawHash);
    expect(actual.equals(expected)).toBe(true);
  }, 300_000);

  it("preserves original signed invalid identities and every captured option/pointer observation", /** Verifies signed boundaries, options and native slot pointer effects. @returns Nothing. */ () => {
    for (const [i, c] of fixture.boundaries.entries())
      expect(observe(c)).toEqual(fixture.boundaryRows[i]);
    for (const [c, options, result] of fixture.options as [number, number, number][])
      expect(u_foldCase(c, options)).toBe(result);
    for (const [offset, excWord, idx, before, after, value] of fixture.slots as [
      number,
      number,
      number,
      number,
      number,
      number,
    ][]) {
      const pe = { data: ucase_props_exceptions, index: offset + 1 };
      expect(HAS_SLOT(excWord, idx)).not.toBe(0);
      expect(SLOT_OFFSET(excWord, idx)).toBe(before);
      expect(GET_SLOT_VALUE(excWord, idx, pe)).toBe(value);
      expect(pe.index).toBe(after);
    }
    for (const [excWord, idx, before, after, value] of fixture.macroSlots.cases as [
      number,
      number,
      number,
      number,
      number,
    ][]) {
      const pe = { data: new Uint16Array(fixture.macroSlots.payload), index: 3 };
      expect(SLOT_OFFSET(excWord, idx)).toBe(before);
      expect(GET_SLOT_VALUE(excWord, idx, pe)).toBe(value);
      expect(pe.index).toBe(after);
    }
    expect(U_FOLD_CASE_DEFAULT).toBe(0);
    expect(U_FOLD_CASE_EXCLUDE_SPECIAL_I).toBe(1);
  });

  it("retains all original generated data and physical shared-array offsets", /** Verifies whole original data and singleton field ownership. @returns Nothing. */ () => {
    expect([...ucase_props_dataVersion]).toEqual(data.dataVersion);
    expect([...ucase_props_indexes]).toEqual(data.indexes);
    expect([...ucase_props_trieIndex]).toEqual(data.trieIndex);
    expect([...ucase_props_exceptions]).toEqual(data.exceptions);
    expect([...ucase_props_unfold]).toEqual(data.unfold);
    expect([...ucase_props_singleton.formatVersion]).toEqual(data.formatVersion);
    expect(ucase_props_singleton.indexes).toBe(ucase_props_indexes);
    expect(ucase_props_singleton.exceptions).toBe(ucase_props_exceptions);
    expect(ucase_props_singleton.unfold).toBe(ucase_props_unfold);
    const { trie } = ucase_props_singleton;
    expect(trie.index).toBe(ucase_props_trieIndex);
    expect(trie.data16?.buffer).toBe(trie.index.buffer);
    expect(trie.data16?.byteOffset).toBe(data.trie.data16Offset * 2);
    expect(trie.data16?.length).toBe(data.trie.dataLength);
    for (const name of ["mem", "data32", "memory", "newTrie"]) {
      expect(
        name === "mem" ? ucase_props_singleton.mem : trie[name as "data32" | "memory" | "newTrie"],
      ).toBe(null);
    }
    expect(data.nullPointers).toEqual([1, 1, 1, 1]);
    for (const name of [
      "indexLength",
      "dataLength",
      "index2NullOffset",
      "dataNullOffset",
      "initialValue",
      "errorValue",
      "highStart",
      "highValueIndex",
      "length",
      "isMemoryOwned",
      "padding1",
      "padding2",
    ] as const)
      expect(trie[name]).toBe(data.trie[name]);
    expect(createHash("sha256").update(JSON.stringify(data)).digest("hex")).toBe(fixture.dataHash);
  });
});
