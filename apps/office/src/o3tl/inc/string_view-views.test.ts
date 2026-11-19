/** @fileoverview Native UTF16 borrowed token/trim views and decimal wrapper contracts consumed by VCL variation parsing. */
import { expect, it } from "vitest";
import { getToken, trim, toDouble, toInt64, toUInt32 } from "./string_view";
it("returns original token subviews,including empty/trailing tokens and terminal npos", /** Tests native size_t-position overload rather than OUString nth-token semantics. @returns Nothing. */ () => {
  const source = Uint16Array.of(120, 44, 44, 121, 44),
    position: [number] = [0];
  const first = getToken(source, 44, position);
  expect([...first]).toEqual([120]);
  expect(first.buffer).toBe(source.buffer);
  expect(position[0]).toBe(2);
  expect(getToken(source, 44, position)).toHaveLength(0);
  expect(position[0]).toBe(3);
  expect([...getToken(source, 44, position)]).toEqual([121]);
  expect(position[0]).toBe(5);
  expect(getToken(source, 44, position)).toHaveLength(0);
  expect(position[0]).toBe(-1);
  expect(
    /** Invokes the original terminal-position assertion. @returns No returned token. */ () =>
      getToken(source, 44, position),
  ).toThrow("assert(position <= sv.size())");
  expect(
    /** Invokes the original out-of-range assertion. @returns No returned token. */ () =>
      getToken(source, 44, [6]),
  ).toThrow("assert(position <= sv.size())");
  const empty: [number] = [0];
  expect(getToken(new Uint16Array(), 44, empty)).toHaveLength(0);
  expect(empty[0]).toBe(-1);
  const narrow: [number] = [0];
  expect([...getToken(Uint16Array.of(65, 65535, 66), -1, narrow)]).toEqual([65]);
  expect(narrow[0]).toBe(2);
});
it("trims original UTF16 whitespace as a borrowed view and preserves nonwhitespace controls", /** Covers native default empty result and source classifier boundaries. @returns Nothing. */ () => {
  const source = Uint16Array.of(9, 0x200b, 65, 66, 0x2029, 32),
    result = trim(source);
  expect([...result]).toEqual([65, 66]);
  expect(result.buffer).toBe(source.buffer);
  expect(result.byteOffset).toBe(source.byteOffset + 4);
  expect(trim(new Uint16Array())).toHaveLength(0);
  expect(trim(Uint16Array.of(32, 9))).toHaveLength(0);
  expect([...trim(Uint16Array.of(0, 32))]).toEqual([0]);
  expect([...trim(Uint16Array.of(0xa0, 65, 0xfeff))]).toEqual([0xa0, 65, 0xfeff]);
});
it("uses original decimal-point and no-group parsing without status/end outputs", /** Checks actual RTL prefix behavior without JS number conversion. @returns Nothing. */ () => {
  expect(toDouble(Uint16Array.of(32, 45, 49, 46, 53, 120))).toBe(-1.5);
  expect(toDouble(Uint16Array.of(49, 44, 50))).toBe(1);
  expect(toDouble(Uint16Array.of(120))).toBe(0);
});

it("retains the original signed32 getToken overload family and negative sentinel", /** The signed overload is distinct from the size_t-position API. @returns Nothing. */ () => {
  const source = Uint16Array.from([97, 44, 98, 44, 99]),
    index: [number] = [0];
  expect([...getToken(source, 0, 44, index)]).toEqual([97]);
  expect(index[0]).toBe(2);
  expect([...getToken(source, 1, 44, index)]).toEqual([99]);
  expect(index[0]).toBe(-1);
  expect([...getToken(source, 0, 44, index)]).toEqual([]);
  expect(index[0]).toBe(-1);
  index[0] = 0;
  expect([...getToken(source, -1, 44, index)]).toEqual([]);
  expect(index[0]).toBe(-1);
  index[0] = 0;
  expect([...getToken(source, 3, 44, index)]).toEqual([]);
  expect(index[0]).toBe(-1);
  expect([...getToken(source, 1, 44)]).toEqual([98]);
  index[0] = source.length;
  expect([...getToken(source, 0, 44, index)]).toEqual([]);
  expect(index[0]).toBe(-1);
  index[0] = source.length + 1;
  expect(
    /** Original signed-index upper precondition. @returns Token. */ () =>
      getToken(source, 0, 44, index),
  ).toThrow("rnIndex");
  const trailing = new Uint16Array([97, 44]);
  index[0] = 0;
  expect([...getToken(trailing, 1, 44, index)]).toEqual([]);
  expect(index[0]).toBe(-1);
});

it("retains original default-radix byte and Unicode scalar views", /** Public overloads use actual bounded shared C parsers. @returns Nothing. */ () => {
  expect(toInt64(new Uint8Array([45, 52, 50]))).toBe(-42n);
  expect(toInt64(new Uint16Array([52, 50]))).toBe(42n);
  expect(toUInt32(new Uint8Array([50, 53, 53]))).toBe(255);
  expect(toUInt32(new Uint16Array([45, 49]))).toBe(0);
});
it("specializes both token-view overload sets for counted bytes without UTF16 conversion", /** Actual borrowed subviews preserve byte storage, empty fields and terminal indices. @returns Nothing. */ () => {
  const source = Uint8Array.of(32, 65, 32, 32, 66, 32),
    position: [number] = [0];
  const tokens: Uint8Array[] = [];
  while (position[0] !== -1) tokens.push(getToken(source, 32, position));
  expect(
    tokens.map(
      /** Copies observed borrowed byte fields. @param value - Token view. @returns Scalar bytes. */ (
        value,
      ) => [...value],
    ),
  ).toEqual([[], [65], [], [66], []]);
  expect(
    tokens.every(
      /** Observes shared backing storage. @param value - Token view. @returns Same source allocation. */ (
        value,
      ) => value.buffer === source.buffer,
    ),
  ).toBe(true);
  source[1] = 90;
  expect(tokens[1]?.[0]).toBe(90);
  expect(
    /** Invokes the original terminal-position assertion. @returns No valid token. */ () =>
      getToken(source, 32, position),
  ).toThrow("assert(position <= sv.size())");
  const index: [number] = [0],
    selected = getToken(source, 3, 32, index);
  expect([...selected]).toEqual([66]);
  expect(index[0]).toBe(6);
  expect(selected.buffer).toBe(source.buffer);
  expect([...getToken(source, 1, 32)]).toEqual([90]);
  expect(getToken(source, -1, 32)).toBeInstanceOf(Uint8Array);
  expect(getToken(source, 99, 32)).toHaveLength(0);
  expect([...getToken(Uint8Array.of(65, 255, 66), -1, [0])]).toEqual([65]);
});
