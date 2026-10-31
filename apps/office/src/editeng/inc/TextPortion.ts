/** @fileoverview Original TextPortion.hxx values, owned optional information and copy semantics. No device measurement is supplied. */
import { Size, type ReadonlySize } from "../../tools/inc/gen";
/** Original portion discriminator. */
export enum PortionKind {
  TEXT = 0,
  TAB = 1,
  LINEBREAK = 2,
  FIELD = 3,
  HYPHENATOR = 4,
}
/** Original independent Asian compression flags. */
export enum AsianCompressionFlags {
  Normal = 0,
  Kana = 1,
  PunctuationLeft = 2,
  PunctuationRight = 4,
}
/** Original optional compression/line-breaking values. */
export class ExtraPortionInfo {
  public nOrgWidth = 0;
  public nWidthFullCompression = 0;
  public nPortionOffsetX = 0;
  public nMaxCompression100thPercent = 0;
  public nAsianCompressionTypes = AsianCompressionFlags.Normal;
  public bCompressed = false;
  public pOrgDXArray: number[] | null = null;
  public readonly lineBreaksList: number[] = [];
  /** Original optional array replacement with independent copied values. @param values - Borrowed source doubles or null. @param length - Source defined copy length. @returns Nothing. */
  SaveOrgDXArray(values: readonly number[] | null, length: number): void {
    this.pOrgDXArray = values === null ? null : values.slice(0, length);
  }
}
/** Original ruby offsets and unsigned16 ascent. */
export class RubyPortionInfo {
  public nXOffset = 0;
  public nYOffset = 0;
  public nMaxAscent = 0;
}
/** Original text-portion value; copy construction deliberately does not copy either optional information owner. */
export class TextPortion {
  private xExtraInfos: ExtraPortionInfo | null = null;
  private xRubyInfos: RubyPortionInfo | null = null;
  private nLen: number;
  private readonly aOutSz: Size;
  private nKind = PortionKind.TEXT;
  private nRightToLeftLevel = 0;
  private nExtraValue = 0;
  /** Original length and implicit-copy overloads. @param source - Source length or borrowed original value. @returns Actual value. */
  constructor(source: number | TextPortion) {
    this.nLen = typeof source === "number" ? source : source.nLen;
    this.aOutSz = typeof source === "number" ? new Size(-1, -1) : new Size(source.aOutSz);
    if (source instanceof TextPortion) {
      this.nKind = source.nKind;
      this.nRightToLeftLevel = source.nRightToLeftLevel;
      this.nExtraValue = source.nExtraValue;
    }
  }
  /** Original length. @returns Stored length. */
  GetLen(): number {
    return this.nLen;
  }
  /** Original length assignment. @param length - Source signed32. @returns Nothing. */
  SetLen(length: number): void {
    this.nLen = length;
  }
  /** Original width-only mutation. @param width - Source width. @returns Nothing. */
  setWidth(width: number): void {
    this.aOutSz.setWidth(width);
  }
  /** Original height-only mutation. @param height - Source height. @returns Nothing. */
  setHeight(height: number): void {
    this.aOutSz.setHeight(height);
  }
  /** Original conditional size adjustment. @param x - Width increment. @param y - Height increment. @returns Nothing. */
  adjustSize(x: number, y: number): void {
    if (x !== 0) this.aOutSz.AdjustWidth(x);
    if (y !== 0) this.aOutSz.AdjustHeight(y);
  }
  /** Original size value assignment retaining the member identity. @param size - Borrowed size. @returns Nothing. */
  SetSize(size: ReadonlySize): void {
    this.aOutSz.setWidth(size.Width());
    this.aOutSz.setHeight(size.Height());
  }
  /** Original borrowed const size. @returns Actual member. */
  GetSize(): ReadonlySize {
    return this.aOutSz;
  }
  /** Original kind assignment. @param kind - Source kind. @returns Nothing. */
  SetKind(kind: PortionKind): void {
    this.nKind = kind;
  }
  /** Original kind query. @returns Source kind. */
  GetKind(): PortionKind {
    return this.nKind;
  }
  /** Original uint8 bidi level assignment. @param level - Source level. @returns Nothing. */
  SetRightToLeftLevel(level: number): void {
    this.nRightToLeftLevel = level & 255;
  }
  /** Original stored bidi level. @returns Level. */
  GetRightToLeftLevel(): number {
    return this.nRightToLeftLevel;
  }
  /** Original odd-level predicate. @returns RTL flag. */
  IsRightToLeft(): boolean {
    return Boolean(this.nRightToLeftLevel & 1);
  }
  /** Original Unicode unit. @returns Stored unit. */
  GetExtraValue(): number {
    return this.nExtraValue;
  }
  /** Original unsigned16 unit assignment. @param value - Source unit. @returns Nothing. */
  SetExtraValue(value: number): void {
    this.nExtraValue = value & 65535;
  }
  /** Original borrowed optional compression information. @returns Actual owner or null. */
  GetExtraInfos(): ExtraPortionInfo | null {
    return this.xExtraInfos;
  }
  /** Original unique-owner replacement. @param info - Transferred owner. @returns Nothing. */
  SetExtraInfos(info: ExtraPortionInfo | null): void {
    this.xExtraInfos = info;
  }
  /** Original borrowed const optional ruby information. @returns Actual value or null. */
  GetRubyInfos(): Readonly<RubyPortionInfo> | null {
    return this.xRubyInfos;
  }
  /** Original unique-owner replacement. @param info - Transferred owner. @returns Nothing. */
  SetRubyInfos(info: RubyPortionInfo | null): void {
    this.xRubyInfos = info;
  }
}
