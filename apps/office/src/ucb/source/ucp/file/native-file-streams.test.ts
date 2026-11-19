/** @fileoverview Genuine MEMFS/OSL tests for original file-UCP reconnecting and UNO stream owners, including qadevOOo input/output contract assertions and critical source lifecycle boundaries. */
import { beforeAll, afterEach, expect, it } from "vitest";
import { initializeRuntime, getFileSystem } from "../../../../external/emscripten/runtime";
import { initializeExceptionAbi } from "../../../../cppuhelper/browser/exception-abi";
import { Reference, UNO_QUERY_THROW } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { IOException } from "../../../../cppu/inc/com/sun/star/io/IOException";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { XInputStream } from "../../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../../udkapi/com/sun/star/io/XOutputStream";
import { XStream } from "../../../../udkapi/com/sun/star/io/XStream";
import { XSeekable } from "../../../../udkapi/com/sun/star/io/XSeekable";
import { XTruncate } from "../../../../udkapi/com/sun/star/io/XTruncate";
import { XAsyncOutputMonitor } from "../../../../udkapi/com/sun/star/io/XAsyncOutputMonitor";
import { ByteReader } from "../../../../comphelper/inc/bytereader";
import { File, FileBase as F } from "../../../../sal/inc/osl/file.hxx";
import {
  osl_File_OpenFlag_Read as READ,
  osl_File_OpenFlag_Write as WRITE,
  osl_File_OpenFlag_Create as CREATE,
  osl_Pos_Absolut as ABS,
  osl_Pos_Current as CUR,
} from "../../../../sal/inc/osl/file";
import { own, u, releaseDomScope } from "../../../../test/native-dom";
import { ReconnectingFile } from "./filrec";
import { XInputStream_impl } from "./filinpstr";
import { XStream_impl } from "./filstr";
import { TaskHandlerErr } from "./filerror";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
let serial = 0;
const files: string[] = [];
beforeAll(
  /** Initializes actual WASM and generated exception bindings. @returns Completion. */ async () => {
    await initializeExceptionAbi();
    await initializeRuntime();
  },
);
afterEach(
  /** Releases actual owners before removing fixtures. @returns Nothing. */ () => {
    releaseDomScope();
    const fs = getFileSystem();
    for (const path of files.splice(0)) fs.unlink(path);
  },
);
/** Creates an actual file through the SDK filesystem, not a provider substitute. @param bytes - Fixture content. @returns Original URL string. */
function fixture(bytes = Uint8Array.of(1, 2, 128, 255, 5)) {
  const path = `/tmp/file-ucp-${++serial}`;
  files.push(path);
  writeFixture(path, bytes);
  return u("file://" + path);
}
/** Copies actual sequence byte lvalues for assertions. @param bytes - Native sequence. @returns Unsigned scalar observations. */
function observed(bytes: Sequence<number>): number[] {
  const fields = bytes.getConstArray() as SequenceElements;
  return Array.from(
    { length: bytes.getLength() },
    /** Reads one byte. @param _ - Unused placeholder. @param index - Offset. @returns Unsigned byte. */ (
      _,
      index,
    ) => (fields.get(index) as [number])[0] & 255,
  );
}
/** Observes and releases a real generated exception. @param operation - Actual call. @param expected - Original constructor. @returns Nothing. */
function rejects(operation: () => unknown, expected: abstract new () => Exception): void {
  let caught = false;
  try {
    operation();
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error).toBeInstanceOf(expected);
      caught = true;
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
}
for (const lock of [true, false]) {
  it(`preserves reconnect predicates and disconnected outputs with lock=${lock}`, /** Uses real descriptors and public disconnect/reconnect transitions. @returns Nothing. */ () => {
    const file = own(new ReconnectingFile(fixture())),
      count: [bigint] = [777n],
      bytes = new Uint8Array(2);
    expect(file.reconnect()).toBe(false);
    expect(file.open(READ | WRITE | (lock ? 0 : 8))).toBe(F.E_None);
    expect(file.read(bytes, 2n, count)).toBe(F.E_None);
    expect([...bytes]).toEqual([1, 2]);
    expect(file.getPos(count)).toBe(F.E_None);
    expect(count[0]).toBe(2n);
    file.disconnect();
    count[0] = 777n;
    expect(file.getPos(count)).toBe(F.E_NETWORK);
    expect(file.read(bytes, 2n, count)).toBe(F.E_NETWORK);
    expect(file.write(bytes, 2n, count)).toBe(F.E_NETWORK);
    expect(count[0]).toBe(777n);
    expect(file.sync()).toBe(F.E_NETWORK);
    expect(file.setPos(ABS, 0n)).toBe(F.E_NETWORK);
    expect(file.setPos(CUR, 1n)).toBe(F.E_NETWORK);
    expect(file.setSize(2n)).toBe(F.E_NETWORK);
    expect(file.getSize(count)).toBe(F.E_None);
    expect(count[0]).toBe(5n);
    expect(file.getPos(count)).toBe(F.E_NETWORK);
    expect(file.setPos(ABS, 1n)).toBe(F.E_None);
    expect(file.read(bytes, 2n, count)).toBe(F.E_None);
    expect([...bytes]).toEqual([2, 128]);
    expect(file.write(Uint8Array.of(9), 1n, count)).toBe(F.E_None);
    expect(file.sync()).toBe(F.E_None);
    file.disconnect();
    expect(file.setSize(0n)).toBe(F.E_None);
    expect(file.getSize(count)).toBe(F.E_None);
    expect(count[0]).toBe(0n);
    expect(file.setSize(3n)).toBe(F.E_None);
    expect(file.setPos(ABS, 0n)).toBe(F.E_None);
    expect(file.close()).toBe(F.E_None);
    expect(file.reconnect()).toBe(false);
    expect(file.close()).toBe(F.E_BADF);
  });
  for (const duplex of [false, true]) {
    it(`ports qadevOOo available/readBytes/readSomeBytes/skipBytes/closeInput for duplex=${duplex}, lock=${lock}`, /** Real file and actual interface inheritance; no fake stream. @returns Nothing. */ () => {
      const owner = own(
          new Reference(
            duplex ? new XStream_impl(fixture(), lock) : new XInputStream_impl(fixture(), lock),
          ),
        ),
        value = owner.operatorStar(),
        data = own(new Bytes(12));
      own(new Reference(owner, UNO_QUERY_THROW, XInputStream.static_type));
      own(new Reference(owner, UNO_QUERY_THROW, XSeekable.static_type));
      expect(value instanceof ByteReader).toBe(true);
      expect(value.CtorSuccess()).toBe(TaskHandlerErr.NO_ERROR);
      expect(value.getMinorError()).toBe(0);
      expect(value.available()).toBe(5);
      expect(value.readBytes(data, 1)).toBe(1);
      expect(observed(data)).toEqual([1]);
      expect(value.readSomeBytes(data, 1)).toBe(1);
      expect(observed(data)).toEqual([2]);
      value.skipBytes(1);
      expect(value.getPosition()).toBe(3n);
      expect(value.readBytes(data, 9)).toBe(2);
      expect(observed(data)).toEqual([255, 5]);
      expect(value.readBytes(data, 1)).toBe(0);
      expect(data.getLength()).toBe(0);
      value.seek(1n);
      const raw = new Int8Array(2);
      expect(value.readSomeBytes(raw, 2)).toBe(2);
      rejects(
        /** Original unsigned64 overflow from a negative raw count. @returns Actual result. */ () =>
          value.readSomeBytes(raw, -1),
        IOException,
      );
      expect([...raw]).toEqual([2, -128]);
      value.seek(8n);
      expect(value.available()).toBe(-3);
      rejects(
        /** Original negative position. @returns Nothing. */ () => value.seek(-1n),
        IllegalArgumentException,
      );
      value.closeInput();
      value.closeInput();
      value.skipBytes(1);
      rejects(
        /** Closed sequence read. @returns Actual result. */ () => value.readBytes(data, 1),
        IOException,
      );
      rejects(
        /** Closed pointer read. @returns Actual result. */ () => value.readSomeBytes(raw, 1),
        IOException,
      );
      rejects(
        /** Closed position. @returns Actual result. */ () => value.getPosition(),
        IOException,
      );
      rejects(/** Closed size. @returns Actual result. */ () => value.getLength(), IOException);
      rejects(/** Closed seek. @returns Nothing. */ () => value.seek(0n), IOException);
    });
  }
}
it("retains CREATE retry flags and real failed reopening after removal", /** Original flags are exercised through public behavior only. @returns Nothing. */ () => {
  const path = `/tmp/file-ucp-${++serial}`;
  files.push(path);
  const url = u("file://" + path),
    file = own(new ReconnectingFile(url)),
    count: [bigint] = [999n];
  expect(file.open(READ | CREATE)).toBe(F.E_None);
  file.disconnect();
  expect(file.reconnect()).toBe(true);
  expect(file.write(Uint8Array.of(42), 1n, count)).toBe(F.E_None);
  file.disconnect();
  getFileSystem().unlink(path);
  expect(file.reconnect()).toBe(false);
  expect(file.getSize(count)).toBe(F.E_NETWORK);
  expect(file.setPos(ABS, 2n)).toBe(F.E_NETWORK);
  expect(file.setSize(0n)).toBe(F.E_NETWORK);
  writeFixture(path, Uint8Array.of(7));
  expect(file.reconnect()).toBe(true);
  expect(file.getSize(count)).toBe(F.E_None);
  expect(count[0]).toBe(1n);
});
it("keeps constructor errors nonthrowing and distinguishes input/stream task codes", /** Missing files produce actual OSL NOENT. @returns Nothing. */ () => {
  const path = `/tmp/file-ucp-absent-${++serial}`,
    url = u("file://" + path);
  for (const duplex of [false, true]) {
    const owner = own(
        new Reference(duplex ? new XStream_impl(url, true) : new XInputStream_impl(url, true)),
      ),
      value = owner.operatorStar();
    expect(value.CtorSuccess()).toBe(
      duplex ? TaskHandlerErr.OPEN_FOR_STREAM : TaskHandlerErr.OPEN_FOR_INPUTSTREAM,
    );
    expect(value.getMinorError()).toBe(F.E_NOENT);
    rejects(
      /** Actual failed-owner read. @returns Actual result. */ () =>
        value.readBytes(own(new Bytes()), 1),
      IOException,
    );
    value.closeInput();
  }
});
for (const outputFirst of [true, false]) {
  it(`ports qadevOOo writeBytes/flush/closeOutput and source facet lifetime with outputFirst=${outputFirst}`, /** Actual original self references and shared cursor. @returns Nothing. */ () => {
    const url = fixture(),
      owner = own(new Reference(new XStream_impl(url, false))),
      value = owner.operatorStar(),
      data = own(new Bytes(4));
    for (const type of [
      XStream.static_type,
      XInputStream.static_type,
      XOutputStream.static_type,
      XSeekable.static_type,
      XTruncate.static_type,
      XAsyncOutputMonitor.static_type,
    ])
      own(new Reference(owner, UNO_QUERY_THROW, type));
    const input = own(value.getInputStream()),
      output = own(value.getOutputStream());
    expect(input.get()).toBe(owner.get());
    expect(output.get()).toBe(owner.get());
    const fields = data.getArray() as SequenceElements;
    for (let index = 0; index < 4; ++index) (fields.get(index) as [number])[0] = index + 7;
    value.truncate();
    expect(value.getPosition()).toBe(0n);
    expect(value.getLength()).toBe(0n);
    output.operatorStar().writeBytes(data);
    value.flush();
    value.waitForCompletion();
    value.seek(0n);
    expect(input.operatorStar().readBytes(data, 4)).toBe(4);
    expect(observed(data)).toEqual([7, 8, 9, 10]);
    if (outputFirst) {
      output.operatorStar().closeOutput();
      value.seek(0n);
      expect(input.operatorStar().readBytes(data, 1)).toBe(1);
      input.operatorStar().closeInput();
    } else {
      input.operatorStar().closeInput();
      value.writeBytes(own(new Bytes()));
      output.operatorStar().closeOutput();
    }
    value.waitForCompletion();
    value.flush();
    value.writeBytes(own(new Bytes()));
    rejects(
      /** Source nonempty write after actual close. @returns Nothing. */ () =>
        value.writeBytes(data),
      IOException,
    );
    rejects(
      /** Source truncate on a closed file. @returns Nothing. */ () => value.truncate(),
      IOException,
    );
    const file = own(new File(url)),
      size: [bigint] = [0n];
    expect(file.open(READ)).toBe(F.E_None);
    expect(file.getSize(size)).toBe(F.E_None);
    expect(size[0]).toBe(4n);
  });
}
it("closes a directly queried input facet without a requested output", /** Source facet flags follow getters, rather than queryInterface. @returns Nothing. */ () => {
  const owner = own(new Reference(new XStream_impl(fixture(), true))),
    value = owner.operatorStar();
  own(new Reference(owner, UNO_QUERY_THROW, XOutputStream.static_type));
  value.closeInput();
  rejects(
    /** Queried-only output does not keep storage open. @returns Nothing. */ () =>
      value.writeBytes(own(new Bytes(1))),
    IOException,
  );
});
it("marshals actual UNO lvalues through File without overwriting unread tails", /** Shared OSL byte-pointer binding retains signed bytes and unchanged storage. @returns Nothing. */ () => {
  const file = own(new File(fixture())),
    data = own(new Bytes(8)),
    fields = data.getArray() as SequenceElements,
    count: [bigint] = [0n];
  for (let index = 0; index < 8; ++index) (fields.get(index) as [number])[0] = 77;
  expect(file.open(READ | WRITE)).toBe(F.E_None);
  expect(file.read(fields, 8n, count)).toBe(F.E_None);
  expect(count[0]).toBe(5n);
  expect(observed(data)).toEqual([1, 2, 128, 255, 5, 77, 77, 77]);
  expect(file.setPos(ABS, 0n)).toBe(F.E_None);
  expect(file.write(fields, 5n, count)).toBe(F.E_None);
  expect(count[0]).toBe(5n);
  expect(file.read(null, 0n, count)).toBe(F.E_INVAL);
  expect(file.write(null, 0n, count)).toBe(F.E_INVAL);
  expect(file.read(fields, 0x80000000n, count)).toBe(F.E_OVERFLOW);
  expect(file.write(fields, 0x80000000n, count)).toBe(F.E_OVERFLOW);
  file.close();
  expect(file.read(fields, 1n, count)).toBe(F.E_INVAL);
  expect(file.write(fields, 1n, count)).toBe(F.E_INVAL);
});

it("retains failed-open retry errors and real readonly write failures", /** Actual OS statuses are retained without injected syscall results. @returns Nothing. */ () => {
  const absent = own(new ReconnectingFile(u(`file:///tmp/file-ucp-absent-${++serial}`))),
    count: [bigint] = [123n];
  expect(absent.open(READ)).toBe(F.E_NOENT);
  expect(absent.setPos(ABS, 1n)).toBe(F.E_INVAL);
  expect(absent.setSize(0n)).toBe(F.E_INVAL);
  expect(absent.getSize(count)).toBe(F.E_INVAL);
  const readonly = own(new ReconnectingFile(fixture()));
  expect(readonly.open(READ)).toBe(F.E_None);
  expect(readonly.write(Uint8Array.of(3), 1n, count)).toBe(F.E_BADF);
  expect(readonly.setSize(0n)).toBe(F.E_BADF);
  expect(readonly.setPos(CUR, -1n)).toBe(F.E_INVAL);
});

/** Writes fixture bytes through the existing SDK descriptor API. @param path - Real MEMFS path. @param bytes - Actual fixture bytes. @returns Nothing. */
function writeFixture(path: string, bytes: Uint8Array): void {
  const fs = getFileSystem(),
    stream = fs.open(path, "w+");
  try {
    expect(fs.write(stream, bytes, 0, bytes.length)).toBe(bytes.length);
  } finally {
    fs.close(stream);
  }
}

it("detaches shared byte sequences before actual file input writes", /** Real UNO copy-on-write preserves the borrowed previous value. @returns Nothing. */ () => {
  const owner = own(new Reference(new XInputStream_impl(fixture(), false))),
    data = own(new Bytes(2)),
    fields = data.getArray() as SequenceElements;
  (fields.get(0) as [number])[0] = 77;
  (fields.get(1) as [number])[0] = 88;
  const original = own(new Bytes(data));
  expect(owner.operatorStar().readBytes(data, 2)).toBe(2);
  expect(observed(original)).toEqual([77, 88]);
  expect(observed(data)).toEqual([1, 2]);
});
