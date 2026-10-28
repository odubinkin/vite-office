/** @fileoverview Original OOXML raw stream transport over real comphelper streams, CPPU owners and concrete complete UNO caller components; no synthetic query/type/data provider. */
import { expect, it } from "vitest";
import { BinaryXInputStream } from "./binaryinputstream";
import { BinaryXOutputStream } from "./binaryoutputstream";
import {
  BinaryXSeekableStream,
  SequenceSeekableStream,
  BinaryStreamBase,
} from "./binarystreambase";
import {
  SequenceInputStream,
  OSequenceOutputStream,
} from "../../../comphelper/source/streaming/seqstream";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Actual byte Sequence allocation and signed values. @param values - Byte values. @returns Owned Sequence. */
function bytes(values: number[]): Sequence<number> {
  const result = new Bytes(values.length),
    data = result.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i) (data.get(i) as [number])[0] = values[i] as number;
  return result;
}
/** Reads actual logical storage. @param data - Byte Sequence. @returns Copied scalar values. */
function values(data: Sequence<number>): number[] {
  const memory = data.getConstArray() as SequenceElements;
  return Array.from(
    { length: data.getLength() },
    /** Reads one byte cell. @param _unused - Unused value. @param i - Offset. @returns Signed byte. */ (
      _unused,
      i,
    ) => (memory.get(i) as [number])[0],
  );
}
/** Actual exception Context component observes release at native catch exit. */
class ReleaseObserver extends SequenceInputStream {
  /** Owns original Sequence and borrows the observation callback. @param data - Actual bytes. @param callback - Release observation. @returns Component. */
  constructor(
    data: Sequence<number>,
    private readonly callback: () => void,
  ) {
    super(data);
  }
  /** Native last-Reference destruction callback. @returns Nothing. */ protected override destroy(): void {
    this.callback();
    super.destroy();
  }
}
/** Complete actual input component with intentionally failing calls; inherited real query/Reference/Sequence behavior remains intact. */
class Input extends SequenceInputStream {
  fault: "size" | "tell" | "seek" | "read" | "skip" | "close" | null = null;
  foreign = false;
  onCaught: (() => void) | null = null;
  /** Emits one actual UNO exception value, or an unrelated host failure. @returns Never. */
  private fail(): never {
    if (this.foreign) throw new Error("host failure");
    const error = new IOException();
    if (this.onCaught) {
      const data = new Bytes(),
        context = new Reference(new ReleaseObserver(data, this.onCaught));
      data.dispose();
      error.Context.assign(context);
      context.dispose();
    }
    throw error;
  }
  /** Native query caller failure. @returns Size. */ override getLength(): bigint {
    if (this.fault === "size") this.fail();
    return super.getLength();
  }
  /** Native query caller failure. @returns Position. */ override getPosition(): bigint {
    if (this.fault === "tell") this.fail();
    return super.getPosition();
  }
  /** Native seek caller failure. @param n - Position. @returns Nothing. */ override seek(
    n: bigint,
  ): void {
    if (this.fault === "seek") this.fail();
    super.seek(n);
  }
  /** Native read caller failure. @param data - Output. @param n - Count. @returns Read count. */ override readBytes(
    data: Sequence<number>,
    n: number,
  ): number {
    if (this.fault === "read") this.fail();
    return super.readBytes(data, n);
  }
  /** Native skip caller failure. @param n - Count. @returns Nothing. */ override skipBytes(
    n: number,
  ): void {
    if (this.fault === "skip") this.fail();
    super.skipBytes(n);
  }
  /** Native close caller failure. @returns Nothing. */ override closeInput(): void {
    if (this.fault === "close") this.fail();
    super.closeInput();
  }
}
/** Complete actual output component with failing operations; no alternate query provider. */
class Output extends OSequenceOutputStream {
  fault: "write" | "flush" | "close" | null = null;
  foreign = false;
  /** Emits owned typed or unrelated host error. @returns Never. */ private fail(): never {
    if (this.foreign) throw new Error("host output failure");
    throw new IOException();
  }
  /** Original caller write failure. @param data - Input. @returns Nothing. */ override writeBytes(
    data: Sequence<number>,
  ): void {
    if (this.fault === "write") this.fail();
    super.writeBytes(data);
  }
  /** Original caller flush failure. @returns Nothing. */ override flush(): void {
    if (this.fault === "flush") this.fail();
    super.flush();
  }
  /** Original caller close failure. @returns Nothing. */ override closeOutput(): void {
    if (this.fault === "close") this.fail();
    super.closeOutput();
  }
}
it("preserves borrowed Sequence positions, boundary EOF and anchor arithmetic", /** Native positive, negative, at-end and closed calls. @returns Nothing. */ () => {
  const data = bytes([1, 2, 3, 4, 5, 6, 7, 8]),
    stream = new SequenceSeekableStream(data);
  try {
    expect(stream.isSeekable()).toBe(true);
    expect(stream.isEof()).toBe(false);
    expect(stream.size()).toBe(8n);
    expect(stream.tell()).toBe(0n);
    expect(stream.getRemaining()).toBe(8n);
    stream.alignToBlock(4, 0n);
    expect(stream.tell()).toBe(0n);
    stream.seek(1n);
    stream.alignToBlock(4, 0n);
    expect(stream.tell()).toBe(4n);
    stream.seek(2n);
    stream.alignToBlock(4, 7n);
    expect(stream.tell()).toBe(3n);
    stream.alignToBlock(1, 0n);
    stream.alignToBlock(4, -1n);
    expect(stream.tell()).toBe(3n);
    stream.seek(8n);
    expect(stream.getRemaining()).toBe(0n);
    expect(stream.isEof()).toBe(false);
    stream.seek(9n);
    expect(stream.tell()).toBe(8n);
    expect(stream.isEof()).toBe(true);
    stream.seek(-1n);
    expect(stream.tell()).toBe(0n);
    expect(stream.isEof()).toBe(true);
    stream.seekToStart();
    expect(stream.isEof()).toBe(false);
    stream.close();
    stream.seek(2n);
    expect(stream.tell()).toBe(-1n);
    expect(stream.size()).toBe(-1n);
    expect(stream.getRemaining()).toBe(-1n);
  } finally {
    stream.dispose();
    data.dispose();
  }
});
it("preserves actual seeking references and catches only UNO query/seek errors", /** Complete real caller retains all component semantics. @returns Nothing. */ () => {
  const data = bytes([1, 2, 3]),
    component = new Input(data),
    owner = new Reference(component),
    queried = Reference.query(owner, XSeekable.static_type) as Reference<XSeekable>,
    stream = new BinaryXSeekableStream(queried);
  try {
    queried.dispose();
    expect(stream.size()).toBe(3n);
    expect(stream.tell()).toBe(0n);
    stream.seek(2n);
    expect(stream.tell()).toBe(2n);
    component.fault = "size";
    expect(stream.size()).toBe(-1n);
    expect(stream.getRemaining()).toBe(-1n);
    component.foreign = true;
    expect(
      /** Host errors are outside the native catch. @returns Size. */ () => stream.size(),
    ).toThrow("host failure");
    component.foreign = false;
    component.fault = "tell";
    expect(stream.tell()).toBe(-1n);
    expect(stream.getRemaining()).toBe(-1n);
    component.foreign = true;
    expect(/** Host errors propagate. @returns Position. */ () => stream.tell()).toThrow(
      "host failure",
    );
    component.foreign = false;
    component.fault = "seek";
    stream.seek(1n);
    expect(stream.isEof()).toBe(true);
    component.foreign = true;
    expect(/** Host seek errors propagate. @returns Nothing. */ () => stream.seek(1n)).toThrow(
      "host failure",
    );
    component.foreign = false;
    component.fault = null;
    stream.seek(0n);
    expect(stream.isEof()).toBe(false);
    stream.close();
    stream.seek(1n);
    expect(stream.size()).toBe(-1n);
    expect(stream.tell()).toBe(-1n);
    expect(stream.isEof()).toBe(true);
  } finally {
    stream.dispose();
    owner.dispose();
    data.dispose();
  }
});
it("uses original32KiB reads, signed values, EOF recovery and unconditional input close", /** Actual component and its shallow Sequence ownership. @returns Nothing. */ () => {
  const data = bytes(
      Array.from(
        { length: 32770 },
        /** Generates signed bytes. @param _unused - Unused. @param i - Offset. @returns Byte. */ (
          _unused,
          i,
        ) => (i % 256) - 128,
      ),
    ),
    target = new Bytes(32772),
    component = new Input(data),
    owner = new Reference(component),
    stream = new BinaryXInputStream(owner, false);
  try {
    expect(stream.isSeekable()).toBe(true);
    expect(stream.isEof()).toBe(false);
    expect(stream.size()).toBe(32770n);
    expect(stream.readMemory(target.getArray() as SequenceElements, 32772, 2)).toBe(32770);
    expect(values(target).slice(0, 32770)).toEqual(values(data));
    expect(stream.isEof()).toBe(true);
    expect(stream.readMemory(target.getArray() as SequenceElements, 2)).toBe(0);
    stream.skip(1);
    stream.seekToStart();
    stream.skip(1);
    expect(stream.tell()).toBe(1n);
    expect(stream.readData(target, 0)).toBe(0);
    expect(stream.isEof()).toBe(false);
    stream.seekToStart();
    expect(stream.readData(target, 32770)).toBe(32770);
    expect(stream.isEof()).toBe(false);
    expect(stream.readData(target, 1)).toBe(0);
    expect(target.getLength()).toBe(0);
    expect(stream.isEof()).toBe(true);
    stream.close();
    expect(component.getPosition()).toBe(-1n);
    expect(stream.isEof()).toBe(true);
    expect(stream.isSeekable()).toBe(true);
    expect(stream.getRemaining()).toBe(-1n);
  } finally {
    stream.dispose();
    owner.dispose();
    target.dispose();
    data.dispose();
  }
});
it("swallows original input errors and preserves unrelated host failures", /** Failure paths use complete concrete real stream subclass. @returns Nothing. */ () => {
  const data = bytes([1]),
    result = new Bytes(),
    component = new Input(data),
    owner = new Reference(component),
    stream = new BinaryXInputStream(owner, true);
  try {
    component.fault = "read";
    expect(stream.readData(result, 1)).toBe(0);
    expect(stream.isEof()).toBe(true);
    stream.seek(0n);
    component.foreign = true;
    expect(/** Host read is not UNO. @returns Count. */ () => stream.readData(result, 1)).toThrow(
      "host failure",
    );
    component.foreign = false;
    component.fault = "skip";
    stream.skip(-1);
    expect(stream.isEof()).toBe(true);
    stream.seek(0n);
    component.foreign = true;
    expect(/** Host skip is not UNO. @returns Nothing. */ () => stream.skip(1)).toThrow(
      "host failure",
    );
    component.foreign = false;
    component.fault = "close";
    component.foreign = true;
    expect(/** Host close is not UNO. @returns Nothing. */ () => stream.close()).toThrow(
      "host failure",
    );
    component.foreign = false;
    stream.close();
    expect(stream.size()).toBe(-1n);
  } finally {
    component.fault = null;
    stream.dispose();
    owner.dispose();
    result.dispose();
    data.dispose();
  }
});
it("preserves null input/output behavior and original stale-buffer copy on already-EOF input", /** Copy writes its initial allocated buffer even though no read occurred. @returns Nothing. */ () => {
  const inRef = new Reference<Input>(),
    outRef = new Reference<Output>(),
    input = new BinaryXInputStream(inRef, true),
    absent = new BinaryXOutputStream(outRef, true),
    data = new Bytes(),
    component = new Output(data),
    owner = new Reference(component),
    output = new BinaryXOutputStream(owner, true);
  try {
    expect(input.isSeekable()).toBe(false);
    expect(input.isEof()).toBe(true);
    expect(input.readData(data, 1)).toBe(0);
    expect(input.readMemory(data.getArray() as SequenceElements, 1)).toBe(0);
    input.skip(1);
    input.alignToBlock(2, 0n);
    input.seek(1n);
    absent.writeData(data);
    absent.writeMemory(data.getConstArray() as SequenceElements, 1);
    expect(absent.isEof()).toBe(true);
    input.copyToStream(output);
    output.close();
    expect(data.getLength()).toBe(32768);
    expect(
      values(data).every(
        /** Initial UNO allocation zero-initializes every byte. @param v - Byte. @returns Zero. */ (
          v,
        ) => v === 0,
      ),
    ).toBe(true);
  } finally {
    output.dispose();
    owner.dispose();
    absent.dispose();
    input.dispose();
    outRef.dispose();
    inRef.dispose();
    data.dispose();
  }
});
it("copies real input to output, atom-aligned chunks and flushes while keeping non-autoclose output connected", /** No archive, model or query shim participates. @returns Nothing. */ () => {
  const data = bytes(
      Array.from(
        { length: 32771 },
        /** Generates bytes. @param _unused - Unused. @param i - Offset. @returns Byte. */ (
          _unused,
          i,
        ) => i % 100,
      ),
    ),
    result = new Bytes(),
    inComponent = new Input(data),
    outComponent = new Output(result),
    inOwner = new Reference(inComponent),
    outOwner = new Reference(outComponent),
    input = new BinaryXInputStream(inOwner, true),
    output = new BinaryXOutputStream(outOwner, false);
  try {
    input.copyToStream(output);
    expect(input.isEof()).toBe(true);
    expect(output.isSeekable()).toBe(false);
    expect(output.isEof()).toBe(false);
    output.writeMemory(data.getConstArray() as SequenceElements, 0);
    output.writeMemory(data.getConstArray() as SequenceElements, 32771, 3);
    output.close();
    expect(values(result)).toEqual([...values(data), ...values(data)]);
    outComponent.writeBytes(data);
    outComponent.flush();
    expect(result.getLength()).toBe(3 * data.getLength());
    expect(output.isEof()).toBe(true);
  } finally {
    output.dispose();
    input.dispose();
    outOwner.dispose();
    inOwner.dispose();
    result.dispose();
    data.dispose();
  }
});
it("retains source output-error asymmetry and flush-before-close exception ordering", /** Original write errors do not set EOF; a failed flush bypasses closeOutput. @returns Nothing. */ () => {
  const data = bytes([7]),
    result = new Bytes(),
    component = new Output(result),
    owner = new Reference(component),
    output = new BinaryXOutputStream(owner, true);
  try {
    component.fault = "write";
    output.writeData(data);
    expect(output.isEof()).toBe(false);
    expect(result.getLength()).toBe(0);
    component.foreign = true;
    expect(
      /** Unrelated host failures propagate. @returns Nothing. */ () => output.writeData(data),
    ).toThrow("host output failure");
    component.foreign = false;
    component.fault = "flush";
    component.foreign = true;
    expect(
      /** Foreign flush retains ownership because original catch is UNO-only. @returns Nothing. */ () =>
        output.close(),
    ).toThrow("host output failure");
    component.foreign = false;
    output.close();
    component.fault = null;
    component.writeBytes(data);
    component.flush();
    expect(values(result)).toEqual([7]);
    output.writeData(data);
    expect(output.isEof()).toBe(true);
  } finally {
    component.fault = null;
    output.dispose();
    owner.dispose();
    result.dispose();
    data.dispose();
  }
  const result2 = new Bytes(),
    component2 = new Output(result2),
    owner2 = new Reference(component2),
    output2 = new BinaryXOutputStream(owner2, true);
  try {
    component2.fault = "close";
    output2.close();
    expect(output2.isEof()).toBe(true);
  } finally {
    component2.fault = null;
    output2.dispose();
    owner2.dispose();
    result2.dispose();
  }
});
/** Actual nonseekable position-reporting subtype proves getRemaining does not gate on isSeekable. */
class ReportedStream extends BinaryStreamBase {
  /** Original virtual-base parameter. @returns Stream. */ constructor() {
    super(false);
  }
  /** Concrete position beyond reported size. @returns Position. */ tell(): bigint {
    return 5n;
  }
  /** Concrete reported size. @returns Size. */ size(): bigint {
    return 3n;
  }
  /** Unseekable no-op. @returns Nothing. */ seek(): void {}
  /** Concrete closure. @returns Nothing. */ close(): void {}
}
it("uses nonseekable position reports for remaining bytes", /** Native helper operates independently of seek capability. @returns Nothing. */ () => {
  const stream = new ReportedStream();
  expect(stream.getRemaining()).toBe(0n);
  stream.dispose();
});

it("sets EOF before the caught UNO exception Context is destroyed", /** Native catch body state precedes thrown-value cleanup and can be observed reentrantly. @returns Nothing. */ () => {
  const data = bytes([1]),
    result = new Bytes(),
    component = new Input(data),
    owner = new Reference(component),
    stream = new BinaryXInputStream(owner, true),
    observations: boolean[] = [];
  component.onCaught = /** Context release observes the actual wrapper. @returns Nothing. */ () => {
    observations.push(stream.isEof());
  };
  try {
    component.fault = "read";
    stream.readData(result, 1);
    component.fault = null;
    stream.seek(0n);
    component.fault = "skip";
    stream.skip(1);
    component.fault = null;
    stream.seek(0n);
    component.fault = "seek";
    stream.seek(1n);
    expect(observations).toEqual([true, true, true]);
  } finally {
    component.fault = null;
    component.onCaught = null;
    stream.dispose();
    owner.dispose();
    result.dispose();
    data.dispose();
  }
});
