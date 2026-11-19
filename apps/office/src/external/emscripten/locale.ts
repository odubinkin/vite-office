/** @fileoverview Actual pinned Emscripten libc locale/environment and source process-locale pthread mutex boundary. */
import { getRuntime } from "./runtime";
/** Borrows the initialized native exports. @returns Actual runtime. */
function api(): NonNullable<ReturnType<typeof getRuntime>> {
  const runtime = getRuntime();
  if (!runtime)
    throw new Error("Emscripten runtime must be initialized before libc locale operations");
  return runtime;
}
/** Reads a copy of a native getenv result; the actual runtime owns its environment. @param name - ASCII variable name. @returns Bytes excluding terminator or null. */
export function getenv(name: string): Uint8Array | null {
  const runtime = api(),
    count = runtime.lengthBytesUTF8(name) + 1,
    pointer = runtime._malloc(count);
  try {
    runtime.stringToUTF8(name, pointer, count);
    const value = runtime._getenv(pointer);
    if (!value) return null;
    let end = value;
    while (runtime.HEAPU8[end] !== 0) end++;
    return runtime.HEAPU8.slice(value, end);
  } finally {
    runtime._free(pointer);
  }
}
/** Calls actual newlocale/nl_langinfo_l/copy/freelocale with the source64-byte codeset buffer. @param name - Terminated locale-name buffer. @returns Copied codeset or absence on native failure. */
export function getLocaleCodeset(name: Uint8Array): Uint8Array | null {
  const runtime = api(),
    pointer = runtime._malloc(name.length),
    buffer = runtime._malloc(64);
  try {
    runtime.HEAPU8.set(name, pointer);
    if (!runtime._office_locale_codeset(pointer, buffer, 64)) return null;
    let length = 0;
    while (length < 64 && runtime.HEAPU8[buffer + length] !== 0) length++;
    return runtime.HEAPU8.slice(buffer, buffer + length);
  } finally {
    runtime._free(buffer);
    runtime._free(pointer);
  }
}
/** Locks the source static PTHREAD_MUTEX_INITIALIZER mutex. @returns Nothing. */
export function lockProcessLocale(): void {
  api()._office_process_locale_lock();
}
/** Unlocks the source static process-locale mutex. @returns Nothing. */
export function unlockProcessLocale(): void {
  api()._office_process_locale_unlock();
}
