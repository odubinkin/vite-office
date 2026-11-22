/** @fileoverview Original Writer paragraph line-number item from fmtline.hxx and atrfrm.cxx. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { CONVERT_TWIPS, SfxPoolItem } from "../../svl/inc/poolitem";
import { RES_LINENUMBER } from "./hintids";
import { MID_LINENUMBER_COUNT, MID_LINENUMBER_STARTVALUE } from "./unomid";

/** Serialized paragraph line numbering. Older snapshots contain only the count boolean. */
export interface SwFormatLineNumberValue {
  readonly count: boolean;
  readonly startValue: number;
}

/** The native independent 24-bit start value and participation flag. */
export class SwFormatLineNumber extends SfxPoolItem {
  private startValue = 0;
  /** Creates the native default or its supplied value. @param count - Whether lines participate. @param startValue - Zero for continuation. @returns New line-number item. */
  constructor(
    private count = true,
    startValue = 0,
  ) {
    super(RES_LINENUMBER);
    this.SetStartValue(startValue);
  }

  /** Returns the stored unsigned 24-bit start. @returns Start or zero. */
  public GetStartValue(): number {
    return this.startValue;
  }

  /** Stores the value in its original bit-field width. @param value - Starting value. @returns Nothing. */
  public SetStartValue(value: number): void {
    this.startValue = value & 0xffffff;
  }

  /** Returns whether to count this paragraph's lines. @returns Participation flag. */
  public IsCount(): boolean {
    return this.count;
  }

  /** Stores the independent count flag. @param count - Native participation. @returns Nothing. */
  public SetCountLines(count: boolean): void {
    this.count = count;
  }

  /** Returns a copy retaining both values. @returns Owned item. */
  public override Clone(): SwFormatLineNumber {
    return new SwFormatLineNumber(this.count, this.startValue);
  }

  /** Compares both of the native fields. @param other - Candidate pool item. @returns Equality. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatLineNumber &&
      other.startValue === this.startValue &&
      other.count === this.count
    );
  }

  /** Returns both fields for browser snapshots. @returns Serialized line numbering. */
  public override QueryValue(): SwFormatLineNumberValue;
  /** Exchanges a native UNO member. @param output - UNO destination. @param member - Native member with optional twip flag. @returns Whether the UNO member exists. */
  public override QueryValue(output: Any, member: number): boolean;
  /** Returns the browser snapshot payload or a native UNO member. @param output - Optional UNO destination. @param member - Native member with optional twip flag. @returns Snapshot or whether the UNO member exists. */
  public override QueryValue(
    output?: Any,
    member = MID_LINENUMBER_COUNT,
  ): SwFormatLineNumberValue | boolean {
    if (!output) return { count: this.count, startValue: this.startValue };
    switch (member & ~CONVERT_TWIPS) {
      case MID_LINENUMBER_COUNT:
        output.insert([this.count], "bool");
        return true;
      case MID_LINENUMBER_STARTVALUE:
        output.insert([this.startValue], "sal_Int32");
        return true;
      default:
        return false;
    }
  }

  /** Imports the original typed UNO field. @param input - UNO input. @param member - Native member with optional twip flag. @returns Whether the field was accepted. */
  public override PutValue(input: unknown, member: number): boolean {
    if (!(input instanceof Any)) return false;
    switch (member & ~CONVERT_TWIPS) {
      case MID_LINENUMBER_COUNT: {
        const count: [boolean] = [true];
        if (!input.extract(count, "bool")) return false;
        this.SetCountLines(count[0]);
        return true;
      }
      case MID_LINENUMBER_STARTVALUE: {
        const start: [number] = [0];
        if (!input.extract(start, "sal_Int32")) return false;
        this.SetStartValue(start[0]);
        return true;
      }
      default:
        return false;
    }
  }
}
