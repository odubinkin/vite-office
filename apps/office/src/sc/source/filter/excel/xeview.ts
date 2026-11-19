/** @fileoverview XLSX tab-view export of the represented per-sheet grid option. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";
import type { XclExpXmlStream } from "./xestream";

/** Writes the represented native sheet view for the first workbook view. @param stream - Active worksheet part. @param document - Workbook. @param tab - Actual sheet. @returns Nothing. */
export function SaveXmlTabViewSettings(
  stream: XclExpXmlStream,
  document: ScDocument,
  tab: number,
): void {
  const serializer = stream.GetCurrentStream();
  const options = document.GetViewOptions();
  serializer.startElement(token("sheetViews"));
  serializer.singleElement(
    token("sheetView"),
    token("showFormulas"),
    String(options.GetOption(ViewOption.FORMULAS)),
    token("showGridLines"),
    String(document.GetSheetShowGrid(tab)),
    token("showRowColHeaders"),
    String(options.GetOption(ViewOption.HEADER)),
    token("showZeros"),
    String(options.GetOption(ViewOption.NULLVALS)),
    token("workbookViewId"),
    "0",
  );
  serializer.endElement(token("sheetViews"));
}
