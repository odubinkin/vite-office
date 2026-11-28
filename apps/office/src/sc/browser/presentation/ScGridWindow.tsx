/** @fileoverview Controlled browser rendering of ScGridWindow headers, visible cells and inline input; canonical cell/selection/input state stays with the view controller. */
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import type { SyntheticEvent } from "react";
import { useWindowTracking } from "../../../vcl/browser/use-window-tracking";
import {
  createCalcGridFrames,
  calcGridBorderStyle,
  calcGridPageBreaks,
  calcCellEdgeStyle,
  calcMergedBorderStyle,
} from "./calc-grid-borders";
import { ScHeaderResizeHandle, type ScHeaderSizing } from "./ScHeaderResizeHandle";
import { ScOutlineWindow } from "./ScOutlineWindow";
import type { ScOutlineControl } from "../../source/ui/docshell/olinefun";
import { ScCellDiagonalBorders } from "./ScCellDiagonalBorders";
import { ScCellDataBar } from "./ScCellDataBar";
import { ScCellIconSet } from "./ScCellIconSet";
import { handleConditionalFormat } from "../../source/core/data/fillinfo";
import { ScIndentItem, type ScMergeAttr, type ScMergeFlagAttr } from "../../inc/attrib";
import type { ScDocument } from "../../inc/document";
import type { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { SvxMarginItem } from "../../../svx/source/items/algitem";
import { SvxCellHorJustify } from "../../../editeng/inc/svxenum";
import { SvxContourItem } from "../../../editeng/inc/contouritem";
import { SpecialText } from "../../../vcl/browser/special-text";
import { SvxShadowedItem, SvxCharReliefItem } from "../../../editeng/source/items/textitem";
import type { SvxWordLineModeItem } from "../../../editeng/source/items/textitem";
import type { SvxShadowItem } from "../../../editeng/source/items/frmitems.shadow";
import type { SvxHorJustifyItem } from "../../../editeng/inc/justifyitem";
import type { ScTable } from "../../inc/table";
import {
  CALC_SPLIT_HANDLE_SIZE,
  calcGridInsets,
  CalcGridAxis,
  type CalcGridViewport,
  type CalcPaintBand,
} from "./calc-grid-axis";
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
import { SvxFrameDirection as D } from "../../../editeng/inc/frmdir";
import type { SvxFrameDirectionItem } from "../../../editeng/source/items/frmitems.direction";
import {
  ATTR_BORDER,
  ATTR_FONT_HEIGHT,
  ATTR_MERGE,
  ATTR_MERGE_FLAG,
  ATTR_WRITINGDIR,
} from "../../inc/scitems";
import type { SvxFontItem } from "../../../editeng/inc/fontitem";
import { ScCellText } from "./ScCellText";
import { getCellTextLayout } from "../../source/ui/view/output2";
import { calcCellTextLayoutStyle } from "./calc-cell-text-layout";
import type { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { COL_AUTO, COL_BLACK, COL_WHITE, type Color } from "../../../tools/inc/color";
import { browserColor } from "../../../vcl/browser/color";
import { ScAddress, ScRange } from "../../inc/address";
import type { ScSplitPos, ScViewData } from "../../source/ui/inc/viewdata";
export type { CalcGridViewport } from "./calc-grid-axis";
/** Read-only presentation of one canonical cell, formatted by the controller's display owner. */
export interface CalcCellPresentation {
  readonly text: string;
  readonly alignment: "left" | "right";
  readonly color?: Color | null;
}
/** Controller contracts corresponding to native grid painting and input routing. */
export interface ScGridWindowProps {
  readonly referenceMode?: boolean;
  readonly referenceRange?: ScRange | null;
  readonly onPointerEnd?: () => void;
  readonly onActivatePane?: (part: ScSplitPos) => void;
  readonly onReveal?: (position: ScAddress, kind: "cell" | "column" | "row") => void;
  readonly onDrag?: (position: ScAddress, kind?: "cell" | "column" | "row") => void;
  readonly headerSizing?: ScHeaderSizing;
  readonly idPrefix: string;
  readonly viewData: ScViewData;
  readonly onOutline?: (control: ScOutlineControl) => void;
  readonly viewport: CalcGridViewport;
  readonly inputMode: ScInputMode;
  readonly inputText: string;
  readonly preview?: string | undefined;
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
/** Projects one actual source cell's typography identically for paint and the independent edit view. @param pattern - Actual native cell attributes. @param conditional - Matching conditional style. @returns Read-only render projection. */
function cellTypography(pattern: ScPatternAttr, conditional?: SfxItemSet) {
  const weight = (pattern.GetItem(102, conditional) as SvxWeightItem).GetWeight();
  const posture = (pattern.GetItem(103, conditional) as SvxPostureItem).GetPosture();
  const outlined = (pattern.GetItem(107, conditional) as SvxContourItem).GetValue(),
    shadowed = (pattern.GetItem(108, conditional) as SvxShadowedItem).GetValue(),
    relief = (pattern.GetItem(124, conditional) as SvxCharReliefItem).GetValue(),
    special = outlined || shadowed || relief !== 0;
  const lineItem = pattern.GetItem(104, conditional) as SvxUnderlineItem;
  const underline = (pattern.GetItem(123, conditional) as SvxWordLineModeItem).GetValue()
      ? FontLineStyle.LINESTYLE_NONE
      : lineItem.GetLineStyle(),
    lineColor = lineItem.GetColor();
  const fontColor = new ComplexColor();
  ScPatternAttr.fillColor(
    fontColor,
    pattern.GetItemSet(),
    ScAutoFontColorMode.Display,
    conditional,
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
    fontFamily: (pattern.GetItem(100, conditional) as SvxFontItem).GetFamilyName(),
    fontWeight: [400, 100, 200, 300, 350, 400, 500, 600, 700, 800, 900][weight],
    fontStyle: ["normal", "oblique", "italic"][posture],
    textDecorationColor:
      lineColor.GetAlpha() === 255
        ? `rgb(${lineColor.GetRed()}, ${lineColor.GetGreen()}, ${lineColor.GetBlue()})`
        : "currentColor",
    textDecorationStyle: underline === FontLineStyle.LINESTYLE_DOUBLE ? "double" : "solid",
    textDecorationLine:
      special || underline === FontLineStyle.LINESTYLE_NONE ? "none" : "underline",
    fontSize: `${(pattern.GetItem(ATTR_FONT_HEIGHT, conditional) as SvxFontHeightItem).GetHeight() / 20}pt`,
    lineHeight: "normal",
  };
  return { style, outlined, shadowed, relief, underline, lineColor, fontColor };
}
/** Determines the amount of a cell clipped by a neighboring pane. @param band - Pane along the axis. @param start - Cell edge in body pixels. @param size - Cell extent. @returns Inset distances. */
function cellInsets(band: CalcPaintBand, start: number, size: number): readonly [number, number] {
  const near =
    band.clipStart || band.clipEnd !== undefined ? Math.max(0, band.clipStart - start) : 0;
  const far = band.clipEnd === undefined ? 0 : Math.max(0, start + size - band.clipEnd);
  return [near, far];
}

/** Formats a nonempty clipping rectangle. @param top - Top inset. @param right - Right inset. @param bottom - Bottom inset. @param left - Left inset. @returns Optional CSS clipping rectangle. */
function paneClip(top: number, right: number, bottom: number, left: number): string | undefined {
  return top || right || bottom || left
    ? `inset(${top}px ${right}px ${bottom}px ${left}px)`
    : undefined;
}

/** Resolves the original merge rectangle, including a hidden origin, from the document attributes. @param document - Actual Calc document. @param cell - Visible candidate. @param pattern - Actual candidate attributes. @returns Complete source range, if merged. */
function mergeRange(
  document: ScDocument,
  cell: ScAddress,
  pattern: ScPatternAttr,
): ScRange | undefined {
  const overlap = (pattern.GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr).IsOverlapped();
  const tab = cell.Tab();
  const [col, row] = overlap
    ? document.SkipOverlapped(cell.Col(), cell.Row(), tab)
    : [cell.Col(), cell.Row()];
  const anchor = overlap ? document.GetPattern(new ScAddress(col, row, tab)) : pattern;
  const merge = anchor?.GetItem(ATTR_MERGE) as ScMergeAttr | undefined;
  if (!merge?.IsMerged()) return undefined;
  return new ScRange(
    col,
    row,
    tab,
    col + merge.GetColMerge() - 1,
    row + merge.GetRowMerge() - 1,
    tab,
  );
}

/** Finds the first visible representative of the source span in this pane. @param band - Native paint band. @param first - Source range start. @param last - Source range end. @returns Visible coordinate. */
function firstVisible(band: CalcPaintBand, first: number, last: number): number | undefined {
  return band.cells.find(
    /** Checks the intersection with the span. @param index - Visible coordinate. @returns Whether the coordinate is in range. */
    (index) => index >= first && index <= last,
  );
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
  const xAxis = new CalcGridAxis(table, viewport, true, document.MaxCol());
  const yAxis = new CalcGridAxis(table, viewport, false, document.MaxRow());
  const headings = xAxis.bands.flatMap(
    /** Pairs column headers with their pane. @param band - Horizontal pane. @returns Headings. */
    (band) =>
      band.cells.map(
        /** Pairs one heading with its position owner. @param col - Column. @returns Heading. */
        (col) => ({ col, band }),
      ),
  );
  const paintRows = yAxis.bands.flatMap(
    /** Computes frame adjacency separately in each native pane. @param band - Vertical pane. @returns Painted rows. */
    (band) => {
      const cells = xAxis.bands.flatMap(
        /** Includes borders from the same pane as its column. @param x - Horizontal pane. @returns Cells. */
        (x) => {
          const frames = createCalcGridFrames(viewData, x.cells, band.cells);
          return x.cells.map(
            /** Associates real cells with the paint frame. @param col - Native column. @returns Cell column and frame. */
            (col) => ({ col, x, frames }),
          );
        },
      );
      return band.cells.map(
        /** Pairs a row with its pane borders. @param r - Native row. @returns Grid row metadata. */
        (r) => ({ r, band, cells }),
      );
    },
  );
  const showGrid = viewData.GetOptions().GetOption(ViewOption.GRID) && viewData.GetShowGrid();
  const headers = viewData.IsHeaderMode();
  const {
    left: headerWidth,
    top: headerHeight,
    headerWidth: rowHeader,
    headerHeight: columnHeader,
    rowGutter,
    columnGutter,
    rowOutline,
    columnOutline,
  } = calcGridInsets(viewData, viewport.rowHeight);
  const normal = !!(viewport.splitColumns || viewport.splitRows);
  const activePart = viewData.GetActivePart();
  /** Combines left/right and top/bottom view identities. @param x - Horizontal band. @param y - Vertical band. @returns Native pane. */
  function part(x: CalcPaintBand, y: CalcPaintBand): ScSplitPos {
    return ((xAxis.bands.length > 1 && !x.leading ? 1 : 0) | (!y.leading ? 2 : 0)) as ScSplitPos;
  }
  /** Produces distinct ARIA IDs when a normal split can show the same cell twice. @param col - Column. @param rowIndex - Row. @param pane - Pane. @param merged - Whether this ID covers a merged range. @returns Cell ID. */
  function idFor(col: number, rowIndex: number, pane: ScSplitPos, merged = false): string {
    return `${props.idPrefix}-${tab}-${col}-${rowIndex}${normal || (merged && xAxis.bands.length * yAxis.bands.length > 1) ? `-${pane}` : ""}`;
  }
  const cursor = new ScAddress(column, row, tab);
  const activeMerge = mergeRange(document, cursor, document.GetPattern(cursor) as ScPatternAttr);
  const startColumn = activeMerge?.aStart.Col() ?? column,
    startRow = activeMerge?.aStart.Row() ?? row,
    endColumn = activeMerge?.aEnd.Col() ?? column,
    endRow = activeMerge?.aEnd.Row() ?? row;
  const columnBand = xAxis.bands.find(
    /** Locates the cursor only in the active normal pane. @param band - Candidate. @returns Whether the cell is in this pane. */
    (band) =>
      firstVisible(band, startColumn, endColumn) !== undefined &&
      (!viewport.splitColumns || band.leading === !(activePart & 1)),
  );
  const rowBand = yAxis.bands.find(
    /** Locates the cursor only in the active normal pane. @param band - Candidate. @returns Whether the cell is in this pane. */
    (band) =>
      firstVisible(band, startRow, endRow) !== undefined &&
      (!viewport.splitRows || band.leading === !(activePart & 2)),
  );
  const activeId =
    columnBand && rowBand
      ? idFor(startColumn, startRow, part(columnBand, rowBand), !!activeMerge)
      : undefined;
  let editorStyle: CSSProperties | undefined;
  if (editing && columnBand && rowBand) {
    const x = xAxis.Position(columnBand, startColumn) + 2;
    const y = yAxis.Position(rowBand, startRow) + 2;
    const width = Math.max(0, xAxis.Extent(startColumn, endColumn) - 4);
    const height = Math.max(0, yAxis.Extent(startRow, endRow) - 4);
    const [left, right] = activeMerge
      ? xAxis.ClipSpan(columnBand, x, width)
      : cellInsets(columnBand, x, width);
    const [top, bottom] = activeMerge
      ? yAxis.ClipSpan(rowBand, y, height)
      : cellInsets(rowBand, y, height);
    editorStyle = {
      ...cellTypography(
        document.GetPattern(new ScAddress(startColumn, startRow, tab)) as ScPatternAttr,
      ).style,
      left: headerWidth + x,
      top: headerHeight + y,
      clipPath: paneClip(top, right, bottom, left),
      width,
      height,
    };
  }
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
    const current = currentViewport.current;
    const bounds = (grid.current as HTMLElement).getBoundingClientRect();
    return new ScAddress(
      new CalcGridAxis(table, current, true, document.MaxCol()).Hit(
        pointer.clientX - bounds.left - headerWidth,
      ),
      new CalcGridAxis(table, current, false, document.MaxRow()).Hit(
        pointer.clientY - bounds.top - headerHeight,
      ),
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
  /** Uses the shared Writer/VCL window tracking owner for actual cell selection and formula pointing. @param position - Initial cell. @param pane - Hit pane. @param event - Initial pointer. @returns Nothing. */
  function point(position: ScAddress, pane: ScSplitPos, event: PointerEvent<HTMLDivElement>): void {
    if (event.button !== 0 || event.altKey) return;
    if (!props.referenceMode) {
      props.onActivatePane?.(pane);
      grid.current?.focus();
    }
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
  /** Clips a column at the divider. @param band - Horizontal pane. @param index - Column. @returns CSS clipping rectangle. */
  function columnClip(band: CalcPaintBand, index: number): string | undefined {
    const [left, right] = cellInsets(
      band,
      xAxis.Position(band, index),
      NativeViewData.ToPixel(table.GetColWidth(index), 1 / 15),
    );
    return paneClip(0, right, 0, left);
  }
  /** Clips a row at the divider. @param band - Vertical pane. @param index - Row. @returns CSS clipping rectangle. */
  function rowClip(band: CalcPaintBand, index: number): string | undefined {
    const [top, bottom] = cellInsets(
      band,
      yAxis.Position(band, index),
      NativeViewData.ToPixel(table.GetRowHeight(index), 1 / 15),
    );
    return paneClip(top, 0, bottom, 0);
  }
  const formats = table.GetCondFormList();
  formats.startRendering();
  const content = (
    <div className="relative flex min-h-0 flex-1 overflow-hidden text-[13px] text-slate-900">
      <div
        ref={grid}
        role="grid"
        aria-label="Spreadsheet"
        aria-rowcount={document.MaxRow() + 1 + Number(headers)}
        aria-colcount={document.MaxCol() + 1 + Number(headers)}
        aria-activedescendant={activeId}
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
                height: columnHeader,
                top: columnGutter,
              }}
            >
              <div
                role="columnheader"
                aria-label="Select all cells"
                className="sticky left-0 z-[11] border-b border-r border-slate-300 bg-slate-50"
                style={{ left: rowGutter, width: rowHeader, height: columnHeader }}
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
              {headings.map(
                /** Renders the native column header in its own pane. @param heading - Column and band. @returns Heading. */
                ({ col, band }) => (
                  <div
                    key={`${col}:${band.leading}`}
                    role="columnheader"
                    aria-colindex={col + 1 + Number(headers)}
                    aria-label={`Column ${columnLabel(col)}`}
                    style={{
                      left: headerWidth + viewport.scrollLeft + xAxis.Position(band, col),
                      clipPath: columnClip(band, col),
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
          {paintRows.map(
            /** Renders a visible row with pane-specific cells and borders. @param entry - Row and paint bands. @returns Grid row. */
            ({ r, band, cells }) => (
              <div
                key={`${r}:${band.leading}`}
                role="row"
                aria-rowindex={r + 1 + Number(headers)}
                className="absolute left-0 w-full"
                style={{
                  top: viewport.scrollTop + headerHeight + yAxis.Position(band, r),
                  height: NativeViewData.ToPixel(table.GetRowHeight(r), 1 / 15),
                }}
              >
                {headers && (
                  <div
                    role="rowheader"
                    aria-colindex={1}
                    aria-label={`Row ${r + 1}`}
                    style={{
                      left: rowGutter,
                      clipPath: rowClip(band, r),
                      width: rowHeader,
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
                {cells.map(
                  /** Paints a cell using its native value and pane-specific borders. @param entry - Column and pane border data. @returns Cell. */
                  ({ col, x, frames }) => {
                    const visible = new ScAddress(col, r, tab);
                    const visiblePattern = document.GetPattern(visible) as ScPatternAttr;
                    const merge = mergeRange(document, visible, visiblePattern);
                    const position = merge?.aStart ?? visible;
                    const firstCol = position.Col(),
                      firstRow = position.Row(),
                      lastCol = merge?.aEnd.Col() ?? col,
                      lastRow = merge?.aEnd.Row() ?? r;
                    if (
                      merge &&
                      (firstVisible(x, firstCol, lastCol) !== col ||
                        firstVisible(band, firstRow, lastRow) !== r)
                    )
                      return null;
                    const cell = props.getCell(position);
                    const pattern = merge
                      ? (document.GetPattern(position) as ScPatternAttr)
                      : visiblePattern;
                    const conditionalInfo = handleConditionalFormat(document, position);
                    const conditional = conditionalInfo?.pConditionSet;
                    const dataBar = conditionalInfo?.pDataBar;
                    const iconSet = conditionalInfo?.pIconSet;
                    const hideValue =
                      dataBar?.mbShowValue === false || iconSet?.mbShowValue === false;
                    const background =
                      conditionalInfo?.mxColorScale ??
                      (pattern.GetItem(148, conditional) as SvxBrushItem).GetColor();
                    const {
                      style: fontStyle,
                      outlined,
                      shadowed,
                      relief,
                      underline,
                      lineColor,
                      fontColor,
                    } = cellTypography(pattern, conditional);
                    const color = cell.color ?? fontColor.getFinalColor();
                    const pane = part(x, band);
                    const cellId = idFor(firstCol, firstRow, pane, !!merge);
                    const active = cellId === activeId;
                    const marks = viewData.GetMarkData();
                    const selected =
                      (!(marks.IsMarked() || marks.IsMultiMarked()) && active) ||
                      (marks.IsCellMarked(firstCol, firstRow) &&
                        !(
                          marks.IsMarked() &&
                          marks.IsMarkNegative() &&
                          marks.GetMarkArea().Contains(position)
                        ));
                    const writing = (
                      pattern.GetItem(ATTR_WRITINGDIR, conditional) as SvxFrameDirectionItem
                    ).GetValue();
                    const textDirection =
                      writing === D.Horizontal_RL_TB
                        ? "rtl"
                        : writing === D.Horizontal_LR_TB
                          ? "ltr"
                          : undefined;
                    const left = xAxis.Position(x, firstCol),
                      top = yAxis.Position(band, firstRow),
                      width = xAxis.Extent(firstCol, lastCol),
                      height = yAxis.Extent(firstRow, lastRow);
                    const [clipLeft, clipRight] = merge
                      ? xAxis.ClipSpan(x, left, width)
                      : cellInsets(x, left, width);
                    const [clipTop, clipBottom] = merge
                      ? yAxis.ClipSpan(band, top, height)
                      : cellInsets(band, top, height);
                    const textLayout = getCellTextLayout(document, position, pattern, conditional);
                    const textAlign =
                      ([undefined, "left", "center", "right", "justify", "left"] as const)[
                        textLayout.horizontal
                      ] ?? cell.alignment;
                    const cellStyle: CSSProperties = {
                      ...fontStyle,
                      color: browserColor(color),
                      whiteSpace: textLayout.lineBreak ? "pre-wrap" : "nowrap",
                      ...(merge
                        ? calcMergedBorderStyle(
                            pattern.GetItem(ATTR_BORDER, conditional) as SvxBoxItem,
                            showGrid,
                          )
                        : calcGridBorderStyle(
                            frames,
                            col,
                            r,
                            col === x.cells.at(-1),
                            r === band.cells.at(-1),
                            showGrid,
                          )),
                      ...calcCellEdgeStyle(
                        pattern.GetItem(143, conditional) as SvxMarginItem,
                        pattern.GetItem(152, conditional) as SvxShadowItem,
                        (pattern.GetItem(129) as SvxHorJustifyItem).GetValue() ===
                          SvxCellHorJustify.Left
                          ? (pattern.GetItem(131) as ScIndentItem).GetValue()
                          : 0,
                        (pattern.GetItem(129) as SvxHorJustifyItem).GetValue() ===
                          SvxCellHorJustify.Right
                          ? (pattern.GetItem(131) as ScIndentItem).GetValue()
                          : 0,
                      ),
                      backgroundColor:
                        background.GetAlpha() === 0 ? undefined : browserColor(background),
                      textAlign,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: [
                        "safe flex-end",
                        "flex-start",
                        "center",
                        "flex-end",
                        "flex-start",
                      ][textLayout.vertical],
                      left: headerWidth + viewport.scrollLeft + left,
                      top: merge ? top - yAxis.Position(band, r) : undefined,
                      clipPath: paneClip(clipTop, clipRight, clipBottom, clipLeft),
                      width,
                      height,
                    };
                    return (
                      <div
                        key={cellId}
                        id={cellId}
                        data-calc-column={firstCol}
                        data-calc-row={firstRow}
                        data-calc-pane={pane}
                        role="gridcell"
                        aria-colindex={firstCol + 1 + Number(headers)}
                        aria-rowindex={merge ? firstRow + 1 + Number(headers) : undefined}
                        aria-colspan={merge ? lastCol - firstCol + 1 : undefined}
                        aria-rowspan={merge ? lastRow - firstRow + 1 : undefined}
                        aria-selected={selected}
                        aria-label={`${columnLabel(firstCol)}${firstRow + 1}`}
                        // Upstream exposes address and text separately. ARIA composes the address
                        // (self-reference) with the existing displayed text, without a second value owner.
                        aria-labelledby={editing && active ? cellId : `${cellId} ${cellId}-text`}
                        onPointerDown={
                          /** Focuses the grid and routes selection with button/modifiers intact. @param event - Platform pointer. @returns Nothing. */ (
                            event,
                          ) => {
                            point(position, pane, event);
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
                        {dataBar && <ScCellDataBar info={dataBar} width={width} height={height} />}
                        {iconSet && <ScCellIconSet info={iconSet} />}
                        <ScCellDiagonalBorders pattern={pattern} width={width} height={height} />
                        {props.referenceRange?.Contains(position) && (
                          <div
                            aria-hidden="true"
                            data-calc-reference="true"
                            className="pointer-events-none absolute inset-0 z-[3] bg-[#ef0fff]/10"
                            style={{
                              borderTop:
                                firstRow === props.referenceRange.aStart.Row()
                                  ? "2px solid #ef0fff"
                                  : undefined,
                              borderBottom:
                                lastRow === props.referenceRange.aEnd.Row()
                                  ? "2px solid #ef0fff"
                                  : undefined,
                              borderLeft:
                                firstCol === props.referenceRange.aStart.Col()
                                  ? "2px solid #ef0fff"
                                  : undefined,
                              borderRight:
                                lastCol === props.referenceRange.aEnd.Col()
                                  ? "2px solid #ef0fff"
                                  : undefined,
                            }}
                          />
                        )}
                        {editing && active ? null : hideValue ? (
                          <span id={`${cellId}-text`} className="sr-only">
                            {cell.text}
                          </span>
                        ) : (
                          <div
                            id={`${cellId}-text`}
                            className={
                              dataBar || iconSet ? "relative w-full shrink-0" : "w-full shrink-0"
                            }
                            dir={textDirection}
                            style={calcCellTextLayoutStyle(textLayout, textAlign)}
                          >
                            <SpecialText
                              enabled={outlined}
                              shadow={shadowed}
                              relief={relief}
                              color={color}
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
                              <ScCellText
                                layout={textLayout}
                                text={cell.text}
                                pattern={pattern}
                                conditional={conditional}
                              />
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
      {rowGutter > 0 && rowOutline && props.onOutline && (
        <ScOutlineWindow
          columns={false}
          table={table}
          tree={rowOutline}
          axis={yAxis}
          extent={rowGutter}
          crossInset={columnGutter}
          header={columnHeader}
          formatEntry={
            /** Formats the visible row number. @param index - Native row. @returns Label. */ (
              index,
            ) => String(index + 1)
          }
          activate={props.onOutline}
        />
      )}
      {columnGutter > 0 && columnOutline && props.onOutline && (
        <ScOutlineWindow
          columns
          table={table}
          tree={columnOutline}
          axis={xAxis}
          extent={columnGutter}
          crossInset={rowGutter}
          header={rowHeader}
          formatEntry={columnLabel}
          activate={props.onOutline}
        />
      )}
      {rowGutter > 0 && columnGutter > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-20 bg-slate-100"
          style={{ width: rowGutter, height: columnGutter }}
        />
      )}
      {viewData.GetOptions().GetOption(ViewOption.PAGEBREAKS) &&
        [false, true].flatMap(
          /** Paints native break rules on each visible axis and pane. @param columns - Axis. @returns Visible rules. */
          (columns) =>
            calcGridPageBreaks(table, columns ? xAxis : yAxis, columns).map(
              /** Paints a single dashed native break boundary. @param rule - Measured rule. @returns Break line. */
              ({ index, pixel, leading, manual }) => (
                <div
                  key={`${columns}:${leading}:${index}`}
                  aria-hidden="true"
                  data-calc-break={columns ? "column" : "row"}
                  data-calc-break-index={index}
                  data-calc-break-kind={manual ? "manual" : "computed"}
                  className={`pointer-events-none absolute z-[4] border-dashed ${columns ? "bottom-0 border-l" : "right-0 border-t"} ${manual ? "border-indigo-600" : "border-slate-500"}`}
                  style={{
                    left: headerWidth + (columns ? pixel : 0),
                    top: headerHeight + (columns ? 0 : pixel),
                  }}
                />
              ),
            ),
        )}
      {viewport.frozenColumns && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-[10] w-px bg-slate-500"
          style={{ left: headerWidth + viewport.frozenColumns.pixels - 1 }}
        />
      )}
      {viewport.frozenRows && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 z-[10] h-px bg-slate-500"
          style={{ top: headerHeight + viewport.frozenRows.pixels - 1 }}
        />
      )}
      {viewport.splitColumns && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-[10] bg-slate-400"
          style={{
            left: headerWidth + viewport.splitColumns.pixels,
            width: CALC_SPLIT_HANDLE_SIZE,
          }}
        />
      )}
      {viewport.splitRows && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 z-[10] bg-slate-400"
          style={{ top: headerHeight + viewport.splitRows.pixels, height: CALC_SPLIT_HANDLE_SIZE }}
        />
      )}
      {editing && editorStyle && props.preview && (
        <span
          role="tooltip"
          className="pointer-events-none absolute z-30 translate-y-full rounded border border-slate-300 bg-white px-2 py-1 shadow"
          style={{ left: editorStyle.left, top: editorStyle.top }}
        >
          {props.preview}
        </span>
      )}
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
            activeId
              ? "absolute z-[2] select-text border-0 bg-white px-[2px] text-left outline-none"
              : "sr-only"
          }
        />
      )}
    </div>
  );
  formats.endRendering();
  return content;
}
