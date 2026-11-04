/** @fileoverview Replays original ICU scanner/converter/UTF16 termination calls, including every initialized output cell and untouched output sentinels. */
import { expect, it } from "vitest";
import native from "./ustrtrns.native-observations.json" with { type: "json" };
import { utf8_nextCharSafeBody } from "./unicode/utf8";
import { u_strFromUTF8, u_strFromUTF8WithSub } from "./unicode/ustring";
import { u_terminateUChars } from "./ustring";
/** Native scanner command arguments. */
type Scan = [string, number, number, number[]];
/** Native conversion command arguments. */
type Convert = [string, number, number, number, number, number, number[]];
/** Native termination command arguments. */
type Terminate = [string, number, number, number, number, number[]];
/** Invokes actual source APIs; this driver contains no alternate decoding/termination algorithm. @param item - Native input arguments. @returns Native-observable outputs. */
function observe(item: unknown): number[] {
  if ((item as Scan)[0] === "S") {
    const [, length, strict, bytes] = item as Scan;
    const input = new Uint8Array(bytes.length + 8);
    input.set(bytes);
    const index: [number] = [1];
    const value = utf8_nextCharSafeBody(input, index, length, input[0] as number, strict);
    return [value, index[0]];
  }
  if ((item as Terminate)[0] === "T") {
    const [, cap, len, initial, flags] = item as Terminate;
    const output = new Uint16Array(16).fill(0xcafe),
      status: [number] = [initial];
    const result = u_terminateUChars(
      flags & 2 ? null : output,
      cap,
      len,
      flags & 1 ? null : status,
    );
    return [result, status[0], ...output];
  }
  const [, cap, len, sub, initial, flags, bytes] = item as Convert;
  const input = new Uint8Array(bytes.length + 8);
  input.set(bytes);
  const output = new Uint16Array(16).fill(0xcafe),
    status: [number] = [initial],
    length: [number] = [1234],
    count: [number] = [5678],
    dest = flags & 2 ? null : output,
    src = flags & 1 ? null : input;
  const result =
    flags & 16
      ? u_strFromUTF8(dest, cap, flags & 4 ? null : length, src, len, status)
      : u_strFromUTF8WithSub(
          dest,
          cap,
          flags & 4 ? null : length,
          src,
          len,
          sub,
          flags & 8 ? null : count,
          status,
        );
  return [
    Number(result === null),
    Number(result === dest),
    length[0],
    count[0],
    status[0],
    ...output,
  ];
}
for (const group of native.groups) {
  const cases = group.cases,
    observations = group.observations;
  if (cases === undefined || observations === undefined) continue;
  it(`retains original ICU ${group.name}`, /** Checks every retained original output; pair matrices were also compared live by the native probe. @returns Nothing. */ () => {
    expect(cases.length).toBe(group.count);
    for (let i = 0; i < cases.length; ++i) expect(observe(cases[i])).toEqual(observations[i]);
  });
}
