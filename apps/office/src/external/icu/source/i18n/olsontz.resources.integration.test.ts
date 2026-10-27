/** @fileoverview Tests Olson admission, transition suppression and rule equality using independently owned valid decoded resource tables. */
import { expect, it } from "vitest";
import * as resources from "../common/uresbund";
import type { Resource } from "../common/uresbund";
import { UnicodeString } from "../common/unistr";
import { OlsonTimeZone } from "./olsontz";
import { SimpleTimeZone } from "./simpletz";
import { TimeZoneTransition } from "./tztrans";
import { openOlsonResource } from "./timezone.resources";
import { UErrorCode as E } from "../common/unicode/utypes";

/** Owned native table node. */
type Table = Extract<Resource, { type: 2 }>;
let storage = 0;
/** Creates a genuinely owned decoded native vector or binary buffer. @param values - Original native scalar storage. @param type - Native storage kind. @returns Owned node. */
function vector(values: readonly number[], type: 1 | 14 = 14): Resource {
  return { type, storage: `6VDB2H-olson-${storage++}`, value: values };
}
/** Creates a source-ordered native table with canonical alias metadata. @param values - Owned child resources. @returns Native table. */
function table(values: Readonly<Record<string, Resource>>): Table {
  const keys = Object.keys(values).sort();
  return { type: 2, keys, aliasIndices: [], value: values };
}
/** Constructs through actual public resource handles; all custom data is input storage rather than private zone state. @param changes - Changed or missing native fields. @param finalRule - Optional alternative valid root rule vector. @returns Owner and source status. */
function zone(
  changes: Readonly<Record<string, Resource | undefined>> = {},
  finalRule?: readonly number[],
): {
  value: OlsonTimeZone;
  status: number;
} {
  const status: [number] = [0],
    input = new resources.UResourceBundle(),
    top = openOlsonResource(new UnicodeString("Etc/UTC"), input, status);
  expect(status[0]).toBe(0);
  const nodes: Record<string, Resource> = {
    transPre32: vector([-1, -16]),
    trans: vector([0, 3600]),
    transPost32: vector([1, 0]),
    typeOffsets: vector([0, 0, 3600, 0, 0, 3600]),
    typeMap: vector([0, 1, 1, 0], 1),
  };
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) Reflect.deleteProperty(nodes, key);
    else nodes[key] = value;
  }
  input.resource = table(nodes);
  if (top !== null && finalRule !== undefined)
    top.resource = table({ Rules: table({ EU: vector(finalRule) }) });
  const value = new OlsonTimeZone(top, input, new UnicodeString("Etc/UTC"), status);
  resources.ures_close(input);
  resources.ures_close(top);
  return { value, status: status[0] };
}

it.each([
  ["odd pre32", "transPre32", vector([1]), E.U_INVALID_FORMAT_ERROR],
  ["oversized pre32", "transPre32", vector(Array(32768).fill(0)), E.U_INVALID_FORMAT_ERROR],
  ["oversized trans", "trans", vector(Array(32768).fill(0)), E.U_INVALID_FORMAT_ERROR],
  ["odd post32", "transPost32", vector([1]), E.U_INVALID_FORMAT_ERROR],
  ["oversized post32", "transPost32", vector(Array(32768).fill(0)), E.U_INVALID_FORMAT_ERROR],
  ["empty offsets", "typeOffsets", vector([]), E.U_INVALID_FORMAT_ERROR],
  ["odd offsets", "typeOffsets", vector([0, 0, 1]), E.U_INVALID_FORMAT_ERROR],
  ["oversized offsets", "typeOffsets", vector(Array(32767).fill(0)), E.U_INVALID_FORMAT_ERROR],
  ["missing map", "typeMap", undefined, E.U_INVALID_FORMAT_ERROR],
  ["short map", "typeMap", vector([0], 1), E.U_INVALID_FORMAT_ERROR],
] as const)(
  "rejects decoded zone data with %s",
  /** Real resource shapes must fail before malformed rules can escape into offset dispatch. @param label - Source corruption description. @param key - Native field. @param data - Owned payload. @param expected - Original error. @returns Nothing. */ (
    _label,
    key,
    data,
    expected,
  ) => {
    const result = zone({ [key]: data });
    expect(result.status).toBe(expected);
    expect(result.value.getCanonicalID()).toBeNull();
    const raw: [number] = [77],
      dst: [number] = [88];
    result.value.getOffset(0, false, raw, dst, [0]);
    expect([raw[0], dst[0]]).toEqual([0, 0]);
  },
);

it("compares separately owned valid native buffers and suppresses equivalent intermediate transitions", /** Numeric and nullable-buffer comparisons cannot rely only on shared pinned storage identity. @returns Nothing. */ () => {
  const original = zone(),
    equal = zone(),
    transition = new TimeZoneTransition();
  expect([original.status, equal.status]).toEqual([0, 0]);
  expect(original.value.hasSameRules(equal.value)).toBe(true);
  expect(original.value.equals(equal.value)).toBe(true);
  expect(original.value.hasSameRules(new SimpleTimeZone(0, new UnicodeString("Etc/UTC")))).toBe(
    false,
  );
  expect(original.value.assign(original.value)).toBe(original.value);
  expect(original.value.getNextTransition(1, false, transition)).toBe(true);
  expect(transition.getTime()).toBe(4294967296000);
  expect(original.value.getPreviousTransition(3600001, false, transition)).toBe(true);
  expect(transition.getTime()).toBe(0);
  expect(original.value.getPreviousTransition(-1, false, transition)).toBe(false);
  for (const [key, data] of [
    ["transPre32", vector([-1, -17])],
    ["trans", vector([1, 3600])],
    ["transPost32", vector([1, 1])],
    ["typeOffsets", vector([0, 0, 3601, 0, 0, 3600])],
    ["typeMap", vector([0, 2, 1, 0], 1)],
  ] as const)
    expect(original.value.hasSameRules(zone({ [key]: data }).value)).toBe(false);
  const absent = zone({
      transPre32: undefined,
      transPost32: undefined,
      trans: vector([]),
      typeMap: undefined,
    }),
    empty = zone({
      transPre32: vector([]),
      transPost32: vector([]),
      trans: vector([]),
      typeMap: undefined,
    });
  expect([absent.status, empty.status]).toEqual([0, 0]);
  expect(absent.value.hasSameRules(empty.value)).toBe(true);
});

it("accepts a no-change historical map and a final rule while preserving exact transition boundaries", /** Alternative decoded rules exercise valid source forms absent from the pinned data release. @returns Nothing. */ () => {
  const unchanged = zone({ typeMap: vector([0, 0, 0, 0], 1) }),
    transition = new TimeZoneTransition();
  expect(unchanged.status).toBe(0);
  expect(unchanged.value.countTransitionRules([0])).toBe(0);
  expect(unchanged.value.getNextTransition(-1e15, false, transition)).toBe(false);
  const final = zone({
    transPost32: undefined,
    typeMap: vector([0, 1, 1], 1),
    finalRule: { type: 0, value: "EU" },
    finalRaw: { type: 7, value: 0 },
    finalYear: { type: 7, value: 2050 },
  });
  expect(final.status).toBe(0);
  expect(final.value.getNextTransition(Date.UTC(2050, 0, 1), false, transition)).toBe(true);
  const boundary = transition.getTime();
  expect(final.value.getNextTransition(boundary, true, transition)).toBe(true);
  expect(transition.getTime()).toBe(boundary);
  expect(final.value.getPreviousTransition(boundary, true, transition)).toBe(true);
  expect(transition.getTime()).toBe(boundary);
});

it("extracts a valid fixed final zone with no stored historical transitions", /** Fixed final rules use the original initial-to-final boundary rather than synthesizing annual DST rules. @returns Nothing. */ () => {
  const result = zone(
    {
      transPre32: undefined,
      trans: vector([]),
      transPost32: undefined,
      typeMap: undefined,
      finalRule: { type: 0, value: "EU" },
      finalRaw: { type: 7, value: 3600 },
      finalYear: { type: 7, value: 2050 },
    },
    [2, 0, 0, 0, 0, 10, 0, 0, 0, 0, 3600],
  );
  expect(result.status).toBe(0);
  const transition = new TimeZoneTransition(),
    boundary = Date.UTC(2050, 0, 1);
  expect(result.value.countTransitionRules([0])).toBe(1);
  // Native Olson getNextTransition falls through when historicRules is null, even with a fixed final boundary.
  expect(result.value.getNextTransition(boundary - 1, false, transition)).toBe(false);
  expect(transition.getTime()).toBe(0);
  expect(result.value.getNextTransition(boundary, true, transition)).toBe(true);
  expect(transition.getTime()).toBe(boundary);
  expect(result.value.getNextTransition(boundary, false, transition)).toBe(false);
  expect(result.value.getPreviousTransition(boundary, true, transition)).toBe(true);
  expect(transition.getTime()).toBe(boundary);
  expect(result.value.getPreviousTransition(boundary + 1, false, transition)).toBe(true);
  expect(transition.getTime()).toBe(boundary);
});
