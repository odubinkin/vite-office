/** @fileoverview Browser table frame over canonical SwTable rows and SwTextNode cell paragraphs. */
import { SwXMLTableLines } from "../../source/filter/xml/xmltble";

import { VertOrientation } from "../../../offapi/com/sun/star/text/VertOrientation";

import { SwRowFrame } from "../../source/core/layout/tabfrm";

import type { SwTable } from "../../source/core/table/swtable";
import { SwTabFrame, type SwTablePrintArea } from "../../source/core/layout/tabfrm";
import type { WriterParagraphProjection } from "../presentation/writer-view-projection";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
import type { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import type { SvxBorderLine } from "../../../editeng/source/items/borderline";
import { Style } from "../../../svx/source/dialog/framelink";
import { SwTabFramePainter } from "../../source/core/layout/paintfrm";

/** Projects one native line to the browser paint device. @param line - Owned native line. @param fixedGuide - Paint a guide inside an isolated fixed-row wrapper. @returns CSS paint value. */
function browserBorderLine(line: SvxBorderLine | Style | undefined, fixedGuide: boolean): string {
  if (line === undefined || (line instanceof Style ? line.GetWidth() === 0 : line.isEmpty()))
    return fixedGuide ? "1px dashed #cbd5e1" : "none";
  const style = line instanceof Style ? line.Type() : line.GetBorderLineStyle();
  const cssStyle =
    style === 1
      ? "dotted"
      : [2, 14, 16, 17].includes(style)
        ? "dashed"
        : (style >= 3 && style <= 9) || style === 15
          ? "double"
          : style === 10
            ? "ridge"
            : style === 11
              ? "groove"
              : style === 12
                ? "outset"
                : style === 13
                  ? "inset"
                  : "solid";
  const width = line instanceof Style ? line.GetWidth() : line.GetScaledWidth();
  const color = line instanceof Style ? line.GetColorPrim() : line.GetColor();
  return `${width / 20}pt ${cssStyle} #${(color & 0xffffff).toString(16).padStart(6, "0")}`;
}
/** Projects the four independent native edges and distances directly. @param item - Actual box item. @param fixedGuide - Use isolated fixed-row guides. @returns Browser geometry. */
function browserCellBoxStyle(item: SvxBoxItem, fixedGuide: boolean): React.CSSProperties {
  return {
    borderTop: browserBorderLine(item.GetTop(), fixedGuide),
    borderBottom: browserBorderLine(item.GetBottom(), fixedGuide),
    borderLeft: browserBorderLine(item.GetLeft(), fixedGuide),
    borderRight: browserBorderLine(item.GetRight(), fixedGuide),
    paddingTop: item.GetDistance(0) / 15,
    paddingBottom: item.GetDistance(1) / 15,
    paddingLeft: item.GetDistance(2) / 15,
    paddingRight: item.GetDistance(3) / 15,
  };
}

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
  const resolved = new Map<string, Style>();
  if (format.borderModel === "collapsing")
    new SwTabFramePainter(table).PaintLines(
      /** Projects resolved native line ownership onto the existing flat cell paint device. @param line - Native interval. @param horizontal - Native family. @returns Nothing. */
      (line, horizontal) => {
        resolved.set(`${horizontal}:${line.mnKey}:${line.mnStartPos}`, line.maAttribute);
      },
    );
  const grid = new SwXMLTableLines(table);
  const columnWidth = grid.GetColumnWidths().reduce(
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
        className="table-fixed"
        ref={retainElement}
        style={{
          tableLayout: "fixed",
          borderCollapse: format.borderModel === "collapsing" ? "collapse" : "separate",
          borderSpacing: 0,
          width: area.width / 15,
          marginLeft: area.left / 15,
          marginRight: area.right / 15,
          marginTop: firstRow === 0 ? (format.marginTop ?? 0) / 15 : 0,
          marginBottom:
            lastRow === table.GetTabLines().length - 1 ? (format.marginBottom ?? 0) / 15 : 0,
        }}
      >
        <colgroup>
          {grid.GetColumnWidths().map(
            /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
              width,
              index,
            ) => (
              <col
                key={index}
                style={{
                  width: `${columnWidth === 0 ? 100 / grid.GetColumnWidths().length : (width * 100) / columnWidth}%`,
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
                      const boxItem = cell.GetBox(),
                        boxStyle = browserCellBoxStyle(boxItem, nativeRow.HasFixSize());
                      if (format.borderModel === "collapsing") {
                        boxStyle.borderTop = browserBorderLine(
                          resolved.get(`true:${rowIndex}:${cellIndex}`),
                          nativeRow.HasFixSize(),
                        );
                        boxStyle.borderBottom = browserBorderLine(
                          resolved.get(`true:${rowIndex + 1}:${cellIndex}`),
                          nativeRow.HasFixSize(),
                        );
                        boxStyle.borderLeft = browserBorderLine(
                          resolved.get(`false:${cellIndex}:${rowIndex}`),
                          nativeRow.HasFixSize(),
                        );
                        boxStyle.borderRight = browserBorderLine(
                          resolved.get(`false:${cellIndex + 1}:${rowIndex}`),
                          nativeRow.HasFixSize(),
                        );
                      }
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
                            [0, 1, 2, 3].every(
                              /** Checks native painted border absence. @param edge - Side. @returns Whether empty. */ (
                                edge,
                              ) => boxItem.GetLine(edge)?.isEmpty() ?? true,
                            )
                              ? "true"
                              : undefined
                          }
                          className={
                            !isRepeatedHeadline &&
                            selectedBoxes?.includes(cell.GetStartNode().GetIndex()) === true
                              ? "relative bg-indigo-50 outline outline-1 outline-indigo-300"
                              : "relative"
                          }
                          colSpan={grid.GetColumnSpan(cell)}
                          key={cellIndex}
                          style={{
                            ...(nativeRow.HasFixSize() ? { border: "none", padding: 0 } : boxStyle),
                            outline: [0, 1, 2, 3].every(
                              /** Keeps borderless table guides outside native column geometry. @param edge - Native side. @returns Whether unpainted. */
                              (edge) => boxItem.GetLine(edge)?.isEmpty() ?? true,
                            )
                              ? "1px dashed #cbd5e1"
                              : undefined,
                            outlineOffset: -1,
                            verticalAlign:
                              cell.GetVertOrient().GetVertOrient() === VertOrientation.CENTER
                                ? "middle"
                                : cell.GetVertOrient().GetVertOrient() === VertOrientation.BOTTOM
                                  ? "bottom"
                                  : "top",
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
                                display: "flex",
                                flexDirection: "column",
                                justifyContent:
                                  cell.GetVertOrient().GetVertOrient() === VertOrientation.CENTER
                                    ? "safe center"
                                    : cell.GetVertOrient().GetVertOrient() ===
                                        VertOrientation.BOTTOM
                                      ? "safe flex-end"
                                      : "flex-start",
                                ...boxStyle,
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
