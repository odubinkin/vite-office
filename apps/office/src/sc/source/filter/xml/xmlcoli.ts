/** @fileoverview Native ScXMLTableColContext repeated column geometry/visibility import;non-default cell-style inheritance remains explicit unsupported metadata. */
import { ScXMLImportContext } from "./importcontext";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { repeatCount } from "./xmlrowi";
import type { ScXMLTableContext } from "./xmltabi";
/** Native column context retains transient parser properties only. */
export class ScXMLTableColContext extends ScXMLImportContext {
  private readonly count: number;
  private readonly style: string | null;
  private readonly visibility: string;
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
    const cellStyle = attributes.get(XMLToken.TABLE_DEFAULT_CELL_STYLE_NAME);
    if (cellStyle !== null && cellStyle !== "" && cellStyle !== "Default")
      table.owner.unsupported("column default-cell-style inheritance");
  }
  /** Native overflow clamps both endpoints to MaxCol before applying source properties and advancing the import cursor. @returns Nothing. */
  override endFastElement(): void {
    const doc = this.table.owner.GetDocument(),
      first = Math.min(this.table.column, doc.MaxCol()),
      last = Math.min(this.table.column + this.count - 1, doc.MaxCol());
    if (this.style !== null && this.style !== "")
      this.table.owner.ApplyColumnStyle(this.style, this.table.tab, first, last);
    doc.SetColHidden(first, last, this.table.tab, this.visibility !== "visible");
    this.table.column += this.count;
  }
}
