/** @fileoverview Isolated actual libc abort qualification for the explicitly approved original SAL_ABORT_ON_FORBIDDEN path. */
import { expect, it } from "vitest";
import { initializeRuntime, getRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { setAllowedPaths, isForbidden } from "./file.access";
import { OString } from "../../inc/rtl/string";
it("calls actual native abort for a configured forbidden path", /** Uses a fresh real runtime; no operations continue after native termination. @returns Completion. */ async () => {
  await initializeRuntime();
  const runtime = getRuntime() as NonNullable<ReturnType<typeof getRuntime>>;
  getFileSystem().mkdir("/tmp/abort-allowed");
  const key = runtime._malloc(23),
    value = runtime._malloc(1);
  runtime.stringToUTF8("SAL_ABORT_ON_FORBIDDEN", key, 23);
  runtime.HEAPU8[value] = 0;
  expect(runtime._setenv(key, value, 1)).toBe(0);
  runtime._free(value);
  runtime._free(key);
  const allowed = "/tmp/abort-allowed";
  setAllowedPaths(
    Uint16Array.from(
      allowed
        .split("")
        .map(
          /** Encodes an original UTF16 unit. @param unit - Unit. @returns Code. */ (unit) =>
            unit.charCodeAt(0),
        ),
    ),
  );
  const denied = new OString(
    Uint8Array.of(47, 116, 109, 112, 47, 100, 101, 110, 105, 101, 100),
    11,
  );
  let returned = false;
  expect(
    /** Invokes the actual source abort branch. @returns Nothing. */ () => {
      isForbidden(denied, 1);
      returned = true;
    },
  ).toThrow(WebAssembly.RuntimeError);
  expect(returned).toBe(false);
  // No further native calls or source list cleanup after the abort.
});
