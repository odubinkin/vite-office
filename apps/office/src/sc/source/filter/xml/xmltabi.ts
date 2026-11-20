/** @fileoverview Native Calc sheet context for scalar rows over an actual ScTable. */
import { ScXMLImportContext } from "./importcontext";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken, ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScXMLImport } from "./xmlimprt";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import { ScXMLTableColContext } from "./xmlcoli";
import { ScXMLTableRowContext } from "./xmlrowi";
import { ScXMLConditionalFormatsContext } from "./xmlcondformat";
import { ScXMLNamedExpressionsContext } from "./xmlnexpi";
import { readTableProtection, readTableProtectionOptions } from "./xmlsubti";
/** Real sheet import cursor;row/column positions are transient parser state only. */
export class ScXMLTableContext extends ScXMLImportContext {
  readonly tab: number;
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
  }
  /** Dispatches rows and structural wrappers;column geometry is explicitly outside content preservation. @param element - Token. @param attributes - Attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.CALCEXT_CONDITIONAL_FORMATS)
      return new ScXMLConditionalFormatsContext(this.owner, this.tab);
    if (element === XMLToken.TABLE_TABLE_ROW) return new ScXMLTableRowContext(this, attributes);
    if (element === XMLToken.TABLE_TABLE_PROTECTION) {
      if (this.protection) readTableProtectionOptions(this.protection, attributes);
      return new ScXMLImportContext(this.owner);
    }
    if (element === XMLToken.TABLE_NAMED_EXPRESSIONS)
      return new ScXMLNamedExpressionsContext(this.owner, this.tab);
    if (
      element === XMLToken.TABLE_TABLE_HEADER_ROWS ||
      element === XMLToken.TABLE_TABLE_HEADER_COLUMNS
    )
      return new ScXMLTableHeaderContext(this, element === XMLToken.TABLE_TABLE_HEADER_ROWS);
    if (element === XMLToken.TABLE_TABLE_ROWS) return this;
    if (element === XMLToken.TABLE_TABLE_COLUMN) return new ScXMLTableColContext(this, attributes);
    if (element === XMLToken.TABLE_TABLE_COLUMNS) return this;
    if (element === XMLToken.TABLE_TABLE_ROW_GROUP || element === XMLToken.TABLE_TABLE_COLUMN_GROUP)
      return new ScXMLTableGroupContext(
        this,
        attributes,
        element === XMLToken.TABLE_TABLE_ROW_GROUP,
      );
    throw new Error("ODS sheet feature is not implemented");
  }
}

/** Original header section records the first start and the last end reached on the axis. */
class ScXMLTableHeaderContext extends ScXMLImportContext {
  private readonly start: number;
  /** Captures the first coordinate of a repeated title interval. @param table - Native sheet import context. @param rows - Row orientation. @returns Context. */
  constructor(
    private readonly table: ScXMLTableContext,
    private readonly rows: boolean,
  ) {
    super(table.owner);
    this.start = rows ? table.row : table.column;
  }
  /** Uses the same row and column cursors as the surrounding sheet. @param element - Child token. @param attributes - Child attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    const child = this.table.createFastChildContext(element, attributes);
    return child === this.table ? this : child;
  }
  /** Applies the source title range, retaining a preceding header's first coordinate. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    if (
      element !==
      (this.rows ? XMLToken.TABLE_TABLE_HEADER_ROWS : XMLToken.TABLE_TABLE_HEADER_COLUMNS)
    )
      return;
    const document = this.table.owner.GetDocument();
    const table = document.FetchTable(this.table.tab);
    const end = this.rows
      ? Math.min(this.table.row - 1, document.MaxRow())
      : Math.min(this.table.column - 1, document.MaxCol());
    if (!table || end < this.start) return;
    const previous = this.rows ? table.GetRepeatRowRange() : table.GetRepeatColRange();
    const tab = previous ? this.table.tab : 0;
    if (this.rows) {
      table.SetRepeatRowRange(
        new ScRange(0, previous?.aStart.Row() ?? this.start, tab, 0, end, tab),
      );
    } else {
      table.SetRepeatColRange(
        new ScRange(previous?.aStart.Col() ?? this.start, 0, tab, end, 0, tab),
      );
    }
  }
}

/** ScXMLTableRowsContext and ScXMLTableColsContext retain their initial group coordinate. */
class ScXMLTableGroupContext extends ScXMLImportContext {
  private readonly start: number;
  private readonly hidden: boolean;

  /** Captures the initial live cursor and the source display default. @param table - Sheet context. @param attributes - ODF group attributes. @param rows - Row orientation. @returns Context. */
  constructor(
    private readonly table: ScXMLTableContext,
    attributes: FastAttributeList,
    private readonly rows: boolean,
  ) {
    super(table.owner);
    this.start = rows ? table.row : table.column;
    const display = attributes.get(XMLToken.TABLE_DISPLAY);
    this.hidden = rows ? display !== null && display !== "true" : display === "false";
  }

  /** Delegates native nested axis records to the same sheet cursor. @param element - Child token. @param attributes - Attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    const child = this.table.createFastChildContext(element, attributes);
    return child === this.table ? this : child;
  }

  /** Commits the interval after the contained axes and child groups advance the sheet. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    if (
      element !== (this.rows ? XMLToken.TABLE_TABLE_ROW_GROUP : XMLToken.TABLE_TABLE_COLUMN_GROUP)
    )
      return;
    const document = this.table.owner.GetDocument();
    const end = this.rows
      ? Math.min(this.table.row - 1, document.MaxRow())
      : Math.min(this.table.column - 1, document.MaxCol());
    if (this.start > end) return;
    const outline = document.FetchTable(this.table.tab)?.StartOutlineTable();
    const array = this.rows ? outline?.GetRowArray() : outline?.GetColArray();
    array?.Insert(this.start, end, this.hidden);
  }
}
