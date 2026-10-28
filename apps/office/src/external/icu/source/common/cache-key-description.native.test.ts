/** @fileoverview Original key diagnostics over real factory-created cached keys; the table is enumerated read-only and no type, factory or private field is replaced. */
import { expect, it } from "vitest";
import observations from "./cache-key-description.native-observations.json";
import { UnifiedCache, LocaleCacheKey, CacheKey } from "./unifiedcache";
import type { SharedObject } from "./sharedobject";
import { uhash_nextElement } from "./uhash";
import { Locale } from "./locid";
import { createInstance } from "../i18n/calendar.factory";
import { SimpleTimeZone } from "../i18n/simpletz";
import { UnicodeString } from "./unistr";

it("matches original locale and qualified base diagnostics for genuine Calendar cache keys", /** Original public factory construction supplies actual descriptors and specialized creation callbacks. Only initialized live keys are read; diagnostics operate on independently cloned owners and caller buffers. @returns Nothing. */ () => {
  const status: [number] = [0];
  for (const name of ["en_US", "de_DE", "en_US@calendar=gregorian", ""]) {
    status[0] = 0;
    expect(
      createInstance(new SimpleTimeZone(0, new UnicodeString("UTC")), new Locale(name), status),
    ).not.toBeNull();
    expect(status[0]).toBeLessThanOrEqual(0);
  }
  const cache = UnifiedCache.getInstance(status);
  if (!cache) throw new Error("Missing actual initialized cache");
  const keys = new Map<string, LocaleCacheKey<SharedObject>>(),
    position: [number] = [-1],
    table = cache["table"]();
  for (
    let entry = uhash_nextElement(table, position);
    entry !== null;
    entry = uhash_nextElement(table, position)
  ) {
    if (entry.key instanceof LocaleCacheKey) {
      // Read the original protected locale solely to select a real factory key.
      keys.set(entry.key["fLoc"].getName(), entry.key.clone());
    }
  }
  const count = cache.keyCount();
  try {
    expect(observations.cases).toHaveLength(96);
    for (const [query, expected] of observations.cases) {
      const [operation, name, capacity] = query as [string, string, number],
        key = keys.get(name),
        buffer = new Uint8Array(80).fill(0x58);
      if (!key) throw new Error("Missing actual locale cache key " + name);
      const output =
        operation === "L"
          ? key.writeDescription(buffer, capacity)
          : CacheKey.prototype.writeDescription.call(key, buffer, capacity);
      expect([Number(output === buffer), ...buffer], JSON.stringify(query)).toEqual(expected);
    }
    expect(cache.keyCount()).toBe(count);
  } finally {
    for (const key of keys.values()) key.dispose();
  }
});
