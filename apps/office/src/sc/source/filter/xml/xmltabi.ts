/** @fileoverview Native Calc sheet context for scalar rows over an actual ScTable. */
import { ScXMLImportContext } from "./importcontext";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken, ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScXMLImport } from "./xmlimprt";
import { ScXMLTableColContext } from "./xmlcoli";
import { ScXMLTableRowContext } from "./xmlrowi";
/** Real sheet import cursor;row/column positions are transient parser state only. */
export class ScXMLTableContext extends ScXMLImportContext {
  readonly tab: number;
  row = 0;
  column = 0;
  /** Accepts the ordinary empty forms container; real controls still require their form-layer owner. @param namespaceURI - Child namespace. @param localName - Child name. @param attributes - Child attributes. @returns Empty forms context or original rejection. */
  override createUnknownChildContext(
    namespaceURI: string,
    localName: string,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (namespaceURI === ODF_NAMESPACES.office && localName === "forms")
      return new ScXMLImportContext(this.owner);
    return super.createUnknownChildContext(namespaceURI, localName, attributes);
  }
  /** Appends a real native sheet with its supplied valid name. @param owner - Owner. @param attributes - Attributes. @returns Context. */
  constructor(
    readonly owner: ScXMLImport,
    attributes: FastAttributeList,
  ) {
    super(owner);
    this.tab = owner.GetDocument().GetTableCount();
    const name = unicode(attributes.get(XMLToken.TABLE_NAME) ?? "");
    try {
      if (!owner.GetDocument().InsertTab(this.tab, name))
        throw new Error("ODS invalid or duplicate sheet name");
    } finally {
      name.dispose();
    }
    if (attributes.get(XMLToken.TABLE_STYLE_NAME) !== null) owner.unsupported("table:style-name");
  }
  /** Dispatches rows and structural wrappers;column geometry is explicitly outside content preservation. @param element - Token. @param attributes - Attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.TABLE_TABLE_ROW) return new ScXMLTableRowContext(this, attributes);
    if (
      element === XMLToken.TABLE_TABLE_ROWS ||
      element === XMLToken.TABLE_TABLE_ROW_GROUP ||
      element === XMLToken.TABLE_TABLE_HEADER_ROWS
    )
      return this;
    if (element === XMLToken.TABLE_TABLE_COLUMN) return new ScXMLTableColContext(this, attributes);
    if (element === XMLToken.TABLE_TABLE_COLUMNS || element === XMLToken.TABLE_TABLE_HEADER_COLUMNS)
      return this;
    if (element === XMLToken.TABLE_TABLE_COLUMN_GROUP) {
      this.owner.unsupported("column outline group");
      return this;
    }
    throw new Error("ODS sheet feature is not implemented");
  }
}
