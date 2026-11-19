/** @fileoverview Actual UNO-to-SvStream adapters and original ring-page pipe, source sentinel/position/error quirks, real native wrappers/Sequence owners and C XML roundtrip. No fake byte or seek provider and no private state patch. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, releaseDomScope, read } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { SvInputStream, SvOutputStream, SvDataPipe_Impl } from "./strmadpt";
import {
  SvMemoryStream,
  StreamMode,
  STREAM_SEEK_TO_END,
} from "../../../tools/source/stream/stream.native";
import {
  OInputStreamWrapper,
  OSeekableInputStreamWrapper,
  OOutputStreamWrapper,
} from "../../../unotools/source/streaming/streamwrap";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OSequenceOutputStream } from "../../../comphelper/source/streaming/seqstream";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { ErrCode, ErrCodeArea as A, ErrCodeClass as C } from "../../../comphelper/inc/errcode";
import { CDocumentBuilder } from "../../../unoxml/source/dom/documentbuilder";
beforeAll(
  /** Initializes actual native runtime and exception ABI. @returns Completion. */ async () => {
    await initializeExceptionAbi();
    await initializeRuntime();
  },
);
afterEach(releaseDomScope);
it("retains seekable query, deferred end sentinel restoration and exact native byte sequence reads", /** Real source wrapper and memory stream back every query. @returns Nothing. */ () => {
  const memory = own(new SvMemoryStream(Uint8Array.of(1, 2, 3, 4), 4, StreamMode.READ)),
    input = own(new Reference(new OSeekableInputStreamWrapper(memory))),
    stream = own(new SvInputStream(input)),
    data = new Uint8Array(6);
  expect(stream.ReadBytes(data, 2)).toBe(2);
  expect([...data.subarray(0, 2)]).toEqual([1, 2]);
  expect(stream.Tell()).toBe(2n);
  expect(stream.TellEnd()).toBe(4n);
  expect(stream.Tell()).toBe(2n);
  expect(input.operatorStar().getPosition()).toBe(2n);
  expect(stream.ReadBytes(data, 6)).toBe(2);
  expect([...data.subarray(0, 2)]).toEqual([3, 4]);
  expect(stream.eof()).toBe(true);
  expect(stream.Seek(0n)).toBe(0n);
  expect(stream.ReadBytes(data, 4)).toBe(4);
  expect([...data.subarray(0, 4)]).toEqual([1, 2, 3, 4]);
  expect(stream.Seek(STREAM_SEEK_TO_END)).toBe(4n);
  expect(stream.ReadBytes(data, 1)).toBe(0);
});
it("retains nonseekable pipe reads, short-read closure and forward seek's unchecked requested position", /** Genuine input-only wrapper cannot answer XSeekable; its source bytes are never fabricated. @returns Nothing. */ () => {
  const memory = own(new SvMemoryStream(Uint8Array.of(1, 2, 3, 4, 5), 5, StreamMode.READ)),
    input = own(new Reference(new OInputStreamWrapper(memory))),
    stream = own(new SvInputStream(input)),
    data = new Uint8Array(8);
  expect(stream.ReadBytes(data, 2)).toBe(2);
  expect([...data.subarray(0, 2)]).toEqual([1, 2]);
  expect(stream.TellEnd()).toBe(2n);
  expect(stream.Tell()).toBe(2n);
  expect(stream.Seek(9n)).toBe(9n);
  expect(stream.Tell()).toBe(9n);
  expect(memory.Tell()).toBe(5n);
  expect(stream.ReadBytes(data, 8)).toBe(0);
  expect(stream.eof()).toBe(true);
  expect(stream.Seek(0n)).toBe(9n);
  expect(stream.GetError().valueOf()).toBe(new ErrCode(A.Io, C.General, 18).valueOf());
});
it.each([0, 1, 999, 1000, 1001, 101001])(
  "retains source page/direct byte counts for%i initialized nonseekable bytes",
  /** Direct source adapter reads genuine UNO cells; EOF closes the real wrapper. @param size - Actual input length. @returns Nothing. */ (
    size,
  ) => {
    const data = Uint8Array.from(
        { length: size },
        /** Initializes source bytes. @param _ - Unused. @param i - Index. @returns Byte. */ (
          _,
          i,
        ) => i & 255,
      ),
      memory = own(new SvMemoryStream(data, size, StreamMode.READ)),
      input = own(new Reference(new OInputStreamWrapper(memory))),
      stream = own(new SvInputStream(input)),
      result = new Uint8Array(size + 1);
    expect(stream.ReadBytes(result, size + 1)).toBe(size);
    expect([...result.subarray(0, size)]).toEqual([...data]);
    expect(stream.GetError().IsSet()).toBe(false);
    expect(stream.eof()).toBe(true);
    expect(stream.ReadBytes(result, 1)).toBe(0);
  },
);
it("retains genuine input disconnection and unsupported-operation error precedence", /** Real native connection failures, not an injected error or a fake read. @returns Nothing. */ () => {
  const missing = own(new SvInputStream(own(new Reference<XInputStream>()))),
    byte = new Uint8Array(1);
  expect(missing.ReadBytes(byte, 1)).toBe(0);
  expect(missing.GetError().valueOf()).toBe(new ErrCode(A.Io, C.Path, 6).valueOf());
  const memory = own(new SvMemoryStream(Uint8Array.of(1), 1, StreamMode.READ)),
    input = own(new Reference(new OSeekableInputStreamWrapper(memory))),
    stream = own(new SvInputStream(input));
  input.operatorStar().closeInput();
  expect(stream.ReadBytes(byte, 1)).toBe(0);
  expect(stream.GetError().valueOf()).toBe(new ErrCode(A.Io, C.Read, 15).valueOf());
  stream.ResetError();
  expect(stream.WriteBytes(byte, 1)).toBe(0);
  expect(stream.GetError().valueOf()).toBe(new ErrCode(A.Io, C.NotSupported, 12).valueOf());
  stream.ResetError();
  expect(stream.SetStreamSize(1n)).toBe(false);
});
it("writes actual native Sequence output and preserves unsupported read/seek/resize semantics", /** Real OSequenceOutputStream observes the output protocol and source lifecycle. @returns Nothing. */ () => {
  const sequence = own(new (Sequence.specialize<number>("sal_Int8", 1))()),
    output = own(new Reference(new OSequenceOutputStream(sequence))),
    stream = own(new SvOutputStream(output)),
    source = Uint8Array.of(0, 127, 128, 255);
  expect(stream.WriteBytes(source, 4)).toBe(4);
  stream.Flush();
  expect(sequence.getLength()).toBe(4);
  const fields = sequence.getConstArray() as SequenceElements;
  expect((fields.get(3) as [number])[0]).toBe(-1);
  expect(stream.ReadBytes(new Uint8Array(1), 1)).toBe(0);
  expect(stream.GetError().valueOf()).toBe(new ErrCode(A.Io, C.NotSupported, 12).valueOf());
  stream.ResetError();
  expect(stream.Seek(4n)).toBe(0n);
  stream.ResetError();
  expect(stream.SetStreamSize(0n)).toBe(false);
  const missing = own(new SvOutputStream(own(new Reference<XOutputStream>())));
  expect(missing.WriteBytes(source, 1)).toBe(0);
  expect(missing.GetError().valueOf()).toBe(new ErrCode(A.Io, C.Write, 16).valueOf());
  missing.ResetError();
  missing.Flush();
  expect(missing.GetError().valueOf()).toBe(new ErrCode(A.Io, C.Path, 6).valueOf());
});
it("preserves output IOException translation and silently swallowed flush IOException", /** Actual readonly native stream produces real wrapper exceptions. @returns Nothing. */ () => {
  const memory = own(new SvMemoryStream(new Uint8Array(1), 1, StreamMode.READ)),
    output = own(new Reference(new OOutputStreamWrapper(memory))),
    stream = own(new SvOutputStream(output));
  expect(stream.WriteBytes(Uint8Array.of(7), 1)).toBe(0);
  expect(stream.GetError().valueOf()).toBe(new ErrCode(A.Io, C.Write, 16).valueOf());
  stream.ResetError();
  stream.Flush();
  expect(stream.GetError().IsSet()).toBe(false);
});
it("retains original ring pages, backward retained seeks, recycling and EOF", /** Genuine source pipe exercises more than100pages without private pointer/mark mutation. @returns Nothing. */ () => {
  const pipe = own(new SvDataPipe_Impl()),
    data = Uint8Array.from(
      { length: 104005 },
      /** Source bytes. @param _ - Unused. @param i - Index. @returns Byte. */ (_, i) => i & 255,
    ),
    first = new Uint8Array(1500),
    rest = new Uint8Array(104005);
  expect(pipe.setReadPosition(0)).toBe(SvDataPipe_Impl.SEEK_OK);
  expect(pipe.setReadPosition(1)).toBe(SvDataPipe_Impl.SEEK_PAST_END);
  expect(pipe.read()).toBe(0);
  pipe.write(data, data.length);
  pipe.setReadBuffer(first, 1500);
  expect(pipe.read()).toBe(1500);
  expect([...first]).toEqual([...data.subarray(0, 1500)]);
  expect(pipe.setReadPosition(0)).toBe(SvDataPipe_Impl.SEEK_BEFORE_MARKED);
  expect(pipe.setReadPosition(1000)).toBe(SvDataPipe_Impl.SEEK_OK);
  pipe.setReadBuffer(rest, 104005);
  const count = pipe.read();
  expect(count).toBe(103005);
  expect([...rest.subarray(0, count)]).toEqual([...data.subarray(1000)]);
  pipe.setEOF();
  expect(pipe.isEOF()).toBe(true);
  pipe.clearReadBuffer();
  expect(pipe.read()).toBe(0);
  expect(pipe.setReadPosition(data.length + 1)).toBe(SvDataPipe_Impl.SEEK_PAST_END);
});
it("preserves direct pipe bypass's missing source-pointer advance when a suffix remains", /** Defined original source API reproduces retained prefix bytes; no source state patch. @returns Nothing. */ () => {
  const pipe = own(new SvDataPipe_Impl()),
    first = new Uint8Array(3),
    rest = new Uint8Array(2);
  pipe.setReadBuffer(first, 3);
  pipe.write(Uint8Array.of(1, 2, 3, 4, 5), 5);
  expect(pipe.read()).toBe(3);
  expect([...first]).toEqual([1, 2, 3]);
  pipe.setReadBuffer(rest, 2);
  expect(pipe.read()).toBe(2);
  expect([...rest]).toEqual([1, 2]);
});
it("feeds actual C DocumentBuilder through both native adapter directions", /** SvInputStream pulls real seekable UNO bytes; output wrapper supplies native parser callback input. @returns Nothing. */ () => {
  const xml = new TextEncoder().encode("<root>字😀</root>"),
    memory = own(new SvMemoryStream(xml, xml.length, StreamMode.READ)),
    origin = own(new Reference(new OSeekableInputStreamWrapper(memory))),
    input = own(new SvInputStream(origin)),
    wrapper = own(new Reference(new OInputStreamWrapper(input))),
    builder = own(new Reference(new CDocumentBuilder())),
    document = own(builder.operatorStar().parse(wrapper)),
    root = own(document.operatorStar().getDocumentElement()),
    text = own(root.operatorStar().getFirstChild());
  expect(read(text.operatorStar().getNodeValue())).toBe("字😀");
});

it("uses pointer displacement within actual typed backing storage rather than JS subview length", /** Original memcpy count is independent of a subview's JS length; both requested native ranges remain inside their actual allocation. @returns Nothing. */ () => {
  const pipe = own(new SvDataPipe_Impl()),
    source = Uint8Array.of(1, 2, 3, 4),
    target = new Uint8Array(4);
  pipe.write(source.subarray(1, 2), 2);
  pipe.setReadBuffer(target.subarray(1, 2), 2);
  expect(pipe.read()).toBe(2);
  expect([...target]).toEqual([0, 2, 3, 0]);
});
