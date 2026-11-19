/** @fileoverview Genuine SvStream/UNO wrapper graph: declared interfaces/weak lifetimes, native byte sequences, EOF/error ordering, seek narrowing, shared closures, actual persistence and C XML IO. No substituted successful stream provider or private state injector. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, releaseDomScope, read } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import {
  OInputStreamWrapper,
  OSeekableInputStreamWrapper,
  OOutputStreamWrapper,
  OSeekableOutputStreamWrapper,
  OStreamWrapper,
} from "./streamwrap";
import { SvMemoryStream, StreamMode } from "../../../tools/source/stream/stream.native";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XTruncate } from "../../../udkapi/com/sun/star/io/XTruncate";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { UnoType } from "../../../cppu/inc/unotype";
import { ByteReader } from "../../../comphelper/inc/bytereader";
import { SwitchablePersistenceStream } from "../../../package/source/xstor/switchpersistencestream";
import { CDocumentBuilder } from "../../../unoxml/source/dom/documentbuilder";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { ImplHelper1 } from "../../../cppuhelper/inc/implbase1";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Initializes genuine native ABI/runtime. @returns Completion. */ async () => {
    await initializeExceptionAbi();
    await initializeRuntime();
  },
);
afterEach(releaseDomScope);
it.each([OInputStreamWrapper, OSeekableInputStreamWrapper, OStreamWrapper])(
  "ports qadevOOo XInputStream available/readBytes/readSomeBytes/skipBytes/closeInput for %s",
  /** Original generic interface assertions use a real nonempty source, so none of the source harness's no-data skips apply. @param Wrapper - Actual original wrapper class. @returns Nothing. */ (
    Wrapper,
  ) => {
    const memory = own(new SvMemoryStream(Uint8Array.of(11, 22, 33, 44), 4, StreamMode.READ)),
      wrapper = own(new Reference(new Wrapper(memory))),
      input = wrapper.operatorStar(),
      data = bytes([0]);
    expect(input.available()).toBe(4);
    expect(input.readBytes(data, 1)).toBe(1);
    expect(data.getLength()).toBe(1);
    expect(values(data)).toEqual([11]);
    expect(input.readSomeBytes(data, 1)).toBe(1);
    expect(data.getLength()).toBe(1);
    expect(values(data)).toEqual([22]);
    input.skipBytes(1);
    expect(memory.Tell()).toBe(3n);
    input.closeInput();
    expect(memory.GetData()).not.toBeNull();
    failure(
      /** The wrapper closes its input while retaining the borrowed stream. @returns Count. */ () =>
        input.available(),
      NotConnectedException,
    );
  },
);
it("keeps seekable input usable after guarded native stream errors and repeated closure", /** Real readonly write sets the stream error; public ResetError restores the same stream without replacing a wrapper or lock. @returns Nothing. */ () => {
  const memory = own(new SvMemoryStream(Uint8Array.of(17, 34, 51), 3, StreamMode.READ)),
    wrapper = own(new Reference(new OSeekableInputStreamWrapper(memory))),
    input = wrapper.operatorStar(),
    output = own(new Reference(new OOutputStreamWrapper(memory))),
    data = bytes([]);
  failure(
    /** Sets the genuine source error through its output contract. @returns Nothing. */ () =>
      output.operatorStar().writeBytes(bytes([99])),
    BufferSizeExceededException,
  );
  for (const action of [
    /** Fails inside the read guard. @returns Count. */ () => input.readBytes(data, 1),
    /** Fails inside the pointer-read guard. @returns Count. */ () =>
      input.readSomeBytes(new Int8Array(1), 1),
    /** Fails inside the skip guard. @returns Nothing. */ () => input.skipBytes(0),
    /** Fails inside the availability guard. @returns Count. */ () => input.available(),
    /** Fails inside the seek guard. @returns Nothing. */ () => input.seek(0n),
    /** Fails inside the position guard. @returns Position. */ () => input.getPosition(),
    /** Fails inside the length guard. @returns Length. */ () => input.getLength(),
  ]) {
    failure(action, NotConnectedException);
  }
  memory.ResetError();
  input.seek(0n);
  expect(input.getLength()).toBe(3n);
  expect(input.getPosition()).toBe(0n);
  expect(input.readBytes(data, 2)).toBe(2);
  expect(values(data)).toEqual([17, 34]);
  input.skipBytes(-1);
  const raw = new Int8Array(2);
  expect(input.readSomeBytes(raw, 2)).toBe(2);
  expect([...raw]).toEqual([34, 51]);
  expect(input.available()).toBe(0);
  input.closeInput();
  input.closeInput();
  for (const action of [
    /** Disconnected skip still acquires the original guard. @returns Nothing. */ () =>
      input.skipBytes(0),
    /** Disconnected seek still acquires the original guard. @returns Nothing. */ () =>
      input.seek(0n),
    /** Disconnected position still acquires the original guard. @returns Position. */ () =>
      input.getPosition(),
  ]) {
    failure(action, NotConnectedException);
  }
  expect(memory.GetData()).not.toBeNull();
});
/** Native sequence fixture. @param values - Signed bytes. @returns Scoped sequence. */
function bytes(values: readonly number[]): Sequence<number> {
  const result = own(new Bytes(values.length)),
    fields = result.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i) (fields.get(i) as [number])[0] = values[i] as number;
  return result;
}
/** Native signed-cell observations. @param data - Actual sequence. @returns Values. */
function values(data: Sequence<number>): number[] {
  const result: number[] = [],
    fields = data.getConstArray() as SequenceElements;
  for (let i = 0; i < data.getLength(); ++i) result.push((fields.get(i) as [number])[0]);
  return result;
}
/** Checks real generated exception and releases its fields. @param action - Source call. @param constructor - Generated expected type. @returns Nothing. */
function failure(
  action: () => unknown,
  constructor: typeof NotConnectedException | typeof BufferSizeExceededException,
): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      caught = true;
      expect(error).toBeInstanceOf(constructor);
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
}
it("retains native sequence sizing, raw ByteReader overload, EOF and signed relative skips", /** Actual sequence and stream carry byte state across all input paths. @returns Nothing. */ () => {
  const memory = own(new SvMemoryStream(Uint8Array.of(0, 127, 128, 255), 4, StreamMode.READ)),
    wrapper = own(new Reference(new OSeekableInputStreamWrapper(memory))),
    input = wrapper.operatorStar(),
    output = bytes([9, 9, 9, 9, 9, 9]);
  expect(input instanceof ByteReader).toBe(true);
  expect(input.available()).toBe(4);
  expect(input.readBytes(output, 2)).toBe(2);
  expect(values(output)).toEqual([0, 127]);
  input.skipBytes(-1);
  expect(input.getPosition()).toBe(1n);
  expect(input.readSomeBytes(output.getArray() as SequenceElements, 2)).toBe(2);
  expect(values(output)).toEqual([127, -128]);
  expect(input.readSomeBytes(output, 8)).toBe(1);
  expect(values(output)).toEqual([-1]);
  expect(input.readSomeBytes(output, 8)).toBe(0);
  expect(values(output)).toEqual([]);
  input.seek(0n);
  expect(input.getLength()).toBe(4n);
  expect(input.getPosition()).toBe(0n);
  failure(
    /** Negative source count. @returns Count. */ () => input.readBytes(output, -1),
    BufferSizeExceededException,
  );
  failure(
    /** Negative pointer count. @returns Count. */ () =>
      input.readSomeBytes(output.getArray() as SequenceElements, -1),
    BufferSizeExceededException,
  );
  failure(
    /** Negative sequence count. @returns Count. */ () => input.readSomeBytes(output, -1),
    BufferSizeExceededException,
  );
  input.closeInput();
  input.closeInput();
  expect(memory.GetData()).not.toBeNull();
  failure(
    /** Connection check precedes negative count check. @returns Count. */ () =>
      input.readBytes(output, -1),
    NotConnectedException,
  );
  failure(
    /** Sequence overload checks source error/connection first. @returns Count. */ () =>
      input.readSomeBytes(output, -1),
    NotConnectedException,
  );
  failure(
    /** Disconnected availability. @returns Count. */ () => input.available(),
    NotConnectedException,
  );
  failure(
    /** Disconnected length. @returns Length. */ () => input.getLength(),
    NotConnectedException,
  );
});
it("retains owned versus borrowed stream disposal without manual JS storage management", /** External typed views remain valid after source lifecycle disposal. @returns Nothing. */ () => {
  const data = Uint8Array.of(4, 5),
    memory = new SvMemoryStream(data, 2, StreamMode.READ),
    wrapper = own(new Reference(new OInputStreamWrapper(memory, true)));
  wrapper.operatorStar().closeInput();
  expect(memory.GetData()).toBeNull();
  expect([...data]).toEqual([4, 5]);
  const second = new SvMemoryStream(Uint8Array.of(8), 1, StreamMode.READ),
    final = new Reference(new OInputStreamWrapper(second, true));
  final.dispose();
  expect(second.GetData()).toBeNull();
  const disconnected = own(new Reference(new OInputStreamWrapper(null)));
  failure(
    /** Original disconnected pointer. @returns Count. */ () =>
      disconnected.operatorStar().available(),
    NotConnectedException,
  );
});
it("retains output no-op closure, exact error mappings and seekable output uint32 narrowing", /** Real fixed memory forces partial writes/errors; no fake source state. @returns Nothing. */ () => {
  const memory = own(new SvMemoryStream()),
    output = own(new Reference(new OSeekableOutputStreamWrapper(memory))),
    api = output.operatorStar();
  api.writeBytes(bytes([1, 2, 3]));
  api.flush();
  api.closeOutput();
  api.writeBytes(bytes([4]));
  expect(api.getLength()).toBe(4n);
  api.seek(0x100000002n);
  expect(api.getPosition()).toBe(2n);
  api.writeBytes(bytes([9]));
  api.flush();
  expect([...(memory.GetData() as Uint8Array).subarray(0, 4)]).toEqual([1, 2, 9, 4]);
  const seek = own(new Reference<XSeekable>(output, UNO_QUERY_THROW, XSeekable.static_type)),
    root = own(
      new Reference<XInterface>(
        seek,
        UNO_QUERY_THROW,
        /** Original generated root type getter. @returns Native type. */ () =>
          UnoType.get("XInterface"),
      ),
    );
  expect(root.get()).toBe(output.get());
  const helper = ImplHelper1.specialize(XSeekable);
  expect(ImplHelper1.specialize(XSeekable)).toBe(helper);
  expect(own(helper.prototype.getTypes.call(api)).getLength()).toBe(2);
  expect(own(helper.prototype.getImplementationId.call(api)).getLength()).toBe(0);
  const limited = own(new SvMemoryStream(new Uint8Array(2), 2, StreamMode.READWRITE)),
    short = own(new Reference(new OOutputStreamWrapper(limited)));
  failure(
    /** Real short fixed-buffer write. @returns Nothing. */ () =>
      short.operatorStar().writeBytes(bytes([1, 2, 3])),
    BufferSizeExceededException,
  );
  failure(
    /** Source error persists to flush. @returns Nothing. */ () => short.operatorStar().flush(),
    NotConnectedException,
  );
  limited.ResetError();
  limited.MakeReadOnly();
  const input = own(new Reference(new OInputStreamWrapper(limited)));
  failure(
    /** Real readonly source write. @returns Nothing. */ () =>
      short.operatorStar().writeBytes(bytes([8])),
    BufferSizeExceededException,
  );
  failure(
    /** Actual stream error maps to original input exception. @returns Count. */ () =>
      input.operatorStar().readSomeBytes(bytes([]), 1),
    NotConnectedException,
  );
});
it("shares all native facets through persistence, preserves output closure and source truncate behavior", /** Original storage persistence consumes actual OStreamWrapper rather than a substitute memory UNO stream. @returns Nothing. */ () => {
  const memory = own(new SvMemoryStream()),
    wrapper = own(new Reference(new OStreamWrapper(memory))),
    source = own(new Reference<XStream>(wrapper, UNO_QUERY_THROW, XStream.static_type)),
    persistence = own(new Reference(new SwitchablePersistenceStream(source, "stream"))),
    input = own(persistence.operatorStar().getInputStream()),
    output = own(persistence.operatorStar().getOutputStream());
  output.operatorStar().writeBytes(bytes([3, 4, 5]));
  output.operatorStar().flush();
  wrapper.operatorStar().seek(0n);
  const data = bytes([]);
  expect(input.operatorStar().readBytes(data, 8)).toBe(3);
  expect(values(data)).toEqual([3, 4, 5]);
  const directInput = own(wrapper.operatorStar().getInputStream()),
    directOutput = own(wrapper.operatorStar().getOutputStream()),
    truncate = own(new Reference<XTruncate>(wrapper, UNO_QUERY_THROW, XTruncate.static_type));
  expect(
    own(new Reference<XInputStream>(wrapper, UNO_QUERY_THROW, XInputStream.static_type)).get(),
  ).toBe(wrapper.get());
  expect(
    own(new Reference<XOutputStream>(wrapper, UNO_QUERY_THROW, XOutputStream.static_type)).get(),
  ).toBe(wrapper.get());
  expect(directInput.get()).toBe(wrapper.get());
  expect(directOutput.get()).toBe(wrapper.get());
  directOutput.operatorStar().closeOutput();
  directOutput.operatorStar().writeBytes(bytes([6]));
  truncate.operatorStar().truncate();
  expect(wrapper.operatorStar().getLength()).toBe(0n);
  wrapper.operatorStar().closeInput();
  failure(
    /** Input closure is shared across all input facets. @returns Count. */ () =>
      directInput.operatorStar().available(),
    NotConnectedException,
  );
});
it("parses Unicode XML with actual C DocumentBuilder over SvMemoryStream/UNO wrapper", /** Native callbacks consume the same real byte stream and close the borrowed wrapper. @returns Nothing. */ () => {
  const xml = new TextEncoder().encode("<root>字😀&amp;</root>"),
    memory = own(new SvMemoryStream(xml, xml.length, StreamMode.READ)),
    input = own(new Reference(new OInputStreamWrapper(memory))),
    builder = own(new Reference(new CDocumentBuilder())),
    doc = own(builder.operatorStar().parse(input)),
    root = own(doc.operatorStar().getDocumentElement());
  expect(read(root.operatorStar().getNodeName())).toBe("root");
  const text = own(root.operatorStar().getFirstChild());
  expect(read(text.operatorStar().getNodeValue())).toBe("字😀&");
  expect(memory.GetData()).toBe(xml);
});
it("preserves shared wrapper write/flush errors and silent truncate failure on real readonly memory", /** Error behavior differs across write, flush and truncate and must not be normalized by the bridge. @returns Nothing. */ () => {
  const memory = own(new SvMemoryStream(Uint8Array.of(7, 8), 2, StreamMode.READ)),
    wrapper = own(new Reference(new OStreamWrapper(memory))),
    api = wrapper.operatorStar();
  failure(
    /** Actual readonly stream write. @returns Nothing. */ () => api.writeBytes(bytes([1])),
    BufferSizeExceededException,
  );
  failure(
    /** Shared wrapper flush converts persistent source error. @returns Nothing. */ () =>
      api.flush(),
    NotConnectedException,
  );
  memory.ResetError();
  api.truncate();
  expect(memory.GetError().IsSet()).toBe(true);
  expect(memory.GetSize()).toBe(2n);
  failure(
    /** Source getLength checks existing error. @returns Length. */ () => api.getLength(),
    NotConnectedException,
  );
});
it("retains input diagnostic/context and seekable output errors on genuine failed streams", /** Real readonly write creates the source error; queries must preserve it and identify the actual component. @returns Nothing. */ () => {
  const memory = own(new SvMemoryStream(Uint8Array.of(3), 1, StreamMode.READ)),
    output = own(new Reference(new OSeekableOutputStreamWrapper(memory))),
    input = own(new Reference(new OInputStreamWrapper(memory)));
  failure(
    /** Creates real source write error. @returns Nothing. */ () =>
      output.operatorStar().writeBytes(bytes([8])),
    BufferSizeExceededException,
  );
  let caught = false;
  try {
    input.operatorStar().available();
  } catch (error) {
    if (!(error instanceof NotConnectedException)) throw error;
    try {
      caught = true;
      expect(read(new OUString(error.Message))).toContain("utl::OInputStreamWrapper error ");
      expect(error.Context.get()).toBe(input.get());
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
  failure(
    /** Existing error persists after output seek. @returns Nothing. */ () =>
      output.operatorStar().seek(0n),
    NotConnectedException,
  );
  failure(
    /** Position is checked after Tell. @returns Position. */ () =>
      output.operatorStar().getPosition(),
    NotConnectedException,
  );
  failure(
    /** Length is checked before TellEnd. @returns Length. */ () =>
      output.operatorStar().getLength(),
    NotConnectedException,
  );
});
