/** @fileoverview Original three-field uno_Any declaration without constructor, initialization or invented reserved-data defaults. */
import type { typelib_TypeDescriptionReference } from "../typelib/typedescription";
/** Original C record; opaque void pointers preserve logical identity, and reserved storage is interpreted only by actual selected type operations. */
export interface _uno_Any {
  /** Original type-reference pointer. */
  pType: typelib_TypeDescriptionReference | null;
  /** Original value pointer, potentially an interior pointer; no independent ownership is declared. */
  pData: unknown;
  /** Original pointer-sized reserved storage; empty construction does not initialize this field. */
  pReserved: unknown;
}
/** Original public typedef. */
export type uno_Any = _uno_Any;
