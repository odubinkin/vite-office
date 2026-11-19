/** @fileoverview Original DirectoryHelper scan/delete and TempFileNamed parent/directory/base contracts over actual OSL/libc/RTL owners. Independent MEMFS fixture operations expose retained dot/link/percent source quirks without a fake provider. */
import { beforeAll, beforeEach, afterEach, expect, it } from "vitest";
import { initializeRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { getpid } from "../../../external/emscripten/file";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { FileBase, DirectoryItem, File } from "../../../sal/inc/osl/file.hxx";
import * as H from "../../../sal/inc/osl/file";
import { SvMemoryStream, StreamMode } from "../../../tools/inc/stream";
import {
  TempFileNamed,
  UniqueTokens,
  CreateTempName,
  CreateTempURL,
  SetTempNameBaseDirectory,
  GetTempNameBaseDirectory,
} from "../../../unotools/inc/tempfile";
import {
  fileExists,
  dirExists,
  scanDirsAndFiles,
  deleteDirRecursively,
  DirectoryNames,
  DirectoryFiles,
} from "./directoryhelper";
const root = "/tmp/native-directoryhelper";
beforeAll(initializeRuntime);
/** Writes independent fixture bytes to a real SDK file handle. @param path - Fixture path. @returns Nothing. */
function write(path: string): void {
  const fs = getFileSystem(),
    file = fs.open(path, "w");
  try {
    fs.write(file, Uint8Array.of(7), 0, 1);
  } finally {
    fs.close(file);
  }
}
/** Removes test leftovers independently, including entries the original helper deliberately skips. @param path - Actual fixture path. @returns Nothing. */
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
  /** Creates this test's private fixture root. @returns Nothing. */ () => {
    getFileSystem().mkdir(root);
  },
);
afterEach(
  /** Destroys native owners before independent filesystem cleanup. @returns Nothing. */ () => {
    releaseDomScope();
    remove(root);
  },
);
/** Reads a borrowed string while preserving its source owner. @param value - Source string. @returns UTF16 text. */
function text(value: OUString): string {
  return read(new OUString(value));
}
/** Reports actual ordered scan sets without consuming their elements. @param path - Directory URL. @returns Scalar names and pairs. */
function scan(path: string): { directories: string[]; files: string[][] } {
  const directories = own(new DirectoryNames()),
    files = own(new DirectoryFiles());
  scanDirsAndFiles(u(path), directories, files);
  return {
    directories: [...directories].map(text),
    files: [...files].map(
      /** Reads one borrowed original pair. @param pair - Native basename/extension pair. @returns Scalar pair. */ (
        pair,
      ) => [text(pair[0]), text(pair[1])],
    ),
  };
}
it("keeps original open-based existence behavior and returns false for empty/missing/system paths", /** Uses genuine OSL open operations rather than metadata-only substitutions. @returns Nothing. */ () => {
  write(root + "/file");
  expect(fileExists(u("file://" + root + "/file"))).toBe(true);
  expect(fileExists(u("file://" + root))).toBe(false);
  expect(dirExists(u("file://" + root))).toBe(true);
  expect(dirExists(u("file://" + root + "/file"))).toBe(false);
  for (const path of ["", root, "file://" + root + "/missing"]) {
    expect(fileExists(u(path))).toBe(false);
    expect(dirExists(u(path))).toBe(false);
  }
});
it("accumulates copied unique UTF16-sorted names and lexicographic basename/extension pairs", /** Exercises the actual set value specialization through repeated source scans. @returns Nothing. */ () => {
  const fs = getFileSystem();
  for (const name of ["b", "a", "A"]) fs.mkdir(root + "/" + name);
  for (const name of ["same.b", "same.a", "plain", "Ж.文", "name.", "name", ".hidden", ".kept.txt"])
    write(root + "/" + name);
  fs.symlink(root + "/plain", root + "/link");
  fs.symlink(root + "/missing", root + "/dangling");
  const directories = own(new DirectoryNames()),
    files = own(new DirectoryFiles());
  const retained = u("z");
  expect(directories.insert(retained)).toBe(true);
  expect(directories.insert(retained)).toBe(false);
  scanDirsAndFiles(u("file://" + root), directories, files);
  scanDirsAndFiles(u("file://" + root), directories, files);
  scanDirsAndFiles(u(""), directories, files);
  scanDirsAndFiles(u("file://" + root + "/missing"), directories, files);
  expect(directories.size()).toBe(4);
  expect([...directories].map(text)).toEqual(["A", "a", "b", "z"]);
  expect(
    [...files].map(
      /** Reads native pair values for comparison. @param pair - Stored pair. @returns Scalar pair. */ (
        pair,
      ) => [text(pair[0]), text(pair[1])],
    ),
  ).toEqual([
    ["%D0%96", "%E6%96%87"],
    [".kept", "txt"],
    ["name", ""],
    ["plain", ""],
    ["same", "a"],
    ["same", "b"],
  ]);
  expect(files.size()).toBe(6);
  directories.clear();
  expect(directories.size()).toBe(0);
  expect(text(retained)).toBe("z");
});
it("removes nested ordinary Unicode/space files and directories and reports false on success", /** Asserts final state using independent SDK lstat, including empty directories. @returns Nothing. */ () => {
  const fs = getFileSystem();
  fs.mkdir(root + "/tree");
  fs.mkdir(root + "/tree/文 dir");
  fs.mkdir(root + "/tree/empty");
  write(root + "/tree/文 dir/Ж file.xml");
  write(root + "/tree/plain");
  expect(deleteDirRecursively(u("file://" + root + "/tree"))).toBe(false);
  expect(dirExists(u("file://" + root + "/tree"))).toBe(false);
  expect(deleteDirRecursively(u("file://" + root + "/missing"))).toBe(true);
  expect(deleteDirRecursively(u(""))).toBe(true);
});
it("retains source dotfile/link skips and still attempts later siblings after a recursive failure", /** Real remaining entries expose error aggregation without forced statuses. @returns Nothing. */ () => {
  const fs = getFileSystem();
  fs.mkdir(root + "/a-failure");
  fs.mkdir(root + "/b-success");
  write(root + "/a-failure/.hidden");
  write(root + "/b-success/plain");
  write(root + "/later");
  fs.symlink(root + "/missing", root + "/dangling");
  expect(deleteDirRecursively(u("file://" + root))).toBe(true);
  expect(fs.readdir(root).sort()).toEqual([".", "..", "a-failure", "dangling"]);
  expect(fs.readdir(root + "/a-failure")).toContain(".hidden");
});
it("preserves source trailing-dot reconstruction and independently encoded literal percent names", /** Source scan collapses trailing-dot pairs while percent and space names stay distinct. @returns Nothing. */ () => {
  const fs = getFileSystem();
  write(root + "/name.");
  write(root + "/name");
  write(root + "/a%20b");
  write(root + "/a b");
  expect(scan("file://" + root).files).toEqual([
    ["a%20b", ""],
    ["a%2520b", ""],
    ["name", ""],
  ]);
  expect(deleteDirRecursively(u("file://" + root))).toBe(true);
  expect(fs.readdir(root).sort()).toEqual([".", "..", "name."]);
});
it("uses the original parent validation, invalid-parent fallback and accepted regular-file failure", /** Validates named private files using real URLs, modes and original memory fallback. @returns Nothing. */ () => {
  const fs = getFileSystem();
  fs.mkdir(root + "/parent");
  write(root + "/regular");
  const file = own(new TempFileNamed(u("file://" + root + "/parent///")));
  file.EnableKillingFile();
  expect(file.IsValid()).toBe(true);
  expect(read(file.GetFileName()).startsWith(root + "/parent/")).toBe(true);
  expect(fs.stat(read(file.GetFileName())).mode & 0o777).toBe(0o600);
  const invalid = own(new TempFileNamed(u("file://" + root + "/missing")));
  invalid.EnableKillingFile();
  expect(invalid.IsValid()).toBe(true);
  const regular = own(new TempFileNamed(u("file://" + root + "/regular")));
  regular.EnableKillingFile();
  expect(regular.IsValid()).toBe(false);
  expect(regular.GetStream(StreamMode.READWRITE)).toBeInstanceOf(SvMemoryStream);
});
it("creates private directories and uses the original recursive destructor without deleting retained owners", /** Directory cleanup traverses genuine nested native streams and file names. @returns Nothing. */ () => {
  const dir = new TempFileNamed(u("file://" + root), true),
    url = own(new OUString(dir.GetURL()));
  expect(dir.IsValid()).toBe(true);
  dir.EnableKillingFile();
  const path = own(dir.GetFileName());
  expect(getFileSystem().stat(text(path)).mode & 0o777).toBe(0o700);
  const child = new TempFileNamed(url);
  child.EnableKillingFile();
  child.GetStream(StreamMode.READWRITE).WriteBytes(Uint8Array.of(1, 2, 3), 3);
  child.dispose();
  getFileSystem().mkdir(text(path) + "/nested");
  write(text(path) + "/nested/plain");
  dir.dispose();
  expect(dirExists(url)).toBe(false);
  const retained = new TempFileNamed(u("file://" + root), true),
    retainedURL = own(new OUString(retained.GetURL()));
  retained.dispose();
  expect(dirExists(retainedURL)).toBe(true);
});
it("returns a reserved-and-removed name and keeps CreateTempURL entries", /** Exercises both original public UniqueTokens overloads without replacing their counters. @returns Nothing. */ () => {
  const name = own(CreateTempName()),
    url = own(new OUString());
  expect(name.isEmpty()).toBe(false);
  expect(FileBase.getFileURLFromSystemPath(name, url)).toBe(H.oslFileError.None);
  expect(DirectoryItem.get(url, own(new DirectoryItem()))).toBe(H.oslFileError.NOENT);
  const directory = own(CreateTempURL(u("file://" + root), true));
  expect(dirExists(directory)).toBe(true);
  const file = own(CreateTempURL(u("file://" + root)));
  expect(fileExists(file)).toBe(true);
  expect(File.remove(file)).toBe(H.oslFileError.None);
});
it("sets the source process temp base through a kept private child and leaves it unchanged on invalid updates", /** Uses public base APIs, not a reset hook or private cache injection. @returns Nothing. */ () => {
  const set = own(SetTempNameBaseDirectory(u("file://" + root + "/base/"))),
    base = own(GetTempNameBaseDirectory());
  expect(set.isEmpty()).toBe(false);
  expect(text(set).startsWith(root + "/base/lu")).toBe(true);
  expect(dirExists(base)).toBe(true);
  expect(text(base).endsWith("/")).toBe(true);
  const empty = own(SetTempNameBaseDirectory(u(""))),
    invalid = own(SetTempNameBaseDirectory(u("relative")));
  expect(empty.isEmpty()).toBe(true);
  expect(invalid.isEmpty()).toBe(true);
  expect(read(GetTempNameBaseDirectory())).toBe(text(base));
});

it("retries actual directory/file name collisions and reports a real directory creation failure", /** Uses the public token sequence and real filesystem entries, preserving native collision behavior. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    value = own(new OUString());
  new UniqueTokens().next(value);
  const first = (value.toUInt64(36) + 1n) % 2176782336n;
  const firstName = root + "/lu" + getpid() + first.toString(36) + ".tmp",
    secondName = root + "/lu" + getpid() + ((first + 1n) % 2176782336n).toString(36) + ".tmp";
  fs.mkdir(firstName);
  write(secondName);
  const temporary = own(new TempFileNamed(u("file://" + root), true));
  temporary.EnableKillingFile();
  expect(temporary.IsValid()).toBe(true);
  const actual = read(temporary.GetFileName());
  expect(actual).not.toBe(firstName);
  expect(actual).not.toBe(secondName);
  expect(fs.stat(secondName).size).toBe(1);
  write(root + "/regular");
  const failure = own(new TempFileNamed(u("file://" + root + "/regular"), true));
  failure.EnableKillingFile();
  expect(failure.IsValid()).toBe(false);
});
it("retains original empty/invalid parent defaults and CreateTempURL default arguments", /** Genuine fallback files are removed by the original owner or public File API. @returns Nothing. */ () => {
  for (const parent of ["", root]) {
    const value = own(new TempFileNamed(u(parent)));
    value.EnableKillingFile();
    expect(value.IsValid()).toBe(true);
  }
  const url = own(CreateTempURL());
  expect(fileExists(url)).toBe(true);
  expect(File.remove(url)).toBe(H.oslFileError.None);
});
it("keeps the requested base when its private child cannot be created", /** Real MEMFS directory permissions trigger the original child-failure fallback. @returns Nothing. */ () => {
  const fs = getFileSystem();
  fs.chmod(root, 0o500);
  const path = own(SetTempNameBaseDirectory(u("file://" + root))),
    base = own(GetTempNameBaseDirectory());
  expect(text(path)).toBe(root + "/");
  expect(text(base)).toBe("file://" + root + "/");
  fs.chmod(root, 0o777);
});
it("retains ordered unique values for ascending, descending and alternating source insertions", /** Actual string specializations exercise original balancing without inspecting or injecting private tree state. @returns Nothing. */ () => {
  const orders = [
    ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"],
    ["k", "j", "i", "h", "g", "f", "e", "d", "c", "b", "a"],
    ["f", "j", "h", "i", "k", "b", "d", "c", "e", "a", "g"],
    ["h", "c", "f", "b", "e", "a", "g", "d", "i", "k", "j"],
  ];
  for (const order of orders) {
    const names = own(new DirectoryNames());
    for (const name of order) names.insert(u(name));
    expect([...names].map(text)).toEqual(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"]);
    expect(names.size()).toBe(11);
    for (const name of order) expect(names.insert(u(name))).toBe(false);
    names.clear();
    expect(names.size()).toBe(0);
    expect([...names]).toEqual([]);
    names.insert(u("again"));
    expect([...names].map(text)).toEqual(["again"]);
  }
});
