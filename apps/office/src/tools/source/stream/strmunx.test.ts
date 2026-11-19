/** @fileoverview Actual SvFileStream OSL/MEMFS integration, source byte-stream regressions, real lock-table behavior and upstream source path/readonly/copy quirks; no fake stream/syscall providers or private-field injection. */
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { beforeAll, beforeEach, afterEach, expect, it } from "vitest";
import { initializeRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { SvFileStream } from "../../inc/stream";
import { SvMemoryStream, StreamMode as M, STREAM_SEEK_TO_END } from "./stream.native";
import { osl_getThreadTextEncoding, osl_setThreadTextEncoding } from "../../../sal/inc/osl/thread";
import { RTL_TEXTENCODING_UTF8, RTL_TEXTENCODING_ASCII_US } from "../../../sal/inc/rtl/textenc";
import * as C from "../../../comphelper/inc/errcode";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { setAllowedPaths } from "../../../sal/osl/unx/file.access";
const base = "/tmp/sv-file-stream",
  path = base + "/file",
  url = "file://" + path;
beforeAll(initializeRuntime);
/** Writes actual fixture bytes. @param name - Native path. @param data - Byte contents. @returns Nothing. */
function write(name: string, data: Uint8Array): void {
  const fs = getFileSystem(),
    file = fs.open(name, "w+");
  fs.write(file, data, 0, data.length);
  fs.close(file);
}
/** Reads actual persisted bytes independently of SvStream. @param name - Native path. @returns Contents. */
function bytes(name = path): number[] {
  const fs = getFileSystem(),
    file = fs.open(name, "r"),
    data = new Uint8Array(fs.stat(name).size);
  fs.read(file, data, 0, data.length);
  fs.close(file);
  return [...data];
}
beforeEach(
  /** Exercises actual source stream behavior. @returns Nothing. */ () => {
    getFileSystem().mkdir(base);
    write(path, Uint8Array.of(1, 2, 3, 4));
  },
);
afterEach(
  /** Exercises actual source stream behavior. @returns Nothing. */ () => {
    setAllowedPaths(new Uint16Array());
    releaseDomScope();
    const fs = getFileSystem();
    fs.chmod(base, 0o777);
    for (const name of fs.readdir(base))
      if (name !== "." && name !== "..") {
        if ((fs.lstat(base + "/" + name).mode & 0o170000) === 0o040000) fs.rmdir(base + "/" + name);
        else fs.unlink(base + "/" + name);
      }
    fs.rmdir(base);
  },
);
/** Constructs an original default owner and invokes public Open without constructor URL-to-path conversion. @param name - Stored source filename. @param mode - Open flags. @returns Actual stream. */
function open(name = url, mode = M.READWRITE): SvFileStream {
  const stream = own(new SvFileStream());
  stream.Open(u(name), mode);
  return stream;
}
it("keeps original defaults and captures thread encoding at construction", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const previous = osl_getThreadTextEncoding();
  try {
    osl_setThreadTextEncoding(RTL_TEXTENCODING_ASCII_US);
    const stream = own(new SvFileStream());
    expect(stream.IsOpen()).toBe(false);
    expect(stream.IsWritable()).toBe(false);
    expect(stream.GetStreamMode()).toBe(M.NONE);
    expect(stream.GetFileName().getLength()).toBe(0);
    expect(stream.GetError().IsSet()).toBe(false);
    osl_setThreadTextEncoding(RTL_TEXTENCODING_UTF8);
    expect(stream.GetStreamEncoding()).toBe(RTL_TEXTENCODING_ASCII_US);
    const memory = own(new SvMemoryStream());
    expect(memory.GetStreamEncoding()).toBe(RTL_TEXTENCODING_UTF8);
    memory.SetStreamEncoding(RTL_TEXTENCODING_ASCII_US);
    expect(memory.GetStreamEncoding()).toBe(RTL_TEXTENCODING_ASCII_US);
  } finally {
    osl_setThreadTextEncoding(previous);
  }
});
it("converts constructor URLs to system path and honors explicit encoding", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const stream = own(new SvFileStream(u(url), M.READ, RTL_TEXTENCODING_UTF8));
  expect(stream.IsOpen()).toBe(true);
  expect(read(new OUString(stream.GetFileName()))).toBe(path);
  expect(stream.GetStreamEncoding()).toBe(RTL_TEXTENCODING_UTF8);
  const data = new Uint8Array(8);
  expect(stream.ReadBytes(data, 8)).toBe(4);
  expect([...data.subarray(0, 4)]).toEqual([1, 2, 3, 4]);
  expect(stream.eof()).toBe(true);
  stream.Close();
  expect(stream.eof()).toBe(false);
  expect(stream.Tell()).toBe(0n);
});
it("opens a system path through the constructor fallback", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const stream = own(new SvFileStream(u(path), M.READ));
  expect(stream.IsOpen()).toBe(true);
  expect(stream.remainingSize()).toBe(4n);
});
it("buffers, flushes, seeks, resizes and closes actual persisted bytes", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const stream = open();
  expect(stream.IsWritable()).toBe(true);
  expect(stream.Seek(2n)).toBe(2n);
  expect(stream.WriteBytes(Uint8Array.of(8, 9), 2)).toBe(2);
  expect(bytes()).toEqual([1, 2, 3, 4]);
  stream.Flush();
  expect(bytes()).toEqual([1, 2, 8, 9]);
  expect(stream.Seek(STREAM_SEEK_TO_END)).toBe(4n);
  expect(stream.SetStreamSize(2n)).toBe(true);
  expect(stream.Tell()).toBe(2n);
  expect(bytes()).toEqual([1, 2]);
  stream.Seek(0n);
  stream.WriteChar(7);
  stream.Close();
  expect(bytes()).toEqual([7, 2]);
  expect(stream.IsOpen()).toBe(false);
  expect(stream.GetError().IsSet()).toBe(false);
});
it("clears TRUNC from reopen mode and keeps public reopen contents", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const stream = open(url, M.READWRITE | M.TRUNC);
  expect(stream.GetStreamMode()).toBe(M.READWRITE);
  expect(bytes()).toEqual([]);
  stream.WriteBytes(Uint8Array.of(8, 9), 2);
  stream.Close();
  stream.Open(u(url), stream.GetStreamMode());
  expect(bytes()).toEqual([8, 9]);
});
it("rejects directories, absent readonly and NOCREATE paths", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const directory = open("file://" + base, M.READ);
  expect(directory.IsOpen()).toBe(false);
  expect(directory.GetError().valueOf()).toBe(C.SVSTREAM_PATH_NOT_FOUND.valueOf());
  const absent = open(url + "-missing", M.READ);
  expect(absent.IsOpen()).toBe(false);
  expect(absent.GetError().valueOf()).toBe(C.SVSTREAM_FILE_NOT_FOUND.valueOf());
  const noCreate = open(url + "-missing", M.WRITE | M.NOCREATE);
  expect(noCreate.IsOpen()).toBe(false);
  expect(noCreate.GetError().valueOf()).toBe(C.SVSTREAM_FILE_NOT_FOUND.valueOf());
  expect(open(url + "-created", M.WRITE | M.TEMPORARY).IsOpen()).toBe(true);
});
it("preserves source fallback clearing WRITE while retaining CREATE", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  getFileSystem().chmod(path, 0o444);
  const withCreate = open(url, M.WRITE);
  expect(withCreate.IsOpen()).toBe(false);
  expect(withCreate.GetError().valueOf()).toBe(C.SVSTREAM_ACCESS_DENIED.valueOf());
  const withoutCreate = open(url, M.WRITE | M.NOCREATE);
  expect(withoutCreate.IsOpen()).toBe(true);
  expect(withoutCreate.IsWritable()).toBe(false);
  expect(withoutCreate.GetStreamMode()).toBe(M.WRITE | M.NOCREATE);
});
it("replaces a symlink on COPY_ON_SYMLINK while preserving target contents", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    link = base + "/link";
  fs.symlink(path, link);
  const stream = open("file://" + link, M.READWRITE | M.COPY_ON_SYMLINK);
  expect(stream.IsOpen()).toBe(true);
  expect(fs.lstat(link).mode & 0o170000).toBe(0o100000);
  stream.WriteChar(9);
  stream.Close();
  expect(bytes(link)).toEqual([9, 2, 3, 4]);
  expect(bytes()).toEqual([1, 2, 3, 4]);
});
it("follows ordinary symlinks and handles dangling symlinks through source stat failure", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    link = base + "/link";
  fs.symlink(path, link);
  const stream = open("file://" + link);
  stream.WriteChar(9);
  stream.Close();
  expect(bytes()).toEqual([9, 2, 3, 4]);
  fs.unlink(link);
  fs.symlink(base + "/target", link);
  const dangling = open("file://" + link, M.WRITE | M.COPY_ON_SYMLINK);
  expect(dangling.IsOpen()).toBe(true);
  dangling.WriteChar(7);
  dangling.Close();
  expect(fs.readlink(link)).toBe(base + "/target");
  expect(bytes(base + "/target")).toEqual([7]);
});
it("preserves silent internal deny failure and releases the real lock on Close", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const first = open(url, M.READWRITE | M.SHARE_DENYALL);
  expect(first.IsOpen()).toBe(true);
  const second = open(url, M.READWRITE | M.SHARE_DENYALL);
  expect(second.IsOpen()).toBe(false);
  expect(second.GetError().IsSet()).toBe(false);
  first.Close();
  second.Open(u(url), M.READWRITE | M.SHARE_DENYALL);
  expect(second.IsOpen()).toBe(true);
});
it("keeps no-share-check bypass and readonly F_RDLCK zero behavior", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const first = open(url, M.READWRITE | M.SHARE_DENYALL);
  expect(open(url, M.READWRITE | M.SHARE_DENYNONE).IsOpen()).toBe(true);
  expect(open(url, M.READ | M.SHARE_DENYALL).IsOpen()).toBe(true);
  expect(open(url, M.READ | M.SHARE_DENYWRITE).IsOpen()).toBe(true);
  expect(first.IsOpen()).toBe(true);
});
it("keeps readonly DENYREAD error and exact mode predicates", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const denied = open(url, M.READ | M.SHARE_DENYREAD);
  expect(denied.IsOpen()).toBe(false);
  expect(denied.GetError().valueOf()).toBe(C.SVSTREAM_LOCKING_VIOLATION.valueOf());
  const first = open(url, M.READWRITE | M.SHARE_DENYWRITE);
  expect(first.IsOpen()).toBe(true);
  expect(open(url, M.READWRITE | M.SHARE_DENYWRITE).IsOpen()).toBe(false);
  first.Close();
  expect(open(url, M.READWRITE | M.SHARE_DENYREAD).IsOpen()).toBe(true);
  expect(open(url, M.READWRITE | M.SHARE_DENYREAD).IsOpen()).toBe(false);
});
it("keeps constructor system-path lookup bypass and symlink inode distinction", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const first = own(new SvFileStream(u(url), M.READWRITE | M.SHARE_DENYALL));
  const second = own(new SvFileStream(u(url), M.READWRITE | M.SHARE_DENYALL));
  expect(first.IsOpen()).toBe(true);
  expect(second.IsOpen()).toBe(true);
  const fs = getFileSystem();
  fs.symlink(path, base + "/link");
  expect(open(url, M.READWRITE | M.SHARE_DENYALL).IsOpen()).toBe(true);
  expect(open("file://" + base + "/link", M.READWRITE | M.SHARE_DENYALL).IsOpen()).toBe(true);
});
it("reset clears EOF/error without changing current position", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const stream = open(url, M.READ);
  stream.Seek(STREAM_SEEK_TO_END);
  const data = new Uint8Array(1);
  expect(stream.ReadBytes(data, 1)).toBe(0);
  expect(stream.eof()).toBe(true);
  stream.ResetError();
  expect(stream.eof()).toBe(false);
  expect(stream.Tell()).toBe(4n);
  stream.SetError(C.SVSTREAM_DISK_FULL);
  stream.Close();
  expect(stream.GetError().IsSet()).toBe(false);
});
it("preserves closed seek, signed seek conversion and truncated sentinel assertion", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const closed = own(new SvFileStream());
  expect(closed.Seek(1n)).toBe(0n);
  expect(closed.GetError().valueOf()).toBe(C.SVSTREAM_GENERALERROR.valueOf());
  closed.Close();
  const stream = open();
  expect(stream.Seek(0xfffffffffffffffen)).toBe(0n);
  expect(stream.GetError().valueOf()).toBe(C.SVSTREAM_SEEK_ERROR.valueOf());
  stream.ResetError();
  expect(
    /** Invokes the original assertion. @returns Never. */ () => stream.Seek(0xffffffffn),
  ).toThrow("assert(nPos");
});
it("marshals actual UNO signed-byte sequence spans for unbuffered IO", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const stream = open();
  stream.SetBufferSize(0);
  const sequence = own(new (Sequence.specialize<number>("sal_Int8", 1))(4)),
    cells = sequence.getArray() as SequenceElements;
  expect(stream.ReadBytes(cells, 4)).toBe(4);
  expect((cells.get(3) as [number])[0]).toBe(4);
  stream.Seek(0n);
  (cells.get(0) as [number])[0] = -1;
  expect(stream.WriteBytes(cells, 4)).toBe(4);
  stream.Close();
  expect(bytes()).toEqual([255, 2, 3, 4]);
});
it("reads the original tools XPath QA XML fixture through its source file-stream recipe", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  const fixture = new Uint8Array(
    readFileSync(
      resolve(process.cwd(), "../../vendor/libreoffice-reference/tools/qa/data/test.xml"),
    ),
  );
  write(path, fixture);
  const stream = own(new SvFileStream(u(url), M.READ)),
    size = stream.remainingSize(),
    output = new Uint8Array(Number(size) + 1);
  output[Number(size)] = 0;
  expect(stream.ReadBytes(output, Number(size))).toBe(Number(size));
  expect([...output.subarray(0, Number(size))]).toEqual([...fixture]);
  // The separate tools::XPath/XmlWalker assertions are not claimed by this stream-read observation.
});
it("honors the already approved path gate and preserves prior document bytes", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  setAllowedPaths(u("r:" + base).getStr());
  const stream = open(url, M.READWRITE);
  expect(stream.IsOpen()).toBe(false);
  expect(stream.GetError().valueOf()).toBe(C.SVSTREAM_ACCESS_DENIED.valueOf());
  expect(bytes()).toEqual([1, 2, 3, 4]);
});
it("retains original identity scan across different files and READ/WRITE denial bits", /** Exercises actual source stream behavior. @returns Nothing. */ () => {
  write(base + "/other", Uint8Array.of(7));
  const first = open(url, M.WRITE | M.SHARE_DENYREAD);
  expect(open("file://" + base + "/other", M.READWRITE | M.SHARE_DENYALL).IsOpen()).toBe(true);
  expect(open(url, M.WRITE | M.SHARE_DENYWRITE).IsOpen()).toBe(true);
  expect(open(url, M.READWRITE | M.SHARE_DENYREAD).IsOpen()).toBe(false);
  expect(first.IsOpen()).toBe(true);
});
it.each(["read", "write"] as const)(
  "preserves original %s overflow sentinel and SvStream cursor bookkeeping",
  /** Actual OSL ssize_t admission fails before buffer access; no oversized allocation or fake error is needed. @param operation - Public operation. @returns Nothing. */ (
    operation,
  ) => {
    const stream = open();
    stream.SetBufferSize(0);
    const data = Uint8Array.of(9);
    const count =
      operation === "read"
        ? stream.ReadBytes(data, 0x80000000)
        : stream.WriteBytes(data, 0x80000000);
    expect(count).toBe(0xffffffff);
    expect(stream.Tell()).toBe(0xffffffffn);
    expect(stream.GetError().valueOf()).toBe(C.SVSTREAM_GENERALERROR.valueOf());
    expect(data[0]).toBe(9);
    stream.Close();
    expect(bytes()).toEqual([1, 2, 3, 4]);
  },
);
it("keeps closed raw read returning zero after the public buffer reset", /** Source closed GetData does not invent a handle error. @returns Nothing. */ () => {
  const stream = own(new SvFileStream());
  stream.SetBufferSize(0);
  stream.ResetError();
  expect(stream.ReadBytes(Uint8Array.of(9), 1)).toBe(0);
  expect(stream.GetError().IsSet()).toBe(false);
});
it("retains source ignored copy failure after COPY_ON_SYMLINK removes the link", /** Real unreadable target fails copying; original Open then creates an empty replacement. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    link = base + "/link";
  fs.symlink(path, link);
  fs.chmod(path, 0o000);
  const stream = open("file://" + link, M.WRITE | M.COPY_ON_SYMLINK);
  expect(stream.IsOpen()).toBe(true);
  expect(stream.GetError().IsSet()).toBe(false);
  stream.Close();
  fs.chmod(path, 0o600);
  expect(bytes(link)).toEqual([]);
  expect(bytes()).toEqual([1, 2, 3, 4]);
});
