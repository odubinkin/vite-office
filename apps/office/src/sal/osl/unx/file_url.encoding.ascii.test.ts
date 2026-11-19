/** @fileoverview Independent original file URL charset singleton capture/error profile using real ASCII and UTF8 converters. */
import { expect, it } from "vitest";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { OString } from "../../inc/rtl/string";
import { osl_setThreadTextEncoding } from "../../inc/osl/thread";
import { RTL_TEXTENCODING_ASCII_US, RTL_TEXTENCODING_UTF8 } from "../../inc/rtl/textenc";
import { decodeFromUtf8, TextToUnicode } from "./file_url.encoding";
it("preserves ASCII failure, cached encoding and independent opposite-direction first use", /** No converter injection or reset API is added to the source singleton. @returns Completion. */ async () => {
  await initializeRuntime();
  osl_setThreadTextEncoding(RTL_TEXTENCODING_ASCII_US);
  const value = new OString(Uint8Array.of(111, 108, 100), 3),
    input = Uint16Array.of(37, 67, 51, 37, 65, 57);
  try {
    const prior = value.pData;
    expect(decodeFromUtf8(input, value)).toBe(false);
    expect(value.pData).toBe(prior);
    osl_setThreadTextEncoding(RTL_TEXTENCODING_UTF8);
    expect(decodeFromUtf8(input, value)).toBe(false);
    expect(value.pData).toBe(prior);
    const wide = new Uint16Array(2);
    expect(TextToUnicode(Uint8Array.of(195, 169), 2, wide, 1)).toBe(1);
    expect(wide[0]).toBe(233);
  } finally {
    value.dispose();
  }
});
