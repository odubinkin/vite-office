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
  ScChangeActionDel,
  ScChangeActionMove,
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
      else if (action instanceof ScChangeActionDel) changes += this.WriteDeletion(action);
      else if (action instanceof ScChangeActionMove) changes += this.WriteMovement(action);
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

  /** Writes the original ordered dependency identifiers and deleted records. @param action - Native action. @returns Optional ODF link elements. */
  private WriteDependings(action: ScChangeAction): string {
    const dependencies = action.GetDependents();
    const deleted = action.GetDeleted();
    const dependings = dependencies.length
      ? `<table:dependencies>${dependencies
          .map(
            /** Emits the original dependency ID. @param dependency - Dependent action. @returns Reference. */
            (dependency) => `<table:dependency table:id="ct${dependency.GetActionNumber()}"/>`,
          )
          .join("")}</table:dependencies>`
      : "";
    const deletions = deleted.length
      ? `<table:deletions>${deleted.map(this.WriteDeleted.bind(this)).join("")}</table:deletions>`
      : "";
    return dependings + deletions;
  }

  /** Writes an original deleted action reference or generated cell snapshot. @param action - Deleted native action. @returns ODF deletion reference. */
  private WriteDeleted(action: ScChangeAction): string {
    const id = action.GetActionNumber();
    if (!(action instanceof ScChangeActionContent))
      return `<table:change-deletion table:id="ct${id}"/>`;
    if (this.document.GetChangeTrack()?.IsGenerated(id))
      return `<table:cell-content-deletion>${writeBigRange(action.GetBigRange())}${this.WriteCell(action.GetNewCell(), action.GetNewValue())}</table:cell-content-deletion>`;
    const value =
      action.IsTopContent() && action.IsDeletedIn()
        ? this.WriteCell(action.GetNewCell(), action.GetNewValue())
        : "";
    return value
      ? `<table:cell-content-deletion table:id="ct${id}">${value}</table:cell-content-deletion>`
      : `<table:cell-content-deletion table:id="ct${id}"/>`;
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

  /** Writes the native deletion and the leading span for a multi-deletion. @param action - Original deletion. @returns ODF deletion element. */
  private WriteDeletion(action: ScChangeActionDel): string {
    const type = action.GetType();
    const range = action.GetBigRange();
    const [column, row, table] = range.GetVars();
    const [axis, position] =
      type === ScChangeActionType.SC_CAT_DELETE_COLS
        ? ["column", column]
        : type === ScChangeActionType.SC_CAT_DELETE_ROWS
          ? ["row", row]
          : ["table", table];
    let attributes = ` table:type="${axis}" table:position="${position}"`;
    if (type !== ScChangeActionType.SC_CAT_DELETE_TABS) {
      attributes += ` table:table="${table}"`;
      if (!action.GetDx() && !action.GetDy()) {
        let count = 1;
        for (
          let next = action.GetNext();
          next instanceof ScChangeActionDel && next.GetType() === type;
          next = next.GetNext()
        ) {
          if ((!next.GetDx() && !next.GetDy()) || !next.GetBigRange().equals(range)) break;
          count++;
        }
        if (count > 1) attributes += ` table:multi-deletion-spanned="${count}"`;
      }
    }
    return `<table:deletion${this.AddActionAttributes(action)}${attributes}>${this.WriteChangeInfo(action)}${this.WriteDependings(action)}${this.WriteCutOffs(action)}</table:deletion>`;
  }

  /** Writes the native cutoff relationships in insertion and movement order. @param action - Original deletion. @returns Optional ODF cutoff list. */
  private WriteCutOffs(action: ScChangeActionDel): string {
    const insertion = action.GetCutOffInsert();
    let cutoffs = insertion
      ? `<table:insertion-cut-off table:id="ct${insertion.action.GetActionNumber()}" table:position="${insertion.count}"/>`
      : "";
    for (const movement of action.GetMoveCutOffs()) {
      const position =
        movement.from === movement.to
          ? ` table:position="${movement.from}"`
          : ` table:start-position="${movement.from}" table:end-position="${movement.to}"`;
      cutoffs += `<table:movement-cut-off table:id="ct${movement.action.GetActionNumber()}"${position}/>`;
    }
    return cutoffs ? `<table:cut-offs>${cutoffs}</table:cut-offs>` : "";
  }

  /** Writes the native movement of the original source to its target. @param action - Original movement. @returns ODF movement element. */
  private WriteMovement(action: ScChangeActionMove): string {
    return `<table:movement${this.AddActionAttributes(action)}>${writeBigRange(action.GetFromRange(), "source-range-address")}${writeBigRange(action.GetBigRange(), "target-range-address")}${this.WriteChangeInfo(action)}${this.WriteDependings(action)}</table:movement>`;
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

/** Writes the original compact or ranged address. @param range - Native bounds. @param element - Original range element. @returns ODF range address. */
function writeBigRange(range: ScBigRange, element = "cell-address"): string {
  const [column, row, tab, endColumn, endRow, endTab] = range.GetVars();
  if (column === endColumn && row === endRow && tab === endTab)
    return `<table:${element} table:column="${column}" table:row="${row}" table:table="${tab}"/>`;
  return `<table:${element} table:start-column="${column}" table:start-row="${row}" table:start-table="${tab}" table:end-column="${endColumn}" table:end-row="${endRow}" table:end-table="${endTab}"/>`;
}
