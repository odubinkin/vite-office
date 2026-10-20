/**
 * @fileoverview Reimplements bounded paragraph margin, first-line indent, and spacing items from pinned `editeng/source/items/frmitems.cxx`.
 */
import { Color, ColorTransparency } from "../../../tools/inc/color";

import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  BorderLine,
  cppu_detail_getUnoType_BorderLine as borderLineType,
} from "../../../offapi/com/sun/star/table/BorderLine";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2 as borderLine2Type,
} from "../../../offapi/com/sun/star/table/BorderLine2";
import { convert as convertLength, Length } from "../../../o3tl/inc/unit_conversion";
import { convertTwipToMm100 } from "../../../tools/inc/UnitConversion";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { SvxBorderLine, SvxBorderLineStyle, roundBorderMetric } from "./borderline";

/** Native protection item with independent content, size and position flags. */
export class SvxProtectItem extends SfxPoolItem {
  private bCntnt = false;
  private bSize = false;
  private bPos = false;
  /** Creates the three false native defaults. @param which - Item identity. @returns Nothing. */
  public constructor(which: number) {
    super(which);
  }
  /** Reads content protection. @returns Content flag. */
  public IsContentProtected(): boolean {
    return this.bCntnt;
  }
  /** Reads size protection. @returns Size flag. */
  public IsSizeProtected(): boolean {
    return this.bSize;
  }
  /** Reads position protection. @returns Position flag. */
  public IsPosProtected(): boolean {
    return this.bPos;
  }
  /** Changes content protection. @param value - New flag. @returns Nothing. */
  public SetContentProtect(value: boolean): void {
    this.bCntnt = value;
  }
  /** Changes size protection. @param value - New flag. @returns Nothing. */
  public SetSizeProtect(value: boolean): void {
    this.bSize = value;
  }
  /** Changes position protection. @param value - New flag. @returns Nothing. */
  public SetPosProtect(value: boolean): void {
    this.bPos = value;
  }
  /** Clones all three independent flags. @returns Owned protection item. */
  public Clone(): SvxProtectItem {
    const copy = new SvxProtectItem(this.Which());
    copy.bCntnt = this.bCntnt;
    copy.bSize = this.bSize;
    copy.bPos = this.bPos;
    return copy;
  }
  /** Compares identity and all protection flags. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxProtectItem &&
      other.Which() === this.Which() &&
      other.bCntnt === this.bCntnt &&
      other.bSize === this.bSize &&
      other.bPos === this.bPos
    );
  }
  /** Projects native member flags; omitted member selects the existing browser snapshot boundary. @param member - Native member identity. @returns Member flag or browser snapshot. */
  public override QueryValue(member?: number): boolean | readonly boolean[] | undefined {
    if (member === undefined) return [this.bCntnt, this.bSize, this.bPos];
    switch (member & ~0x80) {
      case 0:
        return this.bCntnt;
      case 1:
        return this.bSize;
      case 2:
        return this.bPos;
      default:
        return undefined;
    }
  }
  /** Changes one native member flag. @param value - New flag. @param member - Native member identity. @returns Whether recognized. */
  public override PutValue(value: boolean, member: number): boolean {
    switch (member & ~0x80) {
      case 0:
        this.bCntnt = value;
        break;
      case 1:
        this.bSize = value;
        break;
      case 2:
        this.bPos = value;
        break;
      default:
        return false;
    }
    return true;
  }
}

/** Native box edge order from boxitem.hxx. */
export enum SvxBoxItemLine {
  TOP = 0,
  BOTTOM = 1,
  LEFT = 2,
  RIGHT = 3,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native sentinel aliases the last edge.
  LAST = 3,
}
/** Native inner-line order. */
export enum SvxBoxInfoItemLine {
  HORI = 0,
  VERT = 1,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Native sentinel aliases the last inner edge.
  LAST = 1,
}
/** Native valid-component mask; construction enables all except DISABLE. */
export enum SvxBoxInfoItemValidFlags {
  NONE = 0,
  TOP = 1,
  BOTTOM = 2,
  LEFT = 4,
  RIGHT = 8,
  HORI = 16,
  VERT = 32,
  DISTANCE = 64,
  DISABLE = 128,
  ALL = 255,
}
/** Casts a native metric to signed16. @param value - Metric. @returns Signed metric. */
function boxInt16(value: number): number {
  return (Math.trunc(value) << 16) >> 16;
}
/** Converts supported native metric units. @param value - Metric. @param convert - Convert twips to mm100. @returns Converted metric. */
function boxUnoMetric(value: number, convert: boolean): number {
  return convert ? roundBorderMetric(value, 127 / 72) : value;
}
/** Projects actual native line fields only at the existing browser record boundary. @param line - Native value. @returns Complete logical record. */
function boxUnoRecord(line: Readonly<BorderLine2>) {
  return {
    Color: line.Color,
    InnerLineWidth: line.InnerLineWidth,
    OuterLineWidth: line.OuterLineWidth,
    LineDistance: line.LineDistance,
    LineStyle: line.LineStyle,
    LineWidth: line.LineWidth,
  };
}
/** Validates an existing browser line record then delegates to the single native converter. @param value - Browser record or actual native value. @param convert - Input uses mm100. @returns Native line, absence, or invalid input. */
function boxUnoLine(value: unknown, convert: boolean): SvxBorderLine | undefined | false {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  if (
    ![data.Color, data.InnerLineWidth, data.OuterLineWidth, data.LineDistance].every(
      /** Admits the native scalar fields at the browser boundary. @param field - Record field. @returns Integer admission. */
      (field) => typeof field === "number" && Number.isInteger(field),
    )
  )
    return false;
  const input = new BorderLine2(
      data.Color as number,
      data.InnerLineWidth as number,
      data.OuterLineWidth as number,
      data.LineDistance as number,
      typeof data.LineStyle === "number" ? data.LineStyle : SvxBorderLineStyle.SOLID,
      typeof data.LineWidth === "number" ? data.LineWidth : 0,
    ),
    line = new SvxBorderLine();
  return SvxBoxItem.LineToSvxLine(input, line, convert, "BorderLine2") ? line : undefined;
}
/** Original shared extraction helper: derived struct first, then legacy base fields and SOLID, leaving existing total width intact. @param value - Native Any. @param line - Actual native output. @returns Extraction success. */
export function lcl_extractBorderLine(value: Any, line: BorderLine2): boolean {
  if (value.extract(line, borderLine2Type)) return true;
  const base = new BorderLine();
  if (!value.extract(base, borderLineType)) return false;
  line.Color = base.Color;
  line.InnerLineWidth = base.InnerLineWidth;
  line.OuterLineWidth = base.OuterLineWidth;
  line.LineDistance = base.LineDistance;
  line.LineStyle = SvxBorderLineStyle.SOLID;
  return true;
}

/** Owns four native lines and four signed cell distances. */
export class SvxBoxItem extends SfxPoolItem {
  private readonly lines: (SvxBorderLine | undefined)[] = [
    undefined,
    undefined,
    undefined,
    undefined,
  ];
  private readonly distances = [0, 0, 0, 0];
  private removeAdjacent = false;
  /** Original borderless or deep-copy constructor. @param source - Identity or original item. @returns Nothing. */
  public constructor(source: number | Readonly<SvxBoxItem>) {
    super(typeof source === "number" ? source : source.Which());
    if (typeof source !== "number") {
      for (const edge of [0, 1, 2, 3]) {
        this.SetLine(source.GetLine(edge), edge);
        this.SetDistance(source.GetDistance(edge, true), edge);
      }
      this.removeAdjacent = source.IsRemoveAdjacentCellBorder();
    }
  }
  /** Reads an owned native line. @param edge - Native edge. @returns Line or absent. */
  public GetLine(edge: SvxBoxItemLine): SvxBorderLine | undefined {
    return this.lines[edge];
  }
  /** Copies a supplied line into this item. @param line - Line or absent. @param edge - Native edge. @returns Nothing. */
  public SetLine(line: SvxBorderLine | undefined, edge: SvxBoxItemLine): void {
    if (Number.isInteger(edge) && edge >= 0 && edge <= 3) this.lines[edge] = line?.Clone();
  }
  /** Reads the top native line. @returns Line. */
  public GetTop(): SvxBorderLine | undefined {
    return this.GetLine(SvxBoxItemLine.TOP);
  }
  /** Reads the bottom native line. @returns Line. */
  public GetBottom(): SvxBorderLine | undefined {
    return this.GetLine(SvxBoxItemLine.BOTTOM);
  }
  /** Reads the left native line. @returns Line. */
  public GetLeft(): SvxBorderLine | undefined {
    return this.GetLine(SvxBoxItemLine.LEFT);
  }
  /** Reads the right native line. @returns Line. */
  public GetRight(): SvxBorderLine | undefined {
    return this.GetLine(SvxBoxItemLine.RIGHT);
  }
  /** Reads a signed distance with native negative-read policy. @param edge - Native edge. @param allowNegative - Preserve negative values. @returns Twips. */
  public GetDistance(edge: SvxBoxItemLine, allowNegative = false): number {
    const distance = this.distances[edge] ?? 0;
    return allowNegative ? distance : Math.max(0, distance);
  }
  /** Stores a signed16 distance. @param value - Twips. @param edge - Native edge. @returns Nothing. */
  public SetDistance(value: number, edge: SvxBoxItemLine): void {
    if (Number.isInteger(edge) && edge >= 0 && edge <= 3) this.distances[edge] = boxInt16(value);
  }
  /** Replaces all four distances. @param value - Signed twips. @returns Nothing. */
  public SetAllDistances(value: number): void {
    this.distances.fill(boxInt16(value));
  }
  /** Reads the smallest nonzero distance using native unsigned accumulation. @returns Unsigned16 metric. */
  public GetSmallestDistance(): number {
    let result = (this.distances[0] as number) & 0xffff;
    for (const distance of this.distances.slice(1))
      if (distance && (!result || distance < result)) result = distance & 0xffff;
    return result;
  }
  /** Reads scaled native line width. @param edge - Edge. @returns Unsigned twips. */
  public CalcLineWidth(edge: SvxBoxItemLine): number {
    return this.GetLine(edge)?.GetScaledWidth() ?? 0;
  }
  /** Computes signed line plus distance with native overflow and negative policy. @param edge - Native edge. @param evenIfNoLine - Include padding without a line. @param allowNegative - Preserve negative result. @returns Signed twips. */
  public CalcLineSpace(edge: SvxBoxItemLine, evenIfNoLine = false, allowNegative = false): number {
    const line = this.GetLine(edge);
    const distance =
      line === undefined && !evenIfNoLine
        ? 0
        : boxInt16(this.GetDistance(edge, true) + (line?.GetScaledWidth() ?? 0));
    return allowNegative ? distance : Math.max(0, distance);
  }
  /** Reports native border or optionally padding. @param treatPaddingAsBorder - Count distance-only edges. @returns Whether any space. */
  public HasBorder(treatPaddingAsBorder = false): boolean {
    return [1, 3, 0, 2].some(
      /** Checks one native side. @param edge - Side. @returns Whether nonzero. */
      (edge) => this.CalcLineSpace(edge, treatPaddingAsBorder) !== 0,
    );
  }
  /** Sets the native adjacent-cell border removal flag. @param value - Removal policy. @returns Nothing. */
  public SetRemoveAdjacentCellBorder(value: boolean): void {
    this.removeAdjacent = value;
  }
  /** Reads the adjacent-cell border removal flag. @returns Policy. */
  public IsRemoveAdjacentCellBorder(): boolean {
    return this.removeAdjacent;
  }
  /** Copies all represented state and owned line objects. @returns Independent item. */
  public Clone(): SvxBoxItem {
    const copy = new SvxBoxItem(this.Which());
    for (const edge of [0, 1, 2, 3]) {
      copy.SetLine(this.GetLine(edge), edge);
      copy.SetDistance(this.GetDistance(edge, true), edge);
    }
    copy.removeAdjacent = this.removeAdjacent;
    return copy;
  }
  /** Compares native identity, distances, lines and removal policy. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxBoxItem &&
      other.Which() === this.Which() &&
      other.removeAdjacent === this.removeAdjacent &&
      this.distances.every(
        /** Compares one native edge. @param distance - Distance. @param edge - Index. @returns Whether equal. */
        (distance, edge) =>
          distance === other.distances[edge] &&
          (this.lines[edge] === undefined
            ? other.lines[edge] === undefined
            : other.lines[edge] !== undefined && this.lines[edge].equals(other.lines[edge])),
      )
    );
  }
  /** Scales native distances and line metrics. @param scale - Scale factor. @returns Nothing. */
  public override ScaleMetrics(scale: number): void {
    for (const edge of [0, 1, 2, 3]) {
      this.lines[edge]?.ScaleMetrics(scale);
      this.SetDistance(roundBorderMetric(this.GetDistance(edge, true), scale), edge);
    }
  }
  /** Reports native metric support. @returns True. */
  public override HasMetrics(): boolean {
    return true;
  }
  /** Original native line-to-struct conversion with signed16 component assignment. @param line - Optional native border. @param convert - Convert to mm100. @returns Actual published struct. */
  public static SvxLineToLine(
    line: Readonly<SvxBorderLine> | null | undefined,
    convert: boolean,
  ): BorderLine2 {
    const result = new BorderLine2();
    if (line === null || line === undefined) {
      result.LineStyle = SvxBorderLineStyle.NONE;
      return result;
    }
    result.Color = line.GetColor().toInt32();
    result.InnerLineWidth = convert
      ? Number(convertTwipToMm100(BigInt(line.GetInWidth())))
      : line.GetInWidth();
    result.OuterLineWidth = convert
      ? Number(convertTwipToMm100(BigInt(line.GetOutWidth())))
      : line.GetOutWidth();
    result.LineDistance = convert
      ? Number(convertTwipToMm100(BigInt(line.GetDistance())))
      : line.GetDistance();
    result.LineStyle = line.GetBorderLineStyle();
    result.LineWidth = convert
      ? Number(convertTwipToMm100(BigInt(line.GetWidth())))
      : line.GetWidth();
    return result;
  }
  /** Original base overload; the final literal binds the erased static C++ argument type. @param line - Base view, possibly of a derived object. @param target - Existing border. @param convert - Input uses mm100. @param family - Erased declared type. @returns Native nonempty state. */
  public static LineToSvxLine(
    line: Readonly<BorderLine>,
    target: SvxBorderLine,
    convert: boolean,
    family: "BorderLine",
  ): boolean;
  /** Original extended overload. @param line - Extended value. @param target - Existing border. @param convert - Input uses mm100. @param family - Erased declared type. @returns Native nonempty state. */
  public static LineToSvxLine(
    line: Readonly<BorderLine2>,
    target: SvxBorderLine,
    convert: boolean,
    family: "BorderLine2",
  ): boolean;
  /** Dispatches the original statically selected overload, preserving target scale/mirror. Runtime subclass identity cannot replace C++ static overload selection. @param line - Declared base/extended value. @param target - Existing border. @param convert - Input uses mm100. @param family - Explicit erased argument type. @returns Native nonempty state. */
  public static LineToSvxLine(
    line: Readonly<BorderLine>,
    target: SvxBorderLine,
    convert: boolean,
    family: "BorderLine" | "BorderLine2",
  ): boolean {
    let guess = true;
    if (family === "BorderLine2") {
      const extended = line as Readonly<BorderLine2>;
      const style =
        extended.LineStyle < 0 || extended.LineStyle > SvxBorderLineStyle.BORDER_LINE_STYLE_MAX
          ? SvxBorderLineStyle.SOLID
          : extended.LineStyle;
      target.SetBorderLineStyle(style);
      if (extended.LineWidth !== 0) {
        target.SetWidth(
          convert
            ? Number(convertLength(BigInt(extended.LineWidth), Length.mm100, Length.twip))
            : extended.LineWidth,
        );
        guess =
          (style === SvxBorderLineStyle.DOUBLE || style === SvxBorderLineStyle.DOUBLE_THIN) &&
          line.InnerLineWidth > 0 &&
          line.OuterLineWidth > 0;
      }
    }
    target.SetColor(new Color(ColorTransparency, line.Color, "ColorTransparencyTag"));
    if (guess) {
      const metric =
        /** Original signed metric conversion before unsigned16 argument assignment. @param width - Native component. @returns Twip width. */ (
          width: number,
        ): number =>
          (convert ? Number(convertLength(BigInt(width), Length.mm100, Length.twip)) : width) &
          0xffff;
      target.GuessLinesWidths(
        target.GetBorderLineStyle(),
        metric(line.OuterLineWidth),
        metric(line.InnerLineWidth),
        metric(line.LineDistance),
      );
    }
    return !target.isEmpty();
  }
  /** Reads native default sequence or individual border/distance members. @param member - Native member plus optional CONVERT_TWIPS. @returns Represented UNO value. */
  public override QueryValue(member = 0): unknown {
    const convert = (member & 0x80) !== 0;
    member &= 0x7f;
    if (member === 0)
      return [
        ...[2, 3, 1, 0].map(
          /** Projects one native border. @param edge - Edge. @returns UNO line. */
          (edge) => boxUnoRecord(SvxBoxItem.SvxLineToLine(this.GetLine(edge), convert)),
        ),
        ...[this.GetSmallestDistance(), ...this.distances].map(
          /** Projects one distance. @param distance - Metric. @returns UNO scalar. */
          (distance) => boxUnoMetric(distance, convert),
        ),
      ];
    const edge = (
      { 1: 2, 2: 3, 3: 0, 4: 1, 6: 2, 7: 3, 8: 0, 9: 1, 10: 2, 11: 3, 12: 0, 13: 1 } as Record<
        number,
        number
      >
    )[member];
    if (member === 5) return boxUnoMetric(boxInt16(this.GetSmallestDistance()), convert);
    if (member >= 6 && member <= 9)
      return boxUnoMetric(this.GetDistance(edge as number, true), convert);
    if (member === 14 || member === 15) return undefined;
    return boxUnoRecord(SvxBoxItem.SvxLineToLine(this.GetLine(edge ?? -1), convert));
  }
  /** Applies represented native sequence or border/distance members. @param value - UNO payload. @param member - Native member plus optional CONVERT_TWIPS. @returns Whether admitted. */
  public override PutValue(value: unknown, member = 0): boolean {
    const convert = (member & 0x80) !== 0;
    member &= 0x7f;
    if (member === 0) {
      if (!Array.isArray(value) || value.length !== 9) return false;
      for (const [index, edge] of [2, 3, 1, 0].entries()) {
        const line = boxUnoLine(value[index], convert);
        if (line === false) return false;
        this.SetLine(line, edge);
      }
      for (let index = 4; index < 9; index++) {
        const distance = value[index];
        if (typeof distance !== "number" || !Number.isInteger(distance)) return false;
        const twips = convert ? roundBorderMetric(distance, 72 / 127) : distance;
        if (index === 4) this.SetAllDistances(twips);
        else this.SetDistance(twips, index - 5);
      }
      return true;
    }
    const edge = (
      { 1: 2, 2: 3, 3: 0, 4: 1, 6: 2, 7: 3, 8: 0, 9: 1, 10: 2, 11: 3, 12: 0, 13: 1 } as Record<
        number,
        number
      >
    )[member];
    if (member >= 5 && member <= 9) {
      if (typeof value !== "number" || !Number.isInteger(value)) return false;
      const distance = convert ? roundBorderMetric(value, 72 / 127) : value;
      if (member === 5) this.SetAllDistances(distance);
      else this.SetDistance(distance, edge as number);
      return true;
    }
    if (member === 14 || member === 15) {
      for (const line of this.lines)
        if (line !== undefined) {
          if (member === 14)
            line.SetBorderLineStyle(
              value === 1
                ? SvxBorderLineStyle.SOLID
                : value === 2
                  ? SvxBorderLineStyle.DASHED
                  : SvxBorderLineStyle.NONE,
            );
          else line.SetWidth(convert ? roundBorderMetric(Number(value), 72 / 127) : Number(value));
        }
      return true;
    }
    if (edge === undefined) return false;
    const line = boxUnoLine(value, convert);
    if (line === false) return false;
    this.SetLine(line, edge);
    return true;
  }
}

/** Owns native inner lines, distance policy and valid-component flags. */
export class SvxBoxInfoItem extends SfxPoolItem {
  private readonly lines: (SvxBorderLine | undefined)[] = [undefined, undefined];
  private horizontal = false;
  private vertical = false;
  private distance = false;
  private minimum = false;
  private defaultDistance = 0;
  private validFlags = 127;
  /** Original inner-border default/copy constructor. @param source - Slot identity or actual item. @returns Nothing. */
  public constructor(source: number | SvxBoxInfoItem) {
    super(typeof source === "number" ? source : source.Which());
    if (typeof source !== "number") {
      this.SetLine(source.GetHori(), 0);
      this.SetLine(source.GetVert(), 1);
      this.horizontal = source.IsHor();
      this.vertical = source.IsVer();
      this.distance = source.IsDist();
      this.minimum = source.IsMinDist();
      this.defaultDistance = source.GetDefDist();
      this.validFlags = source.validFlags;
    }
  }
  /** Reads an owned inner line. @param edge - Inner direction. @returns Line or absent. */
  public GetLine(edge: SvxBoxInfoItemLine): SvxBorderLine | undefined {
    return this.lines[edge];
  }
  /** Copies an inner line. @param line - Native line. @param edge - Inner direction. @returns Nothing. */
  public SetLine(line: SvxBorderLine | undefined, edge: SvxBoxInfoItemLine): void {
    if (edge === 0 || edge === 1) this.lines[edge] = line?.Clone();
  }
  /** Reads horizontal inner line. @returns Line. */
  public GetHori(): SvxBorderLine | undefined {
    return this.lines[0];
  }
  /** Reads vertical inner line. @returns Line. */
  public GetVert(): SvxBorderLine | undefined {
    return this.lines[1];
  }
  /** Reads native table mode. @returns Both directions enabled. */
  public IsTable(): boolean {
    return this.horizontal && this.vertical;
  }
  /** Sets both table directions. @param value - Enabled. @returns Nothing. */
  public SetTable(value: boolean): void {
    this.horizontal = value;
    this.vertical = value;
  }
  /** Reads horizontal enablement. @returns Enabled. */
  public IsHor(): boolean {
    return this.horizontal;
  }
  /** Sets horizontal enablement. @param value - Enabled. @returns Nothing. */
  public EnableHor(value: boolean): void {
    this.horizontal = value;
  }
  /** Reads vertical enablement. @returns Enabled. */
  public IsVer(): boolean {
    return this.vertical;
  }
  /** Sets vertical enablement. @param value - Enabled. @returns Nothing. */
  public EnableVer(value: boolean): void {
    this.vertical = value;
  }
  /** Reads distance policy. @returns Policy. */
  public IsDist(): boolean {
    return this.distance;
  }
  /** Sets distance policy. @param value - Policy. @returns Nothing. */
  public SetDist(value: boolean): void {
    this.distance = value;
  }
  /** Reads minimum policy. @returns Policy. */
  public IsMinDist(): boolean {
    return this.minimum;
  }
  /** Sets minimum policy. @param value - Policy. @returns Nothing. */
  public SetMinDist(value: boolean): void {
    this.minimum = value;
  }
  /** Reads unsigned default distance. @returns Twips. */
  public GetDefDist(): number {
    return this.defaultDistance;
  }
  /** Sets unsigned default distance. @param value - Twips. @returns Nothing. */
  public SetDefDist(value: number): void {
    this.defaultDistance = value & 0xffff;
  }
  /** Reads native validity bits. @param flag - Mask. @returns Whether any supplied bit is valid. */
  public IsValid(flag: SvxBoxInfoItemValidFlags): boolean {
    return (this.validFlags & flag) !== 0;
  }
  /** Changes native validity bits. @param flag - Mask. @param value - Set or clear. @returns Nothing. */
  public SetValid(flag: SvxBoxInfoItemValidFlags, value = true): void {
    this.validFlags = (value ? this.validFlags | flag : this.validFlags & ~flag) & 0xff;
  }
  /** Resets every native validity bit except DISABLE. @returns Nothing. */
  public ResetFlags(): void {
    this.validFlags = 127;
  }
  /** Copies all represented flags and owned lines. @returns Independent item. */
  public Clone(): SvxBoxInfoItem {
    const copy = new SvxBoxInfoItem(this.Which());
    copy.SetLine(this.GetHori(), 0);
    copy.SetLine(this.GetVert(), 1);
    copy.horizontal = this.horizontal;
    copy.vertical = this.vertical;
    copy.distance = this.distance;
    copy.minimum = this.minimum;
    copy.defaultDistance = this.defaultDistance;
    copy.validFlags = this.validFlags;
    return copy;
  }
  /** Compares represented native fields. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxBoxInfoItem &&
      other.Which() === this.Which() &&
      other.horizontal === this.horizontal &&
      other.vertical === this.vertical &&
      other.distance === this.distance &&
      other.minimum === this.minimum &&
      other.defaultDistance === this.defaultDistance &&
      other.validFlags === this.validFlags &&
      this.lines.every(
        /** Compares an inner direction. @param line - Line. @param edge - Direction. @returns Whether equal. */
        (line, edge) =>
          line === undefined
            ? other.lines[edge] === undefined
            : other.lines[edge] !== undefined && line.equals(other.lines[edge]),
      )
    );
  }
  /** Scales represented native metrics. @param scale - Scale factor. @returns Nothing. */
  public override ScaleMetrics(scale: number): void {
    for (const line of this.lines) line?.ScaleMetrics(scale);
    this.SetDefDist(roundBorderMetric(this.defaultDistance, scale));
  }
  /** Reports native metric support. @returns True. */
  public override HasMetrics(): boolean {
    return true;
  }
  /** Reads the native five-field sequence or represented member. @param member - Member plus optional CONVERT_TWIPS. @returns UNO payload. */
  public override QueryValue(member = 0): unknown {
    const convert = (member & 0x80) !== 0;
    member &= 0x7f;
    const flags = (this.IsTable() ? 1 : 0) | (this.distance ? 2 : 0) | (this.minimum ? 4 : 0);
    if (member === 0)
      return [
        boxUnoRecord(SvxBoxItem.SvxLineToLine(this.GetHori(), convert)),
        boxUnoRecord(SvxBoxItem.SvxLineToLine(this.GetVert(), convert)),
        flags,
        this.validFlags,
        boxUnoMetric(this.defaultDistance, convert),
      ];
    if (member === 1 || member === 2)
      return boxUnoRecord(SvxBoxItem.SvxLineToLine(this.GetLine(member - 1), convert));
    if (member === 0x2e) return flags;
    if (member === 4) return this.validFlags;
    if (member === 0x29) return boxUnoMetric(this.defaultDistance, convert);
    return undefined;
  }
  /** Applies represented native sequence or member values. @param value - UNO payload. @param member - Native member plus optional CONVERT_TWIPS. @returns Native admission result. */
  public override PutValue(value: unknown, member = 0): boolean {
    const convert = (member & 0x80) !== 0;
    member &= 0x7f;
    if (member === 0) {
      if (!Array.isArray(value) || value.length !== 5) return true;
      for (const edge of [0, 1]) {
        const line = boxUnoLine(value[edge], convert);
        if (line === false) return false;
        this.SetLine(line, edge);
      }
      if (typeof value[2] !== "number" || !Number.isInteger(value[2])) return false;
      this.PutValue(value[2], 0x2e);
      if (typeof value[3] !== "number" || !Number.isInteger(value[3])) return false;
      this.validFlags = value[3] & 0xff;
      this.PutValue(value[4], 0x29 | (convert ? 0x80 : 0));
      return true;
    }
    if (member === 1 || member === 2) {
      const line = boxUnoLine(value, convert);
      if (line === false) return false;
      // Native single-line PutValue retains the previous line for empty input.
      if (line !== undefined) this.SetLine(line, member - 1);
      return true;
    }
    if (member !== 0x2e && member !== 4 && member !== 0x29) return false;
    if (typeof value !== "number" || !Number.isInteger(value)) return true;
    if (member === 0x2e) {
      this.SetTable((value & 1) !== 0);
      this.SetDist((value & 2) !== 0);
      this.SetMinDist((value & 4) !== 0);
    } else if (member === 4) this.validFlags = value & 0xff;
    else if (value >= 0) this.SetDefDist(convert ? roundBorderMetric(value, 72 / 127) : value);
    return true;
  }
}

/** Native size item is owned by the canonical shared size responsibility. */
export { SvxSizeItem } from "./frmitems.size";

/** Native UL declaration is owned by the matching ulspitem.hxx module. */
export { SvxULSpaceItem } from "../../inc/ulspitem";

/** Native LR declaration is owned by the matching lrspitem.hxx module. */
export {
  SvxLRSpaceItem,
  SvxRightMarginItem,
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../../inc/lrspitem";

export { SvxShadowItem, SvxShadowItemSide } from "./frmitems.shadow";

export { SvxLineItem } from "./frmitems.line";

export { SvxPaperBinItem } from "./frmitems.pbin";
