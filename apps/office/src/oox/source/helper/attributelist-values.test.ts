/** @fileoverview Original presence/default/token/numeric/boolean attribute contracts using actual FastTokenHandler, FastAttributeList and SAL/o3tl converters. */
import { expect, it } from "vitest";
import { AttributeList, AttributeConversion as C } from "./attributelist";
import { FastTokenHandler } from "../core/fasttokenhandler";
import { getTokenFromUtf8 as token, XML_TOKEN_INVALID } from "../token/tokenmap";
import { FastAttributeList } from "../../../sax/source/tools/fastattribs";
import { toDouble } from "../../../o3tl/inc/string_view";
/** Creates an actual XML attribute owner and real token handler. @param value - Optional value; absence means missing. @returns Native owners. */
function attributes(value?: string) {
  const fast = new FastAttributeList(new FastTokenHandler());
  fast.add(2, "preceding");
  if (value !== undefined) fast.add(1, value);
  return { fast, list: new AttributeList(fast) };
}
/** Existing counted UTF16 view binding. @param value - Text. @returns Units. */
function units(value: string): Uint16Array {
  return Uint16Array.from(
    value,
    /** Maps ASCII literals to native units. @param c - Character. @returns Unit. */ (c) =>
      c.charCodeAt(0),
  );
}
it.each([
  ["", 0, 0n, 0],
  ["123tail", 123, 123n, 123],
  [" -17", -17, -17n, 0],
  ["2147483648", 0, 2147483648n, 2147483648],
  ["4294967296", 0, 4294967296n, 4294967295],
  ["9223372036854775808", 0, 0n, 0],
  ["not-number", 0, 0n, 0],
] as const)(
  "retains decimal conversion %s",
  /** Original bounded decimal literal outputs. @param source - Text. @param integer - Signed32. @param hyper - Signed64. @param unsigned - Clamped unsigned32. @returns Nothing. */ (
    source,
    integer,
    hyper,
    unsigned,
  ) => {
    const value = units(source),
      { list } = attributes(source);
    expect(C.decodeInteger(value)).toBe(integer);
    expect(C.decodeHyper(value)).toBe(hyper);
    expect(C.decodeUnsigned(value)).toBe(unsigned);
    expect(list.getInteger(1)).toBe(integer);
    expect(list.getInteger(1, 97)).toBe(integer);
    expect(list.getHyper(1)).toBe(source === "" ? undefined : hyper);
    expect(list.getHyper(1, 97n)).toBe(source === "" ? 97n : hyper);
    expect(list.getUnsigned(1)).toBe(source === "" ? undefined : unsigned);
    expect(list.getUnsigned(1, 97)).toBe(source === "" ? 97 : unsigned);
  },
);
it.each([
  ["ffffffff", -1, 4294967295],
  ["80000000", -2147483648, 2147483648],
  ["12Af", 4783, 4783],
  ["100000000", 0, 0],
  ["-1", 0, 0],
  ["z", 0, 0],
  ["", undefined, 97],
] as const)(
  "retains hexadecimal %s",
  /** Original unsigned-hex then signed32 cast. @param source - Text. @param expected - Optional signed32. @param unsigned - Defaulted unsigned32. @returns Nothing. */ (
    source,
    expected,
    unsigned,
  ) => {
    const { list } = attributes(source);
    expect(C.decodeIntegerHex(units(source))).toBe(expected ?? 0);
    expect(list.getIntegerHex(1)).toBe(expected);
    expect(list.getIntegerHex(1, 97)).toBe(expected ?? 97);
    expect(list.getUnsignedHex(1, 97)).toBe(unsigned);
  },
);
it.each([
  ["", 0],
  ["1.25rest", 1.25],
  ["-0", -0],
  ["1e3", 1000],
  ["1,25", 1],
  ["bad", 0],
] as const)(
  "retains byte-view floating conversion %s",
  /** Original RTL decimal prefix without grouping. @param source - Input. @param expected - Value. @returns Nothing. */ (
    source,
    expected,
  ) => {
    const { list } = attributes(source);
    expect(toDouble(new TextEncoder().encode(source))).toBe(expected);
    expect(list.getDouble(1)).toBe(expected);
    expect(list.getDouble(1, 97)).toBe(expected);
  },
);
it.each([
  ["false", false],
  ["true", true],
  ["t", true],
  ["f", false],
  ["on", true],
  ["off", false],
  ["1", true],
  ["0", false],
  ["-2", true],
  ["2rest", true],
  ["2147483648", false],
  ["", false],
  ["TRUE", false],
  ["xalse", false],
  ["fxlse", false],
  ["faxse", false],
  ["falxe", false],
  ["falsx", false],
  ["xrue", false],
  ["txue", false],
  ["trxe", false],
  ["trux", false],
  ["false\0", false],
] as const)(
  "retains boolean spelling %j",
  /** Original lexical/token/numeric boolean results. @param source - Input. @param expected - Literal bool. @returns Nothing. */ (
    source,
    expected,
  ) => {
    const { list } = attributes(source);
    expect(list.getBool(1)).toBe(expected);
    expect(list.getBool(1, !expected)).toBe(expected);
  },
);
it("keeps missing outputs/defaults and present unknown token behavior distinct", /** Actual native outputs retain original missing/present semantics. @returns Nothing. */ () => {
  const { fast, list } = attributes();
  const integer: [number] = [73],
    double: [number] = [73],
    prior = Uint8Array.of(7),
    view: [Uint8Array] = [prior];
  expect(fast.getAsInteger(1, integer)).toBe(false);
  expect(integer[0]).toBe(0);
  expect(fast.getAsDouble(1, double)).toBe(false);
  expect(double[0]).toBe(0);
  expect(fast.getAsView(1, view)).toBe(false);
  expect(view[0]).toBe(prior);
  expect(list.getInteger(1)).toBeUndefined();
  expect(list.getInteger(1, 97)).toBe(97);
  expect(list.getDouble(1)).toBeUndefined();
  expect(list.getDouble(1, 97)).toBe(97);
  expect(list.getUnsigned(1)).toBeUndefined();
  expect(list.getUnsigned(1, 97)).toBe(97);
  expect(list.getHyper(1)).toBeUndefined();
  expect(list.getHyper(1, 97n)).toBe(97n);
  expect(list.getIntegerHex(1)).toBeUndefined();
  expect(list.getIntegerHex(1, 97)).toBe(97);
  expect(list.getUnsignedHex(1, 97)).toBe(97);
  expect(list.getBool(1)).toBeUndefined();
  expect(list.getBool(1, true)).toBe(true);
  expect(list.getToken(1)).toBeUndefined();
  expect(list.getToken(1, 97)).toBe(97);
  fast.add(1, "not-a-known-token");
  expect(list.getToken(1)).toBeUndefined();
  expect(list.getToken(1, 97)).toBe(XML_TOKEN_INVALID);
  expect(fast.getOptionalValueToken(9, 97)).toBe(97);
});
it("keeps real handler identity on copies/clones and first duplicate attribute lookup", /** Uses only genuine lexical owner, not injected token results. @returns Nothing. */ () => {
  const { fast, list } = attributes("visible");
  fast.add(1, "hidden");
  expect(list.getToken(1)).toBe(token("visible"));
  expect(list.getToken(1, 97)).toBe(token("visible"));
  expect(fast.createClone().getValueTokenByIndex(1)).toBe(token("visible"));
  const view: [Uint8Array] = [new Uint8Array()];
  expect(fast.getAsView(1, view)).toBe(true);
  expect(new TextDecoder().decode(view[0])).toBe("visible");
  const handler = new FastTokenHandler();
  expect(handler.getTokenDirect("hidden")).toBe(token("hidden"));
  expect(handler.getTokenDirect(new TextEncoder().encode("hidden"))).toBe(token("hidden"));
});
