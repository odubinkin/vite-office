/** @fileoverview Original UNO generic query/acquire/release callback declarations from uno/data.h; data-operation implementations remain in their actual source owners. */
import type { typelib_TypeDescriptionReference } from "../typelib/typedescription";
/** Original void-pointer query callback; no provider implementation is supplied. */
export type uno_QueryInterfaceFunc = (
  pInterface: unknown,
  pType: typelib_TypeDescriptionReference,
) => unknown;
/** Original caller-supplied interface acquisition callback. */
export type uno_AcquireFunc = (pInterface: unknown) => void;
/** Original caller-supplied interface release callback. */
export type uno_ReleaseFunc = (pInterface: unknown) => void;

/** Actual original C default-construction declarations forward to their one source implementation. */
export {
  uno_type_constructData,
  uno_constructData,
  uno_type_destructData,
  uno_destructData,
  uno_type_copyData,
  uno_copyData,
  uno_type_copyAndConvertData,
  uno_copyAndConvertData,
  uno_type_equalData,
  uno_equalData,
} from "../../source/uno/data";
