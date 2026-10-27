/** @fileoverview Checks likely-subtag loader admission of corrupted decoded resource records while retaining real bundle, table, array and string-pool owners. */
import { assert, expect, it, vi } from "vitest";
import * as resources from "./uresbund";
import type { Resource } from "./uresbund";
import { LikelySubtagsData, LocaleDistanceData } from "./loclikelysubtags.data";
import { UErrorCode as E } from "./unicode/utypes";

/** Decoded native table with source-ordered keys and owned child values. */
type Table = Extract<Resource, { type: 2 }>;
/** Copies immutable pinned native resource data into test-owned storage. @param key - Native resource key. @returns Independently owned table. */
function nativeTable(key: string): Table {
  const status: [number] = [0],
    root = resources.ures_openDirect(null, "langInfo", status),
    child = resources.ures_getByKey(root, key, null, status);
  assert(child?.resource?.type === 2);
  const result = structuredClone(child.resource);
  resources.ures_close(child);
  resources.ures_close(root);
  expect(status[0]).toBe(0);
  return result;
}
const originalLikely = nativeTable("likely"),
  originalMatch = nativeTable("match");
let storage = 0;
/** Builds a real typed integer-vector resource with independent storage identity. @param values - Raw native integers. @returns Owned decoded node. */
function vector(values: readonly number[]): Resource {
  return { type: 14, storage: `6VDB2H-vector-${storage++}`, value: values };
}
/** Builds a real typed array resource. @param values - Ordered child nodes. @returns Owned decoded node. */
function array(values: readonly Resource[]): Resource {
  return { type: 8, aliasIndices: [], value: values };
}
/** Builds one raw UTF16 string resource. @param value - Source string. @returns Owned node. */
function string(value: string): Resource {
  return { type: 0, value };
}
/** Retains valid native table key/alias metadata while changing selected owned children. @param source - Pinned table. @param changes - Replacement/deletion fields. @returns Owned test table. */
function patch(source: Table, changes: Readonly<Record<string, Resource | undefined>>): Table {
  const value = { ...source.value };
  for (const [key, next] of Object.entries(changes)) {
    if (next === undefined) Reflect.deleteProperty(value, key);
    else value[key] = next;
  }
  const keys = Object.keys(value).sort();
  return {
    type: 2,
    keys,
    value,
    aliasIndices: keys.flatMap(
      /** Preserves source alias index ownership. @param key - Ordered key. @param index - Key index. @returns Alias position or none. */ (
        key,
        index,
      ) => (value[key]?.type === 3 ? [index] : []),
    ),
  };
}

const cases: readonly [
  string,
  "likely" | "match",
  Readonly<Record<string, Resource | undefined>>,
  E,
][] = [
  ["missing m49", "likely", { m49: undefined }, E.U_MISSING_RESOURCE_ERROR],
  ["wrong m49 type", "likely", { m49: string("bad") }, E.U_RESOURCE_TYPE_MISMATCH],
  [
    "wrong language aliases",
    "likely",
    { languageAliases: string("bad") },
    E.U_RESOURCE_TYPE_MISMATCH,
  ],
  [
    "odd language aliases",
    "likely",
    { languageAliases: array([string("en")]) },
    E.U_INVALID_FORMAT_ERROR,
  ],
  [
    "non-string language alias",
    "likely",
    { languageAliases: array([{ type: 7, value: 1 }]) },
    E.U_RESOURCE_TYPE_MISMATCH,
  ],
  [
    "odd region aliases",
    "likely",
    { regionAliases: array([string("US")]) },
    E.U_INVALID_FORMAT_ERROR,
  ],
  [
    "non-invariant language alias",
    "likely",
    { languageAliases: array([string("é"), string("en")]) },
    E.U_INVARIANT_CONVERSION_ERROR,
  ],
  ["wrong LSR vector", "likely", { lsrnum: string("bad") }, E.U_RESOURCE_TYPE_MISMATCH],
  ["empty LSR vector", "likely", { lsrnum: vector([]) }, E.U_MISSING_RESOURCE_ERROR],
  ["missing trie", "likely", { trie: undefined }, E.U_MISSING_RESOURCE_ERROR],
  ["wrong trie type", "likely", { trie: vector([1]) }, E.U_RESOURCE_TYPE_MISMATCH],
  ["wrong matching trie type", "match", { trie: string("bad") }, E.U_RESOURCE_TYPE_MISMATCH],
  [
    "wrong partition vector",
    "match",
    { regionToPartitions: string("bad") },
    E.U_RESOURCE_TYPE_MISMATCH,
  ],
  [
    "short partition vector",
    "match",
    { regionToPartitions: { type: 1, storage: "6VDB2H-short-partitions", value: [] } },
    E.U_INVALID_FORMAT_ERROR,
  ],
  ["wrong partitions array", "match", { partitions: string("bad") }, E.U_RESOURCE_TYPE_MISMATCH],
  ["wrong paradigms vector", "match", { paradigmnum: string("bad") }, E.U_RESOURCE_TYPE_MISMATCH],
  ["wrong distances vector", "match", { distances: string("bad") }, E.U_RESOURCE_TYPE_MISMATCH],
  ["short distances vector", "match", { distances: vector([1, 2, 3]) }, E.U_INVALID_FORMAT_ERROR],
];

it.each(cases)(
  "rejects %s through actual typed resource views",
  /** Injects a corrupt decoded response only after real bundle loading, without fake table/array implementations. @param name - Native schema failure. @param key - Selected table. @param changes - Corrupt child records. @param expected - Source ICU error. @returns Nothing. */ (
    name,
    key,
    changes,
    expected,
  ) => {
    void name;
    const actual = resources.ures_getValueWithFallback,
      replacement = patch(key === "likely" ? originalLikely : originalMatch, changes);
    const read = vi.spyOn(resources, "ures_getValueWithFallback").mockImplementation(
      /** Preserves normal lookup, owners and status before replacing one decoded payload. @param bundle - Actual bundle. @param path - Resource path. @param temp - Actual temporary owner. @param value - Actual value holder. @param status - Caller status. @returns Nothing. */ (
        bundle,
        path,
        temp,
        value,
        status,
      ) => {
        actual(bundle, path, temp, value, status);
        if (path === key && status[0] <= 0) value.setResource(replacement);
      },
    );
    const status: [number] = [0],
      data = new LikelySubtagsData(status);
    try {
      data.load(status);
      expect(status[0]).toBe(expected);
    } finally {
      data.close();
      read.mockRestore();
    }
    expect(data.langInfoBundle).toBeNull();
  },
);

it("preserves optional absent match fields and moves owned arrays independently of borrowed vectors", /** Source move resets owned pointer arrays but preserves borrowed mapped buffers. @returns Nothing. */ () => {
  const actual = resources.ures_getValueWithFallback,
    empty = patch(
      originalMatch,
      Object.fromEntries(
        originalMatch.keys.map(
          /** Removes optional source match fields. @param key - Resource key. @returns Deletion entry. */ (
            key,
          ) => [key, undefined],
        ),
      ),
    );
  const read = vi.spyOn(resources, "ures_getValueWithFallback").mockImplementation(
    /** Leaves actual likely data intact while exposing a valid empty optional match table. @param bundle - Actual bundle. @param path - Resource path. @param temp - Temporary owner. @param value - Holder. @param status - Status. @returns Nothing. */ (
      bundle,
      path,
      temp,
      value,
      status,
    ) => {
      actual(bundle, path, temp, value, status);
      if (path === "match" && status[0] <= 0) value.setResource(empty);
    },
  );
  const status: [number] = [0],
    data = new LikelySubtagsData(status);
  try {
    data.load(status);
    expect(status[0]).toBe(0);
    expect(data.lsrsLength).toBeGreaterThan(0);
    expect(data.distanceData.partitions).toBeNull();
    expect(data.distanceData.paradigms).toBeNull();
  } finally {
    data.close();
    read.mockRestore();
  }
  const normal = new LikelySubtagsData([0]),
    good: [number] = [0];
  try {
    normal.load(good);
    expect(good[0]).toBe(0);
    const partitions = normal.distanceData.partitions,
      trie = normal.distanceData.distanceTrieBytes,
      moved = LocaleDistanceData.move(normal.distanceData);
    expect(moved.partitions).toBe(partitions);
    expect(moved.distanceTrieBytes).toBe(trie);
    expect(normal.distanceData.partitions).toBeNull();
    expect(normal.distanceData.paradigms).toBeNull();
    expect(normal.distanceData.distanceTrieBytes).toBe(trie);
  } finally {
    normal.close();
  }
});
