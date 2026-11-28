/** @fileoverview Native ODF export of Calc content change actions and their original metadata. */
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { DateTime as UnoDateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { Converter } from "../../../../sax/source/tools/converter";
import type { SecurityOptionsSnapshot } from "../../../../unotools/source/config/securityoptions";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { writeNumberFormatAttributes } from "../../../../xmloff/source/style/numehelp";
import { escapeXml, exportText } from "../../../../xmloff/source/text/txtparae";
import type { ScBigRange } from "../../../inc/bigrange";
import type { ScCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import {
  ScChangeActionState,
  type ScChangeAction,
  type ScChangeActionContent,
} from "../../core/tool/chgtrack";

/** Projects the actual native change track in action order. */
export class ScChangeTrackingExportHelper {
  private readonly userIds = new Map<string, number>();
  private readonly anonymize: boolean;

  /** Binds workbook and original security preferences. @param document - Native owner. @param options - Active security flags. */
  public constructor(
    private readonly document: ScDocument,
    options: SecurityOptionsSnapshot,
  ) {
    this.anonymize = options.removePersonalInfoOnSaving && !options.keepRedlineInfoOnSaving;
  }

  /** Collects and writes the original tracked change wrapper and loaded content actions. @returns ODF XML. */
  public CollectAndWriteChanges(): string {
    const track = this.document.GetChangeTrack();
    if (!track) return "";
    let changes = "";
    for (const action of track.entries()) changes += this.WriteContentChange(action);
    return changes
      ? `<table:tracked-changes>${changes}</table:tracked-changes>`
      : "<table:tracked-changes/>";
  }

  /** Writes the native cell content change, metadata, dependencies and previous cell. @param action - Native content action. @returns ODF element. */
  private WriteContentChange(action: ScChangeActionContent): string {
    const state = action.GetState();
    const acceptance =
      state === ScChangeActionState.SC_CAS_ACCEPTED
        ? ' table:acceptance-state="accepted"'
        : state === ScChangeActionState.SC_CAS_REJECTED
          ? ' table:acceptance-state="rejected"'
          : "";
    const rejecting = action.GetRejectingNumber();
    const rejection = rejecting ? ` table:rejecting-change-id="ct${rejecting}"` : "";
    const previous = action.GetPrevContent();
    const prior = previous ? ` table:id="ct${previous.GetActionNumber()}"` : "";
    const dependencies = action.GetDependents();
    const dependent = dependencies.length
      ? `<table:dependencies>${dependencies
          .map(
            /** Emits the original dependency ID. @param dependency - Dependent action. @returns Reference. */
            (dependency) => `<table:dependency table:id="ct${dependency.GetActionNumber()}"/>`,
          )
          .join("")}</table:dependencies>`
      : "";
    return `<table:cell-content-change table:id="ct${action.GetActionNumber()}"${acceptance}${rejection}>${writeBigRange(action.GetBigRange())}${this.WriteChangeInfo(action)}${dependent}<table:previous${prior}>${this.WriteCell(action.GetOldCell(), action.GetOldValue())}</table:previous></table:cell-content-change>`;
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

  /** Writes the original scalar cell representation. @param cell - Previous native snapshot. @param input - Original date/time input. @returns ODF tracked cell. */
  private WriteCell(cell: ScCellValue, input: string): string {
    const type = cell.getType();
    if (type === CellType.CELLTYPE_NONE) return "<table:change-track-table-cell/>";
    if (type === CellType.CELLTYPE_STRING) {
      const shared = cell.getSharedString();
      return `<table:change-track-table-cell office:value-type="string"><text:p>${exportText(shared ? text(shared.getString()) : "")}</text:p></table:change-track-table-cell>`;
    }
    if (type !== CellType.CELLTYPE_VALUE)
      throw new Error("ODS tracked previous non-scalar cells are not implemented");
    const format = this.document.GetFormatTable();
    if (input) {
      const lexical = unicode(input);
      const key: [number] = [0];
      const parsed: [number] = [0];
      try {
        if (format.IsNumberFormat(lexical, key, parsed)) {
          const kind = format.GetType(key[0]) & ~SvNumFormatType.DEFINED;
          if (kind === SvNumFormatType.DATE || kind === SvNumFormatType.TIME)
            return `<table:change-track-table-cell${writeNumberFormatAttributes(format, key[0], parsed[0], format.GetNullDate())}/>`;
        }
      } finally {
        lexical.dispose();
      }
    }
    return `<table:change-track-table-cell${writeNumberFormatAttributes(format, 0, cell.getDouble(), format.GetNullDate())}/>`;
  }
}

/** Writes the original compact or ranged address. @param range - Native bounds. @returns ODF cell address. */
function writeBigRange(range: ScBigRange): string {
  const [column, row, tab, endColumn, endRow, endTab] = range.GetVars();
  if (column === endColumn && row === endRow && tab === endTab)
    return `<table:cell-address table:column="${column}" table:row="${row}" table:table="${tab}"/>`;
  return `<table:cell-address table:start-column="${column}" table:start-row="${row}" table:start-table="${tab}" table:end-column="${endColumn}" table:end-row="${endRow}" table:end-table="${endTab}"/>`;
}
