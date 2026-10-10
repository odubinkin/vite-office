/** @fileoverview Original RTL string intern hash table with complete native probing, growth and reinsertion. */
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";
import { SAL_STRING_INTERN_FLAG, SAL_STRING_IS_STATIC } from "./strimp.hxx";
import {
  rtl_uString_acquire,
  rtl_uString_newFromString,
  rtl_ustr_hashCode_WithLength,
  rtl_ustr_compare_WithLength,
} from "./ustring";

/** Original anonymous implementation structure, with nullable allocated slot storage. */
export interface StringHashTableImpl {
  /** Original unsigned32 live entry count. */
  nEntries: number;
  /** Original unsigned32 allocated table size. */
  nSize: number;
  /** Original calloc slot buffer, nullable after the temporary resize owner's storage is transferred. */
  pData: (rtl_uString | null)[] | null;
}
/** Original implementation typedef. */
export type StringHashTable = StringHashTableImpl;
let pInternPool: StringHashTable | null = null;
/** Original lazy static pool, isolated to this synchronous browser realm. @returns Original live table identity. */
export function getHashTable(): StringHashTable {
  if (pInternPool === null) pInternPool = rtl_str_hash_new(1024);
  return pInternPool;
}
/** Original strictly-greater Sedgewick prime selection and unsigned32 fallback. @param nSize - Original unsigned32 request. @returns Original next size. */
export function getNextSize(nSize: number): number {
  nSize >>>= 0;
  const nPrimes = [
    1021, 2039, 4093, 8191, 16381, 32749, 65521, 131071, 262139, 524287, 1048573, 2097143, 4194301,
    8388593, 16777213, 33554393, 67108859, 134217689,
  ];
  for (const nPrime of nPrimes) if (nPrime > nSize) return nPrime;
  return (nSize * 2) >>> 0;
}
/** Original table hash conversion. @param pString - Initialized data. @returns Original unsigned32 hash. */
export function hashString(pString: rtl_uString): number {
  return rtl_ustr_hashCode_WithLength(pString.buffer, pString.length) >>> 0;
}
/** Original table allocation specialized to browser-owned zeroed slots. @param nSize - Original requested size. @returns Concrete table. */
export function rtl_str_hash_new(nSize: number): StringHashTable {
  const pHash: StringHashTable = { nEntries: 0, nSize: getNextSize(nSize), pData: null };
  pHash.pData = Array<rtl_uString | null>(pHash.nSize).fill(null);
  return pHash;
}
/** Original private table deallocation with browser-owned storage release. @param pHash - Temporary table or null. @returns Nothing. */
export function rtl_str_hash_free(pHash: StringHashTable | null): void {
  if (pHash === null) return;
  if (pHash.pData !== null) pHash.pData = null;
}
/** Original insertion of a known unequal entry, including wrap-around probing. @param pHash - Allocated table. @param pString - Concrete entry. @returns Nothing. */
export function rtl_str_hash_insert_nonequal(pHash: StringHashTable, pString: rtl_uString): void {
  const data = pHash.pData as (rtl_uString | null)[];
  let n = hashString(pString) % pHash.nSize;
  while (data[n]) {
    n++;
    if (n >= pHash.nSize) n = 0;
  }
  data[n] = pString;
}
/** Original resize preserves the pool identity and transfers the temporary table fields. @param nNewSize - Original unsigned32 request. @returns Nothing. */
export function rtl_str_hash_resize(nNewSize: number): void {
  const pHash = getHashTable(),
    pNewHash = rtl_str_hash_new(nNewSize);
  // The only original caller supplies getNextSize(nSize), necessarily larger than nEntries for reachable bounded tables.
  for (let i = 0; i < pHash.nSize; i++) {
    const data = (pHash.pData as (rtl_uString | null)[])[i];
    if (data) rtl_str_hash_insert_nonequal(pNewHash, data);
  }
  pNewHash.nEntries = pHash.nEntries;
  pHash.pData = pNewHash.pData;
  pHash.nSize = pNewHash.nSize;
  pHash.nEntries = pNewHash.nEntries;
  pNewHash.pData = null;
  rtl_str_hash_free(pNewHash);
}
/** Original equality helper uses the original forward C comparator. @param pStringA - First live data. @param pStringB - Second live data. @returns Original equality. */
export function compareEqual(pStringA: rtl_uString, pStringB: rtl_uString): boolean {
  if (pStringA === pStringB) return true;
  if (pStringA.length !== pStringB.length) return false;
  return !rtl_ustr_compare_WithLength(
    pStringA.buffer,
    pStringA.length,
    pStringB.buffer,
    pStringB.length,
  );
}
/** Original non-thread-safe intern helper called inside the native mutex boundary. @param pString - Initialized candidate. @param can_return - Original lifecycle selector. @returns Existing or newly inserted concrete data. */
export function rtl_str_hash_intern(pString: rtl_uString, can_return: number): rtl_uString | null {
  const nHash = hashString(pString),
    pHash = getHashTable();
  if (pHash.nEntries >= Math.floor(pHash.nSize / 2)) rtl_str_hash_resize(getNextSize(pHash.nSize));
  const data = pHash.pData as (rtl_uString | null)[];
  let n = nHash % pHash.nSize;
  while (data[n]) {
    const pHashStr = data[n] as rtl_uString;
    if (compareEqual(pHashStr, pString)) {
      rtl_uString_acquire(pHashStr);
      return pHashStr;
    }
    n++;
    if (n >= pHash.nSize) n = 0;
  }
  if (!can_return) {
    const pCopy: rtl_uStringSlot = [null];
    rtl_uString_newFromString(pCopy, pString);
    pString = pCopy[0] as rtl_uString;
  }
  // The original null-copy return is unreachable with active original constructor assertions: allocation failure throws before returning and empty construction binds the non-null static empty.
  if (!SAL_STRING_IS_STATIC(pString)) pString.refCount = pString.refCount | SAL_STRING_INTERN_FLAG;
  data[n] = pString;
  pHash.nEntries++;
  return pString;
}
/** Original remove including nonfatal OSL diagnostic and complete following-chain reinsertion. @param pString - Initialized candidate. @returns Nothing. */
export function rtl_str_hash_remove(pString: rtl_uString): void {
  const pHash = getHashTable(),
    data = pHash.pData as (rtl_uString | null)[];
  let n = hashString(pString) % pHash.nSize;
  while (data[n]) {
    if (compareEqual(data[n] as rtl_uString, pString)) break;
    n++;
    if (n >= pHash.nSize) n = 0;
  }
  if (!data[n]) {
    console.warn("OSL_ASSERT: pHash->pData[n]");
    return;
  }
  data[n++] = null;
  pHash.nEntries--;
  if (n >= pHash.nSize) n = 0;
  while (data[n]) {
    const pHashStr = data[n] as rtl_uString;
    data[n] = null;
    rtl_str_hash_insert_nonequal(pHash, pHashStr);
    n++;
    if (n >= pHash.nSize) n = 0;
  }
}
