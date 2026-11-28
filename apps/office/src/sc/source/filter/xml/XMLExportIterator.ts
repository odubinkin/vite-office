/** @fileoverview Calc ODS row-major merge of native cells, notes and external areas. */
import { MAXCOL, MAXROW } from "../../../inc/address";
import type { ScRefCellValue } from "../../../inc/cellvalue";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import type { ScDocument } from "../../../inc/document";
import type { NoteEntry, ScPostIt } from "../../../inc/postit";

import { ScAreaLink } from "../../ui/docshell/arealink";

/** Holds the area-link part of the original export iteration, sorted in sheet and cell order. */
export class ScMyAreaLinksContainer {
  private readonly sheets = new Map<number, ScAreaLink[]>();

  /** Collects actual area links from the original manager in registration order. @param document - Calc document. @returns The initialized ScMyAreaLinksContainer instance. */
  constructor(document: ScDocument) {
    const manager = document.GetDocLinkManager().getExistingLinkManager();
    for (const link of manager?.GetLinks() ?? []) {
      if (!(link instanceof ScAreaLink)) continue;
      const tab = link.GetDestArea().aStart.Tab();
      let sheet = this.sheets.get(tab);
      if (!sheet) this.sheets.set(tab, (sheet = []));
      sheet.push(link);
    }
    for (const links of this.sheets.values())
      links.sort(
        /** Sorts by destination, preserving registration order for identical starts. @param left - First link. @param right - Second link. @returns Row-major order. */
        (left, right) => {
          const a = left.GetDestArea().aStart;
          const b = right.GetDestArea().aStart;
          return a.Row() - b.Row() || a.Col() - b.Col();
        },
      );
  }

  /** Borrows the ordered links for one sheet. @param tab - Sheet. @returns Links ordered by destination. */
  GetSheetLinks(tab: number): readonly ScAreaLink[] {
    return this.sheets.get(tab) ?? [];
  }
}

/** Maps a sheet cell to its order in the sparse traversal. @param col - Column. @param row - Row. @returns Row-major position. */
function cellOrder(col: number, row: number): number {
  return row * (MAXCOL + 1) + col;
}

/** Represented cell, annotation and area-link streams of the native nonempty XML iterator. */
export class ScMyNotEmptyCellsIterator {
  private readonly iterator: ScHorizontalCellIterator;
  private readonly notes: NoteEntry[] = [];
  private readonly col: [number] = [0];
  private readonly row: [number] = [0];
  private nextCell: ScRefCellValue | null;
  private nextNote = 0;
  private nextAreaLink = 0;
  private advanceCell = false;
  cell: ScRefCellValue | null = null;
  note: ScPostIt | null = null;
  areaLink: ScAreaLink | null = null;

  /** Opens the sparse streams for one sheet. @param document - Native model. @param tab - Sheet. @param areaLinks - Area links ordered by native destination. @returns The initialized ScMyNotEmptyCellsIterator instance. */
  constructor(
    document: ScDocument,
    tab: number,
    private readonly areaLinks: readonly ScAreaLink[] = [],
  ) {
    document.GetAllNoteEntries(tab, this.notes);
    this.notes.sort(
      /** Orders note positions for the XML sheet traversal. @param left - Left entry. @param right - Right entry. @returns Row-major ordering. */
      (left, right) => left.maPos.Row() - right.maPos.Row() || left.maPos.Col() - right.maPos.Col(),
    );
    this.iterator = new ScHorizontalCellIterator(document, tab, 0, 0, MAXCOL, MAXROW);
    this.nextCell = this.iterator.GetNext(this.col, this.row);
  }

  /** Advances all streams at the earliest address, keeping the cell iterator's borrowed value live. @param col - Output column. @param row - Output row. @returns Whether a stream has a cell position. */
  GetNext(col: [number], row: [number]): boolean {
    if (this.advanceCell) this.nextCell = this.iterator.GetNext(this.col, this.row);
    const entry = this.notes[this.nextNote];
    const link = this.areaLinks[this.nextAreaLink];
    const anchor = link?.GetDestArea().aStart;
    const cellPosition = this.nextCell ? cellOrder(this.col[0], this.row[0]) : Infinity;
    const notePosition = entry ? cellOrder(entry.maPos.Col(), entry.maPos.Row()) : Infinity;
    const areaPosition = anchor ? cellOrder(anchor.Col(), anchor.Row()) : Infinity;
    const first = Math.min(cellPosition, notePosition, areaPosition);
    if (first === Infinity) return false;
    this.advanceCell = first === cellPosition;
    this.cell = this.advanceCell ? this.nextCell : null;
    this.note = first === notePosition && entry ? entry.mpNote : null;
    this.areaLink = first === areaPosition && link ? link : null;
    row[0] = Math.floor(first / (MAXCOL + 1));
    col[0] = first % (MAXCOL + 1);
    if (this.note) this.nextNote++;
    if (this.areaLink && anchor) {
      do this.nextAreaLink++;
      while (this.areaLinks[this.nextAreaLink]?.GetDestArea().aStart.equals(anchor));
    }
    return true;
  }
}
