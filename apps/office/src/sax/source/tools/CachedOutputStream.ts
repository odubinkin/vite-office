/** @fileoverview Native 1MiB CachedOutputStream and ForMergeBase contracts; byte-array views bind original native byte sequences without a second stream registry. */
/** Actual consumed XOutputStream write operation. */
export interface OutputStream {
  writeBytes(bytes: Uint8Array): void;
}
/** Original merge destination owns appended values. */
export interface ForMergeBase {
  append(bytes: Uint8Array): void;
}
/** Original cache flushes before switching destinations, including zero-length flushes. */
export class CachedOutputStream {
  private readonly maCache = new Uint8Array(0x100000);
  private mnCacheWrittenSize = 0;
  private mpForMerge: ForMergeBase | null = null;
  private mbWriteToOutStream = true;
  private mxOutputStream: OutputStream | null = null;
  /** Original borrowed stream. @returns Stream. */ getOutputStream(): OutputStream | null {
    return this.mxOutputStream;
  }
  /** Original stream assignment does not flush. @param stream - Actual stream. @returns Nothing. */ setOutputStream(
    stream: OutputStream,
  ): void {
    this.mxOutputStream = stream;
  }
  /** Original destination switch flushes to the previous destination first. @param merge - Actual merge owner. @returns Nothing. */ setOutput(
    merge: ForMergeBase,
  ): void {
    this.flush();
    this.mbWriteToOutStream = false;
    this.mpForMerge = merge;
  }
  /** Original output reset flushes the current merge first. @returns Nothing. */ resetOutputToStream(): void {
    this.flush();
    this.mbWriteToOutStream = true;
    this.mpForMerge = null;
  }
  /** Original strict-greater-than threshold and direct oversized write. @param bytes - Borrowed input. @returns Nothing. */
  writeBytes(bytes: Uint8Array): void {
    if (this.mnCacheWrittenSize + bytes.length > this.maCache.length) {
      this.flush();
      if (bytes.length > this.maCache.length) {
        this.output(bytes);
        return;
      }
    }
    this.maCache.set(bytes, this.mnCacheWrittenSize);
    this.mnCacheWrittenSize += bytes.length;
  }
  /** Original flush invokes the destination even when the cache is empty. @returns Nothing. */
  flush(): void {
    this.output(this.maCache.subarray(0, this.mnCacheWrittenSize));
    this.mnCacheWrittenSize = 0;
  }
  /** Original stream-versus-merge dispatch; both consume a borrowed native sequence immediately. @param bytes - Current sequence. @returns Nothing. */
  private output(bytes: Uint8Array): void {
    if (!this.mbWriteToOutStream) (this.mpForMerge as ForMergeBase).append(bytes);
    else {
      if (!this.mxOutputStream) throw Error("CachedOutputStream output is not assigned.");
      this.mxOutputStream.writeBytes(bytes);
    }
  }
}
