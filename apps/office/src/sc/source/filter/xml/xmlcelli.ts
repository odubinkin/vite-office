/** @fileoverview Native scalar Calc XML cell/default/repeat import specialization. */
import { FormulaError, isPublishedFormulaError } from "../../../../formula/inc/errorcodes";
import { errorSymbols } from "../../../../formula/inc/FormulaCompiler";
import { ScXMLImportContext } from "./importcontext";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { toDouble } from "../../../../o3tl/inc/string_view";
import { convertDurationToDays } from "../../../../sax/source/tools/converter.duration";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { SvNumFormatType as T } from "../../../../svl/inc/zforlist";
import { ScAddress, ScRange } from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScXMLTableRowContext } from "./xmlrowi";
import { repeatCount } from "./xmlrowi";
import { ScXMLAnnotationContext } from "./xmlannoi";
import { ScXMLCellTextParaContext } from "./celltextparacontext";
import { createCellEditText } from "./xmlcelli.edit";
import type { CellTextParagraph } from "./xmlexprt.celltext";
/** Cell state is a transient native XML context,not an imported cell model. */
export class ScXMLTableRowCellContext extends ScXMLImportContext {
  private readonly style: string | null;
  private annotation: ScXMLAnnotationContext | null = null;
  private readonly paragraphs: CellTextParagraph[] = [];
  private readonly repeat: number;
  private readonly mergedColumns: number;
  private readonly mergedRows: number;
  private readonly matrixColumns: number | null;
  private readonly matrixRows: number | null;
  private readonly type: number;
  private readonly currency: string | null;
  private readonly numberValue: number;
  private readonly errorValue: boolean;
  private readonly hasExtendedValueType: boolean;
  private readonly formulaTextResult: boolean;
  private readonly hasStyle: boolean;
  private readonly source: string | null;
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
    this.matrixColumns = attributes.getAsInteger(XMLToken.TABLE_MATRIX_COLS_SPANNED);
    this.matrixRows = attributes.getAsInteger(XMLToken.TABLE_MATRIX_ROWS_SPANNED);
    let type: number = T.TEXT;
    let number = NaN;
    let string: string | null = null;
    let currency: string | null = null;
    let error = false;
    let extended = false;
    let formulaText = false;
    let empty = true;
    const numeric: [number] = [NaN];
    const formatter = row.table.owner.GetDocument().GetFormatTable();
    for (const [token, value] of attributes) {
      switch (token) {
        case XMLToken.CALCEXT_VALUE_TYPE:
        case XMLToken.TABLE_VALUE_TYPE:
          if (token === XMLToken.CALCEXT_VALUE_TYPE) extended = true;
          if (token === XMLToken.CALCEXT_VALUE_TYPE && value === "error") error = true;
          else type = row.table.owner.GetCellType(value);
          empty = false;
          break;
        case XMLToken.OFFICE_VALUE:
          if (!value) break;
          number = toDouble(new TextEncoder().encode(value));
          if (number === 0) formulaText = true;
          empty = false;
          break;
        case XMLToken.OFFICE_DATE_VALUE:
          if (!value) break;
          numeric[0] = number;
          SvXMLUnitConverter.convertDateTimeToDays(numeric, value, formatter.GetNullDate());
          number = numeric[0];
          empty = false;
          break;
        case XMLToken.OFFICE_TIME_VALUE:
          if (!value) break;
          numeric[0] = number;
          convertDurationToDays(numeric, value);
          number = numeric[0];
          empty = false;
          break;
        case XMLToken.OFFICE_BOOLEAN_VALUE:
          if (!value) break;
          number =
            value === "true"
              ? 1
              : value === "false"
                ? 0
                : toDouble(new TextEncoder().encode(value));
          empty = false;
          break;
        case XMLToken.OFFICE_STRING_VALUE:
          if (!value) break;
          string = value;
          empty = false;
          break;
        case XMLToken.OFFICE_CURRENCY:
          currency = value;
          break;
      }
    }
    this.currency = currency;
    this.type = type;
    this.numberValue = number;
    this.stringValue = string;
    this.errorValue = error;
    this.hasExtendedValueType = extended;
    this.formulaTextResult = formulaText || type === T.TEXT || empty;
    const formula = attributes.get(XMLToken.TABLE_FORMULA);
    this.source = !formula
      ? null
      : row.table.owner.ExtractFormulaNamespaceGrammar(formula, attributes);
    const name = attributes.get(XMLToken.TABLE_STYLE_NAME);
    this.style = name;
    this.hasStyle = name !== null;
  }
  /** Appends native text paragraphs, preserving the EditEngine line boundary. @param value - Decoded paragraph spans. @returns Nothing. */
  setParagraph(value: CellTextParagraph): void {
    this.paragraphs.push(value);
  }
  /** Dispatches native text or annotation state. @param element - Token. @param attributes - Child attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.OFFICE_ANNOTATION) {
      return (this.annotation = new ScXMLAnnotationContext(
        this.GetScImport(),
        this.row.table.tab,
        attributes,
      ));
    }
    if (element !== XMLToken.TEXT_P) throw new Error("ODS cell object is not implemented");
    return new ScXMLCellTextParaContext(this, this.row.table.tab);
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
      for (const [span, style, field] of paragraph) {
        text += span;
        styled ||= !!style || field !== undefined;
      }
      text += "\n";
    }
    const value = this.stringValue ?? (this.paragraphs.length ? text.slice(0, -1) : undefined);
    const document = owner.GetDocument();
    const endCol = Math.min(document.MaxCol(), pos.Col() + this.repeat - 1),
      endRow = Math.min(document.MaxRow(), pos.Row() + this.row.repeat - 1);
    if (document.ValidColRow(pos.Col(), pos.Row()))
      this.row.table.styles.AddRange(
        new ScRange(
          pos.Col(),
          pos.Row(),
          pos.Tab(),
          this.source === null ? endCol : pos.Col(),
          this.source === null ? endRow : pos.Row(),
          pos.Tab(),
        ),
        this.style,
        this.source !== null && this.type === T.DATETIME ? T.UNDEFINED : this.type,
        this.currency,
      );
    if (
      this.style !== null &&
      (endCol !== pos.Col() + this.repeat - 1 || endRow !== pos.Row() + this.row.repeat - 1)
    )
      owner.unsupported("cell range overflow");
    const hasValue = this.type !== T.UNDEFINED && (this.type !== T.TEXT || value !== undefined);
    if (this.source === null && !hasValue && !this.annotation) return;
    const columns = Math.min(this.repeat, owner.GetDocument().MaxCol() - pos.Col() + 1),
      rows = Math.min(this.row.repeat, owner.GetDocument().MaxRow() - pos.Row() + 1);
    if (columns < this.repeat || rows < this.row.repeat) owner.unsupported("cell range overflow");
    if (columns <= 0 || rows <= 0) {
      owner.unsupported("cell range overflow");
      return;
    }
    const number = this.numberValue;
    const firstParagraph = this.paragraphs[0]
      ?.map(
        /** Reads the first displayed formula paragraph. @param span - Text fragment. @returns Text. */ ([
          fragment,
        ]) => fragment,
      )
      .join("");
    const possibleEmpty = firstParagraph === "";
    const legacyMarker =
      !this.hasExtendedValueType &&
      (possibleEmpty || firstParagraph?.startsWith("Err:") || firstParagraph?.startsWith("#"));
    const cachedString = this.formulaTextResult
      ? legacyMarker
        ? firstParagraph
        : (this.stringValue ?? (this.type === T.TEXT ? value : undefined))
      : undefined;
    const possibleLegacyError =
      legacyMarker &&
      (possibleEmpty ||
        firstParagraph?.startsWith("Err:") ||
        (cachedString !== undefined && errorSymbols.has(cachedString)));
    const cache =
      this.errorValue || (cachedString !== undefined && possibleLegacyError)
        ? undefined
        : (cachedString ?? (Number.isFinite(number) ? number : undefined));
    const legacyError = firstParagraph?.startsWith("Err:")
      ? (Number(firstParagraph.slice(4)) as FormulaError)
      : undefined;
    const errorText = firstParagraph ?? this.stringValue ?? "";
    const error =
      (this.errorValue || !this.hasExtendedValueType) &&
      (this.errorValue || possibleLegacyError || (this.source === null && number === 0))
        ? (errorSymbols.get(errorText) ??
          (legacyError !== undefined && isPublishedFormulaError(legacyError)
            ? legacyError
            : FormulaError.NONE))
        : FormulaError.NONE;
    const matrixValue =
      error !== FormulaError.NONE || (possibleEmpty && number === 0)
        ? null
        : this.type === T.TEXT
          ? (value ?? null)
          : Number.isFinite(number)
            ? number
            : null;
    if (this.source !== null) {
      if (this.annotation) {
        owner.consumeCells(1);
        this.annotation.SetAnnotation(pos);
      }
      if (this.matrixColumns !== null || this.matrixRows !== null) {
        if ((this.matrixColumns ?? 0) > 0 && (this.matrixRows ?? 0) > 0)
          owner.AddMatrixFormula(
            new ScRange(
              pos.Col(),
              pos.Row(),
              pos.Tab(),
              Math.min(document.MaxCol(), pos.Col() + (this.matrixColumns as number) - 1),
              Math.min(document.MaxRow(), pos.Row() + (this.matrixRows as number) - 1),
              pos.Tab(),
            ),
            this.source,
            cachedString === undefined
              ? error || this.paragraphs.length || Number.isFinite(number) || value !== undefined
                ? matrixValue
                : undefined
              : error
                ? null
                : cachedString,
            error,
          );
      } else {
        if (!this.annotation) owner.consumeCells(1);
        owner.AddFormula(pos, this.source, cache, this.hasStyle, possibleEmpty && number === 0);
      }
      return;
    }
    const string = unicode(value ?? "");
    try {
      for (let col = 0; col < columns; col++)
        for (let row = 0; row < rows; row++) {
          const address = new ScAddress(pos.Col() + col, pos.Row() + row, pos.Tab());
          if (this.annotation) {
            owner.consumeCells(1);
            this.annotation.SetAnnotation(address);
          }
          if (!hasValue) continue;
          if (this.covered && owner.GetDocument().GetCellType(address) !== CellType.CELLTYPE_NONE)
            continue;
          if (owner.SetMatrixFormulaResult(address, matrixValue, error)) continue;
          if (!this.annotation) owner.consumeCells(1);
          if (this.type !== T.TEXT)
            doc.setNumericCell(address, Number.isFinite(number) ? number : 0);
          else if (
            this.stringValue === null &&
            (styled || this.paragraphs.length > 1 || /[\r\n]/.test(value ?? ""))
          )
            doc.setEditCell(address, createCellEditText(owner, this.paragraphs));
          else doc.setStringCell(address, string);
        }
    } finally {
      string.dispose();
    }
  }
}
