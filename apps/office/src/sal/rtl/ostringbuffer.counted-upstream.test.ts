/** @fileoverview Every registered legacy counted-pointer append case from pinned rtl_OStringBuffer.cxx. */
import { expect, it } from "vitest";
import { OStringBuffer } from "../inc/rtl/strbuf";
import { OString } from "../inc/rtl/string";
import { getLength } from "./strtmpl";
import fixture from "./upstream-ostringbuffer-counted-append-cases.json";

/** Resolves literal source fixture bytes without consulting production conversion logic. @param name - Original source constant. @returns Original bytes. */
function bytes(name: string): Uint8Array {
  return Uint8Array.from((fixture.values as Record<string, number[]>)[name] as number[]);
}
it.each(fixture.cases)(
  "$name",
  /** Performs the original counted append and both C-string/value-length assertions. @param source - Extracted pinned test. @returns Nothing. */ (
    source,
  ) => {
    const initialName = fixture.initialValues[source.initial];
    const initial = initialName === null ? new Uint8Array() : bytes(initialName as string);
    const value = source.initial === 1 ? new OString() : new OString(initial, initial.length);
    const buffer = new OStringBuffer(value);
    try {
      buffer.append(bytes(source.input), source.count);
      const expected = source.expected === null ? new Uint8Array() : bytes(source.expected);
      const actual = new OString(buffer.getStr(), getLength(buffer.getStr()));
      try {
        expect(Array.from(actual.getStr().subarray(0, actual.getLength()))).toEqual(
          Array.from(expected),
        );
        expect(buffer.getLength()).toBe(expected.length);
      } finally {
        actual.dispose();
      }
    } finally {
      buffer.dispose();
      value.dispose();
    }
  },
);
