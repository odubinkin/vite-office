/** @fileoverview Owns the native LR item declared by include/editeng/lrspitem.hxx and implemented in editeng/source/items/frmitems.cxx; font-relative indent values remain unrepresented. */
import { SfxPoolItem } from "../../svl/source/items/poolitem";
import { roundBorderMetric } from "../source/items/borderline";

/** Original LR frame spacing item, retaining native context and signed twip layout values. */
export class SvxLRSpaceItem extends SfxPoolItem {
  private left = 0;
  private right = 0;
  private firstLine = 0;
  private propLeft = 100;
  private propRight = 100;
  private propFirstLine = 100;
  private gutter = 0;
  private rightGutter = 0;
  private autoFirst = false;
  private explicitLeft = false;
  private explicitRight = false;
  /** Creates original zero margins,100 proportions and false flags. @param which - Native identity. @returns Nothing. */
  public constructor(which: number) {
    super(which);
  }
  /** Sets layout left, without altering first-line context or explicit-left flag. @param value - Twips. @param proportion - Native percentage. @returns Nothing. */
  public SetLeft(value: number, proportion = 100): void {
    this.left = (value * proportion) / 100;
    this.propLeft = proportion;
  }
  /** Sets signed right and sticky explicit-zero flag. @param value - Twips. @param proportion - Native percentage. @returns Nothing. */
  public SetRight(value: number, proportion = 100): void {
    if (value === 0) this.explicitRight = true;
    this.right = (value * proportion) / 100;
    this.propRight = proportion;
  }
  /** Reads the native stored left twip measure. @returns Measure. */
  public GetLeft(): number {
    return this.left;
  }
  /** Reads the native stored right twip measure. @returns Measure. */
  public GetRight(): number {
    return this.right;
  }
  /** Resolves native signed left twips. @returns Twips. */
  public ResolveLeft(): number {
    return this.Resolve(this.left);
  }
  /** Resolves native signed right twips. @returns Twips. */
  public ResolveRight(): number {
    return this.Resolve(this.right);
  }
  /** Resolves represented native signed rounding. @param value - Twip measure. @returns Rounded twips. */
  private Resolve(value: number): number {
    return value < 0 ? -Math.round(-value) : Math.round(value);
  }
  /** Reads left proportion. @returns Percentage. */
  public GetPropLeft(): number {
    return this.propLeft;
  }
  /** Reads right proportion. @returns Percentage. */
  public GetPropRight(): number {
    return this.propRight;
  }
  /** Reads automatic first-line context. @returns Flag. */
  public IsAutoFirst(): boolean {
    return this.autoFirst;
  }
  /** Sets automatic context. @param value - Flag. @returns Nothing. */
  public SetAutoFirst(value: boolean): void {
    this.autoFirst = value;
  }
  /** Reads explicit zero left. @returns Flag. */
  public IsExplicitZeroMarginValLeft(): boolean {
    return this.explicitLeft;
  }
  /** Reads explicit zero right. @returns Flag. */
  public IsExplicitZeroMarginValRight(): boolean {
    return this.explicitRight;
  }
  /** Sets explicit left flag. @param value - Flag. @returns Nothing. */
  public SetExplicitZeroMarginValLeft(value: boolean): void {
    this.explicitLeft = value;
  }
  /** Sets explicit right flag. @param value - Flag. @returns Nothing. */
  public SetExplicitZeroMarginValRight(value: boolean): void {
    this.explicitRight = value;
  }
  /** Sets text left and includes an existing hanging first-line offset. @param value - Twips. @param proportion - Percentage. @returns Nothing. */
  public SetTextLeft(value: number, proportion = 100): void {
    if (value === 0) this.explicitLeft = true;
    this.SetLeft(value, proportion);
    if (this.firstLine < 0) this.left = this.ResolveLeft() + this.ResolveTextFirstLineOffset();
  }
  /** Reads text left without its hanging first-line offset. @returns Twip measure. */
  public GetTextLeft(): number {
    return this.firstLine < 0 ? this.ResolveLeft() - this.ResolveTextFirstLineOffset() : this.left;
  }
  /** Resolves signed text-left twips. @returns Twips. */
  public ResolveTextLeft(): number {
    return this.Resolve(this.GetTextLeft());
  }
  /** Changes first line while preserving the previous text-left origin. @param value - Twips. @param proportion - Percentage. @returns Nothing. */
  public SetTextFirstLineOffset(value: number, proportion = 100): void {
    if (this.firstLine < 0) this.left = this.ResolveLeft() - this.ResolveTextFirstLineOffset();
    this.firstLine = (value * proportion) / 100;
    this.propFirstLine = proportion;
    if (this.firstLine < 0) this.left = this.ResolveLeft() + this.ResolveTextFirstLineOffset();
  }
  /** Reads first-line measure. @returns Measure. */
  public GetTextFirstLineOffset(): number {
    return this.firstLine;
  }
  /** Resolves signed first-line twips. @returns Twips. */
  public ResolveTextFirstLineOffset(): number {
    return this.Resolve(this.firstLine);
  }
  /** Sets the independent first-line proportion metadata. @param value - Percentage. @returns Nothing. */
  public SetPropTextFirstLineOffset(value: number): void {
    this.propFirstLine = value;
  }
  /** Reads first-line percentage. @returns Percentage. */
  public GetPropTextFirstLineOffset(): number {
    return this.propFirstLine;
  }
  /** Sets gutter. @param value - Twips. @returns Nothing. */
  public SetGutterMargin(value: number): void {
    this.gutter = value;
  }
  /** Reads gutter. @returns Twips. */
  public GetGutterMargin(): number {
    return this.gutter;
  }
  /** Sets mirrored-page gutter. @param value - Twips. @returns Nothing. */
  public SetRightGutterMargin(value: number): void {
    this.rightGutter = value;
  }
  /** Reads mirrored gutter. @returns Twips. */
  public GetRightGutterMargin(): number {
    return this.rightGutter;
  }
  /** Copies all eleven original fields independently. @returns Original item clone. */
  public Clone(): SvxLRSpaceItem {
    return Object.assign(new SvxLRSpaceItem(this.Which()), this);
  }
  /** Compares native identity and all context fields. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxLRSpaceItem &&
      other.Which() === this.Which() &&
      this.left === other.left &&
      this.right === other.right &&
      this.firstLine === other.firstLine &&
      this.propLeft === other.propLeft &&
      this.propRight === other.propRight &&
      this.propFirstLine === other.propFirstLine &&
      this.gutter === other.gutter &&
      this.rightGutter === other.rightGutter &&
      this.autoFirst === other.autoFirst &&
      this.explicitLeft === other.explicitLeft &&
      this.explicitRight === other.explicitRight
    );
  }
  /** Queries represented native twip-backed UNO members. @param member - Native member and conversion flag. @returns Member value or unsupported font-unit/unknown member. */
  public QueryValue(member = 0): unknown {
    const convert = (member & 0x80) !== 0;
    const metric =
      /** Converts resolved integer twip measures. @param value - Twips. @returns Native measure. */
      (value: number): number =>
        convert ? Math.trunc((value * 127 + (value >= 0 ? 36 : -36)) / 72) : value;
    const absolute =
      /** Converts the original double measure before native llround. @param value - Original twips. @returns Rounded UNO integer. */
      (value: number): number => roundBorderMetric(value, convert ? 127 / 72 : 1);
    switch (member & ~0x80) {
      case 0:
        return {
          Left: metric(this.ResolveLeft()),
          TextLeft: metric(this.ResolveTextLeft()),
          Right: metric(this.ResolveRight()),
          ScaleLeft: (this.propLeft << 16) >> 16,
          ScaleRight: (this.propRight << 16) >> 16,
          FirstLine: metric(this.ResolveTextFirstLineOffset()),
          ScaleFirstLine: (this.propFirstLine << 16) >> 16,
          AutoFirstLine: this.IsAutoFirst(),
        };
      case 4:
        return absolute(this.GetLeft());
      case 5:
        return absolute(this.GetRight());
      case 6:
        return (this.propLeft << 16) >> 16;
      case 7:
        return (this.propRight << 16) >> 16;
      case 8:
        return absolute(this.GetTextFirstLineOffset());
      case 9:
        return (this.propFirstLine << 16) >> 16;
      case 10:
        return this.IsAutoFirst();
      case 11:
        return absolute(this.GetTextLeft());
      case 12:
        return metric(this.GetGutterMargin());
      default:
        return undefined;
    }
  }
  /** Applies represented native UNO values with source ordering and unsigned proportion storage. @param value - UNO member payload. @param member - Native member and conversion flag. @returns Whether admitted and applied. */
  public PutValue(value: unknown, member = 0): boolean {
    const convert = (member & 0x80) !== 0;
    const id = member & ~0x80;
    const integer =
      /** Admits the represented native signed32 Any. @param field - UNO field. @returns Whether a signed32 integer. */
      (field: unknown): field is number =>
        typeof field === "number" &&
        Number.isInteger(field) &&
        field >= -2147483648 &&
        field <= 2147483647;
    const metric =
      /** Converts signed mm100 to native twips. @param field - UNO measure. @returns Twips. */
      (field: number): number =>
        convert ? Math.trunc((field * 72 + (field >= 0 ? 63 : -63)) / 127) : field;
    if (id === 0) {
      if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
      const data = value as Record<string, unknown>;
      if (
        ![data.Left, data.TextLeft, data.Right, data.FirstLine].every(integer) ||
        ![data.ScaleLeft, data.ScaleRight, data.ScaleFirstLine].every(
          /** Admits native signed16 struct scale fields. @param field - UNO scale. @returns Whether signed16. */
          (field) => integer(field) && field >= -32768 && field <= 32767,
        ) ||
        typeof data.AutoFirstLine !== "boolean"
      )
        return false;
      this.SetLeft(metric(data.Left as number));
      this.SetTextLeft(metric(data.TextLeft as number));
      this.SetRight(metric(data.Right as number));
      this.propLeft = (data.ScaleLeft as number) & 0xffff;
      this.propRight = (data.ScaleRight as number) & 0xffff;
      this.SetTextFirstLineOffset(metric(data.FirstLine as number));
      this.SetPropTextFirstLineOffset((data.ScaleFirstLine as number) & 0xffff);
      this.SetAutoFirst(data.AutoFirstLine);
      return true;
    }
    if (id === 10) {
      this.SetAutoFirst(typeof value === "boolean" ? value : integer(value) && value !== 0);
      return true;
    }
    if (!integer(value)) return false;
    switch (id) {
      case 4:
        this.SetLeft(metric(value));
        break;
      case 5:
        this.SetRight(metric(value));
        break;
      case 6:
      case 7:
        if (value < 0 || value >= 65535) return false;
        if (id === 6) this.propLeft = value;
        else this.propRight = value;
        break;
      case 8:
        this.SetTextFirstLineOffset(metric(value));
        break;
      case 9:
        this.SetPropTextFirstLineOffset(value & 0xffff);
        break;
      case 11:
        this.SetTextLeft(metric(value));
        break;
      case 12:
        this.SetGutterMargin(metric(value));
        break;
      default:
        return false;
    }
    return true;
  }
}
