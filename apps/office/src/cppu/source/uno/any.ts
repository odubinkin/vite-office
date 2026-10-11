/** @fileoverview Original any.cxx destruction and clear boundaries reuse the actual shared destruction and empty-construction owners. */
import type { uno_Any } from "../../inc/uno/any2";
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
