/** @fileoverview Native ScXMLBodyContext spreadsheet/table dispatch subset. */
import { ScXMLImportContext } from "./importcontext";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { ScXMLImport } from "./xmlimprt";
import { ScXMLTableContext } from "./xmltabi";
import { ScXMLNamedExpressionsContext } from "./xmlnexpi";
import { ScXMLCalculationSettingsContext } from "./XMLCalculationSettingsContext";
import { createExternalRefTable } from "./xmlexternaltabi";
/** Spreadsheet content owns table creation,not a separate workbook model. */
export class ScXMLBodyContext extends ScXMLImportContext {
  /** Binds importer. @param owner - Owner. @returns Context. */
  constructor(private readonly owner: ScXMLImport) {
    super(owner);
  }
  /** Creates actual sheets. @param element - Token. @param attributes - Attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.TABLE_NAMED_EXPRESSIONS)
      return new ScXMLNamedExpressionsContext(this.owner, -1);
    if (element === XMLToken.TABLE_CALCULATION_SETTINGS)
      return new ScXMLCalculationSettingsContext(this.owner);
    if (element !== XMLToken.TABLE_TABLE)
      throw new Error("ODS spreadsheet feature is not implemented");
    return (
      createExternalRefTable(attributes.get(XMLToken.TABLE_NAME) ?? "", this.owner) ??
      new ScXMLTableContext(this.owner, attributes)
    );
  }
}
