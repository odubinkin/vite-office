/** @fileoverview Original ByteChucker/ByteGrabber over genuine native byte owners, integer widths, optional seek, short reads and caller lifetime; no replacement package/provider. */
import { expect, it, vi } from "vitest";
import { ByteChucker } from "../../inc/ByteChucker";
import { ByteGrabber } from "../../inc/ByteGrabber";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import {
  SequenceInputStream,
  MemoryInputStream,
  OSequenceOutputStream,
} from "../../../comphelper/source/streaming/seqstream";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { inputFromBytes, readOwnedInput } from "../../../test/oox-input";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Observes initialized native signed bytes as transport octets. @param value - Actual value. @returns Bytes. */
function octets(value: Sequence<number>): number[] {
  const result: number[] = [],
    cells = value.getConstArray() as SequenceElements;
  for (let i = 0; i < value.getLength(); ++i) result.push((cells.get(i) as [number])[0] & 255);
  return result;
}
/** Complete caller input deliberately excludes ByteReader/XSeekable; inner source remains a genuine input component. */
class InputOnly extends WeakImplHelper.specialize(XInputStream) implements XInputStream {
  private readonly input: Reference<XInputStream>;
  /** Retains the real caller stream. @param input - Actual source. @returns Caller adapter. */
  constructor(input: Reference<XInputStream>) {
    super();
    this.input = new Reference(input);
  }
  /** Required native read. @param data - Output. @param count - Request. @returns Count. */
  readBytes(data: Sequence<number>, count: number): number {
    return (this.input.get() as XInputStream).readBytes(data, count);
  }
  /** Required native partial read. @param data - Output. @param count - Request. @returns Count. */
  readSomeBytes(data: Sequence<number>, count: number): number {
    return (this.input.get() as XInputStream).readSomeBytes(data, count);
  }
  /** Required native skip. @param count - Request. @returns Nothing. */
  skipBytes(count: number): void {
    (this.input.get() as XInputStream).skipBytes(count);
  }
  /** Required native availability. @returns Count. */
  available(): number {
    return (this.input.get() as XInputStream).available();
  }
  /** Required native closure. @returns Nothing. */
  closeInput(): void {
    (this.input.get() as XInputStream).closeInput();
  }
  /** Destroys actual retained member. @returns Nothing. */
  protected override destroy(): void {
    this.input.dispose();
    super.destroy();
  }
}
/** Complete caller output retaining actual Sequence copies, allowing observation of cached-pointer writes. */
class RetainingOutput extends WeakImplHelper.specialize(XOutputStream) implements XOutputStream {
  readonly values: Sequence<number>[] = [];
  /** Copies native values without flattening. @param data - Native argument. @returns Nothing. */
  writeBytes(data: Sequence<number>): void {
    this.values.push(new Bytes(data));
  }
  /** Caller has no external buffering. @returns Nothing. */
  flush(): void {}
  /** Caller has no external resource. @returns Nothing. */
  closeOutput(): void {}
  /** Releases each actual retained value. @returns Nothing. */
  protected override destroy(): void {
    for (const value of this.values) value.dispose();
    super.destroy();
  }
}
/** Returns an actual thrown UNO owner so assertions can destroy it once. @param action - Native operation. @returns Owned exception. */
function thrown(action: () => unknown): Exception {
  try {
    action();
  } catch (error) {
    if (error instanceof Exception) return error;
    throw error;
  }
  throw new Error("expected native exception");
}
const writes = [
  ["WriteInt16", -32768, [0, 128]],
  ["WriteInt16", -1, [255, 255]],
  ["WriteInt16", 0, [0, 0]],
  ["WriteInt16", 32767, [255, 127]],
  ["WriteInt32", -2147483648, [0, 0, 0, 128]],
  ["WriteInt32", -1, [255, 255, 255, 255]],
  ["WriteInt32", 0, [0, 0, 0, 0]],
  ["WriteInt32", 2147483647, [255, 255, 255, 127]],
  ["WriteUInt32", 0, [0, 0, 0, 0]],
  ["WriteUInt32", 0x89abcdef, [239, 205, 171, 137]],
  ["WriteUInt32", 0xffffffff, [255, 255, 255, 255]],
  ["WriteUInt64", 0n, [0, 0, 0, 0, 0, 0, 0, 0]],
  ["WriteUInt64", 0x0123456789abcdefn, [239, 205, 171, 137, 103, 69, 35, 1]],
  ["WriteUInt64", 0xffffffffffffffffn, [255, 255, 255, 255, 255, 255, 255, 255]],
] as const;
it.each(writes)(
  "writes native %s value %s",
  /** Exact literal little-endian bytes through native memory stream. @param method - Native entry point. @param value - Declared integer. @param expected - Literal octets. @returns Nothing. */ (
    method,
    value,
    expected,
  ) => {
    const component = new UNOMemoryStream(),
      output = new Reference<XOutputStream>(component),
      writer = new ByteChucker(output);
    try {
      if (method === "WriteUInt64") writer.WriteUInt64(value as bigint);
      else writer[method](value as number);
      expect(writer.GetPosition()).toBe(BigInt(expected.length));
      component.seek(0n);
      expect(readOwnedInput(component.getInputStream())).toEqual(Uint8Array.from(expected));
    } finally {
      writer.dispose();
      output.dispose();
    }
  },
);
it("forwards arbitrary values, retains output and leaves close/flush to its caller", /** Optional seek is not needed for WriteBytes; destroying helper does not close the surviving output reference. @returns Nothing. */ () => {
  const data = new Bytes(3),
    cells = data.getArray() as SequenceElements;
  (cells.get(0) as [number])[0] = -1;
  (cells.get(1) as [number])[0] = 0;
  (cells.get(2) as [number])[0] = 42;
  const target = new Bytes(),
    component = new OSequenceOutputStream(target),
    output = new Reference<XOutputStream>(component),
    writer = new ByteChucker(output);
  const close = vi.spyOn(component, "closeOutput"),
    flush = vi.spyOn(component, "flush");
  writer.WriteBytes(data);
  writer.dispose();
  expect(close).not.toHaveBeenCalled();
  expect(flush).not.toHaveBeenCalled();
  component.writeBytes(data);
  component.flush();
  expect(octets(target)).toEqual([255, 0, 42, 255, 0, 42]);
  output.dispose();
  data.dispose();
  target.dispose();
});
it("preserves mutation of retained values through cached raw sequence pointers", /** Do not repair the source with new values or getArray COW checks between integer writes. @returns Nothing. */ () => {
  const component = new RetainingOutput(),
    output = new Reference<XOutputStream>(component),
    writer = new ByteChucker(output);
  try {
    writer.WriteInt16(0x1234);
    writer.WriteInt32(0x10203040);
    writer.WriteUInt64(0x0123456789abcdefn);
    expect(component.values.map(octets)).toEqual([
      [52, 18],
      [64, 48, 32, 16],
      [239, 205, 171, 137, 103, 69, 35, 1],
    ]);
    writer.WriteInt16(0x5678);
    writer.WriteUInt32(0x89abcdef);
    writer.WriteUInt64(0xfedcba9876543210n);
    expect(component.values.map(octets)).toEqual([
      [120, 86],
      [239, 205, 171, 137],
      [16, 50, 84, 118, 152, 186, 220, 254],
      [120, 86],
      [239, 205, 171, 137],
      [16, 50, 84, 118, 152, 186, 220, 254],
    ]);
  } finally {
    writer.dispose();
    output.dispose();
  }
});
it("propagates actual closed output errors", /** Source does not catch native write failure. @returns Nothing. */ () => {
  const target = new Bytes(),
    component = new OSequenceOutputStream(target),
    output = new Reference<XOutputStream>(component),
    writer = new ByteChucker(output);
  component.closeOutput();
  const error = thrown(
    /** Writes through a genuinely disconnected native output. @returns Nothing. */ () =>
      writer.WriteInt16(1),
  );
  try {
    expect(error).toBeInstanceOf(NotConnectedException);
  } finally {
    error.dispose();
    writer.dispose();
    output.dispose();
    target.dispose();
  }
});
for (const mode of ["raw", "uno"] as const) {
  it.each([
    ["ReadUInt16", [239, 205], 0xcdef],
    ["ReadUInt32", [239, 205, 171, 137], 0x89abcdef],
    ["ReadUInt64", [239, 205, 171, 137, 103, 69, 35, 1], 0x0123456789abcdefn],
    ["ReadUInt64", [255, 255, 255, 255, 255, 255, 255, 255], 0xffffffffffffffffn],
    ["ReadInt16", [0, 128], -32768],
    ["ReadInt16", [255, 255], -1],
    ["ReadInt32", [0, 0, 0, 128], -2147483648],
    ["ReadInt32", [255, 255, 255, 255], -1],
  ] as const)(
    `reads ${mode} %s`,
    /** Both source paths preserve signed bytes and exact native integer widths. @param method - Native method. @param bytes - Literal source. @param expected - Native result. @returns Nothing. */ (
      method,
      bytes,
      expected,
    ) => {
      const source = inputFromBytes(Uint8Array.from(bytes)),
        input =
          mode === "uno"
            ? new Reference<XInputStream>(new InputOnly(source))
            : new Reference(source),
        reader = new ByteGrabber(input);
      try {
        expect(reader[method]()).toBe(expected);
        expect((source.get() as SequenceInputStream).getPosition()).toBe(BigInt(bytes.length));
      } finally {
        reader.dispose();
        input.dispose();
        source.dispose();
      }
    },
  );
  it.each([
    [2, 0],
    [2, 1],
    [4, 0],
    [4, 1],
    [4, 3],
    [8, 0],
    [8, 1],
    [8, 7],
  ] as const)(
    `returns zero after ${mode} short %i-byte number with %i bytes`,
    /** Consumes a partial result and never throws/rewinds/retries to fill an integer. @param width - Native integer width. @param available - Actual available bytes. @returns Nothing. */ (
      width,
      available,
    ) => {
      const source = inputFromBytes(new Uint8Array(available).fill(255)),
        input =
          mode === "uno"
            ? new Reference<XInputStream>(new InputOnly(source))
            : new Reference(source),
        reader = new ByteGrabber(input);
      try {
        const value =
          width === 2
            ? reader.ReadUInt16()
            : width === 4
              ? reader.ReadUInt32()
              : reader.ReadUInt64();
        expect(value).toBe(width === 8 ? 0n : 0);
        expect((source.get() as SequenceInputStream).getPosition()).toBe(BigInt(available));
      } finally {
        reader.dispose();
        input.dispose();
        source.dispose();
      }
    },
  );
  it(`copies only the initialized prefix through ${mode} partial byte reads`, /** Raw readBytes uses readSomeBytes in both branches and leaves the tail untouched. @returns Nothing. */ () => {
    const source = inputFromBytes(Uint8Array.of(255, 2, 128)),
      input =
        mode === "uno" ? new Reference<XInputStream>(new InputOnly(source)) : new Reference(source),
      reader = new ByteGrabber(input),
      destination = new Map<number, [number]>([
        [0, [77]],
        [1, [77]],
        [2, [77]],
        [3, [77]],
        [4, [77]],
      ]);
    try {
      expect(reader.readBytes(destination, 5)).toBe(3);
      expect(
        [...destination.values()].map(
          /** Copies raw scalar cells for observation. @param cell - Initialized lvalue. @returns Scalar. */ (
            cell,
          ) => cell[0],
        ),
      ).toEqual([-1, 2, -128, 77, 77]);
      expect(reader.readBytes(destination, 0)).toBe(0);
    } finally {
      reader.dispose();
      input.dispose();
      source.dispose();
    }
  });
}
it("rebinds native seek and ByteReader identities without clearing source scratch values", /** Genuine seekable source then complete input-only caller then seekable again. @returns Nothing. */ () => {
  const first = inputFromBytes(Uint8Array.of(1, 2, 3, 4)),
    second = inputFromBytes(Uint8Array.of(5, 6, 7, 8)),
    adapter = new InputOnly(second),
    remote = new Reference<XInputStream>(adapter),
    reader = new ByteGrabber(first);
  try {
    expect(reader.getLength()).toBe(4n);
    reader.seek(2n);
    expect(reader.getPosition()).toBe(2n);
    expect(reader.ReadUInt16()).toBe(0x0403);
    reader.setInputStream(remote);
    const reads = vi.spyOn(adapter, "readBytes"),
      some = vi.spyOn(adapter, "readSomeBytes");
    expect(reader.ReadUInt16()).toBe(0x0605);
    expect(reads).toHaveBeenCalledOnce();
    expect(some).not.toHaveBeenCalled();
    const destination = new Map<number, [number]>([
      [0, [0]],
      [1, [0]],
    ]);
    expect(reader.readBytes(destination, 2)).toBe(2);
    expect(some).toHaveBeenCalledOnce();
    for (const action of [
      /** Missing native seek. @returns Nothing. */ () => reader.seek(0n),
      /** Missing native position. @returns Cursor. */ () => reader.getPosition(),
      /** Missing native length. @returns Size. */ () => reader.getLength(),
    ]) {
      const error = thrown(action);
      try {
        expect(error).toBeInstanceOf(IOException);
        expect(error.Message.getLength()).toBe(0);
        expect(error.Context.is()).toBe(false);
      } finally {
        error.dispose();
      }
    }
    reader.setInputStream(first);
    reader.seek(0n);
    expect(reader.ReadUInt32()).toBe(0x04030201);
  } finally {
    reader.dispose();
    remote.dispose();
    second.dispose();
    first.dispose();
  }
});
it("retains input ownership and propagates actual closure failures", /** Destroying helper does not close another acquired caller source. @returns Nothing. */ () => {
  const input = inputFromBytes(Uint8Array.of(1, 2)),
    component = input.get() as SequenceInputStream,
    close = vi.spyOn(component, "closeInput"),
    reader = new ByteGrabber(input);
  reader.dispose();
  expect(close).not.toHaveBeenCalled();
  expect(component.available()).toBe(2);
  const again = new ByteGrabber(input);
  component.closeInput();
  const error = thrown(
    /** Reads through a genuinely closed actual input. @returns Scalar. */ () => again.ReadUInt16(),
  );
  try {
    expect(error).toBeInstanceOf(NotConnectedException);
  } finally {
    error.dispose();
    again.dispose();
    input.dispose();
  }
});
/** Genuine nonfinal native memory-stream subclass with a legal nonfinal partial result. */
class ShortInput extends MemoryInputStream {
  /** Caps the actual raw or sequence read without changing its native source lifetime. @param data - Actual destination. @param count - Original request. @returns Real count. */
  override readSomeBytes(data: Sequence<number> | SequenceElements, count: number): number {
    return super.readSomeBytes(data, Math.min(count, 7));
  }
}
it("keeps zero-on-short semantics when a ByteReader still has more data", /** Native readSomeBytes does not promise to fill every nonfinal request. @returns Nothing. */ () => {
  const bytes = new Bytes(30),
    component = new ShortInput(bytes.getConstArray() as SequenceElements, 30),
    input = new Reference<XInputStream>(component),
    reader = new ByteGrabber(input);
  try {
    expect(reader.ReadUInt64()).toBe(0n);
    expect(reader.getPosition()).toBe(7n);
    expect(component.available()).toBe(23);
  } finally {
    reader.dispose();
    input.dispose();
    bytes.dispose();
  }
});
it("composes original integer output and input over the real shared memory cursor", /** Literal numeric witnesses are already checked separately; this verifies real component/reference composition. @returns Nothing. */ () => {
  const component = new UNOMemoryStream(),
    output = new Reference<XOutputStream>(component),
    writer = new ByteChucker(output);
  writer.WriteInt16(-12345);
  writer.WriteUInt32(0xffffffff);
  writer.WriteUInt64(0xfedcba9876543210n);
  writer.WriteInt32(-2147483648);
  expect(writer.GetPosition()).toBe(18n);
  writer.dispose();
  const input = component.getInputStream(),
    reader = new ByteGrabber(input);
  try {
    expect(reader.getLength()).toBe(18n);
    reader.seek(0n);
    expect(reader.ReadInt16()).toBe(-12345);
    expect(reader.ReadUInt32()).toBe(0xffffffff);
    expect(reader.ReadUInt64()).toBe(0xfedcba9876543210n);
    expect(reader.ReadInt32()).toBe(-2147483648);
    expect(reader.getPosition()).toBe(18n);
  } finally {
    reader.dispose();
    input.dispose();
    output.dispose();
  }
});
