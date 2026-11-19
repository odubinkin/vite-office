/** @fileoverview Original nonencrypted ZIP entry writers over Deflater, ThreadedDeflater, CRC32 and UNO streams. */
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import type { ZipPackageStream } from "../zippackage/ZipPackageStream";
import {
  Reference,
  type ReferenceConstParameter,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { n_ConstBufferSize } from "../../inc/PackageConstants";
import { ZipEntry } from "../../inc/ZipEntry";
import { Deflater } from "../../inc/Deflater";
import { CRC32 } from "./CRC32";
import { ThreadedDeflater } from "./ThreadedDeflater";
import { ThreadTask, type ThreadTaskTag } from "../../../comphelper/inc/threadpool";
import { TempFileFastService } from "../../../unotools/inc/tempfile";
import { ExceptionPtr, type ExceptionPtrConstReference } from "../../../external/libcxx/exception";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original abstract compression/CRC/output owner, with the consumed nonencrypted constructor domain. */
export abstract class ZipOutputEntryBase {
  protected readonly m_xContext: Reference<XComponentContext>;
  protected readonly m_xOutStream: Reference<XOutputStream>;
  protected readonly m_aCRC = new CRC32();
  protected readonly m_pCurrentEntry: ZipEntry;
  protected readonly m_pCurrentStream: ZipPackageStream | null;
  protected readonly m_bEncryptCurrentEntry: false;
  /** Original borrowed entry/stream and acquired output/context. checkStream is a debug assertion, not a new runtime guard. @param output - Actual output. @param context - Actual context. @param entry - Borrowed record. @param stream - Original nullable parent pointer, borrowing the actual owner. @param encrypt - Original false domain. @param checkStream - Original assertion selection. @returns Base owner. */
  protected constructor(
    output: ReferenceConstParameter<XOutputStream>,
    context: ReferenceConstParameter<XComponentContext>,
    entry: ZipEntry,
    stream: ZipPackageStream | null,
    encrypt: false,
    checkStream: boolean,
  ) {
    this.m_xContext = new Reference(context);
    this.m_xOutStream = new Reference(output);
    this.m_pCurrentEntry = entry;
    this.m_pCurrentStream = stream;
    this.m_bEncryptCurrentEntry = encrypt;
    void checkStream;
  }
  /** Original reverse reference member destruction, without closing output or deleting borrowed record. @returns Nothing. */
  dispose(): void {
    this.m_xOutStream.dispose();
    this.m_xContext.dispose();
  }
  /** Original borrowed entry pointer. @returns Same record. */
  getZipEntry(): ZipEntry {
    return this.m_pCurrentEntry;
  }
  /** Original nullable borrowed parent pointer. @returns Actual stream or null. */
  getZipPackageStream(): ZipPackageStream | null {
    return this.m_pCurrentStream;
  }
  /** Original encryption flag. @returns False in the bound domain. */
  isEncrypt(): boolean {
    return this.m_bEncryptCurrentEntry;
  }
  /** Original finishing, metadata correction and reset order. Known size/CRC mismatch diagnostics do not alter those values; compressed size is corrected. @returns Nothing. */
  closeEntry(): void {
    this.finishDeflater();
    const entry = this.m_pCurrentEntry;
    if ((entry.nFlag & 8) === 0) {
      // Original size and CRC mismatch checks are OSL_FAIL diagnostics only.
      // The compressed-size mismatch really does change the borrowed record.
      void (entry.nSize !== this.getDeflaterTotalIn());
      if (entry.nCompressedSize !== this.getDeflaterTotalOut())
        entry.nCompressedSize = this.getDeflaterTotalOut();
      void (entry.nCrc !== this.m_aCRC.getValue());
    } else {
      entry.nSize = this.getDeflaterTotalIn();
      entry.nCompressedSize = this.getDeflaterTotalOut();
      entry.nCrc = this.m_aCRC.getValue();
    }
    this.deflaterReset();
    this.m_aCRC.reset();
    // Original returns here for nonencrypted entries; no cipher/digest provider is supplied.
  }
  /** Original copied compressed prefix and immediate output call. @param buffer - Borrowed deflate buffer. @param length - Actual produced prefix. @returns Nothing. */
  protected processDeflated(buffer: Sequence<number>, length: number): void {
    if (length > 0) {
      const temporary = new Bytes(buffer.getConstArray() as SequenceElements, length);
      try {
        this.m_xOutStream.operatorStar().writeBytes(temporary);
      } finally {
        temporary.dispose();
      }
    }
    // Source evaluates this virtual call before testing the false encryption flag.
    this.isDeflaterFinished();
  }
  /** Original plaintext CRC update after compression/output has accepted the input. @param buffer - Original full input. @returns Nothing. */
  protected processInput(buffer: Sequence<number>): void {
    this.m_aCRC.updateSegment(buffer, buffer.getLength());
  }
  /** Original abstract stream input. @param input - Actual input. @returns Nothing. */
  abstract writeStream(input: ReferenceConstParameter<XInputStream>): void;
  /** Original abstract finish operation. @returns Nothing. */
  protected abstract finishDeflater(): void;
  /** Original abstract input count. @returns Signed64 total. */
  protected abstract getDeflaterTotalIn(): bigint;
  /** Original abstract output count. @returns Signed64 total. */
  protected abstract getDeflaterTotalOut(): bigint;
  /** Original abstract reset. @returns Nothing. */
  protected abstract deflaterReset(): void;
  /** Original abstract finished query. @returns Stream-end flag. */
  protected abstract isDeflaterFinished(): boolean;
}
/** Original normal non-threaded case, including default compression/raw mode and32768-byte buffer. */
export class ZipOutputEntry extends ZipOutputEntryBase {
  private readonly m_aDeflateBuffer = new Bytes(n_ConstBufferSize);
  private readonly m_aDeflater = new Deflater(-1, true);
  /** Original delegating constructor, with checkStream=true default. @param output - Actual output. @param context - Actual context. @param entry - Borrowed DEFLATED entry. @param stream - Actual nullable borrowed parent pointer. @param encrypt - False source domain. @param checkStream - Debug assertion flag. @returns Entry compressor. */
  constructor(
    output: ReferenceConstParameter<XOutputStream>,
    context: ReferenceConstParameter<XComponentContext>,
    entry: ZipEntry,
    stream: ZipPackageStream | null,
    encrypt: false,
    checkStream = true,
  ) {
    super(output, context, entry, stream, encrypt, checkStream);
  }
  /** Original reverse derived/base member destruction. @returns Nothing. */
  override dispose(): void {
    this.m_aDeflater.dispose();
    this.m_aDeflateBuffer.dispose();
    super.dispose();
  }
  /** Original input consumption loop; CRC follows successful deflation/output. @param buffer - Native source. @returns Nothing. */
  write(buffer: Sequence<number>): void {
    if (!this.m_aDeflater.finished()) {
      this.m_aDeflater.setInputSegment(buffer);
      while (!this.m_aDeflater.needsInput()) this.doDeflate();
      this.processInput(buffer);
    }
  }
  /** Original32768-byte readBytes loop, including the terminal zero read for exact multiples. Does not close input or output. @param input - Actual native input. @returns Nothing. */
  override writeStream(input: ReferenceConstParameter<XInputStream>): void {
    let length: number;
    const buffer = new Bytes(n_ConstBufferSize);
    try {
      do {
        length = input.operatorStar().readBytes(buffer, n_ConstBufferSize);
        if (length !== n_ConstBufferSize) buffer.realloc(length);
        this.write(buffer);
      } while (length === n_ConstBufferSize);
      this.closeEntry();
    } finally {
      buffer.dispose();
    }
  }
  /** Original output-buffer deflation and immediate base processing. @returns Nothing. */
  protected doDeflate(): void {
    const count = this.m_aDeflater.doDeflateSegment(
      this.m_aDeflateBuffer,
      this.m_aDeflateBuffer.getLength(),
    );
    this.processDeflated(this.m_aDeflateBuffer, count);
  }
  /** Original finish until stream end, without implicit stream closure. @returns Nothing. */
  protected override finishDeflater(): void {
    this.m_aDeflater.finish();
    while (!this.m_aDeflater.finished()) this.doDeflate();
  }
  /** Original input total forwarding. @returns Signed64 total. */
  protected override getDeflaterTotalIn(): bigint {
    return this.m_aDeflater.getTotalIn();
  }
  /** Original output total forwarding. @returns Signed64 total. */
  protected override getDeflaterTotalOut(): bigint {
    return this.m_aDeflater.getTotalOut();
  }
  /** Original reset forwarding. @returns Nothing. */
  protected override deflaterReset(): void {
    this.m_aDeflater.reset();
  }
  /** Original finished forwarding. @returns Flag. */
  protected override isDeflaterFinished(): boolean {
    return this.m_aDeflater.finished();
  }
}

/** Original blocking block-compression writer. */
export class ZipOutputEntryParallel extends ZipOutputEntryBase {
  private totalIn = 0n;
  private totalOut = 0n;
  private finished = false;

  /** Binds original borrowed and acquired members. @param output - Actual output. @param context - Actual context. @param entry - Borrowed record. @param stream - Borrowed owner. @param encrypt - Bound nonencrypted flag. @returns Entry compressor. */
  constructor(
    output: ReferenceConstParameter<XOutputStream>,
    context: ReferenceConstParameter<XComponentContext>,
    entry: ZipEntry,
    stream: ZipPackageStream | null,
    encrypt: false,
  ) {
    super(output, context, entry, stream, encrypt, true);
  }

  /** Deflates and closes one entry. @param input - Actual source. @returns Nothing. */
  override writeStream(input: ReferenceConstParameter<XInputStream>): void {
    const deflater = new ThreadedDeflater(-1);
    deflater.deflateWrite(
      input,
      /** Original plaintext CRC callback. @param buffer - Input block. @param length - Bytes read. @returns Nothing. */
      (buffer, length) => this.m_aCRC.updateSegment(buffer, length),
      /** Original compressed output callback. @param buffer - Compressed block. @param length - Bytes produced. @returns Nothing. */
      (buffer, length) => this.processDeflated(buffer, length),
    );
    this.finished = true;
    const empty = new Bytes();
    try {
      this.processDeflated(empty, 0);
    } finally {
      empty.dispose();
    }
    this.totalIn = deflater.totalIn;
    this.totalOut = deflater.totalOut;
    this.closeEntry();
  }

  /** The blocking write already finished compression. @returns Nothing. */
  protected override finishDeflater(): void {}
  /** Original input total. @returns Bytes consumed. */
  protected override getDeflaterTotalIn(): bigint {
    return this.totalIn;
  }
  /** Original output total. @returns Bytes emitted. */
  protected override getDeflaterTotalOut(): bigint {
    return this.totalOut;
  }
  /** Clears counters and completion like the original. @returns Nothing. */
  protected override deflaterReset(): void {
    this.totalIn = this.totalOut = 0n;
    this.finished = false;
  }
  /** Original finished query. @returns True after the blocking write. */
  protected override isDeflaterFinished(): boolean {
    return this.finished;
  }
}

const outputState = Symbol("ZipOutputEntryInThread::Task output reference"),
  fileState = Symbol("ZipOutputEntryInThread::Task temporary-file reference"),
  finishTask = Symbol("ZipOutputEntryInThread::setFinished");
/** Original background entry object with actual TempFileFastService and consumed entry ownership. Task scheduling remains separate from its source work body. */
export class ZipOutputEntryInThread extends ZipOutputEntry {
  private m_pOwnedZipEntry: ZipEntry | null;
  private readonly m_xTempFile = new RtlReference<TempFileFastService>();
  private readonly m_aParallelDeflateException = new ExceptionPtr();
  private m_bFinished = false;
  /** Original empty output/context/entry constructor and false finished default. @param context - Actual context. @param entry - Consumed original entry. @param stream - Borrowed actual package stream. @param encrypt - Bound nonencrypted flag. @returns Background entry owner. */
  constructor(
    context: ReferenceConstParameter<XComponentContext>,
    entry: ZipEntry,
    stream: ZipPackageStream | null,
    encrypt: false,
  ) {
    const output = new Reference<XOutputStream>();
    try {
      super(output, context, entry, stream, encrypt, false);
    } finally {
      output.dispose();
    }
    this.m_pOwnedZipEntry = entry;
  }
  /** Original reverse member/base destruction, retaining moved records with their new owner. @returns Nothing. */
  override dispose(): void {
    this.m_aParallelDeflateException.dispose();
    this.m_xTempFile.dispose();
    this.m_pOwnedZipEntry?.dispose();
    this.m_pOwnedZipEntry = null;
    super.dispose();
  }
  /** Original task factory borrows entry and acquires the real source input/tag. @param tag - Actual pool tag. @param input - Actual source. @returns Owned original task. */
  createTask(tag: ThreadTaskTag, input: ReferenceConstParameter<XInputStream>): ThreadTask {
    return new ZipOutputEntryInThreadTask(tag, this, input);
  }
  /** Original actual fast temporary file and output acquisition. No memory-stream substitute. @returns Nothing. */
  createBufferFile(): void {
    this.m_xTempFile.assign(new TempFileFastService());
    const output = this.m_xTempFile.operatorStar().getOutputStream();
    try {
      this.m_xOutStream.assign(output);
    } finally {
      output.dispose();
    }
  }
  /** Original output close occurs before releasing its reference. @returns Nothing. */
  closeBufferFile(): void {
    this.m_xOutStream.operatorStar().closeOutput();
    this.m_xOutStream.clear();
  }
  /** Original last fast-file reference release after output closure. @returns Nothing. */
  deleteBufferFile(): void {
    this.m_xTempFile.clear();
  }
  /** Original caller receives an acquired actual temp-file input. @returns Input reference. */
  getData(): Reference<XInputStream> {
    return this.m_xTempFile.operatorStar().getInputStream();
  }
  /** Original retaining exception_ptr assignment. @param exception - Actual captured exception pointer. @returns Nothing. */
  setParallelDeflateException(exception: ExceptionPtrConstReference): void {
    this.m_aParallelDeflateException.assign(exception);
  }
  /** Original borrowed const exception pointer. @returns Retained pointer. */
  getParallelDeflateException(): ExceptionPtrConstReference {
    return this.m_aParallelDeflateException;
  }
  /** Original atomic flag value in this represented same-realm execution profile. Cross-thread memory ordering remains unqualified. @returns Source finished state. */
  isFinished(): boolean {
    return this.m_bFinished;
  }
  /** Original move of unique entry ownership while the base's borrowed pointer remains unchanged. @returns Consumed entry or null after a prior move. */
  moveZipEntry(): ZipEntry | null {
    const entry = this.m_pOwnedZipEntry;
    this.m_pOwnedZipEntry = null;
    return entry;
  }
  /** Module-private compiler lowering of nested Task's protected output access. @returns Actual original reference. */
  [outputState](): Reference<XOutputStream> {
    return this.m_xOutStream;
  }
  /** Module-private compiler lowering of nested Task's private fast-file access. @returns Actual original intrusive reference. */
  [fileState](): RtlReference<TempFileFastService> {
    return this.m_xTempFile;
  }
  /** Original private setFinished, reached through source nested-task friend access. @returns Nothing. */
  [finishTask](): void {
    this.m_bFinished = true;
  }
}
/** Original nested task class. It performs actual buffer/write/cleanup work and never reports a failure as a successful ZIP write. */
class ZipOutputEntryInThreadTask extends ThreadTask {
  private readonly mxInStream: Reference<XInputStream>;
  /** Original task construction retains input and borrows entry. @param tag - Actual tag. @param mpEntry - Actual entry. @param input - Actual source. @returns Task owner. */
  constructor(
    tag: ThreadTaskTag,
    private readonly mpEntry: ZipOutputEntryInThread,
    input: ReferenceConstParameter<XInputStream>,
  ) {
    super(tag);
    this.mxInStream = new Reference(input);
  }
  /** Original input member destruction precedes task-base destruction. @returns Nothing. */
  override dispose(): void {
    this.mxInStream.dispose();
    super.dispose();
  }
  /** Original try/catch-all work body and UNO-only cleanup catch. Finished becomes true only at its original final points. @returns Nothing. */
  protected override doWork(): void {
    try {
      this.mpEntry.createBufferFile();
      this.mpEntry.writeStream(this.mxInStream);
      this.mxInStream.clear();
      this.mpEntry.closeBufferFile();
      this.mpEntry[finishTask]();
    } catch (error) {
      const captured = ExceptionPtr.capture(error);
      try {
        this.mpEntry.setParallelDeflateException(captured);
      } finally {
        captured.dispose();
        if (error instanceof Exception) error.dispose();
      }
      try {
        if (this.mpEntry[outputState]().is()) this.mpEntry.closeBufferFile();
        if (this.mpEntry[fileState]().is()) this.mpEntry.deleteBufferFile();
      } catch (cleanup) {
        if (!(cleanup instanceof Exception)) throw cleanup;
        cleanup.dispose();
      }
      this.mpEntry[finishTask]();
    }
  }
}
