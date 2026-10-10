/** @fileoverview Owns the native LR item declared by include/editeng/lrspitem.hxx and implemented in editeng/source/items/frmitems.cxx; typed twip/font-relative indentation, native copy and represented UNO values retain source behavior. */
import { SfxPoolItem } from "../../svl/source/items/poolitem";
import { MeasureUnit } from "../../offapi/com/sun/star/util/MeasureUnit";
import { roundBorderMetric } from "../source/items/borderline";

/** Resolves original em/ic units with native zero/uninitialized defaults. */
export class SvxFontUnitMetrics {
  public m_dEmTwips = 0;
  public m_dIcTwips = 0;
  public m_bInitialized = false;
  /** Creates native default metrics. @returns Nothing. */
  public constructor();
  /** Creates initialized font metrics. @param em - Em twips. @param ic - CJK advance twips. @returns Nothing. */
  public constructor(em: number, ic: number);
  /** Stores native font metrics. @param em - Optional em twips. @param ic - Optional CJK advance. @returns Nothing. */
  public constructor(em?: number, ic?: number) {
    if (em !== undefined) {
      this.m_dEmTwips = em;
      this.m_dIcTwips = ic as number;
      this.m_bInitialized = true;
    }
  }
}
/** Original indentation measure with explicit native unit and no default constructor. */
export class SvxIndentValue {
  /** Stores a native double and signed16 unit. @param m_dValue - Original measure. @param m_nUnit - Native unit. @returns Nothing. */
  public constructor(
    public m_dValue: number,
    public m_nUnit: number,
  ) {
    this.m_nUnit = (m_nUnit << 16) >> 16;
  }
  /** Creates native twips. @param value - Original double. @returns Native measure. */
  public static twips(value: number): SvxIndentValue {
    return new SvxIndentValue(value, MeasureUnit.TWIP);
  }
  /** Creates native zero twips. @returns Native measure. */
  public static zero(): SvxIndentValue {
    return SvxIndentValue.twips(0);
  }
  /** Resolves native twip/em/ic doubles; unsupported units produce source zero. @param metrics - Original font context. @returns Resolved twips. */
  public ResolveDouble(metrics: SvxFontUnitMetrics): number {
    if (this.m_nUnit === MeasureUnit.TWIP) return this.m_dValue;
    switch (this.m_nUnit) {
      case MeasureUnit.FONT_EM:
        return this.m_dValue * metrics.m_dEmTwips;
      case MeasureUnit.FONT_CJK_ADVANCE:
        return this.m_dValue * metrics.m_dIcTwips;
      default:
        return 0;
    }
  }
  /** Resolves with native signed rounding. @param metrics - Font context. @returns Integer twips. */
  public Resolve(metrics: SvxFontUnitMetrics): number {
    return roundBorderMetric(this.ResolveDouble(metrics), 1) | 0;
  }
  /** Resolves only absolute twips. @returns Fixed part. */
  public ResolveFixedPart(): number {
    return this.m_nUnit === MeasureUnit.TWIP ? this.Resolve(new SvxFontUnitMetrics()) : 0;
  }
  /** Resolves only font-relative part. @param metrics - Font context. @returns Variable part. */
  public ResolveVariablePart(metrics: SvxFontUnitMetrics): number {
    return this.m_nUnit === MeasureUnit.TWIP ? 0 : this.Resolve(metrics);
  }
  /** Scales the native stored double without changing unit. @param scale - Factor. @returns Nothing. */
  public ScaleMetrics(scale: number): void {
    this.m_dValue *= scale;
  }
  /** Compares original native fields. @param other - Candidate measure. @returns Value equality. */
  public equals(other: ConstIndentValue): boolean {
    return this.m_dValue === other.m_dValue && this.m_nUnit === other.m_nUnit;
  }
}

/** Native const-reference type excludes the mutating metric method while retaining original resolution/value operations. */
type ConstIndentValue = Readonly<Omit<SvxIndentValue, "ScaleMetrics">>;

/** Original LR frame spacing item, retaining native context and signed twip layout values. */
export class SvxLRSpaceItem extends SfxPoolItem {
  private m_stLeftMargin = SvxIndentValue.zero();
  private m_stRightMargin = SvxIndentValue.zero();
  private m_stFirstLineOffset = SvxIndentValue.zero();
  private propLeft = 100;
  private propRight = 100;
  private propFirstLine = 100;
  private gutter = 0;
  private rightGutter = 0;
  private autoFirst = false;
  private explicitLeft = false;
  private explicitRight = false;
  /** Creates original defaults or an independent native copy.
   * @param source - Native identity or original LR item.
   * @returns Nothing. */
  public constructor(source: number | SvxLRSpaceItem);
  /** Creates native layout values with source constructor setter order. @param left - Layout left. @param right - Right measure. @param first - First-line measure. @param which - Identity. @returns Nothing. */
  public constructor(
    left: ConstIndentValue,
    right: ConstIndentValue,
    first: ConstIndentValue,
    which: number,
  );
  /** Initializes native default/value/copy constructor state. @param source - Identity, original item or left measure. @param right - Optional right. @param first - Optional first line. @param which - Value constructor identity. @returns Nothing. */
  public constructor(
    source: number | SvxLRSpaceItem | ConstIndentValue,
    right?: ConstIndentValue,
    first?: ConstIndentValue,
    which?: number,
  ) {
    super(
      typeof source === "number"
        ? source
        : source instanceof SvxLRSpaceItem
          ? source.Which()
          : (which as number),
    );
    if (source instanceof SvxLRSpaceItem) {
      Object.assign(this, source);
      this.m_stLeftMargin = new SvxIndentValue(
        source.m_stLeftMargin.m_dValue,
        source.m_stLeftMargin.m_nUnit,
      );
      this.m_stRightMargin = new SvxIndentValue(
        source.m_stRightMargin.m_dValue,
        source.m_stRightMargin.m_nUnit,
      );
      this.m_stFirstLineOffset = new SvxIndentValue(
        source.m_stFirstLineOffset.m_dValue,
        source.m_stFirstLineOffset.m_nUnit,
      );
    } else if (typeof source !== "number") {
      this.SetLeft(source);
      this.SetRight(right as ConstIndentValue);
      this.SetTextFirstLineOffset(first as ConstIndentValue);
    }
  }
  /** Sets layout left, without altering first-line context or explicit-left flag. @param value - Twips. @param proportion - Native percentage. @returns Nothing. */
  public SetLeft(value: ConstIndentValue, proportion = 100): void {
    this.propLeft = proportion & 0xffff;
    Object.assign(this.m_stLeftMargin, { m_dValue: value.m_dValue, m_nUnit: value.m_nUnit });
    if (this.propLeft !== 100)
      this.m_stLeftMargin.m_dValue = (value.m_dValue * this.propLeft) / 100;
  }
  /** Sets signed right and sticky explicit-zero flag. @param value - Twips. @param proportion - Native percentage. @returns Nothing. */
  public SetRight(value: ConstIndentValue, proportion = 100): void {
    if (value.m_dValue === 0) this.explicitRight = true;
    this.propRight = proportion & 0xffff;
    Object.assign(this.m_stRightMargin, { m_dValue: value.m_dValue, m_nUnit: value.m_nUnit });
    if (this.propRight !== 100)
      this.m_stRightMargin.m_dValue = (value.m_dValue * this.propRight) / 100;
  }
  /** Reads the native stored left twip measure. @returns Measure. */
  public GetLeft(): ConstIndentValue {
    return this.m_stLeftMargin;
  }
  /** Reads the native stored right twip measure. @returns Measure. */
  public GetRight(): ConstIndentValue {
    return this.m_stRightMargin;
  }
  /** Resolves native signed left twips. @returns Twips. */
  public ResolveLeft(): number {
    return this.m_stLeftMargin.Resolve(new SvxFontUnitMetrics());
  }
  /** Resolves native signed right twips. @param metrics - Native font context; prior empty context remains the default. @returns Twips. */
  public ResolveRight(metrics = new SvxFontUnitMetrics()): number {
    return this.m_stRightMargin.Resolve(metrics);
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
  public SetTextLeft(value: ConstIndentValue, proportion = 100): void {
    if (value.m_dValue === 0) this.explicitLeft = true;
    this.SetLeft(value, proportion);
    if (this.m_stFirstLineOffset.m_dValue < 0)
      Object.assign(
        this.m_stLeftMargin,
        SvxIndentValue.twips(this.ResolveLeft() + this.ResolveTextFirstLineOffset()),
      );
  }
  /** Reads text left without its hanging first-line offset. @returns Twip measure. */
  public GetTextLeft(): SvxIndentValue {
    return this.m_stFirstLineOffset.m_dValue < 0
      ? SvxIndentValue.twips(this.ResolveLeft() - this.ResolveTextFirstLineOffset())
      : new SvxIndentValue(this.m_stLeftMargin.m_dValue, this.m_stLeftMargin.m_nUnit);
  }
  /** Resolves signed text-left twips. @param metrics - Native font context; prior empty context remains the default. @returns Twips. */
  public ResolveTextLeft(metrics = new SvxFontUnitMetrics()): number {
    return this.m_stFirstLineOffset.m_dValue < 0
      ? this.m_stLeftMargin.Resolve(metrics) - this.ResolveTextFirstLineOffset(metrics)
      : this.m_stLeftMargin.Resolve(metrics);
  }
  /** Changes first line while preserving the previous text-left origin. @param value - Twips. @param proportion - Percentage. @returns Nothing. */
  public SetTextFirstLineOffset(value: ConstIndentValue, proportion = 100): void {
    const original = new SvxIndentValue(value.m_dValue, value.m_nUnit);
    if (this.m_stFirstLineOffset.m_dValue < 0)
      Object.assign(
        this.m_stLeftMargin,
        SvxIndentValue.twips(this.ResolveLeft() - this.ResolveTextFirstLineOffset()),
      );
    this.propFirstLine = proportion & 0xffff;
    Object.assign(this.m_stFirstLineOffset, {
      m_dValue: original.m_dValue,
      m_nUnit: original.m_nUnit,
    });
    if (this.propFirstLine !== 100)
      this.m_stFirstLineOffset.m_dValue = (original.m_dValue * this.propFirstLine) / 100;
    if (this.m_stFirstLineOffset.m_dValue < 0)
      Object.assign(
        this.m_stLeftMargin,
        SvxIndentValue.twips(this.ResolveLeft() + this.ResolveTextFirstLineOffset()),
      );
  }
  /** Reads first-line measure. @returns Measure. */
  public GetTextFirstLineOffset(): ConstIndentValue {
    return this.m_stFirstLineOffset;
  }
  /** Resolves signed first-line twips. @param metrics - Native font context; prior empty context remains the default. @returns Twips. */
  public ResolveTextFirstLineOffset(metrics = new SvxFontUnitMetrics()): number {
    return this.m_stFirstLineOffset.Resolve(metrics);
  }
  /** Sets the independent first-line proportion metadata. @param value - Percentage. @returns Nothing. */
  public SetPropTextFirstLineOffset(value: number): void {
    this.propFirstLine = value & 0xffff;
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
    return new SvxLRSpaceItem(this);
  }
  /** Compares native identity and all context fields. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxLRSpaceItem &&
      other.Which() === this.Which() &&
      this.m_stLeftMargin.equals(other.m_stLeftMargin) &&
      this.m_stRightMargin.equals(other.m_stRightMargin) &&
      this.m_stFirstLineOffset.equals(other.m_stFirstLineOffset) &&
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
        (convert ? Math.trunc((value * 127 + (value >= 0 ? 36 : -36)) / 72) : value) | 0;
    const absolute =
      /** Converts the original double measure before native llround. @param value - Original twips. @returns Rounded UNO integer. */
      (value: ConstIndentValue): number | undefined =>
        value.m_nUnit === MeasureUnit.TWIP
          ? roundBorderMetric(value.m_dValue, convert ? 127 / 72 : 1) | 0
          : undefined;
    const relative =
      /** Returns native double/signed16 pair only for relative units. @param value - Original indent. @returns Pair or unsupported absolute unit. */
      (value: ConstIndentValue): unknown =>
        value.m_nUnit === MeasureUnit.TWIP
          ? undefined
          : { First: value.m_dValue, Second: value.m_nUnit };
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
      case 13:
        return relative(this.GetTextFirstLineOffset());
      case 14:
        return relative(this.GetTextLeft());
      case 15:
        return relative(this.GetRight());
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
      this.SetLeft(SvxIndentValue.twips(metric(data.Left as number)));
      this.SetTextLeft(SvxIndentValue.twips(metric(data.TextLeft as number)));
      this.SetRight(SvxIndentValue.twips(metric(data.Right as number)));
      this.propLeft = (data.ScaleLeft as number) & 0xffff;
      this.propRight = (data.ScaleRight as number) & 0xffff;
      this.SetTextFirstLineOffset(SvxIndentValue.twips(metric(data.FirstLine as number)));
      this.SetPropTextFirstLineOffset((data.ScaleFirstLine as number) & 0xffff);
      this.SetAutoFirst(data.AutoFirstLine);
      return true;
    }
    if (id === 10) {
      this.SetAutoFirst(typeof value === "boolean" ? value : integer(value) && value !== 0);
      return true;
    }
    if (id === 13 || id === 14 || id === 15) {
      if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
      const pair = value as Record<string, unknown>;
      if (
        typeof pair.First !== "number" ||
        !integer(pair.Second) ||
        pair.Second < -32768 ||
        pair.Second > 32767
      )
        return false;
      const indent = new SvxIndentValue(pair.First, pair.Second);
      if (id === 13) this.SetTextFirstLineOffset(indent);
      else if (id === 14) this.SetTextLeft(indent);
      else this.SetRight(indent);
      return true;
    }
    if (!integer(value)) return false;
    switch (id) {
      case 4:
        this.SetLeft(SvxIndentValue.twips(metric(value)));
        break;
      case 5:
        this.SetRight(SvxIndentValue.twips(metric(value)));
        break;
      case 6:
      case 7:
        if (value < 0 || value >= 65535) return false;
        if (id === 6) this.propLeft = value;
        else this.propRight = value;
        break;
      case 8:
        this.SetTextFirstLineOffset(SvxIndentValue.twips(metric(value)));
        break;
      case 9:
        this.SetPropTextFirstLineOffset(value & 0xffff);
        break;
      case 11:
        this.SetTextLeft(SvxIndentValue.twips(metric(value)));
        break;
      case 12:
        this.SetGutterMargin(metric(value));
        break;
      default:
        return false;
    }
    return true;
  }
  /** Scales original measures without rescaling proportions, context or gutters. @param scale - Factor. @returns Nothing. */
  public ScaleMetrics(scale: number): void {
    this.m_stFirstLineOffset.ScaleMetrics(scale);
    this.m_stLeftMargin.ScaleMetrics(scale);
    this.m_stRightMargin.ScaleMetrics(scale);
  }
  /** Reports native metric support. @returns Always true. */
  public HasMetrics(): boolean {
    return true;
  }
}
