/** @fileoverview Managed control-block binding for the consumed std::shared_ptr<LanguageTagImpl> operations; native atomic/control-block layout is not reproduced. */
/** Actual implementation value destructor required by the original shared pointer. */
export interface ImplementationValue {
  /** Releases original owned fields. @returns Nothing. */ dispose(): void;
}
const references = new WeakMap<ImplementationValue, number>();
/** Owned logical implementation pointer, with original copy/reset/get/destruction semantics. */
export class ImplPtr<T extends ImplementationValue> {
  private value: T | null = null;
  /** Retains a newly created or already managed implementation value. @param value - Original implementation or null. @returns Owned pointer. */
  constructor(value: T | null = null) {
    this.reset(value);
  }
  /** Original borrowed get. @returns Value or null. */
  get(): T | null {
    return this.value;
  }
  /** Original shared copy construction. @returns Independent owned pointer to the same value. */
  copy(): ImplPtr<T> {
    return new ImplPtr(this.value);
  }
  /** Original copy assignment retains before releasing the previous value. @param other - Borrowed source pointer. @returns Nothing. */
  assign(other: ImplPtr<T>): void {
    this.reset(other.get());
  }
  /** Original pointer reset/assignment and last-reference destruction. @param value - Replacement original value or null. @returns Nothing. */
  reset(value: T | null = null): void {
    if (value === this.value) return;
    if (value) references.set(value, (references.get(value) ?? 0) + 1);
    const previous = this.value;
    this.value = value;
    if (previous) {
      const count = (references.get(previous) as number) - 1;
      if (count === 0) {
        references.delete(previous);
        previous.dispose();
      } else references.set(previous, count);
    }
  }
  /** Binding for original shared_ptr destruction. @returns Nothing. */
  dispose(): void {
    this.reset();
  }
}
