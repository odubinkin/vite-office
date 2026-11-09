/** @fileoverview Browser table frame over canonical SwTable rows and SwTextNode cell paragraphs. */
import { SwFrameSize } from "../../inc/fmtfsize";
import { SwXMLTableLines } from "../../source/filter/xml/xmltble";

import { VertOrientation } from "../../../offapi/com/sun/star/text/VertOrientation";

import { SwRowFrame, SwCellFrame } from "../../source/core/layout/tabfrm";

import type { SwTable } from "../../source/core/table/swtable";
import { SwTableNode } from "../../source/core/docnode/node";
import { SwTabFrame, type SwTablePrintArea } from "../../source/core/layout/tabfrm";
import type { WriterParagraphProjection } from "../presentation/writer-view-projection";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
import type { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { browserBorderLine } from "../../../svx/browser/dialog/border-line";
import { Style } from "../../../svx/source/dialog/framelink";
import { SwTabFramePainter } from "../../source/core/layout/paintfrm";

import type { SvxBrushItem } from "../../../editeng/source/items/frmitems.brush";
import { SvxFrameDirection } from "../../../editeng/inc/frmdir";
import { RES_BACKGROUND } from "../../inc/hintids";
import { writerColorValue } from "../../source/core/attr/swatrset";
import type { SwFrameFormat } from "../../source/core/layout/atrfrm";

/** Projects an authored frame brush at the browser paint boundary. @param format - Native frame owner. @returns Browser color or absent. */
function browserFrameBackground(format: SwFrameFormat): string | undefined {
  const brush = format.GetAttrSet().GetItemIfSet(RES_BACKGROUND, false) as SvxBrushItem | undefined;
  return brush === undefined ? undefined : writerColorValue(brush.GetColor(), "transparent");
}

/** Maps the source frame axes to CSS without overriding inherited direction. @param format - Native frame owner. @returns Browser writing direction. */
function browserFrameWritingMode(format: SwFrameFormat): React.CSSProperties {
  switch (format.GetFrameDir().GetValue()) {
    case SvxFrameDirection.Horizontal_LR_TB:
      return { direction: "ltr", writingMode: "horizontal-tb" };
    case SvxFrameDirection.Horizontal_RL_TB:
      return { direction: "rtl", writingMode: "horizontal-tb" };
    case SvxFrameDirection.Vertical_RL_TB:
      return { direction: "ltr", writingMode: "vertical-rl" };
    case SvxFrameDirection.Vertical_LR_TB:
      return { direction: "ltr", writingMode: "vertical-lr" };
    case SvxFrameDirection.Vertical_LR_BT:
      return { direction: "ltr", writingMode: "sideways-lr" };
    case SvxFrameDirection.Vertical_RL_TB90:
      return { direction: "ltr", writingMode: "sideways-rl" };
    default:
      return {};
  }
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
  nativeFrame,
  printArea,
  availableWidth,
  selectedBoxes,
  firstRow = 0,
  lastRow = table.GetTabLines().length - 1,
  repeatedHeaderRows = 0,
  measureNaturalRows = false,
  retainElement,
  paragraphs,
  activeParagraphId,
  retainParagraphElement,
}: Readonly<{
  table: SwTable;
  nativeFrame?: SwTabFrame | undefined;
  printArea?: SwTablePrintArea;
  availableWidth?: number;
  selectedBoxes?: readonly number[] | undefined;
  firstRow?: number;
  lastRow?: number;
  repeatedHeaderRows?: number;
  /** Device measurement consumes natural content before authored row-size constraints. */
  measureNaturalRows?: boolean;
  retainElement?: (element: HTMLTableElement | null) => void;
  paragraphs: ReadonlyMap<number, WriterParagraphProjection>;
  activeParagraphId?: string;
  retainParagraphElement?: (id: string, element: HTMLParagraphElement | null) => void;
}>): React.JSX.Element {
  const nativeTable = nativeFrame ?? new SwTabFrame(table);
  try {
    const format = table.GetFormat();
    const spacing = nativeTable.GetFormat().GetULSpace();
    const collapsing = nativeTable.IsCollapsingBorders();
    const resolved = new Map<string, Style>();
    if (collapsing)
      new SwTabFramePainter(nativeTable).PaintLines(
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
    const area = printArea ?? nativeTable.Format(availableWidth ?? format.width ?? columnWidth);
    return (
      <div className="max-w-full" data-writer-table={table.GetName()}>
        <table
          aria-label={table.GetName()}
          data-writer-table-node={table.GetTableNode().GetIndex()}
          className="table-fixed"
          ref={retainElement}
          style={{
            ...browserFrameWritingMode(table.GetFrameFormat()),
            backgroundColor: browserFrameBackground(table.GetFrameFormat()),
            tableLayout: "fixed",
            borderCollapse: collapsing ? "collapse" : "separate",
            borderSpacing: 0,
            width: area.width / 15,
            marginLeft: area.left / 15,
            marginRight: area.right / 15,
            marginTop: firstRow === 0 ? spacing.GetUpper() / 15 : 0,
            marginBottom: lastRow === table.GetTabLines().length - 1 ? spacing.GetLower() / 15 : 0,
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
                let rowFrame = nativeTable.Lower() as SwRowFrame | undefined;
                while (rowFrame !== undefined && rowFrame.GetTabLine() !== row)
                  rowFrame = rowFrame.GetNext() as SwRowFrame | undefined;
                if (rowFrame === undefined) return null;
                const nativeRow = rowFrame;
                const rowSize = nativeRow.GetFormat().GetFrameSize();
                const fixed = !measureNaturalRows && nativeRow.HasFixSize();
                const isRepeatedHeadline = frameRowIndex < repeatedHeaderRows;
                let nativeCell = nativeRow.Lower();
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
                    style={{
                      backgroundColor: browserFrameBackground(row.GetFrameFormat()),
                      height:
                        measureNaturalRows || rowSize.GetHeightSizeType() === SwFrameSize.Variable
                          ? undefined
                          : rowSize.GetHeight() / 15,
                    }}
                  >
                    {row.GetTabBoxes().map(
                      /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
                        cell,
                        cellIndex,
                      ) => {
                        const frame = nativeCell as SwCellFrame;
                        nativeCell = frame.GetNext();
                        const signedSpan = frame.GetTabBox().getRowSpan();
                        // The browser uses the original row frames for each displayed follow fragment.
                        const startsFollow =
                          !isRepeatedHeadline && firstRow > 0 && rowIndex === firstRow;
                        const layoutSpan =
                          startsFollow && signedSpan < 0 ? -signedSpan : signedSpan;
                        if (layoutSpan < 1) return null;
                        const rowSpan = Math.min(
                          layoutSpan,
                          (isRepeatedHeadline ? repeatedHeaderRows : lastRow + 1) - rowIndex,
                        );
                        const cellFormat = frame.GetFormat(),
                          boxItem = cellFormat.GetBox(),
                          boxStyle = browserCellBoxStyle(boxItem, fixed);
                        if (collapsing) {
                          boxStyle.borderTop = browserBorderLine(
                            resolved.get(`true:${rowIndex}:${cellIndex}`),
                            fixed,
                          );
                          boxStyle.borderBottom = browserBorderLine(
                            resolved.get(`true:${rowIndex + 1}:${cellIndex}`),
                            fixed,
                          );
                          boxStyle.borderLeft = browserBorderLine(
                            resolved.get(`false:${cellIndex}:${rowIndex}`),
                            fixed,
                          );
                          boxStyle.borderRight = browserBorderLine(
                            resolved.get(`false:${cellIndex + 1}:${rowIndex}`),
                            fixed,
                          );
                        }
                        let paragraphIndex = 0;
                        const content = cell.GetContentNodes().map(
                          /** Renders the actual child table or direct paragraph in cell order. @param paragraph - Direct content node. @returns Connected browser content. */ (
                            paragraph,
                          ) => {
                            if (paragraph instanceof SwTableNode) {
                              const width = nativeTable.GetBoxPrintWidth(
                                cell,
                                availableWidth ?? area.left + area.width + area.right,
                              );
                              return (
                                <WriterEditableTable
                                  key={paragraph.GetIndex()}
                                  table={paragraph.GetTable()}
                                  availableWidth={Math.max(
                                    0,
                                    width - boxItem.GetDistance(2) - boxItem.GetDistance(3),
                                  )}
                                  paragraphs={paragraphs}
                                  selectedBoxes={isRepeatedHeadline ? undefined : selectedBoxes}
                                  {...(activeParagraphId === undefined
                                    ? {}
                                    : { activeParagraphId })}
                                  {...(retainParagraphElement === undefined
                                    ? {}
                                    : { retainParagraphElement })}
                                  measureNaturalRows={measureNaturalRows}
                                />
                              );
                            }
                            const index = paragraphIndex++;
                            const projection = paragraphs.get(paragraph.GetIndex());
                            if (projection === undefined)
                              throw new Error(
                                "Writer table cell has no connected paragraph projection.",
                              );
                            return (
                              <WriterEditableParagraph
                                cellPosition={{ rowIndex, cellIndex, paragraphIndex: index }}
                                index={index}
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
                        const CellTag = rowIndex < table.GetRowsToRepeat() ? "th" : "td";
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
                            rowSpan={rowSpan > 1 ? rowSpan : undefined}
                            key={cellIndex}
                            style={{
                              ...browserFrameWritingMode(cellFormat),
                              backgroundColor: browserFrameBackground(cellFormat),
                              ...(fixed ? { border: "none", padding: 0 } : boxStyle),
                              outline: [0, 1, 2, 3].every(
                                /** Keeps borderless table guides outside native column geometry. @param edge - Native side. @returns Whether unpainted. */
                                (edge) => boxItem.GetLine(edge)?.isEmpty() ?? true,
                              )
                                ? "1px dashed #cbd5e1"
                                : undefined,
                              outlineOffset: -1,
                              verticalAlign:
                                cellFormat.GetVertOrient().GetVertOrient() ===
                                VertOrientation.CENTER
                                  ? "middle"
                                  : cellFormat.GetVertOrient().GetVertOrient() ===
                                      VertOrientation.BOTTOM
                                    ? "bottom"
                                    : "top",
                            }}
                          >
                            {fixed ? (
                              <div
                                data-writer-fixed-row-content="true"
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: rowSize.GetHeight() / 15,
                                  boxSizing: "border-box",
                                  overflow: "hidden",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent:
                                    cellFormat.GetVertOrient().GetVertOrient() ===
                                    VertOrientation.CENTER
                                      ? "safe center"
                                      : cellFormat.GetVertOrient().GetVertOrient() ===
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
  } finally {
    if (nativeFrame === undefined) nativeTable.DestroyImpl();
  }
}
