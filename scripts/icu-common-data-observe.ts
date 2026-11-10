/** @fileoverview Real common-data descriptor/lookup driver shared by native comparison and replay. Relocated source pointer fields are direct references; no substitute TOC provider or lookup callback. */
import {
  DataHeader,
  UDataOffsetTOC,
  udata_checkCommonData,
  udata_getHeaderSize,
  udata_getInfoSize,
} from "../apps/office/src/external/icu/source/common/ucmndata.h";
import {
  PointerTOC,
  type PointerTOCEntry,
} from "../apps/office/src/external/icu/source/common/ucmndata";
import {
  UDataMemory,
  UDataMemory_init,
  UDataMemory_setData,
  udata_getLength,
  UDataMemory_normalizeDataPointer,
} from "../apps/office/src/external/icu/source/common/udatamem.h";
/** Original generated package bytes and relocated static symbol fields. */
export interface CommonPackage {
  offset: string;
  pointerHeader: number[];
  entries: { name: number[]; data: string }[];
}
/** Native method inputs. */
export interface CommonCase {
  format: number;
  variant: number;
  status: number;
  length: number;
  key: number[];
}
/** Queries actual descriptors and installed source dispatch. @param item - Native input. @param pkg - Genuine generator outputs. @returns Complete observable trace. */
export function observeCommonData(item: CommonCase, pkg: CommonPackage): number[] {
  const offset = Uint8Array.from(Buffer.from(pkg.offset, "base64")),
    entries: PointerTOCEntry[] = pkg.entries.map(
      /** Rebinds actual source static pointer slots. @param e - Native entry. @returns Actual pointer fields. */ (
        e,
      ) => ({
        entryName: Uint8Array.from(e.name),
        pHeader: Uint8Array.from(Buffer.from(e.data, "base64")),
      }),
    );
  const originalHeaderSize = new Uint16Array(offset.buffer, offset.byteOffset, 1)[0] as number;
  const prefix = item.variant === 19 ? 8 : item.variant === 20 ? 16 : 0,
    size =
      item.variant === 10
        ? 24
        : item.variant === 11
          ? 64
          : item.format === 0
            ? originalHeaderSize
            : 32,
    bytes = new Uint8Array(1048576),
    tocAddress = prefix + size;
  bytes.set(item.format === 0 ? offset.subarray(0, originalHeaderSize) : pkg.pointerHeader, prefix);
  if (item.format === 0) bytes.set(offset.subarray(originalHeaderSize), tocAddress);
  else new Uint32Array(bytes.buffer, tocAddress, 2).set([entries.length, 0]);
  new Uint16Array(bytes.buffer, prefix, 1)[0] = size;
  const pointers = new Map<number, PointerTOC>();
  if (item.format === 1 && item.variant !== 23 && item.variant !== 24)
    pointers.set(tocAddress, new PointerTOC(bytes.subarray(tocAddress), entries));
  if (item.variant === 23) new Uint32Array(bytes.buffer, tocAddress, 1)[0] = 0;
  const header = new DataHeader(
      bytes,
      item.variant === 23 || item.variant === 24 ? null : pointers,
    ),
    data = item.variant === 13 ? null : new UDataMemory();
  if (data !== null) {
    UDataMemory_init(data);
    UDataMemory_setData(data, item.variant === 23 ? bytes : header);
    if (item.variant === 12) data.pHeader = null;
  }
  if (item.variant === 14) udata_checkCommonData(data, [0]);
  if (item.variant === 1) bytes[prefix + 2] = 0;
  if (item.variant === 2) bytes[prefix + 3] = 0;
  if (item.variant === 3) bytes[prefix + 8] = 1;
  if (item.variant === 4) bytes[prefix + 9] = 1;
  if (item.variant === 5) bytes[prefix + 10] = 4;
  if (item.variant === 6) new Uint16Array(bytes.buffer, prefix + 4, 1)[0] = 0;
  if (item.variant === 7) bytes[prefix + 16] = 2;
  if (item.variant === 8) bytes[prefix + 17] = 255;
  if (item.variant === 9 || item.variant === 14) bytes[prefix + 12] = 0;
  const status: [number] = [item.status];
  udata_checkCommonData(data, status);
  if (data !== null && data.vFuncs !== null) {
    if (item.variant === 15) data.toc = null;
    if (item.variant === 16) new Uint32Array(bytes.buffer, tocAddress, 1)[0] = 0;
    if (item.variant === 17) new Uint32Array(bytes.buffer, tocAddress, 1)[0] = 1;
    if (item.variant === 18) {
      if (item.format === 1) entries.reverse();
      else {
        const rows = new Uint32Array(bytes.buffer, tocAddress + 4, 2 * pkg.entries.length),
          copy = rows.slice();
        for (let i = 0; i < pkg.entries.length; ++i)
          rows.set(copy.subarray(2 * i, 2 * i + 2), 2 * (pkg.entries.length - 1 - i));
      }
    }
    if (item.variant === 22 && item.format === 0) {
      const words = new Uint32Array(bytes.buffer, tocAddress + 4, 4);
      words[3] = (words[1] as number) - 16;
    }
    if (item.variant === 21) data.length = offset.length;
  }
  const row = [status[0]];
  if (data === null) return [...row, -1];
  const h = data.pHeader,
    toc = data.toc as UDataOffsetTOC | PointerTOC | null;
  row.push(
    Number(data.vFuncs !== null),
    h === null ? -1 : h.data.byteOffset - bytes.byteOffset,
    toc === null ? -1 : toc.data.byteOffset - bytes.byteOffset,
    Number(data.heapAllocated),
    data.length,
    Number(data.map !== null),
    Number(data.mapAddr !== null),
    udata_getLength(data),
  );
  if (h !== null)
    row.push(udata_getHeaderSize(h), udata_getInfoSize(h.info), ...h.data.subarray(0, 24));
  if (data.vFuncs !== null) {
    if (item.variant === 24) return [...row, data.vFuncs.NumEntries(data)];
    const length: [number] = [item.length],
      lookupStatus: [number] = [item.status],
      found = data.vFuncs.Lookup(data, Uint8Array.from(item.key), length, lookupStatus);
    let id = -1;
    if (found !== null) {
      if (found === data.pHeader) id = -2;
      else if (item.format === 1) {
        for (let i = 0; i < pkg.entries.length; ++i) {
          const p = UDataMemory_normalizeDataPointer(
            (entries[item.variant === 18 ? pkg.entries.length - 1 - i : i] as PointerTOCEntry)
              .pHeader,
          );
          if (
            p !== null &&
            p.data.buffer === found.data.buffer &&
            p.data.byteOffset === found.data.byteOffset
          )
            id = i;
        }
      } else {
        const original = new UDataOffsetTOC(offset.subarray(originalHeaderSize));
        for (let i = 0; i < original.count; ++i)
          if (found.data.byteOffset === tocAddress + original.entry(i).dataOffset) id = i;
      }
    }
    row.push(data.vFuncs.NumEntries(data), length[0], lookupStatus[0], id, Number(found !== null));
    if (found !== null)
      row.push(
        udata_getHeaderSize(found),
        udata_getInfoSize(found.info),
        ...found.data.subarray(0, id >= 0 ? 64 : 24),
      );
  }
  return row;
}
