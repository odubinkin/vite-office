/** @fileoverview Original UNIX getFileURLFromSystemPath QA plus native HOME/alias/encoding contracts. */
import { beforeAll, afterEach, expect, it } from "vitest";
import { initializeRuntime, getRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { getenv } from "../../../external/emscripten/locale";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { OUString } from "../../inc/rtl/ustring";
import { oslFileError, osl_getFileURLFromSystemPath } from "../../inc/osl/file";
import { Security } from "../../inc/osl/security";
import { osl_getHomeDir } from "../../inc/osl/security.h";
import { osl_setThreadTextEncoding } from "../../inc/osl/thread";
import { RTL_TEXTENCODING_UTF8 } from "../../inc/rtl/textenc";
beforeAll(
  /** Initializes actual libc/OSL. @returns Completion. */ async () => {
    await initializeRuntime();
  },
);
afterEach(releaseDomScope);
/** Changes actual WASM HOME, preserving arbitrary native bytes and restoring in callers. @param value - Native bytes or unset. @returns Nothing. */
function home(value: Uint8Array | null): void {
  const module = getRuntime() as NonNullable<ReturnType<typeof getRuntime>>,
    key = module._malloc(5),
    input = module._malloc((value?.length ?? 0) + 1);
  try {
    module.stringToUTF8("HOME", key, 5);
    if (value === null) expect(module._unsetenv(key)).toBe(0);
    else {
      module.HEAPU8.set(value, input);
      module.HEAPU8[input + value.length] = 0;
      expect(module._setenv(key, input, 1)).toBe(0);
    }
  } finally {
    module._free(input);
    module._free(key);
  }
}
/** Encodes valid Unicode fixture bytes. @param value - Text. @returns UTF8. */
function bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
/** Calls the original C entry point with actual source/output RTL values. @param path - Path. @param expected - Expected result. @returns Actual output text. */
function convert(path: string, expected = oslFileError.None): string {
  const input = u(path),
    output = u("");
  expect(osl_getFileURLFromSystemPath(input.pData, output.getDataAddress())).toBe(expected);
  return read(new OUString(output));
}
it.each([
  { id: "002", path: "c:/tmp", status: oslFileError.None, expected: "c:/tmp" },
  { id: "003", path: "file:///temp", status: oslFileError.INVAL, expected: "" },
  {
    id: "004",
    path: "//tmp//first start",
    status: oslFileError.None,
    expected: "file:///tmp/first%20start",
  },
  {
    id: "004_1",
    path: "/tmp///first start",
    status: oslFileError.None,
    expected: "file:///tmp/first%20start",
  },
  { id: "005", path: "", status: oslFileError.INVAL, expected: "" },
])(
  "ports osl_File.cxx getFileURLFromSystemPath_$id",
  /** Original UNIX branch vectors. @param vector - Original input/status/output vector. @returns Nothing. */ ({
    path,
    status,
    expected,
  }) => {
    expect(convert(path, status)).toBe(expected);
  },
);
it("ports osl_File.cxx getFileURLFromSystemPath_001 using real HOME", /** Original ~/tmp expansion consumes genuine current-security/home calls. @returns Nothing. */ () => {
  const saved = getenv("HOME"),
    fs = getFileSystem();
  fs.mkdir("/tmp/public-home");
  try {
    home(bytes("/tmp/public-home"));
    expect(convert("~/tmp")).toBe("file:///tmp/public-home/tmp");
  } finally {
    home(saved);
    fs.rmdir("/tmp/public-home");
  }
});
it.each(["", "file:///tmp", "~other/path"])(
  "preserves a prior output on rejection of %s",
  /** Original early return leaves the caller's prior owner intact. @param path - Rejected input. @returns Nothing. */ (
    path,
  ) => {
    const input = u(path),
      output = u("prior"),
      before = output.pData;
    expect(osl_getFileURLFromSystemPath(input.pData, output.getDataAddress())).toBe(
      oslFileError.INVAL,
    );
    expect(output.pData).toBe(before);
    expect(read(new OUString(output))).toBe("prior");
  },
);
it.each([
  ["/", "file:///"],
  ["relative/a b", "relative/a%20b"],
  ["/a/../b/./c", "file:///a/../b/./c"],
  ["/é/😀", "file:///%C3%A9/%F0%9F%98%80"],
  ["/a%20b/#?", "file:///a%2520b/%23%3F"],
  ["FILE:/tmp", "FILE:/tmp"],
  ["////", "file:///"],
  ["x//y///z/", "x/y/z/"],
])(
  "retains source path encoding for %s",
  /** No browser URL normalization is introduced. @param path - Input. @param expected - Source output. @returns Nothing. */ (
    path,
    expected,
  ) => {
    expect(convert(path)).toBe(expected);
  },
);
it("supports the original aliased input/output slot", /** Actual RTL ref acquisition protects input during output replacement and slash compaction. @returns Nothing. */ () => {
  const value = u("//é///a b");
  expect(osl_getFileURLFromSystemPath(value.pData, value.getDataAddress())).toBe(oslFileError.None);
  expect(read(new OUString(value))).toBe("file:///%C3%A9/a%20b");
});
it("uses original Security wrapper and returns source fallback as a URL", /** Constructor/home/getHandle/destructor use genuine native context. @returns Nothing. */ () => {
  const saved = getenv("HOME"),
    security = own(new Security()),
    output = u("prior");
  try {
    home(null);
    expect(security.getHandle()).not.toBe(0);
    expect(security.getHomeDir(output)).toBe(true);
    expect(read(new OUString(output))).toBe("file:///var/mobile");
    expect(convert("~")).toBe("file:///var/mobile");
  } finally {
    home(saved);
  }
});
it("preserves public home output on null context", /** Original byte-home failure skips both output conversions. @returns Nothing. */ () => {
  const output = u("prior"),
    before = output.pData;
  expect(osl_getHomeDir(0, output.getDataAddress())).toBe(false);
  expect(output.pData).toBe(before);
});
it("retains source tilde expansion encoding and slash-index adaptation", /** Existing UTF8 HOME exercises the original URL-then-encode sequence, including escaped percent encoding. @returns Nothing. */ () => {
  const saved = getenv("HOME"),
    fs = getFileSystem(),
    previous = osl_setThreadTextEncoding(RTL_TEXTENCODING_UTF8);
  fs.mkdir("/tmp/home é");
  try {
    home(bytes("/tmp/home é"));
    expect(convert("~//child///name")).toBe("file:///tmp/home%2520%25C3%25A9/child/name");
  } finally {
    home(saved);
    osl_setThreadTextEncoding(previous);
    fs.rmdir("/tmp/home é");
  }
});
it("retains getHomeDir success when source path conversion rejects HOME", /** A real accessible file:-prefixed relative filename exposes the original deliberately ignored conversion status. @returns Nothing. */ () => {
  const saved = getenv("HOME"),
    fs = getFileSystem(),
    security = own(new Security()),
    output = u("prior"),
    stream = fs.open("/file:public-home", "w");
  fs.close(stream);
  try {
    home(bytes("file:public-home"));
    expect(security.getHomeDir(output)).toBe(true);
    expect(read(new OUString(output))).toBe("file:public-home");
  } finally {
    home(saved);
    fs.unlink("/file:public-home");
  }
});
