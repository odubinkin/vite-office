/** @fileoverview Represents native integer-twip frame Style components and border conflict ordering. */
import {
  SvxBorderLine,
  SvxBorderLineStyle as LineStyle,
} from "../../../editeng/source/items/borderline";

/** Owns the represented frame style; primitive colors/ref modes and device scaling remain separate. */
export class Style {
  private primary = 0;
  private distance = 0;
  private secondary = 0;
  private color = 0;
  private type = LineStyle.SOLID;
  private wordTableCell = false;
  /** Captures native integer components without mutating the source line. @param border - Original native line. @returns Nothing. */
  public constructor(border?: SvxBorderLine) {
    if (border === undefined) return;
    this.type = border.GetBorderLineStyle();
    this.color = border.GetColor();
    const p = border.GetOutWidth(),
      d = border.GetDistance(),
      s = border.GetInWidth();
    this.primary = p || s;
    this.distance = p && s ? d : 0;
    this.secondary = p && d ? s : 0;
    if (s !== 0) {
      const total = Math.min(p + d + s, 65535);
      if (total > this.GetWidth()) this.distance = total - this.primary - this.secondary;
      while (this.GetWidth() > 65535) {
        if (this.distance !== 0) this.distance--;
        else if (this.primary === this.secondary) {
          this.primary--;
          this.secondary--;
        } else {
          this.primary--;
          if (this.GetWidth() > 65535) this.secondary--;
        }
      }
    }
  }
  /** Reads the primary native component. @returns Twips. */
  public Prim(): number {
    return this.primary;
  }
  /** Reads native inter-line distance. @returns Twips. */
  public Dist(): number {
    return this.distance;
  }
  /** Reads the secondary native component. @returns Twips. */
  public Secn(): number {
    return this.secondary;
  }
  /** Reads the complete normalized native width. @returns Twips. */
  public GetWidth(): number {
    return this.primary + this.distance + this.secondary;
  }
  /** Reads represented source color; native shading/theme colors remain unrepresented. @returns RGB. */
  public GetColorPrim(): number {
    return this.color;
  }
  /** Reads the original numeric line style. @returns Native style. */
  public Type(): LineStyle {
    return this.type;
  }
  /** Sets native Word cell comparison policy. @param value - Compatibility mode. @returns Nothing. */
  public SetWordTableCell(value: boolean): void {
    this.wordTableCell = value;
  }
  /** Mirrors source double components. @returns Nothing. */
  public MirrorSelf(): void {
    if (this.secondary !== 0) [this.primary, this.secondary] = [this.secondary, this.primary];
  }
  /** Copies complete represented style state. @returns Independent style. */
  public Clone(): Style {
    const copy = new Style();
    copy.primary = this.primary;
    copy.distance = this.distance;
    copy.secondary = this.secondary;
    copy.color = this.color;
    copy.type = this.type;
    copy.wordTableCell = this.wordTableCell;
    return copy;
  }
  /** Implements native operator< for represented integer components. @param other - Competing style. @returns Whether this style loses. */
  public lessThan(other: Style): boolean {
    if (this.wordTableCell) {
      const a = GetWordTableCellBorderWeight(this),
        b = GetWordTableCellBorderWeight(other);
      if (a !== b) return a < b;
    }
    const a = this.GetWidth(),
      b = other.GetWidth();
    if (a !== b) return a < b;
    if ((this.secondary === 0) !== (other.secondary === 0)) return this.secondary === 0;
    if (this.secondary !== 0 && other.secondary !== 0 && this.distance !== other.distance)
      return this.distance > other.distance;
    if (a === 1 && this.secondary === 0 && other.secondary === 0 && this.type !== other.type)
      return this.type > other.type;
    return false;
  }
}
/** Reads the exact native Word border weight for represented style IDs. @param style - Frame style. @returns Weight. */
export function GetWordTableCellBorderWeight(style: Style): number {
  if (style.Type() === LineStyle.NONE) return 0;
  if (style.Type() === LineStyle.DOTTED || style.Type() === LineStyle.DASHED) return 1;
  const numbers = [1, 0, 0, 3, 11, 14, 17, 12, 15, 18, 24, 25, 25, 27, 22, 3, 8, 9];
  return (numbers[style.Type()] ?? 0) * style.GetWidth();
}
