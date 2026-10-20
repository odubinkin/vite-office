/** @fileoverview Controlled browser rendering of ScGridWindow headers, visible cells and inline input; canonical cell/selection/input state stays with the view controller. */
import { ScIndentItem } from "../../inc/attrib";
import { SvxMarginItem } from "../../../svx/source/items/algitem";
import { SvxCellHorJustify } from "../../../editeng/inc/svxenum";
import { visibleRows } from "./row-geometry";
import { SvxContourItem } from "../../../editeng/inc/contouritem";
import { OutlinedText } from "../../../vcl/browser/outlined-text";
import type { SvxHorJustifyItem, SvxVerJustifyItem } from "../../../editeng/inc/justifyitem";
import type { ScTable } from "../../inc/table";
import { columnPixels, visibleColumns } from "./column-geometry";
import { rowPixels } from "./row-geometry";
import { ScViewData as NativeViewData } from "../../source/ui/inc/viewdata";
import { ScPatternAttr } from "../../inc/patattr";
import { ScAutoFontColorMode } from "../../source/core/data/patattr";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import {
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type UIEvent,
} from "react";
import { ScInputMode } from "../../inc/global";
import {
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
} from "../../../editeng/source/items/textitem";
import { FontLineStyle } from "../../../tools/inc/fontenum";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import { ATTR_FONT_HEIGHT } from "../../inc/scitems";
import type { SvxFontItem } from "../../../editeng/inc/fontitem";
import { ScCellText } from "./ScCellText";
import type { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { COL_AUTO, COL_BLACK, COL_WHITE } from "../../../tools/inc/color";
import { browserColor } from "../../../vcl/browser/color";
import { ScAddress } from "../../inc/address";
import type { ScViewData } from "../../source/ui/inc/viewdata";
/** Logical visible rectangle and measured browser dimensions; this contains no cell data. */
export interface CalcGridViewport {
  readonly firstColumn: number;
  readonly firstRow: number;
  readonly columns: number;
  readonly rows: number;
  readonly scrollWidth: number;
  readonly scrollLeft: number;
  readonly columnOffset: number;
  /** Column-header height only; body rows use actual native sheet geometry. */
  readonly rowHeight: number;
  /** Physical browser scroll offset; kept distinct from the native logical first row. */
  readonly scrollTop: number;
  /** Native pixel displacement within the first visible row. */
  readonly rowOffset: number;
  /** Physical scroll-track extent supplied by the viewport owner; large logical sheets must not exceed browser CSS geometry limits. */
  readonly scrollHeight: number;
}
/** Read-only presentation of one canonical cell, formatted by the controller's display owner. */
export interface CalcCellPresentation {
  readonly text: string;
  readonly alignment: "left" | "right";
}
/** Controller contracts corresponding to native grid painting and input routing. */
export interface ScGridWindowProps {
  readonly idPrefix: string;
  readonly viewData: ScViewData;
  readonly viewport: CalcGridViewport;
  readonly inputMode: ScInputMode;
  readonly inputText: string;
  readonly getCell: (position: ScAddress) => CalcCellPresentation;
  readonly onSelect: (position: ScAddress, event: PointerEvent<HTMLDivElement>) => void;
  readonly onHeader: (
    kind: "all" | "column" | "row",
    index: number,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
  readonly onEdit: (position: ScAddress) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  readonly onScroll: (event: UIEvent<HTMLDivElement>) => void;
  readonly onInput: (value: string) => void;
  readonly onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}
/** Emits the native A1 column header alphabet without locale-dependent case or numeric coercion. @param column - Valid zero-based column. @returns Column label. */
function columnLabel(column: number): string {
  let label = "";
  for (let value = column + 1; value > 0; value = Math.floor((value - 1) / 26))
    label = String.fromCharCode(65 + ((value - 1) % 26)) + label;
  return label;
}
/** Paints a bounded window of actual view-owned cells and emits platform input intents. @param props - Read-only view and controller bindings. @returns Accessible Calc grid. */
export function ScGridWindow(props: ScGridWindowProps): React.JSX.Element {
  const { viewData, viewport, inputMode } = props;
  const editing =
    inputMode === ScInputMode.SC_INPUT_TYPE || inputMode === ScInputMode.SC_INPUT_TABLE;
  const grid = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null);
  const column = viewData.GetCurX(),
    row = viewData.GetCurY(),
    tab = viewData.GetTabNumber();
  const document = viewData.GetDocument();
  const table = document.FetchTable(tab) as ScTable;
  const columns = visibleColumns(
    table,
    viewport.firstColumn,
    Math.min(document.MaxCol(), viewport.firstColumn + viewport.columns - 1),
  );
  const rows = visibleRows(
    table,
    viewport.firstRow,
    Math.min(document.MaxRow(), viewport.firstRow + viewport.rows - 1),
  );
  const activeVisible = columns.includes(column) && rows.includes(row);
  useLayoutEffect(
    /** Follows native table/inline input focus on editing transitions, without retaining edit content. @returns Nothing. */ () => {
      if (editing) {
        const editor = input.current;
        editor?.focus();
        if (editor && inputMode === ScInputMode.SC_INPUT_TABLE)
          editor.setSelectionRange(editor.value.length, editor.value.length);
      } else if (inputMode === ScInputMode.SC_INPUT_NONE) grid.current?.focus();
    },
    [editing, inputMode, column, row],
  );
  return (
    <div
      ref={grid}
      role="grid"
      aria-label="Spreadsheet"
      aria-rowcount={document.MaxRow() + 2}
      aria-colcount={document.MaxCol() + 2}
      aria-activedescendant={
        activeVisible ? `${props.idPrefix}-${tab}-${column}-${row}` : undefined
      }
      tabIndex={0}
      onScroll={props.onScroll}
      onKeyDown={
        /** Leaves nested editor and header keys with their owners. @param event - Platform key. @returns Nothing. */ (
          event,
        ) => {
          if (event.target === event.currentTarget) props.onKeyDown(event);
        }
      }
      className="min-h-0 flex-1 overflow-auto bg-white text-[13px] text-slate-900 outline-none"
    >
      <div
        className="relative"
        style={{
          width: viewport.scrollWidth,
          height: viewport.scrollHeight,
        }}
      >
        <div
          role="row"
          aria-rowindex={1}
          className="sticky top-0 z-10 bg-slate-50"
          style={{
            height: viewport.rowHeight,
          }}
        >
          <div
            role="columnheader"
            aria-label="Select all cells"
            className="sticky left-0 z-[11] border-b border-r border-slate-300 bg-slate-50"
            style={{ width: 48, height: viewport.rowHeight }}
          >
            <button
              type="button"
              aria-label="Select all cells"
              onClick={
                /** Routes the corner-header selection intent. @param event - Platform click. @returns Nothing. */ (
                  event,
                ) => props.onHeader("all", 0, event)
              }
              className="block h-full w-full"
            >
              <span className="sr-only">Select all cells</span>
            </button>
          </div>
          {columns.map(
            /** Renders one canonical column heading. @param col - Column coordinate. @returns Heading. */ (
              col,
            ) => (
              <div
                key={col}
                role="columnheader"
                aria-colindex={col + 2}
                aria-label={`Column ${columnLabel(col)}`}
                style={{
                  left:
                    48 +
                    viewport.scrollLeft -
                    viewport.columnOffset +
                    columnPixels(table, viewport.firstColumn, col - 1),
                  width: NativeViewData.ToPixel(table.GetColWidth(col), 1 / 15),
                  height: viewport.rowHeight,
                }}
                className="absolute top-0 border-b border-r border-slate-300 bg-slate-50 text-center font-normal"
              >
                <button
                  type="button"
                  aria-label={`Column ${columnLabel(col)}`}
                  onClick={
                    /** Routes column selection with native modifiers intact. @param event - Platform click. @returns Nothing. */ (
                      event,
                    ) => props.onHeader("column", col, event)
                  }
                  className="block h-full w-full"
                >
                  {columnLabel(col)}
                </button>
              </div>
            ),
          )}
        </div>
        {rows.map(
          /** Renders only a visible native row. @param r - Row coordinate. @returns Grid row. */ (
            r,
          ) => (
            <div
              key={r}
              role="row"
              aria-rowindex={r + 2}
              className="absolute left-0 w-full"
              style={{
                top:
                  viewport.scrollTop +
                  viewport.rowHeight -
                  viewport.rowOffset +
                  rowPixels(table, viewport.firstRow, r - 1),
                height: NativeViewData.ToPixel(table.GetRowHeight(r), 1 / 15),
              }}
            >
              <div
                role="rowheader"
                aria-colindex={1}
                aria-label={`Row ${r + 1}`}
                style={{ width: 48, height: NativeViewData.ToPixel(table.GetRowHeight(r), 1 / 15) }}
                className="sticky left-0 z-[3] border-b border-r border-slate-300 bg-slate-50 text-center font-normal"
              >
                <button
                  type="button"
                  aria-label={`Row ${r + 1}`}
                  onClick={
                    /** Routes row selection. @param event - Platform click. @returns Nothing. */ (
                      event,
                    ) => props.onHeader("row", r, event)
                  }
                  className="block h-full w-full"
                >
                  {r + 1}
                </button>
              </div>
              {columns.map(
                /** Paints one cell from the display contract, never from an application array. @param col - Column. @returns Cell or inline editor. */ (
                  col,
                ) => {
                  const position = new ScAddress(col, r, tab),
                    cell = props.getCell(position);
                  const pattern = document.GetPattern(position) as ScPatternAttr;
                  const weight = (pattern.GetItem(102) as SvxWeightItem).GetWeight();
                  const posture = (pattern.GetItem(103) as SvxPostureItem).GetPosture();
                  const outlined = (pattern.GetItem(107) as SvxContourItem).GetValue();
                  const lineItem = pattern.GetItem(104) as SvxUnderlineItem;
                  const underline = lineItem.GetLineStyle(),
                    lineColor = lineItem.GetColor();
                  const active = column === col && row === r;
                  const selected = active || viewData.GetMarkData().IsCellMarked(col, r);
                  const fontColor = new ComplexColor();
                  ScPatternAttr.fillColor(
                    fontColor,
                    pattern.GetItemSet(),
                    ScAutoFontColorMode.Display,
                    undefined,
                    undefined,
                    COL_WHITE,
                    COL_BLACK,
                    {
                      isKitActive: false,
                      hasCurrentView: true,
                      currentCalcViewDocumentColor: undefined,
                      documentColor: COL_WHITE,
                      systemTextColor: COL_BLACK,
                      rawSystemTextColor: COL_AUTO,
                    },
                  );
                  return (
                    <div
                      key={col}
                      id={`${props.idPrefix}-${tab}-${col}-${r}`}
                      role="gridcell"
                      aria-colindex={col + 2}
                      aria-selected={selected}
                      aria-label={`${columnLabel(col)}${r + 1}`}
                      onPointerDown={
                        /** Focuses the grid and routes selection with button/modifiers intact. @param event - Platform pointer. @returns Nothing. */ (
                          event,
                        ) => {
                          if (event.target === input.current) return;
                          grid.current?.focus();
                          props.onSelect(position, event);
                        }
                      }
                      onDoubleClick={
                        /** Leaves text-editor word selection with the editor. @param event - Platform click. @returns Nothing. */ (
                          event,
                        ) => {
                          if (event.target !== input.current) props.onEdit(position);
                        }
                      }
                      className={`absolute top-0 min-w-0 overflow-hidden whitespace-nowrap border-b border-r border-slate-200 ${active ? "z-[2] outline outline-2 -outline-offset-2 outline-indigo-700" : ""} ${selected ? "bg-indigo-50" : "bg-white"}`}
                      style={{
                        paddingLeft: Math.trunc(
                          ((pattern.GetItem(143) as SvxMarginItem).GetLeftMargin() +
                            ((pattern.GetItem(129) as SvxHorJustifyItem).GetValue() ===
                            SvxCellHorJustify.Left
                              ? (pattern.GetItem(131) as ScIndentItem).GetValue()
                              : 0)) /
                            15,
                        ),
                        paddingRight: Math.trunc(
                          ((pattern.GetItem(143) as SvxMarginItem).GetRightMargin() +
                            ((pattern.GetItem(129) as SvxHorJustifyItem).GetValue() ===
                            SvxCellHorJustify.Right
                              ? (pattern.GetItem(131) as ScIndentItem).GetValue()
                              : 0)) /
                            15,
                        ),
                        color: browserColor(fontColor.getFinalColor()),
                        backgroundColor:
                          (pattern.GetItem(148) as SvxBrushItem).GetColor().GetAlpha() === 0
                            ? undefined
                            : browserColor((pattern.GetItem(148) as SvxBrushItem).GetColor()),
                        fontFamily: (pattern.GetItem(100) as SvxFontItem).GetFamilyName(),
                        textAlign:
                          ([undefined, "left", "center", "right", "justify", "left"] as const)[
                            (pattern.GetItem(129) as SvxHorJustifyItem).GetValue()
                          ] ?? cell.alignment,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: [
                          "safe flex-end",
                          "flex-start",
                          "center",
                          "flex-end",
                          "flex-start",
                        ][(pattern.GetItem(132) as SvxVerJustifyItem).GetValue()],
                        fontWeight: [400, 100, 200, 300, 350, 400, 500, 600, 700, 800, 900][weight],
                        fontStyle: ["normal", "oblique", "italic"][posture],
                        textDecorationColor:
                          lineColor.GetAlpha() === 255
                            ? `rgb(${lineColor.GetRed()}, ${lineColor.GetGreen()}, ${lineColor.GetBlue()})`
                            : "currentColor",
                        textDecorationStyle:
                          underline === FontLineStyle.LINESTYLE_DOUBLE ? "double" : "solid",
                        textDecorationLine:
                          outlined || underline === FontLineStyle.LINESTYLE_NONE
                            ? "none"
                            : "underline",
                        fontSize: `${((document.GetPattern(position) as ScPatternAttr).GetItem(ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight() / 20}pt`,
                        left:
                          48 +
                          viewport.scrollLeft -
                          viewport.columnOffset +
                          columnPixels(table, viewport.firstColumn, col - 1),
                        width: NativeViewData.ToPixel(table.GetColWidth(col), 1 / 15),
                        height: NativeViewData.ToPixel(table.GetRowHeight(r), 1 / 15),
                        lineHeight: "normal",
                      }}
                    >
                      {editing && active ? (
                        <input
                          ref={input}
                          aria-label={`Edit cell ${columnLabel(col)}${r + 1}`}
                          value={props.inputText}
                          onChange={
                            /** Forwards draft input to the input handler. @param event - DOM input. @returns Nothing. */ (
                              event,
                            ) => props.onInput(event.target.value)
                          }
                          onKeyDown={props.onInputKeyDown}
                          className="absolute inset-0 h-full w-full border-0 bg-white px-1 text-left outline-none"
                        />
                      ) : (
                        <div className="w-full shrink-0">
                          <OutlinedText
                            enabled={outlined}
                            paintStyle={{
                              textDecorationColor:
                                lineColor.GetAlpha() === 255
                                  ? `rgb(${lineColor.GetRed()}, ${lineColor.GetGreen()}, ${lineColor.GetBlue()})`
                                  : "currentColor",
                              textDecorationStyle:
                                underline === FontLineStyle.LINESTYLE_DOUBLE ? "double" : "solid",
                              textDecorationLine:
                                underline === FontLineStyle.LINESTYLE_NONE ? "none" : "underline",
                            }}
                          >
                            <ScCellText text={cell.text} pattern={pattern} />
                          </OutlinedText>
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
