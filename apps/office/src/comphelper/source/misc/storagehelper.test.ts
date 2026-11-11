/** @fileoverview Original32000-byte stream transfer over genuine native streams, explicit RTTI crosscasts, fallback output sequences and propagated native errors. */
import { expect, it, vi } from "vitest";
import { OStorageHelper } from "../../inc/storagehelper";
import { ByteReader, ByteWriter } from "../../inc/bytereader";
import {
  MemoryInputStream,
  SequenceInputStream,
  OSequenceOutputStream,
} from "../streaming/seqstream";
import { UNOMemoryStream } from "../streaming/memorystream";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Initializes actual signed-byte fields. @param size - Length. @returns Native value. */
function data(size: number): Sequence<number> {
  const result = new Bytes(size),
    pointer = result.getArray() as SequenceElements;
  for (let i = 0; i < size; ++i)
    (pointer.get(i) as [number])[0] = (((i * 17 + Math.floor(i / 32000) * 29) & 255) << 24) >> 24;
  return result;
}
/** Copies initialized native bytes for assertions. @param value - Byte sequence. @returns Scalars. */
function values(value: Sequence<number>): number[] {
  const result: number[] = [],
    pointer = value.getConstArray() as SequenceElements;
  for (let i = 0; i < value.getLength(); ++i) result.push((pointer.get(i) as [number])[0]);
  return result;
}
/** Complete test input adapter deliberately implements only XInputStream, with genuine WeakImplHelper and inner native ownership. No ByteReader base is declared or inferred. */
class InputOnly extends WeakImplHelper.specialize(XInputStream) implements XInputStream {
  private readonly input: Reference<SequenceInputStream>;
  /** Retains a genuine input component. @param bytes - Actual source value. @returns Adapter. */
  constructor(bytes: Sequence<number>) {
    super();
    this.input = new Reference(new SequenceInputStream(bytes));
  }
  /** Native read forwarding. @param output - Actual out value. @param count - Request. @returns Count. */
  readBytes(output: Sequence<number>, count: number): number {
    return (this.input.get() as SequenceInputStream).readBytes(output, count);
  }
  /** Native sequence-only partial read. @param output - Actual out value. @param count - Request. @returns Count. */
  readSomeBytes(output: Sequence<number>, count: number): number {
    return (this.input.get() as SequenceInputStream).readSomeBytes(output, count);
  }
  /** Native skip. @param count - Request. @returns Nothing. */
  skipBytes(count: number): void {
    (this.input.get() as SequenceInputStream).skipBytes(count);
  }
  /** Native availability. @returns Count. */
  available(): number {
    return (this.input.get() as SequenceInputStream).available();
  }
  /** Native closure. @returns Nothing. */
  closeInput(): void {
    (this.input.get() as SequenceInputStream).closeInput();
  }
  /** Actual member destruction. @returns Nothing. */
  protected override destroy(): void {
    this.input.dispose();
    super.destroy();
  }
}
const sizes = [
  [0, [0]],
  [1, [1]],
  [31999, [31999]],
  [32000, [32000, 0]],
  [32001, [32000, 1]],
  [64000, [32000, 32000, 0]],
] as const;
const cases = sizes.flatMap(
  /** Required buffer/EOF boundaries. @param entry - Size and expected calls. @returns Crosscast cases. */ ([
    size,
    expected,
  ]) =>
    ["fast", "sequence-output", "sequence-input"].map(
      /** Native pair mode. @param mode - Eligibility. @returns Case. */ (mode) =>
        [size, mode, expected] as const,
    ),
);
it.each(cases)(
  "copies %i bytes through %s with exact final short/empty write",
  /** Actual source do/while protocol and stream lifetime. @param size - Input size. @param mode - Crosscast mode. @param expected - Required write lengths. @returns Nothing. */ (
    size,
    mode,
    expected,
  ) => {
    const bytes = data(size),
      inputComponent =
        mode === "sequence-input" ? new InputOnly(bytes) : new SequenceInputStream(bytes),
      input = new Reference<XInputStream>(inputComponent),
      target = new Bytes(),
      component =
        mode === "sequence-output" ? new OSequenceOutputStream(target) : new UNOMemoryStream(),
      output = new Reference<XOutputStream>(component),
      writes: number[] = [],
      kinds: string[] = [];
    let depth = 0;
    const write = component.writeBytes.bind(component),
      spy = vi.spyOn(component, "writeBytes").mockImplementation(
        /** Retains trace values before the source reuses its native buffer. @param value - Actual native value or raw pointer. @param count - Raw count. @returns Nothing. */ (
          value: Sequence<number> | SequenceElements,
          count?: number,
        ) => {
          // Count the selected native overload call, not the erased implementation's internal sequence-to-pointer forwarding.
          if (depth++ === 0) {
            writes.push(value instanceof Sequence ? value.getLength() : (count as number));
            kinds.push(value instanceof Sequence ? "sequence" : "raw");
          }
          try {
            if (component instanceof UNOMemoryStream) {
              const method = write as UNOMemoryStream["writeBytes"];
              if (value instanceof Sequence) method(value);
              else method(value, count as number);
            } else (write as OSequenceOutputStream["writeBytes"])(value as Sequence<number>);
          } finally {
            --depth;
          }
        },
      );
    try {
      OStorageHelper.CopyInputToOutput(input, output);
      expect(writes).toEqual(expected);
      expect(new Set(kinds)).toEqual(new Set([mode === "fast" ? "raw" : "sequence"]));
      expect(inputComponent.available()).toBe(0);
      if (component instanceof UNOMemoryStream) {
        expect(component.getPosition()).toBe(BigInt(size));
        component.seek(0n);
        component.readBytes(target, size);
      } else component.flush();
      expect(values(target)).toEqual(values(bytes));
      // CopyInputToOutput does not close either stream; both remain usable here.
      inputComponent.skipBytes(0);
      component.closeOutput();
    } finally {
      spy.mockRestore();
      output.dispose();
      input.dispose();
      target.dispose();
      bytes.dispose();
    }
  },
);
it("uses explicitly declared byte bases independently of similarly named UNO methods", /** Compiler RTTI checks do not infer interfaces from method names or query UNO. @returns Nothing. */ () => {
  const bytes = data(2),
    input = new SequenceInputStream(bytes),
    inputOwner = new Reference(input),
    only = new InputOnly(bytes),
    onlyOwner = new Reference(only),
    outputData = new Bytes(),
    output = new OSequenceOutputStream(outputData),
    outputOwner = new Reference(output),
    memory = new UNOMemoryStream(),
    memoryOwner = new Reference(memory);
  try {
    expect(input instanceof ByteReader).toBe(true);
    expect(input instanceof ByteWriter).toBe(false);
    expect(only instanceof ByteReader).toBe(false);
    expect(output instanceof ByteWriter).toBe(false);
    expect(memory instanceof ByteReader).toBe(true);
    expect(memory instanceof ByteWriter).toBe(true);
    for (const pointer of [null, undefined, 17]) {
      expect(ByteReader[Symbol.hasInstance](pointer)).toBe(false);
      expect(ByteWriter[Symbol.hasInstance](pointer)).toBe(false);
    }
  } finally {
    memoryOwner.dispose();
    outputOwner.dispose();
    outputData.dispose();
    onlyOwner.dispose();
    inputOwner.dispose();
    bytes.dispose();
  }
});
it("propagates real input/output disconnection errors without swallowing or closing other streams", /** Actual native exceptions are destroyed by the caller. @returns Nothing. */ () => {
  const bytes = data(3),
    inputComponent = new SequenceInputStream(bytes),
    input = new Reference<XInputStream>(inputComponent),
    memory = new UNOMemoryStream(),
    output = new Reference<XOutputStream>(memory),
    target = new Bytes(),
    sequence = new OSequenceOutputStream(target),
    closedOutput = new Reference<XOutputStream>(sequence);
  try {
    inputComponent.closeInput();
    try {
      OStorageHelper.CopyInputToOutput(input, output);
      throw new Error("Expected native disconnection");
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      try {
        expect(error.constructor).toBe(NotConnectedException);
      } finally {
        error.dispose();
      }
    }
    inputComponent.seek(0n);
    sequence.closeOutput();
    try {
      OStorageHelper.CopyInputToOutput(input, closedOutput);
      throw new Error("Expected native disconnection");
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      try {
        expect(error.constructor).toBe(NotConnectedException);
      } finally {
        error.dispose();
      }
    }
    expect(inputComponent.getPosition()).toBe(3n);
    expect(memory.getLength()).toBe(0n);
  } finally {
    closedOutput.dispose();
    target.dispose();
    output.dispose();
    input.dispose();
    bytes.dispose();
  }
});
it("preserves native short-read termination even when the byte reader still has data", /** Source helper uses nRead==32000 as its continuation condition; no retry-until-zero repair. @returns Nothing. */ () => {
  /** Complete original MemoryInputStream subclass with an intentionally short valid ByteReader result. */
  class ShortInput extends MemoryInputStream {
    /** Returns at most seven initialized bytes for each partial-read request. @param output - Native sequence or raw pointer. @param count - Request. @returns Count. */
    override readSomeBytes(output: Sequence<number> | SequenceElements, count: number): number {
      return output instanceof Sequence
        ? super.readSomeBytes(output, Math.min(count, 7))
        : super.readSomeBytes(output, Math.min(count, 7));
    }
  }
  const bytes = data(30),
    source = new ShortInput(bytes.getConstArray() as SequenceElements, bytes.getLength()),
    input = new Reference<XInputStream>(source),
    memory = new UNOMemoryStream(),
    output = new Reference<XOutputStream>(memory);
  try {
    OStorageHelper.CopyInputToOutput(input, output);
    expect(memory.getLength()).toBe(7n);
    expect(source.available()).toBe(23);
  } finally {
    output.dispose();
    input.dispose();
    bytes.dispose();
  }
});

it("retains independent native Sequence values when fallback output keeps its input", /** Standard UNO value copies remain stable across subsequent read/realloc operations. @returns Nothing. */ () => {
  /** Complete output caller retaining actual native values; full WeakImplHelper owns its UNO identity. */
  class RetainingOutput extends WeakImplHelper.specialize(XOutputStream) implements XOutputStream {
    readonly writes: Sequence<number>[] = [];
    /** Native value copy. @param value - Borrowed byte value. @returns Nothing. */
    writeBytes(value: Sequence<number>): void {
      this.writes.push(new Bytes(value));
    }
    /** Caller-selected empty flush. @returns Nothing. */
    flush(): void {}
    /** Caller-selected close, with no later writes. @returns Nothing. */
    closeOutput(): void {}
    /** Native member destruction. @returns Nothing. */
    protected override destroy(): void {
      for (const value of this.writes) value.dispose();
      super.destroy();
    }
  }
  const bytes = data(64001),
    source = new SequenceInputStream(bytes),
    input = new Reference<XInputStream>(source),
    target = new RetainingOutput(),
    output = new Reference<XOutputStream>(target);
  try {
    OStorageHelper.CopyInputToOutput(input, output);
    expect(
      target.writes.map(
        /** Observes owned lengths after the helper's local Sequence is destroyed. @param value - Retained value. @returns Length. */ (
          value,
        ) => value.getLength(),
      ),
    ).toEqual([32000, 32000, 1]);
    expect((target.writes[0] as Sequence<number>).getAddress()[0]).not.toBe(
      (target.writes[1] as Sequence<number>).getAddress()[0],
    );
    expect(values(target.writes[0] as Sequence<number>)).toEqual(values(bytes).slice(0, 32000));
    expect(values(target.writes[1] as Sequence<number>)).toEqual(values(bytes).slice(32000, 64000));
    expect(values(target.writes[2] as Sequence<number>)).toEqual(values(bytes).slice(64000));
  } finally {
    output.dispose();
    input.dispose();
    bytes.dispose();
  }
});
