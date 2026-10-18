/** @fileoverview Native ScXMLBodyContext spreadsheet/table dispatch subset. */
import { ScXMLImportContext } from "./importcontext";
import {
  SvXMLImportContext,
  SvXMLIgnoreContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken, ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import type { ScXMLImport } from "./xmlimprt";
import { ScXMLTableContext } from "./xmltabi";
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
    if (element !== XMLToken.TABLE_TABLE)
      throw new Error("ODS spreadsheet feature is not implemented");
    return new ScXMLTableContext(this.owner, attributes);
  }
  /** Accepts an empty names container;other metadata omissions are diagnosed,not interpreted as cells. @param uri - Namespace. @param name - Element. @param attributes - Attributes. @returns Context. */
  override createUnknownChildContext(
    uri: string,
    name: string,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (uri === ODF_NAMESPACES.table && name === "named-expressions")
      return new ScXMLImportContext(this.owner);
    if (uri === ODF_NAMESPACES.table && name === "calculation-settings") {
      this.owner.unsupported("calculation settings");
      return new SvXMLIgnoreContext(true);
    }
    return super.createUnknownChildContext(uri, name, attributes);
  }
}
