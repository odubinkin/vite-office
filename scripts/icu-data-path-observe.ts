/** @fileoverview Observes the actual ICU data-directory records and UDataPathIterator fields. Native logical bytes/ownership are read; allocator/free and invalidated borrows are excluded. */
import * as P from "../apps/office/src/external/icu/source/common/putil";
import { UDataPathIterator } from "../apps/office/src/external/icu/source/common/udata";
import { CharString } from "../apps/office/src/external/icu/source/common/charstr.h";
import { cStringLength } from "../apps/office/src/external/icu/source/common/stringpiece";
/** Native operation inputs; nullable arrays distinguish null from a readable empty NUL string. */
export interface DataPathOp {
  op: string;
  error: number;
  path?: number[] | null;
  pkg?: number[] | null;
  item?: number[];
  suffix?: number[] | null;
  check?: boolean;
}
/** Creates readable actual source bytes. @param value - Logical narrow input/null. @returns NUL pointer/null. */
function pointer(value: number[] | null | undefined): Uint8Array | null {
  if (value === null || value === undefined) return null;
  const p = new Uint8Array(value.length + 8);
  p.set(value);
  return p;
}
/** Reads a NUL span including its terminator. @param p - Actual pointer/null. @returns Counted fields. */
function span(p: Uint8Array | null): number[] {
  if (p === null) return [-1];
  const n = cStringLength(p);
  return [n, ...p.subarray(0, n + 1)];
}
/** Reads initialized CharString state and its actual logical bytes. @param value - Actual owner/null. @returns Fields. */
function chars(value: CharString | null): number[] {
  if (value === null) return [-1];
  const b = value["buffer"];
  return [
    value.length(),
    b.getCapacity(),
    Number(b["needToRelease"]),
    Number(b.getAlias() === b["stackArray"]),
    ...value.data().subarray(0, value.length() + 1),
  ];
}
/** Runs process-ordered scenarios through the original-shaped owners and APIs. Cleanup retains source once errors between scenarios. @param sequences - Actual input sequences. @returns Full numeric snapshots. */
export function observeDataPaths(sequences: DataPathOp[][]): number[][][] {
  const result: number[][][] = [];
  for (const ops of sequences) {
    P.putil_cleanup();
    let iterator: UDataPathIterator | null = null;
    const rows: number[][] = [];
    for (const op of ops) {
      const status: [number] = [op.error];
      let row: number[] = [];
      if (op.op === "D") P.u_setDataDirectory(pointer(op.path));
      if (op.op === "G") row = span(P.u_getDataDirectory());
      if (op.op === "T") P.u_setTimeZoneFilesDirectory(pointer(op.path), status);
      if (op.op === "Z") row = span(P.u_getTimeZoneFilesDirectory(status));
      if (op.op === "C") row = [Number(P.putil_cleanup())];
      if (op.op === "P") row = [Number(P.uprv_pathIsAbsolute(pointer(op.path)))];
      if (op.op === "I")
        iterator = new UDataPathIterator(
          pointer(op.path),
          pointer(op.pkg),
          pointer(op.item) as Uint8Array,
          pointer(op.suffix),
          op.check ?? false,
          status,
        );
      if (op.op === "N") row = span((iterator as UDataPathIterator).next(status));
      row.push(
        status[0],
        P.gDataDirInitOnce["fState"],
        P.gDataDirInitOnce["fErrCode"],
        ...span(P.gDataDirectory),
        P.gTimeZoneFilesInitOnce["fState"],
        P.gTimeZoneFilesInitOnce["fErrCode"],
        ...chars(P.gTimeZoneFilesDirectory),
        Number(iterator !== null),
      );
      if (iterator !== null) {
        const path = iterator["path"],
          next = iterator["nextPath"],
          item = iterator["itemPath"],
          suffix = iterator["suffix"];
        row.push(
          ...span(path),
          ...span(next),
          ...span(iterator["basename"]),
          iterator["basenameLen"],
          suffix.length(),
          ...span(suffix.data()),
          Number(iterator["checkLastFour"]),
          ...chars(item),
          ...chars(iterator["pathBuffer"]),
          ...chars(iterator["packageStub"]),
          Number(
            next !== null &&
              next.buffer === item.data().buffer &&
              next.byteOffset === item.data().byteOffset,
          ),
          next !== null && next.buffer === path.buffer ? next.byteOffset - path.byteOffset : -1,
        );
      }
      rows.push(row);
    }
    result.push(rows);
  }
  P.putil_cleanup();
  return result;
}
