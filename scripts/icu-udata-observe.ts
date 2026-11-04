/** @fileoverview Test-only real descriptor/constructor drivers and field observations, shared by the native comparator and Vitest. No alternate loader, TOC provider or runtime file mapper. */
import { UDataMemory } from "../apps/office/src/external/icu/source/common/udatamem.h";
import * as M from "../apps/office/src/external/icu/source/common/udatamem";
import {
  DataHeader,
  udata_getHeaderSize,
  udata_getInfoSize,
} from "../apps/office/src/external/icu/source/common/ucmndata.h";
import {
  RBBIDataWrapper,
  type RBBIStateTable,
} from "../apps/office/src/external/icu/source/common/rbbidata.h";
/** Native command inputs. */
export interface UDataCase {
  kind: string;
  args: number[];
}
/** Independent input-byte construction; native writes the same fields via actual C structs and snapshots the prefix bytes to detect layout errors. @param prefix - Initial storage before header. @param size - Header field. @param info - Info field. @param endian - Marker. @param raw - Optional raw compiled rules. @param variant - Constructor input case. @param capacity - Actual backing size. @returns Actual storage. */
export function frame(
  prefix: number,
  size: number,
  info: number,
  endian: number,
  raw?: Uint8Array,
  variant = 0,
  capacity = 131072,
): Uint8Array {
  const bytes = new Uint8Array(capacity),
    words = new Uint16Array(bytes.buffer, prefix, 4);
  words[0] = size;
  bytes[prefix + 2] = 0xda;
  bytes[prefix + 3] = 0x27;
  words[2] = info;
  words[3] = 0x1234;
  bytes.set([endian, 0, 2, 0x56, 0x42, 0x72, 0x6b, 0x20, 6, 0, 0, 0, 1, 2, 3, 4], prefix + 8);
  if (raw) bytes.set(raw, prefix + (size < 20 ? 32 : size));
  if (variant === 6) bytes[prefix + 9] = 1;
  if (variant === 7) bytes[prefix + 10] = 4;
  if (variant === 8) bytes[prefix + 15] = 0;
  if (variant === 9) bytes[prefix + 16] = 7;
  if (variant === 10) bytes[prefix + 17] = 255;
  if (variant === 12) new Uint32Array(bytes.buffer, prefix + size, 1)[0] = 0;
  if (variant === 13) bytes[prefix + 2] = 0;
  return bytes;
}
/** Actual pointer offset projection. @param pointer - Real borrowed bytes/null. @param base - Actual allocation. @returns Source-relative address or -1. */
function offset(pointer: Uint8Array | null, base: Uint8Array): number {
  return pointer === null ? -1 : pointer.byteOffset - base.byteOffset;
}
/** Reads all initialized descriptor fields and header bytes/queries. @param data - Real handle/null. @param base - Actual allocation. @returns Flat native observations. */
function memory(data: UDataMemory | null, base: Uint8Array): number[] {
  if (data === null) return [-1];
  const row = [
    Number(data.vFuncs !== null),
    data.pHeader === null ? -1 : offset(data.pHeader.data, base),
    offset(data.toc as Uint8Array | null, base),
    Number(data.heapAllocated),
    offset(data.mapAddr, base),
    offset(data.map, base),
    data.length,
    Number(M.UDataMemory_isLoaded(data)),
    offset(M.udata_getRawMemory(data), base),
    offset(M.udata_getMemory(data), base),
    M.udata_getLength(data),
  ];
  if (data.pHeader !== null)
    row.push(
      udata_getHeaderSize(data.pHeader),
      udata_getInfoSize(data.pHeader.info),
      ...data.pHeader.data.subarray(0, 64),
    );
  return row;
}
/** Reads complete initialized table storage. @param t - Actual view/null. @returns State. */
function table(t: RBBIStateTable | null): number[] {
  return t === null
    ? [-1]
    : [
        t.fNumStates,
        t.fRowLen,
        t.fDictCategoriesStart,
        t.fLookAheadResultsSize,
        t.fFlags,
        t.fTableData.length,
        ...t.fTableData,
      ];
}
/** Actual initialized rule-owner state, matching the existing native observer. @param w - Actual constructed owner. @param status - Original status. @param raw - Raw payload address. @returns Full fields/arrays/value. */
function owner(w: RBBIDataWrapper, status: number, raw: Uint8Array): number[] {
  const row = [
    status,
    Number(w.fHeader !== null),
    w["fRefCount"],
    Number(w["fDontFreeData"]),
    Number(w["fUDataMem"] === null),
  ];
  if (w.fHeader !== null)
    row.push(...new Uint32Array(raw.buffer, raw.byteOffset, 20), w.hashCode());
  row.push(...table(w.fForwardTable), ...table(w.fReverseTable));
  const t = w.fTrie;
  if (t === null) row.push(-1);
  else
    row.push(
      t.type,
      t.valueWidth,
      t.indexLength,
      t.dataLength,
      t.highStart,
      t.shifted12HighStart,
      t.reserved32,
      t.reserved16,
      t.index3NullOffset,
      t.dataNullOffset,
      t.nullValue,
      ...t.index,
      ...t.data,
    );
  row.push(
    w.fRuleSource === null ? -1 : w.fRuleSource.byteOffset - raw.byteOffset,
    w.fRuleStatusTable === null ? -1 : w.fStatusMaxIdx,
  );
  if (w.fRuleStatusTable !== null) row.push(...w.fRuleStatusTable);
  const text = w.getRuleSourceString();
  row.push(
    Number(text.isBogus()),
    Number(text.getBuffer() === null),
    text.length(),
    Number(text.isEmpty()),
    text.charAt(0),
    text.charAt(text.length()),
    text.char32At(0),
  );
  for (let i = 0; i < text.length(); ++i) row.push(text.charAt(i));
  return row;
}
/** Actually allocated source descriptor, stack- or heap-owned. @param heap - Allocation selector. @returns Initialized descriptor. */
function descriptor(heap: number): UDataMemory {
  if (heap) return M.UDataMemory_createNewInstance([0]) as UDataMemory;
  const data = new UDataMemory();
  M.UDataMemory_init(data);
  return data;
}
/** Runs source helpers over real byte storage; mapping inputs project actual native mapped allocation fields, not a replacement file API. @param item - Native input. @param binaries - Actual original raw binaries. @returns Flat observations. */
export function observeUData(item: UDataCase, binaries: Uint8Array[]): number[] {
  const a = item.args;
  if (item.kind === "S") {
    const bytes = frame(0, a[0] as number, a[1] as number, a[2] as number, undefined, 0, 32),
      h = new DataHeader(bytes);
    return [
      h.dataHeader.headerSize,
      h.info.size,
      h.info.isBigEndian,
      udata_getHeaderSize(h),
      udata_getInfoSize(h.info),
      ...bytes.subarray(0, 24),
    ];
  }
  if (item.kind === "Z") {
    M.udata_close(null);
    return [
      udata_getHeaderSize(null),
      udata_getInfoSize(null),
      Number(M.udata_getMemory(null) === null),
      M.udata_getLength(null),
      Number(M.udata_getRawMemory(null) === null),
      Number(M.UDataMemory_normalizeDataPointer(null) === null),
    ];
  }
  if (item.kind === "N") {
    const status: [number] = [a[0] as number],
      data = M.UDataMemory_createNewInstance(status),
      row = [status[0], ...memory(data, new Uint8Array())];
    M.udata_close(data);
    return row;
  }
  if (item.kind === "H") {
    const bytes = frame(a[4] as number, a[0] as number, a[1] as number, a[2] as number),
      data = descriptor(0);
    M.UDataMemory_setData(data, bytes);
    data.length = a[3] as number;
    const row = memory(data, bytes);
    M.UDataMemory_setData(data, null);
    row.push(...memory(data, bytes));
    M.udata_close(data);
    row.push(...memory(data, bytes));
    return row;
  }
  if (item.kind === "M") {
    const bytes = frame(0, 32, 20, 0),
      data = descriptor(0);
    data.pHeader = new DataHeader(bytes);
    data.mapAddr = bytes;
    data.map = bytes.subarray(bytes.length);
    data.length = bytes.length;
    const row = [1, ...memory(data, bytes)];
    M.udata_close(data);
    row.push(...memory(data, bytes));
    return row;
  }
  if (item.kind === "A") {
    const bytes = frame(0, 32, 20, 0),
      source = descriptor(a[0] as number),
      dest = descriptor(a[1] as number);
    M.UDataMemory_setData(source, bytes);
    source.length = a[2] as number;
    source.toc = bytes.subarray(48);
    dest.toc = bytes.subarray(96);
    dest.length = 777;
    if (a[3]) {
      source.heapAllocated = false;
      source.mapAddr = bytes;
      source.map = bytes.subarray(bytes.length);
      source.length = bytes.length;
    }
    const row = [...memory(source, bytes), ...memory(dest, bytes)];
    M.UDatamemory_assign(dest, source);
    row.push(
      ...memory(dest, bytes),
      Number(dest.pHeader === source.pHeader),
      Number(dest.toc === source.toc),
      Number(dest.vFuncs === source.vFuncs),
      Number(dest.map === source.map),
      Number(dest.mapAddr === source.mapAddr),
    );
    // Observations end before releasing either alias of a copied mapping.
    M.udata_close(dest);
    source.map = null;
    source.mapAddr = null;
    source.pHeader = null;
    M.udata_close(source);
    return row;
  }
  const [index, variant, initial, heap] = a as [number, number, number, number],
    prefix = variant === 1 ? 8 : variant === 16 ? 16 : 0,
    size = variant === 2 ? 20 : variant === 3 ? 19 : variant === 4 ? 0 : variant === 15 ? 24 : 32;
  const bytes = frame(
      prefix,
      size,
      variant === 11 ? 0 : 20,
      variant === 5 ? 1 : 0,
      binaries[index],
      variant,
    ),
    data = variant === 14 ? null : descriptor(heap);
  if (data !== null) {
    if (variant === 13) data.pHeader = new DataHeader(bytes.subarray(prefix));
    else M.UDataMemory_setData(data, bytes);
  }
  const before = memory(data, bytes),
    status: [number] = [initial],
    w = new RBBIDataWrapper(data, status),
    raw =
      data === null || data.pHeader === null
        ? bytes.subarray(32)
        : data.pHeader.data.subarray(data.pHeader.dataHeader.headerSize),
    row = [
      ...before,
      ...owner(w, status[0], raw),
      Number(w["fUDataMem"] === data),
      ...memory(data, bytes),
    ];
  if (status[0] <= 0) {
    row.push(Number(w.addReference() === w), ...owner(w, status[0], raw));
    w.removeReference();
    row.push(...owner(w, status[0], raw));
    w.removeReference();
    if (!heap) row.push(...memory(data, bytes));
  } else {
    w.removeReference();
    row.push(...owner(w, status[0], raw), ...memory(data, bytes));
  }
  return row;
}
