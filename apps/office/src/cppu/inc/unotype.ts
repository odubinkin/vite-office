/** @fileoverview Original cppu::detail borrowed Type pointer-cell casts from unotype.hxx; native address identity and live aliasing use one accessor view of the actual Type owner. */
import { Type } from "./com/sun/star/uno/Type";
import { typelib_static_type_getByTypeClass } from "./typelib/typedescription";
import type { typelib_TypeDescriptionReference as R } from "./typelib/typedescription";
import type { typelib_TypeClass } from "./typelib/typeclass";

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
export function getTypeFromTypeClass(tc: typelib_TypeClass): Type {
  return getTypeFromTypeDescriptionReference(typelib_static_type_getByTypeClass(tc));
}
