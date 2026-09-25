/** @fileoverview Browser table frame over canonical SwTable rows and SwTextNode cell paragraphs. */
/* eslint-disable react-refresh/only-export-components -- Editing helper is exported for model-boundary tests. */

import { useLayoutEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { SwTable } from "../../source/core/table/swtable";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
import { projectWriterTextRuns } from "../../source/core/txtnode/ndtxt";
import {
  SvxFontHeightItem,
  SvxFontItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../../../editeng/source/items/textitem";
import { SvxLineSpacingItem, SvxULSpaceItem } from "../../../editeng/source/items/paraitem";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  RES_PARATR_LINESPACING,
  RES_UL_SPACE,
} from "../../inc/hintids";
import { projectWriterLineHeightItem } from "../../source/core/text/itrform2";
import { WriterTextRunProjection } from "./WriterEditableParagraph";
import { browserFontFamily } from "./writer-font-family";

/** Applies a minimal contiguous edit so Writer's ranged hints and positions adjust normally. */
/** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ export function editWriterTableCell(
  node: SwTextNode,
  next: string,
): void {
  const previous = node.GetText();
  if (previous === next) return;
  let start = 0;
  while (start < previous.length && start < next.length && previous[start] === next[start])
    start += 1;
  let oldEnd = previous.length;
  let newEnd = next.length;
  while (oldEnd > start && newEnd > start && previous[oldEnd - 1] === next[newEnd - 1]) {
    oldEnd -= 1;
    newEnd -= 1;
  }
  if (oldEnd > start) node.EraseText(start, oldEnd - start);
  if (newEnd > start) node.InsertText(next.slice(start, newEnd), start);
}

/** Keeps the browser caret in a cell while canonical text changes rerender the table frame. @param props - Cell node and position. @returns Editable cell. */
function WriterEditableTableCell({
  paragraph,
  rowIndex,
  cellIndex,
  paragraphIndex,
}: Readonly<{
  paragraph: SwTextNode;
  rowIndex: number;
  cellIndex: number;
  paragraphIndex: number;
}>): React.JSX.Element {
  const element = useRef<HTMLDivElement>(null);
  const font = paragraph.GetAttr(RES_CHRATR_FONT) as SvxFontItem;
  const fontFamily = font.GetResolvedFamilyName();
  const fontSizePt = (paragraph.GetAttr(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight() / 20;
  const bold = (paragraph.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetBoolValue();
  const italic = (paragraph.GetAttr(RES_CHRATR_POSTURE) as SvxPostureItem).GetBoolValue();
  const spacing = paragraph.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
  const lineHeight = projectWriterLineHeightItem(
    paragraph.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem,
    fontSizePt,
  );
  const formattedText = renderToStaticMarkup(
    <>
      {projectWriterTextRuns(paragraph).map(
        /** map handles this value. @param run - Input 1. @param index - Input 2. @returns The result. */ (
          run,
          index,
        ) => (
          <WriterTextRunProjection
            inheritedBold={bold}
            inheritedFontFamily={fontFamily}
            inheritedItalic={italic}
            key={index}
            run={run}
          />
        ),
      )}
    </>,
  );
  useLayoutEffect(
    /** Synchronizes formatted unfocused cell text from Writer. @returns Nothing. */ () => {
      const cell = element.current as HTMLDivElement;
      if (cell === document.activeElement) return;
      if (cell.innerHTML !== formattedText) cell.innerHTML = formattedText;
    },
  );
  return (
    <div
      aria-label={`Row ${rowIndex + 1} column ${cellIndex + 1} paragraph ${paragraphIndex + 1}`}
      contentEditable
      data-writer-table-cell={`${rowIndex}:${cellIndex}`}
      onInput={
        /** Commits native cell input. @param event - Input event. @returns Nothing. */ (event) =>
          editWriterTableCell(paragraph, event.currentTarget.textContent)
      }
      onBlur={
        /** Restores Writer run markup after native editing finishes. @param event - Blur event. @returns Nothing. */ (
          event,
        ) => {
          if (event.currentTarget.innerHTML !== formattedText)
            event.currentTarget.innerHTML = formattedText;
        }
      }
      onClick={
        /** Keeps a cell click out of row selection. @param event - Click event. @returns Nothing. */ (
          event,
        ) => event.stopPropagation()
      }
      onKeyDown={
        /** Keeps cell keys out of paragraph shortcuts. @param event - Key event. @returns Nothing. */ (
          event,
        ) => event.stopPropagation()
      }
      onMouseDown={
        /** Keeps cell pointer edits out of paragraph selection. @param event - Pointer event. @returns Nothing. */ (
          event,
        ) => event.stopPropagation()
      }
      onPaste={
        /** Lets the cell own pasted text. @param event - Paste event. @returns Nothing. */ (
          event,
        ) => event.stopPropagation()
      }
      ref={element}
      style={{
        cursor: "text",
        fontFamily: browserFontFamily(fontFamily, font.GetGenericFamily()),
        fontSize: `${fontSizePt}pt`,
        fontStyle: italic ? "italic" : "normal",
        fontWeight: bold ? 700 : 400,
        lineHeight,
        marginTop: `${spacing.GetUpper() / 20}pt`,
        marginBottom: `${spacing.GetLower() / 20}pt`,
        minHeight: `${fontSizePt * lineHeight}pt`,
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
      }}
      suppressContentEditableWarning
    />
  );
}

/** Renders one visible, editable Writer table with row selection. */
/** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ export function WriterEditableTable({
  table,
  selectedRow,
  onSelectRow,
  firstRow = 0,
  lastRow = table.GetTabLines().length - 1,
  retainElement,
}: Readonly<{
  table: SwTable;
  selectedRow?: number | undefined;
  onSelectRow: (row: number) => void;
  firstRow?: number;
  lastRow?: number;
  retainElement?: (element: HTMLTableElement | null) => void;
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
                    /** Handles the browser table interaction.  @returns Callback result. */ () =>
                      onSelectRow(firstRow + fragmentRowIndex)
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
                            ) => (
                              <WriterEditableTableCell
                                cellIndex={cellIndex}
                                key={paragraphIndex}
                                paragraph={paragraph}
                                paragraphIndex={paragraphIndex}
                                rowIndex={rowIndex}
                              />
                            ),
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
