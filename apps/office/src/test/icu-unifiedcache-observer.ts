/** @fileoverview Concrete native cache test-client protocol on actual SharedObject/CacheKey/UnifiedCache owners; no cache method or allocator is replaced. */
import { SharedObject } from "../external/icu/source/common/sharedobject";
import {
  UnifiedCache,
  CacheKey,
  type CacheKeyBase,
  type CacheValueType,
} from "../external/icu/source/common/unifiedcache";
import { UErrorCode } from "../external/icu/source/common/unicode/utypes";
/** Creates a fresh real cache/client graph for replay of one native operation sequence. @returns Stateful caller and final release. */
export function createCacheObserver(): { step(query: string): string; dispose(): void } {
  let created = 0;
  const destroyed: number[] = [];
  /** Native witness's concrete application value, with observable real release order. */
  class Value extends SharedObject {
    readonly serial = ++created;
    /** Adopts the original optional dependent hard reference. @param id - Application key. @param dependency - Actual retained value. @returns Value. */
    constructor(
      readonly id: number,
      readonly dependency: Value | null,
    ) {
      super();
    }
    /** Original concrete destructor callback records actual ownership release. @returns Nothing. */
    override dispose(): void {
      destroyed.push(this.serial);
      this.dependency?.removeRef();
    }
  }
  // Plain CacheKey needs only original template identity; the concrete Key implements its real virtual factory below.
  // CacheValueType's additional locale-specialization hook is unused by this native-derived key.
  const identity: Pick<CacheValueType<Value>, "name" | "identity"> = {
    name: "Value",
    identity: Value,
  };
  /** Same concrete CacheKey<Value> specialization as the independently compiled caller. */
  class Key extends CacheKey<Value> {
    readonly id: number;
    /** Initializes an application ID or original key copy. @param value - ID/source. @returns Key. */
    constructor(value: number | Key) {
      super(identity as CacheValueType<Value>, value instanceof Key ? value : null);
      this.id = value instanceof Key ? value.id : value;
    }
    /** Original caller deliberately creates collisions. @returns Hash. */
    override hashCode(): number {
      return this.id % 29;
    }
    /** Actual concrete key identity. @param other - Source key. @returns Equality. */
    override equals(other: CacheKeyBase): boolean {
      return other instanceof Key && this.id === other.id;
    }
    /** Native polymorphic key copy. @returns Key. */
    clone(): Key {
      return new Key(this);
    }
    /** Actual application value factory supplies the source-prescribed owned hard reference. @param context - Actual cache passed by the caller. @param status - Original creation status. @returns Owned value/null. */
    createObject(context: unknown, status: [number]): Value | null {
      if (status[0] > 0) return null;
      if (this.id < 0) {
        status[0] = UErrorCode.U_RESOURCE_TYPE_MISMATCH;
        return null;
      }
      if (this.id >= 1000) {
        const value: [Value | null] = [null];
        (context as UnifiedCache).get(new Key(this.id % 1000), value, status, context);
        return value[0];
      }
      const value = new Value(this.id, null);
      value.addRef();
      if (this.id % 7 === 3) status[0] = UErrorCode.U_USING_FALLBACK_WARNING;
      return value;
    }
  }
  const cache = new UnifiedCache([0]),
    pointers: [Value | null][] = Array.from(
      { length: 7 },
      /** Creates an original retained output slot. @returns Slot. */ () => [null],
    );
  return {
    /** Executes one source caller operation and observes complete retained-reference/destructor state. @param query - Native input row. @returns Observed output row. */
    step(query: string): string {
      const [op, ...parts] = query.split(" "),
        [a, b, c] = parts.map(Number),
        status: [number] = [0];
      if (op === "G") {
        status[0] = c as number;
        cache.get(new Key(a as number), pointers[b as number] as [Value | null], status, cache);
      } else if (op === "C") SharedObject.clearPtr(pointers[a as number] as [Value | null]);
      else if (op === "P") {
        status[0] = c as number;
        cache.setEvictionPolicy(a as number, b as number, status);
      } else cache.flush();
      return [
        status[0],
        cache.keyCount(),
        cache.unusedCount(),
        cache.autoEvictedCount().toString(),
        created,
        ...pointers.flatMap(
          /** Observes actual values and hard references, including alias keys. @param pointer - Owned slot. @returns Scalars. */ (
            pointer,
          ) => [pointer[0]?.serial ?? 0, pointer[0]?.id ?? 0, pointer[0]?.getRefCount() ?? 0],
        ),
        destroyed.length,
        ...destroyed,
      ].join(" ");
    },
    /** Completes the original caller's release sequence, then destroys the actual cache. @returns Nothing. */
    dispose(): void {
      for (const pointer of pointers) SharedObject.clearPtr(pointer);
      cache.flush();
      cache.dispose();
    },
  };
}
