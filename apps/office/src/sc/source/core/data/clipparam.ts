/** @fileoverview Original ScClipParam range ownership,copy values,compressed dimensions and transpose. */
import { ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import type { ScDocument } from "../../../inc/document";

/** Native direction discriminator from clipparam.hxx. */
enum Direction {
  Unspecified,
  Column,
  Row,
}

/** Original document-owned clipboard values;actual cells remain in the owning ScDocument. */
export class ScClipParam {
  static readonly Unspecified = Direction.Unspecified;
  static readonly Column = Direction.Column;
  static readonly Row = Direction.Row;
  maRanges = new ScRangeList();
  meDirection = Direction.Unspecified;
  mbCutMode = false;
  mnSourceDocID = 0;
  maProtectedChartRangesVector: ScRangeList[] = [];
  mbTransposed = false;
  maOriginalRange = new ScRange();
  maMatrixRanges = new ScRangeList();
  maOriginMatrixRanges = new ScRangeList();
  /** Original default,range and implicit value-copy construction. @param source - Optional original range or copied parameters. @param cut - Original range-constructor cut mode. @returns Independent parameters. */
  constructor(source?: ScRange | ScClipParam, cut = false) {
    if (source instanceof ScClipParam) {
      this.maRanges.assign(source.maRanges);
      this.meDirection = source.meDirection;
      this.mbCutMode = source.mbCutMode;
      this.mnSourceDocID = source.mnSourceDocID;
      this.maProtectedChartRangesVector = source.maProtectedChartRangesVector.map(
        /** Copies each chart's native range list. @param ranges - Source list. @returns Independent list. */
        (ranges) => new ScRangeList(ranges),
      );
      this.mbTransposed = source.mbTransposed;
      this.maOriginalRange.assign(source.maOriginalRange);
      this.maMatrixRanges.assign(source.maMatrixRanges);
      this.maOriginMatrixRanges.assign(source.maOriginMatrixRanges);
    } else if (source) {
      this.maRanges.push_back(source);
      this.mbCutMode = cut;
    }
  }
  /** Original count query. @returns More than one range. */
  isMultiRange(): boolean {
    return this.maRanges.size() > 1;
  }
  /** Original compressed column dimension. @returns Width or zero for unspecified direction. */
  getPasteColSize(): number {
    if (this.maRanges.empty()) return 0;
    switch (this.meDirection) {
      case Direction.Column: {
        let size = 0;
        for (const range of this.maRanges) size += range.aEnd.Col() - range.aStart.Col() + 1;
        return (size << 16) >> 16;
      }
      case Direction.Row: {
        const range = this.maRanges.front();
        return ((range.aEnd.Col() - range.aStart.Col() + 1) << 16) >> 16;
      }
      default:
        return 0;
    }
  }
  /** Original compressed row dimension delegates filtering to the actual source document. @param source - Source document. @param includeFiltered - Include filtered rows. @returns Height or zero for unspecified direction. */
  getPasteRowSize(source: ScDocument, includeFiltered: boolean): number {
    if (this.maRanges.empty()) return 0;
    switch (this.meDirection) {
      case Direction.Column: {
        const range = this.maRanges.front();
        return includeFiltered
          ? range.aEnd.Row() - range.aStart.Row() + 1
          : source.CountNonFilteredRows(range.aStart.Row(), range.aEnd.Row(), range.aStart.Tab());
      }
      case Direction.Row: {
        let size = 0;
        for (const range of this.maRanges)
          size += includeFiltered
            ? range.aEnd.Row() - range.aStart.Row() + 1
            : source.CountNonFilteredRows(range.aStart.Row(), range.aEnd.Row(), range.aStart.Tab());
        return size | 0;
      }
      default:
        return 0;
    }
  }
  /** Original combined range preserves native empty-list behavior. @returns Encompassing range. */
  getWholeRange(): ScRange {
    return this.maRanges.Combine();
  }
  /** Original transpose retains the first range's origin and replaces the actual range list. @param source - Source document. @param includeFiltered - Retain filtered rows. @param multiRowFiltered - Original special filtered multirange row-selection branch. @returns Nothing. */
  transpose(source: ScDocument, includeFiltered: boolean, multiRowFiltered: boolean): void {
    this.mbTransposed = true;
    switch (this.meDirection) {
      case Direction.Column:
        this.meDirection = Direction.Row;
        break;
      case Direction.Row:
        this.meDirection = Direction.Column;
        break;
      default:
        break;
    }
    const ranges = new ScRangeList();
    if (!this.maRanges.empty()) {
      const first = this.maRanges.front(),
        colOrigin = first.aStart.Col(),
        rowOrigin = first.aStart.Row();
      let rowCount = 0;
      for (const range of this.maRanges) {
        const colDelta = range.aStart.Col() - colOrigin,
          rowDelta = range.aStart.Row() - rowOrigin,
          nonFiltered = source.CountNonFilteredRows(
            range.aStart.Row(),
            range.aEnd.Row(),
            range.aStart.Tab(),
          );
        if (!multiRowFiltered)
          ranges.push_back(
            new ScRange(
              colOrigin + rowDelta,
              rowOrigin + colDelta,
              range.aStart.Tab(),
              colOrigin +
                rowDelta +
                (includeFiltered ? range.aEnd.Row() - range.aStart.Row() : nonFiltered - 1),
              rowOrigin + colDelta + range.aEnd.Col() - range.aStart.Col(),
              range.aStart.Tab(),
            ),
          );
        else rowCount += nonFiltered;
      }
      // Original assertion requires !includeFiltered in this special source branch.
      if (multiRowFiltered)
        ranges.push_back(
          new ScRange(
            colOrigin,
            rowOrigin,
            first.aStart.Tab(),
            colOrigin + rowCount - 1,
            rowOrigin + first.aEnd.Col() - first.aStart.Col(),
            first.aStart.Tab(),
          ),
        );
    }
    this.maRanges.moveAssign(ranges);
  }
  /** Original source identifier. @returns UInt32 document identifier. */
  getSourceDocID(): number {
    return this.mnSourceDocID;
  }
  /** Original UInt32 assignment. @param value - Identifier. @returns Nothing. */
  setSourceDocID(value: number): void {
    this.mnSourceDocID = value >>> 0;
  }
  /** Original transpose query. @returns Transposed flag. */
  isTransposed(): boolean {
    return this.mbTransposed;
  }
}
