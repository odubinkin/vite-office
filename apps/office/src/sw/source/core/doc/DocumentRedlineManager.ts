/** @fileoverview Native Writer redline table and document settings owner. */
import { RedlineFlags } from "../../../inc/IDocumentRedlineAccess";
import { SwRedlineTable } from "./docredln";

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

  /** Releases the document's tracked ranges. */
  Dispose(): void {
    this.redlines.Dispose();
  }
}
