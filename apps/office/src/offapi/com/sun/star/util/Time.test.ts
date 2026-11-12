/** @fileoverview Original Time IDL scalar defaults, native widths and real CPPU compound/Any/Sequence transport for DOM event timestamps. */
import { expect, it } from "vitest";
import { Time, cppu_detail_getUnoType_Time as timeType } from "./Time";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
it("retains default/copy/member construction and original declared widths", /** SDK scalar operations do not apply range validation beyond ABI widths. @returns Nothing. */ () => {
  const empty = new Time(),
    value = new Time(4294967297, 65537, 65538, 65539, true),
    copy = new Time(value),
    assigned = new Time();
  expect([empty.NanoSeconds, empty.Seconds, empty.Minutes, empty.Hours, empty.IsUTC]).toEqual([
    0,
    0,
    0,
    0,
    false,
  ]);
  expect([value.NanoSeconds, value.Seconds, value.Minutes, value.Hours, value.IsUTC]).toEqual([
    1,
    1,
    2,
    3,
    true,
  ]);
  expect(copy.equals(value)).toBe(true);
  expect(copy.notEquals(value)).toBe(false);
  expect(assigned.assign(value)).toBe(assigned);
  for (const field of ["NanoSeconds", "Seconds", "Minutes", "Hours", "IsUTC"] as const) {
    const different = new Time(value);
    if (field === "IsUTC") different.IsUTC = false;
    else different[field] = 9;
    expect(value.equals(different)).toBe(false);
    expect(value.notEquals(different)).toBe(true);
  }
  value.NanoSeconds = 9;
  expect(copy.NanoSeconds).toBe(1);
  expect(assigned.NanoSeconds).toBe(1);
  expect(timeType()).toBe(timeType());
});
it("transports actual Time values through typed Any and sequence storage", /** The actual compound member cells preserve source IDL order and field identity. @returns Nothing. */ () => {
  const source = new Time(999999999, 59, 58, 23, true),
    any = new Any(source, timeType),
    output = new Time(),
    Times = Sequence.specialize<Time>(timeType, 12),
    sequence = new Times(1);
  try {
    expect(any.extract(sequence.getArray(), timeType)).toBe(true);
    source.Seconds = 1;
    expect(any.extract(output, timeType)).toBe(true);
    expect([
      output.NanoSeconds,
      output.Seconds,
      output.Minutes,
      output.Hours,
      output.IsUTC,
    ]).toEqual([999999999, 59, 58, 23, true]);
    expect(((sequence.getConstArray() as SequenceElements).get(4) as [number])[0]).toBe(59);
    expect(((sequence.getConstArray() as SequenceElements).get(10) as [boolean])[0]).toBe(true);
    const copy = new Times(sequence);
    try {
      ((sequence.getArray() as SequenceElements).get(4) as [number])[0] = 7;
      expect(((copy.getConstArray() as SequenceElements).get(4) as [number])[0]).toBe(59);
    } finally {
      copy.dispose();
    }
  } finally {
    sequence.dispose();
    any.dispose();
  }
});
