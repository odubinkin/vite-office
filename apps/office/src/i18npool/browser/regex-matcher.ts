/** @fileoverview Emscripten memory binding for LibreOffice TextSearch's native ICU regex handle. */
import type { RegexMatcherFactory } from "../source/search/textsearch";

/** Exported C ABI and memory views of the pinned native ICU regex module. */
export interface IcuRegexModule {
  readonly HEAPU16: Uint16Array;
  readonly HEAP32: Int32Array;
  _malloc(size: number): number;
  _free(pointer: number): void;
  _lo_regex_create(pattern: number, length: number, ignoreCase: number): number;
  _lo_regex_destroy(handle: number): void;
  _lo_regex_search(
    handle: number,
    text: number,
    length: number,
    start: number,
    end: number,
    backward: number,
  ): number;
  _lo_regex_offsets(handle: number): number;
}

/** Supplies UTF-16 by value to a native call. @param module - Native module. @param text - Pattern or search input. @param call - Synchronous consumer. @returns Result of the native call. */
function withUtf16<T>(module: IcuRegexModule, text: Uint16Array, call: (pointer: number) => T): T {
  const pointer = module._malloc(Math.max(Uint16Array.BYTES_PER_ELEMENT, text.byteLength)) >>> 0;
  if (pointer === 0) throw new Error("ICU regex could not allocate UTF-16 input.");
  try {
    module.HEAPU16.set(text, pointer / Uint16Array.BYTES_PER_ELEMENT);
    return call(pointer);
  } finally {
    module._free(pointer);
  }
}

/** Binds a loaded ICU module to the shared TextSearch matcher constructor. @param module - Initialized native module. @returns Synchronous constructor. */
export function createIcuRegexMatcherFactory(module: IcuRegexModule): RegexMatcherFactory {
  const cleanup = new FinalizationRegistry<number>(
    /** Releases native memory when a search owner is collected. @param handle - Unreleased matcher. @returns Nothing. */
    (handle) => module._lo_regex_destroy(handle),
  );

  return /** Compiles one ICU expression from original UTF-16. @param pattern - Prepared pattern. @param ignoreCase - Native case option. @returns Matcher or invalid-pattern result. */ (
    pattern,
    ignoreCase,
  ) => {
    let handle = withUtf16(
      module,
      pattern,
      /** Initializes the native matcher and retains its handle. @param pointer - Temporary UTF-16 pointer. @returns Native matcher address. */
      (pointer) => module._lo_regex_create(pointer, pattern.length, Number(ignoreCase)),
    );
    if (handle === 0) return undefined;

    const token = {};
    const matcher = {
      /** Queries native directional capture pairs and takes a stable copy. @param input - Original UTF-16 input. @param start - Directional start. @param end - Directional end. @param backward - Whether the bounds are reversed. @returns Signed capture pairs. */
      search(input: Uint16Array, start: number, end: number, backward: boolean): Int32Array {
        if (handle === 0) throw new Error("ICU regex matcher has been disposed.");
        return withUtf16(
          module,
          input,
          /** Reads the result before resetting or releasing the matcher. @param pointer - Temporary input storage. @returns Stable result pairs. */
          (pointer) => {
            const count = module._lo_regex_search(
              handle,
              pointer,
              input.length,
              start,
              end,
              Number(backward),
            );
            if (count === 0) return new Int32Array();
            const address = (module._lo_regex_offsets(handle) >>> 0) / Int32Array.BYTES_PER_ELEMENT;
            return module.HEAP32.slice(address, address + count * 2);
          },
        );
      },

      /** Releases the ICU matcher once. @returns Nothing. */
      dispose(): void {
        if (handle === 0) return;
        const released = handle;
        handle = 0;
        cleanup.unregister(token);
        module._lo_regex_destroy(released);
      },
    };
    cleanup.register(matcher, handle, token);
    return matcher;
  };
}
