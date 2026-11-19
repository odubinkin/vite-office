/** @fileoverview XLSX export of sheet view geometry and native pane selections. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";
import { ScRange } from "../../../inc/address";
import {
  getSheetCursor,
  getSheetPaneLayout,
  SheetPane,
  SheetSplitMode,
  type SheetPaneLayout,
} from "../../core/data/document.sheet-visibility";
import { XclXmlUtils, type XclExpXmlStream } from "./xestream";

const paneNames = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;

/** Writes the represented native sheet view for the first workbook view. @param stream - Active worksheet part. @param document - Workbook. @param tab - Actual sheet. @returns Nothing. */
export function SaveXmlTabViewSettings(
  stream: XclExpXmlStream,
  document: ScDocument,
  tab: number,
): void {
  const serializer = stream.GetCurrentStream();
  const options = document.GetViewOptions();
  const layout = getSheetPaneLayout(document, tab);
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
    ...(layout ? [token("topLeftCell"), cell(document, tab, layout.first)] : []),
  );
  const [column, row] = getSheetCursor(document, tab);
  const cursor = cell(document, tab, [column, row]);
  if (layout) savePanes(stream, document, tab, layout, cursor);
  else saveSelection(stream, SheetPane.TOPLEFT, cursor);
  serializer.endElement(token("sheetView"));
  serializer.endElement(token("sheetViews"));
}

/** Formats one native pane cell using the existing address exporter. @param document - Workbook. @param tab - Current worksheet. @param position - Column and row. @returns SpreadsheetML cell reference. */
function cell(document: ScDocument, tab: number, position: SheetPaneLayout["first"]): Uint8Array {
  return XclXmlUtils.ToOString(document, new ScRange(position[0], position[1], tab));
}

/** Writes the current cursor selection of one attached pane. @param stream - Worksheet serializer. @param pane - Excel pane. @param cursor - One valid cell. @returns Nothing. */
function saveSelection(stream: XclExpXmlStream, pane: SheetPane, cursor: Uint8Array): void {
  stream
    .GetCurrentStream()
    .singleElement(
      token("selection"),
      token("pane"),
      paneNames[pane],
      token("activeCell"),
      cursor,
      token("activeCellId"),
      "0",
      token("sqref"),
      cursor,
    );
}

/** Applies the Excel pane coordinate and selection contracts. @param stream - Worksheet serializer. @param document - Workbook. @param tab - Current sheet. @param layout - Detached native layout. @param cursor - Current cursor. @returns Nothing. */
function savePanes(
  stream: XclExpXmlStream,
  document: ScDocument,
  tab: number,
  layout: SheetPaneLayout,
  cursor: Uint8Array,
): void {
  const normal =
    layout.horizontalMode === SheetSplitMode.NORMAL ||
    layout.verticalMode === SheetSplitMode.NORMAL;
  const frozen =
    !normal &&
    (layout.horizontalMode === SheetSplitMode.FIX || layout.verticalMode === SheetSplitMode.FIX);
  const x =
    (frozen && layout.horizontalMode === SheetSplitMode.FIX
      ? layout.horizontalPosition - layout.first[0]
      : layout.horizontalMode === SheetSplitMode.NORMAL
        ? layout.horizontalPosition
        : 0) & 0xffff;
  const y =
    (frozen && layout.verticalMode === SheetSplitMode.FIX
      ? layout.verticalPosition - layout.first[1]
      : layout.verticalMode === SheetSplitMode.NORMAL
        ? layout.verticalPosition
        : 0) >>> 0;
  if (!x && !y) {
    saveSelection(stream, SheetPane.TOPLEFT, cursor);
    return;
  }
  let active = ((x && layout.activePane & 1 ? 1 : 0) |
    (y && layout.activePane & 2 ? 2 : 0)) as SheetPane;
  let second = layout.second;
  if (frozen) {
    active = (Number(x > 0) | (y > 0 ? 2 : 0)) as SheetPane;
    // Native Excel export compares the second origin with the relative split counts.
    second = [Math.max(x, second[0]), Math.max(y, second[1])];
  }
  stream
    .GetCurrentStream()
    .singleElement(
      token("pane"),
      token("xSplit"),
      String(x),
      token("ySplit"),
      String(y),
      token("topLeftCell"),
      cell(document, tab, second),
      token("activePane"),
      paneNames[active],
      token("state"),
      frozen ? "frozen" : "split",
    );
  for (const pane of [
    SheetPane.TOPLEFT,
    SheetPane.TOPRIGHT,
    SheetPane.BOTTOMLEFT,
    SheetPane.BOTTOMRIGHT,
  ]) {
    if ((pane & 1 && !x) || (pane & 2 && !y)) continue;
    const position =
      pane === active
        ? cursor
        : cell(document, tab, [
            pane & 1 ? second[0] : layout.first[0],
            pane & 2 ? second[1] : layout.first[1],
          ]);
    saveSelection(stream, pane, position);
  }
}
