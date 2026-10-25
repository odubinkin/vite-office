/** @fileoverview Original ScEditableTester block admission and value state;selection/action/protection/matrix-positive service families remain separately unported. */
import { scPasteResourcesEnglish } from "../../../inc/globstr";
import type { ScDocument } from "../../../inc/document";
/** Original editable.hxx tester starts editable with only-matrix true and accumulates actual block-test outcomes. */
export class ScEditableTester {
  private mbIsEditable = true;
  private mbOnlyMatrix = true;
  /** Original CreateAndTestBlock factory. @param doc - Actual document. @param tab - Sheet. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param noMatrix - Original defaultfalse. @returns Actual tester. */
  static CreateAndTestBlock(
    doc: ScDocument,
    tab: number,
    col1: number,
    row1: number,
    col2: number,
    row2: number,
    noMatrix = false,
  ): ScEditableTester {
    const tester = new ScEditableTester();
    tester.TestBlock(doc, tab, col1, row1, col2, row2, noMatrix);
    return tester;
  }
  /** Original cumulative block test;matrix edge services reject explicitly before admitting unsupported cells. @param doc - Actual document. @param tab - Sheet. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param noMatrix - Original defaultfalse. @returns Nothing. */
  TestBlock(
    doc: ScDocument,
    tab: number,
    col1: number,
    row1: number,
    col2: number,
    row2: number,
    noMatrix = false,
  ): void {
    if (this.mbIsEditable || this.mbOnlyMatrix) {
      const matrix: [boolean] = [false];
      if (!doc.IsBlockEditable(tab, col1, row1, col2, row2, matrix, noMatrix)) {
        this.mbIsEditable = false;
        // Every admitted false document result writes false;positive matrix geometry rejects before returning.
        this.mbOnlyMatrix = false;
      }
    }
  }
  /** Original editable/failed message selection at the resolved English resource boundary. Positive matrix geometry rejects before producing a tester result in this slice. @returns Empty for editable or native protection text. */
  GetMessageId(): string {
    return this.mbIsEditable ? "" : scPasteResourcesEnglish.STR_PROTECTIONERR;
  }
  /** Original inline editability query. @returns Actual state. */
  IsEditable(): boolean {
    return this.mbIsEditable;
  }
  /** Original inline format-editability query. @returns Actual state. */
  IsFormatEditable(): boolean {
    return this.mbIsEditable || this.mbOnlyMatrix;
  }
}
