/** @fileoverview Real seekable identity, lazy original-stream lifetime and registered native TempFile copy; no fake TempFile/provider or private-state injection. */
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { beforeAll, afterEach, it, expect } from "vitest";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { getProcessComponentContext } from "../../inc/processfactory";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import {
  XTempFile,
  cppu_detail_getUnoType as tempType,
  getCppuType as tempPointerType,
} from "../../../udkapi/com/sun/star/io/XTempFile";
import { TempFile } from "../../../udkapi/com/sun/star/io/TempFile";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { ByteReader } from "../../inc/bytereader";
import { Mutex, ScopedLock } from "../../../external/libcxx/mutex";
import { OSeekableInputWrapper } from "./seekableinput";
import { UNOMemoryStream } from "./memorystream";
import { OInputStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { SvMemoryStream, StreamMode } from "../../../tools/inc/stream";
import { getFileSystem } from "../../../external/emscripten/runtime";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { own, releaseDomScope } from "../../../test/native-dom";
beforeAll(
  /** Actual runtime and original production service manager. @returns Completion. */ async () => {
    await initializeExceptionAbi();
    await initializeRuntime();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Actual context, never an injected factory. @returns Acquired context. */
function context() {
  return own(new Reference<XComponentContext>(getProcessComponentContext().get()));
}
it("binds real C++ mutex construction and scoped_lock on the pinned native runtime", /** Native lock/unlock/delete calls; no thread-race assertion. @returns Nothing. */ () => {
  const mutex = own(new Mutex());
  mutex.lock();
  mutex.unlock();
  const guard = new ScopedLock(mutex);
  guard.dispose();
  const next = new ScopedLock(mutex);
  next.dispose();
});
it("returns the same actual seekable source without seeking, copying or needing context", /** Both valid and absent contexts on the original fast path. @returns Nothing. */ () => {
  const memory = own(new Reference(new UNOMemoryStream()));
  memory.operatorStar().writeBytes(new Int8Array([4, 5, 6]), 3);
  memory.operatorStar().seek(2n);
  const first = own(OSeekableInputWrapper.CheckSeekableCanWrap(memory, own(new Reference()))),
    second = own(OSeekableInputWrapper.CheckSeekableCanWrap(memory, context()));
  expect(first.get()).toBe(memory.get());
  expect(second.get()).toBe(memory.get());
  expect(memory.operatorStar().getPosition()).toBe(2n);
});
it("creates the original lazy wrapper even for an empty original and publishes native IO/ByteReader bases", /** Original helper does not reject empty input when context is real. @returns Nothing. */ () => {
  const wrapper = own(OSeekableInputWrapper.CheckSeekableCanWrap(own(new Reference()), context()));
  expect(wrapper.get() instanceof OSeekableInputWrapper).toBe(true);
  expect(wrapper.get() instanceof ByteReader).toBe(true);
  expect(own(new Reference(wrapper, UNO_QUERY, XInputStream.static_type)).get()).toBe(
    wrapper.get(),
  );
  expect(own(new Reference(wrapper, UNO_QUERY, XSeekable.static_type)).get()).toBe(wrapper.get());
  const input = wrapper.operatorStar(),
    seek = own(new Reference<XSeekable>(wrapper, UNO_QUERY, XSeekable.static_type)).operatorStar(),
    data = own(new (Sequence.specialize<number>("sal_Int8", 1))());
  for (const action of [
    /** Closed read. @returns Result. */ () => input.readBytes(data, 1),
    /** Closed Some read. @returns Result. */ () => input.readSomeBytes(data, 1),
    /** Closed skip. @returns Nothing. */ () => input.skipBytes(1),
    /** Closed availability. @returns Result. */ () => input.available(),
    /** Closed close. @returns Nothing. */ () => input.closeInput(),
    /** Closed seek. @returns Nothing. */ () => seek.seek(0n),
    /** Closed position. @returns Result. */ () => seek.getPosition(),
    /** Closed length. @returns Result. */ () => seek.getLength(),
  ])
    expectNotConnected(action);
  const concrete = wrapper.get();
  if (!(concrete instanceof OSeekableInputWrapper)) throw new Error("actual wrapper absent");
  expectNotConnected(
    /** Closed pointer read. @returns Result. */ () => concrete.readSomeBytes(new Int8Array(1), 1),
  );
});
/** Actual generated disconnected error and disposal. @param action - Source call. @returns Nothing. */
function expectNotConnected(action: () => unknown): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof NotConnectedException)) throw error;
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
}
it("copies the actual nonseekable input lazily through registered TempFile and releases it on close", /** Original32000-byte loop, actual file owner and close endpoints; no substituted stream implementation. @returns Nothing. */ () => {
  const data = Uint8Array.from(
      { length: 96017 },
      /** Checks the declared real-runtime source contract. @param _ - Actual declared argument. @param index - Actual declared argument. @returns Original result or test completion. */ (
        _,
        index,
      ) => index % 251,
    ),
    memory = own(new SvMemoryStream(data, data.length, StreamMode.READ)),
    input = own(new Reference<XInputStream>(new OInputStreamWrapper(memory))),
    before = getFileSystem().readdir("/tmp").length,
    wrapper = own(OSeekableInputWrapper.CheckSeekableCanWrap(input, context())),
    seek = own(new Reference<XSeekable>(wrapper, UNO_QUERY, XSeekable.static_type));
  expect(memory.Tell()).toBe(0n);
  expect(getFileSystem().readdir("/tmp").length).toBe(before);
  expect(seek.operatorStar().getLength()).toBe(BigInt(data.length));
  expect(memory.Tell()).toBe(BigInt(data.length));
  expect(getFileSystem().readdir("/tmp").length).toBe(before + 1);
  seek.operatorStar().seek(31999n);
  const output = own(new (Sequence.specialize<number>("sal_Int8", 1))());
  expect(wrapper.operatorStar().readBytes(output, 5)).toBe(5);
  const fields = output.getConstArray() as SequenceElements;
  for (let index = 0; index < 5; index++)
    expect((fields?.get(index) as [number])[0] & 255).toBe(data[31999 + index]);
  const concrete = wrapper.get();
  if (!(concrete instanceof OSeekableInputWrapper)) throw new Error("actual wrapper absent");
  const raw = new Int8Array(4);
  expect(concrete.readSomeBytes(raw, 4)).toBe(4);
  expect(
    [...raw].map(
      /** Checks the declared real-runtime source contract. @param value - Actual declared argument. @returns Original result or test completion. */ (
        value,
      ) => value & 255,
    ),
  ).toEqual([...data.subarray(32004, 32008)]);
  seek.operatorStar().seek(0n);
  expect(wrapper.operatorStar().readBytes(output, data.length)).toBe(data.length);
  const entire = output.getConstArray() as SequenceElements;
  const observed = Array.from(
    { length: data.length },
    /** Observes actual original byte values. @param _ - Actual argument. @param index - Actual argument. @returns Actual byte/result. */ (
      _,
      index,
    ) => (entire.get(index) as [number])[0] & 255,
  );
  expect(observed).toEqual([...data]);
  wrapper.operatorStar().closeInput();
  expect(getFileSystem().readdir("/tmp").length).toBe(before);
  expectNotConnected(
    /** Checks the declared real-runtime source contract. @returns Original result or test completion. */ () =>
      seek.operatorStar().getLength(),
  );
  const temporary = own(TempFile.create(context()));
  expect(temporary.is()).toBe(true);
  temporary.operatorStar().getOutputStream().dispose();
  expect(tempPointerType()).toBe(tempType());
  expect(XTempFile.static_type()).toBe(tempType());
});
