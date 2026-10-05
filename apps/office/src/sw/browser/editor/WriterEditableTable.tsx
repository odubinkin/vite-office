/** @fileoverview Browser table frame over canonical SwTable rows and SwTextNode cell paragraphs. */

import type { SwTable } from "../../source/core/table/swtable";
import type { WriterParagraphProjection } from "../presentation/writer-view-projection";
import { WriterEditableParagraph } from "./WriterEditableParagraph";

/** Renders one visible, editable Writer table with row selection. */
/** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ export function WriterEditableTable({
  table,
  selectedRow,
  onSelectRow,
  firstRow = 0,
  lastRow = table.GetTabLines().length - 1,
  retainElement,
  paragraphs,
  activeParagraphId,
  retainParagraphElement,
}: Readonly<{
  table: SwTable;
  selectedRow?: number | undefined;
  onSelectRow: (row: number) => void;
  firstRow?: number;
  lastRow?: number;
  retainElement?: (element: HTMLTableElement | null) => void;
  paragraphs: ReadonlyMap<number, WriterParagraphProjection>;
  activeParagraphId?: string;
  retainParagraphElement?: (id: string, element: HTMLParagraphElement | null) => void;
}>): React.JSX.Element {
  const format = table.GetFormat();
  return (
    <div className="max-w-full" contentEditable={false} data-writer-table={table.GetName()}>
      <table
        aria-label={table.GetName()}
        className="table-fixed border-collapse"
        ref={retainElement}
        style={{
          width:
            (format.width ??
              table
                .GetColumnWidths()
                .reduce(
                  /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
                    sum,
                    width,
                  ) => sum + width,
                  0,
                )) / 15,
          marginLeft: (format.marginLeft ?? 0) / 15,
          marginTop: firstRow === 0 ? (format.marginTop ?? 0) / 15 : 0,
          marginBottom:
            lastRow === table.GetTabLines().length - 1 ? (format.marginBottom ?? 0) / 15 : 0,
        }}
      >
        <colgroup>
          {table.GetColumnWidths().map(
            /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
              width,
              index,
            ) => (
              <col key={index} style={{ width: width / 15 }} />
            ),
          )}
        </colgroup>
        <tbody>
          {table
            .GetTabLines()
            .slice(firstRow, lastRow + 1)
            .map(
              /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
                row,
                fragmentRowIndex,
              ) => (
                <tr
                  aria-selected={selectedRow === firstRow + fragmentRowIndex}
                  data-writer-table-row={firstRow + fragmentRowIndex}
                  key={firstRow + fragmentRowIndex}
                  onClick={
                    /** Selects row surfaces without intercepting text editing. @param event - Row click. @returns Nothing. */
                    (event) => {
                      if (
                        !(event.target instanceof Element) ||
                        event.target.closest("[data-writer-table-cell]") === null
                      )
                        onSelectRow(firstRow + fragmentRowIndex);
                    }
                  }
                  style={{ height: (row.GetFormat().minHeight ?? 0) / 15 }}
                >
                  {row.GetTabBoxes().map(
                    /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
                      cell,
                      cellIndex,
                    ) => {
                      const cellFormat = cell.GetFormat();
                      const rowIndex = firstRow + fragmentRowIndex;
                      const CellTag = rowIndex < (format.headerRows ?? 0) ? "th" : "td";
                      return (
                        <CellTag
                          data-writer-editor-selected={
                            selectedRow === rowIndex ? "true" : undefined
                          }
                          data-writer-border-guide={
                            cellFormat.border === undefined || cellFormat.border === "none"
                              ? "true"
                              : undefined
                          }
                          className={
                            selectedRow === rowIndex
                              ? "bg-indigo-50 outline outline-1 outline-indigo-300"
                              : ""
                          }
                          key={cellIndex}
                          style={{
                            border:
                              cellFormat.border === "none"
                                ? "1px dashed #cbd5e1"
                                : (cellFormat.border ?? "1px solid #94a3b8"),
                            padding: (cellFormat.padding ?? 100) / 15,
                            verticalAlign: cellFormat.verticalAlign ?? "top",
                          }}
                        >
                          {cellIndex === 0 ? (
                            <button
                              aria-label={`Select row ${rowIndex + 1} in ${table.GetName()}`}
                              className="mr-1 text-xs text-indigo-700"
                              onClick={
                                /** Handles the browser table interaction.  @returns Callback result. */ () =>
                                  onSelectRow(rowIndex)
                              }
                              type="button"
                            >
                              ⋮
                            </button>
                          ) : null}
                          {cell.GetParagraphs().map(
                            /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
                              paragraph,
                              paragraphIndex,
                            ) => {
                              const projection = paragraphs.get(paragraph.GetIndex());
                              if (projection === undefined)
                                throw new Error(
                                  "Writer table cell has no connected paragraph projection.",
                                );
                              return (
                                <WriterEditableParagraph
                                  cellPosition={{ rowIndex, cellIndex, paragraphIndex }}
                                  index={paragraphIndex}
                                  isActive={activeParagraphId === projection.id}
                                  key={projection.id}
                                  listMarker={projection.listMarker}
                                  paragraph={projection}
                                  retainElement={
                                    /** Registers visible paragraphs;measurement uses the same render without a live selection surface. @param id - Stable display ID. @param element - Paragraph mount or cleanup. @returns Nothing. */ (
                                      id,
                                      element,
                                    ) => retainParagraphElement?.(id, element)
                                  }
                                />
                              );
                            },
                          )}
                        </CellTag>
                      );
                    },
                  )}
                </tr>
              ),
            )}
        </tbody>
      </table>
    </div>
  );
}
