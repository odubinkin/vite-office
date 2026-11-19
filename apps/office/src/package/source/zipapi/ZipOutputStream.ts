/** @fileoverview Original plain ZIP writer with an explicit no-worker ThreadPool for the JavaScript realm. */
import {
  Reference,
  type ReferenceConstParameter,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { OUString, OUStringToOString } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import {
  TimeValue,
  oslDateTime,
  osl_getSystemTime,
  osl_getDateTimeFromTimeValue,
} from "../../../sal/inc/osl/time";
import { OStorageHelper } from "../../../comphelper/source/misc/storagehelper";
import { ThreadPool } from "../../../comphelper/inc/threadpool";
import { ExceptionPtr } from "../../../external/libcxx/exception";
import { ZipEntry } from "../../inc/ZipEntry";
import { n_ConstBufferSize } from "../../inc/PackageConstants";
import type { ZipOutputEntryInThread } from "./ZipOutputEntry";
import { ByteChucker } from "./ByteChucker";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original size clamp writes the flag only on the truncation path. @param value - Signed64 size/offset. @param truncated - Source output flag. @returns Original unsigned32 value. */
function getTruncated(value: bigint, truncated: [boolean]): number {
  if (value >= 0xffffffffn) {
    truncated[0] = true;
    return 0xffffffff;
  }
  return Number(BigInt.asUintN(32, value));
}
/** Original native UTF8 name and temporary Sequence construction. @param entry - Source record. @returns Native name and copied source bytes. */
function nameBytes(entry: ZipEntry): {
  name: ReturnType<typeof OUStringToOString>;
  bytes: Sequence<number>;
  length: number;
} {
  if (
    !OStorageHelper.IsValidZipEntryFileName(
      entry.sPath.getStr().subarray(0, entry.sPath.getLength()),
      true,
    )
  ) {
    const message = new OUString(
        Uint16Array.from(
          "Unexpected character is used in file name.",
          /** Known source literal unit. @param c - Character. @returns Unit. */ (c) =>
            c.charCodeAt(0),
        ),
        42,
      ),
      context = new Reference();
    try {
      throw new IOException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  const name = OUStringToOString(
      entry.sPath.getStr().subarray(0, entry.sPath.getLength()),
      RTL_TEXTENCODING_UTF8,
    ),
    bytes = new (Sequence.specialize<number>("sal_Int8", 1))(name.getLength()),
    target = bytes.getArray() as SequenceElements,
    source = name.getStr();
  for (let i = 0; i < name.getLength(); ++i)
    (target.get(i) as [number])[0] = ((source[i] as number) << 24) >> 24;
  return { name, bytes, length: (name.getLength() << 16) >> 16 };
}
/** Actual original synchronous ZIP writer. writeLOC consumes the supplied record; caller aliases are borrowed until finish/dispose destroys native string members. JS byte-array lifetime stays GC-managed. */
export class ZipOutputStream {
  private readonly m_xStream: Reference<XOutputStream>;
  private readonly m_aZipList: ZipEntry[] = [];
  private readonly m_aEntries: ZipOutputEntryInThread[] = [];
  private readonly m_aDeflateException = new ExceptionPtr();
  private readonly m_aDeflatePool = new ThreadPool(0);
  private readonly mpThreadTaskTag = ThreadPool.createThreadTaskTag();
  private readonly m_aChucker: ByteChucker;
  private m_pCurrentEntry: ZipEntry | null = null;
  /** Original native stream/member construction. @param output - Actual output. @returns Writer. */
  constructor(output: Reference<XOutputStream>) {
    this.m_xStream = new Reference(output);
    this.m_aChucker = new ByteChucker(output);
  }
  /** Original reverse member destruction; output is neither closed nor flushed. @returns Nothing. */
  dispose(): void {
    this.m_aDeflatePool.dispose();
    this.mpThreadTaskTag.dispose();
    for (const entry of this.m_aEntries) entry.dispose();
    this.m_aEntries.length = 0;
    this.m_aDeflateException.dispose();
    this.m_aChucker.dispose();
    this.clearEntries();
    this.m_xStream.dispose();
  }
  /** Original vector unique-record destruction, without invalidating externally held JS arrays. @returns Nothing. */
  private clearEntries(): void {
    for (const entry of this.m_aZipList) entry.dispose();
    this.m_aZipList.length = 0;
  }
  /** Original source entry defaults and signed unknown-value sentinels. Debug-only unknown-size assertion remains an unqualified assertion domain. @param entry - Actual record. @returns Nothing. */
  static setEntry(entry: ZipEntry): void {
    if (entry.nTime === -1) entry.nTime = ZipOutputStream.getCurrentDosTime() | 0;
    if (entry.nMethod === -1) entry.nMethod = 8;
    entry.nVersion = 20;
    entry.nFlag = 1 << 11;
    if (entry.nSize === -1n || entry.nCompressedSize === -1n || entry.nCrc === -1) {
      if (entry.nSize === -1n) entry.nSize = 0n;
      entry.nCompressedSize = 0n;
      entry.nFlag |= 8;
    }
  }
  /** Original UTC OSL clock and DOS integer arithmetic; no injected application clock. @returns Unsigned32 DOS timestamp. */
  static getCurrentDosTime(): number {
    const date = new oslDateTime(),
      time = new TimeValue();
    osl_getSystemTime(time);
    osl_getDateTimeFromTimeValue(time, date);
    let year = date.Year >>> 0;
    if (year >= 1980) year -= 1980;
    else if (year >= 80) year -= 80;
    return (
      (((date.Day + 32 * date.Month + 512 * year) << 16) |
        (Math.trunc(date.Seconds / 2) + 32 * date.Minutes + 2048 * date.Hours)) >>>
      0
    );
  }
  /** Original borrowed native stream reference. @returns Same source reference. */
  getStream(): ReferenceConstParameter<XOutputStream> {
    return this.m_xStream;
  }
  /** Original transfer into archive list before validation and exact local-header/name/extra ordering. @param entry - Consumed actual entry. @param encrypt - Statically false plain profile. @returns Nothing. */
  writeLOC(entry: ZipEntry, encrypt: false = false): void {
    void encrypt;
    this.m_aZipList.push(entry);
    this.m_pCurrentEntry = entry;
    const data = nameBytes(entry),
      writer = this.m_aChucker,
      large: [boolean] = [false];
    try {
      writer.WriteInt32(0x04034b50);
      writer.WriteInt16(entry.nVersion);
      writer.WriteInt16(entry.nFlag);
      writer.WriteInt16(entry.nMethod);
      const compressed = getTruncated(entry.nCompressedSize, large),
        size = getTruncated(entry.nSize, large);
      writer.WriteUInt32(entry.nTime);
      if ((entry.nFlag & 8) === 8) {
        writer.WriteInt32(0);
        writer.WriteInt32(0);
        writer.WriteInt32(0);
      } else {
        writer.WriteUInt32(entry.nCrc);
        writer.WriteUInt32(compressed);
        writer.WriteUInt32(size);
      }
      writer.WriteInt16(data.length);
      writer.WriteInt16(large[0] ? 32 : 0);
      writer.WriteBytes(data.bytes);
      entry.nOffset = BigInt.asIntN(64, writer.GetPosition() - BigInt(30 + data.length));
      if (large[0]) this.writeExtraFields(entry, (entry.nFlag & 8) !== 0);
    } finally {
      data.bytes.dispose();
      data.name.dispose();
    }
  }
  /** Original byte copy; no compression or entry accounting is invented here. @param bytes - Actual source Sequence. @returns Nothing. */
  rawWrite(bytes: Sequence<number>): void {
    this.m_aChucker.WriteBytes(bytes);
  }
  /** Original descriptor condition; source STORED entries do not emit descriptors even when bit3 is set. @param encrypt - Statically false. @returns Nothing. */
  rawCloseEntry(encrypt: false = false): void {
    void encrypt;
    const entry = this.m_pCurrentEntry as ZipEntry;
    if (entry.nMethod === 8 && entry.nFlag & 8) this.writeDataDescriptor(entry);
    this.m_pCurrentEntry = null;
  }

  /** Queues the original temporary-file task. @param entry - Consumed scheduled entry. @param input - Actual source. @returns Nothing. */
  addDeflatingThreadTask(
    entry: ZipOutputEntryInThread,
    input: ReferenceConstParameter<XInputStream>,
  ): void {
    this.m_aEntries.push(entry);
    const task = entry.createTask(this.mpThreadTaskTag, input);
    try {
      this.m_aDeflatePool.pushTask(task);
    } catch (error) {
      task.dispose();
      throw error;
    }
  }

  /** Bounds the number of queued entries by draining in source order. @param allowedTasks - Source queue limit. @returns Nothing. */
  reduceScheduledThreadTasksToGivenNumberOrLess(allowedTasks: number): void {
    if (this.m_aEntries.length <= allowedTasks) return;
    this.m_aDeflatePool.waitUntilDone(this.mpThreadTaskTag);
    while (this.m_aEntries.length > 0)
      this.consumeScheduledThreadTaskEntry(this.m_aEntries.shift() as ZipOutputEntryInThread);
  }

  /** Transfers completed compressed bytes and updates the package member. @param entry - Consumed task result. @returns Nothing. */
  private consumeScheduledThreadTaskEntry(entry: ZipOutputEntryInThread): void {
    try {
      const exception = entry.getParallelDeflateException();
      if (exception.is()) {
        this.m_aDeflateException.assign(exception);
        return;
      }
      const record = entry.moveZipEntry();
      if (!record || !entry.isFinished()) {
        record?.dispose();
        throw new Error("Scheduled ZIP entry did not finish");
      }
      this.writeLOC(record);
      const input = entry.getData();
      const bytes = new Bytes(n_ConstBufferSize);
      try {
        let length: number;
        do {
          length = input.operatorStar().readBytes(bytes, n_ConstBufferSize);
          if (length < n_ConstBufferSize) bytes.realloc(length);
          this.rawWrite(bytes);
        } while (length === n_ConstBufferSize);
      } finally {
        bytes.dispose();
        input.dispose();
      }
      this.rawCloseEntry();
      entry.getZipPackageStream()?.successfullyWritten(record);
      entry.deleteBufferFile();
    } finally {
      entry.dispose();
    }
  }

  /** Drains remaining entries from the back, emits CEN/END, then rethrows captured task failures. @returns Nothing. */
  finish(): void {
    this.m_aDeflatePool.waitUntilDone(this.mpThreadTaskTag);
    while (this.m_aEntries.length > 0)
      this.consumeScheduledThreadTaskEntry(this.m_aEntries.pop() as ZipOutputEntryInThread);
    const offset = Number(BigInt.asIntN(32, this.m_aChucker.GetPosition()));
    for (const entry of this.m_aZipList) this.writeCEN(entry);
    const length = Number(BigInt.asIntN(32, this.m_aChucker.GetPosition() - BigInt(offset)));
    this.writeEND(offset >>> 0, length >>> 0);
    this.clearEntries();
    if (this.m_aDeflateException.is()) this.m_aDeflateException.rethrow();
  }
  /** Original normal END fields and narrowing; no new ZIP64 END producer. @param offset - Unsigned32 directory offset. @param length - Unsigned32 directory length. @returns Nothing. */
  private writeEND(offset: number, length: number): void {
    const w = this.m_aChucker;
    w.WriteInt32(0x06054b50);
    w.WriteInt16(0);
    w.WriteInt16(0);
    w.WriteInt16(this.m_aZipList.length);
    w.WriteInt16(this.m_aZipList.length);
    w.WriteUInt32(length);
    w.WriteUInt32(offset);
    w.WriteInt16(0);
  }
  /** Original CEN record using native UTF8 conversion and signed name length. @param entry - Actual owned record. @returns Nothing. */
  private writeCEN(entry: ZipEntry): void {
    const data = nameBytes(entry),
      w = this.m_aChucker,
      large: [boolean] = [false];
    try {
      w.WriteInt32(0x02014b50);
      w.WriteInt16(entry.nVersion);
      w.WriteInt16(entry.nVersion);
      w.WriteInt16(entry.nFlag);
      w.WriteInt16(entry.nMethod);
      w.WriteUInt32(entry.nTime);
      w.WriteUInt32(entry.nCrc);
      w.WriteUInt32(getTruncated(entry.nCompressedSize, large));
      w.WriteUInt32(getTruncated(entry.nSize, large));
      const offset = getTruncated(entry.nOffset, large);
      w.WriteInt16(data.length);
      w.WriteInt16(large[0] ? 32 : 0);
      w.WriteInt16(0);
      w.WriteInt16(0);
      w.WriteInt16(0);
      w.WriteInt32(0);
      w.WriteUInt32(offset);
      w.WriteBytes(data.bytes);
      if (large[0]) this.writeExtraFields(entry, false);
    } finally {
      data.bytes.dispose();
      data.name.dispose();
    }
  }
  /** Original optional ZIP64 descriptor choice uses >=2^32, unlike header sentinel thresholdFFFFFFFF. @param entry - Actual record. @returns Nothing. */
  private writeDataDescriptor(entry: ZipEntry): void {
    const w = this.m_aChucker;
    w.WriteInt32(0x08074b50);
    w.WriteUInt32(entry.nCrc);
    if (entry.nCompressedSize >= 0x100000000n || entry.nSize >= 0x100000000n) {
      w.WriteUInt64(entry.nCompressedSize);
      w.WriteUInt64(entry.nSize);
    } else {
      w.WriteUInt32(Number(BigInt.asUintN(32, entry.nCompressedSize)));
      w.WriteUInt32(Number(BigInt.asUintN(32, entry.nSize)));
    }
  }
  /** Original unconditional three64-bit values plus disk, including LOC/DD zero size fields. @param entry - Actual record. @param localDescriptor - Source LOC with DD. @returns Nothing. */
  private writeExtraFields(entry: ZipEntry, localDescriptor: boolean): void {
    const w = this.m_aChucker;
    w.WriteInt16(1);
    w.WriteInt16(28);
    w.WriteUInt64(localDescriptor ? 0n : entry.nSize);
    w.WriteUInt64(localDescriptor ? 0n : entry.nCompressedSize);
    w.WriteUInt64(entry.nOffset);
    w.WriteInt32(0);
  }
}
