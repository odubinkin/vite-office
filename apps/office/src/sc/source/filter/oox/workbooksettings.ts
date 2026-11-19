/** @fileoverview Native WorkbookSettings date mode and finalization for SpreadsheetML. */
import { AttributeList } from "../../../../oox/source/helper/attributelist";
import { FastTokenHandler } from "../../../../oox/source/core/fasttokenhandler";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FastAttributeList } from "../../../../sax/source/tools/fastattribs";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import type { ScDocument } from "../../../inc/document";
import { ScDocOptions } from "../../core/tool/docoptio";
import { Date } from "../../../../offapi/com/sun/star/util/Date";

/** Owns the workbook date mode independently of cell values and formatting records. */
export class WorkbookSettings {
  private dateMode1904 = false;

  /** Applies the original workbookPr default and lexical conversion. @param date1904 - Optional unqualified attribute. @returns Nothing. */
  importWorkbookPr(date1904: string | undefined): void {
    const tokens = new Reference(new FastTokenHandler());
    const fast = new FastAttributeList(tokens.operatorStar());
    const attributes = new Reference(fast);
    const key = token("date1904");
    const list = new AttributeList(attributes);
    try {
      if (date1904 !== undefined) fast.add(key, date1904);
      this.dateMode1904 = list.getBool(key, false);
    } finally {
      list.dispose();
      attributes.dispose();
      tokens.dispose();
    }
  }

  /** Selects the original epoch for this workbook. @returns Date fields. */
  getNullDate(): Date {
    return this.dateMode1904 ? new Date(1, 1, 1904) : new Date(30, 12, 1899);
  }

  /** Applies the source null date to both the existing document options and its number formatter. @param document - Imported document. @returns Nothing. */
  finalizeImport(document: ScDocument): void {
    const options = new ScDocOptions(document.GetDocOptions());
    const date = this.getNullDate();
    options.SetDate(date.Day, date.Month, date.Year);
    document.SetDocOptions(options);
  }
}
