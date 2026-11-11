/** @fileoverview Original1MiB SAL ByteSequence cache, native logical-size mutation and UNO byte-sequence output. The existing package output transport still supplies the write operation; full XOutputStream Reference/component ownership remains unported. */
import { ByteSequence, BYTESEQ_NODEFAULT } from "../../../sal/inc/rtl/byteseq";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
import { toUnoSequence, type Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { sal_Sequence } from "../../../sal/inc/types";
/** Compiler binding of the original initialized UNO byte constructor to the shared SAL allocation; the temporary is released before the value reaches the output. @param bytes - Initialized pointer. @param count - Byte count. @returns Owned UNO byte sequence. */
function outputSequence(bytes: ByteElements, count: number): Sequence<number> {
  const initialized = new ByteSequence(bytes, count);
  try {
    return toUnoSequence(initialized);
  } finally {
    initialized.dispose();
  }
}
/** Existing package transport's consumed native byte-write contract; no UNO component/provider is manufactured. */
export interface OutputStream {
  writeBytes(bytes: Sequence<number>): void;
}
/** Original mark destination consumes an actual borrowed SAL sequence. */
export abstract class ForMergeBase {
  /** Erased std::shared_ptr control-block count; this is not a UNO or native physical object-layout field. */
  private references = 0;
  /** Compiler binding for a shared_ptr copy. @returns Nothing. */
  acquire(): void {
    ++this.references;
  }
  /** Compiler binding for shared_ptr destruction. @returns Nothing. */
  release(): void {
    if (--this.references === 0) this.destroy();
  }
  /** Original virtual append. @param bytes - Borrowed SAL sequence. @returns Nothing. */
  abstract append(bytes: ByteSequence): void;
  /** Original virtual base destructor. @returns Nothing. */
  protected destroy(): void {}
}
/** Original cache flushes before switching destinations, including empty flushes, and retains written size if a destination throws. */
export class CachedOutputStream {
  private readonly maCache = new ByteSequence(0x100000, BYTESEQ_NODEFAULT);
  private readonly pSeq = this.maCache.get() as sal_Sequence;
  private mnCacheWrittenSize = 0;
  private mpForMerge: ForMergeBase | null = null;
  private mbWriteToOutStream = true;
  private mxOutputStream: OutputStream | null = null;
  /** Existing borrowed transport until native output Reference ownership is connected. @returns Stream. */
  getOutputStream(): OutputStream | null {
    return this.mxOutputStream;
  }
  /** Original assignment does not flush. @param stream - Actual native-byte transport. @returns Nothing. */
  setOutputStream(stream: OutputStream): void {
    this.mxOutputStream = stream;
  }
  /** Original switch flushes the old destination before publishing the new one. @param merge - Actual mark. @returns Nothing. */
  setOutput(merge: ForMergeBase): void {
    this.flush();
    this.mbWriteToOutStream = false;
    merge.acquire();
    this.mpForMerge?.release();
    this.mpForMerge = merge;
  }
  /** Original reset flushes the old mark first. @returns Nothing. */
  resetOutputToStream(): void {
    this.flush();
    this.mbWriteToOutStream = true;
    this.mpForMerge?.release();
    this.mpForMerge = null;
  }
  /** Original pointer write uses the strict-greater1MiB threshold and independently owned oversized sequences. @param bytes - Initialized source pointer. @param count - Signed32 byte count. @returns Nothing. */
  writeBytes(bytes: ByteElements, count: number): void {
    if (this.mnCacheWrittenSize + count > 0x100000) {
      this.flush();
      if (count > 0x100000) {
        if (this.mbWriteToOutStream) {
          const value = outputSequence(bytes, count);
          try {
            this.stream().writeBytes(value);
          } finally {
            value.dispose();
          }
        } else {
          const value = new ByteSequence(bytes, count);
          try {
            (this.mpForMerge as ForMergeBase).append(value);
          } finally {
            value.dispose();
          }
        }
        return;
      }
    }
    const target = this.pSeq.elements as SequenceElements;
    for (let i = 0; i < count; ++i)
      (target.get(this.mnCacheWrittenSize + i) as [number])[0] = ArrayBuffer.isView(bytes)
        ? ((bytes[i] as number) << 24) >> 24
        : (bytes.get(i) as [number])[0];
    this.mnCacheWrittenSize += count;
  }
  /** Existing unset transport violates the native nonnull dereference precondition. @returns Assigned transport. */
  private stream(): OutputStream {
    if (!this.mxOutputStream) throw new Error("CachedOutputStream output is not assigned.");
    return this.mxOutputStream;
  }
  /** Original flush mutates the actual SAL record length and passes its alias through toUnoSequence; there is no cache copy or COW repair. @returns Nothing. */
  flush(): void {
    this.pSeq.nElements = this.mnCacheWrittenSize;
    if (this.mbWriteToOutStream) {
      const value = toUnoSequence(this.maCache);
      try {
        this.stream().writeBytes(value);
      } finally {
        value.dispose();
      }
    } else (this.mpForMerge as ForMergeBase).append(this.maCache);
    this.mnCacheWrittenSize = 0;
  }
  /** Original member destruction does not flush. @returns Nothing. */
  dispose(): void {
    try {
      this.maCache.dispose();
    } finally {
      this.mpForMerge?.release();
    }
  }
}
