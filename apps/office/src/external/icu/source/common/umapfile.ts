/** @fileoverview Original POSIX unmap field-mutation branch for actual managed mapped-byte storage. Native munmap/free are GC-backed; OS mapping/file opening and Win32 handles are unported, with no replacement mapper or changed file-access defaults. */
import type { UDataMemory } from "./udatamem.h";
/** Original pinned POSIX pointer-clear order after releasing a mapped allocation. Managed storage releases actual owner references; native OS unmapping/allocator ABI is not certified. @param data - Actual data/mapping handle. @returns Nothing. */
export function uprv_unmapFile(data: UDataMemory | null): void {
  if (data !== null && data.map !== null) {
    data.pHeader = null;
    data.map = null;
    data.mapAddr = null;
  }
}
