/** @fileoverview Native Writer redline table and document settings owner. */
import { RedlineFlags } from "../../../inc/IDocumentRedlineAccess";
import { SwRedlineTable } from "./docredln";
import type { SwDoc } from "./doc";

/** Document-owned redline table and tracking flags. */
export class DocumentRedlineManager {
  private readonly redlines = new SwRedlineTable();
  private meRedlineFlags = RedlineFlags.ShowMask;

  /** Borrows the established document-local redline table. @returns Current table. */
  GetRedlineTable(): SwRedlineTable {
    return this.redlines;
  }

  /** Reads native recording and visibility flags. @returns Current flag mask. */
  GetRedlineFlags(): RedlineFlags {
    return this.meRedlineFlags;
  }

  /** Stores the represented document flags. @param flags - Original flag mask. */
  SetRedlineFlags(flags: RedlineFlags): void {
    this.meRedlineFlags = flags;
  }

  /** Shows represented saved deletions in their original redline table order. */
  ShowChanges(): void {
    const ranges = this.redlines.entries();
    for (const [index, range] of ranges.entries()) range.MoveFromSection(ranges, index);
  }

  /** Runs the native save visibility transition and restores the represented ranges. @param document - Actual Writer document. @param write - Synchronous XML export. @returns Export result. */
  WithRedlinesHiddenForExport<Result>(document: SwDoc, write: () => Result): Result {
    const ranges = this.redlines.entries();
    if (!ranges.length) return write();
    const flags = this.GetRedlineFlags();
    const exportFlags = (flags & ~RedlineFlags.ShowMask) | RedlineFlags.ShowInsert;
    const undo = document.GetUndoManager();
    const recording = undo.DoesUndo();
    const copied: number[] = [];
    return document.GetDocumentStateManager().RunModelTransaction(
      /** Applies the save visibility flags and restores the live model. @returns Export result. */
      () => {
        this.SetRedlineFlags(exportFlags | RedlineFlags.Ignore);
        undo.DoUndo(false);
        try {
          for (const [index, range] of ranges.entries())
            if (range.CopyToSection(ranges)) copied.push(index);
          for (const index of copied) ranges[index]?.DelCopyOfSection();
          this.SetRedlineFlags(exportFlags);
          return write();
        } finally {
          try {
            this.SetRedlineFlags(this.GetRedlineFlags() | RedlineFlags.Ignore);
            for (const index of copied) {
              const range = ranges[index];
              if (range?.HasMark()) range.DiscardContentSection();
              else range?.MoveFromSection(ranges, index);
            }
          } finally {
            this.SetRedlineFlags(flags);
            undo.DoUndo(recording);
          }
        }
      },
    );
  }

  /** Releases the document's tracked ranges. */
  Dispose(): void {
    this.redlines.Dispose();
  }
}
