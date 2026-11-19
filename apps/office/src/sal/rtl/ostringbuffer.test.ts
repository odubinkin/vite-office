/** @fileoverview Original test_ostringbuffer.cxx assertions and consumed buffer lifecycle/byte reservation contracts. */
import { expect, it, afterEach } from "vitest";
import { OStringBuffer } from "../inc/rtl/strbuf";
import { OString } from "../inc/rtl/string";
const owners: { dispose(): void }[] = [];
/** Tracks actual value destructors. @param value - Original value. @returns Same value. */
function own<T extends { dispose(): void }>(value: T): T {
  owners.push(value);
  return value;
}
/** Creates a counted ASCII byte view. @param value - Fixture text. @returns Bytes. */
function bytes(value: string): Uint8Array {
  return Uint8Array.from(
    value,
    /** Reads ASCII unit. @param unit - Unit. @returns Code. */ (unit) => unit.charCodeAt(0),
  );
}
afterEach(
  /** Destroys local original values. @returns Nothing. */ () => {
    while (owners.length) owners.pop()?.dispose();
  },
);
it("ports Test::testStringView", /** Original nonterminated two-byte assignment and terminator assertions. @returns Nothing. */ () => {
  const b = own(new OStringBuffer(bytes("foobar")));
  b.assign(bytes("abc").subarray(0, 2));
  expect(b.getLength()).toBe(2);
  expect(b.getStr()[0]).toBe(97);
  expect(b.getStr()[1]).toBe(98);
  expect(b.getStr()[2]).toBe(0);
});
it("ports Test::testOStringChar", /** Original char assignment assertions use an explicit erased-overload binding. @returns Nothing. */ () => {
  const b = own(new OStringBuffer(bytes("foobar")));
  b.assignChar(97);
  expect(b.getLength()).toBe(1);
  expect(b.getStr()[0]).toBe(97);
  expect(b.getStr()[1]).toBe(0);
});
it("retains copy capacity, independent mutations, assignment and clear/reuse", /** Exercises genuine SAL data without synthetic buffers or counters. @returns Nothing. */ () => {
  const empty = own(new OStringBuffer());
  expect(empty.isEmpty()).toBe(true);
  expect(empty.getCapacity()).toBe(16);
  const original = own(new OString(bytes("original"), 8)),
    buffer = own(new OStringBuffer(original)),
    copy = own(new OStringBuffer(buffer));
  expect(copy.getCapacity()).toBe(buffer.getCapacity());
  buffer.assign(bytes("changed"));
  expect(String.fromCharCode(...copy.getStr().subarray(0, copy.getLength()))).toBe("original");
  copy.assign(copy);
  copy.assign(buffer);
  expect(copy.getLength()).toBe(7);
  copy.assign(original);
  expect(copy.getLength()).toBe(8);
  const retained = own(copy.makeStringAndClear());
  expect(retained.getLength()).toBe(8);
  expect(copy.getCapacity()).toBe(0);
  expect(copy.isEmpty()).toBe(true);
  copy.assign(bytes("a long replacement"));
  expect(copy.getLength()).toBe(18);
  expect(String.fromCharCode(...retained.getStr().subarray(0, retained.getLength()))).toBe(
    "original",
  );
});
it("retains uninitialized reservation and source direct length mutation", /** Fills each reserved byte before observing the buffer; uninitialized native bytes are unqualified. @returns Nothing. */ () => {
  const b = own(new OStringBuffer(1));
  b.append(bytes("ab")).appendChar(0xff);
  const data = b.appendUninitialized(4);
  data.set([4, 5, 6, 7]);
  expect(Array.from(b.getStr().subarray(0, b.getLength() + 1))).toEqual([
    97, 98, 255, 4, 5, 6, 7, 0,
  ]);
  b.setLength(b.getLength());
  b.setLength(3);
  b.remove(1, 1);
  expect(b.getLength()).toBe(2);
  const grown = b.getCapacity() + 1;
  b.setLength(grown);
  b.getStr().fill(65, 2, grown);
  b.getStr()[grown] = 0;
  expect(b.getLength()).toBe(grown);
  b.ensureCapacity(grown);
  b.setLength(0);
  b.append(own(new OString(bytes("done"), 4)));
  expect(b.getLength()).toBe(4);
  expect(
    /** Invokes the source negative-length assertion. @returns Nothing. */ () => b.setLength(-1),
  ).toThrow("assert(newLength >= 0)");
});

it("preserves source pointer/count assertion and keeps reservation in appendUninitialized", /** Regression for the missing original precondition; genuine SAL bytes remain unchanged after rejected calls. @returns Nothing. */ () => {
  const b = own(new OStringBuffer(bytes("ab")));
  b.insert(1, bytes("Z"));
  expect(Array.from(b.getStr().subarray(0, b.getLength()))).toEqual([97, 90, 98]);
  b.insert(1, null, 0);
  b.append(null, 0);
  expect(
    /** Invokes the original invalid insertion precondition. @returns Original buffer. */ () =>
      b.insert(1, null, 1),
  ).toThrow("assert(len == 0 || str != NULL)");
  expect(
    /** Invokes counted append's delegated precondition. @returns Original buffer. */ () =>
      b.append(null, 1),
  ).toThrow("assert(len == 0 || str != NULL)");
  expect(Array.from(b.getStr().subarray(0, b.getLength()))).toEqual([97, 90, 98]);
});
