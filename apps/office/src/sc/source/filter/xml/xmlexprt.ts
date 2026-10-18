/** @fileoverview Scalar ScXMLExport content path over actual row-major document cells and native ODFF serialization. */
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { ScDocument } from "../../../inc/document";
import { MAXCOL, MAXROW } from "../../../inc/address";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { CellType } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { escapeXml, exportText } from "../../../../xmloff/source/text/txtparae";
import { doubleToString } from "../../../../sal/rtl/strtmpl.math";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Browser export bounds/cancellation over the native content traversal. */
export interface ScXMLExportOptions {
  readonly isCancelled?: () => boolean;
  readonly maxOutputBytes?: number;
}
/** Native spreadsheet content export specialization;styles,objects and full filter services remain unported. */
export class ScXMLExport {
  /** Binds actual document. @param document - Document. @param options - Controls. @returns Exporter. */
  constructor(
    private readonly document: ScDocument,
    private readonly options: ScXMLExportOptions = {},
  ) {}
  /** Serializes actual supported cells,compressing empty row/cell spans without materializing them. @returns ODF content XML. */
  exportContent(): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:of="${ODF_NAMESPACES.of}" office:version="1.3"><office:body><office:spreadsheet>`;
    for (let tab = 0; tab < this.document.GetTableCount(); tab++) {
      const name = new OUString();
      this.document.GetName(tab, name);
      try {
        xml += `<table:table table:name="${escapeXml(text(name))}">`;
      } finally {
        name.dispose();
      }
      const iterator = new ScHorizontalCellIterator(this.document, tab, 0, 0, MAXCOL, MAXROW),
        col: [number] = [0],
        row: [number] = [0];
      let currentRow = -1,
        nextCol = 0;
      for (let cell = iterator.GetNext(col, row); cell; cell = iterator.GetNext(col, row)) {
        if (this.options.isCancelled?.()) throw new Error("ODS operation was cancelled");
        if (row[0] !== currentRow) {
          if (currentRow >= 0) xml += "</table:table-row>";
          const gap = row[0] - currentRow - 1;
          if (gap)
            xml += `<table:table-row table:number-rows-repeated="${gap}"><table:table-cell/></table:table-row>`;
          xml += "<table:table-row>";
          currentRow = row[0];
          nextCol = 0;
        }
        const gap = col[0] - nextCol;
        if (gap) xml += `<table:table-cell table:number-columns-repeated="${gap}"/>`;
        nextCol = col[0] + 1;
        let formula = "",
          value = "",
          children = "";
        const type = cell.getType();
        if (type === CellType.CELLTYPE_FORMULA) {
          const actual = cell.getFormula() as ScFormulaCell;
          const source = actual.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF);
          try {
            formula = ` table:formula="of:${escapeXml(text(source))}"`;
          } finally {
            source.dispose();
          }
          if (actual.GetErrCode() === FormulaError.NONE && !actual.IsEmpty()) {
            if (actual.IsValue())
              value = ` office:value-type="float" office:value="${doubleToString(actual.GetValue())}"`;
            else {
              const string = text(actual.GetString().getString());
              value = ' office:value-type="string"';
              children = this.textParagraph(string);
            }
          }
        } else if (type === CellType.CELLTYPE_VALUE)
          value = ` office:value-type="float" office:value="${doubleToString(cell.getDouble())}"`;
        else {
          // The iterator/store trait contract leaves only the supported literal-string family.
          value = ' office:value-type="string"';
          const string = cell.getSharedString() as SharedStringConstReference;
          children = this.textParagraph(text(string.getString()));
        }
        xml += `<table:table-cell${formula}${value}>${children}</table:table-cell>`;
      }
      xml +=
        currentRow >= 0
          ? "</table:table-row>"
          : "<table:table-row><table:table-cell/></table:table-row>";
      xml += "</table:table>";
    }
    return xml + "</office:spreadsheet></office:body></office:document-content>";
  }
  /** Reuses actual shared Writer/Calc inline encoding;multiline/rich edit text is an explicit boundary. @param value - Literal simple text. @returns Paragraph XML. */
  private textParagraph(value: string): string {
    if (/[\r\n]/.test(value)) throw new Error("ODS multiline cell export is not implemented");
    return `<text:p>${exportText(value)}</text:p>`;
  }
}
