/** @fileoverview Original bulkdatahint.hxx owns a document reference and borrows actual segmented spans. */
import { SfxHint, SfxHintId } from "../../svl/inc/hint";
import type { ScDocument } from "./document";
import type { ColumnSpanSet } from "./columnspanset";
/** Native bulk data hint;the sender owns the referenced spans for the notification duration. */
export class BulkDataHint extends SfxHint {
  private mpSpans: ColumnSpanSet | null = null;
  /** Original document-only constructor initializes spans to null. @param mrDoc - Actual document. @returns Hint. */
  constructor(private readonly mrDoc: ScDocument) {
    super(SfxHintId.ScBulkData);
  }
  /** Original borrowed span assignment. @param spans - Actual segmented owner or null. @returns Nothing. */
  setSpans(spans: ColumnSpanSet | null): void {
    this.mpSpans = spans;
  }
  /** Original const borrowed spans. @returns Spans or null. */
  getSpans(): ColumnSpanSet | null {
    return this.mpSpans;
  }
  /** Original borrowed document. @returns Actual owner. */
  getDoc(): ScDocument {
    return this.mrDoc;
  }
}
