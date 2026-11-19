/** @fileoverview Compiler binding for consumed source std::shared_ptr copies/moves and last-owner destruction; actual concrete source values are supplied by callers, never manufactured here. Physical atomic/control-block/aliasing/weak-pointer ABI is unqualified. */
/** Original concrete destructor at the erased template boundary. */
export interface SharedValue {
  /** Destroys actual source members. @returns Nothing. */ dispose(): void;
}
/** One actual source allocation and its shared ownership count. */
interface Control<T extends SharedValue> {
  readonly value: T;
  count: number;
}
/** Original consumed strong-pointer operations in a synchronous realm. */
export class SharedReference<T extends SharedValue> {
  private control: Control<T> | null;
  /** Original empty, raw new-allocation adoption or shared copy. @param value - Actual new value or existing shared owner. @returns Owned handle. */
  constructor(value: T | SharedReference<T> | null = null) {
    this.control =
      value instanceof SharedReference
        ? value.control
        : value === null
          ? null
          : { value, count: 1 };
    if (value instanceof SharedReference && this.control !== null) ++this.control.count;
  }
  /** Original borrowed pointee. @returns Source value or null. */ get(): T | null {
    return this.control?.value ?? null;
  }
  /** Original boolean conversion. @returns Nonnull. */ is(): boolean {
    return this.control !== null;
  }
  /** Original use_count. @returns Logical strong-owner count. */ use_count(): number {
    return this.control?.count ?? 0;
  }
  /** Original dereference requires a nonempty pointer. @returns Borrowed source value. */ operatorStar(): T {
    return (this.control as Control<T>).value;
  }
  /** Original copy assignment retains new ownership before old destruction, including self-assignment. @param source - Borrowed shared pointer. @returns This owner. */
  assign(source: SharedReference<T>): this {
    const next = source.control;
    if (next !== null) ++next.count;
    const old = this.control;
    this.control = next;
    if (old !== null && --old.count === 0) old.value.dispose();
    return this;
  }
  /** Original move constructor empties the source without acquisition. @param source - Actual rvalue. @returns Moved owner. */
  static move<T extends SharedValue>(source: SharedReference<T>): SharedReference<T> {
    const result = new SharedReference<T>();
    result.control = source.control;
    source.control = null;
    return result;
  }
  /** Original move assignment follows temporary-move/swap, including self-move. @param source - Actual rvalue. @returns This owner. */
  moveAssign(source: SharedReference<T>): this {
    const moved = SharedReference.move(source),
      old = this.control;
    this.control = moved.control;
    moved.control = old;
    moved.dispose();
    return this;
  }
  /** Original reset-to-empty nulls the pointer before deleting the last pointee. @returns Nothing. */ reset(): void {
    const old = this.control;
    this.control = null;
    if (old !== null && --old.count === 0) old.value.dispose();
  }
  /** Original strong-count destruction helper. @returns Nothing. */ private release(): void {
    if (this.control !== null && --this.control.count === 0) this.control.value.dispose();
  }
  /** Original shared pointer destructor; repeated destruction is outside the C++ lifetime contract. @returns Nothing. */ dispose(): void {
    this.release();
  }
}
