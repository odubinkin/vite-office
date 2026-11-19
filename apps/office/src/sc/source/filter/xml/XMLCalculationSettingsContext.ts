/** @fileoverview Original Calc calculation-settings and null-date import owners for the represented workbook epoch. */
import { Converter } from "../../../../sax/source/tools/converter";
import { DateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import {
  SvXMLIgnoreContext,
  type FastAttributeList,
  type SvXMLImportContext,
} from "../../../../xmloff/source/core/xmlimp";
import { ScDocOptions } from "../../core/tool/docoptio";
import { ScXMLImportContext } from "./importcontext";

/** Commits the source null date after the calculation-settings element, before cells are loaded. */
export class ScXMLCalculationSettingsContext extends ScXMLImportContext {
  private nullDate = new DateTime(0, 0, 0, 0, 30, 12, 1899, false);

  /** Diagnoses represented tokens outside the date-system slice. @param _element - Current token. @param attributes - ODF settings attributes. @returns Nothing. */
  override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    attributes.assertOnly([], "Calc calculation settings");
  }

  /** Reads the represented null-date child with the native temporal converter. @param element - Source token. @param attributes - Source attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element !== XMLToken.TABLE_NULL_DATE) {
      return this.createUnknownChildContext();
    }
    attributes.assertOnly([XMLToken.TABLE_DATE_VALUE], "Calc null date");
    const value = attributes.get(XMLToken.TABLE_DATE_VALUE);
    const date = new DateTime();
    if (value !== null && Converter.parseDateTime(date, value)) this.nullDate = date;
    return new SvXMLIgnoreContext(true);
  }

  /** Keeps unsupported settings metadata, including iteration, out of the cell graph. @returns Ignored metadata context. */
  override createUnknownChildContext(): SvXMLImportContext {
    this.GetScImport().unsupported("calculation settings child");
    return new SvXMLIgnoreContext(true);
  }

  /** Applies the native options update, including the live number formatter. @returns Nothing. */
  override endFastElement(): void {
    const doc = this.GetScImport().GetDocument();
    const options = new ScDocOptions(doc.GetDocOptions());
    options.SetDate(this.nullDate.Day, this.nullDate.Month, this.nullDate.Year);
    doc.SetDocOptions(options);
  }
}
