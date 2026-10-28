/** @fileoverview Original consumed cow_wrapper ownership, copy-on-write and optional/move algorithms. Explicit specialization binds erased T construction/copy/destruction and MTPolicy; value/rvalue T constructors and nonmember value comparisons remain unported. Counters represent the pinned 64-bit size_t; native cross-thread object/ABI behavior is unverified. */
/** Original compiler-selected T operations after template erasure; callers supply actual value operations rather than replacement data providers. */
export interface CowValueType<T> {
  /** Original T default constructor. @returns Actual value. */
  create(): T;
  /** Original T copy constructor. @param value - Borrowed source. @returns Independent copy. */
  copy(value: Readonly<T>): T;
  /** Original T destructor. @param value - Owned value. @returns Nothing. */
  destroy(value: T): void;
}
/** Original selected RefCountingPolicy_t operations over the pinned size_t word. */
export interface RefCountingPolicy {
  incrementCount(count: BigUint64Array): void;
  decrementCount(count: BigUint64Array): boolean;
  getCount(count: BigUint64Array): bigint;
}
/** Original plain size_t policy. */
export const UnsafeRefCountingPolicy: RefCountingPolicy = {
  /** Original increment. @param count - Actual word. @returns Nothing. */
  incrementCount(count) {
    count[0] = (count[0] as bigint) + 1n;
  },
  /** Original decrement/nonzero result. @param count - Actual word. @returns Whether still shared. */
  decrementCount(count) {
    count[0] = (count[0] as bigint) - 1n;
    return count[0] !== 0n;
  },
  /** Original count read. @param count - Actual word. @returns Count. */
  getCount(count) {
    return count[0] as bigint;
  },
};
/** Original atomic size_t policy; the synchronous host does not claim native shared-object/thread transport. */
export const ThreadSafeRefCountingPolicy: RefCountingPolicy = {
  /** Original atomic increment. @param count - Actual word. @returns Nothing. */
  incrementCount(count) {
    Atomics.add(count, 0, 1n);
  },
  /** Original atomic decrement/nonzero result. @param count - Actual word. @returns Whether still shared. */
  decrementCount(count) {
    return BigInt.asUintN(64, Atomics.sub(count, 0, 1n) - 1n) !== 0n;
  },
  /** Original atomic read. @param count - Actual word. @returns Count. */
  getCount(count) {
    return Atomics.load(count, 0);
  },
};
/** Original impl_t owns T by value and its actual policy count. */
interface Impl<T> {
  m_value: T;
  m_ref_count: BigUint64Array;
}
/** Erased compiler specialization. */
export interface CowConstructor<T> {
  new (
    ...args:
      [] | [source: cow_wrapper<T>] | [empty: null] | [source: cow_wrapper<T>, optional: null]
  ): cow_wrapper<T>;
  readonly ValueType: CowValueType<T>;
  readonly Policy: RefCountingPolicy;
}
/** Original compiler-specialization identity, independent of instantiated values. */
const specializations: { value: unknown; policy: RefCountingPolicy; constructor: unknown }[] = [];
/** Original selected template owner. Its only instance field is the actual impl pointer. */
export abstract class cow_wrapper<T> {
  private m_pimpl: Impl<T> | null;
  /** Binds native T and policy template arguments once. @param value - Actual T operations. @param policy - Original default plain policy. @returns Stable specialization. */
  static specialize<T>(
    value: CowValueType<T>,
    policy: RefCountingPolicy = UnsafeRefCountingPolicy,
  ): CowConstructor<T> {
    const existing = specializations.find(
      /** Selects original template argument identities. @param entry - Compiler binding. @returns Match. */ (
        entry,
      ) => entry.value === value && entry.policy === policy,
    );
    if (existing) return existing.constructor as CowConstructor<T>;
    const body = /** Original compiler-emitted template specialization. */ class extends cow_wrapper<T> {};
    Object.defineProperties(body, { ValueType: { value }, Policy: { value: policy } });
    specializations.push({ value, policy, constructor: body });
    return body as unknown as CowConstructor<T>;
  }
  /** Original default/copy/nullopt/nullable-copy constructors. @param args - Selected original overload. @returns Wrapper. */
  constructor(
    ...args:
      [] | [source: cow_wrapper<T>] | [empty: null] | [source: cow_wrapper<T>, optional: null]
  ) {
    const type = this.constructor as CowConstructor<T>;
    if (args.length === 0)
      this.m_pimpl = { m_value: type.ValueType.create(), m_ref_count: new BigUint64Array([1n]) };
    else if (args[0] === null) this.m_pimpl = null;
    else {
      this.m_pimpl = args[0].m_pimpl;
      if (args.length === 1 || this.m_pimpl !== null)
        type.Policy.incrementCount((this.m_pimpl as Impl<T>).m_ref_count);
    }
  }
  /** Original release deletes T only at the last policy reference. @returns Nothing. */
  private release(): void {
    const type = this.constructor as CowConstructor<T>;
    if (this.m_pimpl !== null && !type.Policy.decrementCount(this.m_pimpl.m_ref_count)) {
      type.ValueType.destroy(this.m_pimpl.m_value);
      this.m_pimpl = null;
    }
  }
  /** Explicit native destructor binding; the dead host wrapper pointer is cleared for repeated host cleanup, without changing shared T ownership. @returns Nothing. */
  dispose(): void {
    this.release();
    this.m_pimpl = null;
  }
  /** Original shallow move construction, without default constructing T. @param source - Actual rvalue wrapper. @returns Transferred wrapper. */
  static move<T>(source: cow_wrapper<T>): cow_wrapper<T> {
    const result = Object.create(Object.getPrototypeOf(source)) as cow_wrapper<T>;
    result.m_pimpl = source.m_pimpl;
    source.m_pimpl = null;
    return result;
  }
  /** Original increment-before-release protects self-assignment. @param source - Borrowed wrapper. @returns This wrapper. */
  assign(source: cow_wrapper<T>): this {
    const type = this.constructor as CowConstructor<T>;
    type.Policy.incrementCount((source.m_pimpl as Impl<T>).m_ref_count);
    this.release();
    this.m_pimpl = source.m_pimpl;
    return this;
  }
  /** Original move assignment deliberately empties self on self-move. @param source - Rvalue wrapper. @returns This wrapper. */
  moveAssign(source: cow_wrapper<T>): this {
    this.release();
    this.m_pimpl = source.m_pimpl;
    source.m_pimpl = null;
    return this;
  }
  /** Original copy first, then release and replace; throwing T copy leaves the old owner intact. @returns Mutable unique T. */
  make_unique(): T {
    const type = this.constructor as CowConstructor<T>;
    if (type.Policy.getCount((this.m_pimpl as Impl<T>).m_ref_count) > 1n) {
      const copy: Impl<T> = {
        m_value: type.ValueType.copy((this.m_pimpl as Impl<T>).m_value),
        m_ref_count: new BigUint64Array([1n]),
      };
      this.release();
      this.m_pimpl = copy;
    }
    return (this.m_pimpl as Impl<T>).m_value;
  }
  /** Original null-or-one uniqueness. @returns Whether unique or empty. */
  is_unique(): boolean {
    return (
      this.m_pimpl === null ||
      (this.constructor as CowConstructor<T>).Policy.getCount(this.m_pimpl.m_ref_count) === 1n
    );
  }
  /** Original null-or-policy count. @returns Pinned size_t value. */
  use_count(): bigint {
    return this.m_pimpl === null
      ? 0n
      : (this.constructor as CowConstructor<T>).Policy.getCount(this.m_pimpl.m_ref_count);
  }
  /** Original pointer swap. @param other - Actual wrapper. @returns Nothing. */
  swap(other: cow_wrapper<T>): void {
    const previous = this.m_pimpl;
    this.m_pimpl = other.m_pimpl;
    other.m_pimpl = previous;
  }
  /** Original mutable get/operator access. @returns Unique mutable value. */
  get(): T {
    return this.make_unique();
  }
  /** Original const get/operator* binding performs no detach; nonempty is the native precondition. @returns Borrowed T. */
  const_get(): Readonly<T> {
    return (this.m_pimpl as Impl<T>).m_value;
  }
  /** Original shared impl-pointer comparison. @param other - Actual wrapper. @returns Whether shared, including both empty. */
  same_object(other: cow_wrapper<T>): boolean {
    return this.m_pimpl === other.m_pimpl;
  }
  /** Original optional empty predicate. @returns Whether empty. */
  empty(): boolean {
    return this.m_pimpl === null;
  }
  /** Original optional reset. @returns Nothing. */
  set_empty(): void {
    if (this.m_pimpl !== null) {
      this.release();
      this.m_pimpl = null;
    }
  }
}
