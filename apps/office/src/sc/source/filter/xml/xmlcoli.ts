/** @fileoverview Native ScXMLTableColContext column geometry, visibility and default cell style. */
import { ScXMLImportContext } from "./importcontext";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { ScRange } from "../../../inc/address";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { repeatCount } from "./xmlrowi";
import type { ScXMLTableContext } from "./xmltabi";
/** Native column context retains transient parser properties only. */
export class ScXMLTableColContext extends ScXMLImportContext {
  private readonly count: number;
  private readonly style: string | null;
  private readonly visibility: string;
  private readonly cellStyle: string;
  /** Reads source repetition clamp and visible default. @param table - Real table cursor. @param attributes - Native attributes. @returns Context. */
  constructor(
    private readonly table: ScXMLTableContext,
    attributes: FastAttributeList,
  ) {
    super(table.owner);
    this.count = Math.min(
      repeatCount(attributes, XMLToken.TABLE_NUMBER_COLUMNS_REPEATED),
      table.owner.GetDocument().MaxCol() + 1,
    );
    this.style = attributes.get(XMLToken.TABLE_STYLE_NAME);
    this.visibility = attributes.get(XMLToken.TABLE_VISIBILITY) ?? "visible";
    this.cellStyle = attributes.get(XMLToken.TABLE_DEFAULT_CELL_STYLE_NAME) || "Default";
  }
  /** Native overflow clamps both endpoints to MaxCol before applying source properties and advancing the import cursor. @returns Nothing. */
  override endFastElement(): void {
    const doc = this.table.owner.GetDocument(),
      first = Math.min(this.table.column, doc.MaxCol()),
      last = Math.min(this.table.column + this.count - 1, doc.MaxCol());
    if (this.style !== null && this.style !== "")
      this.table.owner.ApplyColumnStyle(this.style, this.table.tab, first, last);
    doc.SetColHidden(first, last, this.table.tab, this.visibility !== "visible");
    this.table.styles.AddColumnStyle(this.cellStyle, Math.max(0, last - this.table.column + 1));
    this.table.column += this.count;
  }
}

/** Dispatches a native column record or wrapper. @param table - Sheet context. @param element - ODF child token. @param attributes - Child attributes. @returns Axis context or null. */
export function createTableColContext(
  table: ScXMLTableContext,
  element: XMLToken,
  attributes: FastAttributeList,
): SvXMLImportContext | null {
  switch (element) {
    case XMLToken.TABLE_TABLE_COLUMN:
      return new ScXMLTableColContext(table, attributes);
    case XMLToken.TABLE_TABLE_COLUMNS:
    case XMLToken.TABLE_TABLE_HEADER_COLUMNS:
    case XMLToken.TABLE_TABLE_COLUMN_GROUP:
      return new ScXMLTableColsContext(table, attributes, element);
    default:
      return null;
  }
}

/** A native column wrapper retains its initial position and commits its interval after its children. */
class ScXMLTableColsContext extends ScXMLImportContext {
  private readonly start: number;
  private readonly hidden: boolean;

  /** Reads the original column group display default and cursor. @param table - Sheet context. @param attributes - ODF wrapper attributes. @param kind - Column wrapper token. @returns Context. */
  constructor(
    private readonly table: ScXMLTableContext,
    attributes: FastAttributeList,
    private readonly kind: XMLToken,
  ) {
    super(table.owner);
    this.start = Math.min(table.column, table.owner.GetDocument().MaxCol());
    const display = attributes.get(XMLToken.TABLE_DISPLAY);
    this.hidden = display === "false";
  }

  /** Dispatches children on this axis only. @param element - ODF child token. @param attributes - Child attributes. @returns Axis context or an inert context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    return createTableColContext(this.table, element, attributes) ?? new SvXMLImportContext();
  }

  /** Commits a title or outline interval after the contained column records. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    if (element !== this.kind) return;
    const document = this.table.owner.GetDocument();
    const end = Math.min(this.table.column, document.MaxCol()) - 1;
    if (end < this.start) return;
    const sheet = document.FetchTable(this.table.tab);
    if (!sheet) return;
    if (this.kind === XMLToken.TABLE_TABLE_COLUMN_GROUP) {
      sheet.StartOutlineTable().GetColArray().Insert(this.start, end, this.hidden);
    } else if (this.kind === XMLToken.TABLE_TABLE_HEADER_COLUMNS) {
      const previous = sheet.GetRepeatColRange();
      const tab = previous ? this.table.tab : 0;
      sheet.SetRepeatColRange(
        new ScRange(previous?.aStart.Col() ?? this.start, 0, tab, end, 0, tab),
      );
    }
  }
}
