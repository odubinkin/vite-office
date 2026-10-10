/**
 * @fileoverview Reimplements bounded paragraph margin, first-line indent, and spacing items from pinned `editeng/source/items/frmitems.cxx`.
 */

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
  public QueryValue(member?: number): boolean | readonly boolean[] | undefined {
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
  public PutValue(value: boolean, member: number): boolean {
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
/** UNO BorderLine2 represented numeric fields. */
export interface BorderLine2 {
  readonly Color: number;
  readonly InnerLineWidth: number;
  readonly OuterLineWidth: number;
  readonly LineDistance: number;
  readonly LineStyle: number;
  readonly LineWidth: number;
}
/** Casts a native metric to signed16. @param value - Metric. @returns Signed metric. */
function boxInt16(value: number): number {
  return (Math.trunc(value) << 16) >> 16;
}
/** Converts supported native metric units. @param value - Metric. @param convert - Convert twips to mm100. @returns Converted metric. */
function boxUnoMetric(value: number, convert: boolean): number {
  return convert ? roundBorderMetric(value, 127 / 72) : value;
}
/** Validates and converts a represented UNO line. @param value - UNO payload. @param convert - Input uses mm100. @returns Native line, absent line, or false on invalid input. */
function boxUnoLine(value: unknown, convert: boolean): SvxBorderLine | undefined | false {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  if (
    ![data.Color, data.InnerLineWidth, data.OuterLineWidth, data.LineDistance].every(
      /** Admits numeric UNO components. @param field - Component. @returns Whether integer. */
      (field) => typeof field === "number" && Number.isInteger(field),
    )
  )
    return false;
  const metric =
    /** Converts input metric. @param number - Metric. @returns Twips. */
    (number: number): number => (convert ? roundBorderMetric(number, 72 / 127) : number);
  const rawStyle = typeof data.LineStyle === "number" ? data.LineStyle : SvxBorderLineStyle.SOLID;
  const style = rawStyle < 0 || rawStyle > 17 ? SvxBorderLineStyle.SOLID : rawStyle;
  const line = new SvxBorderLine();
  line.SetBorderLineStyle(style);
  line.SetColor(data.Color as number);
  const width = typeof data.LineWidth === "number" ? data.LineWidth : 0;
  if (width !== 0) line.SetWidth(metric(width));
  if (
    width === 0 ||
    ((style === 3 || style === 15) &&
      (data.InnerLineWidth as number) > 0 &&
      (data.OuterLineWidth as number) > 0)
  )
    line.GuessLinesWidths(
      style,
      metric(data.OuterLineWidth as number) & 0xffff,
      metric(data.InnerLineWidth as number) & 0xffff,
      metric(data.LineDistance as number) & 0xffff,
    );
  return line.isEmpty() ? undefined : line;
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
  /** Creates a zero-distance, borderless native item. @param which - Item identity. @returns Nothing. */
  public constructor(which: number) {
    super(which);
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
  public SetRemoveAdjCellBorder(value: boolean): void {
    this.removeAdjacent = value;
  }
  /** Reads the adjacent-cell border removal flag. @returns Policy. */
  public GetRemoveAdjCellBorder(): boolean {
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
  public ScaleMetrics(scale: number): void {
    for (const edge of [0, 1, 2, 3]) {
      this.lines[edge]?.ScaleMetrics(scale);
      this.SetDistance(roundBorderMetric(this.GetDistance(edge, true), scale), edge);
    }
  }
  /** Reports native metric support. @returns True. */
  public HasMetrics(): boolean {
    return true;
  }
  /** Converts a native line to its represented UNO fields. @param line - Native line. @param convert - Convert to mm100. @returns UNO line. */
  public static SvxLineToLine(line: SvxBorderLine | undefined, convert = false): BorderLine2 {
    return {
      Color: (line?.GetColor() ?? 0) | 0,
      InnerLineWidth: boxUnoMetric(line?.GetInWidth() ?? 0, convert) & 0xffff,
      OuterLineWidth: boxUnoMetric(line?.GetOutWidth() ?? 0, convert) & 0xffff,
      LineDistance: boxUnoMetric(line?.GetDistance() ?? 0, convert) & 0xffff,
      LineStyle: line?.GetBorderLineStyle() ?? SvxBorderLineStyle.NONE,
      LineWidth: boxUnoMetric(line?.GetWidth() ?? 0, convert) >>> 0,
    };
  }
  /** Reads native default sequence or individual border/distance members. @param member - Native member plus optional CONVERT_TWIPS. @returns Represented UNO value. */
  public QueryValue(member = 0): unknown {
    const convert = (member & 0x80) !== 0;
    member &= 0x7f;
    if (member === 0)
      return [
        ...[2, 3, 1, 0].map(
          /** Projects one native border. @param edge - Edge. @returns UNO line. */
          (edge) => SvxBoxItem.SvxLineToLine(this.GetLine(edge), convert),
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
    return SvxBoxItem.SvxLineToLine(this.GetLine(edge ?? -1), convert);
  }
  /** Applies represented native sequence or border/distance members. @param value - UNO payload. @param member - Native member plus optional CONVERT_TWIPS. @returns Whether admitted. */
  public PutValue(value: unknown, member = 0): boolean {
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
  /** Creates the native default inner-border item. @param which - Slot identity. @returns Nothing. */
  public constructor(which: number) {
    super(which);
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
  public ScaleMetrics(scale: number): void {
    for (const line of this.lines) line?.ScaleMetrics(scale);
    this.SetDefDist(roundBorderMetric(this.defaultDistance, scale));
  }
  /** Reports native metric support. @returns True. */
  public HasMetrics(): boolean {
    return true;
  }
  /** Reads the native five-field sequence or represented member. @param member - Member plus optional CONVERT_TWIPS. @returns UNO payload. */
  public QueryValue(member = 0): unknown {
    const convert = (member & 0x80) !== 0;
    member &= 0x7f;
    const flags = (this.IsTable() ? 1 : 0) | (this.distance ? 2 : 0) | (this.minimum ? 4 : 0);
    if (member === 0)
      return [
        SvxBoxItem.SvxLineToLine(this.GetHori(), convert),
        SvxBoxItem.SvxLineToLine(this.GetVert(), convert),
        flags,
        this.validFlags,
        boxUnoMetric(this.defaultDistance, convert),
      ];
    if (member === 1 || member === 2)
      return SvxBoxItem.SvxLineToLine(this.GetLine(member - 1), convert);
    if (member === 0x2e) return flags;
    if (member === 4) return this.validFlags;
    if (member === 0x29) return boxUnoMetric(this.defaultDistance, convert);
    return undefined;
  }
  /** Applies represented native sequence or member values. @param value - UNO payload. @param member - Native member plus optional CONVERT_TWIPS. @returns Native admission result. */
  public PutValue(value: unknown, member = 0): boolean {
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

/** Owns the two-dimensional native size item from sizeitem.hxx and frmitems.cxx. */
export class SvxSizeItem extends SfxPoolItem {
  /** Creates an independent twip size. @param which - Native item identity. @param size - Authored dimensions. @returns Nothing. */
  public constructor(
    which: number,
    private size = { width: 0, height: 0 },
  ) {
    super(which);
    this.size = { ...size };
  }
  /** Reads the independent native dimensions. @returns Twip dimensions. */
  public GetSize(): Readonly<{ width: number; height: number }> {
    return { ...this.size };
  }
  /** Replaces native dimensions. @param size - Twip dimensions. @returns Nothing. */
  public SetSize(size: Readonly<{ width: number; height: number }>): void {
    this.size = { ...size };
  }
  /** Reads native width. @returns Twips. */
  public GetWidth(): number {
    return this.size.width;
  }
  /** Reads native height. @returns Twips. */
  public GetHeight(): number {
    return this.size.height;
  }
  /** Replaces native width. @param width - Twips. @returns Nothing. */
  public SetWidth(width: number): void {
    this.size.width = width;
  }
  /** Replaces native height. @param height - Twips. @returns Nothing. */
  public SetHeight(height: number): void {
    this.size.height = height;
  }
  /** Copies actual size and item identity. @returns Independent item. */
  public Clone(): SvxSizeItem {
    return new SvxSizeItem(this.Which(), this.GetSize());
  }
  /** Compares native identity and both dimensions. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxSizeItem &&
      other.Which() === this.Which() &&
      other.GetWidth() === this.GetWidth() &&
      other.GetHeight() === this.GetHeight()
    );
  }
  /** Exposes the supported default native size value without twip conversion. @returns Native dimensions. */
  public QueryValue(): Readonly<{ Width: number; Height: number }> {
    return { Width: this.GetWidth(), Height: this.GetHeight() };
  }
}

/** Stores Writer's direct text-left margin in twips, matching the bounded `SvxTextLeftMarginItem` role. */
export class SvxTextLeftMarginItem extends SfxPoolItem {
  /** Creates a left-margin item. @param textLeft - Direct text-left margin in twips. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly textLeft: number,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(textLeft)) throw new Error("SvxTextLeftMarginItem value is invalid.");
  }

  /** Returns the resolved direct text-left margin in twips. @returns Margin. */
  public ResolveTextLeft(): number {
    return this.textLeft;
  }

  /** Creates an independent left-margin item. @returns Cloned item. */
  public Clone(): SvxTextLeftMarginItem {
    return new SvxTextLeftMarginItem(this.textLeft, this.Which());
  }

  /** Compares item identity and margin value. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxTextLeftMarginItem &&
      other.Which() === this.Which() &&
      other.textLeft === this.textLeft
    );
  }

  /** Returns the persistence-safe twip margin. @returns Margin. */
  public QueryValue(): number {
    return this.textLeft;
  }
}

/** Stores Writer's first-line indent in twips. */
export class SvxFirstLineIndentItem extends SfxPoolItem {
  /** Creates an indent item. @param value - Signed twip indent. @param which - Item identity. @param autoFirst - Whether Writer computes indent from font height. @returns Nothing. */
  public constructor(
    private readonly value: number,
    which: number,
    private readonly autoFirst = false,
  ) {
    super(which);
    if (!Number.isInteger(value)) throw new Error("SvxFirstLineIndentItem value is invalid.");
  }
  /** Returns the signed first-line indent. @returns Twips. */
  public ResolveTextFirstLineOffset(): number {
    return this.value;
  }
  /** Returns upstream automatic first-line mode. @returns Whether font height controls the indent. */
  public IsAutoFirst(): boolean {
    return this.autoFirst;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxFirstLineIndentItem {
    return new SvxFirstLineIndentItem(this.value, this.Which(), this.autoFirst);
  }
  /** Compares identity and value. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxFirstLineIndentItem &&
      other.Which() === this.Which() &&
      other.value === this.value &&
      other.autoFirst === this.autoFirst
    );
  }
  /** Serializes the indent. @returns Twips. */
  public QueryValue(): number | readonly [number, 1] {
    return this.autoFirst ? [this.value, 1] : this.value;
  }
}

/** Stores Writer's right paragraph margin in twips. */
export class SvxRightMarginItem extends SfxPoolItem {
  /** Creates a margin item. @param value - Signed twip margin. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly value: number,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(value)) throw new Error("SvxRightMarginItem value is invalid.");
  }
  /** Returns the right margin. @returns Twips. */
  public ResolveRight(): number {
    return this.value;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxRightMarginItem {
    return new SvxRightMarginItem(this.value, this.Which());
  }
  /** Compares identity and value. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxRightMarginItem &&
      other.Which() === this.Which() &&
      other.value === this.value
    );
  }
  /** Serializes the margin. @returns Twips. */
  public QueryValue(): number {
    return this.value;
  }
}

/** Native UL declaration is owned by the matching ulspitem.hxx module. */
export { SvxULSpaceItem } from "../../inc/ulspitem";

/** Native LR declaration is owned by the matching lrspitem.hxx module. */
export { SvxLRSpaceItem } from "../../inc/lrspitem";
