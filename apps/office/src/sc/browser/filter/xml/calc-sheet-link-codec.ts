/** @fileoverview Copies the original native linked sheet fields across the Calc Worker boundary. */
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScLinkMode } from "../../../inc/global";
import type { ScTable } from "../../../inc/table";

/** Transfer values carried by their actual native sheet. */
export interface CalcSheetLinkRecord {
  readonly mode: ScLinkMode.NORMAL | ScLinkMode.VALUE;
  readonly url: string;
  readonly filter: string;
  readonly options: string;
  readonly sheet: string;
  readonly refreshDelay: number;
}

/** Copies a connected sheet source to the detached graph. @param sheet - Native sheet. @returns Link descriptor when connected. */
export function encodeSheetLink(sheet: ScTable): CalcSheetLinkRecord | undefined {
  const mode = sheet.GetLinkMode();
  if (mode === ScLinkMode.NONE) return undefined;
  return {
    mode,
    url: text(sheet.GetLinkDoc()),
    filter: text(sheet.GetLinkFlt()),
    options: text(sheet.GetLinkOpt()),
    sheet: text(sheet.GetLinkTab()),
    refreshDelay: sheet.GetLinkRefreshDelay(),
  };
}

/** Binds the original link fields to the reconstructed native sheet. @param sheet - Destination sheet. @param record - Detached source. @returns Nothing. */
export function decodeSheetLink(sheet: ScTable, record: CalcSheetLinkRecord): void {
  if (
    !record ||
    (record.mode !== ScLinkMode.NORMAL && record.mode !== ScLinkMode.VALUE) ||
    typeof record.url !== "string" ||
    !record.url ||
    typeof record.filter !== "string" ||
    typeof record.options !== "string" ||
    typeof record.sheet !== "string" ||
    !Number.isInteger(record.refreshDelay) ||
    record.refreshDelay < 0 ||
    record.refreshDelay > 0x7fffffff
  )
    throw new Error("Calc worker sheet link is invalid.");
  const file = unicode(record.url);
  const filter = unicode(record.filter);
  const options = unicode(record.options);
  const tab = unicode(record.sheet);
  try {
    sheet.SetLink(record.mode, file, filter, options, tab, record.refreshDelay);
  } finally {
    file.dispose();
    filter.dispose();
    options.dispose();
    tab.dispose();
  }
}
