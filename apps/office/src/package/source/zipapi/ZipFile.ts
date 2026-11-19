/** @fileoverview Original ZipFile.cxx directory/LOC/extra-field path over actual native UNO streams, RTL strings and OSL mutex. This consumed browser profile fixes recovery=false; recovery, crypto, entry streams and inflation are not bound here. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import type { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { ZipException } from "../../../offapi/com/sun/star/packages/zip/ZipException";
import { ZipIOException } from "../../../offapi/com/sun/star/packages/zip/ZipIOException";
import { OStorageHelper } from "../../../comphelper/source/misc/storagehelper";
import { ZipEntry } from "../../inc/ZipEntry";
import { EntryHash } from "../../inc/HashMaps";
import { ByteGrabber } from "./ByteGrabber";
import { MemoryByteGrabber } from "./MemoryByteGrabber";
import { ZipEnumeration } from "./ZipEnumeration";
import { XBufferedStream } from "./ZipFile.buffered";
import { XUnbufferedStream, UNBUFF_STREAM_RAW, UNBUFF_STREAM_DATA } from "./XUnbufferedStream";
/** Original nested Checks enum. */
export enum Checks {
  Default,
  CheckInsensitive,
  TryCheckInsensitive,
}
/** Original unsigned64 extra-field output references. */
type LocBuffers = { name: Int8Array; extra: Int8Array };
/** Original unsigned64 extra-field output references. */
type ExtraValues = { size: bigint; compressed: bigint; offset?: bigint };
/** Compiler lowering of a known source UTF16 literal, without document string normalization. @param text - Source literal. @returns Native temporary. */
function literal(text: string): OUString {
  return new OUString(
    Uint16Array.from(
      text,
      /** Materializes one source literal code unit. @param c - Original fixture or source value. @returns Original comparison or actual API result. */ (
        c,
      ) => c.charCodeAt(0),
    ),
    text.length,
  );
}
/** Original generated exception construction with default empty context. @param text - Source diagnostic. @param io - Select ZipIOException. @returns Actual native exception. */
function zipError(text: string, io = false): ZipException | ZipIOException {
  const message = literal(text),
    context = new Reference();
  try {
    return io ? new ZipIOException(message, context) : new ZipException(message, context);
  } finally {
    context.dispose();
    message.dispose();
  }
}
/** Original string_view pointer/count lowering over the actual vector allocation. Invalid pointer/count domains remain unqualified. @param reader - Actual source memory reader. @param count - Source byte count. @returns Borrowed byte view. */
function span(reader: MemoryByteGrabber, count: number): Uint8Array {
  const [storage, offset] = reader.getCurrentPos(),
    bytes = storage as Int8Array;
  return new Uint8Array(bytes.buffer, bytes.byteOffset + offset, count);
}
/** Original raw string_view equality. @param a - First span. @param b - Second span. @returns Equality. */
function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  return (
    a.length === b.length &&
    a.every(
      /** Compares one raw source byte at its original index. @param value - Original fixture or source value. @param index - Original fixture or source value. @returns Original comparison or actual API result. */ (
        value,
        index,
      ) => value === b[index],
    )
  );
}
/** Source vector resize preserves the surviving prefix and value-initializes appended bytes. @param buffer - Previous vector storage. @param length - New source size. @returns Actual resized storage. */
function resize(buffer: Int8Array, length: number): Int8Array {
  if (buffer.length === length) return buffer;
  const result = new Int8Array(length);
  result.set(buffer.subarray(0, Math.min(length, buffer.length)));
  return result;
}
/** Actual consumed directory reader; no alternate ZIP provider or metadata DTO. */
export class ZipFile {
  private readonly m_aMutexHolder: RtlReference<RefCountedMutex>;
  private readonly m_EntriesInsensitive = new Map<number, OUString[]>();
  private m_Checks: Checks;
  private readonly aEntries = new EntryHash();
  private readonly aGrabber: ByteGrabber;
  private readonly xStream: Reference<XInputStream>;
  private readonly m_xContext: Reference<XComponentContext>;
  /** Original constructor for the approved no-recovery browser profile. @param mutex - Shared real native mutex. @param input - Actual seekable native input. @param context - Actual component context. @param initialise - Read central directory. @param forceRecovery - Statically false in this browser profile. @param checks - Original source checks. @returns Reader. */
  constructor(
    mutex: RtlReference<RefCountedMutex>,
    input: Reference<XInputStream>,
    context: Reference<XComponentContext>,
    initialise: boolean,
    forceRecovery: false,
    checks: Checks,
  ) {
    this.m_aMutexHolder = new RtlReference(mutex);
    this.m_Checks = checks;
    this.aGrabber = new ByteGrabber(input);
    this.xStream = new Reference(input);
    this.m_xContext = new Reference(context);
    // bRecoveryMode is statically false: intentional browser no-recovery profile.
    void forceRecovery;
    try {
      if (initialise && this.readCEN() === -1) {
        this.aEntries.clear();
        this.clearInsensitive();
        throw zipError("stream data looks to be broken");
      }
    } catch (error) {
      this.dispose();
      throw error;
    }
  }
  /** Original destructor body followed by reverse member destruction. Does not close the input stream. @returns Nothing. */
  dispose(): void {
    this.aEntries.clear();
    this.m_xContext.dispose();
    this.xStream.dispose();
    this.aGrabber.dispose();
    this.clearInsensitive();
    this.m_aMutexHolder.dispose();
  }
  /** Original unordered_set destruction. @returns Nothing. */
  private clearInsensitive(): void {
    for (const bucket of this.m_EntriesInsensitive.values())
      for (const key of bucket) key.dispose();
    this.m_EntriesInsensitive.clear();
  }
  /** Original insert(...).second with native hash/equality/value copy. @param key - Native borrowed lower path. @returns Whether inserted. */
  private insertInsensitive(key: OUString): boolean {
    const hash = key.hashCode(),
      bucket = this.m_EntriesInsensitive.get(hash) ?? [];
    if (
      bucket.some(
        /** Performs the original native key comparison. @param item - Original fixture or source value. @returns Original comparison or actual API result. */ (
          item,
        ) => item.equals(key),
      )
    )
      return false;
    bucket.push(new OUString(key));
    this.m_EntriesInsensitive.set(hash, bucket);
    return true;
  }
  /** Original borrowed EntryHash reference. @returns Same live hash. */
  GetEntryHash(): EntryHash {
    return this.aEntries;
  }
  /** Original enumeration construction. @returns Borrowed enumeration. */
  entries(): ZipEnumeration {
    return new ZipEnumeration(this.aEntries);
  }
  /** Original mutex-guarded source replacement. @param input - Actual replacement stream. @returns Nothing. */
  setInputStream(input: Reference<XInputStream>): void {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      this.xStream.assign(input);
      this.aGrabber.setInputStream(this.xStream);
    } finally {
      guard.dispose();
    }
  }
  /** Original Emscripten stream construction: the source threading block is excluded, and eager buffering is default. Empty encryption/no recovery is the consumed profile. @param mutex - Source mutex holder. @param entry - Actual record. @param data - Empty native encryption reference. @param mode - Actual source mode. @param decryptedSize - Absent decrypted size. @param buffered - Source buffering default. @returns Actual UNO stream. */
  private createStreamForZipEntry(
    mutex: RtlReference<RefCountedMutex>,
    entry: ZipEntry,
    data: RtlReference<never>,
    mode: 0 | 1,
    decryptedSize: null,
    buffered = true,
  ): Reference<XInputStream> {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex()),
      media = new OUString();
    let source: Reference<XInputStream> | undefined;
    try {
      source = new Reference<XInputStream>(
        new XUnbufferedStream(
          this.m_xContext,
          mutex,
          entry,
          this.xStream,
          data,
          mode,
          decryptedSize,
          media,
          false,
        ),
      );
      return buffered
        ? new Reference<XInputStream>(new XBufferedStream(source))
        : new Reference(source);
    } finally {
      source?.dispose();
      media.dispose();
      guard.dispose();
    }
  }
  /** Original getInputStream for the statically nonencrypted profile. @param entry - Actual record. @param data - Empty encryption reference. @param decryptedSize - Absent decrypted size. @param mutex - Shared stream mutex. @returns Actual buffered input. */
  getInputStream(
    entry: ZipEntry,
    data: RtlReference<never>,
    decryptedSize: null,
    mutex: RtlReference<RefCountedMutex>,
  ): Reference<XInputStream> {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      if (entry.nOffset <= 0n) this.readLOC(entry);
      return this.createStreamForZipEntry(
        mutex,
        entry,
        data,
        entry.nMethod === 0 ? UNBUFF_STREAM_RAW : UNBUFF_STREAM_DATA,
        decryptedSize,
      );
    } finally {
      guard.dispose();
    }
  }
  /** Original getDataStream for the statically nonencrypted profile. @param entry - Actual record. @param data - Empty encryption reference. @param decryptedSize - Absent decrypted size. @param mutex - Shared stream mutex. @returns Actual buffered input. */
  getDataStream(
    entry: ZipEntry,
    data: RtlReference<never>,
    decryptedSize: null,
    mutex: RtlReference<RefCountedMutex>,
  ): Reference<XInputStream> {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      if (entry.nOffset <= 0n) this.readLOC(entry);
      return this.createStreamForZipEntry(
        mutex,
        entry,
        data,
        entry.nMethod === 0 ? UNBUFF_STREAM_RAW : UNBUFF_STREAM_DATA,
        decryptedSize,
      );
    } finally {
      guard.dispose();
    }
  }
  /** Original raw entry-byte path, optionally unbuffered. @param entry - Actual record. @param data - Empty encryption reference. @param decryptedSize - Absent decrypted size. @param mutex - Shared mutex. @param buffered - Source buffering choice. @returns Actual input of compressed bytes. */
  getRawData(
    entry: ZipEntry,
    data: RtlReference<never>,
    decryptedSize: null,
    mutex: RtlReference<RefCountedMutex>,
    buffered = true,
  ): Reference<XInputStream> {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      if (entry.nOffset <= 0n) this.readLOC(entry);
      return this.createStreamForZipEntry(
        mutex,
        entry,
        data,
        UNBUFF_STREAM_RAW,
        decryptedSize,
        buffered,
      );
    } finally {
      guard.dispose();
    }
  }
  /** Original guarded LOC entry point. @param entry - Actual source record with negative LOC offset. @returns End including optional descriptor. */
  readLOC(entry: ZipEntry): bigint {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      return this.readLOC_Impl(entry, { name: new Int8Array(), extra: new Int8Array() });
    } finally {
      guard.dispose();
    }
  }
  /** Original LOC consistency checks; temporary vectors use actual byte allocations, not host decoded records. @param entry - Mutable original entry. @param buffers - Shared source temporary vectors. @returns Unsigned64 end. */
  private readLOC_Impl(entry: ZipEntry, buffers: LocBuffers): bigint {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      const position = BigInt.asIntN(64, -entry.nOffset);
      this.aGrabber.seek(position);
      const header = new Int8Array(30);
      if (this.aGrabber.readBytes(header, 30) !== 30) throw new RuntimeException();
      const reader = new MemoryByteGrabber(header, 30);
      if (reader.ReadInt32() !== 0x04034b50)
        throw zipError("Invalid LOC header (bad signature)", true);
      const version = reader.ReadUInt16() & 0xffff,
        flag = reader.ReadUInt16() & 0xffff,
        method = reader.ReadUInt16() & 0xffff;
      reader.ReadInt32();
      let crc = reader.ReadUInt32(),
        compressed = BigInt(reader.ReadUInt32()),
        size = BigInt(reader.ReadUInt32()),
        pathLength = reader.ReadInt16();
      const extraLength = reader.ReadInt16();
      if (pathLength < 0) pathLength = 0;
      entry.nOffset = BigInt.asIntN(
        64,
        this.aGrabber.getPosition() + BigInt(pathLength + extraLength),
      );
      let end = 0n,
        broken = false;
      try {
        const name = (buffers.name = resize(buffers.name, pathLength)),
          read = this.aGrabber.readBytes(name, pathLength),
          nameView = new Uint8Array(name.buffer, name.byteOffset, read);
        const path = new OUString(nameView, nameView.length, RTL_TEXTENCODING_UTF8);
        try {
          if (entry.nPathLen === -1) {
            entry.nPathLen = pathLength;
            entry.sPath.assign(path);
          }
          if (entry.nPathLen !== pathLength || !entry.sPath.equals(path)) broken = true;
        } finally {
          path.dispose();
        }
        let isZip64 = false;
        const values: ExtraValues = { size, compressed };
        if (extraLength !== 0) {
          const extra = (buffers.extra = resize(buffers.extra, extraLength));
          this.aGrabber.readBytes(extra, extraLength);
          isZip64 = this.readExtraFields(
            new MemoryByteGrabber(extra, extraLength),
            extraLength,
            values,
            nameView,
          );
          size = values.size;
          compressed = values.compressed;
        }
        if (!isZip64 && version >= 45) isZip64 = true;
        if ((entry.nFlag & ~0x806) !== (flag & ~0x806)) broken = true;
        if (entry.nMethod !== method) broken = true;
        const sum = entry.nOffset + entry.nCompressedSize;
        end = BigInt.asIntN(64, sum);
        if (end !== sum) throw zipError("Integer-overflow");
        if ((entry.nFlag & 8) !== 0) {
          this.aGrabber.seek(
            BigInt.asIntN(64, this.aGrabber.getPosition() + entry.nCompressedSize),
          );
          const temp = this.aGrabber.ReadUInt32(),
            descriptorCrc = temp === 0x08074b50 ? this.aGrabber.ReadUInt32() : temp;
          const descriptorCompressed = isZip64
            ? this.aGrabber.ReadUInt64()
            : BigInt(this.aGrabber.ReadUInt32());
          const descriptorSize = isZip64
            ? this.aGrabber.ReadUInt64()
            : BigInt(this.aGrabber.ReadUInt32());
          if (end < this.aGrabber.getPosition()) end = this.aGrabber.getPosition();
          else broken = true;
          if (
            (crc === 0 || crc === descriptorCrc) &&
            (compressed === 0n ||
              compressed === 0xffffffffffffffffn ||
              compressed === descriptorCompressed) &&
            (size === 0n || size === 0xffffffffffffffffn || size === descriptorSize)
          ) {
            crc = descriptorCrc;
            compressed = descriptorCompressed;
            size = descriptorSize;
          } else broken = true;
        }
        if (crc !== 0 && entry.nCrc >>> 0 !== crc) broken = true;
        if (compressed !== 0n && BigInt.asUintN(64, entry.nCompressedSize) !== compressed)
          broken = true;
        if (size !== 0n && BigInt.asUintN(64, entry.nSize) !== size) broken = true;
        if (values.offset !== undefined && BigInt.asUintN(64, position) !== values.offset)
          broken = true;
      } catch (error) {
        if (error instanceof Exception) error.dispose();
        broken = true;
      }
      if (broken) throw zipError("The stream seems to be broken!", true);
      return BigInt.asUintN(64, end);
    } finally {
      guard.dispose();
    }
  }
  /** Original END/Zip64 locator and directory geometry checks. @returns Signed64 tuple (count, size, offset). */
  private findCentralDirectory(): readonly [bigint, bigint, bigint] {
    try {
      const length = this.aGrabber.getLength();
      if (length < 22n) throw zipError("Zip too small!");
      const start = length - 22n - 512n >= 0n ? length - 22n - 512n : 0n;
      this.aGrabber.seek(start);
      const size = Number(length - start),
        buffer = new Int8Array(size);
      if (this.aGrabber.readBytes(buffer, size) !== size)
        throw zipError("Zip END signature not found!");
      let endPosition = 0n;
      for (let position = size - 22; position >= 0; --position) {
        if (
          buffer[position] === 80 &&
          buffer[position + 1] === 75 &&
          buffer[position + 2] === 5 &&
          buffer[position + 3] === 6
        ) {
          endPosition = BigInt(position) + start;
          break;
        }
        if (position === 0) throw zipError("Zip END signature not found!");
      }
      this.aGrabber.seek(endPosition + 4n);
      const disk = this.aGrabber.ReadUInt16();
      if (disk !== 0 && disk !== 0xffff) throw zipError("invalid end (disk)");
      const directoryDisk = this.aGrabber.ReadUInt16();
      // Original checks nEndDisk, not nEndDirDisk, against the sentinel.
      if (directoryDisk !== 0 && disk !== 0xffff) throw zipError("invalid end (directory disk)");
      const diskEntries = this.aGrabber.ReadUInt16(),
        entries = this.aGrabber.ReadUInt16();
      if (diskEntries !== entries) throw zipError("invalid end (entries)");
      const directorySize = this.aGrabber.ReadInt32(),
        directoryOffset = this.aGrabber.ReadInt32();
      if (endPosition >= 20n) {
        this.aGrabber.seek(endPosition - 20n);
        const locator = new Int8Array(20);
        if (this.aGrabber.readBytes(locator, 20) !== 20) throw new RuntimeException();
        const loc = new MemoryByteGrabber(locator, 20);
        if (
          loc.ReadUInt8() === 80 &&
          loc.ReadUInt8() === 75 &&
          loc.ReadUInt8() === 6 &&
          loc.ReadUInt8() === 7
        ) {
          if (loc.ReadUInt32() !== 0) throw zipError("invalid Zip64 end locator (disk)");
          const offset64 = BigInt.asIntN(64, loc.ReadUInt64());
          if (endPosition < 76n || endPosition - 76n < offset64 || offset64 < 0n)
            throw zipError("invalid Zip64 end locator (offset)");
          if (loc.ReadUInt32() !== 1) throw zipError("invalid Zip64 end locator (number of disks)");
          this.aGrabber.seek(offset64);
          const recordSize = Number(endPosition - 20n - offset64),
            record = new Int8Array(recordSize);
          this.aGrabber.readBytes(record, recordSize);
          const end64 = new MemoryByteGrabber(record, recordSize);
          if (
            end64.ReadUInt8() !== 80 ||
            end64.ReadUInt8() !== 75 ||
            end64.ReadUInt8() !== 6 ||
            end64.ReadUInt8() !== 6
          )
            throw zipError("invalid Zip64 end (signature)");
          if (BigInt.asIntN(64, end64.ReadUInt64()) !== BigInt(recordSize) - 12n)
            throw zipError("invalid Zip64 end (size)");
          end64.ReadUInt16();
          end64.ReadUInt16();
          if (end64.ReadUInt32() !== 0) throw zipError("invalid Zip64 end (disk)");
          if (end64.ReadUInt32() !== 0) throw zipError("invalid Zip64 end (directory disk)");
          const diskEntries64 = end64.ReadUInt64(),
            entries64 = end64.ReadUInt64();
          if (diskEntries64 !== entries64) throw zipError("invalid Zip64 end (entries)");
          const size64 = BigInt.asIntN(64, end64.ReadUInt64()),
            directory64 = BigInt.asIntN(64, end64.ReadUInt64());
          if (entries !== 0xffff && entries64 !== BigInt(entries))
            throw zipError("inconsistent Zip/Zip64 end (entries)");
          if (directorySize !== -1 && size64 !== BigInt(directorySize))
            throw zipError("inconsistent Zip/Zip64 end (size)");
          if (directoryOffset !== -1 && directory64 !== BigInt(directoryOffset))
            throw zipError("inconsistent Zip/Zip64 end (offset)");
          const sum = directory64 + size64;
          if (
            BigInt.asIntN(64, sum) !== sum ||
            offset64 < sum ||
            directory64 < 0n ||
            size64 < 0n ||
            offset64 - size64 !== directory64
          )
            throw zipError("Invalid Zip64 end (bad central directory size)");
          return [BigInt.asIntN(64, entries64), size64, directory64];
        }
      }
      const sum = BigInt(directoryOffset) + BigInt(directorySize);
      if (
        BigInt.asIntN(32, sum) !== sum ||
        endPosition < sum ||
        directoryOffset < 0 ||
        endPosition - BigInt(directorySize) !== BigInt(directoryOffset)
      )
        throw zipError("Invalid END header (bad central directory size)");
      return [BigInt(entries), BigInt(directorySize), BigInt(directoryOffset)];
    } catch (error) {
      if (
        error instanceof IllegalArgumentException ||
        error instanceof NotConnectedException ||
        error instanceof BufferSizeExceededException
      ) {
        error.dispose();
        throw zipError("Zip END signature not found!");
      }
      throw error;
    }
  }
  /** Original central-directory loop, LOC consistency, occupied intervals and duplicate checks. @returns Original signed32 directory position or -1 after IllegalArgumentException. */
  private readCEN(): number {
    let centralPosition: number;
    try {
      const [total, length, offset] = this.findCentralDirectory();
      centralPosition = Number(BigInt.asIntN(32, offset));
      if (total > 65534n) throw zipError("too many entries in ZIP File");
      if (length < total * 46n) throw zipError("invalid END header (bad entry count)");
      if (length > 2147483647n || length < 0n) throw zipError("central directory too big");
      this.aGrabber.seek(BigInt(centralPosition));
      const buffer = new Int8Array(Number(length));
      if (BigInt(this.aGrabber.readBytes(buffer, Number(length))) !== length)
        throw zipError("Error reading CEN into memory buffer!");
      const reader = new MemoryByteGrabber(buffer, Number(length)),
        entry = new ZipEntry();
      const buffers: LocBuffers = { name: new Int8Array(), extra: new Int8Array() };
      const unallocated: [bigint, bigint][] = [[0n, BigInt.asUintN(64, BigInt(centralPosition))]];
      try {
        // Source reserve(nTotal) is a compiler allocation hint, not observable record content.
        let count = 0n;
        for (; count < total; ++count) {
          if (reader.ReadInt32() !== 0x02014b50)
            throw zipError("Invalid CEN header (bad signature)");
          const versionMadeBy = reader.ReadUInt16() & 0xffff;
          entry.nVersion = reader.ReadInt16();
          entry.nFlag = reader.ReadInt16();
          if ((entry.nFlag & 1) === 1) throw zipError("Invalid CEN header (encrypted entry)");
          entry.nMethod = reader.ReadInt16();
          if (entry.nMethod !== 0 && entry.nMethod !== 8)
            throw zipError("Invalid CEN header (bad compression method)");
          entry.nTime = reader.ReadInt32();
          entry.nCrc = reader.ReadInt32();
          const values: ExtraValues = {
            compressed: BigInt(reader.ReadUInt32()),
            size: BigInt(reader.ReadUInt32()),
          };
          entry.nPathLen = reader.ReadInt16();
          entry.nExtraLen = reader.ReadInt16();
          const commentLength = reader.ReadInt16();
          reader.skipBytes(4);
          const attributes = reader.ReadUInt32();
          let localOffset = BigInt(reader.ReadUInt32());
          if (entry.nPathLen < 0) throw zipError("unexpected name length");
          if (commentLength < 0) throw zipError("unexpected comment length");
          if (entry.nExtraLen < 0) throw zipError("unexpected extra header info length");
          if (entry.nPathLen > reader.remainingSize()) throw zipError("name too long");
          const rawPath = span(reader, entry.nPathLen),
            path = new OUString(rawPath, rawPath.length, RTL_TEXTENCODING_UTF8);
          try {
            entry.sPath.assign(path);
          } finally {
            path.dispose();
          }
          if (
            !OStorageHelper.IsValidZipEntryFileName(
              entry.sPath.getStr().subarray(0, entry.sPath.getLength()),
              true,
            )
          )
            throw zipError("Zip entry has an invalid name.");
          reader.skipBytes(entry.nPathLen);
          if (entry.nExtraLen > 0) {
            this.readExtraFields(reader, entry.nExtraLen, values, rawPath);
            if (values.offset !== undefined) localOffset = values.offset;
          }
          entry.nCompressedSize = BigInt.asIntN(64, values.compressed);
          entry.nSize = BigInt.asIntN(64, values.size);
          entry.nOffset = BigInt.asIntN(64, localOffset);
          const negativeOffset = -entry.nOffset;
          entry.nOffset = BigInt.asIntN(64, negativeOffset);
          if (negativeOffset !== entry.nOffset) throw zipError("Integer-overflow");
          if (entry.nMethod === 0 && entry.nCompressedSize !== entry.nSize)
            throw zipError("entry STORED with inconsistent size");
          reader.skipBytes(commentLength);
          const start = BigInt.asUintN(64, -entry.nOffset),
            end = this.readLOC_Impl(entry, buffers);
          for (let index = 0; ; ++index) {
            const interval = unallocated[index];
            if (!interval || start < interval[0]) throw zipError("overlapping entries");
            if (interval[0] === start) {
              if (interval[1] === end) {
                unallocated.splice(index, 1);
                break;
              }
              if (end < interval[1]) {
                interval[0] = end;
                break;
              }
              throw zipError("overlapping entries");
            } else if (start < interval[1]) {
              if (end < interval[1]) {
                const first = interval[0];
                interval[0] = end;
                unallocated.splice(index, 0, [first, start]);
                break;
              }
              if (end === interval[1]) {
                interval[1] = start;
                break;
              }
              throw zipError("overlapping entries");
            }
          }
          if (entry.nSize === 0n && (versionMadeBy & 0xff00) === 0 && attributes & 16) continue;
          if (this.aEntries.find(entry.sPath)) throw zipError("Duplicate CEN entry");
          if (this.aEntries.empty() && this.m_Checks === Checks.TryCheckInsensitive) {
            const mimetype = literal("mimetype");
            try {
              this.m_Checks =
                entry.sPath.equals(mimetype) && entry.nSize === 0n
                  ? Checks.Default
                  : Checks.CheckInsensitive;
            } finally {
              mimetype.dispose();
            }
          }
          const lower = entry.sPath.toAsciiLowerCase();
          try {
            if (!this.insertInsensitive(lower) && this.m_Checks === Checks.CheckInsensitive)
              throw zipError("Duplicate CEN entry (case insensitive)");
          } finally {
            lower.dispose();
          }
          this.aEntries.set(entry.sPath, entry);
        }
        if (count !== total) throw zipError("Count != Total");
        if (unallocated.length) {
          if (
            unallocated.every(
              /** Tests the original data-descriptor gap sizes. @param interval - Original fixture or source value. @returns Original comparison or actual API result. */ (
                interval,
              ) => interval[1] - interval[0] === 12n || interval[1] - interval[0] === 16n,
            )
          )
            throw zipError(
              "Zip file has holes the size of data descriptors; producer forgot to set flag bit 3?",
            );
          throw zipError("Zip file has holes! It will leak!");
        }
      } finally {
        entry.dispose();
      }
    } catch (error) {
      if (!(error instanceof IllegalArgumentException)) throw error;
      error.dispose();
      centralPosition = -1;
    }
    return centralPosition;
  }
  /** Original extensible fields with source unconditional first Zip64 size and Unicode raw-byte equality. @param reader - Actual borrowed CEN/LOC buffer. @param extraLength - Signed16 record extent. @param values - Original mutable output references. @param filename - Original raw UTF8 CEN/LOC span. @returns Whether Zip64 appeared. */
  private readExtraFields(
    reader: MemoryByteGrabber,
    extraLength: number,
    values: ExtraValues,
    filename: Uint8Array,
  ): boolean {
    let zip64 = false;
    while (extraLength > 0) {
      const id = reader.ReadInt16(),
        size = reader.ReadUInt16() & 0xffff;
      if (id === 1) {
        values.size = reader.ReadUInt64();
        let read = 8;
        if (size >= 16) {
          values.compressed = reader.ReadUInt64();
          read = 16;
          if (size >= 24) {
            values.offset = reader.ReadUInt64();
            read = 24;
          }
        }
        if (size > read) reader.skipBytes(size - read);
        zip64 = true;
      } else if (id === 0x7075) {
        if (reader.remainingSize() < size)
          throw zipError("Invalid Info-ZIP Unicode Path Extra Field");
        if (reader.ReadUInt8() !== 1) throw zipError("Invalid Info-ZIP Unicode Path Extra Field");
        reader.ReadUInt32();
        const unicodePath = span(reader, size - 5);
        reader.skipBytes(size - 5);
        if (!equalBytes(unicodePath, filename))
          throw zipError("Invalid Info-ZIP Unicode Path Extra Field");
      } else reader.skipBytes(size);
      extraLength = ((extraLength - size - 4) << 16) >> 16;
    }
    return zip64;
  }
}
