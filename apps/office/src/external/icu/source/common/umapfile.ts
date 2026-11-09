/** @fileoverview POSIX ICU data mapping contracts over managed bytes supplied by the host. */
import { DataHeader } from "./ucmndata.h";
import { UDataMemory_init, type UDataMemory } from "./udatamem.h";
import { U_FAILURE } from "./unicode/utypes";

/** Host equivalent of stat/open/mmap. A missing or inaccessible file returns null. */
export type DataFileReader = (path: Uint8Array) => Uint8Array | null;

let dataFileReader: DataFileReader | null = null;

/** Installs a host reader for synchronous ICU file access. @param reader - Host file reader or null in a realm with no accessible files. @returns Nothing. */
export function setDataFileReader(reader: DataFileReader | null): void {
  dataFileReader = reader;
}

/** Original POSIX map ordering over actual file bytes, with an independent mapping per open. @param data - Output descriptor. @param path - Borrowed NUL path. @param status - Sticky status. @returns Whether a file was mapped. */
export function uprv_mapFile(data: UDataMemory, path: Uint8Array, status: [number]): boolean {
  if (U_FAILURE(status[0])) return false;
  UDataMemory_init(data);
  const file = dataFileReader?.(path) ?? null;
  if (file === null || file.length === 0) return false;

  // A short POSIX mapping still exposes the zero-filled remainder of its final page.
  const mapped = new Uint8Array(Math.max(file.length, 24));
  mapped.set(file);
  data.map = mapped.subarray(file.length, file.length);
  data.pHeader = new DataHeader(mapped);
  data.mapAddr = mapped;
  data.length = file.length;
  return true;
}

/** Original pinned POSIX pointer-clear order after releasing a mapped allocation. Managed storage releases actual owner references; native OS unmapping/allocator ABI is not certified. @param data - Actual data/mapping handle. @returns Nothing. */
export function uprv_unmapFile(data: UDataMemory | null): void {
  if (data !== null && data.map !== null) {
    data.pHeader = null;
    data.map = null;
    data.mapAddr = null;
  }
}
