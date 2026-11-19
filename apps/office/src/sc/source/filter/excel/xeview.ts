/** @fileoverview XLSX export of sheet view geometry and native pane selections. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";
import { MAXCOL, MAXROW, ScAddress, ScRange, ValidTab } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import type { ScExtTabSettings } from "../../ui/view/scextopt";
import {
  getSheetCursor,
  getSheetPaneLayout,
  SheetPane,
  SheetSplitMode,
  type SheetPaneLayout,
} from "../../core/data/document.sheet-visibility";
import { XclXmlUtils, type XclExpXmlStream } from "./xestream";

const paneNames = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;

/** Writes the represented native sheet view for the first workbook view. @param stream - Active worksheet part. @param document - Workbook. @param tab - Actual sheet. @param selected - Export sheet membership. @param view - Attached selection snapshot. @returns Nothing. */
export function SaveXmlTabViewSettings(
  stream: XclExpXmlStream,
  document: ScDocument,
  tab: number,
  selected: boolean,
  view?: ScExtTabSettings,
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
    token("tabSelected"),
    String(selected),
    token("workbookViewId"),
    "0",
    ...(layout ? [token("topLeftCell"), cell(document, tab, layout.first)] : []),
  );
  const [column, row] = getSheetCursor(document, tab);
  const cursor = new ScAddress(Math.min(column, MAXCOL), Math.min(row, MAXROW), 0);
  if (layout) savePanes(stream, document, tab, layout, cursor, view?.maSelection);
  else saveSelection(stream, document, SheetPane.TOPLEFT, cursor, view?.maSelection);
  serializer.endElement(token("sheetView"));
  serializer.endElement(token("sheetViews"));
}

/** Formats one native pane cell using the existing address exporter. @param document - Workbook. @param tab - Current worksheet. @param position - Column and row. @returns SpreadsheetML cell reference. */
function cell(document: ScDocument, tab: number, position: SheetPaneLayout["first"]): Uint8Array {
  return XclXmlUtils.ToOString(document, new ScRange(position[0], position[1], tab));
}

/** Converts the source ordered marks to Excel's two-dimensional range domain. @param marks - Live selection snapshot. @returns Converted range list. */
function convertSelection(marks?: ScRangeList): ScRangeList {
  const result = new ScRangeList();
  if (!marks) return result;
  for (const { aStart, aEnd } of marks) {
    if (
      aStart.Col() < 0 ||
      aStart.Col() > MAXCOL ||
      aStart.Row() < 0 ||
      aStart.Row() > MAXROW ||
      !ValidTab(aStart.Tab())
    )
      continue;
    result.push_back(
      new ScRange(
        aStart.Col(),
        aStart.Row(),
        0,
        Math.min(MAXCOL, aEnd.Col()),
        Math.min(MAXROW, aEnd.Row()),
        0,
      ),
    );
  }
  return result;
}

/** Writes one Excel pane selection and its original cursor index. @param stream - Worksheet serializer. @param document - Workbook. @param pane - Excel pane. @param cursor - Valid Excel cursor. @param marks - Active pane's captured marks. @returns Nothing. */
function saveSelection(
  stream: XclExpXmlStream,
  document: ScDocument,
  pane: SheetPane,
  cursor: ScAddress,
  marks?: ScRangeList,
): void {
  const ranges = convertSelection(marks);
  let cursorIndex = 0;
  for (const range of ranges) {
    if (range.Contains(cursor)) break;
    ++cursorIndex;
  }
  const activeCell = new ScRange(cursor);
  if (cursorIndex === ranges.size()) ranges.push_back(activeCell);
  stream
    .GetCurrentStream()
    .singleElement(
      token("selection"),
      token("pane"),
      paneNames[pane],
      token("activeCell"),
      XclXmlUtils.ToOString(document, activeCell),
      token("activeCellId"),
      String(cursorIndex & 0xffff),
      token("sqref"),
      XclXmlUtils.ToOString(document, ranges),
    );
}

/** Applies the Excel pane coordinate and selection contracts. @param stream - Worksheet serializer. @param document - Workbook. @param tab - Current sheet. @param layout - Detached native layout. @param cursor - Current cursor. @param marks - Active pane marks. @returns Nothing. */
function savePanes(
  stream: XclExpXmlStream,
  document: ScDocument,
  tab: number,
  layout: SheetPaneLayout,
  cursor: ScAddress,
  marks?: ScRangeList,
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
    saveSelection(stream, document, SheetPane.TOPLEFT, cursor, marks);
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
        : new ScAddress(
            pane & 1 ? second[0] : layout.first[0],
            pane & 2 ? second[1] : layout.first[1],
            0,
          );
    saveSelection(stream, document, pane, position, pane === active ? marks : undefined);
  }
}
