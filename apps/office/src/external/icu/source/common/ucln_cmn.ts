/** @fileoverview Original common/library cleanup registration and ordered dispatch. Synchronous realm publication binds native mutex boundaries; no fake global heap/tracing cleanup or u_cleanup facade is supplied. */
import { ECleanupLibraryType as L, type cleanupFunc } from "./ucln";
import { ECleanupCommonType as C } from "./ucln_cmn.h";
// Original compile-time array bound UCLN_COMMON_COUNT=29; folding the enum avoids reading its ESM header during the declaration cycle.
const gCommonCleanupFunctions: (cleanupFunc | null)[] = Array(29).fill(null);
// Original compile-time array bound UCLN_COMMON=8, verified against the pinned native declarations.
const gLibCleanupFunctions: (cleanupFunc | null)[] = Array(8).fill(null);
/** Original one-library callback followed by slot clearing. @param type - Library selector. @returns Nothing. */
export function ucln_cleanupOne(type: L): void {
  const f = gLibCleanupFunctions[type];
  if (f) {
    f();
    gLibCleanupFunctions[type] = null;
  }
}
/** Original mutex special case and range-guarded slot publication. @param type - Common selector. @param func - Callback/null. @returns Nothing. */
export function ucln_common_registerCleanup(type: C, func: cleanupFunc | null): void {
  if (type === C.UCLN_COMMON_MUTEX) gCommonCleanupFunctions[type] = func;
  else if (C.UCLN_COMMON_START < type && type < C.UCLN_COMMON_COUNT)
    gCommonCleanupFunctions[type] = func;
}
/** Original library registration range check. @param type - Selector. @param func - Callback/null. @returns Nothing. */
export function ucln_registerCleanup(type: L, func: cleanupFunc | null): void {
  if (L.UCLN_START < type && type < L.UCLN_COMMON) gLibCleanupFunctions[type] = func;
}
/** Original libraries-before-common ordered dispatch; callback return values are ignored and slots clear after calls. @returns True. */
export function ucln_lib_cleanup(): boolean {
  for (let type = L.UCLN_START + 1; type < L.UCLN_COMMON; ++type) ucln_cleanupOne(type);
  for (let type = C.UCLN_COMMON_START + 1; type < C.UCLN_COMMON_COUNT; ++type) {
    const f = gCommonCleanupFunctions[type];
    if (f) {
      f();
      gCommonCleanupFunctions[type] = null;
    }
  }
  return true;
}
