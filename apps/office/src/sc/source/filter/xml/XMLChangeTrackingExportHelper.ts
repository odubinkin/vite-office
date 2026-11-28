/** @fileoverview Native ODF export of Calc content change actions and their original metadata. */
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { DateTime as UnoDateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { Converter } from "../../../../sax/source/tools/converter";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import type { SecurityOptionsSnapshot } from "../../../../unotools/source/config/securityoptions";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { writeNumberFormatAttributes } from "../../../../xmloff/source/style/numehelp";
import { escapeXml, exportText } from "../../../../xmloff/source/text/txtparae";
import type { ScBigRange } from "../../../inc/bigrange";
import type { ScCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import { ScMatrixMode, type ScFormulaCell } from "../../core/data/formulacell";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import { GetString as getEditString } from "../../core/tool/editutil";
import {
  ScChangeActionState,
  ScChangeActionType,
  ScChangeActionIns,
  type ScChangeAction,
  ScChangeActionContent,
} from "../../core/tool/chgtrack";
import { type CellTextStylePool, writeCellParagraphs } from "./xmlexprt.celltext";

/** Projects the actual native change track in action order. */
export class ScChangeTrackingExportHelper {
  private readonly userIds = new Map<string, number>();
  private readonly anonymize: boolean;

  /** Binds workbook, the shared text style pool and original security preferences. @param document - Native owner. @param textStyles - Workbook text styles. @param options - Active security flags. */
  public constructor(
    private readonly document: ScDocument,
    private readonly textStyles: CellTextStylePool,
    options: SecurityOptionsSnapshot,
  ) {
    this.anonymize = options.removePersonalInfoOnSaving && !options.keepRedlineInfoOnSaving;
  }

  /** Collects and writes the original tracked change wrapper and loaded content actions. @returns ODF XML. */
  public CollectAndWriteChanges(): string {
    const track = this.document.GetChangeTrack();
    if (!track) return "";
    let changes = "";
    for (const action of track.entries()) {
      if (action instanceof ScChangeActionContent) changes += this.WriteContentChange(action);
      else if (action instanceof ScChangeActionIns) changes += this.WriteInsertion(action);
    }
    return changes
      ? `<table:tracked-changes>${changes}</table:tracked-changes>`
      : "<table:tracked-changes/>";
  }

  /** Writes the original attributes common to change actions. @param action - Native action. @returns ODF attributes. */
  private AddActionAttributes(action: ScChangeAction): string {
    const state = action.GetState();
    const acceptance =
      state === ScChangeActionState.SC_CAS_ACCEPTED
        ? ' table:acceptance-state="accepted"'
        : state === ScChangeActionState.SC_CAS_REJECTED
          ? ' table:acceptance-state="rejected"'
          : "";
    const rejecting = action.GetRejectingNumber();
    const rejection = rejecting ? ` table:rejecting-change-id="ct${rejecting}"` : "";
    return ` table:id="ct${action.GetActionNumber()}"${acceptance}${rejection}`;
  }

  /** Writes the original ordered dependency identifiers. @param action - Native action. @returns Optional ODF dependency element. */
  private WriteDependings(action: ScChangeAction): string {
    const dependencies = action.GetDependents();
    return dependencies.length
      ? `<table:dependencies>${dependencies
          .map(
            /** Emits the original dependency ID. @param dependency - Dependent action. @returns Reference. */
            (dependency) => `<table:dependency table:id="ct${dependency.GetActionNumber()}"/>`,
          )
          .join("")}</table:dependencies>`
      : "";
  }

  /** Writes the native cell content change and previous cell. @param action - Native content action. @returns ODF element. */
  private WriteContentChange(action: ScChangeActionContent): string {
    const previous = action.GetPrevContent();
    const prior = previous ? ` table:id="ct${previous.GetActionNumber()}"` : "";
    return `<table:cell-content-change${this.AddActionAttributes(action)}>${writeBigRange(action.GetBigRange())}${this.WriteChangeInfo(action)}${this.WriteDependings(action)}<table:previous${prior}>${this.WriteCell(action.GetOldCell(), action.GetOldValue())}</table:previous></table:cell-content-change>`;
  }

  /** Writes the original row, column or sheet insertion. @param action - Native insertion. @returns ODF insertion element. */
  private WriteInsertion(action: ScChangeActionIns): string {
    const [column, row, table, lastColumn, lastRow, lastTable] = action.GetBigRange().GetVars();
    const type = action.GetType();
    const [axis, position, last] =
      type === ScChangeActionType.SC_CAT_INSERT_COLS
        ? ["column", column, lastColumn]
        : type === ScChangeActionType.SC_CAT_INSERT_ROWS
          ? ["row", row, lastRow]
          : ["table", table, lastTable];
    const count = last - position + 1n;
    const span = count > 1n ? ` table:count="${count}"` : "";
    const sheet = type === ScChangeActionType.SC_CAT_INSERT_TABS ? "" : ` table:table="${table}"`;
    return `<table:insertion${this.AddActionAttributes(action)} table:type="${axis}" table:position="${position}"${span}${sheet}>${this.WriteChangeInfo(action)}${this.WriteDependings(action)}</table:insertion>`;
  }

  /** Writes the native change author and UTC time, applying the original privacy policy. @param action - Native change. @returns ODF info element. */
  private WriteChangeInfo(action: ScChangeAction): string {
    const user = action.GetUser();
    let author = user;
    const date = this.anonymize
      ? new DateTime(new UnoDateTime(0, 0, 0, 12, 1, 1, 1970, true))
      : action.GetDateTimeUTC();
    if (this.anonymize) {
      if (!this.userIds.has(user)) this.userIds.set(user, this.userIds.size + 1);
      author = `Author${this.userIds.get(user)}`;
    }
    const buffer = new OUStringBuffer();
    try {
      Converter.convertDateTime(buffer, date.GetUNODateTime(), null);
      const value = buffer.makeStringAndClear();
      try {
        const comment = action.GetComment();
        return `<office:change-info><dc:creator>${escapeXml(author)}</dc:creator><dc:date>${text(value)}</dc:date>${comment ? `<text:p>${exportText(comment)}</text:p>` : ""}</office:change-info>`;
      } finally {
        value.dispose();
      }
    } finally {
      buffer.dispose();
    }
  }

  /** Writes the original cell representation. @param cell - Previous native snapshot. @param input - Original date/time input. @returns ODF tracked cell. */
  private WriteCell(cell: ScCellValue, input: string): string {
    switch (cell.getType()) {
      case CellType.CELLTYPE_NONE:
        return "<table:change-track-table-cell/>";
      case CellType.CELLTYPE_STRING:
        return writeTrackedString(text(cell.getSharedString().getString()));
      case CellType.CELLTYPE_VALUE:
        return `<table:change-track-table-cell${this.SetValueAttributes(cell.getDouble(), input)}/>`;
      case CellType.CELLTYPE_EDIT: {
        const edit = cell.getEditText();
        if (!edit) return writeTrackedString("");
        const value = getEditString(edit, this.document);
        try {
          return value.isEmpty()
            ? writeTrackedString("")
            : `<table:change-track-table-cell office:value-type="string">${writeCellParagraphs(this.textStyles.collect(edit))}</table:change-track-table-cell>`;
        } finally {
          value.dispose();
        }
      }
      case CellType.CELLTYPE_FORMULA: {
        const formula = cell.getFormula();
        if (!formula) throw new Error("Missing historical Calc formula");
        return this.WriteFormulaCell(formula);
      }
    }
  }

  /** Writes original formula position, grammar and matrix metadata. @param formula - Historical formula cell. @returns ODF tracked cell. */
  private WriteFormulaCell(formula: ScFormulaCell): string {
    const grammar = this.document.GetStorageGrammar();
    const prefix = grammar === FormulaGrammar.Grammar.GRAM_ODFF ? "of" : "oooc";
    const address = ScRangeStringConverter.GetStringFromAddress(
      formula.aPos,
      this.document,
      FormulaGrammar.AddressConvention.CONV_OOO,
    );
    const source = formula.GetFormula(grammar);
    try {
      const value = text(source);
      const matrix = formula.GetMatrixFlag();
      const code = matrix === ScMatrixMode.NONE ? value : value.slice(1, -1);
      let attributes = ` table:cell-address="${escapeXml(address)}" table:formula="${prefix}:${escapeXml(code)}"`;
      if (matrix === ScMatrixMode.Formula) {
        const [columns, rows] = formula.GetMatColsRows() ?? [0, 0];
        attributes += ` table:number-matrix-columns-spanned="${columns}" table:number-matrix-rows-spanned="${rows}"`;
      } else if (matrix === ScMatrixMode.Reference) attributes += ' table:matrix-covered="true"';
      return formula.IsValue()
        ? `<table:change-track-table-cell${attributes}${this.SetValueAttributes(formula.GetValue(), value)}/>`
        : writeTrackedString(text(formula.GetString().getString()), attributes);
    } finally {
      source.dispose();
    }
  }

  /** Writes a native numeric value and its recognized date or time spelling. @param value - Numeric cell result. @param input - Original input text or formula. @returns ODF value attributes. */
  private SetValueAttributes(value: number, input: string): string {
    const format = this.document.GetFormatTable();
    if (input) {
      const lexical = unicode(input);
      const key: [number] = [0];
      const parsed: [number] = [0];
      try {
        if (format.IsNumberFormat(lexical, key, parsed)) {
          const kind = format.GetType(key[0]) & ~SvNumFormatType.DEFINED;
          if (kind === SvNumFormatType.DATE || kind === SvNumFormatType.TIME)
            return writeNumberFormatAttributes(format, key[0], parsed[0], format.GetNullDate());
        }
      } finally {
        lexical.dispose();
      }
    }
    return writeNumberFormatAttributes(format, 0, value, format.GetNullDate());
  }
}

/** Writes the original string cell and optional paragraph. @param value - Actual cell text. @param attributes - Optional formula attributes. @returns ODF tracked cell. */
function writeTrackedString(value: string, attributes = ""): string {
  const element = `<table:change-track-table-cell${attributes} office:value-type="string"`;
  return value
    ? `${element}><text:p>${exportText(value)}</text:p></table:change-track-table-cell>`
    : `${element}/>`;
}

/** Writes the original compact or ranged address. @param range - Native bounds. @returns ODF cell address. */
function writeBigRange(range: ScBigRange): string {
  const [column, row, tab, endColumn, endRow, endTab] = range.GetVars();
  if (column === endColumn && row === endRow && tab === endTab)
    return `<table:cell-address table:column="${column}" table:row="${row}" table:table="${tab}"/>`;
  return `<table:cell-address table:start-column="${column}" table:start-row="${row}" table:start-table="${tab}" table:end-column="${endColumn}" table:end-row="${endRow}" table:end-table="${endTab}"/>`;
}
