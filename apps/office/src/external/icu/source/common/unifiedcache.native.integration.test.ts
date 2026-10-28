/** @fileoverview Replays complete original ICU78.3 cache/reference/eviction observations with real source owners and concrete application key/value clients. */
import { expect, it } from "vitest";
import observations from "./unifiedcache.native-observations.json";
import { createCacheObserver } from "../../../../test/icu-unifiedcache-observer";
it("matches every native cache operation, pointer count and destruction order", /** The sequence includes collisions, cached errors/warnings, aliases, reference transfer, explicit flush and incremental eviction; native mutex deadlock scenarios remain outside this witness. @returns Nothing. */ () => {
  const observer = createCacheObserver();
  try {
    expect(observations.cases).toHaveLength(2445);
    for (const [query, output] of observations.cases)
      expect(observer.step(query as string), query).toBe(output);
  } finally {
    observer.dispose();
  }
});
