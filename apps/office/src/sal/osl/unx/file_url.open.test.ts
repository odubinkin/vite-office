/** @fileoverview Original absolute byte path/bounded copy/public file URL open over actual MEMFS descriptors. */
import { beforeAll, afterAll, afterEach, expect, it } from "vitest";
import { initializeRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { OString } from "../../inc/rtl/string";
import {
  oslFileError as E,
  osl_openFile,
  osl_File_OpenFlag_Create,
  osl_File_OpenFlag_Read,
  type oslFileHandle,
} from "../../inc/osl/file";
import { osl_closeFile, osl_writeFile, osl_readFile, setAllowedPaths } from "./file";
import { FileURLToPath, convertUrlToPathname } from "./file_url";
import { osl_systemPathRemoveSeparator } from "./file_path_helper";
import { osl_setThreadTextEncoding } from "../../inc/osl/thread";
import { RTL_TEXTENCODING_UTF8, type rtl_TextEncoding } from "../../inc/rtl/textenc";
import { pathMax } from "../../../external/emscripten/file";
let previous: rtl_TextEncoding;
beforeAll(
  /** Initializes actual native IO and selects the source thread codec. @returns Completion. */ async () => {
    await initializeRuntime();
    previous = osl_setThreadTextEncoding(RTL_TEXTENCODING_UTF8);
  },
);
afterAll(
  /** Restores actual thread state. @returns Nothing. */ () => {
    osl_setThreadTextEncoding(previous);
  },
);
afterEach(releaseDomScope);
it("keeps original absolute-path rejection after internal byte decoding", /** Internal path mutation and public rejection are distinct source operations. @returns Nothing. */ () => {
  const path = own(new OString());
  expect(convertUrlToPathname(u("relative/a"), path)).toBe(E.INVAL);
  expect(Array.from(path.getStr().subarray(0, path.getLength()))).toEqual(
    Array.from(new TextEncoder().encode("relative/a")),
  );
});
it("retains root and original in-place trailing separator removal", /** The source helper mutates the supplied allocation and explicitly handles null. @returns Nothing. */ () => {
  osl_systemPathRemoveSeparator(null);
  for (const [text, expected] of [
    ["", ""],
    ["/", "/"],
    ["///", "/"],
    ["a///", "a"],
    ["a/b", "a/b"],
  ]) {
    const data = new TextEncoder().encode(text as string),
      value = own(new OString(data, data.length));
    osl_systemPathRemoveSeparator(value.pData);
    expect(Array.from(value.getStr().subarray(0, value.getLength()))).toEqual(
      Array.from(new TextEncoder().encode(expected as string)),
    );
    expect(value.getStr()[value.getLength()]).toBe(0);
  }
});
it("copies only fitting absolute paths and leaves failed buffers unchanged", /** Original length>=capacity check includes space for the terminator. @returns Nothing. */ () => {
  const bytes = new Uint8Array(8).fill(90);
  expect(FileURLToPath(bytes, 3, u("file:///ab/").pData)).toBe(E.OVERFLOW);
  expect(Array.from(bytes)).toEqual(Array(8).fill(90));
  expect(FileURLToPath(bytes, 4, u("file:///ab///").pData)).toBe(E.None);
  expect(Array.from(bytes.subarray(0, 4))).toEqual([47, 97, 98, 0]);
  bytes.fill(90);
  expect(FileURLToPath(bytes, bytes.length, u("relative").pData)).toBe(E.INVAL);
  expect(Array.from(bytes)).toEqual(Array(8).fill(90));
  expect(FileURLToPath(bytes, 2, u("file://").pData)).toBe(E.None);
  expect(Array.from(bytes.subarray(0, 2))).toEqual([47, 0]);
});
it("opens actual encoded file URLs through native OSL create/write/close/read", /** Real URL-to-byte conversion, source trailing-separator removal and descriptors are used. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    handle: [oslFileHandle] = [null],
    directory = "/tmp/url-open",
    filename = directory + "/é file";
  fs.mkdir(directory);
  try {
    expect(
      osl_openFile(u("file:///tmp/url-open/%C3%A9%20file").pData, handle, osl_File_OpenFlag_Create),
    ).toBe(E.None);
    const written: [bigint] = [0n];
    expect(osl_writeFile(handle[0], Uint8Array.of(1, 2, 3), 3n, written)).toBe(E.None);
    expect(written[0]).toBe(3n);
    expect(osl_closeFile(handle[0])).toBe(E.None);
    handle[0] = null;
    expect(
      osl_openFile(
        u("file:///tmp/url-open/%C3%A9%20file///").pData,
        handle,
        osl_File_OpenFlag_Read,
      ),
    ).toBe(E.None);
    const output = new Uint8Array(3),
      count: [bigint] = [0n];
    expect(osl_readFile(handle[0], output, 3n, count)).toBe(E.None);
    expect(count[0]).toBe(3n);
    expect(Array.from(output)).toEqual([1, 2, 3]);
  } finally {
    if (handle[0]) osl_closeFile(handle[0]);
    fs.unlink(filename);
    fs.rmdir(directory);
  }
});
it("validates URL and capacity before native open and preserves a live output handle", /** Actual existing descriptor remains owned by the caller on every rejected invocation. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    handle: [oslFileHandle] = [null];
  expect(
    osl_openFile(u("file:///tmp/url-open-validation").pData, handle, osl_File_OpenFlag_Create),
  ).toBe(E.None);
  try {
    const before = handle[0];
    expect(osl_openFile(null, handle, 0)).toBe(E.INVAL);
    expect(osl_openFile(u("").pData, handle, 0)).toBe(E.INVAL);
    expect(osl_openFile(u("file:///tmp/a").pData, null, 0)).toBe(E.INVAL);
    expect(osl_openFile(u("relative").pData, handle, 0)).toBe(E.INVAL);
    expect(osl_openFile(u("file://remote.invalid/a").pData, handle, 0)).toBe(E.INVAL);
    expect(osl_openFile(u("file:///" + "x".repeat(pathMax())).pData, handle, 0)).toBe(E.OVERFLOW);
    expect(handle[0]).toBe(before);
    const allowed = u("r:/tmp/url-open-validation");
    setAllowedPaths(allowed.getStr().subarray(0, allowed.getLength()));
    expect(
      osl_openFile(u("file:///tmp/url-open-denied").pData, handle, osl_File_OpenFlag_Create),
    ).toBe(E.ACCES);
    expect(handle[0]).toBe(before);
    expect(fs.readdir("/tmp")).not.toContain("url-open-denied");
  } finally {
    setAllowedPaths(new Uint16Array());
    if (handle[0]) osl_closeFile(handle[0]);
    fs.unlink("/tmp/url-open-validation");
  }
});
