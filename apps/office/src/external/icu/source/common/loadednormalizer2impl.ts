/** @fileoverview Original ICU Nrm2 data loading, NFKC singleton and common cleanup. */
import { registerNfkcCommonData } from "../data/in/icudt78l.nfkc";
import { ComposeNormalizer2 } from "./norm2allmodes";
import { Normalizer2Impl, Normalizer2Index as IX } from "./normalizer2impl";
import { ECleanupCommonType as C, ucln_common_registerCleanup } from "./ucln_cmn.h";
import type { UDataMemory } from "./udatamem.h";
import { UInitOnce, umtx_initOnce } from "./umutex.h";
import { UCPTrieType, UCPTrieValueWidth, ucptrie_openFromBinary } from "./unicode/ucptrie";
import { type UDataInfo, udata_close, udata_getMemory, udata_openChoice } from "./unicode/udata";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";

/** Original Nrm2 version-5 admission. @param _context - Unused context. @param _type - Unused data type. @param _name - Unused member name. @param info - Original header. @returns Whether the binary format is accepted. */
function isAcceptable(
  _context: unknown,
  _type: string | null,
  _name: string,
  info: UDataInfo,
): boolean {
  return (
    info.size >= 20 &&
    info.isBigEndian === 0 &&
    info.charsetFamily === 0 &&
    info.dataFormat[0] === 0x4e &&
    info.dataFormat[1] === 0x72 &&
    info.dataFormat[2] === 0x6d &&
    info.dataFormat[3] === 0x32 &&
    info.formatVersion[0] === 5
  );
}

/** Original adopted data handle and composition instance, owned together. */
interface LoadedNormalizer2 {
  memory: UDataMemory;
  comp: ComposeNormalizer2;
}

/** Opens the native file and borrows the same trie and normalization tables. @param packageName - ICU package or default null. @param name - ICU data member. @param status - Sticky source status. @returns Original composition mode and its memory owner. */
function load(
  packageName: string | null,
  name: string,
  status: [number],
): LoadedNormalizer2 | null {
  if (U_FAILURE(status[0])) return null;
  const memory = udata_openChoice(packageName, "nrm", name, isAcceptable, null, status);
  if (memory === null || U_FAILURE(status[0])) return null;
  const bytes = udata_getMemory(memory) as Uint8Array;
  const indexesLength = new Int32Array(bytes.buffer, bytes.byteOffset, 1)[0] as number;
  if (indexesLength / 4 <= IX.IX_MIN_LCCC_CP) {
    status[0] = E.U_INVALID_FORMAT_ERROR;
    udata_close(memory);
    return null;
  }
  const indexes = new Int32Array(bytes.buffer, bytes.byteOffset, indexesLength / 4);
  const trieOffset = indexes[IX.IX_NORM_TRIE_OFFSET] as number;
  const extraOffset = indexes[IX.IX_EXTRA_DATA_OFFSET] as number;
  const smallFCDOffset = indexes[IX.IX_SMALL_FCD_OFFSET] as number;
  const trie = ucptrie_openFromBinary(
    UCPTrieType.UCPTRIE_TYPE_FAST,
    UCPTrieValueWidth.UCPTRIE_VALUE_BITS_16,
    bytes.subarray(trieOffset, extraOffset),
    extraOffset - trieOffset,
    null,
    status,
  );
  if (trie === null || U_FAILURE(status[0])) {
    udata_close(memory);
    return null;
  }
  const extra = new Uint16Array(
    bytes.buffer,
    bytes.byteOffset + extraOffset,
    (smallFCDOffset - extraOffset) / 2,
  );
  return { memory, comp: new ComposeNormalizer2(new Normalizer2Impl(indexes, trie, extra)) };
}

let nfkcSingleton: LoadedNormalizer2 | null = null;
const nfkcInitOnce = new UInitOnce();

/** Releases the opened file and resets the original one-time initialization record. @returns True. */
function uprv_loaded_normalizer2_cleanup(): boolean {
  if (nfkcSingleton !== null) udata_close(nfkcSingleton.memory);
  nfkcSingleton = null;
  nfkcInitOnce.reset();
  return true;
}

/** Original NFKC initialization branch, using the linked common-data package. @param status - Sticky source status. @returns Nothing. */
function initSingletons(status: [number]): void {
  registerNfkcCommonData(status);
  nfkcSingleton = load(null, "nfkc", status);
  ucln_common_registerCleanup(C.UCLN_COMMON_LOADED_NORMALIZER2, uprv_loaded_normalizer2_cleanup);
}

/** Original Normalizer2::getNFKCInstance composition-mode selection. @param status - Sticky source status. @returns Borrowed original singleton or null. */
export function getNFKCInstance(status: [number]): ComposeNormalizer2 | null {
  if (U_FAILURE(status[0])) return null;
  umtx_initOnce(nfkcInitOnce, initSingletons, status);
  return nfkcSingleton?.comp ?? null;
}
