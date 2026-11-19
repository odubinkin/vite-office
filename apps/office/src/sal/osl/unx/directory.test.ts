/** @fileoverview Original UNIX Directory constructor/open/isOpen/close/reset/getNextItem QA and C output-slot/lifetime boundaries through actual libc DIR cursors in MEMFS. */
import { beforeAll, beforeEach, afterEach, expect, it } from "vitest";
import { initializeRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { Directory, DirectoryItem, FileStatus } from "../../inc/osl/file.hxx";
import * as H from "../../inc/osl/file";
import { setAllowedPaths } from "./file.access";
import { OString } from "../../inc/rtl/string";
import { systemPathMakeAbsolutePath } from "./file_path_helper";
const E = H.oslFileError,
  root = "/tmp/native-directory-cursor";
beforeAll(initializeRuntime);
/** Writes independent fixture bytes through actual SDK file handles. @param path - Fixture pathname. @param bytes - Independent contents. @returns Nothing. */
function write(path: string, bytes: Uint8Array): void {
  const fs = getFileSystem(),
    stream = fs.open(path, "w");
  try {
    expect(fs.write(stream, bytes, 0, bytes.length)).toBe(bytes.length);
  } finally {
    fs.close(stream);
  }
}
beforeEach(
  /** Creates genuine files used by the original directory cases. @returns Nothing. */ () => {
    const fs = getFileSystem();
    fs.mkdir(root);
    write(root + "/tmpname", Uint8Array.of(1));
    write(root + "/tmpdir", Uint8Array.of(2));
    write(root + "/.hidden", Uint8Array.of(3));
  },
);
afterEach(
  /** Releases native cursors before removing their fixture paths. @returns Nothing. */ () => {
    setAllowedPaths(new Uint16Array());
    releaseDomScope();
    const fs = getFileSystem();
    for (const name of fs.readdir(root)) {
      if (name === "." || name === "..") continue;
      const path = root + "/" + name;
      if ((fs.lstat(path).mode & 0o170000) === 0o040000) fs.rmdir(path);
      else fs.unlink(path);
    }
    fs.rmdir(root);
  },
);
/** Constructs a source wrapper without opening it. @param path - URL or intentionally invalid path. @returns Scoped owner. */
function directory(path = "file://" + root): Directory {
  return own(new Directory(u(path)));
}
/** Reads the current item's source filename. @param item - Actual directory item. @returns Filename. */
function filename(item: DirectoryItem): string {
  const status = own(new FileStatus(H.osl_FileStatus_Mask_FileName));
  expect(item.getFileStatus(status)).toBe(E.None);
  return read(status.getFileName());
}
it("ports ctors_001/002, open_001, isOpen_001/002 and close_001/002", /** Runs the original success and unopened assertions. @returns Nothing. */ () => {
  const value = directory();
  expect(value.isOpen()).toBe(false);
  expect(value.close()).toBe(E.BADF);
  expect(read(value.getURL())).toBe("file://" + root);
  expect(value.open()).toBe(E.None);
  expect(value.isOpen()).toBe(true);
  expect(value.close()).toBe(E.None);
  expect(value.isOpen()).toBe(false);
  const relative = directory("file://" + root + "/../native-directory-cursor/./");
  expect(relative.open()).toBe(E.None);
  expect(relative.close()).toBe(E.None);
});
it("ports open_002/003/004 and reset_002/003/004", /** Uses real missing paths, system paths and regular files. @returns Nothing. */ () => {
  for (const [path, expected] of [
    ["file://" + root + "/missing", E.NOENT],
    [root, E.INVAL],
    ["file://" + root + "/tmpname", E.NOTDIR],
  ] as const) {
    const value = directory(path);
    expect(value.open()).toBe(expected);
    expect(value.isOpen()).toBe(false);
    expect(value.reset()).toBe(expected);
  }
});
it("ports getNextItem_001/002/003 and reset_001", /** Checks the original three names, default hints, exhaustion and reset position. @returns Nothing. */ () => {
  const value = directory(),
    item = own(new DirectoryItem());
  expect(value.getNextItem(item)).toBe(E.INVAL);
  expect(value.open()).toBe(E.None);
  expect(value.getNextItem(item, 1)).toBe(E.None);
  const first = filename(item);
  expect(value.reset()).toBe(E.None);
  expect(value.getNextItem(item)).toBe(E.None);
  expect(filename(item)).toBe(first);
  const names = [first];
  for (let i = 0; i < 2; ++i) {
    expect(value.getNextItem(item, 3)).toBe(E.None);
    names.push(filename(item));
  }
  expect(names.sort()).toEqual([".hidden", "tmpdir", "tmpname"]);
  expect(value.getNextItem(item, 3)).toBe(E.NOENT);
  expect(item.is()).toBe(false);
  expect(value.getNextItem(item)).toBe(E.NOENT);
  expect(value.close()).toBe(E.None);
});
it("ports UNIX getNextItem_004 and preserves raw Unicode, percent and dangling-link names", /** Reads actual native dirent names and d_type without following links. @returns Nothing. */ () => {
  const fs = getFileSystem();
  fs.symlink(root + "/tmpname", root + "/link.file");
  fs.symlink(root + "/missing", root + "/dangling");
  write(root + "/Ж% 目录", Uint8Array.of(4));
  fs.mkdir(root + "/folder");
  const value = directory("file://" + root + "///"),
    item = own(new DirectoryItem()),
    found = new Map<string, H.oslFileType>();
  expect(value.open()).toBe(E.None);
  while (value.getNextItem(item, 4) === E.None) {
    const name = filename(item),
      status = own(new FileStatus(H.osl_FileStatus_Mask_Type));
    expect(item.getFileStatus(status)).toBe(E.None);
    found.set(name, status.getFileType());
  }
  expect(found.get("link.file")).toBe(H.oslFileType.Link);
  expect(found.get("dangling")).toBe(H.oslFileType.Link);
  expect(found.get("folder")).toBe(H.oslFileType.Directory);
  expect(found.get("Ж% 目录")).toBe(H.oslFileType.Regular);
  expect(found.has(".")).toBe(false);
  expect(found.has("..")).toBe(false);
});
it("retains C slots on failure and exhaustion but releases replaced items on success", /** Contrasts the original C and C++ wrapper slot contracts using real references. @returns Nothing. */ () => {
  const slot: [H.oslDirectory] = [null],
    item: [H.oslDirectoryItem] = [null];
  expect(H.osl_openDirectory(null, slot)).toBe(E.INVAL);
  expect(H.osl_openDirectory(u("").pData, slot)).toBe(E.INVAL);
  expect(H.osl_openDirectory(u("file://" + root).pData, null)).toBe(E.INVAL);
  expect(H.osl_closeDirectory(null)).toBe(E.INVAL);
  expect(H.osl_getNextDirectoryItem(null, item, 0)).toBe(E.INVAL);
  expect(H.osl_openDirectory(u("file://" + root).pData, slot)).toBe(E.None);
  const original = slot[0];
  try {
    expect(H.osl_openDirectory(u("file://" + root + "/missing").pData, slot)).toBe(E.NOENT);
    expect(slot[0]).toBe(original);
    expect(H.osl_getNextDirectoryItem(slot[0], null, 0)).toBe(E.INVAL);
    expect(H.osl_getNextDirectoryItem(slot[0], item, 0)).toBe(E.None);
    const retained = item[0];
    expect(H.osl_acquireDirectoryItem(retained)).toBe(E.None);
    expect(H.osl_getNextDirectoryItem(slot[0], item, 0)).toBe(E.None);
    expect(retained?.m_strFilePath.getLength()).toBeGreaterThan(0);
    expect(H.osl_releaseDirectoryItem(retained)).toBe(E.None);
    expect(H.osl_getNextDirectoryItem(slot[0], item, 0)).toBe(E.None);
    const last = item[0];
    expect(H.osl_getNextDirectoryItem(slot[0], item, 0)).toBe(E.NOENT);
    expect(item[0]).toBe(last);
  } finally {
    H.osl_releaseDirectoryItem(item[0]);
    expect(H.osl_closeDirectory(slot[0])).toBe(E.None);
  }
});
it("applies the original read gate before native opendir", /** Uses the existing approved path policy without changing its prefix semantics. @returns Nothing. */ () => {
  const allowed = u("r:" + root + "/tmpname");
  setAllowedPaths(allowed.getStr().subarray(0, allowed.getLength()));
  expect(directory().open()).toBe(E.ACCES);
});
it("ports the byte absolute-path helper without normalization", /** Covers empty, root and terminated/unterminated base separators. @returns Nothing. */ () => {
  for (const [base, relative, expected] of [
    ["", "name", "name"],
    ["/", "name", "/name"],
    ["/base/", "../x", "/base/../x"],
    ["/base", "name", "/base/name"],
  ] as const) {
    const b = own(new OString(new TextEncoder().encode(base), base.length)),
      r = own(new OString(new TextEncoder().encode(relative), relative.length));
    const result = own(systemPathMakeAbsolutePath(b, r));
    expect(new TextDecoder().decode(result.getStr().subarray(0, result.getLength()))).toBe(
      expected,
    );
  }
});
