/** @fileoverview Browser table frame over canonical SwTable rows and SwTextNode cell paragraphs. */
import { SwRowFrame } from "../../source/core/layout/tabfrm";

import type { SwTable } from "../../source/core/table/swtable";
import { SwTabFrame, type SwTablePrintArea } from "../../source/core/layout/tabfrm";
import type { WriterParagraphProjection } from "../presentation/writer-view-projection";
import { WriterEditableParagraph } from "./WriterEditableParagraph";

/** Renders one visible, editable Writer table with row selection. */
/** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ export function WriterEditableTable({
  table,
  printArea,
  availableWidth,
  selectedBoxes,
  firstRow = 0,
  lastRow = table.GetTabLines().length - 1,
  repeatedHeaderRows = 0,
  retainElement,
  paragraphs,
  activeParagraphId,
  retainParagraphElement,
}: Readonly<{
  table: SwTable;
  printArea?: SwTablePrintArea;
  availableWidth?: number;
  selectedBoxes?: readonly number[] | undefined;
  firstRow?: number;
  lastRow?: number;
  repeatedHeaderRows?: number;
  retainElement?: (element: HTMLTableElement | null) => void;
  paragraphs: ReadonlyMap<number, WriterParagraphProjection>;
  activeParagraphId?: string;
  retainParagraphElement?: (id: string, element: HTMLParagraphElement | null) => void;
}>): React.JSX.Element {
  const format = table.GetFormat();
  const columnWidth = table.GetColumnWidths().reduce(
    /** Adds native column reference widths. @param sum - Previous extent. @param width - Column width. @returns Total. */
    (sum, width) => sum + width,
    0,
  );
  const area =
    printArea ?? new SwTabFrame(table).Format(availableWidth ?? format.width ?? columnWidth);
  return (
    <div className="max-w-full" data-writer-table={table.GetName()}>
      <table
        aria-label={table.GetName()}
        className="table-fixed border-collapse"
        ref={retainElement}
        style={{
          tableLayout: "fixed",
          borderCollapse: "collapse",
          width: area.width / 15,
          marginLeft: area.left / 15,
          marginRight: area.right / 15,
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
              <col
                key={index}
                style={{
                  width: `${columnWidth === 0 ? 100 / table.GetColumnWidths().length : (width * 100) / columnWidth}%`,
                }}
              />
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
              const nativeRow = new SwRowFrame(row);
              const isRepeatedHeadline = frameRowIndex < repeatedHeaderRows;
              return (
                <tr
                  aria-selected={
                    !isRepeatedHeadline &&
                    row
                      .GetTabBoxes()
                      .every(
                        /** Projects actual native table ownership. @param box - Current owner. @returns Operation result. */ (
                          box,
                        ) => selectedBoxes?.includes(box.GetStartNode().GetIndex()) === true,
                      )
                  }
                  data-writer-table-row={rowIndex}
                  data-writer-repeated-headline={isRepeatedHeadline ? "true" : undefined}
                  key={rowIndex}
                  style={{ height: nativeRow.Format(0) / 15 }}
                >
                  {row.GetTabBoxes().map(
                    /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
                      cell,
                      cellIndex,
                    ) => {
                      const cellFormat = cell.GetFormat();
                      const content = cell.GetParagraphs().map(
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
                      );
                      const CellTag = rowIndex < (format.headerRows ?? 0) ? "th" : "td";
                      return (
                        <CellTag
                          data-writer-table-box={cell.GetStartNode().GetIndex()}
                          data-writer-editor-selected={
                            !isRepeatedHeadline &&
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
                            !isRepeatedHeadline &&
                            selectedBoxes?.includes(cell.GetStartNode().GetIndex()) === true
                              ? "relative bg-indigo-50 outline outline-1 outline-indigo-300"
                              : "relative"
                          }
                          key={cellIndex}
                          style={{
                            border: nativeRow.HasFixSize()
                              ? "none"
                              : cellFormat.border === "none"
                                ? "1px dashed #cbd5e1"
                                : (cellFormat.border ?? "1px solid #94a3b8"),
                            padding: nativeRow.HasFixSize() ? 0 : (cellFormat.padding ?? 100) / 15,
                            verticalAlign: cellFormat.verticalAlign ?? "top",
                          }}
                        >
                          {nativeRow.HasFixSize() ? (
                            <div
                              data-writer-fixed-row-content="true"
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: row.GetFrameSize().GetHeight() / 15,
                                boxSizing: "border-box",
                                overflow: "hidden",
                                border:
                                  cellFormat.border === "none"
                                    ? "1px dashed #cbd5e1"
                                    : (cellFormat.border ?? "1px solid #94a3b8"),
                                padding: (cellFormat.padding ?? 100) / 15,
                              }}
                            >
                              {content}
                            </div>
                          ) : (
                            content
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
