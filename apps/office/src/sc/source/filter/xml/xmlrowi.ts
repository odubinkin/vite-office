/** @fileoverview Native Calc row/repeat cursor for scalar XML cells. */
import { ScXMLImportContext } from "./importcontext";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
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
  /** Binds row cursor and native repeat default. @param table - Actual sheet cursor. @param attributes - Attributes. @returns Context. */
  constructor(
    readonly table: ScXMLTableContext,
    attributes: FastAttributeList,
  ) {
    super(table.owner);
    this.repeat = repeatCount(attributes, XMLToken.TABLE_NUMBER_ROWS_REPEATED);
    this.start = table.row;
    const visibility = attributes.get(XMLToken.TABLE_VISIBILITY),
      doc = table.owner.GetDocument(),
      last = Math.min(doc.MaxRow(), this.start + this.repeat - 1);
    if (visibility === "collapse" || visibility === "filter")
      doc.SetRowHidden(this.start, last, table.tab, true);
    if (visibility === "filter") doc.SetRowFiltered(this.start, last, table.tab, true);
    const style = attributes.get(XMLToken.TABLE_STYLE_NAME);
    if (style !== null)
      table.owner.ApplyRowStyle(
        style,
        table.tab,
        this.start,
        Math.min(table.owner.GetDocument().MaxRow(), this.start + this.repeat - 1),
      );
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
  /** Advances a complete repeated row span without copying its contents to a second model. @returns Nothing. */
  override endFastElement(): void {
    this.table.row = this.start + this.repeat;
  }
}
