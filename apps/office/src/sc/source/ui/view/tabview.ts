/** @fileoverview ScTabView freeze and split operations from tabview.cxx. */
import {
  SheetPane,
  SheetSplitMode,
  type SheetPaneLayout,
} from "../../core/data/document.sheet-visibility";
import { ScHSplitPos, ScVSplitPos, type ScViewData } from "./viewdata";

/** Native split method or command. Cursor applies to both axes. */
export type ScSplitMethod = "cursor" | "row" | "column";
/** Consumed sheet pane command identities. */
export type ScPaneCommand = ScSplitMethod | "split";

/** Measured grid geometry used by the native screen-position and hit-test operations. */
export interface ScSplitAxisDevice {
  readonly size: number;
  readonly header: number;
  readonly offset: (first: number, index: number) => number;
  readonly cellAt: (absolutePixel: number) => number;
}

/** The leading grid window's device geometry, expressed in CSS pixels. */
export interface ScSplitDevice {
  readonly column: ScSplitAxisDevice;
  readonly row: ScSplitAxisDevice;
}

/** Current mode, persisted boundary and scroll origins for one axis. */
interface SplitAxis {
  mode: SheetSplitMode;
  position: number;
  first: number;
  second: number;
}

const SPLIT_MARGIN = 30;
const TWIPS_PER_PIXEL = 15;

/** Reads the two source axis records, preserving scroll origins in an unsplit view. @param view - Actual Calc view. @returns Axis records. */
function readAxes(view: ScViewData): { column: SplitAxis; row: SplitAxis } {
  const layout = view.GetPaneLayout();
  return {
    column: {
      mode: layout?.horizontalMode ?? SheetSplitMode.NONE,
      position: layout?.horizontalPosition ?? 0,
      first: view.GetPosX(ScHSplitPos.SC_SPLIT_LEFT),
      second: view.GetPosX(ScHSplitPos.SC_SPLIT_RIGHT),
    },
    row: {
      mode: layout?.verticalMode ?? SheetSplitMode.NONE,
      position: layout?.verticalPosition ?? 0,
      first: view.GetPosY(
        layout?.verticalMode ? ScVSplitPos.SC_SPLIT_TOP : ScVSplitPos.SC_SPLIT_BOTTOM,
      ),
      second: view.GetPosY(ScVSplitPos.SC_SPLIT_BOTTOM),
    },
  };
}

/** Projects the cursor and current origins onto the available native panes. @param view - Calc view. @param axes - Resulting axis records. @param rebalance - Whether axis activation follows the new cursor boundary. @returns New layout. */
function layoutFor(
  view: ScViewData,
  { column, row }: ReturnType<typeof readAxes>,
  rebalance: boolean,
): SheetPaneLayout {
  const oldActive = view.GetActivePart();
  const right =
    column.mode === SheetSplitMode.NONE
      ? 0
      : column.mode === SheetSplitMode.FIX
        ? Number(view.GetCurX() >= column.position)
        : rebalance
          ? Number(view.GetCurX() >= column.second)
          : oldActive & 1;
  const bottom =
    row.mode === SheetSplitMode.NONE
      ? 2
      : row.mode === SheetSplitMode.FIX
        ? view.GetCurY() >= row.position
          ? 2
          : 0
        : rebalance
          ? view.GetCurY() >= row.second
            ? 2
            : 0
          : oldActive & 2;
  return {
    horizontalMode: column.mode,
    verticalMode: row.mode,
    horizontalPosition: column.position,
    verticalPosition: row.position,
    activePane: (right | bottom) as SheetPane,
    first: [column.first, row.first],
    second: [column.second, row.second],
  };
}

/** Finds the cell boundary nearest an existing movable splitter. @param axis - Existing split. @param device - Actual pixel geometry. @returns Cell index. */
function splitBoundary(axis: SplitAxis, device: ScSplitAxisDevice): number {
  if (axis.mode === SheetSplitMode.FIX) return axis.position;
  const pixel = Math.max(0, Math.trunc(axis.position / TWIPS_PER_PIXEL) - device.header);
  const cell = device.cellAt(device.offset(0, axis.first) + pixel);
  const midpoint = (device.offset(axis.first, cell) + device.offset(axis.first, cell + 1)) / 2;
  return pixel >= midpoint ? cell + 1 : cell;
}

/** Applies one native fixed axis, including the scrolled-away first row or column case. @param axis - Source axis. @param device - Physical axis. @param boundary - Requested cell boundary. @param first - Explicit first-row or first-column request. @param vertical - Row axis rather than column axis. @returns Nothing. */
function freezeAxis(
  axis: SplitAxis,
  device: ScSplitAxisDevice,
  boundary: number,
  first: boolean,
  vertical: boolean,
): void {
  const previousMode = axis.mode;
  if (vertical ? device.offset(axis.first, boundary) > 0 : boundary > axis.first) {
    axis.second = previousMode === SheetSplitMode.NONE ? boundary : Math.max(axis.second, boundary);
  } else if (first && boundary === 1) {
    if (!vertical) axis.second = axis.first;
    axis.first = 0;
  } else {
    axis.mode = SheetSplitMode.NONE;
    axis.position = 0;
    if (vertical) axis.first = axis.second;
    return;
  }
  axis.mode = SheetSplitMode.FIX;
  axis.position = boundary;
}

/** Original FreezeSplitters: freeze at a given index or cursor, or make fixed splitters movable. @param view - Calc view. @param device - Grid geometry. @param freeze - Desired splitter type. @param method - Applied axes. @param index - Explicit boundary index. @returns Nothing. */
export function FreezeSplitters(
  view: ScViewData,
  device: ScSplitDevice,
  freeze: boolean,
  method: ScSplitMethod = "cursor",
  index = 1,
): void {
  const axes = readAxes(view);
  if (!freeze) {
    for (const name of ["column", "row"] as const) {
      const axis = axes[name];
      if (axis.mode !== SheetSplitMode.FIX) continue;
      const geometry = device[name];
      axis.mode = SheetSplitMode.NORMAL;
      axis.position =
        (geometry.header + geometry.offset(axis.first, axis.position)) * TWIPS_PER_PIXEL;
    }
    view.SetPaneLayout(layoutFor(view, axes, false));
    return;
  }
  const hadSplit =
    axes.row.mode !== SheetSplitMode.NONE || axes.column.mode !== SheetSplitMode.NONE;
  if (method !== "row") {
    const column = axes.column;
    const position =
      method === "column"
        ? index
        : hadSplit
          ? splitBoundary(column, device.column)
          : view.GetCurX();
    freezeAxis(
      column,
      device.column,
      Math.min(position, view.GetDocument().MaxCol()),
      method === "column",
      false,
    );
  }
  if (method !== "column") {
    const row = axes.row;
    const position =
      method === "row" ? index : hadSplit ? splitBoundary(row, device.row) : view.GetCurY();
    freezeAxis(
      row,
      device.row,
      Math.min(position, view.GetDocument().MaxRow()),
      method === "row",
      true,
    );
  }
  view.SetPaneLayout(layoutFor(view, axes, false));
}

/** Original RemoveSplit returns the lower window to the top origin and the left window's horizontal origin. @param view - Calc view. @returns Nothing. */
export function RemoveSplit(view: ScViewData): void {
  const axes = readAxes(view);
  axes.column.mode = SheetSplitMode.NONE;
  axes.column.position = 0;
  axes.row.mode = SheetSplitMode.NONE;
  axes.row.position = 0;
  axes.row.second = axes.row.first;
  view.SetPaneLayout(layoutFor(view, axes, false));
}

/** Creates normal splits at the cursor if the splitter falls inside the frame margin. @param view - Calc view. @param device - Actual grid geometry. @returns Nothing. */
export function SplitAtCursor(view: ScViewData, device: ScSplitDevice): void {
  const axes = readAxes(view);
  for (const name of ["column", "row"] as const) {
    const axis = axes[name],
      geometry = device[name];
    const cursor = name === "column" ? view.GetCurX() : view.GetCurY();
    const position = geometry.header + geometry.offset(axis.first, cursor);
    const minimum = Math.max(SPLIT_MARGIN, geometry.header + 1);
    if (cursor === 0 || position < minimum || position > geometry.size - SPLIT_MARGIN) continue;
    axis.mode = SheetSplitMode.NORMAL;
    axis.position = position * TWIPS_PER_PIXEL;
    axis.second = cursor;
  }
  view.SetPaneLayout(layoutFor(view, axes, true));
}
