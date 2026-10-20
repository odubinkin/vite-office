/** @fileoverview Native UTF16 cursor steps,including surrogate pairs and original assertion boundaries. */
import { expect, it } from "vitest";
import { iterateCodePoints } from "./string_view";

it("moves by Unicode codepoints while reporting original UTF16 positions", /** Exercises source forward/backward cursor semantics rather than host string iteration. @returns Nothing. */ () => {
  const text = new Uint16Array([65, 0xd83d, 0xde00, 66, 0xdc00]);
  const pos: [number] = [0];
  expect(iterateCodePoints(text, pos)).toBe(65);
  expect(pos[0]).toBe(1);
  expect(iterateCodePoints(text, pos)).toBe(0x1f600);
  expect(pos[0]).toBe(3);
  expect(iterateCodePoints(text, pos, 0)).toBe(66);
  expect(pos[0]).toBe(3);
  expect(iterateCodePoints(text, pos, 2)).toBe(66);
  expect(pos[0]).toBe(5);
  for (const [expected, offset] of [
    [0xdc00, 4],
    [66, 3],
    [0x1f600, 1],
    [65, 0],
  ]) {
    expect(iterateCodePoints(text, pos, -1)).toBe(expected);
    expect(pos[0]).toBe(offset);
  }
  expect(iterateCodePoints(new Uint16Array([0xdc00]), [1], -1)).toBe(0xdc00);
  expect(iterateCodePoints(new Uint16Array([0xd800, 65]), [0])).toBe(0xd800);
  expect(iterateCodePoints(new Uint16Array([0xd800]), [0])).toBe(0xd800);
});

it("retains native bounds assertions at invalid cursor and step boundaries", /** Invalid native preconditions surface as the port's assertion errors. @returns Nothing. */ () => {
  const text = new Uint16Array([65]);
  for (const [position, step] of [
    [-1, 0],
    [2, 0],
    [1, 0],
    [0, -1],
    [0, 2],
  ])
    expect(
      /** Evaluates one invalid native cursor request. @returns Codepoint. */ () =>
        iterateCodePoints(text, [position as number], step as number),
    ).toThrow(/assert/);
});
