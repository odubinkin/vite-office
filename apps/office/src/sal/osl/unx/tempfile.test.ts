/** @fileoverview Original temp-directory/environment and directory-create/path callback contracts over actual SDK libc/MEMFS, plus original getTempDirURL access assertions. */
import { beforeAll, beforeEach, afterEach, expect, it } from "vitest";
import { initializeRuntime, getRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { getenv } from "../../../external/emscripten/locale";
import { access } from "../../../external/emscripten/file";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { RTL_TEXTENCODING_UTF8 } from "../../inc/rtl/textenc";
import { OString } from "../../inc/rtl/string";
import { OUString, type OUStringConstReference } from "../../inc/rtl/ustring";
import { FileBase, Directory, DirectoryCreationObserver } from "../../inc/osl/file.hxx";
import * as H from "../../inc/osl/file";
import { osl_File_OpenFlag_Private } from "../../inc/osl/detail/file";
import { Mutex, MutexGuard } from "../../inc/osl/mutex";
import { osl_getGlobalMutex } from "../all/mutexshared";
import { setAllowedPaths } from "./file.access";
const base = "/tmp/native-tempfile-dir";
let saved: (Uint8Array | null)[];
beforeAll(initializeRuntime);
/** Calls actual native environment mutation only inside the existing runtime. @param name - Native environment key. @param value - Native value or absence. @returns Nothing. */
function env(name: string, value: Uint8Array | null): void {
  const runtime = getRuntime();
  if (!runtime) throw new Error("runtime absent");
  const n = runtime._malloc(name.length + 1),
    p = runtime._malloc((value?.length ?? 0) + 1);
  try {
    runtime.stringToUTF8(name, n, name.length + 1);
    if (value === null) expect(runtime._unsetenv(n)).toBe(0);
    else {
      runtime.HEAPU8.set(value, p);
      runtime.HEAPU8[p + value.length] = 0;
      expect(runtime._setenv(n, p, 1)).toBe(0);
    }
  } finally {
    runtime._free(p);
    runtime._free(n);
  }
}
/** Source ASCII environment bytes. @param text - Value. @returns Bytes. */
function ascii(text: string): Uint8Array {
  return Uint8Array.from(
    text,
    /** Checks the declared real-runtime source contract. @param c - Actual declared argument. @returns Original result or test completion. */ (
      c,
    ) => c.charCodeAt(0),
  );
}
/** Removes only this test's actual directory tree. @param path - Owned test root. @returns Nothing. */
function remove(path: string): void {
  const fs = getFileSystem();
  fs.chmod(path, 0o777);
  for (const name of fs.readdir(path)) {
    if (name === "." || name === "..") continue;
    const child = path + "/" + name;
    if ((fs.lstat(child).mode & 0o170000) === 0o040000) remove(child);
    else fs.unlink(child);
  }
  fs.rmdir(path);
}
beforeEach(
  /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
    saved = ["TMPDIR", "TEMP", "TMP"].map(getenv);
    getFileSystem().mkdir(base);
  },
);
afterEach(
  /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
    setAllowedPaths(new Uint16Array());
    ["TMPDIR", "TEMP", "TMP"].forEach(
      /** Checks the declared real-runtime source contract. @param key - Actual declared argument. @param index - Actual declared argument. @returns Original result or test completion. */ (
        key,
        index,
      ) => env(key, saved[index] ?? null),
    );
    releaseDomScope();
    remove(base);
  },
);
it("ports original FileBase::getTempDirURL_002 access assertions", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const output = own(new OUString());
  expect(FileBase.getTempDirURL(output)).toBe(H.oslFileError.None);
  const path = own(new OUString());
  expect(FileBase.getSystemPathFromFileURL(output, path)).toBe(H.oslFileError.None);
  const bytes = own(new OString(path.getStr(), path.getLength(), RTL_TEXTENCODING_UTF8));
  expect(access(bytes.getStr(), 0).result).toBe(0);
  expect(access(bytes.getStr(), 2).result).toBe(0);
  expect(access(bytes.getStr(), 4).result).toBe(0);
});
it("keeps TMPDIR/TEMP/TMP precedence, slash trimming and /tmp fallback", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const output = own(new OUString());
  for (const key of ["TMPDIR", "TEMP", "TMP"]) env(key, null);
  expect(FileBase.getTempDirURL(output)).toBe(H.oslFileError.None);
  expect(read(new OUString(output))).toBe("file:///tmp");
  env("TMP", ascii("/third///"));
  expect(FileBase.getTempDirURL(output)).toBe(H.oslFileError.None);
  expect(read(new OUString(output))).toBe("file:///third");
  env("TEMP", ascii("/second/"));
  expect(FileBase.getTempDirURL(output)).toBe(H.oslFileError.None);
  expect(read(new OUString(output))).toBe("file:///second");
  env("TMPDIR", ascii("/first//"));
  expect(FileBase.getTempDirURL(output)).toBe(H.oslFileError.None);
  expect(read(new OUString(output))).toBe("file:///first");
  env("TMPDIR", ascii("/"));
  expect(FileBase.getTempDirURL(output)).toBe(H.oslFileError.None);
  expect(read(new OUString(output))).toBe("file:///");
});
it("does not treat empty TMPDIR as absent and retains output on invalid conversion", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  env("TMPDIR", new Uint8Array());
  env("TEMP", ascii("/fallback"));
  const output = own(new OUString(u("old")));
  expect(FileBase.getTempDirURL(output)).toBe(H.oslFileError.INVAL);
  expect(read(new OUString(output))).toBe("old");
});
it("creates missing parents in original callback order with source temporary references", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const seen: string[] = [],
    refs: number[] = [];
  /** Original callback observer used by the real directory test. */ class Observer extends DirectoryCreationObserver {
    /** Checks the declared real-runtime source contract. @param url - Actual declared argument. @returns Original result or test completion. */ override DirectoryCreated(
      url: OUStringConstReference,
    ): void {
      refs.push(url.pData?.refCount ?? 0);
      seen.push(String.fromCharCode(...url.getStr().subarray(0, url.getLength())));
    }
  }
  const url = "file://" + base + "/a/b/c/";
  expect(Directory.createPath(u(url), new Observer())).toBe(H.oslFileError.None);
  expect(seen).toEqual([
    "file://" + base + "/a",
    "file://" + base + "/a/b",
    "file://" + base + "/a/b/c",
  ]);
  expect(refs).toEqual([2, 2, 2]);
  expect(Directory.createPath(u(url))).toBe(H.oslFileError.EXIST);
  expect(H.osl_createDirectoryPath(null, null, null)).toBe(H.oslFileError.INVAL);
  expect(Directory.createPath(u(base + "/invalid"))).toBe(H.oslFileError.INVAL);
});
it.each([
  [H.osl_File_OpenFlag_Read | H.osl_File_OpenFlag_Write, 0o777],
  [H.osl_File_OpenFlag_Read, 0o555],
  [H.osl_File_OpenFlag_Write, 0o222],
  [H.osl_File_OpenFlag_Read | osl_File_OpenFlag_Private, 0o500],
  [H.osl_File_OpenFlag_Write | osl_File_OpenFlag_Private, 0o200],
  [0, 0],
])(
  "preserves create mode %i",
  /** Checks the declared real-runtime source contract. @param flags - Actual declared argument. @param mode - Actual declared argument. @returns Original result or test completion. */ (
    flags,
    mode,
  ) => {
    const url = "file://" + base + "/mode";
    expect(Directory.create(u(url), flags)).toBe(H.oslFileError.None);
    expect(getFileSystem().stat(base + "/mode").mode & 0o777).toBe(mode);
    expect(Directory.remove(u(url))).toBe(H.oslFileError.None);
  },
);
it("keeps directory errors and approved creation/write gates", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const fs = getFileSystem(),
    stream = fs.open(base + "/file", "w");
  fs.close(stream);
  expect(Directory.createPath(u("file://" + base + "/file/child"))).toBe(H.oslFileError.NOTDIR);
  expect(Directory.create(u("file://" + base + "/missing/child"))).toBe(H.oslFileError.NOENT);
  expect(Directory.remove(u("file://" + base + "/file"))).toBe(H.oslFileError.NOTDIR);
  expect(Directory.remove(u("file://" + base + "/missing"))).toBe(H.oslFileError.NOENT);
  expect(Directory.create(u(base))).toBe(H.oslFileError.INVAL);
  expect(Directory.remove(u(base))).toBe(H.oslFileError.INVAL);
  setAllowedPaths(u("r:" + base).getStr());
  expect(Directory.createPath(u("file://" + base + "/denied"))).toBe(H.oslFileError.ACCES);
  expect(Directory.create(u("file://" + base + "/denied"))).toBe(H.oslFileError.ACCES);
  expect(Directory.remove(u("file://" + base))).toBe(H.oslFileError.ACCES);
});
it("uses the original shared global native OSL mutex field", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const address = osl_getGlobalMutex();
  expect(address).toBeGreaterThan(0);
  expect(osl_getGlobalMutex()).toBe(address);
  const a = Mutex.getGlobalMutex(),
    b = Mutex.getGlobalMutex();
  expect(a).toBe(b);
  const guard = new MutexGuard(a);
  guard.dispose();
  expect(a.tryToAcquire()).toBe(true);
  expect(a.release()).toBe(true);
});
it("retains original endsWith view boundaries", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const value = own(new OUString(u("ab\0cd")));
  expect(value.endsWith(Uint16Array.of(99, 100))).toBe(true);
  expect(value.endsWith(new Uint16Array())).toBe(true);
  expect(value.endsWith(Uint16Array.of(97, 98))).toBe(false);
  expect(value.endsWith(new Uint16Array(6))).toBe(false);
});
it("ports active Directory::create_001/create_003 and remove_003..005 assertions", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  const url = "file://" + base + "/qa";
  expect(Directory.create(u(url))).toBe(H.oslFileError.None);
  expect(Directory.create(u(url))).toBe(H.oslFileError.EXIST);
  expect(Directory.create(u(base + "/system"))).toBe(H.oslFileError.INVAL);
  expect(Directory.remove(u("file://" + base + "/absent"))).toBe(H.oslFileError.NOENT);
  const fs = getFileSystem(),
    file = fs.open(base + "/file", "w");
  fs.close(file);
  expect([H.oslFileError.NOTDIR, H.oslFileError.NOENT]).toContain(
    Directory.remove(u("file://" + base + "/file")),
  );
  const child = fs.open(base + "/qa/child", "w");
  fs.close(child);
  expect(Directory.remove(u(url))).toBe(H.oslFileError.NOTEMPTY);
});
it("ports Directory::createPath relative/without_callback/with_callback active assertions", /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () => {
  expect(Directory.createPath(u("hello/world"))).toBe(H.oslFileError.INVAL);
  expect(Directory.createPath(u("file://" + base + "/without/hello/world"))).toBe(
    H.oslFileError.None,
  );
  let count = 0;
  /** Original callback observer used by the real directory test. */ class Observer extends DirectoryCreationObserver {
    /** Checks the declared real-runtime source contract. @param url - Actual declared argument. @returns Original result or test completion. */ override DirectoryCreated(
      url: OUStringConstReference,
    ): void {
      void url;
      count++;
    }
  }
  expect(Directory.createPath(u("file://" + base + "/hello/world"), new Observer())).toBe(
    H.oslFileError.None,
  );
  expect(count).toBe(2);
});
