/** @fileoverview Replays full original OUString comparisons and cached-key value lifetimes without original source files. */
import { expect, it } from "vitest";
import { OUString, OUStringLiteral, OUStringHash } from "../../../sal/inc/rtl/ustring";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { rtl_stringAllocation } from "../../../sal/rtl/strimp.hxx";
import { EmptyStringImpl } from "../../../sal/rtl/strtmpl";
import { StringWithHash, hashStringWithHash } from "./sharedstringpool";
import captured from "./native-string-key-cases.json";
/** Complete initialized native data observation. */
type DataRow = [number, number, number, number, number[], number];
/** Full original call-boundary observation. */
interface State {
  ou: number[];
  keys: ([number, number] | null)[];
  live: DataRow[];
  events: number[][];
  result: string[];
}
/** Portable caller corpus, independent of original source files. */
interface Corpus {
  calls: { op: string; a: number; b: number; units: number[] }[];
  states: State[];
  diagnostics: { marker: string; diagnostic: string; definedResult: boolean }[];
}
const native = captured as unknown as Corpus;
it("matches full original cached-key lifetimes, collisions, signed hashes and OUString operators", /** Replays genuine native caller observations. @returns Nothing. */ () => {
  expect(native.calls).toHaveLength(native.states.length);
  expect(native.calls.length).toBeGreaterThan(8000);
  const ou: (OUString | null)[] = Array(8).fill(null);
  const keys: (StringWithHash | null)[] = Array(8).fill(null);
  const hasher = new OUStringHash();
  const literal = new OUStringLiteral(new Uint16Array([65, 0, 66, 0]));
  const cppEmpty = new OUString();
  const ids = new Map<rtl_uString, number>();
  const live = new Map<number, { data: rtl_uString; bytes: number }>();
  const allocation = { ...rtl_stringAllocation };
  let nextId = 1;
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
      const { op, a, b, units } = c;
      const input = new Uint16Array(units);
      let result: string[] = [];
      switch (op) {
        case "on":
          ou[a] = new OUString(input, input.length);
          break;
        case "od":
          ou[a] = new OUString();
          break;
        case "ol":
          ou[a] = new OUString(literal);
          break;
        case "oc":
          ou[a] = new OUString(ou[b] as OUString);
          break;
        case "ox":
          (ou[a] as OUString).dispose();
          ou[a] = null;
          break;
        case "kn":
          keys[a] = new StringWithHash(ou[b] as OUString);
          break;
        case "kc":
          keys[a] = new StringWithHash(keys[b] as StringWithHash);
          break;
        case "knm":
          keys[a] = StringWithHash.fromMovedString(ou[b] as OUString);
          break;
        case "km":
          keys[a] = StringWithHash.move(keys[b] as StringWithHash);
          break;
        case "ka":
          result.push(
            String(
              Number((keys[a] as StringWithHash).assign(keys[b] as StringWithHash) === keys[a]),
            ),
          );
          break;
        case "kma":
          result.push(
            String(
              Number((keys[a] as StringWithHash).moveAssign(keys[b] as StringWithHash) === keys[a]),
            ),
          );
          break;
        case "kx":
          (keys[a] as StringWithHash).dispose();
          keys[a] = null;
          break;
        case "keq": {
          const x = keys[a] as StringWithHash,
            y = keys[b] as StringWithHash;
          result = [
            String(Number(x.equals(y))),
            String(hashStringWithHash(x)),
            String(hashStringWithHash(y)),
          ];
          break;
        }
        case "cache":
          (keys[a] as StringWithHash).hashCode = b;
          break;
        case "ks":
          (keys[a] as StringWithHash).str.assign(ou[b] as OUString);
          break;
        case "cmp": {
          const x = ou[a] as OUString,
            y = ou[b] as OUString;
          result = [
            x.compareTo(y),
            x.reverseCompareTo(y),
            Number(x.equals(y)),
            Number(x.equals(y)),
            Number(x.notEquals(y)),
            Number(x.lessThan(y)),
            Number(x.greaterThan(y)),
            Number(x.lessThanOrEqual(y)),
            Number(x.greaterThanOrEqual(y)),
            x.hashCode(),
            y.hashCode(),
            hasher.call(x),
            hasher.call(y),
          ].map(String);
          break;
        }
        case "borrow": {
          const x = OUString.unacquired([(keys[a] as StringWithHash).str.pData]),
            y = OUString.unacquired([(keys[b] as StringWithHash).str.pData]);
          result = [
            x.compareTo(y),
            x.reverseCompareTo(y),
            Number(x.equals(y)),
            x.hashCode(),
            hasher.call(x),
          ].map(String);
          break;
        }
        default:
          throw new Error(`Unknown native caller ${op}`);
      }
      const actual: State = {
        ou: ou.map(
          /** Records concrete owner pointer. @param value - Owner. @returns Identity. */ (
            value,
          ) => (value === null ? -4 : identify(value.pData)),
        ),
        keys: keys.map(
          /** Records original owned member and cached scalar. @param value - Key. @returns Complete key observation. */ (
            value,
          ) => (value === null ? null : [identify(value.str.pData), value.hashCode]),
        ),
        live: [
          row(-2, cppEmpty.pData, 0),
          row(-3, literal.str, literal.getLength()),
          row(0, EmptyStringImpl.data, 0),
          ...Array.from(
            live,
            /** Records full initialized allocated storage. @param pair - Allocation. @returns Complete row. */ ([
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
it("retains the original invalid reference diagnosis without inventing a defined hash result", /** Checks captured native undefined-input evidence. @returns Nothing. */ () => {
  expect(native.diagnostics).toEqual([
    { marker: "before-invalid-reference-hash", diagnostic: "null pointer", definedResult: false },
  ]);
});
