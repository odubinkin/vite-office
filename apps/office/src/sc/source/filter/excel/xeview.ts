/** @fileoverview XLSX tab-view export of the represented per-sheet grid option. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { ScDocument } from "../../../inc/document";
import type { XclExpXmlStream } from "./xestream";

/** Writes the represented native sheet view for the first workbook view. @param stream - Active worksheet part. @param document - Workbook. @param tab - Actual sheet. @returns Nothing. */
export function SaveXmlTabViewSettings(
  stream: XclExpXmlStream,
  document: ScDocument,
  tab: number,
): void {
  const serializer = stream.GetCurrentStream();
  serializer.startElement(token("sheetViews"));
  serializer.singleElement(
    token("sheetView"),
    token("showGridLines"),
    String(document.GetSheetShowGrid(tab)),
    token("workbookViewId"),
    "0",
  );
  serializer.endElement(token("sheetViews"));
}
