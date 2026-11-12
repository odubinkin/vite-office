/** @fileoverview Existing browser package-string I/O boundary over the actual native OSequenceOutputStream. XML encoding/state belongs exclusively to the registered source Writer; this owner only transports its UTF8 bytes. */
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OSequenceOutputStream } from "../streaming/seqstream";
/** One native output lifetime for a string-returning package boundary. */
export class SaxStringOutput {
  private readonly bytes = new (Sequence.specialize<number>("sal_Int8", 1))();
  readonly stream = new Reference(new OSequenceOutputStream(this.bytes));
  /** Reads actual source-produced bytes after successful output completion. @returns Existing package string result. */
  getXml(): string {
    const values = this.bytes.getConstArray() as SequenceElements,
      data = new Uint8Array(this.bytes.getLength());
    for (let i = 0; i < data.length; ++i) data[i] = (values.get(i) as [number])[0];
    return new TextDecoder().decode(data);
  }
  /** Releases stream before its borrowed sequence, including exceptional construction/export paths. @returns Nothing. */
  dispose(): void {
    this.stream.dispose();
    this.bytes.dispose();
  }
}
