/** @fileoverview Original current-security QA and real MEMFS/libc HOME selection; no host directory or fake security record. */
import { beforeAll, expect, it } from "vitest";
import { initializeRuntime, getRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { getenv } from "../../../external/emscripten/locale";
import { OString } from "../../inc/rtl/string";
import { osl_getCurrentSecurity, osl_freeSecurityHandle, osl_psz_getHomeDir } from "./security";
beforeAll(
  /** Initializes the actual pinned module. @returns Completion. */ async () => {
    await initializeRuntime();
  },
);
/** Changes only native WASM HOME and preserves arbitrary byte values. @param value - Bytes or unset. @returns Nothing. */
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
/** Encodes ASCII fixture bytes. @param value - Text. @returns Bytes. */
function bytes(value: string): Uint8Array {
  return Uint8Array.from(
    value
      .split("")
      .map(/** Reads one code. @param unit - Unit. @returns ASCII. */ (unit) => unit.charCodeAt(0)),
  );
}
/** Reads actual original output bytes. @param directory - Original value. @returns Copied bytes. */
function contents(directory: OString): number[] {
  return Array.from(directory.getStr().subarray(0, directory.getLength()));
}
it("ports sal/qa/osl/security/osl_Security.cxx ctors_001", /** The original current-security constructor must produce a non-null handle. @returns Nothing. */ () => {
  const security = osl_getCurrentSecurity();
  try {
    expect(security).not.toBe(0);
  } finally {
    osl_freeSecurityHandle(security);
  }
});
it("preserves the output for a null security context", /** Native null is a genuine source failure, with no injected state. @returns Nothing. */ () => {
  const output = new OString(bytes("sentinel"), 8);
  try {
    expect(osl_psz_getHomeDir(0, output)).toBe(false);
    expect(contents(output)).toEqual(Array.from(bytes("sentinel")));
    osl_freeSecurityHandle(0);
  } finally {
    output.dispose();
  }
});
it.each([null, "", "/tmp/security-home-missing"])(
  "uses original /var/mobile fallback for HOME=%s",
  /** Missing, empty and nonexistent native HOME values use the stored selected-profile path. @param value - Fixture HOME. @returns Nothing. */ (
    value,
  ) => {
    const original = getenv("HOME"),
      security = osl_getCurrentSecurity(),
      output = new OString();
    try {
      home(value === null ? null : bytes(value));
      expect(osl_psz_getHomeDir(security, output)).toBe(true);
      expect(contents(output)).toEqual(Array.from(bytes("/var/mobile")));
    } finally {
      home(original);
      output.dispose();
      osl_freeSecurityHandle(security);
    }
  },
);
it("consults current native HOME on every lookup and accepts source access-only paths", /** Real directory, changed directory and regular file demonstrate the exact original predicate. @returns Nothing. */ () => {
  const original = getenv("HOME"),
    fs = getFileSystem(),
    security = osl_getCurrentSecurity(),
    output = new OString();
  fs.mkdir("/tmp/security-home");
  const file = fs.open("/tmp/security-home/file", "w");
  fs.close(file);
  try {
    for (const path of ["/tmp/security-home", "/", "/tmp/security-home/file"]) {
      home(bytes(path));
      expect(osl_psz_getHomeDir(security, output)).toBe(true);
      expect(contents(output)).toEqual(Array.from(bytes(path)));
    }
  } finally {
    home(original);
    output.dispose();
    osl_freeSecurityHandle(security);
    fs.unlink("/tmp/security-home/file");
    fs.rmdir("/tmp/security-home");
  }
});
