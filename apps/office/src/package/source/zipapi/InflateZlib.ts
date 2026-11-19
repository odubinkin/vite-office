/** @fileoverview Original InflateZlib.cxx status/counter/Sequence behavior with the installed actual zlib WASM engine. The external ABI adapter marshals bytes without changing the source inflater state machine. */
import { Inflater } from "../../inc/Inflater";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { InflateState } from "../../../external/zlib/zlib";
/** Original ZipUtils::InflateZlib. */
export class InflateZlib extends Inflater {
  private bFinished = false;
  private bNeedDict = false;
  private nOffset = 0;
  private nLength = 0;
  private nLastInflateError = 0;
  private readonly sInBuffer = new (Sequence.specialize<number>("sal_Int8", 1))();
  private pStream: InflateState | null;
  /** Original native initialization/error switch. @param noWrap - Source raw DEFLATE choice. @returns Inflater. */
  constructor(noWrap: boolean) {
    super();
    this.pStream = new InflateState(noWrap);
    if (this.pStream.status === -4 || this.pStream.status === -2) {
      this.pStream.end();
      this.pStream = null;
    }
  }
  /** Original default destructor invokes end then destroys the Sequence member. @returns Nothing. */
  dispose(): void {
    this.end();
    this.sInBuffer.dispose();
  }
  /** Original Sequence assignment retains source value/COW semantics. @param buffer - Native input. @returns Nothing. */
  override setInput(buffer: Sequence<number>): void {
    this.sInBuffer.assign(buffer);
    this.nOffset = 0;
    this.nLength = buffer.getLength();
  }
  /** Original dictionary bit. @returns State. */
  override needsDictionary(): boolean {
    return this.bNeedDict;
  }
  /** Original finished bit. @returns State. */
  override finished(): boolean {
    return this.bFinished;
  }
  /** Original last inflate result. @returns Status. */
  override getLastInflateError(): number {
    return this.nLastInflateError;
  }
  /** Original segment guard leaves state/error untouched on invalid range. @param buffer - Native output. @param offset - Signed32 offset. @param length - Signed32 count. @returns Produced bytes. */
  override doInflateSegment(buffer: Sequence<number>, offset: number, length: number): number {
    if (offset < 0 || length < 0 || offset + length > buffer.getLength()) return 0;
    return this.doInflateBytes(buffer, offset, length);
  }
  /** Original end leaves status/finished/dictionary members unchanged. @returns Nothing. */
  override end(): void {
    if (this.pStream) {
      this.pStream.end();
      this.pStream = null;
    }
  }
  /** Original pointer/counter/status switch; byte marshalling is the ABI lowering for actual Sequence address cells. @param buffer - Actual native output. @param offset - Output displacement. @param length - Output capacity. @returns Source produced count. */
  private doInflateBytes(buffer: Sequence<number>, offset: number, length: number): number {
    if (!this.pStream) {
      this.nLastInflateError = -2;
      return 0;
    }
    this.nLastInflateError = 0;
    const source = this.sInBuffer.getConstArray() as SequenceElements,
      target = buffer.getArray() as SequenceElements;
    const input = new Uint8Array(this.nLength),
      output = new Uint8Array(length);
    for (let i = 0; i < input.length; ++i) input[i] = (source.get(this.nOffset + i) as [number])[0];
    // A native zlib call may write output before an error; preserve those writes too.
    const result = this.pStream.inflate(input, output);
    for (let i = 0; i < result.produced; ++i)
      (target.get(offset + i) as [number])[0] = ((output[i] as number) << 24) >> 24;
    if (result.code === 1) this.bFinished = true;
    switch (result.code) {
      case 1:
      case 0:
        this.nOffset += result.consumed;
        this.nLength -= result.consumed;
        return result.produced;
      case 2:
        this.bNeedDict = true;
        this.nOffset += result.consumed;
        this.nLength -= result.consumed;
        return 0;
      default:
        if (this.nLength && length) this.nLastInflateError = result.code;
    }
    return 0;
  }
}
