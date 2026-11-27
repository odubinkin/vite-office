/** @fileoverview Native Calc sheet context for scalar rows over an actual ScTable. */
import { ScXMLImportContext } from "./importcontext";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken, ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScXMLImport } from "./xmlimprt";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScRangeList } from "../../../inc/rangelst";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import { createTableColContext } from "./xmlcoli";
import { createTableRowContext } from "./xmlrowi";
import { ScXMLConditionalFormatsContext } from "./xmlcondformat";
import { ScXMLNamedExpressionsContext } from "./xmlnexpi";
import { ScXMLTableScenarioContext } from "./xmlsceni";
import { readTableProtection, readTableProtectionOptions } from "./xmlsubti";
import { ScXMLTableSourceContext } from "./XMLTableSourceContext";
import { ScMyStylesImportHelper } from "./XMLStylesImportHelper";
/** Real sheet import cursor;row/column positions are transient parser state only. */
export class ScXMLTableContext extends ScXMLImportContext {
  readonly tab: number;
  readonly styles: ScMyStylesImportHelper;
  row = 0;
  column = 0;
  private readonly printRanges: string;
  private readonly printEntireSheet: boolean;
  private readonly protection: ReturnType<typeof readTableProtection>;
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
    this.styles = new ScMyStylesImportHelper(owner);
    this.printRanges = attributes.get(XMLToken.TABLE_PRINT_RANGES) ?? "";
    this.printEntireSheet = attributes.get(XMLToken.TABLE_PRINT) !== "false";
    this.protection = readTableProtection(attributes);
    this.tab = owner.GetDocument().GetTableCount();
    const name = unicode(attributes.get(XMLToken.TABLE_NAME) ?? "");
    try {
      if (!owner.GetDocument().InsertTab(this.tab, name))
        throw new Error("ODS invalid or duplicate sheet name");
    } finally {
      name.dispose();
    }
    const style = attributes.get(XMLToken.TABLE_STYLE_NAME);
    if (style !== null) owner.ApplyTableStyle(style, this.tab);
  }
  /** Commits the sheet's native print selection after its structural children. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    if (element !== XMLToken.TABLE_TABLE) return;
    this.styles.EndTable();
    const document = this.owner.GetDocument();
    const table = document.FetchTable(this.tab);
    if (this.protection) document.SetTabProtection(this.tab, this.protection);
    if (this.printRanges) {
      const ranges = new ScRangeList();
      ScRangeStringConverter.GetRangeListFromString(
        ranges,
        this.printRanges,
        document,
        FormulaGrammar.AddressConvention.CONV_OOO,
      );
      for (const range of ranges) table?.AddPrintRange(range);
    } else if (!this.printEntireSheet) {
      table?.ClearPrintRanges();
    }
    const outline = table?.GetOutlineTable();
    if (outline) {
      for (const array of [outline.GetColArray(), outline.GetRowArray()])
        for (let level = 0; level < array.GetDepth(); ++level)
          for (const entry of array.GetEntries(level))
            if (entry.hidden) array.SetVisibleBelow(level, entry, false);
    }
  }
  /** Dispatches sheet children to their axis or document context. @param element - Token. @param attributes - Attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.CALCEXT_CONDITIONAL_FORMATS)
      return new ScXMLConditionalFormatsContext(this.owner, this.tab);
    if (element === XMLToken.TABLE_TABLE_PROTECTION) {
      if (this.protection) readTableProtectionOptions(this.protection, attributes);
      return new ScXMLImportContext(this.owner);
    }
    if (element === XMLToken.TABLE_TABLE_SOURCE)
      return new ScXMLTableSourceContext(this.owner, this.tab, attributes);
    if (element === XMLToken.TABLE_SCENARIO)
      return new ScXMLTableScenarioContext(this.owner, this.tab, attributes);
    if (element === XMLToken.TABLE_NAMED_EXPRESSIONS)
      return new ScXMLNamedExpressionsContext(this.owner, this.tab);
    const axis =
      createTableColContext(this, element, attributes) ??
      createTableRowContext(this, element, attributes);
    if (axis) return axis;
    throw new Error("ODS sheet feature is not implemented");
  }
}
