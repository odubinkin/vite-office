/** @fileoverview LibreOffice block DEFLATE with one execution lane in the current JavaScript realm. */
import type { ReferenceConstParameter } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { DeflateState } from "../../../external/zlib/deflate";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";

const MaxBlockSize = 128 * 1024;
const WindowSize = 32 * 1024;
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original callback receiving a byte sequence and the number of valid bytes. */
type ProcessBuffer = (buffer: Sequence<number>, length: number) => void;

/** Original raw DEFLATE blocks with the previous block's final 32 KiB as dictionary. */
export class ThreadedDeflater {
  totalIn = 0n;
  totalOut = 0n;

  /** Initializes the block compression level. @param level - Original zlib compression level. @returns Deflater. */
  constructor(private readonly level: number) {}

  /** Compresses and emits each block in input order. @param input - Actual stream. @param processInput - Plaintext callback. @param processOutput - Compressed output callback. @returns Nothing. */
  deflateWrite(
    input: ReferenceConstParameter<XInputStream>,
    processInput: ProcessBuffer,
    processOutput: ProcessBuffer,
  ): void {
    const source = input.operatorStar();
    const buffer = new Bytes(MaxBlockSize);
    let dictionary: Uint8Array | undefined;
    try {
      while (source.available() > 0) {
        const count = source.readBytes(buffer, MaxBlockSize);
        if (count <= 0) throw new Error("ZIP input made no progress during block compression");
        processInput(buffer, count);
        this.totalIn += BigInt(count);

        const fields = buffer.getConstArray() as SequenceElements;
        const block = new Uint8Array(count);
        for (let i = 0; i < count; ++i) block[i] = (fields.get(i) as [number])[0];

        const last = source.available() <= 0;
        const compressed = this.deflateBlock(block, dictionary, last);
        const output = new Bytes(compressed.length);
        try {
          const target = output.getArray() as SequenceElements;
          for (let i = 0; i < compressed.length; ++i)
            (target.get(i) as [number])[0] = (Number(compressed[i]) << 24) >> 24;
          processOutput(output, compressed.length);
          this.totalOut += BigInt(compressed.length);
        } finally {
          output.dispose();
        }
        if (!last) dictionary = block.subarray(Math.max(0, block.length - WindowSize));
      }
    } finally {
      buffer.dispose();
    }
  }

  /** Deflates one block with the original byte-aligned flush. @param block - Input bytes. @param dictionary - Previous window, when present. @param last - True for the final block. @returns Compressed block. */
  private deflateBlock(
    block: Uint8Array,
    dictionary: Uint8Array | undefined,
    last: boolean,
  ): Uint8Array {
    const stream = new DeflateState(this.level, true);
    if (stream.status !== 0) throw new Error(`Could not initialize ZIP DEFLATE (${stream.status})`);
    try {
      if (dictionary && stream.setDictionary(dictionary) !== 0)
        throw new Error("Could not initialize ZIP DEFLATE dictionary");
      // zlib's default-window/default-memory bound, including the source's 20 bytes for sync flush.
      const size = block.length;
      const output = new Uint8Array(size + (size >>> 12) + (size >>> 14) + (size >>> 25) + 33);
      const result = stream.deflate(block, output, last ? true : "sync");
      if (result.code !== (last ? 1 : 0) || result.remainingIn !== 0 || result.remainingOut === 0)
        throw new Error(`Could not deflate ZIP block (${result.code})`);
      return output.subarray(0, output.length - result.remainingOut);
    } finally {
      stream.end();
    }
  }
}
