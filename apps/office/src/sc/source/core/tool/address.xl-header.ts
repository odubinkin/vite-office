/** @fileoverview Original Excel internal sheet header extraction shared by A1 and R1C1. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScRefFlags } from "../../../inc/address";
import type { ScAddressDocument, ScRange } from "./address";

const internalHeader = /^(?:'((?:[^']|'')+)'|([^'![\]:]+))!/u;

/** Separates a represented Excel internal-sheet qualifier and resolves its native tab. @param range - Actual address owner. @param source - Original spelling. @param document - Sheet name owner. @param flags - Native start flags. @returns Coordinate spelling or failed header. */
export function ParseExcelHeader(
  range: ScRange,
  source: string,
  document: ScAddressDocument,
  flags: [ScRefFlags],
): string | null {
  const input = source.split("\0", 1)[0] as string;
  if (!input.includes("!") && !input.startsWith("'") && !input.startsWith("[")) return input;
  const header = internalHeader.exec(input);
  if (!header) throw new Error("Excel external and sheet-span headers are not implemented");
  const sheet = (header[1] ?? header[2]) as string;
  if (sheet.includes("["))
    throw new Error("Excel external and sheet-span headers are not implemented");
  const name = unicode(sheet.replaceAll("''", "'"));
  const tab: [number] = [-1];
  try {
    if (!document.GetTable?.(name, tab)) {
      range.aStart.SetTab(-1);
      range.aEnd.SetTab(-1);
      return null;
    }
    range.aStart.SetTab(tab[0]);
    range.aEnd.SetTab(tab[0]);
    flags[0] |= ScRefFlags.TAB_3D | ScRefFlags.TAB_ABS;
    return input.slice(header[0].length);
  } finally {
    name.dispose();
  }
}
