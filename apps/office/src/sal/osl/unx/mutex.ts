/** @fileoverview Original consumed sal/osl/unx/mutex.cxx entry points execute actual C bodies in the shared Emscripten runtime. The linked non-pthread libc supplies its own pthread stubs; no JS lock state or native multithreaded claim. */
import { getRuntime } from "../../../external/emscripten/runtime";
/** Original opaque oslMutex, lowered as an actual native address. */
export type oslMutex = number;
/** Borrows the real runtime after bootstrap. @returns Actual native exports. */
function runtime(): NonNullable<ReturnType<typeof getRuntime>> {
  const module = getRuntime();
  if (!module)
    throw new Error("Emscripten runtime must be initialized before OSL mutex operations");
  return module;
}
/** Original native malloc/recursive attribute/pthread initializer. @returns Actual pointer or zero. */
export function osl_createMutex(): oslMutex {
  return runtime()._osl_createMutex();
}
/** Original native destroy/free; the source handles null. @param mutex - Native handle. @returns Nothing. */
export function osl_destroyMutex(mutex: oslMutex): void {
  runtime()._osl_destroyMutex(mutex);
}
/** Original native acquire returns false for null or OS failure. @param mutex - Native handle. @returns Native status. */
export function osl_acquireMutex(mutex: oslMutex): boolean {
  return runtime()._osl_acquireMutex(mutex) !== 0;
}
/** Original native try-lock status. @param mutex - Native handle. @returns Native status. */
export function osl_tryToAcquireMutex(mutex: oslMutex): boolean {
  return runtime()._osl_tryToAcquireMutex(mutex) !== 0;
}
/** Original native unlock status. @param mutex - Native handle. @returns Native status. */
export function osl_releaseMutex(mutex: oslMutex): boolean {
  return runtime()._osl_releaseMutex(mutex) !== 0;
}
