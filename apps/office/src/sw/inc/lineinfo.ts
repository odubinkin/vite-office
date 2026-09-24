/** @fileoverview Browser-relevant SwLineNumberInfo fields from pinned sw/inc/lineinfo.hxx. */

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
}

/** Document-owned line-number configuration; character style and native frame attachments are outside the browser slice. */
export class SwLineNumberInfo {
  private value: SwLineNumberInfoValue;

  /** Creates the pinned Writer defaults or copies a complete value. @param value - Optional imported or copied value. @returns Nothing. */
  public constructor(value?: SwLineNumberInfoValue) {
    this.value =
      value === undefined
        ? {
            divider: "",
            dividerCountBy: 3,
            posFromLeft: 283,
            countBy: 5,
            position: LineNumberPosition.Left,
            paintLineNumbers: false,
            countBlankLines: true,
            countInFlys: false,
            restartEachPage: false,
          }
        : { ...value };
  }

  /** Restores a validated browser transfer value. @param candidate - Stored value. @returns Line-number configuration. */
  public static FromValue(candidate: unknown): SwLineNumberInfo {
    if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate))
      throw new Error("Stored Writer line numbering is invalid.");
    const value = candidate as Record<string, unknown>;
    if (
      typeof value.divider !== "string" ||
      !Number.isInteger(value.dividerCountBy) ||
      !Number.isInteger(value.posFromLeft) ||
      !Number.isInteger(value.countBy) ||
      !Number.isInteger(value.position) ||
      (value.position as number) < LineNumberPosition.Left ||
      (value.position as number) > LineNumberPosition.Outside ||
      typeof value.paintLineNumbers !== "boolean" ||
      typeof value.countBlankLines !== "boolean" ||
      typeof value.countInFlys !== "boolean" ||
      typeof value.restartEachPage !== "boolean"
    )
      throw new Error("Stored Writer line numbering is invalid.");
    return new SwLineNumberInfo(value as unknown as SwLineNumberInfoValue);
  }

  /** Returns an independent configuration copy. @returns Clone. */
  public Clone(): SwLineNumberInfo {
    return new SwLineNumberInfo(this.value);
  }
  /** Returns the complete immutable transfer value. @returns Value. */
  public QueryValue(): SwLineNumberInfoValue {
    return { ...this.value };
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
      left.restartEachPage === right.restartEachPage
    );
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
    this.value = { ...this.value, dividerCountBy: count };
  }
  /** Returns gutter offset in twips. @returns Offset. */
  public GetPosFromLeft(): number {
    return this.value.posFromLeft;
  }
  /** Changes gutter offset. @param position - Twips. @returns Nothing. */
  public SetPosFromLeft(position: number): void {
    this.value = { ...this.value, posFromLeft: position };
  }
  /** Returns count interval. @returns Interval. */
  public GetCountBy(): number {
    return this.value.countBy;
  }
  /** Changes count interval. @param count - New interval. @returns Nothing. */
  public SetCountBy(count: number): void {
    this.value = { ...this.value, countBy: count };
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
