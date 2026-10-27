/** @fileoverview Native OOXMLDocument stream/note/progress fields from OOXMLDocumentImpl.cxx. Full resolve, shape contexts, model statistics, DOM and substream orchestration remain unported. */
import type { OOXMLDocument as DocumentContract } from "../inc/ooxml/OOXMLDocument";
import type { XStatusIndicator } from "../../../../offapi/com/sun/star/task/XStatusIndicator";
import type { OOXMLStreamImpl } from "./OOXMLStreamImpl";

/** Original document owner for represented stream identity and parser-state callbacks; no complete import entry point is advertised. */
export class OOXMLDocument implements DocumentContract {
  private mnXNoteId = 0;
  private mnPercentSize = 0;
  private mnProgressLastPos = 0;
  private mnProgressCurrentPos = 0;
  private mnProgressEndPos = 0;
  /** Borrows the original opened stream and status callback; other native constructor services are unported rather than replaced by dummy providers. @param mpStream - Actual package stream. @param mxStatusIndicator - Actual indicator or null. @returns Owner. */
  constructor(
    private readonly mpStream: OOXMLStreamImpl,
    private readonly mxStatusIndicator: XStatusIndicator | null,
  ) {}
  /** Original signed32 note identity assignment. @param id - Native note ID. @returns Nothing. */
  setXNoteId(id: number): void {
    this.mnXNoteId = id | 0;
  }
  /** Original stored note identity. @returns Signed32 ID. */
  getXNoteId(): number {
    return this.mnXNoteId;
  }
  /** Original borrowed current stream target, using the stream's existing immutable UTF16 host binding. @returns Target. */
  getTarget(): string {
    return this.mpStream.getTarget();
  }
  /** Original delegation preserves stream-relative and external-ID cache rules. @param id - Native relationship ID binding. @returns Resolved target or empty. */
  getTargetForId(id: string): string {
    return this.mpStream.getTargetForId(id);
  }
  /** Original paragraph progress increments even without known statistics. Positive-end initialization belongs to unported resolve/model statistics; no artificial setter is introduced. @returns Nothing. */
  incrementProgress(): void {
    this.mnProgressCurrentPos++;
    if (
      this.mnProgressEndPos &&
      this.mnProgressCurrentPos > this.mnProgressLastPos + this.mnPercentSize &&
      this.mnProgressLastPos < this.mnProgressEndPos
    ) {
      this.mnProgressLastPos = this.mnProgressCurrentPos;
      if (this.mxStatusIndicator) this.mxStatusIndicator.setValue(this.mnProgressLastPos);
    }
  }
}
