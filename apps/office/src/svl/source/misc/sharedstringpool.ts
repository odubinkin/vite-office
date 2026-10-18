/** @fileoverview Original StringWithHash and SharedStringPool mapping/identity/two-pass purge from svl/source/misc/sharedstringpool.cxx; existing value ownership is reused under JS GC. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { SharedString } from "../../inc/sharedstring";
import type { CharClassUppercaseReference } from "../../../unotools/inc/charclass";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";

/** Original anonymous cached key struct, including the actual implicit memberwise value lifetime operations. */
export class StringWithHash {
  /** Original owned key string. */
  str: OUString;
  /** Original cached signed32 hash, computed after moving the by-value argument into str. */
  hashCode: number;
  /** Original by-value/copy construction; source-bound factories adapt rvalue special members. @param source - Const string argument or key copy source. @returns Original initialized key. */
  constructor(source: OUStringConstReference | StringWithHash) {
    if (source instanceof StringWithHash) {
      this.str = new OUString(source.str);
      this.hashCode = source.hashCode;
    } else {
      const parameter = new OUString(source);
      this.str = OUString.move(parameter);
      this.hashCode = this.str.hashCode();
      parameter.dispose();
    }
  }
  /** Original by-value construction from an rvalue OUString, followed by the original member move and parameter destruction. @param source - Rvalue string argument. @returns Initialized cached key. */
  static fromMovedString(source: OUString): StringWithHash {
    const parameter = OUString.move(source);
    const result = Object.create(StringWithHash.prototype) as StringWithHash;
    result.str = OUString.move(parameter);
    result.hashCode = result.str.hashCode();
    parameter.dispose();
    return result;
  }
  /** Original implicitly generated move construction moves str and copies its cached scalar. @param source - Original rvalue key. @returns Transferred key. */
  static move(source: StringWithHash): StringWithHash {
    const result = Object.create(StringWithHash.prototype) as StringWithHash;
    result.str = OUString.move(source.str);
    result.hashCode = source.hashCode;
    return result;
  }
  /** Original implicit destructor destroys the sole owned value member. @returns Nothing. */
  dispose(): void {
    this.str.dispose();
  }
  /** Original implicit copy assignment assigns str, then the cached scalar. @param source - Const source key. @returns This key. */
  assign(source: StringWithHash): this {
    this.str.assign(source.str);
    this.hashCode = source.hashCode;
    return this;
  }
  /** Original implicit move assignment uses OUString's pointer swap before copying the cache. @param source - Rvalue key. @returns This key. */
  moveAssign(source: StringWithHash): this {
    this.str.moveAssign(source.str);
    this.hashCode = source.hashCode;
    return this;
  }
  /** Original equality checks the cached hash before actual string equality. @param other - Const key. @returns Original cached-key equality. */
  equals(other: StringWithHash): boolean {
    if (this.hashCode !== other.hashCode) return false;
    return this.str.equals(other.str);
  }
}

/** Original std::hash<StringWithHash>::operator() on the verified64-bit target; does not recompute a mutable key's cache. @param key - Original key. @returns Unsigned64 size_t witness. */
export function hashStringWithHash(key: StringWithHash): bigint {
  return BigInt.asUintN(64, BigInt(key.hashCode));
}

/** Actual native map pair: the key and value own independent original string values. */
interface PoolEntry {
  readonly key: StringWithHash;
  readonly value: OUString;
}
/** Projects complete logical UTF16 into a native JS value-equality Map key, preserving nul and individual surrogate units. No native hash bucket or allocation mechanism is reproduced. @param value - Original key value. @returns Equal-value primitive key. */
function poolStringKey(value: OUStringConstReference): string {
  let result = "";
  const units = value.getStr();
  for (let i = 0; i < value.getLength(); i++) result += String.fromCharCode(units[i] as number);
  return result;
}
/** Original getRefCount masks the already existing SAL string state; this does not introduce a new lifetime counter or control JavaScript heap collection. @param value - Existing owned value. @returns Source logical count without flags. */
function getRefCount(value: OUString): number {
  return value.pData.refCount & 0x3fffffff;
}
/** Original shared string pool; one original->uppercase map also owns canonical uppercase keys. The borrowed classifier has its own actual locale state. JS run-to-completion replaces the native mutex for this non-shared object. */
export class SharedStringPool {
  private readonly mpImpl: {
    readonly maStrMap: Map<string, PoolEntry>;
    readonly mrCharClass: CharClassUppercaseReference;
  };
  /** Original noncopyable constructor initializes the borrowed classifier and interns the process empty value. Native debug assertion adds no public state. @param rCharClass - Borrowed actual uppercase operation. @returns Initialized pool. */
  constructor(rCharClass: CharClassUppercaseReference) {
    this.mpImpl = { maStrMap: new Map(), mrCharClass: rCharClass };
    this.intern(SharedString.EMPTY_STRING).dispose();
  }
  /** Original destructor releases the map's owned second/first values; external shared strings remain valid through their existing owners. JS GC owns the actual heap. @returns Nothing. */
  dispose(): void {
    for (const entry of this.mpImpl.maStrMap.values()) {
      entry.value.dispose();
      entry.key.dispose();
    }
    this.mpImpl.maStrMap.clear();
  }
  /** Original intern establishes original->uppercase and uppercase->uppercase mappings without replacing existing canonical key identities. Exceptions leave the initially inserted mapping as in the source. @param rStr - Const input. @returns Actual shared original/uppercase value. */
  intern(rStr: OUStringConstReference): SharedString {
    const aStrWithHash = new StringWithHash(rStr),
      map = this.mpImpl.maStrMap,
      key = poolStringKey(aStrWithHash.str);
    try {
      const found = map.get(key);
      if (found !== undefined) return new SharedString(found.key.str.pData, found.value.pData);
      const entry: PoolEntry = { key: new StringWithHash(aStrWithHash), value: new OUString(rStr) };
      map.set(key, entry);
      const aUpper = this.mpImpl.mrCharClass.uppercase(rStr);
      try {
        if (aUpper.equals(rStr)) return new SharedString(entry.key.str.pData, entry.value.pData);
        const aUpperWithHash = new StringWithHash(aUpper);
        try {
          const upperKey = poolStringKey(aUpperWithHash.str),
            upperEntry = map.get(upperKey);
          if (upperEntry !== undefined) {
            entry.value.assign(upperEntry.key.str);
            return new SharedString(entry.key.str.pData, entry.value.pData);
          }
          entry.value.assign(aUpper);
          map.set(upperKey, {
            key: new StringWithHash(aUpperWithHash),
            value: new OUString(aUpper),
          });
          return new SharedString(rStr.pData, aUpper.pData);
        } finally {
          aUpperWithHash.dispose();
        }
      } finally {
        aUpper.dispose();
      }
    } finally {
      aStrWithHash.dispose();
    }
  }
  /** Original two-pass purge first removes unused non-self mappings, then unused uppercase self mappings. It reuses existing SAL value state and drops Map-owned values only. @returns Nothing. */
  purge(): void {
    const map = this.mpImpl.maStrMap;
    for (const [key, entry] of map) {
      if (entry.key.str.pData !== entry.value.pData && getRefCount(entry.key.str) === 1) {
        map.delete(key);
        entry.value.dispose();
        entry.key.dispose();
      }
    }
    for (const [key, entry] of map) {
      if (entry.key.str.pData === entry.value.pData && getRefCount(entry.key.str) === 2) {
        map.delete(key);
        entry.value.dispose();
        entry.key.dispose();
      }
    }
  }
  /** Original unit-test count includes internal items. @returns Map size. */
  getCount(): number {
    return this.mpImpl.maStrMap.size;
  }
  /** Original unit-test distinct uppercase value count, using exact UTF16 equality. @returns Distinct map value count. */
  getCountIgnoreCase(): number {
    const values = new Set<string>();
    for (const entry of this.mpImpl.maStrMap.values()) values.add(poolStringKey(entry.value));
    return values.size;
  }
}
