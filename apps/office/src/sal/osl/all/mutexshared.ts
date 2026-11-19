/** @fileoverview Original mutexshared.cxx global OSL owner/pointer-to-handle entry point, executed by the existing native binding. Static storage and its OSL lifetime remain in the native library. */
import { getRuntime } from "../../../external/emscripten/runtime";
/** Original global field address rather than a new mutex owner. @returns Actual native address. */
export function osl_getGlobalMutex(): number {
  const runtime = getRuntime();
  if (!runtime)
    throw new Error("Emscripten runtime must be initialized before OSL mutex operations");
  return runtime._osl_getGlobalMutex();
}
