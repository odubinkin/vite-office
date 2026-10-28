/** @fileoverview Original COW ownership, detach, optional and move behavior using a concrete caller value type, without replacing framework/reference providers. */
import { expect, it } from "vitest";
import {
  cow_wrapper,
  UnsafeRefCountingPolicy,
  ThreadSafeRefCountingPolicy,
  type CowValueType,
} from "./cow_wrapper";
it.each([UnsafeRefCountingPolicy, ThreadSafeRefCountingPolicy])(
  "preserves shared ownership and detaches only mutable access for %s",
  /** Actual selected T constructors/destructor expose their source lifetime effects. @param policy - Original policy. @returns Nothing. */ (
    policy,
  ) => {
    const destroyed: number[] = [],
      type: CowValueType<{ value: number }> = {
        /** Actual caller T default construction. @returns Value. */ create() {
          return { value: 0 };
        },
        /** Actual caller T copy construction. @param value - Borrowed source. @returns Copy. */ copy(
          value,
        ) {
          return { ...value };
        },
        /** Actual caller T destructor observer. @param value - Owned value. @returns Nothing. */ destroy(
          value,
        ) {
          destroyed.push(value.value);
        },
      },
      C = cow_wrapper.specialize(type, policy),
      a = new C(),
      b = new C(a),
      c = new C();
    try {
      expect(cow_wrapper.specialize(type, policy)).toBe(C);
      expect(a.is_unique()).toBe(false);
      expect(a.use_count()).toBe(2n);
      expect(a.same_object(b)).toBe(true);
      expect(a.const_get()).toBe(b.const_get());
      c.assign(a);
      expect(destroyed).toEqual([0]);
      expect(a.use_count()).toBe(3n);
      b.get().value = 7;
      expect(b.is_unique()).toBe(true);
      expect(b.same_object(a)).toBe(false);
      expect(a.use_count()).toBe(2n);
      expect(a.const_get().value).toBe(0);
      expect(b.const_get().value).toBe(7);
      c.dispose();
      expect(a.is_unique()).toBe(true);
      a.assign(a);
      a.make_unique().value = 5;
      expect(a.use_count()).toBe(1n);
      const word = new BigUint64Array([0xffffffffffffffffn]);
      policy.incrementCount(word);
      expect(policy.getCount(word)).toBe(0n);
      expect(policy.decrementCount(word)).toBe(true);
      expect(policy.getCount(word)).toBe(0xffffffffffffffffn);
    } finally {
      c.dispose();
      b.dispose();
      a.dispose();
    }
    expect(destroyed).toEqual([0, 7, 5]);
  },
);
it("preserves nullable optional copying, moves, swaps and original self-move emptying", /** Original moved-from/optional states are not read as T values. @returns Nothing. */ () => {
  let destroyed = 0;
  const type: CowValueType<{ value: number }> = {
      /** Caller default value. @returns Value. */ create() {
        return { value: 1 };
      },
      /** Caller copy constructor. @param value - Borrowed value. @returns Copy. */ copy(value) {
        return { ...value };
      },
      /** Caller destructor. @returns Nothing. */ destroy() {
        ++destroyed;
      },
    },
    C = cow_wrapper.specialize(type),
    a = new C(),
    optional = new C(null),
    nullableCopy = new C(optional, null),
    held = new C(a, null),
    moved = cow_wrapper.move(held);
  try {
    expect(optional.empty()).toBe(true);
    expect(optional.use_count()).toBe(0n);
    expect(optional.is_unique()).toBe(true);
    expect(optional.same_object(nullableCopy)).toBe(true);
    optional.set_empty();
    expect(held.empty()).toBe(true);
    expect(moved.use_count()).toBe(2n);
    optional.swap(moved);
    expect(moved.empty()).toBe(true);
    expect(optional.const_get().value).toBe(1);
    optional.moveAssign(optional);
    expect(optional.empty()).toBe(true);
    expect(a.use_count()).toBe(1n);
    moved.moveAssign(a);
    expect(a.empty()).toBe(true);
    moved.moveAssign(moved);
    expect(moved.empty()).toBe(true);
    expect(destroyed).toBe(1);
    const fresh = new C();
    nullableCopy.assign(fresh);
    fresh.set_empty();
    expect(nullableCopy.use_count()).toBe(1n);
    nullableCopy.set_empty();
    expect(destroyed).toBe(2);
  } finally {
    moved.dispose();
    held.dispose();
    optional.dispose();
    nullableCopy.dispose();
    a.dispose();
  }
});
it("leaves the original shared value intact when T copy construction throws", /** Copy failure occurs before release, exactly in make_unique. @returns Nothing. */ () => {
  const failure = new Error("copy"),
    type: CowValueType<{ value: number }> = {
      /** Caller default constructor. @returns Value. */ create() {
        return { value: 1 };
      },
      /** Caller throwing copy constructor. @returns Never. */ copy() {
        throw failure;
      },
      /** Caller trivial destructor. @returns Nothing. */ destroy() {},
    },
    C = cow_wrapper.specialize(type),
    a = new C(),
    b = new C(a);
  try {
    expect(/** Calls original detach. @returns Value. */ () => b.make_unique()).toThrow(failure);
    expect(a.same_object(b)).toBe(true);
    expect(a.use_count()).toBe(2n);
  } finally {
    b.dispose();
    a.dispose();
  }
});
