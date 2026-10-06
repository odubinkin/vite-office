/** @fileoverview Browser table frame over canonical SwTable rows and SwTextNode cell paragraphs. */

import type { SwTable } from "../../source/core/table/swtable";
import type { WriterParagraphProjection } from "../presentation/writer-view-projection";
import { WriterEditableParagraph } from "./WriterEditableParagraph";

/** Renders one visible, editable Writer table with row selection. */
/** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ export function WriterEditableTable({
  table,
  selectedBoxes,
  onSelectRow,
  firstRow = 0,
  lastRow = table.GetTabLines().length - 1,
  repeatedHeaderRows = 0,
  retainElement,
  paragraphs,
  activeParagraphId,
  retainParagraphElement,
}: Readonly<{
  table: SwTable;
  selectedBoxes?: readonly number[] | undefined;
  onSelectRow: (row: number) => void;
  firstRow?: number;
  lastRow?: number;
  repeatedHeaderRows?: number;
  retainElement?: (element: HTMLTableElement | null) => void;
  paragraphs: ReadonlyMap<number, WriterParagraphProjection>;
  activeParagraphId?: string;
  retainParagraphElement?: (id: string, element: HTMLParagraphElement | null) => void;
}>): React.JSX.Element {
  const format = table.GetFormat();
  return (
    <div className="max-w-full" data-writer-table={table.GetName()}>
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
          {[
            ...Array.from(
              { length: repeatedHeaderRows },
              /** Addresses original rows in repeated headlines. @param _slot - Array slot. @param index - Original row index. @returns Index. */
              (_slot, index) => index,
            ),
            ...Array.from(
              { length: lastRow - firstRow + 1 },
              /** Addresses the source rows of this table fragment. @param _slot - Array slot. @param index - Fragment offset. @returns Original index. */
              (_slot, index) => firstRow + index,
            ),
          ].map(
            /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
              rowIndex,
              frameRowIndex,
            ) => {
              const row = table.GetTabLines()[rowIndex] as ReturnType<
                SwTable["GetTabLines"]
              >[number];
              const isRepeatedHeadline = frameRowIndex < repeatedHeaderRows;
              return (
                <tr
                  aria-selected={row
                    .GetTabBoxes()
                    .every(
                      /** Projects actual native table ownership. @param box - Current owner. @returns Operation result. */ (
                        box,
                      ) => selectedBoxes?.includes(box.GetStartNode().GetIndex()) === true,
                    )}
                  data-writer-table-row={rowIndex}
                  data-writer-repeated-headline={isRepeatedHeadline ? "true" : undefined}
                  key={rowIndex}
                  style={{ height: (row.GetFormat().minHeight ?? 0) / 15 }}
                >
                  {row.GetTabBoxes().map(
                    /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
                      cell,
                      cellIndex,
                    ) => {
                      const cellFormat = cell.GetFormat();
                      const CellTag = rowIndex < (format.headerRows ?? 0) ? "th" : "td";
                      return (
                        <CellTag
                          data-writer-table-box={cell.GetStartNode().GetIndex()}
                          data-writer-editor-selected={
                            selectedBoxes?.includes(cell.GetStartNode().GetIndex()) === true
                              ? "true"
                              : undefined
                          }
                          data-writer-border-guide={
                            cellFormat.border === undefined || cellFormat.border === "none"
                              ? "true"
                              : undefined
                          }
                          className={
                            selectedBoxes?.includes(cell.GetStartNode().GetIndex()) === true
                              ? "relative bg-indigo-50 outline outline-1 outline-indigo-300"
                              : "relative"
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
                          {cellIndex === 0 && !isRepeatedHeadline ? (
                            <button
                              aria-label={`Select row ${rowIndex + 1} in ${table.GetName()}`}
                              className="absolute -left-5 top-0 flex h-full w-5 cursor-e-resize items-center justify-center text-indigo-700 opacity-0 hover:opacity-100 focus:opacity-100"
                              contentEditable={false}
                              onMouseDown={
                                /** Keeps browser focus at the document while a native row gesture runs. @param event - Pointer down. @returns Nothing. */ (
                                  event,
                                ) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                }
                              }
                              onClick={
                                /** Selects the native row without bubbling a second row gesture. @param event - Browser click. @returns Nothing. */ (
                                  event,
                                ) => {
                                  event.stopPropagation();
                                  onSelectRow(rowIndex);
                                }
                              }
                              type="button"
                            >
                              →
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
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}
