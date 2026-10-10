/** @fileoverview Replays complete genuine native delayed vector snapshots and independent borrowed front-offset contracts. */
import { describe, expect, it } from "vitest";
import fixture from "./native-delayed-vector-cases.json";
import {
  delayed_delete_vector,
  type DelayedVectorValue,
  type delayed_delete_vector_iterator,
} from "./delayed_delete_vector.ts";

/** Collects the original half-open forward or reverse range. @param first - Begin. @param last - End. @returns Scalars. */
function collect<T extends DelayedVectorValue>(
  first: delayed_delete_vector_iterator<T>,
  last: delayed_delete_vector_iterator<T>,
): T[] {
  const result: T[] = [];
  for (; !first.equals(last); first.advance(1)) result.push(first.get());
  return result;
}
/** Normalizes native int64 text encoding. @param value - Scalar. @returns Portable scalar. */
function normalize(value: DelayedVectorValue): number | boolean | string {
  return typeof value === "bigint" ? value.toString() : value;
}
/** Observes complete native public storage in both directions. @param vector - Owner. @returns Snapshot. */
function snapshot(vector: delayed_delete_vector<DelayedVectorValue>) {
  return [
    vector.size(),
    vector.capacity(),
    collect(vector.begin(), vector.end()).map(normalize),
    collect(vector.rbegin(), vector.rend()).map(normalize),
  ];
}
describe("original delayed_delete_vector", /** Defines original storage contracts. @returns Nothing. */ () => {
  it("matches every unchanged native scalar sequence and complete snapshot", /** Replays every native step and full observation. @returns Nothing. */ () => {
    let observed = 0;
    for (const sample of fixture.cases) {
      const zero: DelayedVectorValue =
        sample.kind === "bool"
          ? false
          : sample.kind === "string"
            ? ""
            : sample.kind === "int64"
              ? 0n
              : 0;
      const value =
        /** Constructs actual scalar specialization values at the call boundary. @param n - Native input. @returns Scalar. */ (
          n: number,
        ): DelayedVectorValue =>
          sample.kind === "bool"
            ? Boolean(n)
            : sample.kind === "string"
              ? String(n)
              : sample.kind === "int64"
                ? BigInt(n)
                : n;
      const a: delayed_delete_vector<DelayedVectorValue>[] = [
        new delayed_delete_vector<DelayedVectorValue>(zero),
        new delayed_delete_vector<DelayedVectorValue>(zero),
      ];
      for (const [index, operation] of sample.operations.entries()) {
        const [op, t, n, v, start, len] = operation as [
          string,
          number,
          number,
          number,
          number,
          number,
        ];
        const vector = a[t] as delayed_delete_vector<DelayedVectorValue>;
        let result: number | boolean | string | null = null;
        if (op === "F") a[t] = new delayed_delete_vector(zero, n, value(v));
        else if (op === "N") a[t] = new delayed_delete_vector(zero, n);
        else if (op === "C")
          a[t] = new delayed_delete_vector(zero, a[n] as delayed_delete_vector<DelayedVectorValue>);
        else if (op === "A") vector.copy_assign(a[n] as delayed_delete_vector<DelayedVectorValue>);
        else if (op === "S") vector.swap(a[n] as delayed_delete_vector<DelayedVectorValue>);
        else if (op === "P") vector.push_back(value(n));
        else if (op === "B") vector.emplace_back(value(n));
        else if (op === "E" || op === "G")
          result =
            vector.erase(
              vector.begin().advance(n),
              op === "G" ? vector.begin().advance(n + v) : undefined,
            ).position - vector.begin().position;
        else if (op === "I" || op === "M")
          result =
            (
              vector.insert(
                vector.begin().advance(n),
                value(v),
              ) as delayed_delete_vector_iterator<DelayedVectorValue>
            ).position - vector.begin().position;
        else if (op === "K") {
          const borrowed = vector.begin().advance(n);
          result = normalize(borrowed.get());
          vector.swap(a[1 - t] as delayed_delete_vector<DelayedVectorValue>);
          borrowed.set(value(v));
        } else if (op === "Q") {
          const pointer = sample.kind === "bool" ? vector.begin() : vector.data();
          result = normalize(pointer.get());
          pointer.set(value(n));
        } else if (op === "J")
          vector.insert(
            vector.begin().advance(n),
            (a[v] as delayed_delete_vector<DelayedVectorValue>).begin().advance(start),
            (a[v] as delayed_delete_vector<DelayedVectorValue>).begin().advance(start + len),
          );
        else if (op === "U" || op === "V") {
          const first = (a[n] as delayed_delete_vector<DelayedVectorValue>).begin().advance(v);
          const last = first.copy().advance(start);
          if (op === "U") a[t] = new delayed_delete_vector(zero, first, last);
          else vector.assign(first, last);
        } else if (op === "Z") vector.resize(n);
        else if (op === "R") vector.reserve(n);
        else if (op === "H") vector.shrink_to_fit();
        else if (op === "D") vector.set(n, value(v));
        else {
          try {
            result = normalize(vector.at(n));
          } catch (error) {
            expect(error).toBeInstanceOf(RangeError);
            result = -1;
          }
        }
        expect(
          [
            result,
            snapshot(a[0] as delayed_delete_vector<DelayedVectorValue>),
            snapshot(a[1] as delayed_delete_vector<DelayedVectorValue>),
            (a[0] as delayed_delete_vector<DelayedVectorValue>).equals(
              a[1] as delayed_delete_vector<DelayedVectorValue>,
            ),
          ],
          `${sample.kind} sequence ${observed} step ${index} ${operation}`,
        ).toEqual([
          sample.steps[index]?.[0],
          fixture.snapshots[sample.steps[index]?.[1] as number],
          fixture.snapshots[sample.steps[index]?.[2] as number],
          sample.steps[index]?.[3],
        ]);
      }
      ++observed;
    }
    expect(observed).toBe(fixture.cases.length);
  });
  it("retains delayed entries, range erasure and original vector-only swap offsets", /** Checks independent alias and offset behavior. @returns Nothing. */ () => {
    const a = new delayed_delete_vector<number>(0, [1, 2, 3, 4]);
    const b = new delayed_delete_vector<number>(0, [7, 8, 9, 10]);
    a.erase(a.begin());
    expect(a.size()).toBe(3);
    const returned = a.insert(a.begin(), [5, 6]);
    expect(returned).toBeUndefined();
    expect(collect(a.begin(), a.end())).toEqual([5, 6, 2, 3, 4]);
    a.assign([1, 2, 3, 4]);
    const borrowed = a.begin().advance(2);
    a.erase(a.begin());
    a.swap(b);
    expect(collect(a.begin(), a.end())).toEqual([8, 9, 10]);
    expect(collect(b.begin(), b.end())).toEqual([1, 2, 3, 4]);
    expect(borrowed.get()).toBe(3);
    borrowed.set(31);
    expect(b.get(2)).toBe(31);
    a.data().set(81);
    expect(a.at(0)).toBe(81);
    a.rbegin().set(101);
    expect(a.rbegin().copy().get()).toBe(101);
    expect(a.begin().equals(b.begin())).toBe(false);
    a.reserve(0);
    expect(a.begin().position).toBe(0);
    expect(
      /** Calls checked negative offset after front reset. @returns Scalar or throws. */ () =>
        a.at(-1),
    ).toThrow(RangeError);
    const c = new delayed_delete_vector<number>(0, [1, 2]);
    const d = new delayed_delete_vector<number>(0, [1, 3]);
    expect(c.equals(d)).toBe(false);
    d.set(1, 2);
    expect(c.equals(d)).toBe(true);
  });
});
