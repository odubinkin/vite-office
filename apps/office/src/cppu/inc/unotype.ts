/** @fileoverview Original cppu::detail borrowed Type pointer-cell casts from unotype.hxx; native address identity and live aliasing use one accessor view of the actual Type owner. */
import { Type } from "./com/sun/star/uno/Type";
import { typelib_static_type_getByTypeClass } from "./typelib/typedescription";
import type { typelib_TypeDescriptionReference as R } from "./typelib/typedescription";
import { typelib_TypeClass as C } from "./typelib/typeclass";
import { typelib_static_sequence_type_init } from "./typelib/typedescription";
import {
  getSequenceTypeFavourUnsigned,
  getSequenceTypeFavourChar,
} from "./com/sun/star/uno/Sequence-type";

/** Native pointer-cell address identity is adapted to the same stable object view; this map owns no native type reference and does not participate in the type registry. */
const views = new WeakMap<Readonly<[R | null]>, Type>();

/** Original reinterpret_cast<const Type*>(tdr) is a live one-pointer alias, with no constructor, acquire, copied field or independent Type implementation. Native const callers do not assign to or destroy this borrowed view. @param tdr - Original pointer cell whose caller owns its lifetime and contents. @returns The same borrowed Type view for this cell address. */
export function getTypeFromTypeDescriptionReference(tdr: Readonly<[R | null]>): Type {
  let view = views.get(tdr);
  if (view === undefined) {
    view = Object.create(Type.prototype) as Type;
    Object.defineProperty(view, "_pType", {
      /** Reads exactly the current original pointer cell rather than a constructor-time copy. @returns Current borrowed pointer. */
      get(): R | null {
        return tdr[0];
      },
    });
    views.set(tdr, view);
  }
  return view;
}
/** Original helper delegates to the actual static C cache then applies the same nonowning const view. @param tc - Original native type class, with no extra validation or fallback. @returns Actual borrowed static-cell Type view. */
export function getTypeFromTypeClass(tc: C): Type {
  return getTypeFromTypeDescriptionReference(typelib_static_type_getByTypeClass(tc));
}

/** Erased C++ template argument spelling, not a UNO runtime type/provider. Fundamental aliases retain original overload distinctions; actual generated ADL getter functions represent their declared C++ types. Nested tuples identify C++ template instantiations, never JS value inference. */
export type UnoTypeArgument =
  | "void"
  | "UnoVoidType"
  | "bool"
  | "sal_Bool"
  | "sal_Int8"
  | "sal_Int16"
  | "UnoUnsignedShortType"
  | "sal_uInt16"
  | "sal_Int32"
  | "sal_uInt32"
  | "sal_Int64"
  | "sal_uInt64"
  | "float"
  | "double"
  | "UnoCharType"
  | "sal_Unicode"
  | "OUString"
  | "Type"
  | "Any"
  | "Exception"
  | "XInterface"
  | (() => Type)
  | readonly ["UnoSequenceType" | "Sequence" | "Reference", UnoTypeArgument];
/** Compiler specialization identity for structurally equivalent erased nested type expressions. Contains no UNO references, runtime type names or type creation. */
const templateKeys = new Map<string, Map<unknown, object>>([
  ["UnoSequenceType", new Map()],
  ["Sequence", new Map()],
  ["Reference", new Map()],
]);
/** Adapts C++ compiler identity of an exact template argument to a stable native JS key. Does not merge different C++ spellings merely because their UNO type references coincide. @param type - Declared erased C++ type expression. @returns Same specialization key for the same C++ expression. */
export function unoTypeArgumentIdentity(type: UnoTypeArgument): unknown {
  if (typeof type !== "object") return type;
  const element = unoTypeArgumentIdentity(type[1]),
    keys = templateKeys.get(type[0]) as Map<unknown, object>;
  let key = keys.get(element);
  if (key === undefined) {
    key = {};
    keys.set(element, key);
  }
  return key;
}
/** Original cppu_detail_getUnoType<UnoSequenceType<T>> function-static pointer cell per exact T; Sequence<T> delegates to this same specialization. */
const sequenceTypes = new Map<unknown, [R | null]>();
/** Original detail overload dispatch after C++ type erasure. All type creation remains in the actual original static typelib factory; generated ADL resolves to the supplied actual source getter, not an alternate provider. @param type - Original selected C++ type argument (void has its UnoType specialization). @returns Original borrowed Type reference. */
export function cppu_detail_getUnoType(type: Exclude<UnoTypeArgument, "void">): Type {
  if (typeof type === "function") return type();
  if (typeof type === "object") {
    if (type[0] === "Reference") return UnoType.get(type[1]);
    const key = unoTypeArgumentIdentity(type[1]);
    let cell = sequenceTypes.get(key);
    if (cell === undefined) {
      cell = [null];
      sequenceTypes.set(key, cell);
    }
    if (cell[0] === null)
      typelib_static_sequence_type_init(cell, UnoType.get(type[1]).getTypeLibType() as R);
    return getTypeFromTypeDescriptionReference(cell);
  }
  switch (type) {
    case "UnoVoidType":
      return getTypeFromTypeClass(C.VOID);
    case "bool":
    case "sal_Bool":
      return getTypeFromTypeClass(C.BOOLEAN);
    case "sal_Int8":
      return getTypeFromTypeClass(C.BYTE);
    case "sal_Int16":
      return getTypeFromTypeClass(C.SHORT);
    case "UnoUnsignedShortType":
    case "sal_uInt16":
      return getTypeFromTypeClass(C.UNSIGNED_SHORT);
    case "sal_Int32":
      return getTypeFromTypeClass(C.LONG);
    case "sal_uInt32":
      return getTypeFromTypeClass(C.UNSIGNED_LONG);
    case "sal_Int64":
      return getTypeFromTypeClass(C.HYPER);
    case "sal_uInt64":
      return getTypeFromTypeClass(C.UNSIGNED_HYPER);
    case "float":
      return getTypeFromTypeClass(C.FLOAT);
    case "double":
      return getTypeFromTypeClass(C.DOUBLE);
    case "UnoCharType":
    case "sal_Unicode":
      return getTypeFromTypeClass(C.CHAR);
    case "OUString":
      return getTypeFromTypeClass(C.STRING);
    case "Type":
      return getTypeFromTypeClass(C.TYPE);
    case "Any":
      return getTypeFromTypeClass(C.ANY);
    case "Exception":
      return getTypeFromTypeClass(C.EXCEPTION);
    case "XInterface":
      return getTypeFromTypeClass(C.INTERFACE);
  }
}
/** Original non-instantiable all-static UnoType template uses a readonly ESM record. Explicit erased type arguments replace C++ compile-time selection; get's runtime behavior stays at the actual detail/ADL owner. */
export const UnoType = Object.freeze({
  /** Original get and void specialization; native remove_reference is compile-time-only. @param type - Original C++ template argument. @returns Borrowed Type from original overload. */
  get(type: UnoTypeArgument): Type {
    return cppu_detail_getUnoType(type === "void" ? "UnoVoidType" : type);
  },
});
/** Original generic, unsigned-short and Sequence overload selection. Internal sal_Unicode remains distinct from sal_uInt16 just as in the original internal header configuration. @param type - Original selected C++ argument. @returns Original Type reference. */
export function getTypeFavourUnsigned(type: UnoTypeArgument): Type {
  if (type === "sal_uInt16") return UnoType.get("UnoUnsignedShortType");
  if (typeof type === "object" && type[0] === "Sequence")
    return getSequenceTypeFavourUnsigned(type[1]);
  return UnoType.get(type);
}
/** Original generic, char and Sequence overload selection. @param type - Original selected C++ argument. @returns Original Type reference. */
export function getTypeFavourChar(type: UnoTypeArgument): Type {
  if (type === "sal_Unicode") return UnoType.get("UnoCharType");
  if (typeof type === "object" && type[0] === "Sequence") return getSequenceTypeFavourChar(type[1]);
  return UnoType.get(type);
}
