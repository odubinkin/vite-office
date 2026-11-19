/** @fileoverview Native scalar Calc XML cell/default/repeat import specialization. */
import { ScXMLImportContext } from "./importcontext";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { Converter } from "../../../../sax/source/tools/converter";
import { ScAddress } from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScXMLTableRowContext } from "./xmlrowi";
import { repeatCount } from "./xmlrowi";
import { ScXMLCellTextParaContext } from "./celltextparacontext";
import { createCellEditText } from "./xmlcelli.edit";
import type { CellTextParagraph } from "./xmlexprt.celltext";
/** Cell state is a transient native XML context,not an imported cell model. */
export class ScXMLTableRowCellContext extends ScXMLImportContext {
  private readonly style: import("../../../inc/patattr").ScPatternAttr | null;
  private readonly paragraphs: CellTextParagraph[] = [];
  private readonly repeat: number;
  private readonly mergedColumns: number;
  private readonly mergedRows: number;
  private readonly type: string | null;
  private readonly source: string | null;
  private readonly rawValue: string | null;
  private readonly stringValue: string | null;
  /** Reads native scalar attributes and explicit unsupported boundaries. @param row - Row cursor. @param attributes - Actual SAX attributes/scope. @param covered - Covered cell. @returns Context. */
  constructor(
    private readonly row: ScXMLTableRowContext,
    attributes: FastAttributeList,
    private readonly covered: boolean,
  ) {
    super(row.table.owner);
    this.repeat = repeatCount(attributes, XMLToken.TABLE_NUMBER_COLUMNS_REPEATED);
    this.mergedColumns = repeatCount(attributes, XMLToken.TABLE_NUMBER_COLUMNS_SPANNED);
    this.mergedRows = repeatCount(attributes, XMLToken.TABLE_NUMBER_ROWS_SPANNED);
    this.type = attributes.get(XMLToken.TABLE_VALUE_TYPE);
    this.rawValue = attributes.get(XMLToken.OFFICE_VALUE);
    this.stringValue = attributes.get(XMLToken.OFFICE_STRING_VALUE);
    const formula = attributes.get(XMLToken.TABLE_FORMULA);
    this.source = !formula
      ? null
      : row.table.owner.ExtractFormulaNamespaceGrammar(formula, attributes);
    const name = attributes.get(XMLToken.TABLE_STYLE_NAME);
    this.style = name === null ? null : row.table.owner.GetAutoStyle(name);
    if (this.type !== null && this.type !== "float" && this.type !== "string")
      throw new Error("ODS formatted cell type is not implemented");
    if (this.source !== null && (this.repeat > 1 || row.repeat > 1))
      throw new Error("ODS repeated formula services are not implemented");
  }
  /** Appends native text paragraphs, preserving the EditEngine line boundary. @param value - Decoded paragraph spans. @returns Nothing. */
  setParagraph(value: CellTextParagraph): void {
    this.paragraphs.push(value);
  }
  /** Creates actual simple text child state. @param element - Token. @returns Context. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext {
    if (element !== XMLToken.TEXT_P) throw new Error("ODS cell object is not implemented");
    return new ScXMLCellTextParaContext(this);
  }
  /** Commits supported scalar contents directly into native document cells and advances the XML cursor. @returns Nothing. */
  override endFastElement(): void {
    const owner = this.row.table.owner,
      doc = owner.GetDoc(),
      pos = new ScAddress(this.row.col, this.row.start, this.row.table.tab);
    this.row.col += this.repeat;
    if (!this.covered && (this.mergedColumns > 1 || this.mergedRows > 1)) {
      const lastColumn = pos.Col() + this.mergedColumns - 1;
      const lastRow = pos.Row() + this.mergedRows - 1;
      if (owner.GetDocument().ValidColRow(lastColumn, lastRow))
        doc.setMergedCells(pos.Tab(), pos.Col(), pos.Row(), lastColumn, lastRow);
    }
    let text = "";
    let styled = false;
    for (const paragraph of this.paragraphs) {
      for (const [span, style] of paragraph) {
        text += span;
        styled ||= !!style;
      }
      text += "\n";
    }
    const value = this.stringValue || (this.paragraphs.length ? text.slice(0, -1) : undefined);
    if (this.style !== null) {
      const endCol = Math.min(owner.GetDocument().MaxCol(), pos.Col() + this.repeat - 1),
        endRow = Math.min(owner.GetDocument().MaxRow(), pos.Row() + this.row.repeat - 1);
      if (owner.GetDocument().ValidColRow(pos.Col(), pos.Row()))
        owner
          .GetDocument()
          .ApplyPatternAreaTab(pos.Col(), pos.Row(), endCol, endRow, pos.Tab(), this.style);
      if (endCol !== pos.Col() + this.repeat - 1 || endRow !== pos.Row() + this.row.repeat - 1)
        owner.unsupported("cell range overflow");
    }
    if (this.source === null && this.type !== "float" && value === undefined) return;
    const columns = Math.min(this.repeat, owner.GetDocument().MaxCol() - pos.Col() + 1),
      rows = Math.min(this.row.repeat, owner.GetDocument().MaxRow() - pos.Row() + 1);
    if (columns < this.repeat || rows < this.row.repeat) owner.unsupported("cell range overflow");
    if (columns <= 0 || rows <= 0) {
      owner.unsupported("cell range overflow");
      return;
    }
    owner.consumeCells(columns * rows);
    const numeric: [number] = [0];
    if (this.rawValue !== null) Converter.convertDouble(numeric, this.rawValue);
    if (!Number.isFinite(numeric[0])) numeric[0] = 0;
    const string = unicode(this.source ?? value ?? "");
    try {
      for (let col = 0; col < columns; col++)
        for (let row = 0; row < rows; row++) {
          const address = new ScAddress(pos.Col() + col, pos.Row() + row, pos.Tab());
          if (this.covered && owner.GetDocument().GetCellType(address) !== CellType.CELLTYPE_NONE)
            continue;
          if (this.source !== null) owner.AddFormula(address, this.source);
          else if (this.type === "float") doc.setNumericCell(address, numeric[0]);
          else if (styled && !this.stringValue)
            doc.setEditCell(address, createCellEditText(owner, this.paragraphs));
          else if (this.paragraphs.length > 1 || (value !== undefined && /[\r\n]/.test(value))) {
            owner.GetDocument().SetTextCell(address, string);
            doc.invalidateBlockPositionSet(address.Tab());
          } else doc.setStringCell(address, string);
        }
    } finally {
      string.dispose();
    }
  }
}
