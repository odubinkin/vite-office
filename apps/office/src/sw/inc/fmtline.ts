/** @fileoverview Original Writer paragraph line-number item from fmtline.hxx. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { CONVERT_TWIPS, SfxPoolItem } from "../../svl/inc/poolitem";
import { RES_LINENUMBER } from "./hintids";
import { MID_LINENUMBER_COUNT, MID_LINENUMBER_STARTVALUE } from "./unomid";

/** Paragraph participation and its optional first line number share one pooled value. */
export class SwFormatLineNumber extends SfxPoolItem {
  private startValue: number;

  /** Creates the original default or copies its two members. @param countLines - Paragraph participation. @param startValue - Initial number, or zero for continuation. @returns Nothing. */
  constructor(
    private countLines = true,
    startValue = 0,
  ) {
    super(RES_LINENUMBER);
    this.startValue = startValue & 0xffffff;
  }

  /** Reads paragraph participation. @returns Whether its lines count. */
  IsCount(): boolean {
    return this.countLines;
  }

  /** Changes paragraph participation. @param count - Whether to count. @returns Nothing. */
  SetCountLines(count: boolean): void {
    this.countLines = count;
  }

  /** Reads the original 24-bit restart value. @returns First line number or zero. */
  GetStartValue(): number {
    return this.startValue;
  }

  /** Assigns the native unsigned 24-bit field. @param start - New start value. @returns Nothing. */
  SetStartValue(start: number): void {
    this.startValue = start & 0xffffff;
  }

  /** Copies both native members. @returns Independent item. */
  override Clone(): SwFormatLineNumber {
    return new SwFormatLineNumber(this.countLines, this.startValue);
  }

  /** Compares both native members during pooling. @param other - Candidate item. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatLineNumber &&
      other.Which() === this.Which() &&
      other.countLines === this.countLines &&
      other.startValue === this.startValue
    );
  }

  /** Base no-payload query. @returns No untyped value. */
  override QueryValue(): undefined;
  /** Native UNO member query. @param output - Typed destination. @param member - Member identifier. @returns Success. */
  override QueryValue(output: Any, member?: number): boolean;
  /** Queries participation or restart through the corresponding UNO member. @param output - Typed destination. @param member - Member identifier. @returns Success when supplied. */
  override QueryValue(output?: Any, member = MID_LINENUMBER_COUNT): boolean | undefined {
    if (!output) return undefined;
    switch (member & ~CONVERT_TWIPS) {
      case MID_LINENUMBER_COUNT:
        output.insert([this.countLines], "bool");
        return true;
      case MID_LINENUMBER_STARTVALUE:
        output.insert([this.startValue], "sal_Int32");
        return true;
      default:
        return false;
    }
  }

  /** Applies the addressed UNO member after successful type extraction. @param value - Input value. @param member - Member identifier. @returns Success. */
  override PutValue(value: Any, member: number): boolean {
    switch (member & ~CONVERT_TWIPS) {
      case MID_LINENUMBER_COUNT: {
        const count: [boolean] = [false];
        if (!value.extract(count, "bool")) return false;
        this.SetCountLines(count[0]);
        return true;
      }
      case MID_LINENUMBER_STARTVALUE: {
        const start: [number] = [0];
        if (!value.extract(start, "sal_Int32")) return false;
        this.SetStartValue(start[0]);
        return true;
      }
      default:
        return false;
    }
  }
}
