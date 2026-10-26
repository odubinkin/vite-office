/** @fileoverview Source DigitGroupingIterator over LocaleDataWrapper's signed32 grouping sequence. */
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";

const Booleans = Sequence.specialize<[boolean]>("sal_Bool", 1);
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
const SAL_MAX_INT32 = 0x7fffffff;

/** Source right-to-left grouping cursor, including terminal repetition and overflow guard. */
export class DigitGroupingIterator {
  private readonly groupings: Sequence<[number]>;
  private group = 0;
  private digits = 3;
  private nextPos = 0;
  /** Copies the original grouping sequence as the C++ value member does. @param groupings - Borrowed grouping values.  @returns Constructed instance. */
  constructor(groupings: Sequence<[number]>) {
    this.groupings = new Integers(groupings);
    this.reset();
  }
  /** Source grouping values are clamped to zero when negative. @returns Current grouping or terminal zero. */
  private getGrouping(): number {
    if (this.group >= this.groupings.getLength()) return 0;
    return Math.max(0, this.groupings.operatorIndex(this.group)[0]);
  }
  /** Source signed32 overflow guard keeps the last representable insertion position. @returns Nothing. */
  private setPos(): void {
    if (this.nextPos <= SAL_MAX_INT32 - this.digits) this.nextPos += this.digits;
  }
  /** Source zero sentinel repeats the previous width forever. @returns Nothing. */
  private setDigits(): void {
    const previous = this.digits;
    this.digits = this.getGrouping();
    if (!this.digits) {
      this.digits = previous;
      this.group = this.groupings.getLength();
    }
    this.setPos();
  }
  /** Advances to the next group, repeating the terminal group. @returns This iterator. */
  advance(): this {
    if (this.group >= this.groupings.getLength()) this.setPos();
    else {
      this.group++;
      this.setDigits();
    }
    return this;
  }
  /** Obtains the positive current group width. @returns Digits per group. */
  get(): number {
    return this.digits;
  }
  /** Obtains the next insertion position from the integer's right edge. @returns Digit position. */
  getPos(): number {
    return this.nextPos;
  }
  /** Resets to the first group or the source three-digit empty-sequence fallback. @returns Nothing. */
  reset(): void {
    this.digits = 3;
    this.group = 0;
    this.nextPos = 0;
    this.setDigits();
  }
  /** Creates the source left-to-right separator-position sequence. @param integerDigits - Integer digit count. @param groupings - Borrowed grouping. @returns Owned boolean sequence. */
  static createForwardSequence(
    integerDigits: number,
    groupings: Sequence<[number]>,
  ): Sequence<[boolean]> {
    if (integerDigits <= 0) return new Booleans();
    const iterator = new DigitGroupingIterator(groupings),
      values = new Map<number, [boolean]>();
    try {
      for (let index = 0; --integerDigits >= 0; index++) {
        const grouped = index === iterator.getPos();
        values.set(integerDigits, [grouped]);
        if (grouped) iterator.advance();
      }
      return new Booleans(values, values.size);
    } finally {
      iterator.dispose();
    }
  }
  /** Releases the source value-copy sequence. @returns Nothing. */
  dispose(): void {
    this.groupings.dispose();
  }
}
