/** @fileoverview Controlled browser rendering of ScGridWindow headers, visible cells and inline input; canonical cell/selection/input state stays with the view controller. */
import type { SyntheticEvent } from "react";
import { useWindowTracking } from "../../../vcl/browser/use-window-tracking";
import { columnAtPixel } from "./column-geometry";
import { rowAtPixel } from "./row-geometry";
import { createCalcGridFrames, calcGridBorderStyle } from "./calc-grid-borders";
import { ScHeaderResizeHandle, type ScHeaderSizing } from "./ScHeaderResizeHandle";
import { ScCellDiagonalBorders } from "./ScCellDiagonalBorders";
import { ScIndentItem, ScLineBreakCell } from "../../inc/attrib";
import { SvxMarginItem } from "../../../svx/source/items/algitem";
import { SvxCellHorJustify } from "../../../editeng/inc/svxenum";
import { visibleRows } from "./row-geometry";
import { SvxContourItem } from "../../../editeng/inc/contouritem";
import { SpecialText } from "../../../vcl/browser/special-text";
import { SvxShadowedItem, SvxCharReliefItem } from "../../../editeng/source/items/textitem";
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
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type UIEvent,
} from "react";
import { ViewOption } from "../../inc/viewopti";
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
import { ScAddress, type ScRange } from "../../inc/address";
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
  readonly referenceMode?: boolean;
  readonly referenceRange?: ScRange | null;
  readonly onPointerEnd?: () => void;
  readonly onReveal?: (position: ScAddress, kind: "cell" | "column" | "row") => void;
  readonly onDrag?: (position: ScAddress, kind?: "cell" | "column" | "row") => void;
  readonly headerSizing?: ScHeaderSizing;
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
  readonly onInput: (value: string, selection: readonly [number, number]) => void;
  readonly onInputPointerDown?: () => void;
  readonly onInputCommand?: (event: SyntheticEvent<HTMLInputElement>) => void;
  readonly onInputSelection?: (start: number, end: number, text: string) => void;
  readonly onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}
/** Emits the native A1 column header alphabet without locale-dependent case or numeric coercion. @param column - Valid zero-based column. @returns Column label. */
function columnLabel(column: number): string {
  let label = "";
  for (let value = column + 1; value > 0; value = Math.floor((value - 1) / 26))
    label = String.fromCharCode(65 + ((value - 1) % 26)) + label;
  return label;
}
/** Projects one actual source cell's typography identically for paint and the independent edit view. @param pattern - Actual native cell attributes. @returns Read-only render projection. */
function cellTypography(pattern: ScPatternAttr) {
  const weight = (pattern.GetItem(102) as SvxWeightItem).GetWeight();
  const posture = (pattern.GetItem(103) as SvxPostureItem).GetPosture();
  const outlined = (pattern.GetItem(107) as SvxContourItem).GetValue(),
    shadowed = (pattern.GetItem(108) as SvxShadowedItem).GetValue(),
    relief = (pattern.GetItem(124) as SvxCharReliefItem).GetValue(),
    special = outlined || shadowed || relief !== 0;
  const lineItem = pattern.GetItem(104) as SvxUnderlineItem;
  const underline = lineItem.GetLineStyle(),
    lineColor = lineItem.GetColor();
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
  const style: CSSProperties = {
    color: browserColor(fontColor.getFinalColor()),
    fontFamily: (pattern.GetItem(100) as SvxFontItem).GetFamilyName(),
    fontWeight: [400, 100, 200, 300, 350, 400, 500, 600, 700, 800, 900][weight],
    fontStyle: ["normal", "oblique", "italic"][posture],
    textDecorationColor:
      lineColor.GetAlpha() === 255
        ? `rgb(${lineColor.GetRed()}, ${lineColor.GetGreen()}, ${lineColor.GetBlue()})`
        : "currentColor",
    textDecorationStyle: underline === FontLineStyle.LINESTYLE_DOUBLE ? "double" : "solid",
    textDecorationLine:
      special || underline === FontLineStyle.LINESTYLE_NONE ? "none" : "underline",
    fontSize: `${(pattern.GetItem(ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight() / 20}pt`,
    lineHeight: "normal",
  };
  return { style, outlined, shadowed, relief, underline, lineColor, fontColor };
}
/** Paints a bounded window of actual view-owned cells and emits platform input intents. @param props - Read-only view and controller bindings. @returns Accessible Calc grid. */
export function ScGridWindow(props: ScGridWindowProps): React.JSX.Element {
  const { viewData, viewport, inputMode } = props;
  const tracking = useWindowTracking(true, viewData);
  const currentViewport = useRef(viewport);
  useLayoutEffect(
    /** Borrows current measured native viewport during window capture. @returns Nothing. */ () => {
      currentViewport.current = viewport;
    },
    [viewport],
  );
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
  const showGrid = viewData.GetOptions().GetOption(ViewOption.GRID) && viewData.GetShowGrid();
  const headers = viewData.IsHeaderMode(),
    headerWidth = headers ? 48 : 0,
    headerHeight = headers ? viewport.rowHeight : 0;
  const frames = createCalcGridFrames(viewData, columns, rows);
  const activeVisible = columns.includes(column) && rows.includes(row);
  const editorStyle: CSSProperties | undefined =
    editing && activeVisible
      ? {
          ...cellTypography(document.GetPattern(new ScAddress(column, row, tab)) as ScPatternAttr)
            .style,
          left:
            headerWidth -
            viewport.columnOffset +
            columnPixels(table, viewport.firstColumn, column - 1) +
            2,
          top: headerHeight - viewport.rowOffset + rowPixels(table, viewport.firstRow, row - 1) + 2,
          width: Math.max(0, NativeViewData.ToPixel(table.GetColWidth(column), 1 / 15) - 4),
          height: Math.max(0, NativeViewData.ToPixel(table.GetRowHeight(row), 1 / 15) - 4),
        }
      : undefined;
  useLayoutEffect(
    /** Follows native table/inline input focus on editing transitions, without retaining edit content. @returns Nothing. */ () => {
      if (editing) {
        const editor = input.current;
        editor?.focus({ preventScroll: true });
        if (editor && inputMode === ScInputMode.SC_INPUT_TABLE)
          editor.setSelectionRange(editor.value.length, editor.value.length);
      } else if (inputMode === ScInputMode.SC_INPUT_NONE) grid.current?.focus();
    },
    [editing, inputMode, column, row],
  );
  /** Maps the actual browser pointer through native visible row/column geometry. @param pointer - Window pointer. @returns Native cell. */
  function pointerCell(
    pointer: Pick<globalThis.PointerEvent, "clientX" | "clientY" | "target">,
  ): ScAddress {
    const target = pointer.target;
    if (target instanceof Element) {
      const cell = target.closest<HTMLElement>("[data-calc-column][data-calc-row]");
      if (cell)
        return new ScAddress(Number(cell.dataset.calcColumn), Number(cell.dataset.calcRow), tab);
    }
    const viewport = currentViewport.current;
    const bounds = (grid.current as HTMLElement).getBoundingClientRect(),
      x =
        pointer.clientX -
        bounds.left -
        headerWidth +
        columnPixels(table, 0, viewport.firstColumn - 1) +
        viewport.columnOffset,
      y =
        pointer.clientY -
        bounds.top -
        headerHeight +
        rowPixels(table, 0, viewport.firstRow - 1) +
        viewport.rowOffset;
    return new ScAddress(
      columnAtPixel(table, x, document.MaxCol()),
      rowAtPixel(table, y, document.MaxRow()),
      tab,
    );
  }
  /** Captures one cell/header gesture and repeats out-of-client motion at the native selection-engine maximum interval. @param event - Actual left-button press. @param kind - Hit-tested surface. @param start - Native selection admission. @returns Nothing. */
  function track(
    event: PointerEvent<HTMLElement>,
    kind: "cell" | "column" | "row",
    start: () => void,
  ): void {
    let timer: ReturnType<typeof setTimeout> | undefined;
    /** Releases only this gesture's repeat timer. @returns Nothing. */
    function stopRepeat(): void {
      clearTimeout(timer);
      timer = undefined;
    }
    /** Maps real client geometry before revealing the endpoint,then repeats only while the pointer is outside the client. @param pointer - Current pointer coordinates. @returns Nothing. */
    function move(pointer: Pick<globalThis.PointerEvent, "clientX" | "clientY" | "target">): void {
      stopRepeat();
      const position = pointerCell(pointer);
      props.onDrag?.(position, kind);
      props.onReveal?.(position, kind);
      const client = grid.current as HTMLDivElement,
        bounds = client.getBoundingClientRect();
      const outside =
        client.clientHeight > 0 &&
        client.clientWidth > 0 &&
        ((kind !== "row" &&
          (pointer.clientX <= bounds.left + headerWidth ||
            pointer.clientX >= bounds.left + client.clientWidth)) ||
          (kind !== "column" &&
            (pointer.clientY <= bounds.top + headerHeight ||
              pointer.clientY >= bounds.top + client.clientHeight)));
      if (outside)
        timer = setTimeout(
          /** Repeats actual pointer hit testing after viewport movement. @returns Nothing. */ () =>
            move({ clientX: pointer.clientX, clientY: pointer.clientY, target: null }),
          300,
        );
    }
    tracking.StartTracking(event, {
      onStart: start,
      onMove: move,
      /** Releases capture/repeat on mouseup,cancel,blur and unmount. @param cancelled - Capture cancellation. @param pointer - Final accepted pointer. @returns Nothing. */ onEnd:
        (cancelled, pointer) => {
          stopRepeat();
          if (
            !cancelled &&
            pointer &&
            (pointer.clientX !== event.clientX || pointer.clientY !== event.clientY)
          ) {
            const position = pointerCell(pointer);
            props.onDrag?.(position, kind);
            props.onReveal?.(position, kind);
          }
          props.onPointerEnd?.();
        },
    });
  }
  /** Uses the shared Writer/VCL window tracking owner for actual cell selection and formula pointing. @param position - Initial cell. @param event - Initial pointer. @returns Nothing. */
  function point(position: ScAddress, event: PointerEvent<HTMLDivElement>): void {
    if (event.button !== 0 || event.altKey) return;
    if (!props.referenceMode) grid.current?.focus();
    track(
      event,
      "cell",
      /** Admits the actual native cell gesture without committing a formula. @returns Nothing. */ () =>
        props.onSelect(position, event),
    );
  }
  /** Tracks whole-axis references and selections through the same pointer lifetime. @param kind - Header axis. @param index - Header entry. @param event - Header press. @returns Nothing. */
  function pointHeader(
    kind: "column" | "row",
    index: number,
    event: PointerEvent<HTMLButtonElement>,
  ): void {
    if (event.altKey) return;
    track(
      event,
      kind,
      /** Admits the actual native header gesture with source modifiers. @returns Nothing. */ () =>
        props.onHeader(kind, index, event),
    );
  }
  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden text-[13px] text-slate-900">
      <div
        ref={grid}
        role="grid"
        aria-label="Spreadsheet"
        aria-rowcount={document.MaxRow() + 1 + Number(headers)}
        aria-colcount={document.MaxCol() + 1 + Number(headers)}
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
        className="min-h-0 flex-1 select-none overflow-auto bg-white text-[13px] text-slate-900 outline-none"
      >
        <div
          className="relative"
          style={{
            width: viewport.scrollWidth,
            height: viewport.scrollHeight,
          }}
        >
          {headers && (
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
                    aria-colindex={col + 1 + Number(headers)}
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
                      onPointerDown={
                        /** Starts native whole-column reference tracking. @param event - Header press. @returns Nothing. */ (
                          event,
                        ) => pointHeader("column", col, event)
                      }
                      onClick={
                        /** Routes column selection with native modifiers intact. @param event - Platform click. @returns Nothing. */ (
                          event,
                        ) => {
                          if (event.detail === 0) props.onHeader("column", col, event);
                        }
                      }
                      className="block h-full w-full"
                    >
                      {columnLabel(col)}
                    </button>
                    {props.headerSizing && (
                      <ScHeaderResizeHandle
                        owner={viewData}
                        width={true}
                        index={col}
                        label={`column ${columnLabel(col)}`}
                        disabled={inputMode !== ScInputMode.SC_INPUT_NONE}
                        sizing={props.headerSizing}
                      />
                    )}
                  </div>
                ),
              )}
            </div>
          )}
          {rows.map(
            /** Renders only a visible native row. @param r - Row coordinate. @returns Grid row. */ (
              r,
            ) => (
              <div
                key={r}
                role="row"
                aria-rowindex={r + 1 + Number(headers)}
                className="absolute left-0 w-full"
                style={{
                  top:
                    viewport.scrollTop +
                    headerHeight -
                    viewport.rowOffset +
                    rowPixels(table, viewport.firstRow, r - 1),
                  height: NativeViewData.ToPixel(table.GetRowHeight(r), 1 / 15),
                }}
              >
                {headers && (
                  <div
                    role="rowheader"
                    aria-colindex={1}
                    aria-label={`Row ${r + 1}`}
                    style={{
                      width: 48,
                      height: NativeViewData.ToPixel(table.GetRowHeight(r), 1 / 15),
                    }}
                    className="sticky left-0 z-[3] border-b border-r border-slate-300 bg-slate-50 text-center font-normal"
                  >
                    <button
                      type="button"
                      aria-label={`Row ${r + 1}`}
                      onPointerDown={
                        /** Starts native whole-row reference tracking. @param event - Header press. @returns Nothing. */ (
                          event,
                        ) => pointHeader("row", r, event)
                      }
                      onClick={
                        /** Routes row selection. @param event - Platform click. @returns Nothing. */ (
                          event,
                        ) => {
                          if (event.detail === 0) props.onHeader("row", r, event);
                        }
                      }
                      className="block h-full w-full"
                    >
                      {r + 1}
                    </button>
                    {props.headerSizing && (
                      <ScHeaderResizeHandle
                        owner={viewData}
                        width={false}
                        index={r}
                        label={`row ${r + 1}`}
                        disabled={inputMode !== ScInputMode.SC_INPUT_NONE}
                        sizing={props.headerSizing}
                      />
                    )}
                  </div>
                )}
                {columns.map(
                  /** Paints one cell from the display contract, never from an application array. @param col - Column. @returns Cell or inline editor. */ (
                    col,
                  ) => {
                    const position = new ScAddress(col, r, tab),
                      cell = props.getCell(position);
                    const pattern = document.GetPattern(position) as ScPatternAttr;
                    const {
                      style: fontStyle,
                      outlined,
                      shadowed,
                      relief,
                      underline,
                      lineColor,
                      fontColor,
                    } = cellTypography(pattern);
                    const active = column === col && row === r;
                    const marks = viewData.GetMarkData();
                    const selected =
                      (!(marks.IsMarked() || marks.IsMultiMarked()) && active) ||
                      (marks.IsCellMarked(col, r) &&
                        !(
                          marks.IsMarked() &&
                          marks.IsMarkNegative() &&
                          marks.GetMarkArea().Contains(position)
                        ));
                    const cellStyle: CSSProperties = {
                      ...fontStyle,
                      whiteSpace: (pattern.GetItem(139) as ScLineBreakCell).GetValue()
                        ? "pre-wrap"
                        : "nowrap",
                      overflowWrap: "anywhere",
                      ...calcGridBorderStyle(
                        frames,
                        col,
                        r,
                        col === columns[columns.length - 1],
                        r === rows[rows.length - 1],
                        showGrid,
                      ),
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
                      backgroundColor:
                        (pattern.GetItem(148) as SvxBrushItem).GetColor().GetAlpha() === 0
                          ? undefined
                          : browserColor((pattern.GetItem(148) as SvxBrushItem).GetColor()),
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
                      left:
                        headerWidth +
                        viewport.scrollLeft -
                        viewport.columnOffset +
                        columnPixels(table, viewport.firstColumn, col - 1),
                      width: NativeViewData.ToPixel(table.GetColWidth(col), 1 / 15),
                      height: NativeViewData.ToPixel(table.GetRowHeight(r), 1 / 15),
                    };
                    return (
                      <div
                        key={col}
                        id={`${props.idPrefix}-${tab}-${col}-${r}`}
                        data-calc-column={col}
                        data-calc-row={r}
                        role="gridcell"
                        aria-colindex={col + 1 + Number(headers)}
                        aria-selected={selected}
                        aria-label={`${columnLabel(col)}${r + 1}`}
                        onPointerDown={
                          /** Focuses the grid and routes selection with button/modifiers intact. @param event - Platform pointer. @returns Nothing. */ (
                            event,
                          ) => {
                            point(position, event);
                          }
                        }
                        onDoubleClick={
                          /** Starts cell editing;the independent editor owns its own word selection. @returns Nothing. */ () => {
                            props.onEdit(position);
                          }
                        }
                        className={`absolute top-0 min-w-0 overflow-hidden whitespace-nowrap border-b border-r border-slate-200 ${active ? "z-[2] outline outline-2 -outline-offset-2 outline-indigo-700" : ""} ${selected ? "bg-indigo-50" : "bg-white"}`}
                        style={cellStyle}
                      >
                        <ScCellDiagonalBorders
                          pattern={pattern}
                          width={NativeViewData.ToPixel(table.GetColWidth(col), 1 / 15)}
                          height={NativeViewData.ToPixel(table.GetRowHeight(r), 1 / 15)}
                        />
                        {props.referenceRange?.Contains(position) && (
                          <div
                            aria-hidden="true"
                            data-calc-reference="true"
                            className="pointer-events-none absolute inset-0 z-[3] bg-[#ef0fff]/10"
                            style={{
                              borderTop:
                                r === props.referenceRange.aStart.Row()
                                  ? "2px solid #ef0fff"
                                  : undefined,
                              borderBottom:
                                r === props.referenceRange.aEnd.Row()
                                  ? "2px solid #ef0fff"
                                  : undefined,
                              borderLeft:
                                col === props.referenceRange.aStart.Col()
                                  ? "2px solid #ef0fff"
                                  : undefined,
                              borderRight:
                                col === props.referenceRange.aEnd.Col()
                                  ? "2px solid #ef0fff"
                                  : undefined,
                            }}
                          />
                        )}
                        {editing && active ? null : (
                          <div className="w-full shrink-0">
                            <SpecialText
                              enabled={outlined}
                              shadow={shadowed}
                              relief={relief}
                              color={fontColor.getFinalColor()}
                              lineColor={lineColor}
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
                            </SpecialText>
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
      {editing && (
        <input
          ref={input}
          aria-label={`Edit cell ${columnLabel(column)}${row + 1}`}
          value={props.inputText}
          onChange={
            /** Forwards draft input to the input handler. @param event - DOM input. @returns Nothing. */ (
              event,
            ) =>
              props.onInput(event.target.value, [
                event.target.selectionStart as number,
                event.target.selectionEnd as number,
              ])
          }
          onPointerDown={props.onInputPointerDown}
          onCompositionStart={props.onInputCommand}
          onPaste={props.onInputCommand}
          onSelect={
            /** Projects actual UTF16 edit selection to the input owner. @param event - Editor selection. @returns Nothing. */
            (event) =>
              props.onInputSelection?.(
                event.currentTarget.selectionStart as number,
                event.currentTarget.selectionEnd as number,
                event.currentTarget.value,
              )
          }
          onKeyDown={props.onInputKeyDown}
          style={editorStyle}
          className={
            activeVisible
              ? "absolute z-[2] select-text border-0 bg-white px-[2px] text-left outline-none"
              : "sr-only"
          }
        />
      )}
    </div>
  );
}
