/** @fileoverview Original approved OSL allowed-path and native openFilePath contracts over genuine MEMFS/libc. */
import { beforeAll, afterEach, expect, it } from "vitest";
import { initializeRuntime, getRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { pathMax, lockFile as nativeLockFile } from "../../../external/emscripten/file";
import { OString } from "../../inc/rtl/string";
import { setAllowedPaths, isForbidden } from "./file.access";
import {
  openFilePath,
  osl_closeFile,
  osl_writeFile,
  osl_readFile,
  osl_setFilePos,
  type oslFileHandle,
} from "./file";
import {
  oslFileError as E,
  osl_File_OpenFlag_Read as R,
  osl_File_OpenFlag_Write as W,
  osl_File_OpenFlag_Create as C,
  osl_File_OpenFlag_NoLock as NL,
  osl_Pos_Absolut,
} from "../../inc/osl/file";
import {
  osl_File_OpenFlag_NoExcl as NX,
  osl_File_OpenFlag_Trunc as T,
  osl_File_OpenFlag_Private as P,
} from "../../inc/osl/detail/file";
const base = "/tmp/osl-access",
  read = base + "/read",
  write = base + "/write",
  execute = base + "/execute";
/** Creates the original UTF16 view without a terminator. @param value - Text. @returns Units. */
function view(value: string): Uint16Array {
  return Uint16Array.from(
    value
      .split("")
      .map(
        /** Converts one UTF16 unit. @param unit - Unit. @returns Numeric unit. */ (unit) =>
          unit.charCodeAt(0),
      ),
  );
}
/** Creates a real original OString byte value. @param value - ASCII fixture path. @returns Owned string. */
function bytes(value: string): OString {
  const data = Uint8Array.from(
    value
      .split("")
      .map(
        /** Converts an ASCII unit. @param unit - Unit. @returns Byte. */ (unit) =>
          unit.charCodeAt(0),
      ),
  );
  return new OString(data, data.length);
}
/** Calls the production predicate with an actual value. @param value - Path. @param flags - OSL flags. @returns Source result. */
function forbidden(value: string, flags = R): boolean {
  const path = bytes(value);
  try {
    return isForbidden(path, flags);
  } finally {
    path.dispose();
  }
}
/** Calls the original native-path open entry point. @param value - Path. @param flags - OSL flags. @param slot - Output handle slot. @param mode - Original mode. @returns Source error. */
function open(value: string, flags: number, slot: [oslFileHandle], mode = -1): E {
  const path = bytes(value);
  try {
    return openFilePath(path, slot, flags, mode);
  } finally {
    path.dispose();
  }
}
/** Creates a genuine existing MEMFS fixture file. @param value - Path. @returns Nothing. */
function fixture(value: string): void {
  const fs = getFileSystem(),
    stream = fs.open(value, "w+");
  fs.write(stream, Uint8Array.of(65, 66, 67), 0, 3);
  fs.close(stream);
}

beforeAll(
  /** Initializes native APIs and actual fixture directories. @returns Completion. */ async () => {
    expect(getRuntime()).toBeUndefined();
    expect(pathMax).toThrow("must be initialized");
    await initializeRuntime();
    const runtime = getRuntime() as NonNullable<ReturnType<typeof getRuntime>>,
      key = runtime._malloc(24),
      value = runtime._malloc(1);
    runtime.stringToUTF8("SAL_ENABLE_FILE_LOCKING", key, 24);
    runtime.HEAPU8[value] = 0;
    expect(runtime._setenv(key, value, 1)).toBe(0);
    runtime._free(value);
    runtime._free(key);
    const fs = getFileSystem();
    for (const path of [base, read, write, execute, read + "-other"]) fs.mkdir(path);
    for (const path of [read + "/a", write + "/a", execute + "/a", read + "-other/a"])
      fixture(path);
    fs.symlink(write, read + "/to-write");
    fs.symlink(read, write + "/to-read");
  },
);
afterEach(
  /** Restores the source default allow-all configuration. @returns Nothing. */ () =>
    setAllowedPaths(new Uint16Array()),
);

it("retains read/write/create/execute mode lists and literal prefix behavior", /** Executes original list selection on existing and new native paths. @returns Nothing. */ () => {
  setAllowedPaths(view("r:" + read + ":w:" + write + ":x:" + execute));
  expect(forbidden(read + "/a")).toBe(false);
  expect(forbidden(read + "/a", W)).toBe(true);
  expect(forbidden(write + "/a")).toBe(false);
  expect(forbidden(write + "/new", C)).toBe(false);
  expect(forbidden(execute + "/a")).toBe(true);
  expect(forbidden(execute + "/a", 0x80)).toBe(false);
  expect(forbidden(execute + "/a", 0x80 | W)).toBe(true);
  expect(forbidden(read + "-other/a")).toBe(false);
  expect(forbidden(base + "/outside", R)).toBe(true);
});
it("resolves actual symlinks and recursively checks nonexistent parents", /** Uses native realpath rather than lexical normalization. @returns Nothing. */ () => {
  setAllowedPaths(view("r:" + read));
  expect(forbidden(read + "/to-write/a")).toBe(true);
  expect(forbidden(write + "/to-read/a")).toBe(false);
  expect(forbidden(read + "/missing/deeper/file")).toBe(false);
  expect(forbidden(write + "/missing/deeper/file")).toBe(true);
  expect(forbidden(read + "/../write/a")).toBe(true);
});
it("preserves empty-read bypass, single-character mode tokens and reset", /** Retains source defaults even for execute-only or root tokens. @returns Nothing. */ () => {
  expect(forbidden(base + "/anything", C)).toBe(false);
  setAllowedPaths(view("x:" + execute));
  expect(forbidden(write + "/a", W)).toBe(false);
  setAllowedPaths(view("/"));
  expect(forbidden(write + "/a", W)).toBe(false);
  setAllowedPaths(view("r:" + read + "::z:" + write));
  expect(forbidden(write + "/a")).toBe(true);
  setAllowedPaths(new Uint16Array());
  expect(forbidden(write + "/a", W)).toBe(false);
});
it("retains missing-final-component setup, partial early-return and native path bounds", /** Exercises real missing-parent and ENOTDIR paths. @returns Nothing. */ () => {
  setAllowedPaths(view("r:" + read + "/new"));
  expect(forbidden(read + "/new")).toBe(false);
  expect(forbidden(read + "/a")).toBe(true);
  setAllowedPaths(view("r:" + read + ":" + base + "/missing/leaf:w:" + write));
  expect(forbidden(read + "/a")).toBe(false);
  expect(forbidden(write + "/a", W)).toBe(true);
  setAllowedPaths(view("r:" + read + ":" + read + "/a/child"));
  expect(forbidden(write + "/a")).toBe(true);
  expect(forbidden(read + "/a/child")).toBe(false);
  expect(forbidden(read + "/" + "x".repeat(pathMax()))).toBe(true);
});
it("rejects before truncating/creating and leaves the output slot unchanged", /** Verifies the security hook runs before the actual native open. @returns Nothing. */ () => {
  setAllowedPaths(view("r:" + read));
  const slot: [oslFileHandle] = [null];
  expect(open(write + "/a", W | T, slot)).toBe(E.ACCES);
  expect(slot[0]).toBeNull();
  expect(getFileSystem().stat(write + "/a").size).toBe(3);
  expect(open(write + "/not-created", C, slot)).toBe(E.ACCES);
  expect(
    /** Checks that denied creation did not alter the filesystem. @returns Native stat result. */ () =>
      getFileSystem().stat(write + "/not-created"),
  ).toThrow();
  expect(open(read + "/a", R, slot)).toBe(E.None);
  const prior = slot[0];
  expect(open(write + "/a", W, slot)).toBe(E.ACCES);
  expect(slot[0]).toBe(prior);
  expect(osl_closeFile(prior)).toBe(E.None);
});
it("creates actual writable handles, preserves exclusive/default/private/mode and truncation rules", /** Reads/writes through original buffered OSL APIs and checks actual native file status. @returns Nothing. */ () => {
  setAllowedPaths(view("w:" + write));
  const slot: [oslFileHandle] = [null],
    count: [bigint] = [0n],
    data = Uint8Array.of(120, 121);
  expect(open(write + "/created", C | P | NL, slot)).toBe(E.None);
  expect(getFileSystem().stat(write + "/created").mode & 0o777).toBe(0o600);
  expect(osl_writeFile(slot[0], data, 2n, count)).toBe(E.None);
  expect(count[0]).toBe(2n);
  expect(osl_closeFile(slot[0])).toBe(E.None);
  slot[0] = null;
  expect(open(write + "/created", C | NL, slot)).toBe(E.EXIST);
  expect(slot[0]).toBeNull();
  expect(open(write + "/created", C | NX | T | NL, slot)).toBe(E.None);
  expect(getFileSystem().stat(write + "/created").size).toBe(0);
  expect(osl_closeFile(slot[0])).toBe(E.None);
  expect(open(write + "/defaults", C | NL, slot)).toBe(E.None);
  expect(getFileSystem().stat(write + "/defaults").mode & 0o777).toBe(0o666);
  expect(osl_closeFile(slot[0])).toBe(E.None);
  expect(open(write + "/a", 0, slot)).toBe(E.None);
  expect(osl_closeFile(slot[0])).toBe(E.None);
  expect(open(write + "/mode", C | W | NL, slot, 0o640)).toBe(E.None);
  expect(getFileSystem().stat(write + "/mode").mode & 0o777).toBe(0o640);
  expect(osl_closeFile(slot[0])).toBe(E.None);
  expect(open(write + "/a", R, slot)).toBe(E.None);
  expect(osl_writeFile(slot[0], data, 2n, count)).toBe(E.BADF);
  expect(osl_setFilePos(slot[0], osl_Pos_Absolut, 0n)).toBe(E.None);
  expect(osl_readFile(slot[0], data, 2n, count)).toBe(E.None);
  expect(Array.from(data)).toEqual([65, 66]);
  expect(osl_closeFile(slot[0])).toBe(E.None);
});
it("retains genuine native error translation and regular-file restriction", /** Uses actual missing files/directories and native optional-lock calls. @returns Nothing. */ () => {
  const slot: [oslFileHandle] = [null];
  expect(nativeLockFile(-1)).toBe(8);
  expect(open(base + "/absent", R, slot)).toBe(E.NOENT);
  expect(open(read, R, slot)).toBe(E.INVAL);
  expect(slot[0]).toBeNull();
  expect(open(write + "/a", W, slot)).toBe(E.None);
  expect(osl_closeFile(slot[0])).toBe(E.None);
});

it("ports every active upstream Forbidden::forbidden assertion", /** Preserves the complete original sal/qa/osl/file/forbidden.cxx test sequence; only directory setup uses actual MEMFS paths. @returns Nothing. */ () => {
  const good = read,
    bad = write;
  setAllowedPaths(view(good));
  expect(forbidden(".", R)).toBe(true);
  expect(forbidden("", R)).toBe(true);
  expect(forbidden("a", R)).toBe(true);
  expect(forbidden("/", R)).toBe(true);
  expect(forbidden(good + "/notthere/file", R)).toBe(false);
  expect(forbidden(bad, R)).toBe(true);
  expect(forbidden(good, R)).toBe(false);
  expect(forbidden(good, W)).toBe(true);
  expect(forbidden(good, C)).toBe(true);
  expect(forbidden(good, 0x80)).toBe(true);
  expect(forbidden(bad + "/notthere", W)).toBe(true);
  setAllowedPaths(view("w:" + good + ":x:" + bad));
  expect(forbidden(bad, R)).toBe(true);
  expect(forbidden(good, R)).toBe(false);
  expect(forbidden(good, W)).toBe(false);
  expect(forbidden(good, 0x80)).toBe(true);
  expect(forbidden(bad, 0x80)).toBe(false);
  setAllowedPaths(view(":r:" + bad));
  expect(forbidden(good + "/notthere", W)).toBe(true);
  expect(forbidden(good + "/notthere/file", W)).toBe(true);
  setAllowedPaths(view(":r:" + bad + ":w:" + good + "/notthere"));
  expect(forbidden(good + "/notthere", W)).toBe(false);
  expect(forbidden(good + "/notthere/file", W)).toBe(false);
});
