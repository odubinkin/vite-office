/** @fileoverview Real native memory/sequence stream interfaces, COW ownership, output growth, typed exceptions and lifecycle through shared CPPU/Sequence owners. No alternate byte/type/query/model provider is supplied. */
import { expect, it } from "vitest";
import { MemoryInputStream, SequenceInputStream, OSequenceOutputStream } from "./seqstream";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OWeakObject } from "../../../cppuhelper/inc/weak";
import {
  IOException,
  cppu_detail_getUnoType as ioType,
  getCppuType as ioDeprecated,
} from "../../../cppu/inc/com/sun/star/io/IOException";
import {
  NotConnectedException,
  cppu_detail_getUnoType as disconnectedType,
  getCppuType as disconnectedDeprecated,
} from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import {
  BufferSizeExceededException,
  cppu_detail_getUnoType as bufferType,
  getCppuType as bufferDeprecated,
} from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import {
  XInputStream,
  getCppuType as inputType,
} from "../../../udkapi/com/sun/star/io/XInputStream";
import {
  XOutputStream,
  getCppuType as outputType,
} from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable, getCppuType as seekType } from "../../../udkapi/com/sun/star/io/XSeekable";
import { OUString, OUStringLiteral } from "../../../sal/inc/rtl/ustring";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  typelib_typedescription_release,
  type typelib_TypeDescription as D,
  type typelib_CompoundTypeDescription as P,
} from "../../../cppu/inc/typelib/typedescription";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Initializes actual allocated sal_Int8 Sequence cells. @param values - Declared signed byte values. @returns Owned byte Sequence. */
function bytes(values: readonly number[]): Sequence<number> {
  const result = new Bytes(values.length),
    cells = result.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i) (cells.get(i) as [number])[0] = values[i] as number;
  return result;
}
/** Reads original byte lvalues without mutating or detaching. @param value - Actual byte Sequence. @returns Observed signed bytes. */
function values(value: Sequence<number>): number[] {
  const result: number[] = [],
    cells = value.getConstArray() as SequenceElements;
  for (let i = 0; i < value.getLength(); ++i) result.push((cells.get(i) as [number])[0]);
  return result;
}
/** Inspects and destroys one actual caught UNO value exactly once. @param action - Source call. @param E - Original generated exception class. @param context - Expected actual context or null. @returns Nothing. */
function failure(
  action: () => void,
  E: typeof IOException | typeof IllegalArgumentException,
  context: object | null,
): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    caught = true;
    expect(error).toBeInstanceOf(E);
    const value = error as Exception;
    try {
      expect(value.Context.get()).toBe(context);
      if (value instanceof IllegalArgumentException) {
        expect(text(value.Message)).toBe("bad location");
        expect(value.ArgumentPosition).toBe(1);
      } else expect(text(value.Message)).toBe("");
    } finally {
      value.dispose();
    }
  }
  expect(caught).toBe(true);
}
it("queries actual input/seek interfaces and preserves sequence/pointer reads, skip and EOF", /** Reads and writes genuine logical address cells owned by actual byte Sequences. @returns Nothing. */ () => {
  const source = bytes([0, 127, -128, -1, 42]),
    result = new Bytes(),
    memory = bytes([9, 9, 9]),
    stream = new MemoryInputStream(source.getConstArray() as SequenceElements, source.getLength()),
    owner = new Reference(stream),
    input = Reference.query(owner, XInputStream.static_type),
    seek = Reference.query(owner, XSeekable.static_type);
  try {
    expect(input.get()).toBe(stream);
    expect(seek.get()).toBe(stream);
    expect(inputType()).toBe(XInputStream.static_type());
    expect(inputType(null)).toBe(XInputStream.static_type(null));
    expect(seekType()).toBe(XSeekable.static_type());
    expect(seekType(null)).toBe(XSeekable.static_type(null));
    expect(stream.available()).toBe(5);
    expect(stream.getLength()).toBe(5n);
    expect(stream.getPosition()).toBe(0n);
    expect(stream.readBytes(result, 2)).toBe(2);
    expect(values(result)).toEqual([0, 127]);
    expect(stream.getPosition()).toBe(2n);
    expect(stream.readSomeBytes(memory.getArray() as SequenceElements, 1)).toBe(1);
    expect(values(memory)).toEqual([-128, 9, 9]);
    expect(stream.readSomeBytes(result, 20)).toBe(2);
    expect(values(result)).toEqual([-1, 42]);
    expect(stream.available()).toBe(0);
    expect(stream.readBytes(result, 4)).toBe(0);
    expect(result.getLength()).toBe(0);
    stream.seek(0n);
    stream.skipBytes(1);
    expect(stream.getPosition()).toBe(1n);
    stream.skipBytes(20);
    expect(stream.getPosition()).toBe(5n);
    expect(stream.readSomeBytes(memory.getArray() as SequenceElements, 2)).toBe(0);
  } finally {
    seek.dispose();
    input.dispose();
    owner.dispose();
    memory.dispose();
    result.dispose();
    source.dispose();
  }
});
it("preserves negative-before-closed validation, typed context and source seek reopening", /** Uses valid allocated memory, without fabricating impossible lengths to force branches. @returns Nothing. */ () => {
  const source = bytes([1, 2, 3]),
    out = new Bytes(),
    raw = bytes([0, 0]),
    stream = new MemoryInputStream(source.getConstArray() as SequenceElements, 3),
    owner = new Reference(stream);
  try {
    failure(
      /** Negative read. @returns Count. */ () => stream.readBytes(out, -1),
      BufferSizeExceededException,
      stream,
    );
    failure(
      /** Negative pointer read. @returns Count. */ () =>
        stream.readSomeBytes(raw.getArray() as SequenceElements, -1),
      BufferSizeExceededException,
      stream,
    );
    failure(
      /** Negative skip. @returns Nothing. */ () => stream.skipBytes(-1),
      BufferSizeExceededException,
      stream,
    );
    for (const location of [-1n, 4n, 0x80000000n])
      failure(
        /** Original bad absolute seek. @returns Nothing. */ () => stream.seek(location),
        IllegalArgumentException,
        stream,
      );
    stream.closeInput();
    expect(stream.getPosition()).toBe(-1n);
    expect(stream.getLength()).toBe(3n);
    failure(
      /** Closed availability. @returns Count. */ () => stream.available(),
      NotConnectedException,
      stream,
    );
    failure(
      /** Repeated close. @returns Nothing. */ () => stream.closeInput(),
      NotConnectedException,
      stream,
    );
    failure(
      /** Negative remains the first error after close. @returns Count. */ () =>
        stream.readSomeBytes(out, -1),
      BufferSizeExceededException,
      stream,
    );
    failure(
      /** Otherwise closure is observed. @returns Count. */ () => stream.readBytes(out, 0),
      NotConnectedException,
      stream,
    );
    stream.seek(1n);
    expect(stream.available()).toBe(2);
    expect(stream.readBytes(out, 10)).toBe(2);
    expect(values(out)).toEqual([2, 3]);
    stream.closeInput();
  } finally {
    owner.dispose();
    raw.dispose();
    out.dispose();
    source.dispose();
  }
});
it("retains the original Sequence allocation while caller mutation detaches its COW handle", /** Actual constructor copy ownership protects the original borrowed pointer. @returns Nothing. */ () => {
  const source = bytes([4, 5, 6]),
    allocation = source.get(),
    stream = new SequenceInputStream(source),
    owner = new Reference(stream),
    out = new Bytes();
  try {
    expect(allocation?.nRefCount).toBe(2);
    ((source.getArray() as SequenceElements).get(0) as [number])[0] = 99;
    expect(source.get()).not.toBe(allocation);
    expect(allocation?.nRefCount).toBe(1);
    expect(values(source)).toEqual([99, 5, 6]);
    expect(stream.readBytes(out, 3)).toBe(3);
    expect(values(out)).toEqual([4, 5, 6]);
    stream.seek(0n);
    expect(stream.readBytes(source, 2)).toBe(2);
    expect(values(source)).toEqual([4, 5]);
    expect(stream.getLength()).toBe(3n);
  } finally {
    out.dispose();
    owner.dispose();
    source.dispose();
  }
});
it("preserves output minimum growth, append, flush, input round trip and default closure errors", /** Actual sequence capacity and logical output size are independently observable. @returns Nothing. */ () => {
  const destination = new Bytes(),
    chunk = bytes([65, -128, 0, 66]),
    output = new OSequenceOutputStream(destination),
    owner = new Reference(output),
    queried = Reference.query(owner, XOutputStream.static_type);
  try {
    expect(queried.get()).toBe(output);
    expect(outputType()).toBe(XOutputStream.static_type());
    expect(outputType(null)).toBe(XOutputStream.static_type(null));
    output.writeBytes(chunk);
    expect(destination.getLength()).toBe(128);
    output.writeBytes(chunk);
    output.flush();
    expect(destination.getLength()).toBe(8);
    expect(values(destination)).toEqual([65, -128, 0, 66, 65, -128, 0, 66]);
    const input = new SequenceInputStream(destination),
      inputOwner = new Reference(input),
      result = new Bytes();
    try {
      expect(input.readBytes(result, 9)).toBe(8);
      expect(values(result)).toEqual(values(destination));
      input.closeInput();
    } finally {
      result.dispose();
      inputOwner.dispose();
    }
    output.writeBytes(chunk);
    expect(destination.getLength()).toBe(136);
    output.closeOutput();
    expect(destination.getLength()).toBe(12);
    failure(
      /** Closed write. @returns Nothing. */ () => output.writeBytes(chunk),
      NotConnectedException,
      null,
    );
    failure(
      /** Closed flush. @returns Nothing. */ () => output.flush(),
      NotConnectedException,
      null,
    );
    failure(
      /** Repeated output closure. @returns Nothing. */ () => output.closeOutput(),
      NotConnectedException,
      null,
    );
  } finally {
    queried.dispose();
    owner.dispose();
    chunk.dispose();
    destination.dispose();
  }
});
it("preserves resize-factor fallback, double-request growth and destructor finalization", /** Borrowed sequence remains alive until the actual component destructor completes. @returns Nothing. */ () => {
  const destination = new Bytes(),
    chunk = bytes([1, 2, 3, 4, 5]),
    output = new OSequenceOutputStream(destination, 1, 0),
    owner = new Reference(output);
  try {
    output.writeBytes(chunk);
    expect(destination.getLength()).toBe(12);
    owner.dispose();
    expect(values(destination)).toEqual([1, 2, 3, 4, 5]);
  } finally {
    owner.dispose();
    chunk.dispose();
    destination.dispose();
  }
  const preallocated = bytes([8, 8, 8, 8, 8, 8, 8, 8]),
    small = bytes([2, 3]),
    other = new OSequenceOutputStream(preallocated, 2, 0),
    otherOwner = new Reference(other);
  try {
    other.writeBytes(small);
    expect(preallocated.getLength()).toBe(8);
    other.writeBytes(small);
    other.writeBytes(small);
    other.writeBytes(small);
    other.writeBytes(small);
    expect(preallocated.getLength()).toBe(16);
    other.flush();
    expect(values(preallocated)).toEqual([2, 3, 2, 3, 2, 3, 2, 3, 2, 3]);
  } finally {
    otherOwner.dispose();
    small.dispose();
    preallocated.dispose();
  }
});
it.each([
  [IOException, ioType, ioDeprecated, "IOException"],
  [NotConnectedException, disconnectedType, disconnectedDeprecated, "NotConnectedException"],
  [BufferSizeExceededException, bufferType, bufferDeprecated, "BufferSizeExceededException"],
] as const)(
  "retains generated exception inheritance, context ownership and cached type for %s",
  /** Actual generated constructors/copy/move values use shared type and Reference owners. @param E - Original value class. @param getter - Original factory. @param deprecated - Original global getter. @param name - Original IDL name. @returns Nothing. */ (
    E,
    getter,
    deprecated,
    name,
  ) => {
    const root = new OWeakObject(),
      owner = new Reference(root),
      message = new OUString(new OUStringLiteral(Uint16Array.of(105, 111, 0))),
      empty = new E(),
      value = new E(message, owner),
      copy = new E(value),
      moved = E.move(copy),
      type = getter(),
      typeName = type.getTypeName(),
      description: [D | null] = [null];
    try {
      expect(value).toBeInstanceOf(IOException);
      expect(value).toBeInstanceOf(Exception);
      expect(empty.Context.is()).toBe(false);
      expect(text(empty.Message)).toBe("");
      expect(moved.Context.get()).toBe(root);
      expect(copy.Context.is()).toBe(false);
      expect(text(moved.Message)).toBe("io");
      expect(getter()).toBe(type);
      expect(deprecated()).toBe(type);
      expect(text(typeName)).toBe("com.sun.star.io." + name);
      type.getDescription(description);
      const compound = description[0] as unknown as P,
        baseName = new OUString((compound.pBaseTypeDescription as P).aBase.pTypeName);
      try {
        expect(compound.nMembers).toBe(0);
        expect(text(baseName)).toBe(
          name === "IOException" ? "com.sun.star.uno.Exception" : "com.sun.star.io.IOException",
        );
      } finally {
        baseName.dispose();
      }
    } finally {
      if (description[0] !== null) typelib_typedescription_release(description[0]);
      typeName.dispose();
      moved.dispose();
      copy.dispose();
      value.dispose();
      empty.dispose();
      message.dispose();
      owner.dispose();
    }
  },
);
