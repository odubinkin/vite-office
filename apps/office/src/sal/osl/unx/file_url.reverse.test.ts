/** @fileoverview Original UNIX reverse file URL QA and critical authority, byte/Unicode, tilde and alias contracts. */
import { getenv } from "../../../external/emscripten/locale";
import { rtl_ustr_ascii_compareIgnoreAsciiCase_WithLengths } from "../../inc/rtl/ustring.h";
import { beforeAll, afterEach, expect, it } from "vitest";
import { initializeRuntime, getFileSystem, getRuntime } from "../../../external/emscripten/runtime";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { OUString } from "../../inc/rtl/ustring";
import { OString } from "../../inc/rtl/string";
import { oslFileError, osl_getSystemPathFromFileURL } from "../../inc/osl/file";
import { getSystemPathFromFileUrl } from "./file_url";
import { osl_getLocalHostnameFQDN } from "./socket";
import { oslSocketResult } from "../../inc/osl/socket.h";
beforeAll(
  /** Initializes actual native dependencies. @returns Completion. */ async () => {
    await initializeRuntime();
  },
);
afterEach(releaseDomScope);
const upstream = [
  { id: "001_1", url: "", status: oslFileError.INVAL, output: "" },
  { id: "001_2", url: "/", status: oslFileError.INVAL, output: "" },
  { id: "001_21", url: "%2F", status: oslFileError.INVAL, output: "" },
  { id: "001_22", url: "file:///tmp%2Fmydir", status: oslFileError.INVAL, output: "" },
  { id: "001_3", url: "a", status: oslFileError.None, output: "a" },
  { id: "001_31", url: "tmpname", status: oslFileError.None, output: "tmpname" },
  { id: "001_4", url: "file://", status: oslFileError.None, output: "" },
  { id: "001_41", url: "file://localhost/tmp", status: oslFileError.None, output: "" },
  { id: "001_5", url: "file:///tmp", status: oslFileError.None, output: "/tmp" },
  { id: "001_51", url: "file://c:/tmp", status: oslFileError.INVAL, output: "" },
  { id: "001_52", url: "file:///c:/tmp", status: oslFileError.None, output: "/c:/tmp" },
  { id: "001_53", url: "file:///c|/tmp", status: oslFileError.None, output: "/c|/tmp" },
  { id: "001_6", url: "file:///tmp/first", status: oslFileError.None, output: "/tmp/first" },
  { id: "001_61", url: "file:///c:/tmp/first", status: oslFileError.None, output: "/c:/tmp/first" },
  {
    id: "001_7",
    url: "file:///tmp/../second",
    status: oslFileError.None,
    output: "/tmp/../second",
  },
  {
    id: "001_71",
    url: "file:///c:/tmp/../second",
    status: oslFileError.None,
    output: "/c:/tmp/../second",
  },
  { id: "001_8", url: "../tmp", status: oslFileError.None, output: "../tmp" },
  {
    id: "001_9",
    url: "file:///tmp/first%20second",
    status: oslFileError.None,
    output: "/tmp/first second",
  },
  {
    id: "001_91",
    url: "file:///c:/tmp/first%20second",
    status: oslFileError.None,
    output: "/c:/tmp/first second",
  },
  { id: "001_92", url: "ca@#;+.,$///78no%01ni..name", status: oslFileError.INVAL, output: "" },
];
it.each(upstream)(
  "ports osl_File.cxx getSystemPathFromFileURL_$id",
  /** Upstream empty expected output means status-only; 001_81 has no active source assertions and is not fabricated here. @param vector - Original UNIX QA vector. @returns Nothing. */ ({
    url,
    status,
    output,
  }) => {
    const result = u("");
    expect(osl_getSystemPathFromFileURL(u(url).pData, result.getDataAddress())).toBe(status);
    if (output !== "") expect(read(new OUString(result))).toBe(output);
  },
);
it("ports original getSystemPathFromFileURL_004 and _005 fixture relationships", /** Actual MEMFS tmp fixture and original UTF16 hex-escape spelling are retained. @returns Nothing. */ () => {
  const suffix =
      String.fromCharCode(0xe6, 0x9c, 0xaa, 0xe5, 0x91, 0xbd, 0xe5, 0x90, 0x8d) + "zhgb18030",
    fs = getFileSystem();
  fs.mkdir("/tmp/" + suffix);
  try {
    for (const name of ["tmpname", suffix]) {
      const output = u("");
      expect(
        osl_getSystemPathFromFileURL(u("file:///tmp/" + name).pData, output.getDataAddress()),
      ).toBe(oslFileError.None);
      expect(read(new OUString(output))).toBe("/tmp/" + name);
    }
  } finally {
    fs.rmdir("/tmp/" + suffix);
  }
});
it.each([
  ["file:", "/"],
  ["file://", "/"],
  ["file://localhost", "/"],
  ["FiLe://LOCALHOST/é", "/é"],
  ["file://127.0.0.1/a", "/a"],
  ["file:////tmp", "//tmp"],
  ["file:///a%3Fb%23c", "/a?b#c"],
  ["1:a", "1:a"],
  ["a_b:c", "a_b:c"],
  ["a+b", "a+b"],
  ["file:///é/%F0%9F%98%80", "/é/😀"],
  ["file:///%E6%9C%AA%E5%91%BD%E5%90%8D", "/未命名"],
  ["file:///bad%xx", "/bad%xx"],
])(
  "preserves source Unicode path for %s",
  /** Actual Unicode decoder and source relative/scheme distinctions. @param url - URL. @param expected - Source path. @returns Nothing. */ (
    url,
    expected,
  ) => {
    const output = u("prior");
    expect(osl_getSystemPathFromFileURL(u(url).pData, output.getDataAddress())).toBe(
      oslFileError.None,
    );
    expect(read(new OUString(output))).toBe(expected);
  },
);
it.each([
  "/absolute",
  "http:a",
  "a:b",
  "file:///a?b",
  "file:///a#b",
  "file:///a%2fb",
  "file:///a%00b",
  "file://localhost:80/a",
  "file://user@localhost/a",
  "file://[::1]/a",
  "file://remote.invalid/a",
  "file:///~other/a",
])(
  "rejects %s without changing public output",
  /** Authority never uses permissive browser URL parsing or a remote lookup. @param url - Rejected URL. @returns Nothing. */ (
    url,
  ) => {
    const output = u("prior"),
      before = output.pData;
    expect(osl_getSystemPathFromFileURL(u(url).pData, output.getDataAddress())).toBe(
      oslFileError.INVAL,
    );
    expect(output.pData).toBe(before);
  },
);
it("admits only the exact case-insensitive local FQDN spelling", /** Gets actual native cached name; a final dot remains rejected as source requires. @returns Nothing. */ () => {
  const hostname = u("");
  expect(osl_getLocalHostnameFQDN(hostname.getDataAddress())).toBe(oslSocketResult.Ok);
  const text = read(new OUString(hostname)),
    output = u("");
  expect(
    osl_getSystemPathFromFileURL(
      u("file://" + text.toUpperCase() + "/a").pData,
      output.getDataAddress(),
    ),
  ).toBe(oslFileError.None);
  expect(read(new OUString(output))).toBe("/a");
  expect(
    osl_getSystemPathFromFileURL(u("file://" + text + "." + "/a").pData, output.getDataAddress()),
  ).toBe(oslFileError.INVAL);
});
it("retains byte escaped octets and stricter literal escape rejection", /** The source byte template preserves FF, rejects malformed literals, and mutates internal NUL output before returning INVAL. @returns Nothing. */ () => {
  const output = own(new OString());
  expect(getSystemPathFromFileUrl(u("file:///a%FF"), output, true)).toBe(oslFileError.None);
  expect(Array.from(output.getStr().subarray(0, output.getLength()))).toEqual([47, 97, 255]);
  const before = output.pData;
  expect(getSystemPathFromFileUrl(u("file:///bad%xx"), output, true)).toBe(oslFileError.INVAL);
  expect(output.pData).toBe(before);
  expect(getSystemPathFromFileUrl(u("file:///a%00b"), output, true)).toBe(oslFileError.INVAL);
  expect(output.indexOf(0)).toBe(2);
  expect(getSystemPathFromFileUrl(u("file:"), output, true)).toBe(oslFileError.None);
  expect(Array.from(output.getStr().subarray(0, output.getLength()))).toEqual([47]);
});
it("supports aliased public input and output", /** Only successful temporary adoption replaces the input slot. @returns Nothing. */ () => {
  const value = u("file:///a%20b");
  expect(osl_getSystemPathFromFileURL(value.pData, value.getDataAddress())).toBe(oslFileError.None);
  expect(read(new OUString(value))).toBe("/a b");
});

/** Changes only the genuine WASM environment. @param value - HOME bytes or unset. @returns Nothing. */
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
it("resolves original tilde notation through real Security and RTL URI resolution", /** Existing HOME drives Unicode/byte recursion, dot resolution, source second-character tilde rule and relative-base failure. @returns Nothing. */ () => {
  const saved = getenv("HOME"),
    fs = getFileSystem();
  fs.mkdir("/tmp/reverse-home");
  try {
    home(new TextEncoder().encode("/tmp/reverse-home"));
    for (const [url, expected] of [
      ["file:///~/child", "/tmp/reverse-home/child"],
      ["file:/~", "/tmp/reverse-home/"],
      ["file:///~/../x", "/tmp/x"],
      ["a~/child", "/tmp/reverse-home/child"],
      ["file:~", "~"],
      ["file:///~/%7E/tail", "/tmp/reverse-home/~/tail"],
    ]) {
      const output = u("");
      expect(osl_getSystemPathFromFileURL(u(url as string).pData, output.getDataAddress())).toBe(
        oslFileError.None,
      );
      expect(read(new OUString(output))).toBe(expected);
    }
    const bytePath = own(new OString());
    expect(getSystemPathFromFileUrl(u("file:///~/child"), bytePath, true)).toBe(oslFileError.None);
    expect(Array.from(bytePath.getStr().subarray(0, bytePath.getLength()))).toEqual(
      Array.from(new TextEncoder().encode("/tmp/reverse-home/child")),
    );
    home(new TextEncoder().encode("/tmp/reverse-home/"));
    const trailing = u("");
    expect(
      osl_getSystemPathFromFileURL(u("file:///~/child").pData, trailing.getDataAddress()),
    ).toBe(oslFileError.None);
    expect(read(new OUString(trailing))).toBe("/tmp/reverse-home/child");
    home(new TextEncoder().encode("tmp/reverse-home"));
    const rejected = u("prior"),
      before = rejected.pData;
    expect(
      osl_getSystemPathFromFileURL(u("file:///~/child").pData, rejected.getDataAddress()),
    ).toBe(oslFileError.INVAL);
    expect(rejected.pData).toBe(before);
  } finally {
    home(saved);
    fs.rmdir("/tmp/reverse-home");
  }
});
it("uses original counted mixed-width ASCII-insensitive comparison", /** Explicit lengths retain embedded NULs and prefix order. @returns Nothing. */ () => {
  expect(rtl_ustr_ascii_compareIgnoreAsciiCase_WithLengths(null, 0, null, 0)).toBe(0);
  const unicode = Uint16Array.of(65, 0, 66),
    ascii = Uint8Array.of(97, 0, 98);
  expect(rtl_ustr_ascii_compareIgnoreAsciiCase_WithLengths(unicode, 3, ascii, 3)).toBe(0);
  expect(rtl_ustr_ascii_compareIgnoreAsciiCase_WithLengths(unicode, 3, ascii, 2)).toBe(1);
  expect(rtl_ustr_ascii_compareIgnoreAsciiCase_WithLengths(unicode, 2, ascii, 3)).toBe(-1);
  expect(
    rtl_ustr_ascii_compareIgnoreAsciiCase_WithLengths(Uint16Array.of(67), 1, Uint8Array.of(97), 1),
  ).toBe(2);
});
