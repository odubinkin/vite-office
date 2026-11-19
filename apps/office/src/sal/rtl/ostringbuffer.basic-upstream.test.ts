/** @fileoverview Exact source expectations for all legacy OStringBuffer length/capacity/reserve/length-mutation and borrowed-pointer QA. */
import { expect, it } from "vitest";
import { OStringBuffer } from "../inc/rtl/strbuf";
import { OString } from "../inc/rtl/string";
import { getLength } from "./strtmpl";
import fixture from "./upstream-ostringbuffer-basic-cases.json";

/** Constructs the actual source OString fixture before the buffer's copying constructor. @param index - Pinned source arrOUS index. @returns Original buffer. */
function fromValue(index: number): OStringBuffer {
  const bytes = Uint8Array.from(fixture.values[index] as number[]);
  const value = index === 2 ? new OString() : new OString(bytes, bytes.length);
  try {
    return new OStringBuffer(value);
  } finally {
    value.dispose();
  }
}

it.each(fixture.cases)(
  "$name",
  /** Executes only operations and assertions present in the named pinned source method. @param source - Exact extracted case. @returns Nothing. */ (
    source,
  ) => {
    const buffer =
      source.constructor === "default"
        ? new OStringBuffer()
        : source.constructor === "capacity"
          ? new OStringBuffer(source.initial)
          : fromValue(source.initial);
    try {
      if (source.operation === "ensureCapacity") buffer.ensureCapacity(source.input);
      else if (source.operation === "setLength") buffer.setLength(source.input);
      if (source.length !== null) expect(buffer.getLength()).toBe(source.length);
      if (source.capacity !== null) expect(buffer.getCapacity()).toBe(source.capacity);
      if (source.firstByte !== null) expect(buffer.getStr()[0]).toBe(source.firstByte);
      if (source.cString !== null) {
        const value = new OString(buffer.getStr(), getLength(buffer.getStr()));
        try {
          expect(Array.from(value.getStr().subarray(0, value.getLength()))).toEqual(
            fixture.values[source.cString],
          );
        } finally {
          value.dispose();
        }
      }
    } finally {
      buffer.dispose();
    }
  },
);

it.each(["csuc_001", "getStr_001"])(
  "%s",
  /** Original16-byte strncmp-equality assertion. @returns Nothing. */ () => {
    const buffer = new OStringBuffer(Uint8Array.from(fixture.values[0] as number[]));
    try {
      expect(Array.from(buffer.getStr().subarray(0, 16))).toEqual(fixture.values[0]);
    } finally {
      buffer.dispose();
    }
  },
);
it("csuc_002", /** Original strlen-zero assertion on a default buffer. @returns Nothing. */ () => {
  const buffer = new OStringBuffer();
  try {
    expect(getLength(buffer.getStr())).toBe(0);
  } finally {
    buffer.dispose();
  }
});
it("getStr_002", /** Original nonnull-pointer assertion; no extra content assertion is substituted. @returns Nothing. */ () => {
  const buffer = new OStringBuffer();
  try {
    expect(buffer.getStr()).not.toBeNull();
  } finally {
    buffer.dispose();
  }
});
