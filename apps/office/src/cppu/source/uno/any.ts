/** @fileoverview Complete original any.cxx C construction/copy/conversion/assignment/destruction/clear boundaries reuse their actual shared inline owners. */
import type { uno_Any } from "../../inc/uno/any2";
import { _copyConstructAny } from "./copy";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../../inc/typelib/typedescription";
import type { uno_AcquireFunc } from "../../inc/uno/data";
import type { uno_Mapping } from "../../inc/uno/mapping";
import type { uno_ReleaseFunc } from "../../inc/uno/data";
import { _destructAny } from "./destr";
import { CONSTRUCT_EMPTY_ANY } from "./prim";
/** Original C destructor. @param pValue - Actual initialized Any. @param release - Optional callback. @returns Nothing. */
export function uno_any_destruct(pValue: uno_Any, release: uno_ReleaseFunc | null): void {
  _destructAny(pValue, release);
}
/** Original clear destroys first, then constructs an empty Any with untouched reserved storage. @param pValue - Actual initialized Any. @param release - Optional callback. @returns Nothing. */
export function uno_any_clear(pValue: uno_Any, release: uno_ReleaseFunc | null): void {
  _destructAny(pValue, release);
  CONSTRUCT_EMPTY_ANY(pValue);
}

/** Original Any C assignment destroys first, including null-type empty construction. @param pDest - Destination. @param pSource - Optional initialized source. @param pType - Reference. @param acquire - Callback. @param release - Callback. @returns Nothing. */
export function uno_type_any_assign(
  pDest: uno_Any,
  pSource: unknown,
  pType: R | null,
  acquire: uno_AcquireFunc | null,
  release: uno_ReleaseFunc | null,
): void {
  _destructAny(pDest, release);
  if (pType) _copyConstructAny(pDest, pSource, pType, null, acquire, null);
  else CONSTRUCT_EMPTY_ANY(pDest);
}

/** Original Any C assignment destroys first, including null-type empty construction. @param pDest - Destination. @param pSource - Optional initialized source. @param pTypeDescr - Description. @param acquire - Callback. @param release - Callback. @returns Nothing. */
export function uno_any_assign(
  pDest: uno_Any,
  pSource: unknown,
  pTypeDescr: D | null,
  acquire: uno_AcquireFunc | null,
  release: uno_ReleaseFunc | null,
): void {
  _destructAny(pDest, release);
  if (pTypeDescr)
    _copyConstructAny(pDest, pSource, pTypeDescr.pWeakRef as R, pTypeDescr, acquire, null);
  else CONSTRUCT_EMPTY_ANY(pDest);
}

/** Original Any C construction preserves null-type empty construction. @param pDest - Destination. @param pSource - Optional initialized source. @param pType - Reference. @param acquire - Callback. @returns Nothing. */
export function uno_type_any_construct(
  pDest: uno_Any,
  pSource: unknown,
  pType: R | null,
  acquire: uno_AcquireFunc | null,
): void {
  if (pType) _copyConstructAny(pDest, pSource, pType, null, acquire, null);
  else CONSTRUCT_EMPTY_ANY(pDest);
}

/** Original Any C construction preserves null-type empty construction. @param pDest - Destination. @param pSource - Optional initialized source. @param pTypeDescr - Description. @param acquire - Callback. @returns Nothing. */
export function uno_any_construct(
  pDest: uno_Any,
  pSource: unknown,
  pTypeDescr: D | null,
  acquire: uno_AcquireFunc | null,
): void {
  if (pTypeDescr)
    _copyConstructAny(pDest, pSource, pTypeDescr.pWeakRef as R, pTypeDescr, acquire, null);
  else CONSTRUCT_EMPTY_ANY(pDest);
}

/** Original Any C construction preserves null-type empty construction. @param pDest - Destination. @param pSource - Optional initialized source. @param pType - Reference. @param mapping - Mapping. @returns Nothing. */
export function uno_type_any_constructAndConvert(
  pDest: uno_Any,
  pSource: unknown,
  pType: R | null,
  mapping: uno_Mapping | null,
): void {
  if (pType) _copyConstructAny(pDest, pSource, pType, null, null, mapping);
  else CONSTRUCT_EMPTY_ANY(pDest);
}

/** Original Any C construction preserves null-type empty construction. @param pDest - Destination. @param pSource - Optional initialized source. @param pTypeDescr - Description. @param mapping - Mapping. @returns Nothing. */
export function uno_any_constructAndConvert(
  pDest: uno_Any,
  pSource: unknown,
  pTypeDescr: D | null,
  mapping: uno_Mapping | null,
): void {
  if (pTypeDescr)
    _copyConstructAny(pDest, pSource, pTypeDescr.pWeakRef as R, pTypeDescr, null, mapping);
  else CONSTRUCT_EMPTY_ANY(pDest);
}
