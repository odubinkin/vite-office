/** @fileoverview Consumed paper geometry handlers of SvxPageDescPage from page.cxx over original paper list, physical values and metric limits. Header/footer/border/printer services remain unrepresented. */
import { Paper } from "../../../i18nutil/inc/paper";
import { SvxPaperInfo } from "../../../editeng/inc/paperinf";
import { Size } from "../../../tools/inc/gen";
import { convert, Length } from "../../../o3tl/inc/unit_conversion";
import { SvxPaperSizeListBox, PaperSizeApp } from "../../../svx/inc/papersizelistbox";
/** Actual page geometry at the platform dialog boundary, with distances in Writer twips. */
export interface SvxPageGeometry {
  readonly width: number;
  readonly height: number;
  readonly landscape: boolean;
  readonly leftMargin: number;
  readonly rightMargin: number;
  readonly topMargin: number;
  readonly bottomMargin: number;
}
/** Source configuration values have cm paper and mm margin units. */
export interface PageFormatLimits {
  readonly widthCm: number;
  readonly heightCm: number;
  readonly leftMm: number;
  readonly rightMm: number;
  readonly topMm: number;
  readonly bottomMm: number;
}
/** Original source MINBODY is1mm rounded to twips. */
export const MINBODY = Number(convert(1n, Length.mm, Length.twip));
/** Native Page tab consumed geometry owner; browser events delegate to the same source handlers. */
export class SvxPageDescPage {
  private value: SvxPageGeometry;
  private readonly original: SvxPageGeometry;
  private readonly saved: SvxPageGeometry;
  private readonly savedPaper: Paper;
  private readonly paperBox = new SvxPaperSizeListBox();
  private ranges!: Readonly<
    Record<
      "width" | "height" | "leftMargin" | "rightMargin" | "topMargin" | "bottomMargin",
      Readonly<{ minimum: number; maximum: number }>
    >
  >;
  /** Resets original oriented paper recognition and exact source Std list. @param value - Actual input geometry. @param limits - Actual configuration defaults/limits. @param translate - Resource translation port. @returns Page tab owner. */
  constructor(
    value: SvxPageGeometry,
    private readonly limits: PageFormatLimits,
    translate?: (context: string, text: string) => string,
  ) {
    this.original = Object.freeze({
      width: value.width,
      height: value.height,
      landscape: value.landscape,
      leftMargin: value.leftMargin,
      rightMargin: value.rightMargin,
      topMargin: value.topMargin,
      bottomMargin: value.bottomMargin,
    });
    const marginMaximum =
      /** Original Init_Impl supplies the configured mm maxima before Reset writes metric values. @param millimetres - Schema limit. @returns Physical twips. */ (
        millimetres: number,
      ) => Number(convert(BigInt(millimetres), Length.mm, Length.twip));
    this.value = Object.freeze({
      width: value.width,
      height: value.height,
      landscape: value.landscape,
      leftMargin: Math.min(value.leftMargin, marginMaximum(limits.leftMm)),
      rightMargin: Math.min(value.rightMargin, marginMaximum(limits.rightMm)),
      topMargin: Math.min(value.topMargin, marginMaximum(limits.topMm)),
      bottomMargin: Math.min(value.bottomMargin, marginMaximum(limits.bottomMm)),
    });
    this.paperBox.FillPaperSizeEntries(PaperSizeApp.Std, translate);
    const size = new Size(
      value.landscape ? value.height : value.width,
      value.landscape ? value.width : value.height,
    );
    const paper = SvxPaperInfo.GetSvxPaper(size);
    if (paper !== Paper.PAPER_USER) {
      const exact = SvxPaperInfo.GetPaperSize(paper);
      this.value = Object.freeze({
        ...this.value,
        width: value.landscape ? exact.Height() : exact.Width(),
        height: value.landscape ? exact.Width() : exact.Height(),
      });
    }
    this.paperBox.set_active_id(paper);
    this.ClampPaperMaximum();
    this.RangeHdl_Impl();
    this.saved = this.value;
    this.savedPaper = this.paperBox.get_active_id();
  }
  /** Borrows the original paper list owner. @returns List. */
  GetPaperSizeBox(): SvxPaperSizeListBox {
    return this.paperBox;
  }
  /** Actual immutable geometry projection for platform controls. @returns Native physical fields. */
  GetGeometry(): Readonly<SvxPageGeometry> {
    return this.value;
  }
  /** Projects original FillItemSet geometry decisions for this one-shot browser acceptance; original items stay unchanged when their controls did not change from Reset. @returns Actual accepted physical fields, independently from preview geometry. */
  GetAcceptedGeometry(): Readonly<SvxPageGeometry> {
    const output = { ...this.original },
      value = this.value,
      paper = this.paperBox.get_active_id(),
      paperChanged = paper !== this.savedPaper,
      orientationChanged = value.landscape !== this.saved.landscape;
    for (const key of ["leftMargin", "rightMargin", "topMargin", "bottomMargin"] as const)
      if (value[key] !== this.saved[key]) output[key] = value[key] & 0xffff;
    if (paper === Paper.PAPER_USER) {
      if (
        paperChanged ||
        value.width !== this.saved.width ||
        value.height !== this.saved.height ||
        orientationChanged
      ) {
        output.width = value.width;
        output.height = value.height;
      }
    } else if (paperChanged || orientationChanged) {
      const size = SvxPaperInfo.GetPaperSize(paper);
      output.width = value.landscape ? size.Height() : size.Width();
      output.height = value.landscape ? size.Width() : size.Height();
    }
    if (orientationChanged) output.landscape = value.landscape;
    return Object.freeze(output);
  }
  /** Original list event returns immediately for USER; known papers update both metric fields and reduce an excessive larger margin. @param paper - Actual selected identity. @returns Nothing. */
  PaperSizeSelect_Impl(paper: Paper): void {
    this.paperBox.set_active_id(paper);
    const active = this.paperBox.get_active_id();
    if (active === Paper.PAPER_USER) return;
    const size = SvxPaperInfo.GetPaperSize(active);
    this.value = Object.freeze({
      ...this.value,
      width: this.value.landscape ? size.Height() : size.Width(),
      height: this.value.landscape ? size.Width() : size.Height(),
    });
    this.ClampPaperMaximum();
    this.CalcMargin_Impl();
    this.RangeHdl_Impl();
  }
  /** Original manual dimension event infers orientation but does not rotate before GetSvxPaper; preserve this source asymmetry. @param key - Original metric field. @param value - Accepted physical twips. @returns Nothing. */
  PaperSizeModify_Impl(key: "width" | "height", value: number): void {
    const range = this.GetFieldRanges()[key],
      accepted = Math.max(range.minimum, Math.min(range.maximum, value));
    const geometry = { ...this.value, [key]: accepted };
    this.value = Object.freeze({ ...geometry, landscape: geometry.width > geometry.height });
    this.paperBox.set_active_id(
      SvxPaperInfo.GetSvxPaper(new Size(this.value.width, this.value.height)),
    );
    this.RangeHdl_Impl();
  }
  /** Native active toggle swaps dimensions, then reapplies the current known paper; USER retains the swap. @param landscape - Requested active orientation. @returns Nothing. */
  SwapOrientation_Impl(landscape: boolean): void {
    if (landscape === this.value.landscape) return;
    this.value = Object.freeze({
      ...this.value,
      landscape,
      width: this.value.height,
      height: this.value.width,
    });
    this.ClampPaperMaximum();
    this.CalcMargin_Impl();
    this.PaperSizeSelect_Impl(this.paperBox.get_active_id());
    this.RangeHdl_Impl();
  }
  /** Applies one original margin field within its current native range without changing paper identity. @param key - Margin metric. @param value - Accepted twips. @returns Nothing. */
  SetMargin(key: "leftMargin" | "rightMargin" | "topMargin" | "bottomMargin", value: number): void {
    const range = this.GetFieldRanges()[key];
    this.value = Object.freeze({
      ...this.value,
      [key]: Math.max(range.minimum, Math.min(range.maximum, value)),
    });
    this.RangeHdl_Impl();
  }
  /** Original CalcMargin takes the larger side, choosing right/bottom on ties; header/footer/border contributions are absent in this consumed profile. @returns Nothing. */
  CalcMargin_Impl(): void {
    const value = { ...this.value },
      width = value.leftMargin + value.rightMargin + MINBODY,
      height = value.topMargin + value.bottomMargin + MINBODY;
    if (width > value.width) {
      const key = value.leftMargin <= value.rightMargin ? "rightMargin" : "leftMargin";
      value[key] -= width - value.width;
    }
    if (height > value.height) {
      const key = value.topMargin <= value.bottomMargin ? "bottomMargin" : "topMargin";
      value[key] -= height - value.height;
    }
    // Metric fields retain their native nonnegative minimum when set_value crosses it.
    value.leftMargin = Math.max(0, value.leftMargin);
    value.rightMargin = Math.max(0, value.rightMargin);
    value.topMargin = Math.max(0, value.topMargin);
    value.bottomMargin = Math.max(0, value.bottomMargin);
    this.value = Object.freeze(value);
  }
  /** Borrows the actual range values retained by the original metric controls. @returns Immutable source field bounds. */
  GetFieldRanges(): typeof this.ranges {
    return this.ranges;
  }
  /** Original RangeHdl writes minima before reading dimensions and deriving all margin maxima. Header/footer/border terms are zero in this represented profile. @returns Nothing. */
  RangeHdl_Impl(): void {
    const value = { ...this.value },
      minimumWidth = value.leftMargin + value.rightMargin + MINBODY,
      minimumHeight = value.topMargin + value.bottomMargin + MINBODY;
    value.width = Math.max(value.width, minimumWidth);
    value.height = Math.max(value.height, minimumHeight);
    const twips =
      /** Converts the original schema unit to physical core. @param amount - Source limit. @param unit - Source metric. @returns Twips. */ (
        amount: number,
        unit: Length,
      ) => Number(convert(BigInt(amount), unit, Length.twip));
    this.ranges = Object.freeze({
      width: Object.freeze({
        minimum: minimumWidth,
        maximum: twips(this.limits.widthCm, Length.cm),
      }),
      height: Object.freeze({
        minimum: minimumHeight,
        maximum: twips(this.limits.heightCm, Length.cm),
      }),
      leftMargin: Object.freeze({ minimum: 0, maximum: value.width - value.rightMargin - MINBODY }),
      rightMargin: Object.freeze({ minimum: 0, maximum: value.width - value.leftMargin - MINBODY }),
      topMargin: Object.freeze({
        minimum: 0,
        maximum: value.height - value.bottomMargin - MINBODY,
      }),
      bottomMargin: Object.freeze({
        minimum: 0,
        maximum: value.height - value.topMargin - MINBODY,
      }),
    });
    for (const key of ["leftMargin", "rightMargin", "topMargin", "bottomMargin"] as const)
      value[key] = Math.max(0, Math.min(value[key], this.ranges[key].maximum));
    this.value = Object.freeze(value);
  }
  /** Configured metric maxima remain active when a known format writes the controls. @returns Nothing. */
  private ClampPaperMaximum(): void {
    this.value = Object.freeze({
      ...this.value,
      width: Math.min(
        this.value.width,
        Number(convert(BigInt(this.limits.widthCm), Length.cm, Length.twip)),
      ),
      height: Math.min(
        this.value.height,
        Number(convert(BigInt(this.limits.heightCm), Length.cm, Length.twip)),
      ),
    });
  }
}
