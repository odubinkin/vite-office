/** @fileoverview Original three-field uno_Any declaration without invented constructor/initialization/defaults; the actual original C Any declarations reuse their source owner. */
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

/** Original implemented C declarations reuse the complete actual any.cxx owner. */
export {
  uno_any_destruct,
  uno_any_clear,
  uno_type_any_assign,
  uno_any_assign,
  uno_type_any_construct,
  uno_any_construct,
  uno_type_any_constructAndConvert,
  uno_any_constructAndConvert,
} from "../../source/uno/any";
