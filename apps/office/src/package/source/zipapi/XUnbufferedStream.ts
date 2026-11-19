/** @fileoverview Original XUnbufferedStream.cxx nonencrypted constructor/read path. Empty encryption reference, absent decrypted size and recovery=false are statically bound for this browser slice; crypto/header/decrypted-raw constructor paths are not emulated. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { ZipIOException } from "../../../offapi/com/sun/star/packages/zip/ZipIOException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { ZipEntry } from "../../inc/ZipEntry";
import { InflateZlib } from "./InflateZlib";
import { CRC32 } from "./CRC32";
/** Original unbuffered stream modes. */
export const UNBUFF_STREAM_DATA = 0,
  UNBUFF_STREAM_RAW = 1,
  UNBUFF_STREAM_WRAPPEDRAW = 2;
/** Original source diagnostic with generated empty context. @param message - Source literal. @param runtime - RuntimeException selection. @returns Actual native exception. */
function broken(
  message = "The stream seems to be broken!",
  runtime = false,
): ZipIOException | RuntimeException {
  const text = new OUString(
      Uint16Array.from(
        message,
        /** Source literal unit. @param c - Character. @returns UTF16 unit. */ (c) =>
          c.charCodeAt(0),
      ),
      message.length,
    ),
    context = new Reference();
  try {
    return runtime ? new RuntimeException(text, context) : new ZipIOException(text, context);
  } finally {
    context.dispose();
    text.dispose();
  }
}
/** Actual original native input component, deliberately without ByteReader or XSeekable bases. */
export class XUnbufferedStream
  extends WeakImplHelper.specialize(XInputStream)
  implements XInputStream
{
  private readonly maMutexHolder: RtlReference<RefCountedMutex>;
  private readonly mxZipStream: Reference<XInputStream>;
  private readonly mxZipSeek: Reference<XSeekable>;
  private readonly maCompBuffer = new (Sequence.specialize<number>("sal_Int8", 1))();
  private readonly maHeader = new (Sequence.specialize<number>("sal_Int8", 1))();
  private readonly maEntry: ZipEntry;
  private readonly maInflater = new InflateZlib(true);
  private readonly mbRawStream: boolean;
  private readonly mbWrappedRaw: boolean;
  private readonly mnHeaderToRead = 0;
  private mnZipCurrent = 0n;
  private mnZipEnd = 0n;
  private mnZipSize = 0n;
  private mnMyCurrent = 0n;
  private readonly maCRC = new CRC32();
  private readonly mbCheckCRC = true;
  /** Original constructor specialized to the actual no-encryption/no-recovery profile. @param context - Component context. @param mutex - Actual shared native mutex. @param entry - Actual mapped entry. @param input - Native archive stream. @param data - Actual empty encryption reference. @param mode - Original mode. @param decryptedSize - Absent decrypted size. @param mediaType - Unused without encryption header. @param recovery - Statically false browser policy. @returns Component. */
  constructor(
    context: Reference<XComponentContext>,
    mutex: RtlReference<RefCountedMutex>,
    entry: ZipEntry,
    input: Reference<XInputStream>,
    data: RtlReference<never>,
    mode: 0 | 1 | 2,
    decryptedSize: null,
    mediaType: OUStringConstReference,
    recovery: false,
  ) {
    super();
    this.maMutexHolder = new RtlReference(mutex);
    this.mxZipStream = new Reference(input);
    this.mxZipSeek = new Reference<XSeekable>(input, UNO_QUERY, XSeekable.static_type);
    this.maEntry = new ZipEntry(entry);
    this.mbRawStream = mode === UNBUFF_STREAM_RAW || mode === UNBUFF_STREAM_WRAPPEDRAW;
    this.mbWrappedRaw = mode === UNBUFF_STREAM_WRAPPEDRAW;
    void context;
    void data;
    void decryptedSize;
    void mediaType;
    void recovery;
    this.mnZipCurrent = this.maEntry.nOffset;
    this.mnZipSize = this.mbRawStream ? this.maEntry.nCompressedSize : this.maEntry.nSize;
    const size = this.maEntry.nCompressedSize;
    try {
      if (this.mnZipSize < 0n) throw broken();
      const sum = this.maEntry.nOffset + size;
      this.mnZipEnd = BigInt.asIntN(64, sum);
      if (this.mnZipEnd !== sum) throw broken("Integer-overflow");
      // Empty source rData fixes bHaveEncryptData/bMustDecrypt=false. Header remains empty.
    } catch (error) {
      this.destroy();
      throw error;
    }
  }
  /** Original inline size query. @returns Signed64 logical size. */
  getSize(): bigint {
    return this.mnZipSize;
  }
  /** Original mutex scope, source inflater loop and CRC timing. @param data - Actual native output Sequence. @param bytesToRead - Signed32 request. @returns Actual count. */
  readBytes(data: Sequence<number>, bytesToRead: number): number {
    const guard = new MutexGuard(this.maMutexHolder.operatorStar().GetMutex());
    try {
      let requested = bytesToRead;
      if (this.mnMyCurrent + BigInt(requested) > this.mnZipSize + BigInt(this.maHeader.getLength()))
        requested = Number(
          BigInt.asIntN(32, this.mnZipSize + BigInt(this.maHeader.getLength()) - this.mnMyCurrent),
        );
      let total = 0;
      data.realloc(requested);
      if (requested) {
        let read = 0,
          lastRead = 0;
        if (this.mbRawStream) {
          const difference = this.mnZipEnd - this.mnZipCurrent;
          // With empty encryption data the wrapped header branch is statically absent.
          this.mxZipSeek.operatorStar().seek(this.mnZipCurrent);
          read = this.mxZipStream
            .operatorStar()
            .readBytes(
              data,
              Number(difference < BigInt(requested) ? difference : BigInt(requested)),
            );
          this.mnZipCurrent = BigInt.asIntN(64, this.mnZipCurrent + BigInt(read));
          data.realloc(read);
          if (this.mbWrappedRaw && this.mbCheckCRC) this.maCRC.update(data);
        } else {
          for (;;) {
            lastRead = this.maInflater.doInflateSegment(data, read, data.getLength() - read);
            if (
              lastRead !== 0 &&
              (read + lastRead === requested || this.mnZipCurrent >= this.mnZipEnd)
            )
              break;
            read += lastRead;
            if (read > requested)
              throw broken("Should not be possible to read more than requested!", true);
            if (this.maInflater.finished() || this.maInflater.getLastInflateError()) throw broken();
            if (this.maInflater.needsDictionary()) throw broken("Dictionaries are not supported!");
            const difference = Number(BigInt.asIntN(32, this.mnZipEnd - this.mnZipCurrent));
            if (difference <= 0) throw broken();
            this.mxZipSeek.operatorStar().seek(this.mnZipCurrent);
            const count = Math.min(difference, Math.max(requested, 8192));
            const zipRead = this.mxZipStream.operatorStar().readBytes(this.maCompBuffer, count);
            if (zipRead < count) throw broken("No expected data!");
            this.mnZipCurrent = BigInt.asIntN(64, this.mnZipCurrent + BigInt(zipRead));
            this.maInflater.setInput(this.maCompBuffer);
          }
        }
        this.mnMyCurrent = BigInt.asIntN(64, this.mnMyCurrent + BigInt(read + lastRead));
        total = read + lastRead;
        if (total < requested) data.realloc(total);
        if (this.mbCheckCRC && (!this.mbRawStream || this.mbWrappedRaw)) {
          if (!this.mbWrappedRaw) this.maCRC.update(data);
          if (
            this.mnZipSize + BigInt(this.maHeader.getLength()) === this.mnMyCurrent &&
            this.maCRC.getValue() !== this.maEntry.nCrc
          )
            throw broken();
        }
      }
      return total;
    } finally {
      guard.dispose();
    }
  }
  /** Original direct forwarding. @param data - Output Sequence. @param count - Signed32 maximum. @returns Read count. */
  readSomeBytes(data: Sequence<number>, count: number): number {
    return this.readBytes(data, count);
  }
  /** Original allocated read/discard, including CRC and source errors. @param count - Signed32 skip. @returns Nothing. */
  skipBytes(count: number): void {
    if (count) {
      const buffer = new (Sequence.specialize<number>("sal_Int8", 1))(count);
      try {
        this.readBytes(buffer, count);
      } finally {
        buffer.dispose();
      }
    }
  }
  /** Original signed32 saturated availability. @returns Count. */
  available(): number {
    const count = this.mnZipSize + BigInt(this.mnHeaderToRead) - this.mnMyCurrent;
    return Number(BigInt.asIntN(32, count < 2147483647n ? count : 2147483647n));
  }
  /** Original no-op. @returns Nothing. */
  closeInput(): void {}
  /** Original empty destructor followed by reverse member/base destruction. JS-owned byte arrays are never manually freed. @returns Nothing. */
  protected override destroy(): void {
    this.maInflater.dispose();
    this.maEntry.dispose();
    this.maHeader.dispose();
    this.maCompBuffer.dispose();
    this.mxZipSeek.dispose();
    this.mxZipStream.dispose();
    this.maMutexHolder.dispose();
    super.destroy();
  }
}
