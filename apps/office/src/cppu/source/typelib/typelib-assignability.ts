/** @fileoverview Original typelib.cxx type assignability table, compound/interface ancestry and description-prefix wrappers; reuses the exact existing shared equality and ownership owners. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
  typelib_InterfaceTypeDescription as I,
} from "../../inc/typelib/typedescription";
import { TYPELIB_DANGER_GET, TYPELIB_DANGER_RELEASE } from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
// Original private type_equals and public reference_equals have identical predicates.
// Reuse that already verified owner rather than adding another string comparison.
import { typelib_typedescriptionreference_equals as type_equals } from "./typelib";

/** Original translation-unit primitive compatibility table; internal source data, never a public C header export. */
export const s_aAssignableFromTab: readonly (readonly boolean[])[] = [
  [true, false, false, false, false, false, false, false, false, false, false],
  [false, true, false, false, false, false, false, false, false, false, false],
  [false, false, true, false, false, false, false, false, false, false, false],
  [false, false, true, true, true, false, false, false, false, false, false],
  [false, false, true, true, true, false, false, false, false, false, false],
  [false, false, true, true, true, true, true, false, false, false, false],
  [false, false, true, true, true, true, true, false, false, false, false],
  [false, false, true, true, true, true, true, true, true, false, false],
  [false, false, true, true, true, true, true, true, true, false, false],
  [false, false, true, true, true, false, false, false, false, true, false],
  [false, false, true, true, true, true, true, false, false, true, true],
];
/** Original nullable reference predicate, ANY shortcut, exact type identity, base traversal and primitive table. @param assignable - Original destination type. @param from - Original source type. @returns Source-defined type compatibility. */
export function typelib_typedescriptionreference_isAssignableFrom(
  assignable: R | null,
  from: R | null,
): boolean {
  if (assignable === null || from === null) return false;
  const eAssignable = assignable.eTypeClass,
    eFrom = from.eTypeClass;
  if (eAssignable === C.ANY) return true;
  if (eAssignable === eFrom) {
    if (type_equals(assignable, from)) return true;
    switch (eAssignable) {
      case C.STRUCT:
      case C.EXCEPTION: {
        const slot: [D | null] = [null];
        TYPELIB_DANGER_GET(slot, from);
        const d = slot[0] as D,
          comp = d as unknown as P;
        if (comp.pBaseTypeDescription === null) {
          TYPELIB_DANGER_RELEASE(d);
          return false;
        }
        const result = typelib_typedescriptionreference_isAssignableFrom(
          assignable,
          comp.pBaseTypeDescription.aBase.pWeakRef,
        );
        TYPELIB_DANGER_RELEASE(d);
        return result;
      }
      case C.INTERFACE: {
        const slot: [D | null] = [null];
        TYPELIB_DANGER_GET(slot, from);
        const d = slot[0] as D,
          iface = d as unknown as I;
        let result = false;
        for (let i = 0; i < iface.nBaseTypes; i++) {
          if (
            typelib_typedescriptionreference_isAssignableFrom(
              assignable,
              ((iface.ppBaseTypes as I[])[i] as I).aBase.pWeakRef,
            )
          ) {
            result = true;
            break;
          }
        }
        TYPELIB_DANGER_RELEASE(d);
        return result;
      }
      default:
        return false;
    }
  }
  return (
    eAssignable >= C.CHAR &&
    eAssignable <= C.DOUBLE &&
    eFrom >= C.CHAR &&
    eFrom <= C.DOUBLE &&
    ((s_aAssignableFromTab[eAssignable - 1] as readonly boolean[])[eFrom - 1] as boolean)
  );
}
/** Original description wrapper follows pWeakRef; uninitialized weak prefixes yield the original nullable result. @param assignable - Original destination description. @param from - Original source description. @returns Original reference compatibility. */
export function typelib_typedescription_isAssignableFrom(assignable: D, from: D): boolean {
  return typelib_typedescriptionreference_isAssignableFrom(assignable.pWeakRef, from.pWeakRef);
}
/** Original common-prefix equality wrapper; declaration casts preserve the two compared common fields and object identity without creating a view or requiring allocator bookkeeping. @param first - Original allocated description. @param second - Original allocated description. @returns Original exact type equality. */
export function typelib_typedescription_equals(first: D, second: D): boolean {
  return type_equals(first as unknown as R, second as unknown as R);
}
