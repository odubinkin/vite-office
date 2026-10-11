/** @fileoverview Replays the complete original OUString subView values, borrowed storage and separate checked range assertions. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import fixture from "../../cppu/source/typelib/native-type-primitives-cases.json";
import { OUString, OUStringLiteral } from "../inc/rtl/ustring";
import type { OUStringConstReference } from "../inc/rtl/ustring";

it("matches every original subView range and complete borrowed ownership observation", /** Replays every returned unit and original initialized ownership/pointer witness. @returns Nothing. */ () => {
  const words: number[] = [];
  /** Captures complete original signed words. @param values - Initialized original fields. @returns Nothing. */
  function emit(...values: (number | boolean)[]): void {
    for (const value of values) words.push(Number(value));
  }
  /** Observes exact borrowed units, offset identity and unchanged live owner. @param view - Borrowed UTF16 units. @param owner - Original const owner reference. @param begin - Original offset. @returns Nothing. */
  function viewState(view: Uint16Array, owner: OUStringConstReference, begin: number): void {
    const data = owner.getStr();
    emit(
      view.length,
      view.buffer === data.buffer && view.byteOffset === data.byteOffset + begin * 2,
      owner.pData?.refCount as number,
      owner.getLength(),
      data[owner.getLength()] as number,
    );
    for (const unit of view) emit(unit);
  }
  /** Executes both actual overloads over every valid range of the complete input. @param units - Complete original logical units. @returns Nothing. */
  function observe(units: readonly number[]): void {
    const value = new OUString(Uint16Array.from(units), units.length),
      data = value.pData;
    for (let begin = 0; begin <= value.getLength(); begin++) {
      viewState(value.subView(begin), value, begin);
      emit(value.pData === data);
      for (let count = 0; count <= value.getLength() - begin; count++) {
        viewState(value.subView(begin, count), value, begin);
        emit(value.pData === data);
      }
    }
    value.dispose();
  }
  for (let word = 0; word < 65536; word++) observe([0, word, 0xffff]);
  for (const units of fixture.subView.inputs) observe(units);
  {
    const value = new OUString(Uint16Array.from([65, 0, 66]), 3),
      held = new OUString(value),
      borrowed = value.subView(1, 2);
    viewState(borrowed, held, 1);
    const old = held.pData;
    value.clear();
    emit(value.pData === old, held.pData.refCount);
    viewState(borrowed, held, 1);
    emit(value.pData.refCount, value.getLength());
    for (let i = 0; i <= value.getLength(); i++) emit(value.getStr()[i] as number);
    value.dispose();
    held.dispose();
  }
  {
    const literal = new OUStringLiteral(Uint16Array.from([65, 0, 66, 0])),
      value = new OUString(literal);
    for (let begin = 0; begin <= value.getLength(); begin++)
      viewState(value.subView(begin), value, begin);
    value.dispose();
  }
  const actual = Buffer.alloc(words.length * 4);
  words.forEach(
    /** Writes all original little-endian signed words. @param word - Original field. @param offset - Word offset. @returns Nothing. */
    (word, offset) => {
      actual.writeInt32LE(word, offset * 4);
    },
  );
  const expected = gunzipSync(Buffer.from(fixture.subView.gzipBase64, "base64"));
  expect(createHash("sha256").update(expected).digest("hex")).toBe(fixture.subView.rawHash);
  expect(actual.length).toBe(expected.length);
  expect(actual.equals(expected)).toBe(true);
});

it("preserves every original checked subView range assertion and its order", /** Keeps undefined invalid native ranges separate from successful returned views. @returns Nothing. */ () => {
  const inputs: readonly (readonly [number, number?])[] = [
    [-1],
    [4],
    [-1, -1],
    [0, -1],
    [4, -1],
    [4, 0],
    [1, 3],
    [0x7fffffff],
    [-0x80000000],
    [3, 0x7fffffff],
  ];
  expect(fixture.subViewAssertions).toHaveLength(inputs.length);
  for (const observed of fixture.subViewAssertions) {
    const value = new OUString(Uint16Array.from([97, 98, 99]), 3),
      data = value.pData,
      input = inputs[observed.index] as readonly [number, number?];
    let actual: unknown;
    try {
      value.subView(...input);
    } catch (error) {
      actual = error;
    }
    expect(observed.signal).toBe("SIGABRT");
    expect(actual).toBeInstanceOf(Error);
    expect((actual as Error).message.replace(/\s/g, "")).toBe(
      `assert(${observed.expression})`.replace(/\s/g, ""),
    );
    expect(value.pData).toBe(data);
    expect(value.pData.refCount).toBe(1);
    expect(Array.from(value.getStr())).toEqual([97, 98, 99, 0]);
    value.dispose();
  }
});

it("retains the original const-reference borrowed view surface without acquiring", /** Checks the shared reinterpret reference API consumed by native type-name parsing. @returns Nothing. */ () => {
  const owner = new OUString(Uint16Array.from([58, 64, 49, 44, 48]), 5),
    reference = OUString.unacquired([owner.pData]),
    view = reference.subView(2, 1);
  expect(Array.from(view)).toEqual([49]);
  expect(view.buffer).toBe(owner.getStr().buffer);
  expect(view.byteOffset).toBe(owner.getStr().byteOffset + 4);
  expect(owner.pData.refCount).toBe(1);
  owner.dispose();
});
