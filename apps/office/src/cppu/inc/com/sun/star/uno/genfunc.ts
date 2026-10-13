/** @fileoverview Original genfunc.h/hxx C++ virtual acquire/release/query callbacks; real Any return ownership and generated RuntimeException cleanup preserve source RAII without a provider. */
import type { XInterface } from "./XInterface";
import type { typelib_TypeDescriptionReference as R } from "../../../../typelib/typedescription";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import { getTypeFromTypeDescriptionReference } from "../../../../unotype";
import { RuntimeException } from "./RuntimeException";
/** Original direct virtual acquire has no null shortcut of its own. @param pCppI - Actual C++ interface pointer. @returns Nothing. */
export function cpp_acquire(pCppI: unknown): void {
  (pCppI as XInterface).acquire();
}
/** Original direct virtual release has no null shortcut of its own. @param pCppI - Actual C++ interface pointer. @returns Nothing. */
export function cpp_release(pCppI: unknown): void {
  (pCppI as XInterface).release();
}
/** Original query uses a borrowed Type view of the actual parameter slot, transfers an interface result's reserved pointer, destructs its returned Any, and catches only RuntimeException. JS finally/dispose adapts original RAII, including destruction of the caught generated exception object. @param pCppI - Actual interface or null. @param pType - Demanded reference. @returns Acquired actual pointer or null. */
export function cpp_queryInterface(pCppI: unknown, pType: R): unknown {
  if (pCppI !== null) {
    try {
      const returned = (pCppI as XInterface).queryInterface(
        getTypeFromTypeDescriptionReference([pType]),
      );
      try {
        if ((returned.pType as R).eTypeClass === C.INTERFACE) {
          const result = returned.pReserved;
          returned.pReserved = null;
          return result;
        }
      } finally {
        returned.dispose();
      }
    } catch (error) {
      if (error instanceof RuntimeException) error.dispose();
      else throw error;
    }
  }
  return null;
}
