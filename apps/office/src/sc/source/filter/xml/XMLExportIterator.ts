/** @fileoverview Calc ODS row-major merge of native cells and independent note entries. */
import { MAXCOL, MAXROW } from "../../../inc/address";
import type { ScRefCellValue } from "../../../inc/cellvalue";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import type { ScDocument } from "../../../inc/document";
import type { NoteEntry, ScPostIt } from "../../../inc/postit";

/** Represented cell and annotation streams of the native nonempty XML iterator. */
export class ScMyNotEmptyCellsIterator {
  private readonly iterator: ScHorizontalCellIterator;
  private readonly notes: NoteEntry[] = [];
  private readonly col: [number] = [0];
  private readonly row: [number] = [0];
  private nextCell: ScRefCellValue | null;
  private nextNote = 0;
  private advanceCell = false;
  cell: ScRefCellValue | null = null;
  note: ScPostIt | null = null;

  /** Collects sheet annotations and opens the sparse cell stream. @param document - Native model. @param tab - Sheet. */
  constructor(document: ScDocument, tab: number) {
    document.GetAllNoteEntries(tab, this.notes);
    this.notes.sort(
      /** Orders note positions for the XML sheet traversal. @param left - Left entry. @param right - Right entry. @returns Row-major ordering. */
      (left, right) => left.maPos.Row() - right.maPos.Row() || left.maPos.Col() - right.maPos.Col(),
    );
    this.iterator = new ScHorizontalCellIterator(document, tab, 0, 0, MAXCOL, MAXROW);
    this.nextCell = this.iterator.GetNext(this.col, this.row);
  }

  /** Advances either or both streams, keeping the cell iterator's borrowed value live. @param col - Output column. @param row - Output row. @returns Whether either stream has a cell position. */
  GetNext(col: [number], row: [number]): boolean {
    if (this.advanceCell) this.nextCell = this.iterator.GetNext(this.col, this.row);
    const entry = this.notes[this.nextNote];
    if (!entry && !this.nextCell) return false;
    const order = !entry
      ? 1
      : !this.nextCell
        ? -1
        : entry.maPos.Row() - this.row[0] || entry.maPos.Col() - this.col[0];
    this.advanceCell = order >= 0;
    this.cell = this.advanceCell ? this.nextCell : null;
    this.note = order <= 0 && entry ? entry.mpNote : null;
    if (order <= 0 && entry) {
      col[0] = entry.maPos.Col();
      row[0] = entry.maPos.Row();
      this.nextNote++;
    } else {
      col[0] = this.col[0];
      row[0] = this.row[0];
    }
    return true;
  }
}
