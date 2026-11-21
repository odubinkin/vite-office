/** @fileoverview Native ICU C ABI memory and lifetime tests, independent of regex semantics. */
import { expect, it, vi } from "vitest";
import { createIcuRegexMatcherFactory, type IcuRegexModule } from "./regex-matcher";

/** Uses real growable WASM memory to observe JavaScript's ABI responsibilities. @returns ABI spies and heap. */
function wasmAbi() {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const module = {
    /** Represents the refreshed Emscripten unsigned view. @returns UTF-16 storage. */
    get HEAPU16() {
      return new Uint16Array(memory.buffer);
    },
    /** Represents the refreshed Emscripten signed view. @returns Capture storage. */
    get HEAP32() {
      return new Int32Array(memory.buffer);
    },
    _malloc: vi.fn(
      /** Moves the underlying memory on each allocation. @returns Test pointer. */
      () => {
        memory.grow(1);
        return 32;
      },
    ),
    _free: vi.fn(),
    _lo_regex_create: vi.fn<IcuRegexModule["_lo_regex_create"]>().mockReturnValue(128),
    _lo_regex_destroy: vi.fn(),
    _lo_regex_search: vi.fn<IcuRegexModule["_lo_regex_search"]>().mockReturnValue(0),
    _lo_regex_offsets: vi.fn().mockReturnValue(256),
  };
  return { module, memory };
}

it("writes length-specified UTF-16 and copies signed captures after memory growth", /** Checks real memory growth, raw UCS-2 units and native capture ordering. @returns Nothing. */ () => {
  const { module, memory } = wasmAbi();
  const source = Uint16Array.of(0x41, 0, 0xd83d, 0xde00);
  module._lo_regex_create.mockImplementation(
    /** Observes input through the current memory view. @param pointer - Native pattern pointer. @param length - Explicit code-unit length. @param ignoreCase - Native option. @returns Test handle. */
    (pointer, length, ignoreCase) => {
      expect(module.HEAPU16.subarray(pointer / 2, pointer / 2 + length)).toEqual(source);
      expect(ignoreCase).toBe(1);
      return 128;
    },
  );
  module._lo_regex_search.mockImplementation(
    /** Supplies example ABI bytes after growing linear memory. @param handle - Native matcher. @param pointer - Search input. @param length - Code-unit count. @param start - Directional upper bound. @param end - Directional lower bound. @param backward - Direction bit. @returns Number of captures. */
    (handle, pointer, length, start, end, backward) => {
      expect([handle, length, start, end, backward]).toEqual([128, 4, 4, 0, 1]);
      expect(module.HEAPU16.subarray(pointer / 2, pointer / 2 + length)).toEqual(source);
      memory.grow(1);
      module.HEAP32.set([4, 2, -1, -1], 256 / 4);
      return 2;
    },
  );

  const matcher = createIcuRegexMatcherFactory(module)(source, true);
  expect(matcher).toBeDefined();
  const result = matcher?.search(source, 4, 0, true);
  module.HEAP32.fill(0);
  expect(result).toEqual(Int32Array.of(4, 2, -1, -1));
  expect(module._free.mock.calls).toEqual([[32], [32]]);
  matcher?.dispose();
  matcher?.dispose();
  expect(module._lo_regex_destroy.mock.calls).toEqual([[128]]);
  expect(
    /** A released handle cannot be used again. @returns Search output. */
    () => matcher?.search(source, 0, 4, false),
  ).toThrow("disposed");
});

it("frees temporary storage on invalid patterns, misses and native exceptions", /** Ensures deterministic ownership at each ABI exit. @returns Nothing. */ () => {
  const { module } = wasmAbi();
  const create = createIcuRegexMatcherFactory(module);
  module._lo_regex_create.mockReturnValueOnce(0);
  expect(create(Uint16Array.of(40), false)).toBeUndefined();
  const matcher = create(new Uint16Array(), false);
  expect(module._malloc).toHaveBeenLastCalledWith(2);
  expect(matcher?.search(new Uint16Array(), 0, 0, false)).toEqual(new Int32Array());
  expect(module._lo_regex_offsets).not.toHaveBeenCalled();
  module._lo_regex_search.mockImplementationOnce(
    /** Represents a failing native call. @returns Never. */
    () => {
      throw new Error("Native call failed");
    },
  );
  expect(
    /** Attempts another call on the same matcher. @returns Search output. */
    () => matcher?.search(Uint16Array.of(65), 0, 1, false),
  ).toThrow("Native call failed");
  expect(module._free.mock.calls).toEqual([[32], [32], [32], [32]]);
  matcher?.dispose();
  module._malloc.mockReturnValueOnce(0);
  expect(
    /** Fails before trying to initialize another matcher. @returns Matcher. */
    () => create(Uint16Array.of(65), false),
  ).toThrow("allocate");
  expect(module._lo_regex_create).toHaveBeenCalledTimes(2);
});
