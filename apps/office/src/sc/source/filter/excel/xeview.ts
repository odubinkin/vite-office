/** @fileoverview XLSX export of the represented tab view and cursor. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";
import { ScRange } from "../../../inc/address";
import { getSheetCursor } from "../../core/data/document.sheet-visibility";
import { XclXmlUtils, type XclExpXmlStream } from "./xestream";

/** Writes the represented native sheet view for the first workbook view. @param stream - Active worksheet part. @param document - Workbook. @param tab - Actual sheet. @returns Nothing. */
export function SaveXmlTabViewSettings(
  stream: XclExpXmlStream,
  document: ScDocument,
  tab: number,
): void {
  const serializer = stream.GetCurrentStream();
  const options = document.GetViewOptions();
  serializer.startElement(token("sheetViews"));
  serializer.startElement(
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
  const [column, row] = getSheetCursor(document, tab);
  const cursor = XclXmlUtils.ToOString(document, new ScRange(column, row, tab));
  serializer.singleElement(
    token("selection"),
    token("pane"),
    "topLeft",
    token("activeCell"),
    cursor,
    token("activeCellId"),
    "0",
    token("sqref"),
    cursor,
  );
  serializer.endElement(token("sheetView"));
  serializer.endElement(token("sheetViews"));
}
