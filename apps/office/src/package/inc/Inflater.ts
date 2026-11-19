/** @fileoverview Original include/package/Inflater.hxx Sequence inflater contract. */
import type { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
/** Original abstract inflater consumed by XUnbufferedStream. */
export abstract class Inflater {
  /** Original input assignment. @param buffer - Actual native bytes. @returns Nothing. */
  abstract setInput(buffer: Sequence<number>): void;
  /** Original dictionary status. @returns Status. */
  abstract needsDictionary(): boolean;
  /** Original end status. @returns Status. */
  abstract finished(): boolean;
  /** Original checked output segment. @param buffer - Actual output. @param offset - Offset. @param length - Count. @returns Produced bytes. */
  abstract doInflateSegment(buffer: Sequence<number>, offset: number, length: number): number;
  /** Original native stream release. @returns Nothing. */
  abstract end(): void;
  /** Original last error. @returns Status. */
  abstract getLastInflateError(): number;
}
