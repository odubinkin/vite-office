/** @fileoverview Original Excel palette-reduction values and arithmetic from xestyle.cxx. Complete palette/root/default-style and font records remain unported; no substitute palette provider is created. */
import { Color } from "../../../../tools/inc/color";
import { XclExpColorType as Use } from "../inc/xestyle";
/** Original color-use weighting; unknown enum diagnostics retain the source release fallback1. @param type - Original enum. @returns Native weighting. */
export function lclGetWeighting(type: Use): number {
  switch (type) {
    case Use.EXC_COLOR_CHARTLINE:
      return 1;
    case Use.EXC_COLOR_CELLBORDER:
    case Use.EXC_COLOR_CHARTAREA:
      return 2;
    case Use.EXC_COLOR_CELLTEXT:
    case Use.EXC_COLOR_CHARTTEXT:
    case Use.EXC_COLOR_CTRLTEXT:
      return 10;
    case Use.EXC_COLOR_TABBG:
    case Use.EXC_COLOR_CELLAREA:
      return 20;
    case Use.EXC_COLOR_GRID:
      return 50;
    default:
      return 1;
  }
}
/** Original integer RGB distance with77/151/28 channel weights; alpha is deliberately ignored. @param first - Actual first color. @param second - Actual second color. @returns Native squared distance. */
export function lclGetColorDistance(first: Readonly<Color>, second: Readonly<Color>): number {
  const red = first.GetRed() - second.GetRed(),
    green = first.GetGreen() - second.GetGreen(),
    blue = first.GetBlue() - second.GetBlue();
  return red * red * 77 + green * green * 151 + blue * blue * 28;
}
/** Original endpoint-sensitive weighted merge, with uint32 arithmetic and integer rounding. Zero wrapped total weight is the original undefined division domain, not a supported fallback. @param first - Native unsigned8 component. @param firstWeight - Native unsigned32 weight. @param second - Native unsigned8 component. @param secondWeight - Native unsigned32 weight. @returns Native unsigned8 result. */
export function lclGetMergedColorComp(
  first: number,
  firstWeight: number,
  second: number,
  secondWeight: number,
): number {
  first &= 255;
  second &= 255;
  firstWeight >>>= 0;
  secondWeight >>>= 0;
  const firstDistance = Math.min(first, 255 - first),
    secondDistance = Math.min(second, 255 - second);
  if (firstDistance !== secondDistance) {
    const nearer = firstDistance < secondDistance ? first : second;
    const factor = Math.trunc(((nearer - 128) * (nearer - 127)) / 4096) + 1;
    if (firstDistance < secondDistance) firstWeight = Math.imul(firstWeight, factor) >>> 0;
    else secondWeight = Math.imul(secondWeight, factor) >>> 0;
  }
  const sum = (firstWeight + secondWeight) >>> 0;
  const numerator =
    (Math.imul(first, firstWeight) + Math.imul(second, secondWeight) + Math.trunc(sum / 2)) >>> 0;
  return Math.trunc(numerator / sum) & 255;
}
/** Original channel midpoint truncates each sum and leaves the destination alpha unchanged. @param destination - Actual mutable color. @param first - Actual first source. @param second - Actual second source. @returns Nothing. */
export function lclSetMixedColor(
  destination: Color,
  first: Readonly<Color>,
  second: Readonly<Color>,
): void {
  destination.SetRed(Math.trunc((first.GetRed() + second.GetRed()) / 2));
  destination.SetGreen(Math.trunc((first.GetGreen() + second.GetGreen()) / 2));
  destination.SetBlue(Math.trunc((first.GetBlue() + second.GetBlue()) / 2));
}
/** Original working palette entry copies its actual color and protects the eight RGB base colors during merge. */
export class XclListColor {
  private readonly maColor: Color;
  private readonly mnColorId: number;
  private mnWeight: number;
  private readonly mbBaseColor: boolean;
  /** Original explicit/implicit-copy construction. @param args - Actual color/ID or actual source entry. @returns Independent value. */
  constructor(...args: [color: Readonly<Color>, id: number] | [source: XclListColor]) {
    const source = args[0];
    if (source instanceof XclListColor) {
      this.maColor = new Color(source.maColor);
      this.mnColorId = source.mnColorId;
      this.mnWeight = source.mnWeight;
      this.mbBaseColor = source.mbBaseColor;
    } else {
      this.maColor = new Color(source);
      this.mnColorId = (args[1] as number) >>> 0;
      this.mnWeight = 0;
      this.mbBaseColor =
        (source.GetRed() === 0 || source.GetRed() === 255) &&
        (source.GetGreen() === 0 || source.GetGreen() === 255) &&
        (source.GetBlue() === 0 || source.GetBlue() === 255);
    }
  }
  /** Original borrowed const color. @returns Owned value. */
  GetColor(): Readonly<Color> {
    return this.maColor;
  }
  /** Original stable unsigned32 ID. @returns ID. */
  GetColorId(): number {
    return this.mnColorId;
  }
  /** Original accumulated unsigned32 weight. @returns Weight. */
  GetWeighting(): number {
    return this.mnWeight;
  }
  /** Original RGB-only base classification. @returns Whether protected. */
  IsBaseColor(): boolean {
    return this.mbBaseColor;
  }
  /** Original unsigned32 addition. @param weight - Native increment. @returns Nothing. */
  AddWeighting(weight: number): void {
    this.mnWeight = (this.mnWeight + (weight >>> 0)) >>> 0;
  }
  /** Original merge preserves destination ID/base status and source entry, then adds source weighting. @param source - Actual other entry. @returns Nothing. */
  Merge(source: XclListColor): void {
    const weight = source.GetWeighting();
    if (!this.mbBaseColor) {
      this.maColor.SetRed(
        lclGetMergedColorComp(
          this.maColor.GetRed(),
          this.mnWeight,
          source.maColor.GetRed(),
          weight,
        ),
      );
      this.maColor.SetGreen(
        lclGetMergedColorComp(
          this.maColor.GetGreen(),
          this.mnWeight,
          source.maColor.GetGreen(),
          weight,
        ),
      );
      this.maColor.SetBlue(
        lclGetMergedColorComp(
          this.maColor.GetBlue(),
          this.mnWeight,
          source.maColor.GetBlue(),
          weight,
        ),
      );
    }
    this.AddWeighting(weight);
  }
}
/** Original per-color data; its index is unspecified until Set outside value-initialized vector storage. No artificial zero default is supplied. */
export class XclColorIdData {
  readonly maColor: Color;
  mnIndex: number | undefined;
  /** Original default/implicit-copy value binding. @param source - Optional actual initialized source. @returns Value. */
  constructor(source?: XclColorIdData) {
    this.maColor = source === undefined ? new Color() : new Color(source.maColor);
    this.mnIndex = source?.mnIndex;
  }
  /** Original complete value assignment used by palette finalization. @param color - Actual inserted color. @param index - Native unsigned32 index. @returns Nothing. */
  Set(color: Readonly<Color>, index: number): void {
    this.maColor.assign(color);
    this.mnIndex = index >>> 0;
  }
}
/** Original palette output value. */
export class XclPaletteColor {
  readonly maColor: Color;
  mbUsed: boolean;
  /** Original color/copy constructors. @param source - Actual color or palette entry. @returns Independent value. */
  constructor(source: Readonly<Color> | XclPaletteColor) {
    this.maColor = new Color(source instanceof XclPaletteColor ? source.maColor : source);
    this.mbUsed = source instanceof XclPaletteColor ? source.mbUsed : false;
  }
  /** Original assignment always marks the palette entry used, even for the same color. @param color - Actual result. @returns Nothing. */
  SetColor(color: Readonly<Color>): void {
    this.maColor.assign(color);
    this.mbUsed = true;
  }
}
/** Original remap value starts at palette0 and unprocessed. */
export class XclRemap {
  mnPalIndex: number;
  mbProcessed: boolean;
  /** Original default/implicit-copy constructor. @param source - Optional actual source. @returns Value. */
  constructor(source?: XclRemap) {
    this.mnPalIndex = source?.mnPalIndex ?? 0;
    this.mbProcessed = source?.mbProcessed ?? false;
  }
  /** Original index assignment marks processing complete. @param index - Native unsigned32 index. @returns Nothing. */
  SetIndex(index: number): void {
    this.mnPalIndex = index >>> 0;
    this.mbProcessed = true;
  }
}
/** Original nearest-color value starts with index/distance0. */
export class XclNearest {
  mnPalIndex: number;
  mnDist: number;
  /** Original default/implicit-copy constructor. @param source - Optional actual source. @returns Value. */
  constructor(source?: XclNearest) {
    this.mnPalIndex = source?.mnPalIndex ?? 0;
    this.mnDist = source?.mnDist ?? 0;
  }
}
