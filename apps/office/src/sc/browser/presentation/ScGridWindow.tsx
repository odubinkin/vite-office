/** @fileoverview Controlled browser rendering of ScGridWindow headers, visible cells and inline input; canonical cell/selection/input state stays with the view controller. */
import {
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type UIEvent,
} from "react";
import { ScAddress } from "../../inc/address";
import type { ScViewData } from "../../source/ui/inc/viewdata";
/** Logical visible rectangle and measured browser dimensions; this contains no cell data. */
export interface CalcGridViewport {
  readonly firstColumn: number;
  readonly firstRow: number;
  readonly columns: number;
  readonly rows: number;
  readonly columnWidth: number;
  readonly rowHeight: number;
  /** Physical browser scroll offset; kept distinct from the native logical first row. */
  readonly scrollTop: number;
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
  readonly editing: boolean;
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
  const { viewData, viewport, editing } = props;
  const grid = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null);
  const column = viewData.GetCurX(),
    row = viewData.GetCurY(),
    tab = viewData.GetTabNumber();
  const document = viewData.GetDocument();
  const columns = Array.from(
    { length: Math.min(viewport.columns, document.MaxCol() - viewport.firstColumn + 1) },
    /** Projects one visible column coordinate. @param unused - Unused entry. @param offset - Visible index. @returns Native column. */ (
      _,
      offset,
    ) => viewport.firstColumn + offset,
  );
  const rows = Array.from(
    { length: Math.min(viewport.rows, document.MaxRow() - viewport.firstRow + 1) },
    /** Projects one visible row coordinate. @param unused - Unused entry. @param offset - Visible index. @returns Native row. */ (
      _,
      offset,
    ) => viewport.firstRow + offset,
  );
  const activeVisible = columns.includes(column) && rows.includes(row);
  useLayoutEffect(
    /** Follows native table/inline input focus on editing transitions, without retaining edit content. @returns Nothing. */ () => {
      if (editing) input.current?.focus();
      else grid.current?.focus();
    },
    [editing, column, row],
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
          width: 48 + (document.MaxCol() + 1) * viewport.columnWidth,
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
                  left: 48 + col * viewport.columnWidth,
                  width: viewport.columnWidth,
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
                top: viewport.scrollTop + (r - viewport.firstRow + 1) * viewport.rowHeight,
                height: viewport.rowHeight,
              }}
            >
              <div
                role="rowheader"
                aria-colindex={1}
                aria-label={`Row ${r + 1}`}
                style={{ width: 48, height: viewport.rowHeight }}
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
                  const active = column === col && row === r;
                  const selected = active || viewData.GetMarkData().IsCellMarked(col, r);
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
                      className={`absolute top-0 min-w-0 overflow-hidden whitespace-nowrap border-b border-r border-slate-200 px-1 ${active ? "z-[2] outline outline-2 -outline-offset-2 outline-indigo-700" : ""} ${selected ? "bg-indigo-50" : "bg-white"}`}
                      style={{
                        textAlign: cell.alignment,
                        left: 48 + col * viewport.columnWidth,
                        width: viewport.columnWidth,
                        height: viewport.rowHeight,
                        lineHeight: `${viewport.rowHeight}px`,
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
                        cell.text
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
