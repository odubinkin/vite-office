/** @fileoverview Original owning EditLineList header algorithms and boundary lookup. */
import { EditLine } from "./EditLine";
/** Actual source line owner sequence. */
export class EditLineList {
  private readonly maLines: EditLine[] = [];
  /** Original vector clear. @returns Nothing. */
  Reset(): void {
    this.maLines.length = 0;
  }
  /** Original suffix deletion in its defined asserted index domain. @param from - First removed line. @returns Nothing. */
  DeleteFromLine(from: number): void {
    this.maLines.splice(from);
  }
  /** Original end-boundary scan and last-index fallback. @param position - Raw position. @param includeEnd - Original boundary preference. @returns Original index, including -1 for zero lines. */
  FindLine(position: number, includeEnd: boolean): number {
    for (let i = 0; i < this.maLines.length; i++) {
      const line = this.at(i);
      if ((includeEnd && line.GetEnd() >= position) || line.GetEnd() > position) return i;
    }
    return this.maLines.length - 1;
  }
  /** Original count. @returns Count. */
  Count(): number {
    return this.maLines.length;
  }
  /** Original operator[] on defined indexes. @param position - Source index. @returns Actual borrowed line. */
  at(position: number): EditLine {
    return this.maLines[position] as EditLine;
  }
  /** Original unique-owner append. @param line - Transferred line. @returns Nothing. */
  Append(line: EditLine): void {
    this.maLines.push(line);
  }
  /** Original unique-owner insertion. @param position - Defined insertion index. @param line - Transferred line. @returns Nothing. */
  Insert(position: number, line: EditLine): void {
    this.maLines.splice(position, 0, line);
  }
}
