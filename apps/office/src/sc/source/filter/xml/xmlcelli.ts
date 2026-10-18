/** @fileoverview Native scalar Calc XML cell/default/repeat import specialization. */
import { ScXMLImportContext } from "./importcontext";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { Converter } from "../../../../sax/source/tools/converter";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScAddress } from "../../../inc/address";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScXMLTableRowContext } from "./xmlrowi";
import { repeatCount } from "./xmlrowi";
import { ScXMLCellTextParaContext } from "./celltextparacontext";
/** Cell state is a transient native XML context,not an imported cell model. */
export class ScXMLTableRowCellContext extends ScXMLImportContext {
  private paragraph: string | undefined;
  private readonly repeat: number;
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
    this.type = attributes.get(XMLToken.TABLE_VALUE_TYPE);
    this.rawValue = attributes.get(XMLToken.OFFICE_VALUE);
    this.stringValue = attributes.get(XMLToken.OFFICE_STRING_VALUE);
    const formula = attributes.get(XMLToken.TABLE_FORMULA);
    this.source = !formula
      ? null
      : row.table.owner.ExtractFormulaNamespaceGrammar(formula, attributes);
    if (
      attributes.get(XMLToken.TABLE_NUMBER_COLUMNS_SPANNED) !== null ||
      attributes.get(XMLToken.TABLE_NUMBER_ROWS_SPANNED) !== null
    )
      throw new Error("ODS merged cells are not implemented");
    if (attributes.get(XMLToken.TABLE_STYLE_NAME) !== null)
      row.table.owner.unsupported("cell style/number format");
    if (this.type !== null && this.type !== "float" && this.type !== "string")
      throw new Error("ODS formatted cell type is not implemented");
    if (this.source !== null && (this.repeat > 1 || row.repeat > 1))
      throw new Error("ODS repeated formula services are not implemented");
  }
  /** Allows exactly one plain paragraph;multiline rich text needs its real edit-engine owner. @param value - Decoded paragraph. @returns Nothing. */
  setParagraph(value: string): void {
    if (this.paragraph !== undefined) throw new Error("ODS multiline cell text is not implemented");
    this.paragraph = value;
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
    if (this.covered) return;
    const value = this.stringValue || this.paragraph;
    if (this.source === null && this.type !== "float" && value === undefined) return;
    if (value !== undefined && /[\r\n]/.test(value))
      throw new Error("ODS multiline cell string is not implemented");
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
          if (this.source !== null)
            doc.setFormulaCell(address, string, FormulaGrammar.Grammar.GRAM_ODFF);
          else if (this.type === "float") doc.setNumericCell(address, numeric[0]);
          else doc.setStringCell(address, string);
        }
    } finally {
      string.dispose();
    }
  }
}
