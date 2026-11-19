/** @fileoverview Consumed public low-level pako2.1.0 zlib declarations, audited against the installed package. Internal compression state is neither declared nor accessed. */
declare module "pako/lib/zlib/zstream.js" {
  /** Actual library z_stream constructor and public zlib IO/counter fields. */
  export default class ZStream {
    input: Uint8Array | null;
    output: Uint8Array | null;
    next_in: number;
    next_out: number;
    avail_in: number;
    avail_out: number;
    total_in: number;
    total_out: number;
  }
}
declare module "pako/lib/zlib/deflate.js" {
  import type ZStream from "pako/lib/zlib/zstream.js";
  /** Actual consumed library exports; no reset is synthesized from end/init. */
  const api: {
    deflateInit2(
      stream: ZStream,
      level: number,
      method: number,
      windowBits: number,
      memoryLevel: number,
      strategy: number,
    ): number;
    deflate(stream: ZStream, flush: number): number;
    deflateSetDictionary(stream: ZStream, dictionary: Uint8Array): number;
    deflateReset(stream: ZStream): number;
    deflateEnd(stream: ZStream): number;
  };
  export default api;
}
declare module "pako" {
  /** Actual independent high-level library inflater used by the browser probe. @param input - Raw DEFLATE stream. @returns Decoded bytes. */
  export function inflateRaw(input: Uint8Array): Uint8Array;
}
