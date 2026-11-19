/** @fileoverview Original consumed zlib ABI over the pinned existing pako JS implementation. Uses actual z_stream/public IO/reset/end APIs; never reads private compression state or injects counters. */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- Ambient external-module declarations are a script; importing them as a module produces TS2306.
/// <reference path="./pako.d.ts" />
import zlib from "pako/lib/zlib/deflate.js";
import ZStream from "pako/lib/zlib/zstream.js";
/** Actual zlib return code and remaining IO extents. */
export interface DeflateResult {
  code: number;
  remainingIn: number;
  remainingOut: number;
}
/** Actual library stream state. VM owns its arrays; this is not another DEFLATE encoder. */
export class DeflateState {
  private readonly stream = new ZStream();
  readonly status: number;
  /** Original deflateInit2 defaults, including MAX_WBITS15, memory level8 and strategy0. @param level - Source compression level. @param raw - Original nowrap flag. @returns Library state. */
  constructor(level: number, raw: boolean) {
    this.status = zlib.deflateInit2(this.stream, level, 8, raw ? -15 : 15, 8, 0);
  }
  /** Selected wasm32 zlib uLong projection; source Deflater owns its original independent64-bit overflow accumulators. @returns Actual counter low word. */
  get total_in(): number {
    return this.stream.total_in >>> 0;
  }
  /** Selected wasm32 zlib uLong projection. @returns Actual counter low word. */
  get total_out(): number {
    return this.stream.total_out >>> 0;
  }
  /** Actual deflate call over public z_stream fields. @param input - Initialized source span. @param output - Writable result span. @param finish - Finish, sync flush, or normal continuation. @returns Status and remaining counts. */
  deflate(input: Uint8Array, output: Uint8Array, finish: boolean | "sync"): DeflateResult {
    const stream = this.stream;
    stream.input = input;
    stream.next_in = 0;
    stream.avail_in = input.length;
    stream.output = output;
    stream.next_out = 0;
    stream.avail_out = output.length;
    const code = zlib.deflate(stream, finish === "sync" ? 2 : finish ? 4 : 0);
    return { code, remainingIn: stream.avail_in, remainingOut: stream.avail_out };
  }
  /** Sets the initial history for a fresh stream. @param dictionary - End of the preceding input block. @returns Actual library status. */
  setDictionary(dictionary: Uint8Array): number {
    return zlib.deflateSetDictionary(this.stream, dictionary);
  }
  /** Calls the actual deflateReset on the same public z_stream. @returns Actual library status. */
  reset(): number {
    return zlib.deflateReset(this.stream);
  }
  /** Calls the actual deflateEnd. VM storage follows normal library ownership. @returns Actual status. */
  end(): number {
    return zlib.deflateEnd(this.stream);
  }
}
