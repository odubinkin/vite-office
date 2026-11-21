/** @fileoverview Browser-relevant SwLineNumberInfo fields from pinned sw/inc/lineinfo.hxx. */
import { SvxNumberType } from "../../editeng/source/items/numitem";
import type { SvxNumType } from "../../editeng/inc/svxenum";
import type { SwDoc } from "../source/core/doc/doc";
import type { SwCharFormat } from "./charfmt";

/** Pinned LineNumberPosition order. */
export enum LineNumberPosition {
  Left,
  Right,
  Inside,
  Outside,
}

/** Value copied across Writer document, ODF and browser transfer boundaries. */
export interface SwLineNumberInfoValue {
  readonly divider: string;
  readonly dividerCountBy: number;
  readonly posFromLeft: number;
  readonly countBy: number;
  readonly position: LineNumberPosition;
  readonly paintLineNumbers: boolean;
  readonly countBlankLines: boolean;
  readonly countInFlys: boolean;
  readonly restartEachPage: boolean;
  readonly numberingType?: number;
  readonly charStyleName?: string;
}

/** Document-owned line-number configuration with native numbering and character style owners. */
export class SwLineNumberInfo {
  private value: Omit<SwLineNumberInfoValue, "numberingType" | "charStyleName">;
  private numType: SvxNumberType;
  private charFormat: SwCharFormat | undefined;

  /** Creates the pinned Writer defaults or copies a complete value. @param value - Optional imported or copied value. @returns Nothing. */
  public constructor(value?: SwLineNumberInfoValue) {
    this.numType = new SvxNumberType(value?.numberingType as SvxNumType | undefined);
    this.value = {
      divider: value?.divider ?? "",
      dividerCountBy: (value?.dividerCountBy ?? 3) & 65535,
      posFromLeft: (value?.posFromLeft ?? 283) & 65535,
      countBy: (value?.countBy ?? 5) & 65535,
      position: value?.position ?? LineNumberPosition.Left,
      paintLineNumbers: value?.paintLineNumbers ?? false,
      countBlankLines: value?.countBlankLines ?? true,
      countInFlys: value?.countInFlys ?? false,
      restartEachPage: value?.restartEachPage ?? false,
    };
  }

  /** Restores validated browser state and binds the document-owned character style. @param candidate - Stored value. @param document - Owner of any transferred character style. @returns Line-number configuration. */
  public static FromValue(candidate: unknown, document?: SwDoc): SwLineNumberInfo {
    if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate))
      throw new Error("Stored Writer line numbering is invalid.");
    const value = candidate as Record<string, unknown>;
    if (
      typeof value.divider !== "string" ||
      !isUnsigned16(value.dividerCountBy) ||
      !isUnsigned16(value.posFromLeft) ||
      !isUnsigned16(value.countBy) ||
      !Number.isInteger(value.position) ||
      (value.position as number) < LineNumberPosition.Left ||
      (value.position as number) > LineNumberPosition.Outside ||
      typeof value.paintLineNumbers !== "boolean" ||
      typeof value.countBlankLines !== "boolean" ||
      typeof value.countInFlys !== "boolean" ||
      typeof value.restartEachPage !== "boolean" ||
      (value.numberingType !== undefined &&
        (!Number.isInteger(value.numberingType) ||
          (value.numberingType as number) < -32768 ||
          (value.numberingType as number) > 32767)) ||
      (value.charStyleName !== undefined && typeof value.charStyleName !== "string")
    )
      throw new Error("Stored Writer line numbering is invalid.");
    const { charStyleName, ...settings } = value as unknown as SwLineNumberInfoValue;
    const info = new SwLineNumberInfo(settings);
    if (charStyleName !== undefined) {
      const style =
        document?.FindCharFormatByName(charStyleName) ??
        (document?.GetDfltCharFormat().GetName() === charStyleName
          ? document.GetDfltCharFormat()
          : undefined);
      if (!style) throw new Error("Stored Writer line-number character style is invalid.");
      info.SetCharFormat(style);
    }
    return info;
  }

  /** Returns an independent configuration copy. @returns Clone. */
  public Clone(): SwLineNumberInfo {
    const copy = new SwLineNumberInfo(this.value);
    copy.SetNumType(this.numType);
    if (this.charFormat) copy.SetCharFormat(this.charFormat);
    return copy;
  }
  /** Returns the complete immutable transfer value. @returns Value. */
  public QueryValue(): SwLineNumberInfoValue {
    return {
      ...this.value,
      numberingType: this.numType.GetNumberingType(),
      ...(this.charFormat ? { charStyleName: this.charFormat.GetName() } : {}),
    };
  }
  /** Compares every browser-relevant field. @param other - Candidate. @returns Equality. */
  public equals(other: SwLineNumberInfo): boolean {
    const left = this.value;
    const right = other.value;
    return (
      left.divider === right.divider &&
      left.dividerCountBy === right.dividerCountBy &&
      left.posFromLeft === right.posFromLeft &&
      left.countBy === right.countBy &&
      left.position === right.position &&
      left.paintLineNumbers === right.paintLineNumbers &&
      left.countBlankLines === right.countBlankLines &&
      left.countInFlys === right.countInFlys &&
      left.restartEachPage === right.restartEachPage &&
      this.numType.GetNumberingType() === other.numType.GetNumberingType() &&
      this.charFormat === other.charFormat
    );
  }
  /** Borrows the explicitly bound character format without creating the pool fallback. @returns Native format if set. */
  public GetCharFormat(): SwCharFormat | undefined {
    return this.charFormat;
  }
  /** Binds the native character format used by line numbering. @param format - Actual document format. @returns Nothing. */
  public SetCharFormat(format: SwCharFormat): void {
    this.charFormat = format;
  }
  /** Returns the native numbering format value. @returns Read-only numbering format. */
  public GetNumType(): Readonly<SvxNumberType> {
    return this.numType;
  }
  /** Copies the native numbering format. @param type - Numbering format. @returns Nothing. */
  public SetNumType(type: Readonly<SvxNumberType>): void {
    this.numType = new SvxNumberType(type);
  }
  /** Returns the divider text. @returns Divider. */
  public GetDivider(): string {
    return this.value.divider;
  }
  /** Changes divider text. @param divider - New divider. @returns Nothing. */
  public SetDivider(divider: string): void {
    this.value = { ...this.value, divider };
  }
  /** Returns divider interval. @returns Interval. */
  public GetDividerCountBy(): number {
    return this.value.dividerCountBy;
  }
  /** Changes divider interval. @param count - New interval. @returns Nothing. */
  public SetDividerCountBy(count: number): void {
    this.value = { ...this.value, dividerCountBy: count & 65535 };
  }
  /** Returns gutter offset in twips. @returns Offset. */
  public GetPosFromLeft(): number {
    return this.value.posFromLeft;
  }
  /** Changes gutter offset. @param position - Twips. @returns Nothing. */
  public SetPosFromLeft(position: number): void {
    this.value = { ...this.value, posFromLeft: position & 65535 };
  }
  /** Returns count interval. @returns Interval. */
  public GetCountBy(): number {
    return this.value.countBy;
  }
  /** Changes count interval. @param count - New interval. @returns Nothing. */
  public SetCountBy(count: number): void {
    this.value = { ...this.value, countBy: count & 65535 };
  }
  /** Returns paint position. @returns Position. */
  public GetPos(): LineNumberPosition {
    return this.value.position;
  }
  /** Changes paint position. @param position - New position. @returns Nothing. */
  public SetPos(position: LineNumberPosition): void {
    this.value = { ...this.value, position };
  }
  /** Returns whether numbers are painted. @returns Paint flag. */
  public IsPaintLineNumbers(): boolean {
    return this.value.paintLineNumbers;
  }
  /** Changes the paint flag. @param paint - New flag. @returns Nothing. */
  public SetPaintLineNumbers(paint: boolean): void {
    this.value = { ...this.value, paintLineNumbers: paint };
  }
  /** Returns whether blank lines participate. @returns Count flag. */
  public IsCountBlankLines(): boolean {
    return this.value.countBlankLines;
  }
  /** Changes blank-line participation. @param count - New flag. @returns Nothing. */
  public SetCountBlankLines(count: boolean): void {
    this.value = { ...this.value, countBlankLines: count };
  }
  /** Returns whether fly-frame lines participate. @returns Count flag. */
  public IsCountInFlys(): boolean {
    return this.value.countInFlys;
  }
  /** Changes fly-frame participation. @param count - New flag. @returns Nothing. */
  public SetCountInFlys(count: boolean): void {
    this.value = { ...this.value, countInFlys: count };
  }
  /** Returns whether numbering restarts per page. @returns Restart flag. */
  public IsRestartEachPage(): boolean {
    return this.value.restartEachPage;
  }
  /** Changes page restart behavior. @param restart - New flag. @returns Nothing. */
  public SetRestartEachPage(restart: boolean): void {
    this.value = { ...this.value, restartEachPage: restart };
  }
}

/** Validates the represented transfer width before native-typed core construction. @param value - Untrusted scalar. @returns Whether an unsigned16 integer. */
function isUnsigned16(value: unknown): boolean {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 65535;
}
