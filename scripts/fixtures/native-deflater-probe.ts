/** @fileoverview Actual pinned JS deflate through original kernel Deflater in main and DOM-free Worker. */
import { Deflater } from "../../apps/office/src/package/source/zipapi/Deflater";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { inflateRaw } from "pako";
/** Exercises tiny output, native COW and real reset without codec providers or private state. @returns Public observations. */
export function probeNativeDeflater() {
  const Bytes = Sequence.specialize<number>("sal_Int8", 1),
    input = new Bytes(64001),
    output = new Bytes(31),
    owner = new Deflater(-1, true);
  try {
    const fields = input.getArray() as SequenceElements;
    for (let i = 0; i < input.getLength(); ++i) (fields.get(i) as [number])[0] = (i << 24) >> 24;
    const sizes: number[] = [];
    for (let run = 0; run < 2; ++run) {
      owner.setInputSegment(input);
      owner.finish();
      const packed: number[] = [];
      let calls = 0;
      while (!owner.finished()) {
        if (++calls > 10000) throw new Error("deflate did not finish");
        const count = owner.doDeflateSegment(output, output.getLength()),
          cells = output.getConstArray() as SequenceElements;
        for (let i = 0; i < count; ++i) packed.push((cells.get(i) as [number])[0] & 255);
      }
      const actual = inflateRaw(Uint8Array.from(packed));
      if (
        actual.length !== 64001 ||
        actual.some(
          /** Verify every real decompressed byte. @param value - Decoded byte. @param index - Original offset. @returns Mismatch. */ (
            value,
            index,
          ) => value !== (index & 255),
        )
      )
        throw new Error("deflate content mismatch");
      sizes.push(Number(owner.getTotalIn()));
      if (owner.getTotalOut() !== BigInt(packed.length)) throw new Error("deflate totals mismatch");
      owner.reset();
      if (!owner.needsInput() || owner.finished() || owner.getTotalIn() !== 0n)
        throw new Error("deflate reset mismatch");
    }
    return { sizes, reset: true, content: true };
  } finally {
    owner.dispose();
    output.dispose();
    input.dispose();
  }
}
