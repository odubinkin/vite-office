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
