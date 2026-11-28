/** @fileoverview Native Calc row/repeat cursor for scalar XML cells. */
import { ScXMLImportContext } from "./importcontext";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { ScRange } from "../../../inc/address";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { ScXMLTableContext } from "./xmltabi";
import { ScXMLTableRowCellContext } from "./xmlcelli";
/** Native repeat attribute conversion:missing/invalid/nonpositive values fall back to one. @param attributes - Attributes. @param token - Repeat token. @returns Count. */
export function repeatCount(attributes: FastAttributeList, token: XMLToken): number {
  return Math.max(1, attributes.getAsInteger(token) ?? 1);
}
/** Row context retains only the native import cursor and repeat count. */
export class ScXMLTableRowContext extends ScXMLImportContext {
  col = 0;
  readonly repeat: number;
  readonly start: number;
  private readonly visibility: string | null;
  private readonly styleName: string | null;
  /** Binds row cursor and native repeat default. @param table - Actual sheet cursor. @param attributes - Attributes. @returns Context. */
  constructor(
    readonly table: ScXMLTableContext,
    attributes: FastAttributeList,
  ) {
    super(table.owner);
    this.repeat = Math.min(
      repeatCount(attributes, XMLToken.TABLE_NUMBER_ROWS_REPEATED),
      table.owner.GetDocument().MaxRow() + 1,
    );
    this.start = table.row;
    table.styles.SetRowStyle(attributes.get(XMLToken.TABLE_DEFAULT_CELL_STYLE_NAME) ?? "");
    this.visibility = attributes.get(XMLToken.TABLE_VISIBILITY);
    this.styleName = attributes.get(XMLToken.TABLE_STYLE_NAME);
  }
  /** Creates normal/covered cells on the actual row. @param element - Token. @param attributes - Attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element !== XMLToken.TABLE_TABLE_CELL && element !== XMLToken.TABLE_COVERED_TABLE_CELL)
      throw new Error("ODS row feature is not implemented");
    return new ScXMLTableRowCellContext(
      this,
      attributes,
      element === XMLToken.TABLE_COVERED_TABLE_CELL,
    );
  }
  /** Applies row properties at native close and advances the repeated row span. @returns Nothing. */
  override endFastElement(): void {
    const document = this.table.owner.GetDocument();
    const tab = this.table.tab;
    const last = Math.min(document.MaxRow(), this.start + this.repeat - 1);
    this.table.owner.ApplyRowStyle(this.styleName, tab, this.start, last);
    if (this.visibility === "collapse" || this.visibility === "filter")
      document.SetRowHidden(this.start, last, tab, true);
    if (this.visibility === "filter") document.SetRowFiltered(this.start, last, tab, true);
    this.table.row = this.start + this.repeat;
  }
}

/** Dispatches a native row record or wrapper. @param table - Sheet context. @param element - ODF child token. @param attributes - Child attributes. @returns Axis context or null. */
export function createTableRowContext(
  table: ScXMLTableContext,
  element: XMLToken,
  attributes: FastAttributeList,
): SvXMLImportContext | null {
  switch (element) {
    case XMLToken.TABLE_TABLE_ROW:
      return new ScXMLTableRowContext(table, attributes);
    case XMLToken.TABLE_TABLE_ROWS:
    case XMLToken.TABLE_TABLE_HEADER_ROWS:
    case XMLToken.TABLE_TABLE_ROW_GROUP:
      return new ScXMLTableRowsContext(table, attributes, element);
    default:
      return null;
  }
}

/** A native row wrapper retains its initial position and commits its interval after its children. */
class ScXMLTableRowsContext extends ScXMLImportContext {
  private readonly start: number;
  private readonly hidden: boolean;

  /** Reads the original row group display default and cursor. @param table - Sheet context. @param attributes - ODF wrapper attributes. @param kind - Row wrapper token. @returns Context. */
  constructor(
    private readonly table: ScXMLTableContext,
    attributes: FastAttributeList,
    private readonly kind: XMLToken,
  ) {
    super(table.owner);
    this.start = table.row;
    const display = attributes.get(XMLToken.TABLE_DISPLAY);
    this.hidden = display !== null && display !== "true";
  }

  /** Dispatches children on this axis only. @param element - ODF child token. @param attributes - Child attributes. @returns Axis context or an inert context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    return createTableRowContext(this.table, element, attributes) ?? new SvXMLImportContext();
  }

  /** Commits a title or outline interval after the contained row records. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    if (element !== this.kind) return;
    const document = this.table.owner.GetDocument();
    const end = Math.min(Math.max(0, this.table.row - 1), document.MaxRow());
    if (end < this.start) return;
    const sheet = document.FetchTable(this.table.tab);
    if (!sheet) return;
    if (this.kind === XMLToken.TABLE_TABLE_ROW_GROUP) {
      sheet.StartOutlineTable().GetRowArray().Insert(this.start, end, this.hidden);
    } else if (this.kind === XMLToken.TABLE_TABLE_HEADER_ROWS) {
      const previous = sheet.GetRepeatRowRange();
      const tab = previous ? this.table.tab : 0;
      sheet.SetRepeatRowRange(
        new ScRange(0, previous?.aStart.Row() ?? this.start, tab, 0, end, tab),
      );
    }
  }
}
