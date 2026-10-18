/** @fileoverview Consumed scalar ScDocumentImport setters over the actual document;bulk group/format/context services remain unported. */
import type { ScDocument } from "../../../inc/document";
import type { ScAddress } from "../../../inc/address";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { Grammar } from "../../../../formula/inc/grammar";
/** Native document-bound scalar importer;JS GC owns objects and existing setters own their semantic subscriptions. */
export class ScDocumentImport {
  /** Binds the actual target. @param document - Document. @returns Importer. */
  constructor(private readonly document: ScDocument) {}
  /** Borrows the native document. @returns Document. */
  getDoc(): ScDocument {
    return this.document;
  }
  /** Writes numeric content without a second import model. @param pos - Position. @param value - Number. @returns Nothing. */
  setNumericCell(pos: ScAddress, value: number): void {
    this.document.SetValue(pos, value);
  }
  /** Writes the actual raw shared string alternative. @param pos - Position. @param value - Literal text. @returns Nothing. */
  setStringCell(pos: ScAddress, value: OUStringConstReference): void {
    if (!this.document.ValidColRow(pos.Col(), pos.Row())) return;
    this.document
      .FetchTable(pos.Tab())
      ?.CreateColumnIfNotExists(pos.Col())
      .SetRawString(pos.Row(), value);
  }
  /** Uses the native source-string formula overload,with explicit grammar and existing real token compilation. @param pos - Position. @param value - Formula. @param grammar - Grammar. @returns Nothing. */
  setFormulaCell(pos: ScAddress, value: OUStringConstReference, grammar: Grammar): void {
    this.document.SetFormula(pos, value, grammar);
  }
}
