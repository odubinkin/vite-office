/** @fileoverview Pinned tools/qa/cppunit/test_stream.cxx byte/stdstream, MakeReadOnly and self-write source regressions plus actual native memory/sequence owners, buffering, endian, copy and allocation ownership. */
import { beforeAll, afterEach, expect, it } from "vitest";
import { own, releaseDomScope } from "../../../test/native-dom";
import { SvMemoryStream, StreamMode, SvStreamEndian, STREAM_SEEK_TO_END } from "./stream.native";
import { ErrCode, ErrCodeArea, ErrCodeClass, WarningFlag } from "../../../comphelper/inc/errcode";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { initializeRuntime } from "../../../external/emscripten/runtime";
beforeAll(initializeRuntime);
afterEach(releaseDomScope);
/** Source ASCII byte literal, not a decoded-value provider. @param text - Source fixture. @returns Native byte view. */
function ascii(text: string): Uint8Array {
  return Uint8Array.from(
    text,
    /** Source char unit. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
  );
}
/** Observes initialized logical data only, never native uninitialized capacity. @param stream - Actual memory owner. @returns Initialized prefix. */
function content(stream: SvMemoryStream): number[] {
  const size = Number(stream.GetSize()),
    data = stream.GetData() as Uint8Array;
  return size === 0 ? [] : Array.from(data.subarray(0, size));
}
it("ports original test_stdstream byte/EOF/short scalar/output preservation assertions", /** Original C++ stream comparisons retain actual SvMemoryStream observations without a stdstream substitute. @returns Nothing. */ () => {
  const stream = own(new SvMemoryStream(ascii("foo"), 3, StreamMode.READ)),
    value: [number] = [78];
  stream.ReadChar(value);
  expect(value[0]).toBe(102);
  stream.Seek(STREAM_SEEK_TO_END);
  expect(stream.eof()).toBe(false);
  expect(stream.good()).toBe(true);
  value[0] = 78;
  stream.ReadChar(value);
  expect(stream.eof()).toBe(true);
  expect(value[0]).toBe(78);
  expect(stream.bad()).toBe(false);
  expect(stream.good()).toBe(false);
  const number: [number] = [0x1122];
  stream.SeekRel(-1n);
  expect(stream.eof()).toBe(false);
  expect(stream.good()).toBe(true);
  stream.ReadUInt16(number);
  expect(stream.good()).toBe(false);
  expect(stream.eof()).toBe(true);
  expect(number[0]).toBe(0x1122);
  stream.Seek(0n);
  expect(stream.good()).toBe(true);
  stream.ReadChar(value);
  expect(value[0]).toBe(102);
  stream.Seek(0n);
  const buffer = new Uint8Array(1024);
  expect(stream.ReadBytes(buffer, buffer.length)).toBe(3);
  expect(stream.good()).toBe(false);
  expect(stream.bad()).toBe(false);
  expect(stream.eof()).toBe(true);
});
it("ports original test_makereadonly including a3GiB seek without growth", /** Exact source values/packed errors and native64 lvalue preserve the readonly transition. @returns Nothing. */ () => {
  const stream = own(new SvMemoryStream());
  expect(stream.IsWritable()).toBe(true);
  expect(stream.GetSize()).toBe(0n);
  stream.WriteInt64(21n);
  expect(stream.GetError().valueOf()).toBe(0);
  expect(stream.GetSize()).toBe(8n);
  stream.MakeReadOnly();
  expect(stream.IsWritable()).toBe(false);
  expect(stream.GetSize()).toBe(8n);
  stream.WriteInt64(42n);
  expect(stream.GetError().valueOf()).toBe(
    new ErrCode(ErrCodeArea.Io, ErrCodeClass.Write, 16).valueOf(),
  );
  expect(stream.GetSize()).toBe(8n);
  stream.ResetError();
  stream.Seek(3n * 1024n * 1024n * 1024n);
  expect(stream.GetSize()).toBe(8n);
  stream.ResetError();
  stream.Seek(0n);
  const result: [bigint] = [0n];
  stream.ReadInt64(result);
  expect(stream.GetError().valueOf()).toBe(0);
  expect(result[0]).toBe(21n);
});
it("ports original test_write_from_self pointer relocation regression", /** Source tiny allocation/disabled buffering forces the actual owner to grow while input aliases the old allocation. @returns Nothing. */ () => {
  const stream = own(new SvMemoryStream(16, 16)),
    pattern = ascii("0123456789ABCDE");
  stream.SetBufferSize(0);
  stream.WriteBytes(pattern, 15);
  expect(stream.GetError().valueOf()).toBe(0);
  stream.WriteBytes(stream.GetData(), 15);
  expect(stream.GetError().valueOf()).toBe(0);
  expect(stream.GetSize()).toBe(30n);
  stream.Seek(0n);
  const result = new Uint8Array(30);
  expect(stream.ReadBytes(result, 30)).toBe(30);
  expect(stream.GetError().valueOf()).toBe(0);
  expect([...result.subarray(0, 15)]).toEqual([...pattern]);
  expect([...result.subarray(15)]).toEqual([...pattern]);
});
it.each([0, 1, 2, 8, 64, 1024])(
  "retains mixed raw reads/writes and flush/seek transitions with buffer%i",
  /** Real backing owner spans direct, within-buffer, refill and dirty flush paths. @param buffer - Actual source buffer size. @returns Nothing. */ (
    buffer,
  ) => {
    const stream = own(new SvMemoryStream(0, 16));
    stream.SetBufferSize(buffer);
    const first = Uint8Array.from(
      { length: 129 },
      /** Initialized fixture byte. @param _ - Unused. @param i - Index. @returns Byte. */ (_, i) =>
        (i * 17) & 255,
    );
    expect(stream.WriteBytes(first, first.length)).toBe(first.length);
    expect(stream.Tell()).toBe(129n);
    stream.Seek(3n);
    expect(stream.WriteBytes(Uint8Array.of(250, 251), 2)).toBe(2);
    stream.Flush();
    stream.Seek(0n);
    const read = new Uint8Array(150);
    expect(stream.ReadBytes(read, 150)).toBe(129);
    expect(stream.eof()).toBe(true);
    const expected = first.slice();
    expected.set([250, 251], 3);
    expect([...read.subarray(0, 129)]).toEqual([...expected]);
    stream.Seek(2n);
    const small = new Uint8Array(2);
    expect(stream.ReadBytes(small, 2)).toBe(2);
    expect([...small]).toEqual([first[2], 250]);
    expect(stream.remainingSize()).toBe(125n);
    expect(stream.Tell()).toBe(4n);
  },
);
it.each([SvStreamEndian.LITTLE, SvStreamEndian.BIG])(
  "retains declared integer/float scalar representations and byte fast paths endian%i",
  /** Native byte storage is inspected independently from the same reader's scalar results. @param endian - Source target order. @returns Nothing. */ (
    endian,
  ) => {
    const stream = own(new SvMemoryStream(0, 16));
    stream.SetEndian(endian);
    expect(stream.GetEndian()).toBe(endian);
    expect(stream.IsEndianSwap()).toBe(endian === SvStreamEndian.BIG);
    stream
      .WriteInt16(-2)
      .WriteUInt16(0xabcd)
      .WriteInt32(-123)
      .WriteUInt32(0x81234567)
      .WriteInt64(-1234567890123n)
      .WriteUInt64(0xf123456789abcdefn)
      .WriteFloat(1.5)
      .WriteDouble(-2.25)
      .WriteChar(-1)
      .WriteSChar(-2)
      .WriteUChar(253);
    const bytes = content(stream);
    expect(bytes.slice(0, 4)).toEqual(
      endian === SvStreamEndian.LITTLE ? [254, 255, 205, 171] : [255, 254, 171, 205],
    );
    stream.Seek(0n);
    const number: [number] = [0],
      large: [bigint] = [0n];
    stream.ReadInt16(number);
    expect(number[0]).toBe(-2);
    stream.ReadUInt16(number);
    expect(number[0]).toBe(0xabcd);
    stream.ReadInt32(number);
    expect(number[0]).toBe(-123);
    stream.ReadUInt32(number);
    expect(number[0]).toBe(0x81234567);
    stream.ReadInt64(large);
    expect(large[0]).toBe(-1234567890123n);
    stream.ReadUInt64(large);
    expect(large[0]).toBe(0xf123456789abcdefn);
    stream.ReadFloat(number);
    expect(number[0]).toBe(1.5);
    stream.ReadDouble(number);
    expect(number[0]).toBe(-2.25);
    stream.ReadChar(number);
    expect(number[0]).toBe(-1);
    stream.ReadSChar(number);
    expect(number[0]).toBe(-2);
    stream.ReadUChar(number);
    expect(number[0]).toBe(253);
  },
);
it("retains borrowed pointer identity, bounded writes and actual native Sequence cells", /** No private state patch or fake byte-address provider; the CPPU sequence owns every source cell. @returns Nothing. */ () => {
  const seq = own(new (Sequence.specialize<number>("sal_Int8", 1))(4)),
    pointer = seq.getArray() as SequenceElements;
  for (let i = 0; i < 4; ++i) (pointer.get(i) as [number])[0] = i + 1;
  const stream = own(new SvMemoryStream(pointer, 4, StreamMode.READWRITE));
  expect(stream.GetData()).toBe(pointer);
  stream.Seek(2n);
  expect(stream.WriteBytes(Uint8Array.of(8, 9, 10), 3)).toBe(2);
  expect(stream.GetError().valueOf()).toBe(
    new ErrCode(ErrCodeArea.Io, ErrCodeClass.Space, 17).valueOf(),
  );
  expect((pointer.get(2) as [number])[0]).toBe(8);
  stream.ResetError();
  stream.Seek(0n);
  const target = own(new (Sequence.specialize<number>("sal_Int8", 1))(4));
  expect(stream.ReadBytes(target.getArray() as SequenceElements, 4)).toBe(4);
  expect(((target.getConstArray() as SequenceElements).get(3) as [number])[0]).toBe(9);
  const transferred = stream.SwitchBuffer();
  expect(transferred).toBeNull();
  stream.SetBuffer(Uint8Array.of(7, 6, 5), 3, 9);
  expect(stream.GetSize()).toBe(3n);
  expect(content(stream)).toEqual([7, 6, 5]);
});
it("retains shrink-minus-one, buffer transfer and zero-sized memory reinitialization", /** Exact source resize and ownership behavior is observed on concrete initialized data, not fabricated allocation results. @returns Nothing. */ () => {
  const stream = own(new SvMemoryStream(0, 16));
  stream.SetBufferSize(0);
  stream.WriteBytes(ascii("abcdef"), 6);
  expect(stream.SetStreamSize(3n)).toBe(true);
  expect(stream.GetSize()).toBe(2n);
  expect(content(stream)).toEqual([97, 98]);
  const data = stream.GetData();
  expect(stream.SwitchBuffer()).toBe(data);
  expect(stream.GetSize()).toBe(0n);
  expect(stream.Tell()).toBe(0n);
  stream.WriteBytes(Uint8Array.of(9), 1);
  expect(content(stream)).toEqual([9]);
  expect(stream.SetStreamSize(0n)).toBe(true);
  expect(stream.GetSize()).toBe(0n);
  stream.SetResizeOffset(32);
  stream.WriteBytes(Uint8Array.of(4), 1);
  expect(content(stream)).toEqual([4]);
});
it.each([0, 1, 32768, 32769, 65536])(
  "retains original full/bounded32KiB stream copies for %i initialized bytes",
  /** Actual source/destination memory components, including final short/zero iterations. @param size - Source size. @returns Nothing. */ (
    size,
  ) => {
    const data = Uint8Array.from(
        { length: size },
        /** Source byte. @param _ - Unused. @param i - Index. @returns Byte. */ (_, i) => i & 255,
      ),
      source = own(new SvMemoryStream(data, size, StreamMode.READ)),
      first = own(new SvMemoryStream(0, 64)),
      second = own(new SvMemoryStream(0, 64));
    source.ReadStream(first);
    expect(content(first)).toEqual([...data]);
    source.Seek(0n);
    second.WriteStream(source);
    expect(content(second)).toEqual([...data]);
    source.Seek(0n);
    const bounded = own(new SvMemoryStream(0, 64));
    expect(bounded.WriteStream(source, BigInt(size + 1))).toBe(BigInt(size));
    expect(content(bounded)).toEqual([...data]);
  },
);
it("retains error/warning scalar API and warning-insensitive good state", /** Direct original public error API, not a backend fault injector or a fake PENDING reader. @returns Nothing. */ () => {
  const stream = own(new SvMemoryStream());
  const warning = new ErrCode(WarningFlag.Yes, ErrCodeArea.Io, ErrCodeClass.Read, 1);
  stream.SetError(warning);
  expect(stream.GetErrorCode().IsWarning()).toBe(true);
  expect(stream.GetError().valueOf()).toBe(0);
  expect(stream.good()).toBe(true);
  stream.MakeReadOnly();
  stream.WriteBytes(Uint8Array.of(1), 1);
  const first = stream.GetError().valueOf();
  expect(first).toBe(new ErrCode(ErrCodeArea.Io, ErrCodeClass.Write, 16).valueOf());
  stream.SetError(new ErrCode(12));
  expect(stream.GetError().valueOf()).toBe(first);
  stream.ResetError();
  expect(stream.good()).toBe(true);
});
it("transfers one buffer reference between memory streams and retains buffered end bookkeeping", /** SwitchBuffer plus ObjectOwnsMemory transfers logical resize rights over the same JS buffer; GC retains physical control, with no simulated native free. @returns Nothing. */ () => {
  const first = own(new SvMemoryStream(0, 16));
  first.WriteBytes(Uint8Array.of(4, 5, 6), 3);
  expect(first.GetEndOfData()).toBe(0);
  expect(first.GetSize()).toBe(3n);
  expect(first.GetEndOfData()).toBe(3);
  const allocation = first.SwitchBuffer(),
    adopted = own(new SvMemoryStream(allocation, 3, StreamMode.READWRITE));
  adopted.ObjectOwnsMemory(true);
  adopted.SetResizeOffset(16);
  adopted.Seek(3n);
  adopted.WriteBytes(Uint8Array.of(7), 1);
  expect(content(adopted)).toEqual([4, 5, 6, 7]);
  expect(first.GetSize()).toBe(0n);
  const empty = own(new SvMemoryStream(null, 0, StreamMode.READ));
  expect(empty.GetData()).toBeNull();
  expect(empty.ReadBytes(null, 0)).toBe(0);
  expect(empty.WriteBytes(null, 0)).toBe(0);
  expect(empty.good()).toBe(true);
});
