/** @fileoverview Original ICU78.3 UnifiedCache creation/status, reference ownership and incremental eviction over the actual UHashtable. Synchronous realm execution replaces native mutex boundaries; in-progress same-key recursion retains the native nontermination contract. */
import { UErrorCode, U_FAILURE, U_SUCCESS } from "./unicode/utypes";
import type { LocaleConstReference } from "./locid";
import { SharedObject, UnifiedCacheBase } from "./sharedobject";
import {
  CacheKeyBase,
  LocaleCacheKey,
  type CacheKey,
  type CacheValueType,
} from "./unifiedcache.key";
import * as H from "./uhash";
export { CacheKeyBase, CacheKey, LocaleCacheKey } from "./unifiedcache.key";
export type { CacheValueType } from "./unifiedcache.key";
/** Original concrete cache and its one native hash table. */
export class UnifiedCache extends UnifiedCacheBase {
  private static gCache: UnifiedCache | null = null;
  private fHashtable: H.UHashtable<CacheKeyBase, SharedObject> | null = null;
  private readonly fEvictPos: [number] = [-1];
  private fNumValuesTotal = 0;
  private fNumValuesInUse = 0;
  private fMaxUnused = 1000;
  private fMaxPercentageOfInUse = 100;
  private fAutoEvictedCount = 0n;
  private fNoValue: SharedObject | null = null;
  /** Original initialization, including protected placeholder reference counts. @param status - Sticky status. @returns Cache. */
  constructor(status: [number]) {
    super();
    if (U_FAILURE(status[0])) return;
    this.fNoValue = new SharedObject();
    this.fNoValue["softRefCount"] = 1;
    this.fNoValue["hardRefCount"] = 1;
    this.fNoValue["cachePtr"] = this;
    this.fHashtable = H.uhash_open<CacheKeyBase, SharedObject>(
      /** Original key hash callback. @param key - Key. @returns Hash. */ (key) => key.hashCode(),
      /** Original key equality callback. @param a - Left key. @param b - Right key. @returns Equality. */ (
        a,
        b,
      ) => a.equals(b),
      null,
      status,
    );
    if (U_FAILURE(status[0])) return;
    H.uhash_setKeyDeleter(
      this.table(),
      /** Original owned key deletion. @param key - Actual adopted key. @returns Nothing. */ (
        key,
      ) => key.dispose(),
    );
  }
  /** Original singleton lookup. @param status - Sticky status. @returns Shared cache/null. */
  static getInstance(status: [number]): UnifiedCache | null {
    if (U_FAILURE(status[0])) return null;
    if (this.gCache === null) this.gCache = new UnifiedCache(status);
    return U_FAILURE(status[0]) ? null : this.gCache;
  }
  /** Actual initialized table; source callers likewise require valid construction. @returns Original table. */
  private table(): H.UHashtable<CacheKeyBase, SharedObject> {
    return this.fHashtable as H.UHashtable<CacheKeyBase, SharedObject>;
  }
  /** Original generic get wrapper preserves incoming warnings and unchanged output on failure. @param key - Template key. @param ptr - Retained output. @param status - Sticky status. @param context - Original optional opaque context. @returns Nothing. */
  get<T extends SharedObject>(
    key: CacheKey<T>,
    ptr: [T | null],
    status: [number],
    context: unknown = null,
  ): void {
    if (U_FAILURE(status[0])) return;
    const creationStatus: [number] = [0],
      value: [SharedObject | null] = [null];
    this._get(key, value, context, creationStatus);
    if (U_SUCCESS(creationStatus[0])) SharedObject.copyPtr(value[0] as T | null, ptr);
    SharedObject.clearPtr(value);
    if (status[0] === 0 || U_FAILURE(creationStatus[0])) status[0] = creationStatus[0];
  }
  /** Original explicit-template getByLocale projection. @param type - Erased native template argument. @param locale - Locale. @param ptr - Retained output. @param status - Sticky status. @returns Nothing. */
  static getByLocale<T extends SharedObject>(
    type: CacheValueType<T>,
    locale: LocaleConstReference,
    ptr: [T | null],
    status: [number],
  ): void {
    const cache = UnifiedCache.getInstance(status);
    if (U_FAILURE(status[0])) return;
    (cache as UnifiedCache).get(new LocaleCacheKey(type, locale), ptr, status);
  }
  /** Original eviction policy does not evict immediately. @param count - Absolute unused floor. @param percentage - Percentage of in-use items. @param status - Sticky status. @returns Nothing. */
  setEvictionPolicy(count: number, percentage: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    count |= 0;
    percentage |= 0;
    if (count < 0 || percentage < 0) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    this.fMaxUnused = count;
    this.fMaxPercentageOfInUse = percentage;
  }
  /** Original number of keys minus in-use primary values. @returns Count. */
  unusedCount(): number {
    return H.uhash_count(this.table()) - this.fNumValuesInUse;
  }
  /** Original cumulative signed64 automatic eviction count. @returns Count. */
  autoEvictedCount(): bigint {
    return this.fAutoEvictedCount;
  }
  /** Original count includes aliases, failures and in-progress placeholders. @returns Count. */
  keyCount(): number {
    return H.uhash_count(this.table());
  }
  /** Original repeated flush accounts for values owning other cached values. @returns Nothing. */
  flush(): void {
    while (this._flush(false)) {
      /* Original fixed-point loop. */
    }
  }
  /** Original zero-client-reference callback and eviction slice. @returns Nothing. */
  handleUnreferencedObject(): void {
    --this.fNumValuesInUse;
    this._runEvictionSlice();
  }
  /** Original destructor first flushes, then detaches remaining externally retained values. @returns Nothing. */
  dispose(): void {
    this.flush();
    this._flush(true);
    H.uhash_close(this.fHashtable);
    this.fHashtable = null;
    this.fNoValue?.dispose();
    this.fNoValue = null;
  }
  /** Original slot iterator wraps at end of table. @returns Actual element/null. */
  private _nextElement(): H.UHashElement<CacheKeyBase, SharedObject> | null {
    const e = H.uhash_nextElement(this.table(), this.fEvictPos);
    if (e !== null) return e;
    this.fEvictPos[0] = -1;
    return H.uhash_nextElement(this.table(), this.fEvictPos);
  }
  /** Original bounded table pass; removed values can release other cached values. @param all - Destructor-only force. @returns Whether any key was removed. */
  private _flush(all: boolean): boolean {
    let result = false;
    const size = H.uhash_count(this.table());
    for (let i = 0; i < size; ++i) {
      const e = this._nextElement();
      if (e === null) break;
      if (all || this._isEvictable(e)) {
        const value = e.value as SharedObject;
        H.uhash_removeElement(this.table(), e);
        this.removeSoftRef(value);
        result = true;
      }
    }
    return result;
  }
  /** Original source limit arithmetic, including signed32 multiply and integer division. @returns Number to evict. */
  private _computeCountOfItemsToEvict(): number {
    const evictable = H.uhash_count(this.table()) - this.fNumValuesInUse;
    const percentage = Math.trunc(
      Math.imul(this.fNumValuesInUse, this.fMaxPercentageOfInUse) / 100,
    );
    return Math.max(0, evictable - Math.max(percentage, this.fMaxUnused));
  }
  /** Original at-most-ten-slot eviction slice. @returns Nothing. */
  private _runEvictionSlice(): void {
    let remaining = this._computeCountOfItemsToEvict();
    if (remaining <= 0) return;
    for (let i = 0; i < 10; ++i) {
      const e = this._nextElement();
      if (e === null) break;
      if (this._isEvictable(e)) {
        const value = e.value as SharedObject;
        H.uhash_removeElement(this.table(), e);
        this.removeSoftRef(value);
        ++this.fAutoEvictedCount;
        if (--remaining === 0) break;
      }
    }
  }
  /** Original copied-key insertion, primary registration precedes table adoption. @param key - Borrowed key. @param value - Retained value. @param creationStatus - Stored status. @param status - Insertion status. @returns Nothing. */
  private _putNew(
    key: CacheKeyBase,
    value: SharedObject,
    creationStatus: number,
    status: [number],
  ): void {
    if (U_FAILURE(status[0])) return;
    const adopted = key.clone();
    if (adopted === null) {
      status[0] = UErrorCode.U_MEMORY_ALLOCATION_ERROR;
      return;
    }
    adopted["fCreationStatus"] = creationStatus;
    if (value["softRefCount"] === 0) this._registerPrimary(adopted, value);
    H.uhash_put(this.table(), adopted, value, status);
    if (U_SUCCESS(status[0])) ++value["softRefCount"];
  }
  /** Original publication accepts a concurrently published winner and runs eviction. @param key - Key. @param value - Creation result. @param status - Creation status. @returns Nothing. */
  private _putIfAbsentAndGet(
    key: CacheKeyBase,
    value: [SharedObject | null],
    status: [number],
  ): void {
    const e = H.uhash_find(this.table(), key);
    if (e !== null && !this._inProgress(e)) {
      this._fetch(e, value, status);
      return;
    }
    if (e === null) this._putNew(key, value[0] as SharedObject, status[0], [0]);
    else this._put(e, value[0] as SharedObject, status[0]);
    this._runEvictionSlice();
  }
  /** Original placeholder poll. Native waiting has no asynchronous producer inside a synchronous realm. @param key - Key. @param value - Null input and retained output. @param status - Zero input. @returns Cache hit. */
  private _poll(key: CacheKeyBase, value: [SharedObject | null], status: [number]): boolean {
    let e = H.uhash_find(this.table(), key);
    while (e !== null && this._inProgress(e)) e = H.uhash_find(this.table(), key);
    if (e !== null) {
      this._fetch(e, value, status);
      return true;
    }
    this._putNew(key, this.fNoValue as SharedObject, 0, status);
    return false;
  }
  /** Original create-on-miss path stores failure statuses with the shared placeholder. @param key - Key. @param value - Retained output. @param context - Opaque creation context. @param status - Creation status. @returns Nothing. */
  private _get(
    key: CacheKeyBase,
    value: [SharedObject | null],
    context: unknown,
    status: [number],
  ): void {
    if (this._poll(key, value, status)) {
      if (value[0] === this.fNoValue) SharedObject.clearPtr(value);
      return;
    }
    if (U_FAILURE(status[0])) return;
    value[0] = key.createObject(context, status);
    if (value[0] === null) SharedObject.copyPtr(this.fNoValue, value);
    this._putIfAbsentAndGet(key, value, status);
    if (value[0] === this.fNoValue) SharedObject.clearPtr(value);
  }
  /** Original primary-value registration. @param key - First key for value. @param value - Value. @returns Nothing. */
  private _registerPrimary(key: CacheKeyBase, value: SharedObject): void {
    key["fIsPrimary"] = true;
    value["cachePtr"] = this;
    ++this.fNumValuesTotal;
    ++this.fNumValuesInUse;
  }
  /** Original placeholder replacement updates the existing entry in place. @param e - Placeholder entry. @param value - Value. @param status - Stored status. @returns Nothing. */
  private _put(
    e: H.UHashElement<CacheKeyBase, SharedObject>,
    value: SharedObject,
    status: number,
  ): void {
    const key = e.key as CacheKeyBase,
      old = e.value as SharedObject;
    key["fCreationStatus"] = status;
    if (value["softRefCount"] === 0) this._registerPrimary(key, value);
    ++value["softRefCount"];
    e.value = value;
    this.removeSoftRef(old);
  }
  /** Original fetch uses cache-internal hard-reference accounting. @param e - Entry. @param value - Retained output. @param status - Stored status output. @returns Nothing. */
  private _fetch(
    e: H.UHashElement<CacheKeyBase, SharedObject>,
    value: [SharedObject | null],
    status: [number],
  ): void {
    status[0] = (e.key as CacheKeyBase)["fCreationStatus"];
    this.removeHardRef(value[0]);
    value[0] = e.value;
    this.addHardRef(value[0]);
  }
  /** Original in-progress predicate fetches and releases a temporary hard reference. @param e - Entry. @returns Whether value is being created. */
  private _inProgress(e: H.UHashElement<CacheKeyBase, SharedObject>): boolean {
    const status: [number] = [0],
      value: [SharedObject | null] = [null];
    this._fetch(e, value, status);
    const result = value[0] === this.fNoValue && status[0] === 0;
    this.removeHardRef(value[0]);
    return result;
  }
  /** Original eviction keeps primary values with aliases until only their primary key remains. @param e - Entry. @returns Whether removable. */
  private _isEvictable(e: H.UHashElement<CacheKeyBase, SharedObject>): boolean {
    const key = e.key as CacheKeyBase,
      value = e.value as SharedObject;
    if (value === this.fNoValue && key["fCreationStatus"] === 0) return false;
    return !key["fIsPrimary"] || (value["softRefCount"] === 1 && value.noHardReferences());
  }
  /** Original final soft release deletes unused values or detaches externally held values. @param value - Cached value. @returns Nothing. */
  private removeSoftRef(value: SharedObject): void {
    if (--value["softRefCount"] === 0) {
      --this.fNumValuesTotal;
      if (value.noHardReferences()) value.dispose();
      else value["cachePtr"] = null;
    }
  }
  /** Original cache-internal client decrement. @param value - Value/null. @returns Updated count or zero. */
  private removeHardRef(value: SharedObject | null): number {
    if (value === null) return 0;
    const count = --value["hardRefCount"];
    if (count === 0) --this.fNumValuesInUse;
    return count;
  }
  /** Original cache-internal client increment. @param value - Value/null. @returns Updated count or zero. */
  private addHardRef(value: SharedObject | null): number {
    if (value === null) return 0;
    const count = ++value["hardRefCount"];
    if (count === 1) ++this.fNumValuesInUse;
    return count;
  }
}
