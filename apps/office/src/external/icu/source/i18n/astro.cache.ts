/** @fileoverview Original ICU78.3 CalendarCache from astro.cpp, using the actual sized integer UHashtable. Native ccLock is projected to synchronous realm execution. */
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import * as H from "../common/uhash";
/** Original unbounded calendar integer memoization owner; zero is the native missing-value result. */
export class CalendarCache {
  private fTable: H.UHashtable<number, number> | null;
  /** Original sized integer hash table creation. @param size - Capacity hint. @param status - Sticky status. @returns Cache. */
  constructor(size: number, status: [number]) {
    this.fTable = H.uhash_openSize<number, number>(
      /** Original uhash_hashLong integer identity. @param key - Integer. @returns Hash. */ (key) =>
        key | 0,
      /** Original uhash_compareLong equality. @param a - Left integer. @param b - Right integer. @returns Equality. */ (
        a,
        b,
      ) => a === b,
      null,
      size,
      status,
    );
  }
  /** Original private lazy creation, including null output-pointer memory error. @param cache - Native output pointer/null. @param status - Sticky status. @returns Nothing. */
  private static createCache(cache: [CalendarCache | null] | null, status: [number]): void {
    if (cache === null) {
      status[0] = UErrorCode.U_MEMORY_ALLOCATION_ERROR;
      return;
    }
    cache[0] = new CalendarCache(32, status);
    if (U_FAILURE(status[0])) {
      cache[0].dispose();
      cache[0] = null;
    }
  }
  /** Original lazy get under ccLock. @param cache - Actual mutable cache pointer. @param key - Signed32 key. @param status - Sticky status. @returns Value/zero. */
  static get(cache: [CalendarCache | null], key: number, status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    if (cache[0] === null) {
      this.createCache(cache, status);
      if (U_FAILURE(status[0])) return 0;
    }
    return H.uhash_igeti((cache[0] as CalendarCache).fTable as H.UHashtable<number, number>, key);
  }
  /** Original lazy put under ccLock. @param cache - Actual mutable cache pointer. @param key - Signed32 key. @param value - Signed32 value. @param status - Sticky status. @returns Nothing. */
  static put(cache: [CalendarCache | null], key: number, value: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    if (cache[0] === null) {
      this.createCache(cache, status);
      if (U_FAILURE(status[0])) return;
    }
    H.uhash_iputi(
      (cache[0] as CalendarCache).fTable as H.UHashtable<number, number>,
      key,
      value,
      status,
    );
  }
  /** Original destructor releases its actual table. @returns Nothing. */
  dispose(): void {
    H.uhash_close(this.fTable);
    this.fTable = null;
  }
}
