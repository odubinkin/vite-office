/** @fileoverview Replays every complete original character row, comparison and assertion without native source dependencies. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import * as character from "./character";
import captured from "./native-character-cases.json";

/** Complete portable original native observation corpus. */
interface Corpus {
  pointCount: number;
  pointFields: string[];
  rawHash: string;
  rawBytes: number;
  initial: number[];
  runs: number[][];
  pairs: [number, number, number][];
  constants: number[];
  conversions: [number, number, number][];
  guards: {
    name: string;
    args: number[];
    expression: string;
    pointerNull?: boolean;
    signal: string;
  }[];
  compileGuards: {
    name: string;
    type: string;
    caller: string;
    accepted: boolean;
    diagnostic: string;
  }[];
}
const native = captured as unknown as Corpus;

it("matches every initialized original Unicode codepoint and surrogate-pair observation", /** Compares every original row and the entire native raw digest. @returns Nothing. */ () => {
  expect(native.pointCount).toBe(0x110000);
  expect(native.pointFields).toHaveLength(24);
  expect(
    native.runs.reduce(
      /** Counts every decoded observation. @param total - Prior count. @param row - Lossless delta run. @returns Accumulated count. */ (
        total,
        row,
      ) => total + (row[0] as number),
      1,
    ),
  ).toBe(native.pointCount);
  const bytes = new Uint8Array(24 * 4 * 4096);
  const view = new DataView(bytes.buffer);
  const digest = createHash("sha256");
  const output = new Uint16Array(2);
  let position = 0,
    runIndex = 0,
    remaining = 0,
    supplementary = 0;
  const expected = [...native.initial];
  for (let code = 0; code < native.pointCount; code++) {
    if (code > 0) {
      if (remaining === 0) remaining = (native.runs[runIndex++] as number[])[0] as number;
      const delta = native.runs[runIndex - 1] as number[];
      for (let i = 0; i < expected.length; i++)
        expected[i] = (expected[i] as number) + (delta[i + 1] as number);
      remaining--;
    }
    output.set([0x5555, 0xaaaa]);
    let high = 0xffffffff,
      low = 0xffffffff,
      combined = 0xffffffff;
    if (code >= 0x10000) {
      high = character.getHighSurrogate(code);
      low = character.getLowSurrogate(code);
      combined = character.combineSurrogates(high, low);
      supplementary++;
    }
    const count = character.splitSurrogates(code, output);
    const actual = [
      code,
      Number(character.isUnicodeCodePoint(code)),
      Number(character.isAscii(code)),
      Number(character.isAsciiLowerCase(code)),
      Number(character.isAsciiUpperCase(code)),
      Number(character.isAsciiAlpha(code)),
      Number(character.isAsciiDigit(code)),
      Number(character.isAsciiAlphanumeric(code)),
      Number(character.isAsciiCanonicHexDigit(code)),
      Number(character.isAsciiHexDigit(code)),
      Number(character.isAsciiOctalDigit(code)),
      Number(character.isAsciiWhiteSpace(code)),
      character.toAsciiUpperCase(code),
      character.toAsciiLowerCase(code),
      Number(character.isSurrogate(code)),
      Number(character.isHighSurrogate(code)),
      Number(character.isLowSurrogate(code)),
      Number(character.isUnicodeScalarValue(code)),
      high,
      low,
      combined,
      count,
      output[0] as number,
      output[1] as number,
    ];
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i])
        throw new Error(
          `Original codepoint${code} field${native.pointFields[i]} differs: actual${actual[i]}, native${expected[i]}`,
        );
      view.setUint32(position, actual[i] as number, true);
      position += 4;
    }
    if (position === bytes.length) {
      digest.update(bytes);
      position = 0;
    }
  }
  if (position > 0) digest.update(bytes.subarray(0, position));
  expect(remaining).toBe(0);
  expect(runIndex).toBe(native.runs.length);
  expect(supplementary).toBe(1048576);
  expect(native.rawBytes).toBe(native.pointCount * 24 * 4);
  expect(digest.digest("hex")).toBe(native.rawHash);
});

it("matches all original ASCII pair differences, cross-boundary conversions and detail constants", /** Compares complete original caller outputs. @returns Nothing. */ () => {
  expect(native.pairs).toHaveLength(65536 + 42 * 42);
  for (const [first, second, result] of native.pairs) {
    const actual = character.compareIgnoreAsciiCase(first, second);
    if (actual !== result)
      throw new Error(`Original comparison${first}/${second}: actual${actual}, native${result}`);
  }
  for (const [input, point, scalar] of native.conversions) {
    expect(Number(character.isUnicodeCodePoint(input))).toBe(point);
    expect(Number(character.isUnicodeScalarValue(input))).toBe(scalar);
  }
  expect([
    character.detail.surrogatesHighFirst,
    character.detail.surrogatesHighLast,
    character.detail.surrogatesLowFirst,
    character.detail.surrogatesLowLast,
  ]).toEqual(native.constants);
});

it("preserves every captured original runtime assertion and deleted native overload rejection", /** Executes original invalid inputs and checks separate compiler evidence. @returns Nothing. */ () => {
  expect(native.guards).toHaveLength(25);
  for (const guard of native.guards) {
    expect(guard.signal).toBe("SIGABRT");
    expect(
      /** Calls only the original invalid input boundary. @returns Native-adapted assertion failure. */ () => {
        if (guard.name === "splitSurrogates")
          return character.splitSurrogates(
            guard.args[0] as number,
            guard.pointerNull ? null : new Uint16Array(2),
          );
        const fn = character[guard.name as keyof typeof character];
        if (typeof fn !== "function") throw new Error("Invalid original function selector");
        return Reflect.apply(fn, null, guard.args);
      },
    ).toThrow(`assert(${guard.expression})`);
  }
  expect(native.compileGuards).toHaveLength(24);
  for (const guard of native.compileGuards) {
    expect(guard.accepted).toBe(false);
    expect(guard.diagnostic).toBe("deleted");
    expect(guard.caller).toContain(`rtl::${guard.name}(code)`);
  }
});
