/** @fileoverview Original Reference.h/hxx direct pointer ownership and implicit value operations; query/throwing/Any/interface-identity comparison families remain separate unfinished responsibilities. */
import type { __sal_NoAcquire } from "../../../../../../sal/inc/types";
import type { XInterface } from "./XInterface";
/** Existing direct ownership members use the original common interface contract's two selected virtual methods, without requiring a query provider. */
type InterfacePointer = Pick<XInterface, "acquire" | "release">;
/** Original deprecated no-acquire discriminator. */
export enum UnoReference_NoAcquire {
  UNO_REF_NO_ACQUIRE,
}
/** Original unscoped enumerator. */
export const UNO_REF_NO_ACQUIRE = UnoReference_NoAcquire.UNO_REF_NO_ACQUIRE;
/** Original one-pointer base with its direct borrowed pointer and null predicates. Query and comparison members are not implemented by alternate pointer algorithms. */
export class BaseReference {
  protected _pInterface!: InterfacePointer | null;
  /** Original unacquired pointer read. @returns Borrowed interface. */
  get(): InterfacePointer | null {
    return this._pInterface;
  }
  /** Original null predicate. @returns Whether this pointer is non-null. */
  is(): boolean {
    return this._pInterface !== null;
  }
  /** Original explicit Boolean operator calls is(). @returns Original predicate. */
  operatorBool(): boolean {
    return this.is();
  }
}
/** Original Reference direct ownership members share the one actual base pointer. Native casts are JS identity for actual logical caller pointers; physical multiple-inheritance pointer adjustment is unverified. */
export class Reference<T extends InterfacePointer = InterfacePointer> extends BaseReference {
  /** Original selected default/copy/pointer/no-acquire overloads. @param args - Actual overload arguments. @returns Initialized owner. */
  constructor(
    ...args:
      | []
      | [value: Reference<T> | T | null]
      | [value: T | null, noAcquire: __sal_NoAcquire | UnoReference_NoAcquire]
  ) {
    super();
    if (args.length === 0) this._pInterface = null;
    else {
      const value = args[0];
      this._pInterface = value instanceof Reference ? value._pInterface : value;
      if (args.length === 1 && this._pInterface !== null) this._pInterface.acquire();
    }
  }
  /** Original internal move construction transfers and clears the source pointer. @param source - Rvalue owner. @returns New value. */
  static move<T extends InterfacePointer>(source: Reference<T>): Reference<T> {
    const result = Object.create(Reference.prototype) as Reference<T>;
    result._pInterface = source._pInterface;
    source._pInterface = null;
    return result;
  }
  /** Original castFromXInterface borrowed pointer. @returns Same logical pointer. */
  override get(): T | null {
    return this._pInterface as T | null;
  }
  /** Original destructor does not clear the field before releasing it. @returns Nothing. */
  dispose(): void {
    if (this._pInterface !== null) this._pInterface.release();
  }
  /** Original clear publishes null before virtual release. @returns Nothing. */
  clear(): void {
    if (this._pInterface !== null) {
      const old = this._pInterface;
      this._pInterface = null;
      old.release();
    }
  }
  /** Original pointer/reference and no-acquire set overloads; acquire precedes publication and old release. @param value - Original source. @param noAcquire - Original ownership-transfer discriminator. @returns Whether source is non-null. */
  set(
    value: Reference<T> | T | null,
    noAcquire?: __sal_NoAcquire | UnoReference_NoAcquire,
  ): boolean {
    const pointer = value instanceof Reference ? value._pInterface : value;
    if (noAcquire === undefined && pointer !== null) pointer.acquire();
    const old = this._pInterface;
    this._pInterface = pointer;
    if (old !== null) old.release();
    return pointer !== null;
  }
  /** Original copy assignment uses set even for the same owner/pointer. @param value - Right side. @returns This same owner. */
  assign(value: Reference<T> | T | null): this {
    this.set(value);
    return this;
  }
  /** Original internal move assignment releases left, transfers right, then clears right; this is not a swap. @param value - Rvalue right side. @returns This same owner. */
  moveAssign(value: Reference<T>): this {
    if (this._pInterface !== null) this._pInterface.release();
    this._pInterface = value._pInterface;
    value._pInterface = null;
    return this;
  }
}
