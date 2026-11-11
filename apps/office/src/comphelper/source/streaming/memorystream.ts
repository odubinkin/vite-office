/** @fileoverview Original UNOMemoryStream component, service/query identity, shared cursor and input/output/truncate protocols. A signed typed-array backing lowers the primitive std::vector noinit allocation; physical allocation, indeterminate gap values and ABI remain unverified. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XSeekableInputStream } from "../../../udkapi/com/sun/star/io/XSeekableInputStream";
import { XTruncate } from "../../../udkapi/com/sun/star/io/XTruncate";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { SAL_MAX_INT32 } from "../../../sal/inc/types";
import type { ByteReader, ByteWriter } from "../../inc/bytereader";
const Names = Sequence.specialize<rtl_uStringSlot>("OUString", 8);
/** Original ASCII source literal bound to a genuine Unicode value. @param value - Literal. @returns Owned string. */
function literal(value: string): OUString {
  return new OUString(
    Uint8Array.from(
      value + "\0",
      /** Source ASCII unit. @param c - Unit. @returns Byte. */ (c) => c.charCodeAt(0),
    ),
  );
}
/** Original comphelper memory stream; input and output interfaces share a single cursor, and close only resets that cursor. */
export class UNOMemoryStream
  extends WeakImplHelper.specialize(
    XServiceInfo,
    XStream,
    XSeekableInputStream,
    XOutputStream,
    XTruncate,
  )
  implements
    XServiceInfo,
    XStream,
    XSeekableInputStream,
    XOutputStream,
    XTruncate,
    ByteReader,
    ByteWriter
{
  private maData: Int8Array<ArrayBuffer>;
  private mnSize = 0;
  private mnCursor = 0;
  /** Original no-argument construction reserves1MiB after initializing the zero cursor. @returns Component. */
  constructor() {
    super();
    this.maData = new Int8Array(1024 * 1024);
  }
  /** Original std::vector resize retains capacity and contents; host typed-array allocation erases noinit physical storage, without an extra stream provider. @param length - New logical size. @returns Nothing. */
  private resize(length: number): void {
    if (length > this.maData.length) {
      const data = new Int8Array(length);
      data.set(this.maData.subarray(0, this.mnSize));
      this.maData = data;
    }
    this.mnSize = length;
  }
  /** Original implementation name. @returns Owned name. */
  getImplementationName(): OUString {
    return literal("com.sun.star.comp.MemoryStream");
  }
  /** Original common service predicate. @param name - Borrowed demanded name. @returns Exact membership. */
  supportsService(name: OUString): boolean {
    return supportsService(this, name);
  }
  /** Original singleton service-name sequence. @returns Owned sequence of initialized string fields. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.comp.MemoryStream");
    try {
      return new Names(new Map([[0, name.getDataAddress()]]), 1);
    } finally {
      name.dispose();
    }
  }
  /** Original same-identity input reference. @returns Owned input reference. */
  getInputStream(): Reference<XInputStream> {
    return new Reference<XInputStream>(this);
  }
  /** Original same-identity output reference. @returns Owned output reference. */
  getOutputStream(): Reference<XOutputStream> {
    return new Reference<XOutputStream>(this);
  }
  /** Original default-context negative read/skip IOException. @param message - Source literal. @returns Never. */
  private invalidCount(message: string): never {
    const text = literal(message),
      context = new Reference();
    try {
      throw new IOException(text, context);
    } finally {
      context.dispose();
      text.dispose();
    }
  }
  /** Original sequence read resizes the destination exactly and advances the shared cursor. @param data - Native out sequence. @param count - Signed32 requested bytes. @returns Read count. */
  readBytes(data: Sequence<number>, count: number): number {
    if (count < 0) this.invalidCount("nBytesToRead < 0");
    count = Math.min(count, this.available());
    data.realloc(count);
    if (count) this.copyRead(data.getArray() as SequenceElements, count);
    return count;
  }
  /** Original memcpy and cursor update, sharing the source's pointer-read implementation. @param data - Initialized writable destination. @param count - Bounded read count. @returns Nothing. */
  private copyRead(data: SequenceElements, count: number): void {
    for (let i = 0; i < count; ++i)
      (data.get(i) as [number])[0] = this.maData[this.mnCursor + i] as number;
    this.mnCursor += count;
  }
  /** Original sequence/pointer overloads retain the original bounds and exception message. @param data - Sequence or writable pointer. @param count - Signed32 count. @returns Read count. */
  readSomeBytes(data: Sequence<number> | SequenceElements, count: number): number {
    if (data instanceof Sequence) return this.readBytes(data, count);
    if (count < 0) this.invalidCount("nBytesToRead < 0");
    count = Math.min(count, this.available());
    if (count) this.copyRead(data, count);
    return count;
  }
  /** Original bounded skip; negative requests fail without moving. @param count - Signed32 count. @returns Nothing. */
  skipBytes(count: number): void {
    if (count < 0) this.invalidCount("nBytesToSkip < 0");
    this.mnCursor += Math.min(count, this.available());
  }
  /** Original signed32 capped remaining bytes. @returns Count. */
  available(): number {
    return Math.min(SAL_MAX_INT32, this.mnSize - this.mnCursor);
  }
  /** Original close resets position without disconnecting or clearing data. @returns Nothing. */
  closeInput(): void {
    this.mnCursor = 0;
  }
  /** Original seek may grow the vector, with the original2GB bound and exception argument0. @param location - Signed64 position. @returns Nothing. */
  seek(location: bigint): void {
    if (location < 0n || location > BigInt(SAL_MAX_INT32)) {
      const message = literal("this implementation does not support more than 2GB!"),
        context = new Reference(this);
      try {
        throw new IllegalArgumentException(message, context, 0);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    if (location > BigInt(this.mnSize)) this.resize(Number(location));
    this.mnCursor = Number(location);
  }
  /** Original signed64 position. @returns Position. */
  getPosition(): bigint {
    return BigInt(this.mnCursor);
  }
  /** Original signed64 length. @returns Length. */
  getLength(): bigint {
    return BigInt(this.mnSize);
  }
  /** Original sequence output forwarding. @param data - Actual native sequence. @returns Nothing. */
  writeBytes(data: Sequence<number>): void;
  /** Original ByteWriter counted pointer overload. @param data - Initialized pointer. @param count - Signed32 byte count. @returns Nothing. */
  writeBytes(data: SequenceElements, count: number): void;
  /** Original sequence/pointer output; a negative raw count violates the native assertion precondition. @param data - Actual native sequence or byte pointer. @param count - Required raw pointer count. @returns Nothing. */
  writeBytes(data: Sequence<number> | SequenceElements, count?: number): void {
    if (data instanceof Sequence) {
      this.writeBytes(data.getConstArray() as SequenceElements, data.getLength());
      return;
    }
    const size = count as number;
    if (!size) return;
    const length = this.mnCursor + size;
    if (length > SAL_MAX_INT32) {
      const message = literal("this implementation does not support more than 2GB!"),
        context = new Reference(this);
      try {
        throw new IOException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    if (length > this.mnSize) this.resize(length);
    for (let i = 0; i < size; ++i) this.maData[this.mnCursor + i] = (data.get(i) as [number])[0];
    this.mnCursor += size;
  }
  /** Original empty flush. @returns Nothing. */
  flush(): void {}
  /** Original output close only resets the shared cursor. @returns Nothing. */
  closeOutput(): void {
    this.mnCursor = 0;
  }
  /** Original vector clear retains capacity and resets position. @returns Nothing. */
  truncate(): void {
    this.mnSize = 0;
    this.mnCursor = 0;
  }
}
