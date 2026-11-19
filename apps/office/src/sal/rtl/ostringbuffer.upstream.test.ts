/** @fileoverview Exact constructor/makeStringAndClear/remove QA from pinned sal/qa/OStringBuffer/rtl_OStringBuffer.cxx. */
import { afterEach, expect, it } from "vitest";
import { OStringBuffer } from "../inc/rtl/strbuf";
import { OString } from "../inc/rtl/string";
const owners: { dispose(): void }[] = [];
/** Retains local original values until fixture teardown. @param value - Actual value. @returns Same value. */
function own<T extends { dispose(): void }>(value: T): T {
  owners.push(value);
  return value;
}
/** Converts the pinned ASCII fixture into counted bytes. @param value - Fixture text. @returns Bytes. */
function bytes(value: string): Uint8Array {
  return Uint8Array.from(
    value,
    /** Reads one ASCII/native byte. @param unit - Original char. @returns Byte. */ (unit) =>
      unit.charCodeAt(0),
  );
}
/** Creates original OString fixture data. @param value - Counted bytes. @returns Original string. */
function string(value: Uint8Array): OString {
  return own(new OString(value, value.length));
}
/** Reads logical bytes for original equality assertions. @param value - Original value. @returns Byte list. */
function data(value: OString | OStringBuffer): number[] {
  return Array.from(value.getStr().subarray(0, value.getLength()));
}
afterEach(
  /** Executes source fixture local destructors. @returns Nothing. */ () => {
    while (owners.length) owners.pop()?.dispose();
  },
);
const normal = bytes("Sun Microsystems");
it("ctors::ctor_001", /** Original default empty/terminator/capacity assertions. @returns Nothing. */ () => {
  const b = own(new OStringBuffer());
  expect(b.isEmpty()).toBe(true);
  expect(b.getStr()[0]).toBe(0);
  expect(b.getCapacity()).toBe(16);
});
it("ctors::ctor_002", /** Original copy length/capacity and source content assertion. @returns Nothing. */ () => {
  const value = string(normal),
    source = own(new OStringBuffer(value)),
    copy = own(new OStringBuffer(source));
  expect(copy.getLength()).toBe(source.getLength());
  expect(copy.getCapacity()).toBe(source.getCapacity());
  expect(data(source)).toEqual(data(value));
});
it("ctors::ctor_003", /** Original explicit capacities32 and0 with empty/terminator assertions. @returns Nothing. */ () => {
  for (const capacity of [32, 0]) {
    const b = own(new OStringBuffer(capacity));
    expect(b.isEmpty()).toBe(true);
    expect(b.getStr()[0]).toBe(0);
    expect(b.getCapacity()).toBe(capacity);
  }
});
it("ctors::ctor_004", /** Original OString construction equality/length/capacity assertions. @returns Nothing. */ () => {
  const value = string(normal),
    b = own(new OStringBuffer(value));
  expect(data(b)).toEqual(data(value));
  expect(b.getLength()).toBe(value.pData.length);
  expect(b.getCapacity()).toBe(b.getLength() + 16);
});
it("ctors::ctor_005", /** Source regression constructs a copy of a cleared capacity-zero buffer. @returns Nothing. */ () => {
  const first = own(new OStringBuffer());
  own(first.makeStringAndClear());
  own(new OStringBuffer(first));
});
it("ctors::ctor_006", /** Original constant-byte constructor length/capacity assertions. @returns Nothing. */ () => {
  const b = own(new OStringBuffer(normal));
  expect(b.getLength()).toBe(16);
  expect(b.getCapacity()).toBe(b.getLength() + 16);
});
const special = Uint8Array.of(
  0o50,
  3,
  5,
  7,
  0o11,
  0o13,
  0o15,
  0o17,
  115,
  117,
  110,
  0o21,
  0o23,
  0o25,
  0o27,
  0o31,
  0o33,
  0o50,
);
const clearInputs: Array<[string, number | Uint8Array | undefined]> = [
  ["001", undefined],
  ["002", 26],
  ["003", normal],
  ["004", bytes("   Sun Microsystems")],
  ["005", new Uint8Array()],
  ["006", bytes("s")],
  ["007", special],
  ["008", Uint8Array.of(0)],
];
it.each(clearInputs)(
  "makeStringAndClear::makeStringAndClear_%s",
  /** Original8-case fixture equality, zero-capacity and empty terminator assertions. @param _name - Original case suffix. @param input - Original fixture constructor argument. @returns Nothing. */ (
    _name,
    input,
  ) => {
    const b = own(
        input instanceof Uint8Array ? new OStringBuffer(string(input)) : new OStringBuffer(input),
      ),
      result = own(b.makeStringAndClear());
    if (input instanceof Uint8Array) expect(data(result)).toEqual(Array.from(input));
    else expect(result.isEmpty()).toBe(true);
    expect(b.getCapacity()).toBe(0);
    expect(b.getStr()[0]).toBe(0);
  },
);
it("remove::remove_001", /** Original Red Hat fixture and every removal/append assertion. @returns Nothing. */ () => {
  const b = own(new OStringBuffer(bytes("Red Hat, Inc.")));
  b.remove(0, 4);
  expect(data(own(b.toString()))).toEqual(Array.from(bytes("Hat, Inc.")));
  b.remove(3, 6);
  expect(data(own(b.toString()))).toEqual(Array.from(bytes("Hat")));
  b.remove(0, 100);
  expect(own(b.toString()).isEmpty()).toBe(true);
  b.append(bytes("Red Hat, Inc."));
  b.remove(3, 100);
  expect(data(own(b.toString()))).toEqual(Array.from(bytes("Red")));
  b.remove(0, b.getLength());
  expect(own(b.toString()).isEmpty()).toBe(true);
});
