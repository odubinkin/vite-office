/** @fileoverview Exercises native tab item collection/property semantics through real shared CPPU typed values. */
import { describe, expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Any } from "../../../cppu/inc/uno/any2";
import type { uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import {
  TabStop,
  cppu_detail_getUnoType_TabStop as stopType,
} from "../../../offapi/com/sun/star/style/TabStop";
import {
  TabAlign,
  cppu_detail_getUnoType_TabAlign as alignType,
} from "../../../offapi/com/sun/star/style/TabAlign";
import { MID_TABSTOPS, MID_STD_TAB, MID_TABSTOP_DEFAULT_DISTANCE } from "../../inc/memberids";
import {
  SvxTabStopItem,
  SvxTabStop,
  SvxTabAdjust,
  SVX_TAB_DEFCOUNT,
  SVX_TAB_DEFDIST,
  SVX_TAB_NOTFOUND,
} from "../../inc/tstpitem";
import { createTabs, tabStops } from "../../../../test/tab-item-fixtures";

/** Initialized original compound member addresses. */
type Fields = { get(offset: 0 | 4 | 8 | 10): [number] };
const Stops = Sequence.specialize<Fields>(stopType, 12);
const Entries = Sequence.specialize<uno_Any>("Any", 24);
const Rows = Sequence.specialize<[uno_Sequence]>(["Sequence", "Any"], 8);

/** Encodes real generated struct values into an actual typed sequence. @param values - Native values. @returns Independent typed Any. */
function typed(values: readonly TabStop[]): Any {
  const addresses = new Map<number, unknown>();
  for (let i = 0; i < values.length; i += 1) addresses.set(i * 12, values[i]);
  const sequence = new Stops(addresses, values.length),
    result = new Any();
  result.insert(sequence.getAddress(), ["Sequence", stopType]);
  sequence.dispose();
  return result;
}
/** Encodes initialized Any rows using the original sequence constructors and logical element strides. @param values - Rows of actual Any values. @returns Independent nested typed Any. */
function nested(values: readonly (readonly Any[])[]): Any {
  const addresses = new Map<number, unknown>(),
    inners = [];
  for (const [i, fields] of values.entries()) {
    const entries = new Map<number, unknown>();
    for (const [j, value] of fields.entries()) entries.set(j * 24, value);
    const row = new Entries(entries, fields.length);
    inners.push(row);
    addresses.set(i * 8, row.getAddress());
  }
  const sequence = new Rows(addresses, values.length),
    result = new Any();
  result.insert(sequence.getAddress(), ["Sequence", ["Sequence", "Any"]]);
  sequence.dispose();
  for (const inner of inners) inner.dispose();
  return result;
}
/** Constructs one actual known-length string Any. @param value - UTF16 text. @returns Typed string. */
function text(value: string): Any {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i += 1) units[i] = value.charCodeAt(i);
  const valueString = new OUString(units, units.length);
  const result = new Any(valueString.getDataAddress(), "OUString");
  valueString.dispose();
  return result;
}
/** Reads one native long through real extraction. @param value - Typed Any. @returns Signed32. */
function long(value: Any): number {
  const output: [number] = [0];
  expect(value.extract(output, "sal_Int32")).toBe(true);
  return output[0];
}
/** Queries the original typed sequence and inspects initialized real compound fields. @param item - Native source. @param member - Member selector. @returns Four fields per stop. */
function query(item: SvxTabStopItem, member = 0): number[][] {
  const output = new Any(),
    sequence = new Stops();
  expect(item.QueryValue(output, member)).toBe(true);
  expect(output.extract(sequence.getAddress(), ["Sequence", stopType])).toBe(true);
  const values = [];
  for (let i = 0; i < sequence.getLength(); i += 1) {
    const value = sequence.operatorIndex(i);
    values.push([value.get(0)[0], value.get(4)[0], value.get(8)[0], value.get(10)[0]]);
  }
  sequence.dispose();
  output.dispose();
  return values;
}

describe("native SvxTabStopItem", /** Groups original container and property contracts. @returns Nothing. */ () => {
  it("retains original factories, copies, live two-pass merge and hash omissions", /** Checks position-only replacement independently of all-field value equality. @returns Nothing. */ () => {
    const defaults = SvxTabStopItem.CreateDefault();
    expect(defaults.Which()).toBe(0);
    expect(defaults.Count()).toBe(SVX_TAB_DEFCOUNT);
    expect(defaults.At(9).GetTabPos()).toBe(10 * SVX_TAB_DEFDIST);
    const item = createTabs(
      42,
      [new SvxTabStop(1), new SvxTabStop(2), new SvxTabStop(3), new SvxTabStop(4)],
      -7,
    );
    expect(item.GetPos(new SvxTabStop(2, SvxTabAdjust.Right, ";", "_"))).toBe(1);
    expect(item.GetPos(-1)).toBe(SVX_TAB_NOTFOUND);
    const clone = new SvxTabStopItem(item);
    expect(clone.Which()).toBe(42);
    expect(clone.At(0)).not.toBe(item.At(0));
    expect(clone.hashCode()).toBe(item.hashCode());
    expect(item.supportsHashCode()).toBe(true);
    const characters = createTabs(
      99,
      [
        new SvxTabStop(1, SvxTabAdjust.Left, ";", "_"),
        new SvxTabStop(2),
        new SvxTabStop(3),
        new SvxTabStop(4),
      ],
      -7,
    );
    expect(item.equals(characters)).toBe(false);
    expect(item.hashCode()).toBe(characters.hashCode());
    const source = createTabs(5, [new SvxTabStop(2, SvxTabAdjust.Right), new SvxTabStop(5)]);
    item.Insert(source);
    expect(
      tabStops(item).map(
        /** Reads ordered positions. @param value - Native tab. @returns Position. */ (value) =>
          value.GetTabPos(),
      ),
    ).toEqual([1, 2, 3, 4, 5]);
    expect(item.At(1).GetAdjustment()).toBe(SvxTabAdjust.Right);
    source.Remove(0);
    expect(item.Count()).toBe(5);
    clone.Insert(clone);
    expect(
      tabStops(clone).map(
        /** Reads surviving self-merge positions. @param value - Native tab. @returns Position. */ (
          value,
        ) => value.GetTabPos(),
      ),
    ).toEqual([2, 4]);
    clone.Remove(0, 2);
    expect(clone.Count()).toBe(0);
    expect(clone.QueryValue()).toBeUndefined();
    expect(new SvxTabStopItem(3, 0, SvxTabAdjust.Center, 1).Count()).toBe(1);
    expect(new SvxTabStopItem(0, 0, SvxTabAdjust.Left, 1).Count()).toBe(0);
  });

  it("exchanges every adjustment, signed positions, UTF16 characters and converted distances", /** Checks independent enum orders, duplicate last-wins and real source conversion. @returns Nothing. */ () => {
    const item = createTabs(1, [], 123);
    const values = [
      new TabStop(1270, TabAlign.LEFT, 44, 32),
      new TabStop(-2540, TabAlign.CENTER, 46, 95),
      new TabStop(0, TabAlign.RIGHT, 59, 0xd800),
      new TabStop(2540, TabAlign.DECIMAL, 46, 46),
      new TabStop(5080, TabAlign.DEFAULT, 44, 32),
      new TabStop(7620, 99 as TabAlign, 46, 95),
    ];
    const input = typed(values);
    expect(item.PutValue(input, MID_TABSTOPS | CONVERT_TWIPS)).toBe(true);
    input.dispose();
    expect(query(item)).toEqual([
      [-1440, TabAlign.CENTER, 46, 95],
      [0, TabAlign.RIGHT, 59, 0xd800],
      [720, TabAlign.LEFT, 44, 32],
      [1440, TabAlign.DECIMAL, 46, 46],
      [2880, TabAlign.DEFAULT, 44, 32],
      [4320, TabAlign.DEFAULT, 46, 95],
    ]);
    expect(query(item, CONVERT_TWIPS)).toEqual([
      [-2540, TabAlign.CENTER, 46, 95],
      [0, TabAlign.RIGHT, 59, 0xd800],
      [1270, TabAlign.LEFT, 44, 32],
      [2540, TabAlign.DECIMAL, 46, 46],
      [5080, TabAlign.DEFAULT, 44, 32],
      [7620, TabAlign.DEFAULT, 46, 95],
    ]);
    expect(item.GetDefaultDistance()).toBe(123);
    const duplicate = typed([
      new TabStop(42, TabAlign.LEFT, 46, 32),
      new TabStop(42, TabAlign.RIGHT, 44, 95),
    ]);
    expect(item.PutValue(duplicate, 0)).toBe(true);
    duplicate.dispose();
    expect(query(item)).toEqual([[42, TabAlign.RIGHT, 44, 95]]);
    const empty = typed([]);
    expect(item.PutValue(empty, 0)).toBe(true);
    empty.dispose();
    expect(query(item)).toEqual([]);
    for (const adjustment of [
      SvxTabAdjust.Left,
      SvxTabAdjust.Right,
      SvxTabAdjust.Decimal,
      SvxTabAdjust.Center,
      SvxTabAdjust.Default,
      SvxTabAdjust.End,
    ]) {
      item.Insert(new SvxTabStop(adjustment, adjustment, ";", "_"));
    }
    expect(
      query(item).map(
        /** Reads UNO alignment. @param row - Native four fields. @returns Alignment. */ (row) =>
          row[1],
      ),
    ).toEqual([
      TabAlign.LEFT,
      TabAlign.RIGHT,
      TabAlign.DECIMAL,
      TabAlign.CENTER,
      TabAlign.DEFAULT,
      TabAlign.DEFAULT,
    ]);
  });

  it("accepts real nested Any enum/long and char/string fallbacks without early mutation", /** Checks legacy sequence inputs and each field extraction failure. @returns Nothing. */ () => {
    const item = createTabs(1, [new SvxTabStop(800)], 77);
    const direct = [
      new Any([900], "sal_Int32"),
      new Any([TabAlign.RIGHT], alignType),
      new Any([59], "UnoCharType"),
      new Any([95], "UnoCharType"),
    ] as const;
    const fallback = [
      new Any([-700], "sal_Int32"),
      new Any([TabAlign.DECIMAL], "sal_Int32"),
      text(","),
      text("."),
    ];
    const input = nested([direct, fallback]);
    expect(item.PutValue(input, 0)).toBe(true);
    input.dispose();
    expect(query(item)).toEqual([
      [-700, TabAlign.DECIMAL, 44, 46],
      [900, TabAlign.RIGHT, 59, 95],
    ]);
    expect(item.GetDefaultDistance()).toBe(77);
    const before = item.Clone();
    const bad = new Any(true),
      empty = text(""),
      multiple = text("ab");
    const cases = [
      [],
      direct.slice(0, 3),
      [bad, ...direct.slice(1)],
      [direct[0], bad, ...direct.slice(2)],
      [direct[0], direct[1], bad, direct[3]],
      [direct[0], direct[1], empty, direct[3]],
      [direct[0], direct[1], multiple, direct[3]],
      [...direct.slice(0, 3), bad],
      [...direct.slice(0, 3), multiple],
    ];
    for (const row of cases) {
      const candidate = nested([direct, row]);
      expect(item.PutValue(candidate, 0)).toBe(false);
      candidate.dispose();
      expect(item.equals(before)).toBe(true);
    }
    expect(item.PutValue(bad, 0)).toBe(false);
    expect(item.PutValue({}, 0)).toBe(false);
    const blank = nested([]);
    expect(item.PutValue(blank, 0)).toBe(true);
    blank.dispose();
    expect(item.Count()).toBe(0);
    for (const value of [...direct, ...fallback, bad, empty, multiple]) value.dispose();
  });

  it("preserves scalar validation, byte selectors, conversion order and untouched unknown properties", /** Checks the distinct first/default distance contracts. @returns Nothing. */ () => {
    const item = createTabs(
        1,
        [new SvxTabStop(720, SvxTabAdjust.Decimal, ";", "_"), new SvxTabStop(1440)],
        -720,
      ),
      output = new Any([99], "sal_Int32");
    expect(item.QueryValue(output, MID_STD_TAB)).toBe(true);
    expect(long(output)).toBe(720);
    expect(item.QueryValue(output, MID_STD_TAB | CONVERT_TWIPS)).toBe(true);
    expect(long(output)).toBe(1270);
    expect(item.QueryValue(output, MID_TABSTOP_DEFAULT_DISTANCE)).toBe(true);
    expect(long(output)).toBe(-720);
    expect(item.QueryValue(output, MID_TABSTOP_DEFAULT_DISTANCE | CONVERT_TWIPS)).toBe(true);
    expect(long(output)).toBe(-1270);
    for (const member of [MID_STD_TAB, MID_TABSTOP_DEFAULT_DISTANCE]) {
      expect(item.PutValue({}, member)).toBe(false);
      const invalid = new Any(true);
      expect(item.PutValue(invalid, member)).toBe(false);
      invalid.dispose();
      const negative = new Any([-1], "sal_Int32");
      expect(item.PutValue(negative, member)).toBe(false);
      negative.dispose();
    }
    const zero = new Any([0], "sal_Int32");
    expect(item.PutValue(zero, MID_STD_TAB)).toBe(false);
    expect(item.PutValue(zero, MID_TABSTOP_DEFAULT_DISTANCE)).toBe(true);
    zero.dispose();
    const position = new Any([2540], "sal_Int32");
    expect(item.PutValue(position, MID_STD_TAB | CONVERT_TWIPS | 256)).toBe(true);
    position.dispose();
    expect(item.Count()).toBe(1);
    expect(item.At(0).GetTabPos()).toBe(1440);
    expect(item.At(0).GetAdjustment()).toBe(SvxTabAdjust.Decimal);
    expect(item.At(0).GetDecimal()).toBe(";");
    expect(item.At(0).GetFill()).toBe("_");
    const distance = new Any([1270], "sal_Int32");
    expect(item.PutValue(distance, MID_TABSTOP_DEFAULT_DISTANCE | CONVERT_TWIPS)).toBe(true);
    expect(item.GetDefaultDistance()).toBe(720);
    expect(item.PutValue(distance, MID_STD_TAB)).toBe(true);
    expect(item.At(0).GetTabPos()).toBe(1270);
    expect(item.PutValue(distance, MID_TABSTOP_DEFAULT_DISTANCE)).toBe(true);
    expect(item.GetDefaultDistance()).toBe(1270);
    distance.dispose();
    const before = item.Clone();
    expect(item.PutValue({}, 3 | CONVERT_TWIPS)).toBe(true);
    expect(item.equals(before)).toBe(true);
    expect(item.QueryValue(output, 3 | CONVERT_TWIPS)).toBe(true);
    expect(long(output)).toBe(-1270);
    output.dispose();
    for (const distance of [65536])
      expect(
        /** Supplies an out-of-domain counted distance. @returns Invalid item. */ () =>
          new SvxTabStopItem(1, distance, SvxTabAdjust.Left, 1),
      ).toThrow("constructor");
  });

  it("retains the original unsigned16 count and not-found collisions beyond 65535 stored values", /** Defined native narrowing differs from the underlying vector size. @returns Nothing. */ () => {
    const item = new SvxTabStopItem(65535, 1, SvxTabAdjust.Left, 1);
    expect(item.Count()).toBe(65535);
    expect(item.Insert(new SvxTabStop(65536, SvxTabAdjust.Left, ".", " "))).toBe(true);
    expect(item.Count()).toBe(0);
    expect(item.GetPos(65536)).toBe(SVX_TAB_NOTFOUND);
    expect(item.Insert(new SvxTabStop(65536, SvxTabAdjust.Right, ";", "_"))).toBe(false);
    expect(item.At(65535).GetAdjustment()).toBe(SvxTabAdjust.Left);
    const empty = createTabs(1, []);
    expect(item.equals(empty)).toBe(true);
    expect(item.hashCode()).not.toBe(empty.hashCode());
    const clone = item.Clone();
    expect(clone.Count()).toBe(0);
    expect(clone.At(65535).GetTabPos()).toBe(65536);
    expect(query(item)).toEqual([]);
  });
});
