/** @fileoverview Compares every complete native RTL ownership/pool snapshot and original diagnosed assertion without upstream files. */
import { describe, expect, it, vi } from "vitest";
import * as rtl from "../inc/rtl/ustring.h";
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";
import * as str from "./strtmpl";
import * as table from "./hash";
import { rtl_stringAllocation, SAL_STRING_STATIC_FLAG } from "./strimp.hxx";
import { rtl_uString_ImplAlloc, rtl_ustring_intern_internal, StrLifecycle } from "./ustring";
import captured from "./native-ustring-ownership-cases.json";

/** Full initialized native allocation observation. */
type DataRow = [number, number, number, number, number[], number];
/** Complete caller and live pool observation. */
interface State {
  handles: number[];
  live: DataRow[];
  events: number[][];
  pool: [number, number, [number, number][]];
  result: number[];
}
/** Lossless encoding of changes between consecutive complete native observations. */
type Delta = [
  [number, number][],
  [number, DataRow | null][],
  number[][],
  number,
  number,
  [number, number | null][],
  number[],
];
/** Source-backed capture contract, independent of upstream presence during tests. @returns Original operation result. */
interface Corpus {
  handleCount: number;
  calls: { op: string; a: number; b: number; units: number[] }[];
  deltas: Delta[];
  guards: { index: number; expression: string; signal: string }[];
  statesEncoding: string;
  statesHash: string;
}
const native = captured as unknown as Corpus;

describe("original RTL Unicode ownership and intern pool", /** Defines full native comparison. @returns Original operation result. */ () => {
  it("matches every complete native identity, counter, buffer, allocator event and hash-table slot", /** Replays original calls and reconstructs all native observations. @returns Nothing. */ () => {
    expect(native.statesEncoding).toBe("complete-observation-deltas-v1");
    expect(native.calls).toHaveLength(native.deltas.length);
    expect(native.calls.length).toBeGreaterThan(3000);
    const slots: rtl_uStringSlot[] = Array.from(
      { length: native.handleCount },
      /** Creates independent native pointer slots. @returns Concrete slot. */ () => [null],
    );
    const ids = new Map<rtl_uString, number>(),
      live = new Map<number, { data: rtl_uString; bytes: number }>();
    const allocation = { ...rtl_stringAllocation };
    let nextId = 1,
      failNext = false;
    let events: number[][] = [];
    const handles = Array<number>(native.handleCount).fill(-1),
      expectedLive = new Map<number, DataRow>(),
      expectedPool = new Map<number, number>();
    const warning = vi
      .spyOn(console, "warn")
      .mockImplementation(
        /** Captures the original nonfatal OSL warning. @returns Nothing. */ () => {},
      );
    rtl_stringAllocation.rtl_allocateString =
      /** Observes actual allocator calls and uses the original replaceable failure slot. @param bytes - Source requested bytes. @returns Concrete browser allocation or deliberate original allocator failure. */ (
        bytes,
      ) => {
        if (failNext) {
          failNext = false;
          events.push([2, bytes]);
          return null;
        }
        const data = allocation.rtl_allocateString(bytes);
        if (data === null) throw new Error("Unexpected allocator failure");
        const id = nextId++;
        ids.set(data, id);
        live.set(id, { data, bytes });
        events.push([0, id, bytes]);
        return data;
      };
    rtl_stringAllocation.rtl_freeString =
      /** Observes original free order before browser storage release. @param data - Freed concrete owner. @returns Nothing. */ (
        data,
      ) => {
        const id = ids.get(data);
        if (id === undefined) throw new Error("Unowned free");
        const owned = live.get(id);
        if (!owned) throw new Error("Missing live free owner");
        const capacity = (owned.bytes - 10) / 2;
        events.push([
          1,
          id,
          data.refCount,
          data.length,
          capacity,
          ...Array.from(data.buffer.subarray(0, data.length + 1)),
          data.buffer[capacity] as number,
        ]);
        live.delete(id);
        ids.delete(data);
        allocation.rtl_freeString(data);
      };
    /** Resolves observed identity, including the original shared C empty. @param data - Native-equivalent pointer. @returns Stable allocation ID. */
    function identify(data: rtl_uString | null): number {
      if (data === null) return -1;
      if (data === str.EmptyStringImpl.data) return 0;
      const id = ids.get(data);
      if (id === undefined) throw new Error("Dangling caller pointer");
      return id;
    }
    /** Requires an initialized caller source. @param index - Handle index. @returns Live data. */
    function source(index: number): rtl_uString {
      const value = slots[index]?.[0];
      if (!value) throw new Error("Missing native source");
      return value;
    }
    /** Records only initialized original fields and both initialized terminators. @param id - Native identity. @param data - Concrete live data. @param capacity - Allocated capacity. @returns Full native-shaped observation. */
    function row(id: number, data: rtl_uString, capacity: number): DataRow {
      return [
        id,
        data.refCount,
        rtl.rtl_uString_getLength(data),
        capacity,
        Array.from(rtl.rtl_uString_getStr(data).subarray(0, data.length + 1)),
        data.buffer[capacity] as number,
      ];
    }
    try {
      for (let index = 0; index < native.calls.length; index++) {
        const call = native.calls[index],
          delta = native.deltas[index];
        if (!call || !delta) throw new Error("Incomplete original corpus");
        const slot = slots[call.a];
        if (!slot) throw new Error("Missing pointer slot");
        const units = new Uint16Array(call.units),
          result: number[] = [];
        switch (call.op) {
          case "new":
            rtl.rtl_uString_newFromStr_WithLength(slot, units, units.length);
            break;
          case "extra":
            str.newFromStr_WithLength(slot, units, units.length, call.b);
            break;
          case "empty":
            rtl.rtl_uString_new(slot);
            break;
          case "null":
            rtl.rtl_uString_newFromStr_WithLength(slot, null, 0);
            break;
          case "reserve":
            rtl.rtl_uString_new_WithLength(slot, call.b);
            break;
          case "alloc":
            slot[0] = rtl.rtl_uString_alloc(units.length);
            source(call.a).buffer.set(units);
            break;
          case "implalloc":
            slot[0] = rtl_uString_ImplAlloc(units.length);
            source(call.a).buffer.set(units);
            break;
          case "failalloc":
            failNext = true;
            slot[0] = rtl.rtl_uString_alloc(call.b);
            result.push(Number(slot[0] === null));
            break;
          case "copy":
            rtl.rtl_uString_newFromString(slot, source(call.b));
            break;
          case "alias": {
            const data = source(call.b),
              offset = call.b % 2;
            rtl.rtl_uString_newFromStr_WithLength(
              slot,
              data.buffer.subarray(offset),
              data.length - offset,
            );
            break;
          }
          case "assign":
            rtl.rtl_uString_assign(slot, source(call.b));
            break;
          case "acquire":
            rtl.rtl_uString_acquire(source(call.a));
            break;
          case "release":
            rtl.rtl_uString_release(source(call.a));
            slot[0] = null;
            break;
          case "intern":
            rtl.rtl_uString_intern(slot, source(call.b));
            break;
          case "rawintern":
            slot[0] = table.rtl_str_hash_intern(source(call.b), StrLifecycle.CAN_RETURN);
            break;
          case "return": {
            const data = source(call.b);
            (slots[call.b] as rtl_uStringSlot)[0] = null;
            rtl_ustring_intern_internal(slot, data, StrLifecycle.CAN_RETURN);
            break;
          }
          case "static":
            source(call.a).refCount = SAL_STRING_STATIC_FLAG;
            break;
          case "remove":
            table.rtl_str_hash_remove(source(call.a));
            break;
          case "hash":
            result.push(rtl.rtl_ustr_hashCode_WithLength(units, units.length));
            break;
          case "compare": {
            const a = source(call.a),
              b = source(call.b);
            result.push(rtl.rtl_ustr_compare_WithLength(a.buffer, a.length, b.buffer, b.length));
            break;
          }
          case "size":
            result.push(table.getNextSize(call.b));
            break;
          case "table": {
            table.rtl_str_hash_free(null);
            const data = table.rtl_str_hash_new(call.b);
            result.push(data.nSize, data.nEntries);
            table.rtl_str_hash_free(data);
            break;
          }
          case "cstring": {
            const terminated = new Uint16Array(units.length + 1);
            terminated.set(units);
            rtl.rtl_uString_newFromStr(slot, terminated);
            break;
          }
          default:
            throw new Error(`Unknown original call ${call.op}`);
        }
        const [
          handleChanges,
          liveChanges,
          expectedEvents,
          size,
          count,
          poolChanges,
          expectedResult,
        ] = delta;
        for (const [i, id] of handleChanges) handles[i] = id;
        for (const [id, data] of liveChanges) {
          if (data === null) expectedLive.delete(id);
          else expectedLive.set(id, data);
        }
        for (const [i, id] of poolChanges) {
          if (id === null) expectedPool.delete(i);
          else expectedPool.set(i, id);
        }
        const pool = table.getHashTable(),
          poolRows: [number, number][] = [];
        (pool.pData as (rtl_uString | null)[]).forEach(
          /** Records every non-null slot; size and all absent slots specify the entire zeroed table. @param data - Concrete entry. @param i - Original slot. @returns Nothing. */ (
            data,
            i,
          ) => {
            if (data !== null) poolRows.push([i, identify(data)]);
          },
        );
        const actual: State = {
          handles: slots.map(
            /** Records all original caller pointers. @param pointer - Original slot. @returns Allocation identity. */ (
              pointer,
            ) => identify(pointer[0]),
          ),
          live: [
            row(0, str.EmptyStringImpl.data, 0),
            ...[...live].map(
              /** Records complete live initialized data. @param entry - Allocation. @returns Data row. */ ([
                id,
                { data, bytes },
              ]) => row(id, data, (bytes - 10) / 2),
            ),
          ],
          events,
          pool: [pool.nSize, pool.nEntries, poolRows],
          result,
        };
        const expected: State = {
          handles,
          live: [...expectedLive.values()].sort(
            /** Restores native allocation order. @param a - First row. @param b - Second row. @returns Original order. */ (
              a,
              b,
            ) => a[0] - b[0],
          ),
          events: expectedEvents,
          pool: [
            size,
            count,
            [...expectedPool].sort(
              /** Restores native physical slot order. @param a - First slot. @param b - Second slot. @returns Slot order. */ (
                a,
                b,
              ) => a[0] - b[0],
            ),
          ],
          result: expectedResult,
        };
        expect(JSON.stringify(actual), `native call ${index}: ${call.op}`).toBe(
          JSON.stringify(expected),
        );
        events = [];
      }
      expect(warning).toHaveBeenCalledWith("OSL_ASSERT: pHash->pData[n]");
    } finally {
      // Test caller cleanup is outside the captured corpus, just as native driver process cleanup is.
      for (const data of (table.getHashTable().pData as (rtl_uString | null)[]).slice())
        if (data !== null) table.rtl_str_hash_remove(data);
      for (const { data } of live.values()) allocation.rtl_freeString(data);
      Object.assign(rtl_stringAllocation, allocation);
      warning.mockRestore();
    }
  });
  it("preserves every original diagnosed storage and allocation assertion", /** Compares browser fail-fast expressions with unchanged native SIGABRT diagnostics. @returns Original operation result. */ () => {
    const data = new Uint16Array([0]),
      empty = str.EmptyStringImpl.data;
    const slot: rtl_uStringSlot = [null];
    const allocation = { ...rtl_stringAllocation };
    const guards = [
      /** Calls original null destination guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_new(null),
      /** Calls original negative allocation guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_alloc(-1),
      /** Calls original null reserve guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_new_WithLength(null, 1),
      /** Calls original negative reserve guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_new_WithLength(slot, -1),
      /** Calls original null copy destination guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_newFromStr_WithLength(null, data, 0),
      /** Calls original negative copy length guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_newFromStr_WithLength(slot, data, -1),
      /** Calls original null positive source guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_newFromStr_WithLength(slot, null, 1),
      /** Calls original negative spare allocation guard. @returns Original operation result. */ () =>
        str.newFromStr_WithLength(slot, data, 0, -1),
      /** Calls original null string-copy source guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_newFromString(slot, null),
      /** Calls original null assignment destination guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_assign(null, empty),
      /** Calls original null length source guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_getLength(null),
      /** Calls original null getStr guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_getStr(null),
      /** Calls original null intern destination guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_intern(null, empty),
      /** Calls original null intern source guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_intern(slot, null),
      /** Calls original negative hash guard. @returns Original operation result. */ () =>
        rtl.rtl_ustr_hashCode_WithLength(data, -1),
      /** Calls original negative known-length comparison guard. @returns Original operation result. */ () =>
        rtl.rtl_ustr_compare_WithLength(data, -1, data, 0),
      /** Calls original failed reserve allocation guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_new_WithLength(slot, 3),
      /** Calls original failed buffer-copy allocation guard. @returns Original operation result. */ () =>
        rtl.rtl_uString_newFromStr_WithLength(slot, data, 1),
      /** Calls original second known-length constructor guard. @returns Original operation result. */ () =>
        rtl.rtl_ustr_compare_WithLength(data, 0, data, -1),
      /** Calls original make_unsigned nonnegative precondition through internal allocation. @returns Original allocation result. */ () =>
        rtl_uString_ImplAlloc(-1),
    ];
    try {
      for (const guard of native.guards) {
        if (guard.index >= 16)
          rtl_stringAllocation.rtl_allocateString =
            /** Exercises the original replaceable failed allocator. @returns Original null allocation. */ () =>
              null;
        const invoke = guards[guard.index];
        if (!invoke) throw new Error("Missing native guard");
        expect(guard.signal).toBe("SIGABRT");
        expect(invoke).toThrow(guard.expression);
      }
    } finally {
      Object.assign(rtl_stringAllocation, allocation);
    }
  });
});
