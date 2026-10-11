/** @fileoverview Original uno::Type class declaration and inline member bodies from Type.h/Type.hxx share one actual Type owner; C++ class body binding/overload erasure and explicit destruction are adapted without changing reference ownership. */
import type { TypeClass } from "../../../../../../udkapi/com/sun/star/uno/TypeClass";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../../../../typelib/typedescription";
import {
  typelib_static_type_getByTypeClass,
  typelib_typedescriptionreference_new,
  typelib_typedescriptionreference_newByAsciiName,
  typelib_typedescriptionreference_acquire,
  typelib_typedescriptionreference_release,
  typelib_typedescriptionreference_assign,
  typelib_typedescriptionreference_getDescription,
  typelib_typedescriptionreference_isAssignableFrom,
  typelib_typedescriptionreference_equals,
} from "../../../../typelib/typedescription";
import { OUString } from "../../../../../../sal/inc/rtl/ustring";
import type { __sal_NoAcquire } from "../../../../../../sal/inc/types";

/** Original no-acquire ownership-transfer enum; its dummy value is not inspected by the selected original constructor. */
export enum UnoType_NoAcquire {
  UNO_TYPE_NO_ACQUIRE,
}
/** Original unscoped namespace enum constant. */
export const UNO_TYPE_NO_ACQUIRE = UnoType_NoAcquire.UNO_TYPE_NO_ACQUIRE;

/** Original IDL meta-type value with its one private C reference pointer. Constructor/member definitions split across original Type.h/Type.hxx are bound into this single Type class. Physical allocation operators, native const/rvalue enforcement, Array templates and legacy/UnoType helper families remain separate language/consumer responsibilities. */
export class Type {
  private _pType: R | null;
  /** Original default, class/name, pointer/acquire-transfer and value-copy overloads. @param args - Original selected overload arguments; first-argument type and second-argument presence adapt erased native overload selection. @returns Original constructed Type value. */
  constructor(
    ...args:
      | []
      | [typeClass: TypeClass, name: OUString | Uint8Array | null]
      | [reference: R]
      | [reference: R | null, noAcquire: UnoType_NoAcquire | __sal_NoAcquire]
      | [value: Type]
  ) {
    const [value, argument] = args;
    if (value === undefined) {
      // Original reinterpret_cast<const Type*>(void-cache-cell)->getTypeLibType()
      // reads exactly that cell's one reference pointer; no borrowed copy is constructed.
      this._pType = typelib_static_type_getByTypeClass(C.VOID)[0];
      typelib_typedescriptionreference_acquire(this._pType as R);
    } else if (typeof value === "number") {
      const slot: [R | null] = [null];
      if (argument instanceof OUString)
        typelib_typedescriptionreference_new(slot, value as unknown as C, argument.pData);
      else
        typelib_typedescriptionreference_newByAsciiName(
          slot,
          value as unknown as C,
          argument as Uint8Array | null,
        );
      this._pType = slot[0];
    } else if (value instanceof Type) {
      this._pType = value._pType;
      typelib_typedescriptionreference_acquire(this._pType as R);
    } else {
      this._pType = value;
      if (argument === undefined) typelib_typedescriptionreference_acquire(this._pType as R);
    }
  }
  /** Original destructor release; repeated destruction and null-pointer consumers retain no valid native dereference contract. @returns Nothing. */
  dispose(): void {
    typelib_typedescriptionreference_release(this._pType as R);
  }
  /** Original copy assignment returns this value and uses the actual acquire-before-release owner. @param value - Original borrowed right side. @returns This same value. */
  assign(value: Type): this {
    const slot: [R | null] = [this._pType];
    typelib_typedescriptionreference_assign(slot, value._pType);
    this._pType = slot[0];
    return this;
  }
  /** Original internal move assignment swaps both owned pointers; the right side receives the previous left side. @param value - Original rvalue-selected right side. @returns This same value. */
  moveAssign(value: Type): this {
    const old = this._pType;
    this._pType = value._pType;
    value._pType = old;
    return this;
  }
  /** Original enum cast of the stored reference class. @returns Original UNO TypeClass. */
  getTypeClass(): TypeClass {
    return (this._pType as R).eTypeClass as unknown as TypeClass;
  }
  /** Original acquired Unicode name value. @returns New original string owner. */
  getTypeName(): OUString {
    return new OUString((this._pType as R).pTypeName);
  }
  /** Original full-description output replacement/acquisition. @param result - Original inout description slot. @returns Nothing. */
  getDescription(result: [D | null]): void {
    typelib_typedescriptionreference_getDescription(result, this._pType as R);
  }
  /** Original borrowed C pointer; no acquire occurs. @returns The same stored pointer, including an intentionally retained null-data value. */
  getTypeLibType(): R | null {
    return this._pType;
  }
  /** Original reference compatibility predicate, with no replacement numeric/value logic. @param value - Original source type. @returns Source-defined compatibility. */
  isAssignableFrom(value: Type): boolean {
    return typelib_typedescriptionreference_isAssignableFrom(this._pType, value._pType);
  }
  /** Original named equality method. @param value - Original right side. @returns Exact original type equality. */
  equals(value: Type): boolean {
    return typelib_typedescriptionreference_equals(this._pType, value._pType);
  }
  /** Original equality operator bridge. @param value - Original right side. @returns Exact original type equality. */
  operatorEqual(value: Type): boolean {
    return typelib_typedescriptionreference_equals(this._pType, value._pType);
  }
  /** Original inequality operator bridge. @param value - Original right side. @returns Original negated equality. */
  operatorNotEqual(value: Type): boolean {
    return !typelib_typedescriptionreference_equals(this._pType, value._pType);
  }
}
