/** @fileoverview Replays complete original OUString/SharedString lifetime and live reference observations without native source files. */
import { expect, it } from "vitest";
import { SharedString } from "../../inc/sharedstring";
import { OUString, OUStringLiteral } from "../../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { SAL_NO_ACQUIRE } from "../../../sal/inc/types";
import * as rtl from "../../../sal/inc/rtl/ustring.h";
import type { rtl_uString, rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { rtl_stringAllocation } from "../../../sal/rtl/strimp.hxx";
import { EmptyStringImpl } from "../../../sal/rtl/strtmpl";
import captured from "./native-sharedstring-cases.json";

/** Complete initialized native data observation. */
type DataRow = [number, number, number, number, number[], number];
/** Full native observation at one original call boundary. */
interface State {
  ou: number[];
  shared: ([number, number, number, number, number] | null)[];
  raw: number[];
  views: ([number, number] | null)[];
  live: DataRow[];
  events: number[][];
  result: number[];
}
/** Portable original caller corpus. */
interface Corpus {
  calls: { op: string; a: number; b: number; d: number; units: number[] }[];
  states: State[];
  guards: { index: number; expression: string; signal: string }[];
  diagnostics: { index: number; marker: string; diagnostic: string; definedResult: boolean }[];
  compileGuards: { name: string; caller: string; diagnostic: string; accepted: boolean }[];
}
const native = captured as unknown as Corpus;

it("matches all original live owner, view, pointer, counter, buffer and allocator observations", /** Runs complete native call sequences against shared runtime owners. @returns Nothing. */ () => {
  expect(native.calls).toHaveLength(native.states.length);
  expect(native.calls.length).toBeGreaterThan(4000);
  const ou: (OUString | null)[] = Array(16).fill(null);
  const shared: (SharedString | null)[] = Array(16).fill(null);
  const views: (OUStringConstReference | null)[] = Array(32).fill(null);
  const raw: rtl_uStringSlot[] = Array.from(
    { length: 8 },
    /** Creates actual independent caller fields. @returns Empty field. */ () => [null],
  );
  const literal = new OUStringLiteral(new Uint16Array([65, 0, 66, 0]));
  const cppEmpty = new OUString();
  const ids = new Map<rtl_uString, number>();
  const live = new Map<number, { data: rtl_uString; bytes: number }>();
  const viewIds = new Map<OUStringConstReference, number>();
  const allocation = { ...rtl_stringAllocation };
  let nextId = 1,
    nextView = 0;
  let events: number[][] = [];
  rtl_stringAllocation.rtl_allocateString =
    /** Observes original allocation calls. @param bytes - Requested bytes. @returns Actual runtime data. */ (
      bytes,
    ) => {
      const data = allocation.rtl_allocateString(bytes) as rtl_uString;
      const id = nextId++;
      ids.set(data, id);
      live.set(id, { data, bytes });
      events.push([0, id, bytes]);
      return data;
    };
  rtl_stringAllocation.rtl_freeString =
    /** Observes every initialized field at the original free boundary. @param data - Freed data. @returns Nothing. */ (
      data,
    ) => {
      const id = ids.get(data) as number;
      const capacity = ((live.get(id) as { bytes: number }).bytes - 10) / 2;
      events.push([
        1,
        id,
        data.refCount,
        data.length,
        capacity,
        ...data.buffer.subarray(0, data.length + 1),
        data.buffer[capacity] as number,
      ]);
      live.delete(id);
      ids.delete(data);
      allocation.rtl_freeString(data);
    };
  /** Maps concrete data to the captured native identity. @param data - Live pointer or null. @returns Normalized identity. */
  function identify(data: rtl_uString | null): number {
    if (data === null) return -1;
    if (data === cppEmpty.pData) return -2;
    if (data === literal.str) return -3;
    if (data === EmptyStringImpl.data) return 0;
    return ids.get(data) as number;
  }
  /** Maps a live original reference to a stable caller identity. @param view - Const reference. @returns Identity. */
  function viewId(view: OUStringConstReference): number {
    if (!viewIds.has(view)) viewIds.set(view, nextView++);
    return viewIds.get(view) as number;
  }
  /** Records every initialized native field. @param id - Identity. @param data - Concrete data. @param capacity - Allocated capacity. @returns Complete observation. */
  function row(id: number, data: rtl_uString, capacity: number): DataRow {
    return [
      id,
      data.refCount,
      data.length,
      capacity,
      Array.from(data.buffer.subarray(0, data.length + 1)),
      data.buffer[capacity] as number,
    ];
  }
  try {
    for (const [index, c] of native.calls.entries()) {
      const { op, a, b, d, units } = c;
      const input = new Uint16Array(units);
      const result: number[] = [];
      switch (op) {
        case "od":
          ou[a] = new OUString();
          break;
        case "on":
          ou[a] = new OUString(input, input.length);
          break;
        case "oz":
          ou[a] = new OUString(new Uint16Array([...units, 0]));
          break;
        case "oc":
          ou[a] = new OUString(ou[b] as OUString);
          break;
        case "om":
          ou[a] = OUString.move(ou[b] as OUString);
          break;
        case "ol":
          ou[a] = new OUString(literal);
          break;
        case "ou":
          ou[a] = new OUString(b);
          break;
        case "ora":
          ou[a] = new OUString((raw[b] as rtl_uStringSlot)[0] as rtl_uString);
          break;
        case "ort":
          ou[a] = new OUString((raw[b] as rtl_uStringSlot)[0] as rtl_uString, SAL_NO_ACQUIRE);
          (raw[b] as rtl_uStringSlot)[0] = null;
          break;
        case "ov":
          ou[a] = new OUString(views[b] as OUStringConstReference);
          break;
        case "oa":
          result.push(Number((ou[a] as OUString).assign(ou[b] as OUString) === ou[a]));
          break;
        case "oma":
          result.push(Number((ou[a] as OUString).moveAssign(ou[b] as OUString) === ou[a]));
          break;
        case "ocl":
          (ou[a] as OUString).clear();
          break;
        case "ox":
          (ou[a] as OUString).dispose();
          ou[a] = null;
          break;
        case "sd":
          shared[a] = new SharedString();
          break;
        case "so":
          shared[a] = new SharedString(ou[b] as OUString);
          break;
        case "sp":
          shared[a] = new SharedString(
            b < 0 ? null : (raw[b] as rtl_uStringSlot)[0],
            d < 0 ? null : (raw[d] as rtl_uStringSlot)[0],
          );
          break;
        case "sc":
          shared[a] = new SharedString(shared[b] as SharedString);
          break;
        case "sm":
          shared[a] = SharedString.move(shared[b] as SharedString);
          break;
        case "sa":
          result.push(
            Number((shared[a] as SharedString).assign(shared[b] as SharedString) === shared[a]),
          );
          break;
        case "sma":
          result.push(
            Number((shared[a] as SharedString).moveAssign(shared[b] as SharedString) === shared[a]),
          );
          break;
        case "sx": {
          const value = shared[a] as SharedString;
          if (value.getData() !== null) viewIds.delete(value.getString());
          if (value.getDataIgnoreCase() !== null) viewIds.delete(value.getIgnoreCaseString());
          value.dispose();
          shared[a] = null;
          break;
        }
        case "eq":
          result.push(
            Number((shared[a] as SharedString).equals(shared[b] as SharedString)),
            Number((shared[a] as SharedString).notEquals(shared[b] as SharedString)),
          );
          break;
        case "sg":
          views[a] = (shared[b] as SharedString).getString();
          result.push(viewId(views[a] as OUStringConstReference));
          break;
        case "si":
          views[a] = (shared[b] as SharedString).getIgnoreCaseString();
          result.push(viewId(views[a] as OUStringConstReference));
          break;
        case "se": {
          const empty = SharedString.getEmptyString();
          views[a] = empty.getString();
          views[d] = empty.getIgnoreCaseString();
          result.push(
            Number(empty === SharedString.getEmptyString()),
            identify(empty.getData()),
            identify(empty.getDataIgnoreCase()),
            Number(empty.isValid()),
            Number(empty.isEmpty()),
            empty.getLength(),
            viewId(views[a] as OUStringConstReference),
            viewId(views[d] as OUStringConstReference),
          );
          break;
        }
        case "vg":
        case "og": {
          const value = op === "vg" ? (views[a] as OUStringConstReference) : (ou[a] as OUString);
          result.push(
            value.getLength(),
            Number(value.isEmpty()),
            Number(value.getStr() === (value.pData as rtl_uString).buffer),
            ...value.getStr().subarray(0, value.getLength() + 1),
          );
          break;
        }
        case "rn":
          rtl.rtl_uString_newFromStr_WithLength(raw[a] as rtl_uStringSlot, input, input.length);
          break;
        case "ri":
          rtl.rtl_uString_intern(raw[a] as rtl_uStringSlot, (ou[b] as OUString).pData);
          break;
        case "rx":
          rtl.rtl_uString_release((raw[a] as rtl_uStringSlot)[0] as rtl_uString);
          (raw[a] as rtl_uStringSlot)[0] = null;
          break;
        case "vd":
          views[a] = null;
          break;
        case "lg":
          result.push(
            literal.getLength(),
            Number(literal.getStr() === literal.more.buffer),
            Number(literal.str === literal.more),
            ...literal.getStr(),
          );
          break;
        default:
          throw new Error(`Unknown native caller ${op}`);
      }
      const actual: State = {
        ou: ou.map(
          /** Records all live value fields. @param value - Owner. @returns Data identity or absent-owner marker. */ (
            value,
          ) => (value === null ? -4 : identify(value.pData)),
        ),
        shared: shared.map(
          /** Records both fields and every native predicate. @param value - Owner. @returns Complete observation. */ (
            value,
          ) =>
            value === null
              ? null
              : [
                  identify(value.getData()),
                  identify(value.getDataIgnoreCase()),
                  Number(value.isValid()),
                  Number(value.isEmpty()),
                  value.getLength(),
                ],
        ),
        raw: raw.map(
          /** Records all raw caller slots. @param slot - Field. @returns Pointer identity. */ (
            slot,
          ) => identify(slot[0]),
        ),
        views: views.map(
          /** Records live held references even when their field is now null; never dereferences a native invalid view. @param value - Held reference. @returns View/pointer pair. */ (
            value,
          ) => (value === null ? null : [viewId(value), identify(value.pData)]),
        ),
        live: [
          row(-2, cppEmpty.pData, 0),
          row(-3, literal.str, literal.getLength()),
          row(0, EmptyStringImpl.data, 0),
          ...Array.from(
            live,
            /** Records complete allocated storage. @param pair - Allocation. @returns Data row. */ ([
              id,
              owned,
            ]) => row(id, owned.data, (owned.bytes - 10) / 2),
          ),
        ],
        events,
        result,
      };
      expect(actual, `native call ${index}: ${JSON.stringify(c)}`).toEqual(native.states[index]);
      events = [];
    }
    expect(live.size).toBe(0);
  } finally {
    Object.assign(rtl_stringAllocation, allocation);
  }
});

it("retains original constructor assertions and explicitly undefined native lifetime diagnoses", /** Checks actual fail-fast input and records UB without expecting synthetic outcomes. @returns Nothing. */ () => {
  for (const guard of native.guards) {
    expect(guard.signal).toBe("SIGABRT");
    expect(
      /** Invokes the exact original invalid constructor input. @returns Invalid owner construction. */ () =>
        guard.index === 0 ? new OUString(new Uint16Array([65, 0]), -1) : new OUString(null, 1),
    ).toThrow(guard.expression);
  }
  for (const diagnostic of native.diagnostics) {
    expect(diagnostic.definedResult).toBe(false);
    expect(diagnostic.marker).toMatch(/before/);
    expect(diagnostic.diagnostic).toMatch(/heap-use-after-free|null pointer/);
  }
  expect(
    native.compileGuards.map(
      /** Records original rejected native callers. @param guard - Compiler evidence. @returns Rejection. */ (
        guard,
      ) => guard.accepted,
    ),
  ).toEqual([false, false, false]);
  expect(native.compileGuards[0]?.name).toBe("unterminated-literal");
  expect(
    /** Invokes the exact original invalid constructor input. @returns Invalid owner construction. */ () =>
      new OUStringLiteral(new Uint16Array([65, 66])),
  ).toThrow("assert(literal[N - 1] == '\\0')");
});
