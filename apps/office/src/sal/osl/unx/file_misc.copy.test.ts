/** @fileoverview Original File::copy/remove active QA and critical real-filesystem transaction/link/errno contracts; disabled copy_003 has no executable assertions. */
import { beforeAll, beforeEach, afterEach, expect, it } from "vitest";
import { initializeRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { File } from "../../inc/osl/file.hxx";
import * as H from "../../inc/osl/file";
import { createFileHandleFromFD, osl_readFile, osl_closeFile } from "./file";
import { getErrno, openCopyDestination, closeDescriptor } from "../../../external/emscripten/file";
import { OString } from "../../inc/rtl/string";
import { safeWrite } from "./readwrite_helper";
import { setAllowedPaths } from "./file.access";
const E = H.oslFileError,
  base = "/tmp/osl-copy",
  source = base + "/dir/tmpname",
  destination = base + "/tmpname";
const fixture = new TextEncoder().encode("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\0");
beforeAll(
  /** Initializes the actual runtime. @returns Completion. */ async () => {
    await initializeRuntime();
  },
);
/** Writes through the real SDK descriptor. @param path - Fixture path. @param data - Bytes. @returns Nothing. */
function write(path: string, data: Uint8Array): void {
  const fs = getFileSystem(),
    stream = fs.open(path, "w+");
  fs.write(stream, data, 0, data.length);
  fs.close(stream);
}
/** Reads the actual file bytes. @param path - Fixture path. @returns Bytes. */
function bytes(path: string): Uint8Array {
  const fs = getFileSystem(),
    stream = fs.open(path, "r"),
    result = new Uint8Array(fs.stat(path).size);
  fs.read(stream, result, 0, result.length);
  fs.close(stream);
  return result;
}
/** Removes actual fixture entries without following links. @param path - Tree. @returns Nothing. */
function removeTree(path: string): void {
  const fs = getFileSystem();
  fs.chmod(path, 0o777);
  for (const name of fs.readdir(path)) {
    if (name === "." || name === "..") continue;
    const child = path + "/" + name;
    if ((fs.lstat(child).mode & 0o170000) === 0o040000) removeTree(child);
    else fs.unlink(child);
  }
  fs.rmdir(path);
}
beforeEach(
  /** Exercises the real public file contract. @returns Nothing. */ () => {
    const fs = getFileSystem();
    fs.mkdir(base);
    fs.mkdir(base + "/dir");
    write(source, fixture);
  },
);
afterEach(
  /** Exercises the real public file contract. @returns Nothing. */ () => {
    setAllowedPaths(new Uint16Array());
    releaseDomScope();
    removeTree(base);
  },
);
/** Source public copy wrapper. @param sourcePath - Source. @param destinationPath - Destination. @returns Original result. */
function copy(sourcePath = source, destinationPath = destination): H.oslFileError {
  return File.copy(u("file://" + sourcePath), u("file://" + destinationPath));
}
it("ports File::copy_001", /** Exercises the real public file contract. @returns Nothing. */ () => {
  expect(copy()).toBe(E.None);
  expect(own(new File(u("file://" + destination))).open(H.osl_File_OpenFlag_Create)).toBe(E.EXIST);
});
it("ports File::copy_002", /** Exercises the real public file contract. @returns Nothing. */ () => {
  expect([E.ISDIR, E.ACCES]).toContain(copy(source, base + "/dir"));
});
it("ports File::copy_004", /** Exercises the real public file contract. @returns Nothing. */ () => {
  expect(copy(destination, source)).toBe(E.NOENT);
});
it("ports File::copy_005", /** Exercises the real public file contract. @returns Nothing. */ () => {
  expect(File.copy(u("file://" + destination), u(destination))).toBe(E.INVAL);
});
it("ports File::copy_006 with original public File setup and size/cursor assertions", /** Exercises the real public file contract. @returns Nothing. */ () => {
  const original = own(new File(u("file://" + destination)));
  expect(
    original.open(
      H.osl_File_OpenFlag_Create | H.osl_File_OpenFlag_Read | H.osl_File_OpenFlag_Write,
    ),
  ).toBe(E.None);
  expect(original.setSize(200n)).toBe(E.None);
  expect(original.close()).toBe(E.None);
  expect(copy(destination, source)).toBe(E.None);
  const result = own(new File(u("file://" + source))),
    position: [bigint] = [0n];
  expect(result.open(H.osl_File_OpenFlag_Write | H.osl_File_OpenFlag_Read)).toBe(E.None);
  expect(result.setPos(H.osl_Pos_End, 0n)).toBe(E.None);
  expect(result.getPos(position)).toBe(E.None);
  expect(result.close()).toBe(E.None);
  expect(position[0]).toBe(200n);
});
it("ports File::remove_001", /** Exercises the real public file contract. @returns Nothing. */ () => {
  expect(File.remove(u("file://" + source))).toBe(E.None);
  expect(own(new File(u("file://" + source))).open(H.osl_File_OpenFlag_Create)).not.toBe(E.EXIST);
});
it("ports File::remove_002", /** Exercises the real public file contract. @returns Nothing. */ () => {
  expect(File.remove(u("file://" + destination))).toBe(E.NOENT);
});
it("ports File::remove_003", /** Exercises the real public file contract. @returns Nothing. */ () => {
  expect(File.remove(u(source))).toBe(E.INVAL);
});
it("ports File::remove_004", /** Exercises the real public file contract. @returns Nothing. */ () => {
  expect([E.ISDIR, E.ACCES]).toContain(File.remove(u("file://" + base + "/dir")));
});
it.each([0, 1, 32767, 65537])(
  "copies %i bytes through real buffered OSL/native write",
  /** Copies the requested real byte count. @param length - Byte count. @returns Nothing. */ (
    length,
  ) => {
    const data = Uint8Array.from(
      { length },
      /** Builds deterministic bytes. @param _unused - Unused entry. @param index - Byte offset. @returns Byte. */ (
        _unused,
        index,
      ) => index % 251,
    );
    write(source, data);
    expect(copy()).toBe(E.None);
    expect(bytes(destination)).toEqual(data);
  },
);
it("replaces longer destination and preserves public File URL/value and IO contracts", /** Exercises the real public file contract. @returns Nothing. */ () => {
  write(destination, new Uint8Array(100));
  expect(copy()).toBe(E.None);
  expect([...bytes(destination)]).toEqual([...fixture]);
  const value = own(new File(u("file://" + destination))),
    count: [bigint] = [0n],
    eof: [boolean] = [false],
    buffer = new Uint8Array(53);
  expect(read(value.getURL())).toBe("file://" + destination);
  expect(value.close()).toBe(E.BADF);
  expect(value.sync()).toBe(E.INVAL);
  expect(value.open(H.osl_File_OpenFlag_Read | H.osl_File_OpenFlag_Write)).toBe(E.None);
  expect(value.getSize(count)).toBe(E.None);
  expect(count[0]).toBe(53n);
  expect(value.read(buffer, 53n, count)).toBe(E.None);
  expect([...buffer]).toEqual([...fixture]);
  expect(value.isEndOfFile(eof)).toBe(E.None);
  expect(eof[0]).toBe(true);
  expect(value.write(Uint8Array.of(7), 1n, count)).toBe(E.None);
  expect(value.sync()).toBe(E.None);
  expect(value.close()).toBe(E.None);
});
it("copies relative and dangling source links as links", /** Exercises the real public file contract. @returns Nothing. */ () => {
  const fs = getFileSystem();
  fs.symlink("missing-target", base + "/link");
  expect(copy(base + "/link")).toBe(E.None);
  expect(fs.readlink(destination)).toBe("missing-target");
  expect(File.remove(u("file://" + destination))).toBe(E.None);
  expect(
    /** Queries the actual removed entry. @returns Native stat. */ () => fs.lstat(destination),
  ).toThrow();
});
it("replaces destination link itself without changing its target", /** Exercises the real public file contract. @returns Nothing. */ () => {
  const fs = getFileSystem();
  write(base + "/target", Uint8Array.of(9));
  fs.symlink(base + "/target", destination);
  expect(copy()).toBe(E.None);
  expect([...bytes(destination)]).toEqual([...fixture]);
  expect(bytes(base + "/target")).toEqual(Uint8Array.of(9));
  expect(fs.lstat(destination).mode & 0o170000).toBe(0o100000);
});
it("rejects directories and malformed source URLs before mutation", /** Exercises the real public file contract. @returns Nothing. */ () => {
  expect(copy(base + "/dir")).toBe(E.ISDIR);
  expect(File.copy(u(source), u("file://" + destination))).toBe(E.INVAL);
  expect(File.remove(u(""))).toBe(E.INVAL);
});
it("restores existing destination after unsupported source type", /** Exercises the real public file contract. @returns Nothing. */ () => {
  write(destination, Uint8Array.of(9));
  expect(copy("/dev/null")).toBe(E.INVAL);
  expect(bytes(destination)).toEqual(Uint8Array.of(9));
  expect(
    /** Queries the actual backup entry. @returns Native stat. */ () =>
      getFileSystem().lstat(destination + ".osl-tmp"),
  ).toThrow();
});
it("retains original fixed EXIST when backup rename fails", /** Exercises the real public file contract. @returns Nothing. */ () => {
  const fs = getFileSystem();
  write(destination, Uint8Array.of(9));
  fs.mkdir(destination + ".osl-tmp");
  expect(copy()).toBe(E.EXIST);
  expect(bytes(destination)).toEqual(Uint8Array.of(9));
});
it("retains original backup-name collision overwrite behavior", /** Exercises the real public file contract. @returns Nothing. */ () => {
  write(destination, Uint8Array.of(9));
  write(destination + ".osl-tmp", Uint8Array.of(8));
  expect(copy()).toBe(E.None);
  expect([...bytes(destination)]).toEqual([...fixture]);
  expect(
    /** Queries the actual backup entry. @returns Native stat. */ () =>
      getFileSystem().lstat(destination + ".osl-tmp"),
  ).toThrow();
});
it("keeps original same-path rename/open failure and restores source", /** Exercises the real public file contract. @returns Nothing. */ () => {
  expect(copy(source, source)).toBe(E.NOENT);
  expect([...bytes(source)]).toEqual([...fixture]);
});
it("applies approved read/create/write gates before mutation", /** Exercises the real public file contract. @returns Nothing. */ () => {
  setAllowedPaths(u("r:" + base).getStr());
  expect(copy()).toBe(E.ACCES);
  expect(File.remove(u("file://" + source))).toBe(E.ACCES);
  setAllowedPaths(u("w:" + base).getStr());
  expect(copy()).toBe(E.None);
  setAllowedPaths(u("w:" + base + "/dir").getStr());
  expect(copy(destination, source)).toBe(E.ACCES);
});
it("publishes genuine SDK read failure errno and safeWrite native errors", /** Exercises the real public file contract. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    stream = fs.open(source, "r"),
    handle = createFileHandleFromFD(stream.fd),
    count: [bigint] = [0n];
  fs.close(stream);
  expect(osl_readFile(handle, new Uint8Array(1), 1n, count)).toBe(E.BADF);
  expect(getErrno()).toBe(8);
  expect(osl_closeFile(handle)).toBe(E.BADF);
  expect(safeWrite(-1, Uint8Array.of(1), 1)).toBe(false);
  expect(getErrno()).toBe(8);
  expect(safeWrite(-1, new Uint8Array(), 0)).toBe(true);
});
it("retains original nontruncating raw destination-open flags", /** Exercises the real public file contract. @returns Nothing. */ () => {
  const path = own(new OString(new TextEncoder().encode(destination), destination.length));
  write(destination, Uint8Array.of(9, 8, 7));
  const opened = openCopyDestination(path.getStr(), 0o600);
  expect(opened.result).toBeGreaterThanOrEqual(0);
  expect(safeWrite(opened.result, Uint8Array.of(1), 1)).toBe(true);
  expect(closeDescriptor(opened.result).result).toBe(0);
  expect(bytes(destination)).toEqual(Uint8Array.of(1, 8, 7));
});
it("reports real source/destination permissions and missing parent without replacing content", /** Exercises the real public file contract. @returns Nothing. */ () => {
  const fs = getFileSystem();
  fs.chmod(source, 0o000);
  write(destination, Uint8Array.of(9));
  expect(copy()).toBe(E.ACCES);
  expect([...bytes(destination)]).toEqual([9]);
  fs.chmod(source, 0o600);
  expect(copy(source, base + "/missing/target")).toBe(E.NOENT);
  fs.chmod(base + "/dir", 0o500);
  expect(File.remove(u("file://" + source))).toBe(E.ACCES);
  expect(copy(destination, base + "/dir/new")).toBe(E.ACCES);
  fs.chmod(base + "/dir", 0o700);
});
it("treats destination link to a directory as ISDIR and preserves the link", /** Exercises the real public file contract. @returns Nothing. */ () => {
  const fs = getFileSystem();
  fs.symlink(base + "/dir", destination);
  expect(copy()).toBe(E.ISDIR);
  expect(fs.readlink(destination)).toBe(base + "/dir");
});
it("retains dangling destination behavior for regular files and link copies", /** Exercises the real public file contract. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    missing = base + "/missing-target";
  fs.symlink(missing, destination);
  expect(copy()).toBe(E.None);
  expect(fs.readlink(destination)).toBe(missing);
  expect([...bytes(missing)]).toEqual([...fixture]);
  fs.unlink(missing);
  fs.symlink("relative-target", base + "/source-link");
  expect(copy(base + "/source-link")).toBe(E.EXIST);
  expect(fs.readlink(destination)).toBe(missing);
});
it("preserves fixed EXIST after destination stat and rename access errors", /** Exercises the real public file contract. @returns Nothing. */ () => {
  const fs = getFileSystem();
  fs.chmod(base + "/dir", 0o000);
  expect(copy(destination, source)).toBe(E.NOENT);
  write(destination, Uint8Array.of(9));
  expect(copy(destination, source)).toBe(E.EXIST);
  fs.chmod(base + "/dir", 0o700);
  expect([...bytes(source)]).toEqual([...fixture]);
});
