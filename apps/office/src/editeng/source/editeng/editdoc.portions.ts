/** @fileoverview Actual ParaPortion and ParaPortionList owners with original editdoc.cxx invalidation, lookup and line-correction algorithms. Formatting is a separate engine responsibility. */
import type { ContentNode } from "../../inc/ContentNode";
import type { ScriptTypePosInfos, WritingDirectionInfos } from "../../inc/ParagraphPortion";
import { EditLineList } from "../../inc/EditLineList";
import { TextPortionList } from "../../inc/TextPortionList";
import { FastGetPos } from "./editdoc";
import { EE_PARA_MAX } from "../../inc/EPaM";
/** Original paragraph portion with real owning line/text lists and nonowning document node. */
export class ParaPortion {
  private readonly maLineList = new EditLineList();
  private readonly maTextPortionList = new TextPortionList();
  private readonly mpNode: ContentNode | null;
  private mnHeight = 0;
  private readonly maScriptInfos: ScriptTypePosInfos = [];
  private readonly maWritingDirectionInfos: WritingDirectionInfos = [];
  private mnInvalidPosStart = 0;
  private mnFirstLineOffset = 0;
  private mnBulletX = 0;
  private mnInvalidDiff = 0;
  private mbInvalid = true;
  private mbSimple = false;
  private mbVisible = true;
  private mbForceRepaint = false;
  /** Original constructor retains the actual nonowning pointer and all member defaults. @param node - Borrowed node or original null pointer. @returns Paragraph portion. */
  constructor(node: ContentNode | null) {
    this.mpNode = node;
  }
  /** Original borrowed line owner. @returns Actual list. */
  GetLines(): EditLineList {
    return this.maLineList;
  }
  /** Original invalid flag. @returns Flag. */
  IsInvalid(): boolean {
    return this.mbInvalid;
  }
  /** Original simple invalidation flag. @returns Flag. */
  IsSimpleInvalid(): boolean {
    return this.mbSimple;
  }
  /** Original validity assignment enables subsequent simple accumulation without resetting old positions. @returns Nothing. */
  SetValid(): void {
    this.mbInvalid = false;
    this.mbSimple = true;
  }
  /** Original forced repaint query. @returns Flag. */
  MustRepaint(): boolean {
    return this.mbForceRepaint;
  }
  /** Original forced repaint assignment. @param value - Source flag. @returns Nothing. */
  SetMustRepaint(value: boolean): void {
    this.mbForceRepaint = value;
  }
  /** Original bullet offset. @returns Offset. */
  GetBulletX(): number {
    return this.mnBulletX;
  }
  /** Original bullet offset assignment. @param value - Source offset. @returns Nothing. */
  SetBulletX(value: number): void {
    this.mnBulletX = value;
  }
  /** Original visibility assignment, without altering validity/height storage. @param visible - Source flag. @returns Nothing. */
  SetVisible(visible: boolean): void {
    this.mbVisible = visible;
  }
  /** Original visibility query. @returns Flag. */
  IsVisible(): boolean {
    return this.mbVisible;
  }
  /** Original single-empty-text-portion predicate. @returns Source predicate. */
  IsEmpty(): boolean {
    return this.maTextPortionList.isEmpty();
  }
  /** Original visible height, with actual layout-owned storage initially zero. @returns Source height. */
  GetHeight(): number {
    return this.mbVisible ? this.mnHeight : 0;
  }
  /** Original visible first-line offset. @returns Source offset. */
  GetFirstLineOffset(): number {
    return this.mbVisible ? this.mnFirstLineOffset : 0;
  }
  /** Original layout-cache reset. @returns Nothing. */
  ResetHeight(): void {
    this.mnHeight = 0;
    this.mnFirstLineOffset = 0;
  }
  /** Original stable mutable script vector. @returns Actual vector. */
  getScriptTypePosInfos(): ScriptTypePosInfos {
    return this.maScriptInfos;
  }
  /** Original stable mutable bidi vector. @returns Actual vector. */
  getWritingDirectionInfos(): WritingDirectionInfos {
    return this.maWritingDirectionInfos;
  }
  /** Original borrowed source pointer. @returns Actual node or null. */
  GetNode(): ContentNode | null {
    return this.mpNode;
  }
  /** Original stable mutable text-portion list. @returns Actual list. */
  GetTextPortions(): TextPortionList {
    return this.maTextPortionList;
  }
  /** Original invalidation start. @returns Source position. */
  GetInvalidPosStart(): number {
    return this.mnInvalidPosStart;
  }
  /** Original short return narrows the signed32 stored difference. @returns Signed16 difference. */
  GetInvalidDiff(): number {
    return (this.mnInvalidDiff << 16) >> 16;
  }
  /** Original incremental invalidation branch order, including the positive fallback using difference rather than start. @param start - Raw start. @param difference - Signed insertion/deletion length. @returns Nothing. */
  MarkInvalid(start: number, difference: number): void {
    if (!this.mbInvalid) {
      this.mnInvalidPosStart = difference >= 0 ? start : start + difference;
      this.mnInvalidDiff = difference;
    } else {
      if (
        difference > 0 &&
        this.mnInvalidDiff > 0 &&
        this.mnInvalidPosStart + this.mnInvalidDiff === start
      )
        this.mnInvalidDiff += difference;
      else if (difference < 0 && this.mnInvalidDiff < 0 && this.mnInvalidPosStart === start) {
        this.mnInvalidPosStart += difference;
        this.mnInvalidDiff += difference;
      } else {
        this.mnInvalidPosStart = Math.min(
          this.mnInvalidPosStart,
          difference < 0 ? start + difference : difference,
        );
        this.mnInvalidDiff = 0;
        this.mbSimple = false;
      }
    }
    this.mbInvalid = true;
    this.maScriptInfos.length = 0;
    this.maWritingDirectionInfos.length = 0;
  }
  /** Original selection invalidation discards both analysis caches and simple-difference mode. @param start - Raw start. @returns Nothing. */
  MarkSelectionInvalid(start: number): void {
    this.mnInvalidPosStart = this.mbInvalid ? Math.min(this.mnInvalidPosStart, start) : start;
    this.mnInvalidDiff = 0;
    this.mbInvalid = true;
    this.mbSimple = false;
    this.maScriptInfos.length = 0;
    this.maWritingDirectionInfos.length = 0;
  }
  /** Original half-open line lookup with original zero/last-line release fallbacks. @param index - Raw character position. @returns Source line index. */
  GetLineNumber(index: number): number {
    const count = this.maLineList.Count();
    if (count === 0) return 0;
    for (let line = 0; line < count; line++) if (this.maLineList.at(line).IsIn(index)) return line;
    return count - 1;
  }
  /** Original suffix line endpoint correction, preserving untouched prefix and exact valid-flag behavior. @param lastFormatted - Original last formatted line. @returns Nothing. */
  CorrectValuesBehindLastFormattedLine(lastFormatted: number): void {
    const count = this.maLineList.Count();
    if (lastFormatted < count - 1) {
      const formatted = this.maLineList.at(lastFormatted),
        unformatted = this.maLineList.at(lastFormatted + 1);
      const portionDifference = unformatted.GetStartPortion() - formatted.GetEndPortion();
      let textDifference = unformatted.GetStart() - formatted.GetEnd();
      textDifference++;
      const portionDelta = -(portionDifference - 1),
        textDelta = -(textDifference - 1);
      if (portionDelta || textDelta) {
        for (let index = lastFormatted + 1; index < count; index++) {
          const line = this.maLineList.at(index);
          line.GetStartPortion(true)[0] += portionDelta;
          line.GetEndPortion(true)[0] += portionDelta;
          line.GetStart(true)[0] += textDelta;
          line.GetEnd(true)[0] += textDelta;
          line.SetValid();
        }
      }
    }
  }
}
/** Original unique-owner paragraph-portion sequence, including the same reverse-lookup cache as EditDoc. */
export class ParaPortionList {
  private readonly nLastCache: [number] = [0];
  private readonly maPortions: ParaPortion[] = [];
  /** Original owner-vector clear. @returns Nothing. */
  Reset(): void {
    this.maPortions.length = 0;
  }
  /** Original existence check. @param position - Source index. @returns Source predicate. */
  exists(position: number): boolean {
    return position >= 0 && position < this.maPortions.length && Boolean(this.maPortions[position]);
  }
  /** Original optional borrowed paragraph pointer. @param position - Source index. @returns Actual pointer or null. */
  SafeGetObject(position: number): ParaPortion | null {
    return this.exists(position) ? (this.maPortions[position] as ParaPortion) : null;
  }
  /** Original reference query on defined indexes. @param position - Source index. @returns Actual paragraph. */
  getRef(position: number): ParaPortion {
    return this.maPortions[position] as ParaPortion;
  }
  /** Original overflow-saturated count. @returns Count. */
  Count(): number {
    return Math.min(this.maPortions.length, 0x7fffffff);
  }
  /** Original last index including -1 when empty. @returns Index. */
  lastIndex(): number {
    return this.Count() - 1;
  }
  /** Original cached reverse lookup, retaining the actual source window and not-found sentinel. @param portion - Borrowed pointer. @returns Source position. */
  GetPos(portion: ParaPortion | null): number {
    return FastGetPos(this.maPortions, portion, this.nLastCache);
  }
  /** Original ownership release with invalid null result. @param position - Source index. @returns Transferred paragraph or null. */
  Release(position: number): ParaPortion | null {
    if (position < 0 || position >= this.maPortions.length) return null;
    return this.maPortions.splice(position, 1)[0] as ParaPortion;
  }
  /** Original owner erase preserving invalid no-op. @param position - Source index. @returns Nothing. */
  Remove(position: number): void {
    if (position < 0 || position >= this.maPortions.length) return;
    this.maPortions.splice(position, 1);
  }
  /** Original checked unique-owner insertion, preserving rejected-owner release to GC. @param position - Source position. @param portion - Transferred paragraph. @returns Nothing. */
  Insert(position: number, portion: ParaPortion): void {
    if (position < 0 || position > this.maPortions.length) return;
    this.maPortions.splice(position, 0, portion);
  }
  /** Original unique-owner append. @param portion - Transferred paragraph. @returns Nothing. */
  Append(portion: ParaPortion): void {
    this.maPortions.push(portion);
  }
  /** Original ordered iteration. @returns Borrowed iterator. */
  [Symbol.iterator](): IterableIterator<ParaPortion> {
    return this.maPortions.values();
  }
  /** Original invalidation of every paragraph selection. @param start - Raw start. @returns Nothing. */
  MarkAllSelectionsInvalid(start: number): void {
    for (const portion of this.maPortions) portion.MarkSelectionInvalid(start);
  }
  /** Original sum until pointer identity, or the full sum when source diagnostic falls through. @param paragraph - Borrowed pointer. @returns Source offset. */
  GetYOffset(paragraph: ParaPortion | null): number {
    let height = 0;
    for (const portion of this.maPortions) {
      if (portion === paragraph) return height;
      height += portion.GetHeight();
    }
    return height;
  }
  /** Original strict greater-than lower-bound scan. @param offset - Source vertical position. @returns Source index or EE_PARA_MAX. */
  FindParagraph(offset: number): number {
    let y = 0;
    for (let index = 0; index < this.maPortions.length; index++) {
      y += this.getRef(index).GetHeight();
      if (y > offset) return Math.min(index, 0x7fffffff);
    }
    return EE_PARA_MAX;
  }
}
