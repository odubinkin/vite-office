/** @fileoverview Actual native UNOMemoryStream service/interface identity, shared input/output state, no-disconnect close contracts and BinaryXOutputStream/BinaryXInputStream integration. */
import { expect, it } from "vitest";
import { UNOMemoryStream } from "./memorystream";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import {
  XSeekableInputStream,
  getCppuType as seekType,
} from "../../../udkapi/com/sun/star/io/XSeekableInputStream";
import { XTruncate, getCppuType as truncateType } from "../../../udkapi/com/sun/star/io/XTruncate";
import { XTypeProvider } from "../../../udkapi/com/sun/star/lang/XTypeProvider";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { ByteReader, ByteWriter } from "../../inc/bytereader";
import { BinaryXInputStream } from "../../../oox/source/helper/binaryinputstream";
import { BinaryXOutputStream } from "../../../oox/source/helper/binaryoutputstream";
import { nativeString, nativeText } from "../../../test/ofopxml-values";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Initializes actual signed byte fields. @param values - Data. @returns Owned sequence. */
function bytes(values: readonly number[]): Sequence<number> {
  const data = new Bytes(values.length),
    pointer = data.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i) (pointer.get(i) as [number])[0] = values[i] as number;
  return data;
}
/** Reads genuine byte fields for assertions. @param data - Native sequence. @returns Scalar copy. */
function values(data: Sequence<number>): number[] {
  const result: number[] = [],
    pointer = data.getConstArray() as SequenceElements;
  for (let i = 0; i < data.getLength(); ++i) result.push((pointer.get(i) as [number])[0]);
  return result;
}
/** Verifies native caught exception and frees its actual members. @param action - Operation. @param expected - Native class. @param message - Exact source diagnostic. @param context - Native context identity or null. @returns Nothing. */
function failure(
  action: () => unknown,
  expected: unknown,
  message: string,
  context: UNOMemoryStream | null,
): void {
  try {
    action();
    throw new Error("Expected native exception");
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error.constructor).toBe(expected);
      expect(nativeText(error.Message)).toBe(message);
      expect(error.Context.get()).toBe(context);
      if (error instanceof IllegalArgumentException) expect(error.ArgumentPosition).toBe(0);
    } finally {
      error.dispose();
    }
  }
}
it("exposes the complete genuine interface graph and exact native service names", /** Exercises direct and two-base queries through real typelib descriptors and references. @returns Nothing. */ () => {
  const owner = new Reference(new UNOMemoryStream()),
    value = owner.get() as UNOMemoryStream;
  try {
    expect(seekType()).toBe(seekType(null));
    expect(truncateType()).toBe(truncateType(null));
    for (const declaration of [
      XStream,
      XInputStream,
      XOutputStream,
      XSeekable,
      XSeekableInputStream,
      XTruncate,
      XTypeProvider,
      XServiceInfo,
    ]) {
      const query = owner.query(declaration.static_type);
      expect(query.get()).toBe(value);
      query.dispose();
    }
    const absent = owner.query(XComponent.static_type);
    expect(absent.is()).toBe(false);
    absent.dispose();
    const name = value.getImplementationName(),
      services = value.getSupportedServiceNames(),
      yes = nativeString("com.sun.star.comp.MemoryStream"),
      no = nativeString("com.sun.star.io.MemoryStream");
    try {
      expect(nativeText(name)).toBe("com.sun.star.comp.MemoryStream");
      expect(services.getLength()).toBe(1);
      expect(nativeText(OUString.unacquired(services.operatorIndex(0)))).toBe(nativeText(name));
      expect(value.supportsService(yes)).toBe(true);
      expect(value.supportsService(no)).toBe(false);
    } finally {
      no.dispose();
      yes.dispose();
      services.dispose();
      name.dispose();
    }
    const input = value.getInputStream(),
      output = value.getOutputStream();
    expect(input.get()).toBe(value);
    expect(output.get()).toBe(value);
    input.dispose();
    output.dispose();
  } finally {
    owner.dispose();
  }
});
it("shares cursor, overwrites without truncation and supports byte-pointer reads and writes", /** Uses genuine ByteReader/ByteWriter crosscast declarations rather than alternate stream providers. @returns Nothing. */ () => {
  const owner = new Reference(new UNOMemoryStream()),
    value = owner.get() as UNOMemoryStream,
    data = bytes([1, -1, 3, 4]),
    out = new Bytes(),
    target = new Bytes(5),
    empty = new Bytes();
  try {
    value.writeBytes(data);
    expect(value.getLength()).toBe(4n);
    expect(value.getPosition()).toBe(4n);
    value.seek(1n);
    const pointer = data.getConstArray() as SequenceElements;
    (value as ByteWriter).writeBytes(pointer, 2);
    expect(value.getLength()).toBe(4n);
    expect(value.getPosition()).toBe(3n);
    value.seek(0n);
    expect(value.readBytes(out, 10)).toBe(4);
    expect(values(out)).toEqual([1, 1, -1, 4]);
    expect(value.readBytes(out, 1)).toBe(0);
    expect(out.getLength()).toBe(0);
    value.seek(1n);
    expect(value.readSomeBytes(out, 2)).toBe(2);
    expect(values(out)).toEqual([1, -1]);
    value.seek(0n);
    expect((value as ByteReader).readSomeBytes(target.getArray() as SequenceElements, 8)).toBe(4);
    expect(values(target).slice(0, 4)).toEqual([1, 1, -1, 4]);
    expect((value as ByteReader).readSomeBytes(target.getArray() as SequenceElements, 1)).toBe(0);
    value.closeInput();
    value.skipBytes(1);
    expect(value.available()).toBe(3);
    value.skipBytes(999);
    expect(value.available()).toBe(0);
    value.closeOutput();
    expect(value.getPosition()).toBe(0n);
    expect(value.getLength()).toBe(4n);
    value.flush();
    value.writeBytes(empty);
    value.seek(9n);
    expect(value.getLength()).toBe(9n);
    expect(value.available()).toBe(0);
    value.truncate();
    expect(value.getLength()).toBe(0n);
    expect(value.getPosition()).toBe(0n);
    value.writeBytes(data);
    value.closeOutput();
    expect(value.readBytes(out, 9)).toBe(4);
    expect(values(out)).toEqual([1, -1, 3, 4]);
  } finally {
    empty.dispose();
    target.dispose();
    out.dispose();
    data.dispose();
    owner.dispose();
  }
});

it("preserves exact count, seek and output-overflow exceptions without allocating a2GB buffer", /** Error paths retain original exception context and argument position. @returns Nothing. */ () => {
  const owner = new Reference(new UNOMemoryStream()),
    value = owner.get() as UNOMemoryStream,
    data = bytes([1]),
    output = new Bytes(),
    pointer = data.getArray() as SequenceElements;
  try {
    failure(
      /** Negative sequence read. @returns Count. */ () => value.readBytes(output, -1),
      IOException,
      "nBytesToRead < 0",
      null,
    );
    failure(
      /** Negative pointer read. @returns Count. */ () => value.readSomeBytes(pointer, -1),
      IOException,
      "nBytesToRead < 0",
      null,
    );
    failure(
      /** Negative skip. @returns Nothing. */ () => value.skipBytes(-1),
      IOException,
      "nBytesToSkip < 0",
      null,
    );
    for (const position of [-1n, 2147483648n])
      failure(
        /** Invalid absolute offset. @returns Nothing. */ () => value.seek(position),
        IllegalArgumentException,
        "this implementation does not support more than 2GB!",
        value,
      );
    value.writeBytes(data);
    failure(
      /** Overflow is rejected before the source pointer is read or storage resized. @returns Nothing. */ () =>
        value.writeBytes(pointer, 2147483647),
      IOException,
      "this implementation does not support more than 2GB!",
      value,
    );
    expect(value.getLength()).toBe(1n);
    expect(value.getPosition()).toBe(1n);
    value.seek(BigInt(1024 * 1024 + 7));
    expect(value.getLength()).toBe(BigInt(1024 * 1024 + 7));
    value.seek(0n);
    expect(value.readBytes(output, 1)).toBe(1);
    expect(values(output)).toEqual([1]);
  } finally {
    output.dispose();
    data.dispose();
    owner.dispose();
  }
});
it("provides the actual seekable cache to BinaryXOutputStream and BinaryXInputStream", /** Core wrappers query and use real output/input/seek interfaces, including their source closure policy. @returns Nothing. */ () => {
  const owner = new Reference(new UNOMemoryStream()),
    value = owner.get() as UNOMemoryStream,
    outputRef = value.getOutputStream(),
    inputRef = value.getInputStream(),
    output = new BinaryXOutputStream(outputRef, false),
    data = bytes([10, -2, 30]),
    result = new Bytes();
  outputRef.dispose();
  inputRef.dispose();
  try {
    expect(output.isSeekable()).toBe(true);
    output.writeData(data);
    output.close();
    expect(value.getPosition()).toBe(3n);
    value.closeInput();
    const inputOwner = value.getInputStream(),
      input = new BinaryXInputStream(inputOwner, false);
    inputOwner.dispose();
    try {
      expect(input.readData(result, 9)).toBe(3);
      expect(values(result)).toEqual([10, -2, 30]);
      input.close();
      expect(value.getPosition()).toBe(0n);
    } finally {
      input.dispose();
    }
    value.writeBytes(data);
    value.closeOutput();
    expect(value.readBytes(result, 1)).toBe(1);
    expect(values(result)).toEqual([10]);
  } finally {
    result.dispose();
    data.dispose();
    output.dispose();
    owner.dispose();
  }
});
