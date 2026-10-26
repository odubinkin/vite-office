/** @fileoverview Original ICU78.3 ByteSink/CheckedArrayByteSink consumed API from bytestream.h/cpp. Uint8Array views project narrow pointers; immutable strings project counted narrow spans. Native invalid ranges, non-identical overlap and ABI remain uncertified. */
/** Append-only counted narrow-string boundary used by original locale ByteSink callers. */
export interface ByteStringSink {
  /** Appends the full counted narrow span, including embedded NUL. @param bytes - Narrow span. @returns Nothing. */
  Append(bytes: string): void;
}
/** Original default-method ByteSink owner. */
export abstract class ByteSink implements ByteStringSink {
  /** Original append dispatch; omitted count is the counted-string projection used by locale callers. @param bytes - Narrow pointer/span. @param n - Optional native signed32 count. @returns Nothing. */
  abstract Append(bytes: string | Uint8Array | null, n?: number): void;
  /** Original scratch-only default query. @param min_capacity - Native minimum. @param desired_capacity_hint - Ignored source hint. @param scratch - Borrowed scratch pointer. @param scratch_capacity - Native capacity. @param result_capacity - Output capacity. @returns Borrowed mutable span/null. */
  GetAppendBuffer(
    min_capacity: number,
    desired_capacity_hint: number,
    scratch: Uint8Array | null,
    scratch_capacity: number,
    result_capacity: [number],
  ): Uint8Array | null {
    min_capacity |= 0;
    scratch_capacity |= 0;
    void desired_capacity_hint;
    if (min_capacity < 1 || scratch_capacity < min_capacity) {
      result_capacity[0] = 0;
      return null;
    }
    result_capacity[0] = scratch_capacity;
    return scratch;
  }
  /** Original empty default flush. @returns Nothing. */
  Flush(): void {
    // Source ByteSink::Flush has no action.
  }
}
/** Original checked sink retains written/attempted counts, sticky overflow and direct append-buffer ownership. */
export class CheckedArrayByteSink extends ByteSink {
  private readonly capacity_: number;
  private size_ = 0;
  private appended_ = 0;
  private overflowed_ = false;
  /** Original negative-capacity clamp. @param outbuf_ - Borrowed writable pointer/null for zero capacity. @param capacity - Signed32 capacity. @returns Sink. */
  constructor(
    private readonly outbuf_: Uint8Array | null,
    capacity: number,
  ) {
    super();
    capacity |= 0;
    this.capacity_ = capacity < 0 ? 0 : capacity;
  }
  /** Original reset retains all caller bytes. @returns This owner. */
  Reset(): this {
    this.size_ = this.appended_ = 0;
    this.overflowed_ = false;
    return this;
  }
  /** Original append copies only the available prefix, saturates attempted count before copying on int32 overflow and recognizes the exact direct output pointer. @param bytes - Readable narrow span/pointer. @param n - Native count or full counted-string length. @returns Nothing. */
  Append(bytes: string | Uint8Array | null, n?: number): void {
    n = n === undefined ? (bytes as string).length : n | 0;
    if (n <= 0) return;
    if (n > 0x7fffffff - this.appended_) {
      this.appended_ = 0x7fffffff;
      this.overflowed_ = true;
      return;
    }
    this.appended_ += n;
    const available = this.capacity_ - this.size_;
    if (n > available) {
      n = available;
      this.overflowed_ = true;
    }
    if (n > 0) {
      const out = this.outbuf_ as Uint8Array,
        isDirect =
          bytes instanceof Uint8Array &&
          bytes.buffer === out.buffer &&
          bytes.byteOffset === out.byteOffset + this.size_;
      if (!isDirect)
        for (let i = 0; i < n; ++i)
          out[this.size_ + i] =
            typeof bytes === "string" ? bytes.charCodeAt(i) : ((bytes as Uint8Array)[i] as number);
    }
    this.size_ += n;
  }
  /** Original direct-buffer choice precedes scratch fallback; desired capacity is ignored. @param min_capacity - Minimum. @param desired_capacity_hint - Ignored native hint. @param scratch - Borrowed scratch. @param scratch_capacity - Scratch capacity. @param result_capacity - Output capacity. @returns Actual output tail, scratch or null. */
  override GetAppendBuffer(
    min_capacity: number,
    desired_capacity_hint: number,
    scratch: Uint8Array | null,
    scratch_capacity: number,
    result_capacity: [number],
  ): Uint8Array | null {
    min_capacity |= 0;
    scratch_capacity |= 0;
    void desired_capacity_hint;
    if (min_capacity < 1 || scratch_capacity < min_capacity) {
      result_capacity[0] = 0;
      return null;
    }
    const available = this.capacity_ - this.size_;
    if (available >= min_capacity) {
      result_capacity[0] = available;
      return (this.outbuf_ as Uint8Array).subarray(this.size_, this.capacity_);
    }
    result_capacity[0] = scratch_capacity;
    return scratch;
  }
  /** Original actual byte count. @returns Written units. */
  NumberOfBytesWritten(): number {
    return this.size_;
  }
  /** Original attempted count, saturated at INT32_MAX. @returns Appended units. */
  NumberOfBytesAppended(): number {
    return this.appended_;
  }
  /** Original sticky overflow state. @returns Overflowed. */
  Overflowed(): boolean {
    return this.overflowed_;
  }
}
/** Materializes the full ByteSink default-method contract for existing immutable counted-string projections. Real ByteSink owners retain their identity and direct buffer protocol. */
class StringSinkProjection extends ByteSink {
  /** Borrows the logical append owner. @param target - Counted-string sink. @returns Adapter. */
  constructor(private readonly target: ByteStringSink) {
    super();
  }
  /** Copies only the source-counted view to the immutable-string projection; full native sinks bypass this adapter. @param bytes - Narrow span/pointer. @param n - Optional count. @returns Nothing. */
  Append(bytes: string | Uint8Array | null, n?: number): void {
    n = n === undefined ? (bytes as string).length : n | 0;
    if (n <= 0) return;
    let text = "";
    if (typeof bytes === "string") text = bytes.slice(0, n);
    else
      for (let i = 0; i < n; ++i) text += String.fromCharCode((bytes as Uint8Array)[i] as number);
    this.target.Append(text);
  }
}
/** Original virtual/default ByteSink behavior across the counted-string platform projection. @param sink - Actual native-shaped owner or immutable projection. @returns Full sink. */
export function asByteSink(sink: ByteStringSink): ByteSink {
  return sink instanceof ByteSink ? sink : new StringSinkProjection(sink);
}
