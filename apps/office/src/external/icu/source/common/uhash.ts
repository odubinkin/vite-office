/** @fileoverview Original ICU78.3 pointer-key/value UHashtable operations consumed by UnifiedCache. Native prime capacities, double hashing, tombstones, reverse rehash and slot-order iteration are retained; allocation/union ABI is projected to owned JS objects. */
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
/** Original pointer-token entry storage. */
export interface UHashElement<K, V> {
  key: K | null;
  value: V | null;
  hashcode: number;
}
/** Original pointer specialization of the UHashtable struct. */
export interface UHashtable<K, V> {
  elements: UHashElement<K, V>[];
  primeIndex: number;
  length: number;
  count: number;
  highWaterMark: number;
  keyHasher: (key: K) => number;
  keyComparator: (left: K, right: K) => boolean;
  keyDeleter: ((key: K) => void) | null;
  valueDeleter: ((value: V) => void) | null;
}
const PRIMES = [
  7, 13, 31, 61, 127, 251, 509, 1021, 2039, 4093, 8191, 16381, 32749, 65521, 131071, 262139, 524287,
  1048573, 2097143, 4194301, 8388593, 16777213, 33554393, 67108859, 134217689, 268435399, 536870909,
  1073741789, 2147483647,
];
const HASH_DELETED = -2147483648,
  HASH_EMPTY = -2147483647;
/** Original uhash allocation with default U_GROW policy. @param hash - Actual table. @param index - Prime index. @returns Nothing. */
function allocate<K, V>(hash: UHashtable<K, V>, index: number): void {
  hash.primeIndex = index;
  hash.length = PRIMES[index] as number;
  hash.elements = Array.from(
    { length: hash.length },
    /** Initializes native empty entry. @returns Entry. */ () => ({
      key: null,
      value: null,
      hashcode: HASH_EMPTY,
    }),
  );
  hash.count = 0;
  hash.highWaterMark = Math.trunc(hash.length * 0.5);
}
/** Original double-hash lookup also locates the first reusable tombstone. @param hash - Table. @param key - Pointer key. @param code - Native hash. @returns Actual entry. */
function find<K, V>(hash: UHashtable<K, V>, key: K, code: number): UHashElement<K, V> {
  code &= 0x7fffffff;
  const start = (code ^ 0x4000000) % hash.length;
  let index = start,
    jump = 0,
    firstDeleted = -1;
  let entry: UHashElement<K, V>;
  do {
    entry = hash.elements[index] as UHashElement<K, V>;
    if (entry.hashcode === code) {
      if (hash.keyComparator(key, entry.key as K)) return entry;
    } else if (entry.hashcode < 0) {
      if (entry.hashcode === HASH_EMPTY) break;
      if (firstDeleted < 0) firstDeleted = index;
    }
    if (jump === 0) jump = (code % (hash.length - 1)) + 1;
    index = (index + jump) % hash.length;
  } while (index !== start);
  return hash.elements[firstDeleted >= 0 ? firstDeleted : index] as UHashElement<K, V>;
}
/** Original growth and reverse old-slot reinsertion. @param hash - Table. @returns Nothing. */
function rehash<K, V>(hash: UHashtable<K, V>): void {
  if (hash.count <= hash.highWaterMark || hash.primeIndex + 1 >= PRIMES.length) return;
  const old = hash.elements;
  allocate(hash, hash.primeIndex + 1);
  for (let i = old.length - 1; i >= 0; --i) {
    const source = old[i] as UHashElement<K, V>;
    if (source.hashcode < 0) continue;
    Object.assign(find(hash, source.key as K, source.hashcode), source);
    ++hash.count;
  }
}
/** Original pointer-key/value setter and deletion ordering. @param hash - Table. @param entry - Entry. @param code - New hash. @param key - Adopted key/null. @param value - Adopted value/null. @returns Old unowned value. */
function setElement<K, V>(
  hash: UHashtable<K, V>,
  entry: UHashElement<K, V>,
  code: number,
  key: K | null,
  value: V | null,
): V | null {
  let old = entry.value;
  if (hash.keyDeleter !== null && entry.key !== null && entry.key !== key)
    hash.keyDeleter(entry.key);
  if (hash.valueDeleter !== null) {
    if (old !== null && old !== value) hash.valueDeleter(old);
    old = null;
  }
  entry.key = key;
  entry.value = value;
  entry.hashcode = code;
  return old;
}
/** Original default pointer table open. @param keyHasher - Hash callback. @param keyComparator - Equality. @param _valueComparator - Not consumed by these APIs. @param status - Sticky status. @returns Table/null. */
export function uhash_open<K, V>(
  keyHasher: (key: K) => number,
  keyComparator: (a: K, b: K) => boolean,
  _valueComparator: null,
  status: [number],
): UHashtable<K, V> | null {
  if (U_FAILURE(status[0])) return null;
  const hash: UHashtable<K, V> = {
    elements: [],
    primeIndex: 4,
    length: 0,
    count: 0,
    highWaterMark: 0,
    keyHasher,
    keyComparator,
    keyDeleter: null,
    valueDeleter: null,
  };
  allocate(hash, 4);
  return hash;
}
/** Original adopted key deleter setter returns the previous callback. @param hash - Table. @param deleter - New callback. @returns Old callback. */
export function uhash_setKeyDeleter<K, V>(
  hash: UHashtable<K, V>,
  deleter: ((key: K) => void) | null,
): ((key: K) => void) | null {
  const old = hash.keyDeleter;
  hash.keyDeleter = deleter;
  return old;
}
/** Original pointer-key lookup. @param hash - Table. @param key - Pointer key. @returns Actual entry/null. */
export function uhash_find<K, V>(hash: UHashtable<K, V>, key: K): UHashElement<K, V> | null {
  const entry = find(hash, key, hash.keyHasher(key));
  return entry.hashcode < 0 ? null : entry;
}
/** Original pointer insertion, including null-as-removal and failure-time adoption. @param hash - Table. @param key - Adopted pointer key. @param value - Adopted value/null. @param status - Sticky status. @returns Replaced value/null. */
export function uhash_put<K, V>(
  hash: UHashtable<K, V>,
  key: K,
  value: V | null,
  status: [number],
): V | null {
  if (!U_FAILURE(status[0])) {
    if (value === null) {
      const e = uhash_find(hash, key);
      return e === null ? null : uhash_removeElement(hash, e);
    }
    rehash(hash);
    const code = hash.keyHasher(key),
      entry = find(hash, key, code);
    if (entry.hashcode < 0 && ++hash.count === hash.length) {
      --hash.count;
      status[0] = UErrorCode.U_MEMORY_ALLOCATION_ERROR;
    } else return setElement(hash, entry, code & 0x7fffffff, key, value);
  }
  if (hash.keyDeleter !== null) hash.keyDeleter(key);
  if (hash.valueDeleter !== null && value !== null) hash.valueDeleter(value);
  return null;
}
/** Original entry removal deliberately does not shrink the table. @param hash - Table. @param entry - Actual entry. @returns Unowned value/null. */
export function uhash_removeElement<K, V>(
  hash: UHashtable<K, V>,
  entry: UHashElement<K, V>,
): V | null {
  if (entry.hashcode < 0) return null;
  --hash.count;
  return setElement(hash, entry, HASH_DELETED, null, null);
}
/** Original slot-order iterator leaves the cursor unchanged at end. @param hash - Table. @param pos - Mutable native cursor. @returns Next actual entry/null. */
export function uhash_nextElement<K, V>(
  hash: UHashtable<K, V>,
  pos: [number],
): UHashElement<K, V> | null {
  for (let i = pos[0] + 1; i < hash.length; ++i)
    if ((hash.elements[i] as UHashElement<K, V>).hashcode >= 0) {
      pos[0] = i;
      return hash.elements[i] as UHashElement<K, V>;
    }
  return null;
}
/** Original key count. @param hash - Table. @returns Count. */
export function uhash_count<K, V>(hash: UHashtable<K, V>): number {
  return hash.count;
}
/** Original sized open chooses the smallest native prime not below size. @param keyHasher - Hash callback. @param keyComparator - Equality. @param valueComparator - Unconsumed comparator. @param size - Capacity hint. @param status - Sticky status. @returns Table/null. */
export function uhash_openSize<K, V>(
  keyHasher: (key: K) => number,
  keyComparator: (a: K, b: K) => boolean,
  valueComparator: null,
  size: number,
  status: [number],
): UHashtable<K, V> | null {
  const hash = uhash_open<K, V>(keyHasher, keyComparator, valueComparator, status);
  if (hash === null) return null;
  let i = 0;
  while (i < PRIMES.length - 1 && (PRIMES[i] as number) < size) ++i;
  allocate(hash, i);
  return hash;
}
/** Original integer-key/value lookup returns zero for an absent entry. @param hash - Actual integer table. @param key - Signed32 key. @returns Signed32 value. */
export function uhash_igeti(hash: UHashtable<number, number>, key: number): number {
  return uhash_find(hash, key | 0)?.value ?? 0;
}
/** Original integer-key/value insertion treats zero as removal. @param hash - Actual integer table. @param key - Signed32 key. @param value - Signed32 value. @param status - Sticky status. @returns Prior value/zero. */
export function uhash_iputi(
  hash: UHashtable<number, number>,
  key: number,
  value: number,
  status: [number],
): number {
  return uhash_put(hash, key | 0, (value | 0) === 0 ? null : value | 0, status) ?? 0;
}
/** Original close destroys adopted keys/values in slot order. @param hash - Table/null. @returns Nothing. */
export function uhash_close<K, V>(hash: UHashtable<K, V> | null): void {
  if (hash === null) return;
  for (const e of hash.elements)
    if (e.hashcode >= 0) {
      if (hash.keyDeleter !== null && e.key !== null) hash.keyDeleter(e.key);
      if (hash.valueDeleter !== null && e.value !== null) hash.valueDeleter(e.value);
    }
  hash.elements = [];
}
