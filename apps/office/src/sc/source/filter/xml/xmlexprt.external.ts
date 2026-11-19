/** @fileoverview Native ODF external cache table export with sparse repeated gaps. */
import { FormulaDoubleToken } from "../../../../formula/inc/token";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { doubleToString } from "../../../../sal/rtl/strtmpl.math";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import type { ScDocument } from "../../../inc/document";
import { getExternalFileUrl, type ScExternalCacheToken } from "../../ui/docshell/externalrefmgr";

/** Original hidden style for external cache tables. */
export const externalRefCacheStyle =
  '<style:style style:name="ta_extref" style:family="table"><style:table-properties table:display="false"/></style:style>';

/** Writes the native repeat attribute only for runs longer than one. @param axis - Repeated axis. @param count - Run length. @returns XML attribute. */
function repeat(axis: "rows" | "columns", count: number): string {
  return count > 1 ? ` table:number-${axis}-repeated="${count}"` : "";
}

/** Emits the original scalar cache cell value. @param value - Stored token. @returns ODF cell fragment. */
function writeCell(value: ScExternalCacheToken): string {
  if (value instanceof FormulaDoubleToken) {
    const number = doubleToString(value.GetDouble());
    return `<table:table-cell office:value-type="float" office:value="${number}"><text:p>${number}</text:p></table:table-cell>`;
  }
  return `<table:table-cell office:value-type="string"><text:p>${escapeXml(text(value.GetString().getString()))}</text:p></table:table-cell>`;
}

/** Writes hidden external cache tables without adding them to the worksheet list. @param document - Calc graph. @returns ODF table fragments. */
export function WriteExternalRefCaches(document: ScDocument): string {
  const xml: string[] = [];
  for (const file of document.GetExternalRefManager().getExternalFiles()) {
    const uri = getExternalFileUrl(file.name);
    const relative = file.relativeName ?? (uri === file.name ? undefined : file.name);
    const href = relative === undefined ? uri : "../" + relative;
    for (const { name, cache } of file.tables.values()) {
      const rows = cache.entries();
      let width = 1;
      for (const cells of rows.values())
        for (const col of cells.keys()) width = Math.max(width, col + 1);
      xml.push(
        `<table:table table:name="${escapeXml("'" + uri + "'#" + name)}" table:print="false" table:style-name="ta_extref">`,
        `<table:table-source xlink:type="simple" xlink:href="${escapeXml(href)}" table:table-name="${escapeXml(name)}" table:mode="copy-results-only"/>`,
        `<table:table-column${repeat("columns", width)}/>`,
      );
      let nextRow = 0;
      for (const [row, cells] of [...rows].sort(
        /** Orders numeric cache rows. @param left - Cached row. @param right - Cached row. @returns Comparison. */
        (left, right) => left[0] - right[0],
      )) {
        if (row > nextRow)
          xml.push(
            `<table:table-row${repeat("rows", row - nextRow)}><table:table-cell${repeat("columns", width)}/></table:table-row>`,
          );
        xml.push("<table:table-row>");
        let nextCol = 0;
        for (const [col, value] of [...cells].sort(
          /** Orders numeric cache columns. @param left - Cached cell. @param right - Cached cell. @returns Comparison. */
          (left, right) => left[0] - right[0],
        )) {
          if (col > nextCol) xml.push(`<table:table-cell${repeat("columns", col - nextCol)}/>`);
          xml.push(writeCell(value));
          nextCol = col + 1;
        }
        xml.push("</table:table-row>");
        nextRow = row + 1;
      }
      xml.push("</table:table>");
    }
  }
  return xml.join("");
}
