/** @fileoverview Original ICU78.3 data-handle initialization, assignment, normalization, queries and close. Managed ownership erases physical descriptor free; native OS allocation/unmap/ABI is unverified. No replacement loader or file mapper is supplied. */
import { UDataMemory } from "./udatamem.h";
import { DataHeader, udata_getHeaderSize } from "./ucmndata.h";
import { U_FAILURE } from "./unicode/utypes";
import { uprv_unmapFile } from "./umapfile.h";
/** Original memset-zero initialization followed by length=-1. @param data - Actual descriptor storage. @returns Nothing. */
export function UDataMemory_init(data: UDataMemory): void {
  data.vFuncs = null;
  data.pHeader = null;
  data.toc = null;
  data.heapAllocated = false;
  data.mapAddr = null;
  data.map = null;
  data.length = -1;
}
/** Original whole-struct copy retains destination allocation flag and shared pointers. @param dest - Initialized destination. @param source - Actual source. @returns Nothing. */
export function UDatamemory_assign(dest: UDataMemory, source: UDataMemory): void {
  const heap = dest.heapAllocated;
  dest.vFuncs = source.vFuncs;
  dest.pHeader = source.pHeader;
  dest.toc = source.toc;
  dest.heapAllocated = source.heapAllocated;
  dest.mapAddr = source.mapAddr;
  dest.map = source.map;
  dest.length = source.length;
  dest.heapAllocated = heap;
}
/** Original failure guard and initialized heap-owned descriptor. Physical allocation failure is outside the managed descriptor binding. @param status - Source status. @returns Actual descriptor/null. */
export function UDataMemory_createNewInstance(status: [number]): UDataMemory | null {
  if (U_FAILURE(status[0])) return null;
  const data = new UDataMemory();
  UDataMemory_init(data);
  data.heapAllocated = true;
  return data;
}
/** Original non-OS400 normalization checks only the initial magic, otherwise advances exactly one double. No signature search or validation is added. @param pointer - Actual readable allocation/null. @returns Header pointer/null. */
export function UDataMemory_normalizeDataPointer(
  pointer: Uint8Array | DataHeader | null,
): DataHeader | null {
  if (pointer === null) return null;
  const bytes = pointer instanceof DataHeader ? pointer.data : pointer;
  if (bytes[2] === 0xda && bytes[3] === 0x27)
    return pointer instanceof DataHeader ? pointer : new DataHeader(bytes);
  return new DataHeader(
    bytes.subarray(8),
    pointer instanceof DataHeader ? pointer.relocations : null,
  );
}
/** Original setter does not reset other descriptor state. @param data - Actual handle. @param pointer - Actual allocation/null. @returns Nothing. */
export function UDataMemory_setData(
  data: UDataMemory,
  pointer: Uint8Array | DataHeader | null,
): void {
  data.pHeader = UDataMemory_normalizeDataPointer(pointer);
}
/** Original close/unmap then allocation-dependent destruction or reinitialization. Managed final deletion drops descriptor-owned references; access to a heap descriptor after close is outside the source contract. @param data - Actual descriptor/null. @returns Nothing. */
export function udata_close(data: UDataMemory | null): void {
  if (data !== null) {
    uprv_unmapFile(data);
    if (data.heapAllocated) {
      data.pHeader = null;
      data.toc = null;
      data.vFuncs = null;
    } else UDataMemory_init(data);
  }
}
/** Original data pointer skips the endian-aware header length. @param data - Actual handle/null. @returns Borrowed content/null. */
export function udata_getMemory(data: UDataMemory | null): Uint8Array | null {
  return data !== null && data.pHeader !== null
    ? data.pHeader.data.subarray(udata_getHeaderSize(data.pHeader))
    : null;
}
/** Original known-length query preserves negative results from an undersized recorded length. @param data - Actual handle/null. @returns Payload length or -1. */
export function udata_getLength(data: UDataMemory | null): number {
  return data !== null && data.pHeader !== null && data.length >= 0
    ? data.length - udata_getHeaderSize(data.pHeader)
    : -1;
}
/** Original raw pointer includes the header. @param data - Actual handle/null. @returns Actual raw bytes/null. */
export function udata_getRawMemory(data: UDataMemory | null): Uint8Array | null {
  return data !== null && data.pHeader !== null ? data.pHeader.data : null;
}
/** Original loaded test uses header presence only. @param data - Initialized descriptor. @returns Loaded. */
export function UDataMemory_isLoaded(data: UDataMemory): boolean {
  return data.pHeader !== null;
}
