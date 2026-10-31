/** @fileoverview Original EditLine state, differing copy/clone/assignment groups and source size accumulation. */
import { Size } from "../../tools/inc/gen";
import { PortionKind } from "./TextPortion";
import type { ParaPortion } from "./ParagraphPortion";
/** Actual original line value; KernArray is the original vector<double>, bound to a number array. */
export class EditLine {
  private readonly maPositions: number[] = [];
  private readonly maKashidaPositions: boolean[] = [];
  private mnTextWidth = 0;
  private mnStartPosX = 0;
  private mnNextLinePosXDiff = 0;
  private readonly mnStart: [number] = [0];
  private readonly mnEnd: [number] = [0];
  private readonly mnStartPortion: [number] = [0];
  private readonly mnEndPortion: [number] = [0];
  private mnHeight = 0;
  private mnTextHeight = 0;
  private mnMaxAscent = 0;
  private mbHangingPunctuation = false;
  private mbInvalid = true;
  /** Original default and partial-copy constructor, deliberately retaining default metrics/vectors/invalid state. @param source - Optional source value. @returns Line. */
  constructor(source?: EditLine) {
    if (source) {
      this.assign(source);
      this.mbHangingPunctuation = source.mbHangingPunctuation;
    }
  }
  /** Original assignment copies only raw and portion endpoints. @param source - Borrowed source. @returns This line. */
  assign(source: EditLine): this {
    this.mnEnd[0] = source.mnEnd[0];
    this.mnStart[0] = source.mnStart[0];
    this.mnEndPortion[0] = source.mnEndPortion[0];
    this.mnStartPortion[0] = source.mnStartPortion[0];
    return this;
  }
  /** Original endpoint-only equality. @param other - Compared line. @returns Source equality. */
  equals(other: EditLine): boolean {
    return (
      this.mnStart[0] === other.mnStart[0] &&
      this.mnEnd[0] === other.mnEnd[0] &&
      this.mnStartPortion[0] === other.mnStartPortion[0] &&
      this.mnEndPortion[0] === other.mnEndPortion[0]
    );
  }
  /** Original half-open or explicitly end-inclusive membership. @param index - Source raw position. @param includeEnd - Original selected overload. @returns Membership. */
  IsIn(index: number, includeEnd = false): boolean {
    return (
      index >= this.mnStart[0] && (includeEnd ? index <= this.mnEnd[0] : index < this.mnEnd[0])
    );
  }
  /** Original stored Start value. @returns Scalar. */
  GetStart(): number;
  /** Original mutable endpoint lvalue. @param mutable - Selected mutable overload. @returns Stable scalar cell. */
  GetStart(mutable: true): [number];
  /** Binds the original const/reference overload. @param mutable - Mutable selection. @returns Stored scalar or lvalue. */
  GetStart(mutable?: true): number | [number] {
    return mutable ? this.mnStart : this.mnStart[0];
  }
  /** Original Start assignment without layout clamping. @param value - Source scalar. @returns Nothing. */
  SetStart(value: number): void {
    this.mnStart[0] = value;
  }
  /** Original stored End value. @returns Scalar. */
  GetEnd(): number;
  /** Original mutable endpoint lvalue. @param mutable - Selected mutable overload. @returns Stable scalar cell. */
  GetEnd(mutable: true): [number];
  /** Binds the original const/reference overload. @param mutable - Mutable selection. @returns Stored scalar or lvalue. */
  GetEnd(mutable?: true): number | [number] {
    return mutable ? this.mnEnd : this.mnEnd[0];
  }
  /** Original End assignment without layout clamping. @param value - Source scalar. @returns Nothing. */
  SetEnd(value: number): void {
    this.mnEnd[0] = value;
  }
  /** Original stored StartPortion value. @returns Scalar. */
  GetStartPortion(): number;
  /** Original mutable endpoint lvalue. @param mutable - Selected mutable overload. @returns Stable scalar cell. */
  GetStartPortion(mutable: true): [number];
  /** Binds the original const/reference overload. @param mutable - Mutable selection. @returns Stored scalar or lvalue. */
  GetStartPortion(mutable?: true): number | [number] {
    return mutable ? this.mnStartPortion : this.mnStartPortion[0];
  }
  /** Original StartPortion assignment without layout clamping. @param value - Source scalar. @returns Nothing. */
  SetStartPortion(value: number): void {
    this.mnStartPortion[0] = value;
  }
  /** Original stored EndPortion value. @returns Scalar. */
  GetEndPortion(): number;
  /** Original mutable endpoint lvalue. @param mutable - Selected mutable overload. @returns Stable scalar cell. */
  GetEndPortion(mutable: true): [number];
  /** Binds the original const/reference overload. @param mutable - Mutable selection. @returns Stored scalar or lvalue. */
  GetEndPortion(mutable?: true): number | [number] {
    return mutable ? this.mnEndPortion : this.mnEndPortion[0];
  }
  /** Original EndPortion assignment without layout clamping. @param value - Source scalar. @returns Nothing. */
  SetEndPortion(value: number): void {
    this.mnEndPortion[0] = value;
  }
  /** Original stored TextWidth value. @returns Scalar. */
  GetTextWidth(): number {
    return this.mnTextWidth;
  }
  /** Original TextWidth assignment without layout clamping. @param value - Source scalar. @returns Nothing. */
  SetTextWidth(value: number): void {
    this.mnTextWidth = value;
  }
  /** Original stored MaxAscent value. @returns Scalar. */
  GetMaxAscent(): number {
    return this.mnMaxAscent;
  }
  /** Original MaxAscent assignment without layout clamping. @param value - Source scalar. @returns Nothing. */
  SetMaxAscent(value: number): void {
    this.mnMaxAscent = value & 65535;
  }
  /** Original stored StartPosX value. @returns Scalar. */
  GetStartPosX(): number {
    return this.mnStartPosX;
  }
  /** Original StartPosX assignment without layout clamping. @param value - Source scalar. @returns Nothing. */
  SetStartPosX(value: number): void {
    this.mnStartPosX = value;
  }
  /** Original stored NextLinePosXDiff value. @returns Scalar. */
  GetNextLinePosXDiff(): number {
    return this.mnNextLinePosXDiff;
  }
  /** Original NextLinePosXDiff assignment without layout clamping. @param value - Source scalar. @returns Nothing. */
  SetNextLinePosXDiff(value: number): void {
    this.mnNextLinePosXDiff = value;
  }
  /** Original paired unsigned16 heights, with zero text height selecting total height. @param height - Total height. @param textHeight - Pure text height or zero. @returns Nothing. */
  SetHeight(height: number, textHeight = 0): void {
    this.mnHeight = height & 65535;
    textHeight &= 65535;
    this.mnTextHeight = textHeight !== 0 ? textHeight : this.mnHeight;
  }
  /** Original total height. @returns Height. */
  GetHeight(): number {
    return this.mnHeight;
  }
  /** Original text height. @returns Height. */
  GetTxtHeight(): number {
    return this.mnTextHeight;
  }
  /** Original punctuation flag. @param value - Source flag. @returns Nothing. */
  SetHangingPunctuation(value: boolean): void {
    this.mbHangingPunctuation = value;
  }
  /** Original punctuation query. @returns Flag. */
  IsHangingPunctuation(): boolean {
    return this.mbHangingPunctuation;
  }
  /** Original raw range length. @returns Difference. */
  GetLen(): number {
    return this.mnEnd[0] - this.mnStart[0];
  }
  /** Original invalid flag. @returns Flag. */
  IsInvalid(): boolean {
    return this.mbInvalid;
  }
  /** Original valid predicate. @returns Predicate. */
  IsValid(): boolean {
    return !this.mbInvalid;
  }
  /** Original invalid assignment. @returns Nothing. */
  SetInvalid(): void {
    this.mbInvalid = true;
  }
  /** Original valid assignment. @returns Nothing. */
  SetValid(): void {
    this.mbInvalid = false;
  }
  /** Original empty/reversed span predicate. @returns Predicate. */
  IsEmpty(): boolean {
    return this.mnEnd[0] <= this.mnStart[0];
  }
  /** Original stable mutable KernArray member. @returns Actual double vector. */
  GetCharPosArray(): number[] {
    return this.maPositions;
  }
  /** Original stable mutable kashida vector. @returns Actual vector. */
  GetKashidaArray(): boolean[] {
    return this.maKashidaPositions;
  }
  /** Original explicit Clone copies metrics and character positions, but not kashida/punctuation/validity. @returns Independent line. */
  Clone(): EditLine {
    const line = new EditLine();
    for (const position of this.maPositions) line.maPositions.push(position);
    line.mnStartPosX = this.mnStartPosX;
    line.mnNextLinePosXDiff = this.mnNextLinePosXDiff;
    line.mnStart[0] = this.mnStart[0];
    line.mnEnd[0] = this.mnEnd[0];
    line.mnStartPortion[0] = this.mnStartPortion[0];
    line.mnEndPortion[0] = this.mnEndPortion[0];
    line.mnHeight = this.mnHeight;
    line.mnTextWidth = this.mnTextWidth;
    line.mnTextHeight = this.mnTextHeight;
    line.mnMaxAscent = this.mnMaxAscent;
    return line;
  }
  /** Original accumulated geometry from already measured portions, without any fabricated measurement service. @param paragraph - Actual paragraph portion. @returns Copied accumulated size. */
  CalcTextSize(paragraph: ParaPortion): Size {
    const size = new Size();
    for (let index = this.mnStartPortion[0]; index <= this.mnEndPortion[0]; index++) {
      const portion = paragraph.GetTextPortions().at(index);
      switch (portion.GetKind()) {
        case PortionKind.TEXT:
        case PortionKind.FIELD:
        case PortionKind.HYPHENATOR:
          size.AdjustWidth(portion.GetSize().Width());
          if (size.Height() < portion.GetSize().Height())
            size.setHeight(portion.GetSize().Height());
          break;
        case PortionKind.TAB:
          size.AdjustWidth(portion.GetSize().Width());
          break;
        case PortionKind.LINEBREAK:
          break;
      }
    }
    this.SetHeight(size.Height() & 65535);
    return size;
  }
}
