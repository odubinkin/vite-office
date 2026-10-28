/** @fileoverview Native compiled application clients exercise the original abstract-key extension API and real SharedObject/cache ownership without replacing library methods or production factories. */
import { expect, it } from "vitest";
import observation from "./cache-sdk-constructors.native-observations.json";
import {
  CacheKeyBase,
  CacheKey,
  LocaleCacheKey,
  UnifiedCache,
  type CacheValueType,
} from "./unifiedcache";
import { SharedObject } from "./sharedobject";
import { Locale } from "./locid";
import { uhash_nextElement } from "./uhash";
import { createInstance } from "../i18n/calendar.factory";
import { SimpleTimeZone } from "../i18n/simpletz";
import { UnicodeString } from "./unistr";

it("matches original default/copy construction and ownership for concrete SDK application clients", /** Abstract native interfaces require concrete callers. These are the same functional application clients compiled by the witness, including original owned-reference callback contracts. No core state is manufactured. @returns Nothing. */ () => {
  /** Native caller's actual application value, containing only its own data. */
  class AppValue extends SharedObject {
    /** Initializes actual caller data after the original SharedObject constructor. @param id - Application value. @returns Owner. */
    constructor(readonly id: number) {
      super();
    }
  }
  /** Implements the native caller's real owned-value creation contract. @param id - Application value. @param status - Incoming status. @returns Actual hard reference or null. */
  function ownedValue(id: number, status: [number]): AppValue | null {
    if (status[0] > 0) return null;
    const value = new AppValue(id);
    value.addRef();
    return value;
  }
  const descriptor: CacheValueType<AppValue> = {
    identity: AppValue,
    name: observation.valueTypeName,
    /** Same native LocaleCacheKey<AppValue> specialization as the compiled application caller. @param locale - Real copied locale. @param _context - Unused original context. @param status - Sticky status. @returns Actual owned application value. */
    createObject(locale, _context, status) {
      return ownedValue(locale.getName().length, status);
    },
  };
  /** Same native application's direct abstract-base key implementation. */
  class DirectKey extends CacheKeyBase {
    readonly id: number;
    /** Original default/copy base selection, with no private field writes. @param source - Caller ID or copied key. @returns Key. */
    constructor(source: number | DirectKey) {
      super(...(source instanceof DirectKey ? ([source] as const) : ([] as const)));
      this.id = source instanceof DirectKey ? source.id : source;
    }
    /** Original application hash. @returns ID. */ override hashCode(): number {
      return this.id;
    }
    /** Actual polymorphic key copy. @returns Copied key. */ override clone(): DirectKey {
      return new DirectKey(this);
    }
    /** Original application's key identity. @param other - Key. @returns Equality. */ override equals(
      other: CacheKeyBase,
    ): boolean {
      return other instanceof DirectKey && other.id === this.id;
    }
    /** Same actual application value factory as the compiled caller. @param _context - Unused context. @param status - Sticky status. @returns Owned application value. */ override createObject(
      _context: unknown,
      status: [number],
    ): AppValue | null {
      return ownedValue(this.id, status);
    }
    /** Native application's complete bounded diagnostic implementation. @param buffer - Caller bytes. @param capacity - Positive capacity. @returns Same buffer. */ override writeDescription(
      buffer: Uint8Array,
      capacity: number,
    ): Uint8Array {
      const text = new TextEncoder().encode("direct");
      buffer.fill(0, 0, capacity);
      buffer.set(text.subarray(0, capacity));
      buffer[capacity - 1] = 0;
      return buffer;
    }
  }
  /** Same concrete templated key as the compiled SDK caller. */
  class AppKey extends CacheKey<AppValue> {
    readonly id: number;
    /** Original default/copy template constructor selection. @param source - ID or copied key. @returns Key. */
    constructor(source: number | AppKey) {
      super(descriptor, ...(source instanceof AppKey ? ([source] as const) : ([] as const)));
      this.id = source instanceof AppKey ? source.id : source;
    }
    /** Original application hash. @returns ID. */ override hashCode(): number {
      return this.id;
    }
    /** Original polymorphic copy. @returns Copied key. */ override clone(): AppKey {
      return new AppKey(this);
    }
    /** Original caller identity. @param other - Key. @returns Equality. */ override equals(
      other: CacheKeyBase,
    ): boolean {
      return other instanceof AppKey && other.id === this.id;
    }
    /** Actual public extension callback returns a real original hard reference. @param _context - Unused context. @param status - Sticky status. @returns Owned value. */ override createObject(
      _context: unknown,
      status: [number],
    ): AppValue | null {
      return ownedValue(this.id, status);
    }
  }
  const status: [number] = [0],
    direct = new DirectKey(7),
    directCopy = direct.clone(),
    firstValue = direct.createObject(null, status);
  if (!firstValue) throw new Error("Missing actual caller value");
  const actual: number[] = [
    direct.hashCode(),
    directCopy.hashCode(),
    Number(directCopy.equals(direct)),
    firstValue.id,
    firstValue.getRefCount(),
  ];
  firstValue.removeRef();
  const key = new AppKey(11),
    keyCopy = key.clone(),
    secondValue = key.createObject(null, status);
  if (!secondValue) throw new Error("Missing actual templated caller value");
  actual.push(
    key.hashCode(),
    keyCopy.hashCode(),
    Number(keyCopy.equals(key)),
    secondValue.id,
    secondValue.getRefCount(),
  );
  secondValue.removeRef();
  const locale = new LocaleCacheKey(descriptor, new Locale("en_US")),
    localeCopy = locale.clone(),
    localeValue = locale.createObject(null, status);
  if (!localeValue) throw new Error("Missing actual locale-specialized value");
  const productionStatus: [number] = [0];
  if (
    !createInstance(
      new SimpleTimeZone(0, new UnicodeString("UTC")),
      new Locale("en_US"),
      productionStatus,
    )
  )
    throw new Error("Missing real Calendar provider");
  const productionCache = UnifiedCache.getInstance(productionStatus);
  if (!productionCache) throw new Error("Missing real factory cache");
  const position: [number] = [-1];
  let productionKey: CacheKeyBase | null = null;
  for (
    let entry = uhash_nextElement(productionCache["table"](), position);
    entry !== null;
    entry = uhash_nextElement(productionCache["table"](), position)
  ) {
    if (entry.key instanceof LocaleCacheKey && entry.key["fLoc"].getName() === "en_US") {
      productionKey = entry.key;
      break;
    }
  }
  if (!productionKey) throw new Error("Missing actual production type key");
  actual.push(
    locale.hashCode(),
    localeCopy.hashCode(),
    Number(localeCopy.equals(locale)),
    Number(locale.equals(productionKey)),
    Number(locale.equals(direct)),
    localeValue.id,
    localeValue.getRefCount(),
  );
  localeValue.removeRef();
  const cache = new UnifiedCache(status),
    first: [AppValue | null] = [null],
    second: [AppValue | null] = [null];
  try {
    cache.get(key, first, status, cache);
    cache.get(key, second, status, cache);
    if (!first[0]) throw new Error("Missing actual cached value");
    actual.push(
      status[0],
      Number(first[0] !== null),
      Number(first[0] === second[0]),
      first[0].id,
      first[0].getRefCount(),
      cache.keyCount(),
      cache.unusedCount(),
    );
    SharedObject.clearPtr(first);
    SharedObject.clearPtr(second);
    cache.flush();
    actual.push(cache.keyCount(), cache.unusedCount());
    expect(actual).toEqual(observation.snapshot);
  } finally {
    SharedObject.clearPtr(first);
    SharedObject.clearPtr(second);
    cache.dispose();
    directCopy.dispose();
    keyCopy.dispose();
    localeCopy.dispose();
  }
});
