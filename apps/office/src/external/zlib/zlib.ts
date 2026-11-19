/** @fileoverview Low-level zlib ABI adapter for the already installed zip.js2.24.0 public WASM artifact. Actual inflate state/allocator/status/consumption remain in that library; no JS DEFLATE replacement or host stream provider. The library has a bounded native heap and packed24-bit output counts; logical source requests use bounded native IO windows. */
/// <reference lib="dom" />
import wasmUrl from "@zip.js/zip.js/dist/zip-module.wasm?url&inline";
/** Actual library WASM exports consumed by the synchronous source binding. */
interface ZlibExports {
  memory: WebAssembly.Memory;
  malloc(size: number): number;
  free(pointer: number): void;
  inflate_new(): number;
  inflate_init(handle: number): number;
  inflate_init_raw(handle: number): number;
  inflate_process(
    handle: number,
    input: number,
    inputLength: number,
    output: number,
    outputLength: number,
    flush: number,
  ): number;
  inflate_last_consumed(handle: number): number;
  inflate_end(handle: number): number;
}
let module: ZlibExports | undefined;
let loading: Promise<void> | undefined;
/** Initializes the actual installed library once per realm. Test bytes must be the same bundled artifact, never a substitute implementation. @param bytes - Optional actual artifact bytes for non-browser bootstrap. @returns Initialization. */
export function initializeZlib(bytes?: Uint8Array): Promise<void> {
  return (loading ??= (
    /** Loads the actual bundled WASM exports once per realm. @returns Initialization. */ async () => {
      const binary = bytes ?? new Uint8Array(await (await fetch(wasmUrl)).arrayBuffer());
      const result = await WebAssembly.instantiate(binary as BufferSource);
      module = result.instance.exports as unknown as ZlibExports;
    }
  )());
}
/** Borrows only the actual initialized artifact. @returns Native library exports. */
function api(): ZlibExports {
  if (!module) throw new Error("zlib must be initialized before synchronous inflate");
  return module;
}
/** Mechanical native return values, not a decoded document/archive record. */
export type InflateResult = { code: number; consumed: number; produced: number };
/** Actual library stream handle. Unlike JS byte arrays, this allocation belongs to the native WASM library. */
export class InflateState {
  private readonly z = api();
  private handle: number;
  readonly status: number;
  /** Original -MAX_WBITS/MAX_WBITS initialization choice. @param raw - Raw DEFLATE. @returns Native state. */
  constructor(raw: boolean) {
    this.handle = this.z.inflate_new();
    this.status = raw ? this.z.inflate_init_raw(this.handle) : this.z.inflate_init(this.handle);
  }
  /** Calls actual zlib with original Z_PARTIAL_FLUSH and copies written bytes even when zlib reports error. @param input - Actual input pointer bytes. @param output - Actual output pointer span. @returns Native status and counters. */
  inflate(input: Uint8Array, output: Uint8Array): InflateResult {
    const z = this.z,
      source = z.malloc(Math.max(1, Math.min(input.length, 65536))),
      target = z.malloc(Math.max(1, Math.min(output.length, 65536)));
    if (!source || !target) {
      if (source) z.free(source);
      if (target) z.free(target);
      throw new Error("std::bad_alloc");
    }
    let consumed = 0,
      produced = 0,
      code: number;
    try {
      for (;;) {
        const capacity = Math.min(output.length - produced, 65536),
          inputCount = Math.min(input.length - consumed, 65536);
        new Uint8Array(z.memory.buffer).set(
          input.subarray(consumed, consumed + inputCount),
          source,
        );
        const result = z.inflate_process(this.handle, source, inputCount, target, capacity, 1);
        const status = result >> 24,
          written = result & 0xffffff,
          used = z.inflate_last_consumed(this.handle);
        output.set(new Uint8Array(z.memory.buffer, target, written), produced);
        // An extra bounded call after progress may report BUF_ERROR without changing state;
        // the original single larger call reports OK for that same completed progress.
        if (produced && status === -5 && !written && !used) {
          code = 0;
          break;
        }
        code = status;
        consumed += used;
        produced += written;
        if (code !== 0 || !capacity || produced === output.length) break;
        if (written !== capacity && !(used === inputCount && consumed < input.length)) break;
      }
      return { code, consumed, produced };
    } finally {
      z.free(target);
      z.free(source);
    }
  }
  /** Original library end frees the actual stream allocation; JS array lifetime remains GC-managed. @returns Nothing. */
  end(): void {
    if (this.handle) {
      this.z.inflate_end(this.handle);
      this.handle = 0;
    }
  }
}
