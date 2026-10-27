/** @fileoverview Original Reference.h/hxx pointer ownership, query/throwing and interface identity operations through actual shared owners; physical ordering/hash/ostream and native compile-only casts remain separate responsibilities. */
import { SAL_NO_ACQUIRE } from "../../../../../../sal/inc/types";
import { Any } from "./Any";
import { Type } from "./Type";
import { RuntimeException } from "./RuntimeException";
import { OUString } from "../../../../../../sal/inc/rtl/ustring";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import { getTypeFavourUnsigned } from "../../../../unotype";
import type { UnoTypeArgument } from "../../../../unotype";
import type { typelib_TypeDescriptionReference as R } from "../../../../typelib/typedescription";
import {
  cppu_unsatisfied_iquery_msg,
  cppu_unsatisfied_iset_msg,
} from "../../../../../source/cppu/cppu_opt";
import type { __sal_NoAcquire } from "../../../../../../sal/inc/types";
import type { XInterface } from "./XInterface";
/** Existing direct ownership members use the original common interface contract's two selected virtual methods, without requiring a query provider. */
type InterfacePointer = Pick<XInterface, "acquire" | "release">;
/** Compiler address identity of the existing sole pointer field; these borrowed views own no interface and add no second pointer/count/type provider. */
const referenceAddresses = new WeakMap<BaseReference, [InterfacePointer | null]>();
/** Original deprecated no-acquire discriminator. */
export enum UnoReference_NoAcquire {
  UNO_REF_NO_ACQUIRE,
}
/** Original unscoped enumerator. */
export const UNO_REF_NO_ACQUIRE = UnoReference_NoAcquire.UNO_REF_NO_ACQUIRE;
/** Original separate enum type/value retained after C++ overload erasure; tuple spelling preserves its zero value without collision with native NoAcquire. */
export const UnoReference_Query = Object.freeze({
  UNO_QUERY: Object.freeze(["UnoReference_Query", 0] as const),
});
/** Original declared query enum. */
export type UnoReference_Query = typeof UnoReference_Query.UNO_QUERY;
/** Original unscoped query enumerator. */
export const UNO_QUERY = UnoReference_Query.UNO_QUERY;
/** Original distinct throwing query enum; its source value is also zero. */
export const UnoReference_QueryThrow = Object.freeze({
  UNO_QUERY_THROW: Object.freeze(["UnoReference_QueryThrow", 0] as const),
});
/** Original declared throwing query enum. */
export type UnoReference_QueryThrow = typeof UnoReference_QueryThrow.UNO_QUERY_THROW;
/** Original unscoped throwing query enumerator. */
export const UNO_QUERY_THROW = UnoReference_QueryThrow.UNO_QUERY_THROW;
/** Original distinct throwing set enum; no source numeric policy is changed. */
export const UnoReference_SetThrow = Object.freeze({
  UNO_SET_THROW: Object.freeze(["UnoReference_SetThrow", 0] as const),
});
/** Original declared throwing set enum. */
export type UnoReference_SetThrow = typeof UnoReference_SetThrow.UNO_SET_THROW;
/** Original unscoped throwing set enumerator. */
export const UNO_SET_THROW = UnoReference_SetThrow.UNO_SET_THROW;
/** Original C++ overload tag types after erasure. */
type ReferenceTag =
  | __sal_NoAcquire
  | UnoReference_NoAcquire
  | UnoReference_Query
  | UnoReference_QueryThrow
  | UnoReference_SetThrow;
/** Original overload-specific source interface selection; no query/type/provider is manufactured. @param source - Actual caller value. @returns Original borrowed interface or null. */
function querySource(source: BaseReference | Any | InterfacePointer | null): XInterface | null {
  if (source instanceof BaseReference) return source.get() as XInterface | null;
  if (source instanceof Any)
    return (source.pType as R).eTypeClass === C.INTERFACE
      ? (source.pReserved as XInterface | null)
      : null;
  return source as XInterface | null;
}
/** Original one-pointer base with its direct borrowed pointer and null predicates. Identity queries use actual returned Any owners; no pointer ordering or identity conversion algorithm is invented. */
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
  /** Original protected static query body; explicit exposure adapts source helper access only. Exceptions propagate and the actual returned Any is destructed after interface ownership transfer. @param pointer - Source interface or null. @param type - Original demanded borrowed Type. @returns Original acquired result or null. */
  static iquery(pointer: XInterface | null, type: Type): XInterface | null {
    if (pointer !== null) {
      const returned = pointer.queryInterface(type);
      try {
        if ((returned.pType as R).eTypeClass === C.INTERFACE) {
          const result = returned.pReserved as XInterface | null;
          returned.pReserved = null;
          return result;
        }
      } finally {
        returned.dispose();
      }
    }
    return null;
  }
  /** Original throwing query creates the actual generated exception and original message/context argument owners; explicit finally adapts native temporary destruction. @param pointer - Source interface. @param type - Demanded borrowed type. @returns Acquired interface or original exception. */
  static iquery_throw(pointer: XInterface | null, type: Type): XInterface {
    const result = BaseReference.iquery(pointer, type);
    if (result !== null) return result;
    const message = new OUString(
        cppu_unsatisfied_iquery_msg(type.getTypeLibType() as R),
        SAL_NO_ACQUIRE,
      ),
      context = new Reference(pointer);
    try {
      throw new RuntimeException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  /** Original pointer/reference equality first tests raw pointer identity, then queries root XInterface identity. Only RuntimeException is caught; acquired temporary references are destroyed in original order. @param value - Original right side. @returns Source equality, including null queried roots. */
  operatorEquals(value: BaseReference | InterfacePointer | null): boolean {
    const pointer = value instanceof BaseReference ? value.get() : value;
    if (this._pInterface === pointer) return true;
    try {
      const first = new Reference(this._pInterface, UNO_QUERY);
      try {
        const second = new Reference(pointer, UNO_QUERY);
        try {
          return first._pInterface === second._pInterface;
        } finally {
          second.dispose();
        }
      } finally {
        first.dispose();
      }
    } catch (error) {
      if (error instanceof RuntimeException) {
        error.dispose();
        return false;
      }
      throw error;
    }
  }
  /** Original inequality negates pointer/reference equality. @param value - Right side. @returns Source inequality. */
  operatorNotEquals(value: BaseReference | InterfacePointer | null): boolean {
    return !this.operatorEquals(value);
  }
}
/** Original Reference direct ownership members share the one actual base pointer. Native casts are JS identity for actual logical caller pointers; physical multiple-inheritance pointer adjustment is unverified. */
export class Reference<T extends InterfacePointer = InterfacePointer> extends BaseReference {
  /** Original default/direct/query/throwing overloads. Declared enum tags and optional explicit interface template spelling adapt erased C++ selection without inferring a type from values or storing an extra value/type provider. @param args - Original inputs and declared interface argument, defaulting to the existing root binding. @returns Original owned Reference. */
  constructor(
    ...args:
      | []
      | [value: Reference<T> | T | null]
      | [value: T | null, noAcquire: __sal_NoAcquire | UnoReference_NoAcquire]
      | [
          value: BaseReference | Any | T | null,
          tag: UnoReference_Query | UnoReference_QueryThrow,
          argument?: UnoTypeArgument,
        ]
      | [value: Reference<T> | T | null, tag: UnoReference_SetThrow, argument?: UnoTypeArgument]
  ) {
    super();
    if (args.length === 0) this._pInterface = null;
    else {
      const [value, tag, argument = "XInterface"] = args;
      if (tag === UNO_QUERY)
        this._pInterface =
          value instanceof Any && (value.pType as R).eTypeClass !== C.INTERFACE
            ? null
            : BaseReference.iquery(querySource(value), getTypeFavourUnsigned(argument));
      else if (tag === UNO_QUERY_THROW)
        this._pInterface = BaseReference.iquery_throw(
          querySource(value),
          getTypeFavourUnsigned(argument),
        );
      else {
        const pointer = (value instanceof Reference ? value.get() : value) as T | null;
        if (tag === UNO_SET_THROW) this._pInterface = Reference.iset_throw(pointer, argument);
        else {
          this._pInterface = pointer;
          if (args.length === 1 && pointer !== null) pointer.acquire();
        }
      }
    }
  }
  /** Original iset_throw acquires a non-null pointer without consulting the type; only failure uses the actual declared interface static type/message/exception owners. @param pointer - Assigned interface. @param argument - Original declared template type. @returns Acquired pointer or original exception. */
  private static iset_throw<P extends InterfacePointer>(
    pointer: P | null,
    argument: UnoTypeArgument,
  ): P {
    if (pointer !== null) {
      pointer.acquire();
      return pointer;
    }
    const message = new OUString(
        cppu_unsatisfied_iset_msg(getTypeFavourUnsigned(argument).getTypeLibType() as R),
        SAL_NO_ACQUIRE,
      ),
      context = new Reference(null);
    try {
      throw new RuntimeException(message, context);
    } finally {
      context.dispose();
      message.dispose();
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
  /** Erases the original address-of Reference<T> value used by compound/Any algorithms. The stable accessor aliases its actual pointer field and performs no acquisition, release or independent storage assignment policy. @returns Existing field address. */
  getAddress(): [T | null] {
    let address = referenceAddresses.get(this);
    if (address === undefined) {
      address = [] as unknown as [InterfacePointer | null];
      Object.defineProperty(address, "0", {
        /** Original existing field read. @returns Borrowed pointer. */
        get: () => this._pInterface,
        /** Original existing field write; the surrounding native C algorithm alone owns acquire/release. @param value - Already managed pointer. @returns Nothing. */
        set: (value: InterfacePointer | null) => {
          this._pInterface = value;
        },
      });
      referenceAddresses.set(this, address);
    }
    return address as [T | null];
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
  /** Original direct and query set return Boolean; queryThrow/setThrow overloads return void. Query/acquisition completes before publishing or releasing the prior pointer, so an exception preserves it. @param value - Original selected source. @param tag - Declared source tag. @param argument - Original interface template spelling. @returns Original selected result. */
  set(value: Reference<T> | T | null, tag?: __sal_NoAcquire | UnoReference_NoAcquire): boolean;
  /** Original querying set declaration. @param value - Selected source. @param tag - Native query tag. @param argument - Declared interface. @returns Non-null result. */
  set(
    value: BaseReference | Any | T | null,
    tag: UnoReference_Query,
    argument?: UnoTypeArgument,
  ): boolean;
  /** Original throwing query declaration. @param value - Selected source. @param tag - Native throwing query. @param argument - Declared interface. @returns Nothing. */
  set(
    value: BaseReference | Any | T | null,
    tag: UnoReference_QueryThrow,
    argument?: UnoTypeArgument,
  ): void;
  /** Original throwing direct assignment declaration. @param value - Same typed reference or pointer. @param tag - Native throwing set. @param argument - Declared interface. @returns Nothing. */
  set(value: Reference<T> | T | null, tag: UnoReference_SetThrow, argument?: UnoTypeArgument): void;
  /** Original selected set bodies. @param value - Actual source. @param tag - Original overload tag. @param argument - Declared interface. @returns Original bool or void result. */
  set(
    value: BaseReference | Any | T | null,
    tag?: ReferenceTag,
    argument: UnoTypeArgument = "XInterface",
  ): boolean | void {
    if (tag === UNO_QUERY)
      return this.set(
        BaseReference.iquery(querySource(value), getTypeFavourUnsigned(argument)) as T | null,
        SAL_NO_ACQUIRE,
      );
    if (tag === UNO_QUERY_THROW) {
      this.set(
        BaseReference.iquery_throw(
          querySource(value),
          getTypeFavourUnsigned(argument),
        ) as unknown as T,
        SAL_NO_ACQUIRE,
      );
      return;
    }
    if (tag === UNO_SET_THROW) {
      this.set(
        Reference.iset_throw(
          (value instanceof Reference ? value.get() : value) as T | null,
          argument,
        ),
        SAL_NO_ACQUIRE,
      );
      return;
    }
    const pointer = (value instanceof Reference ? value.get() : value) as T | null;
    if (tag === undefined && pointer !== null) pointer.acquire();
    const old = this._pInterface;
    this._pInterface = pointer;
    if (old !== null) old.release();
    return pointer !== null;
  }
  /** Original static query wraps an acquired queried pointer without another acquire. @param source - Original pointer or BaseReference. @param argument - Declared result interface. @returns Original owned reference. */
  static query(
    source: BaseReference | XInterface | null,
    argument: UnoTypeArgument = "XInterface",
  ): Reference {
    return new Reference(
      BaseReference.iquery(querySource(source), getTypeFavourUnsigned(argument)),
      SAL_NO_ACQUIRE,
    );
  }
  /** Original internal member query constructs a Reference of its explicit other_type. @param argument - Original other_type spelling. @returns Original owned queried reference. */
  query(argument: UnoTypeArgument = "XInterface"): Reference {
    return new Reference(this, UNO_QUERY, argument);
  }
  /** Original internal member queryThrow constructor body; deleted same-type C++ instantiations remain compiler-only producer restrictions. @param argument - Original other_type spelling. @returns Original owned reference or exception. */
  queryThrow(argument: UnoTypeArgument): Reference {
    return new Reference(this, UNO_QUERY_THROW, argument);
  }
  /** Original dereference arrow uses the borrowed interface cast; physical native pointer adjustments remain unverified. @returns Same original logical pointer. */
  operatorArrow(): T | null {
    return this.get();
  }
  /** Original indirection assumes the native non-null producer precondition. @returns Borrowed actual interface object. */
  operatorStar(): T {
    return this.get() as T;
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
