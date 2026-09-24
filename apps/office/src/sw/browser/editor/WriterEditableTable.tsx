/** @fileoverview Browser table frame over canonical SwTable rows and SwTextNode cell paragraphs. */
/* eslint-disable react-refresh/only-export-components -- Editing helper is exported for model-boundary tests. */

import type { SwTable } from "../../source/core/table/swtable";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";

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

/** Renders one visible, editable Writer table with row selection. */
/** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ export function WriterEditableTable({
  table,
  selectedRow,
  onSelectRow,
}: Readonly<{
  table: SwTable;
  selectedRow?: number | undefined;
  onSelectRow: (row: number) => void;
}>): React.JSX.Element {
  const format = table.GetFormat();
  return (
    <div
      className="my-2 max-w-full overflow-x-auto"
      contentEditable={false}
      data-writer-table={table.GetName()}
    >
      <table
        aria-label={table.GetName()}
        className="table-fixed border-collapse text-sm"
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
          marginTop: (format.marginTop ?? 0) / 15,
          marginBottom: (format.marginBottom ?? 0) / 15,
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
          {table.GetTabLines().map(
            /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
              row,
              rowIndex,
            ) => (
              <tr
                aria-selected={selectedRow === rowIndex}
                data-writer-table-row={rowIndex}
                key={rowIndex}
                onClick={
                  /** Handles the browser table interaction.  @returns Callback result. */ () =>
                    onSelectRow(rowIndex)
                }
                style={{ minHeight: (row.GetFormat().minHeight ?? 0) / 15 }}
              >
                {row.GetTabBoxes().map(
                  /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
                    cell,
                    cellIndex,
                  ) => {
                    const cellFormat = cell.GetFormat();
                    return (
                      <td
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
                            <div
                              aria-label={`Row ${rowIndex + 1} column ${cellIndex + 1} paragraph ${paragraphIndex + 1}`}
                              contentEditable
                              data-writer-table-cell={`${rowIndex}:${cellIndex}`}
                              key={paragraphIndex}
                              onInput={
                                /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                                  event,
                                ) =>
                                  editWriterTableCell(
                                    paragraph,
                                    event.currentTarget.textContent as string,
                                  )
                              }
                              onKeyDown={
                                /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                                  event,
                                ) => event.stopPropagation()
                              }
                              onMouseDown={
                                /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                                  event,
                                ) => event.stopPropagation()
                              }
                              onPaste={
                                /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                                  event,
                                ) => event.stopPropagation()
                              }
                              suppressContentEditableWarning
                            >
                              {paragraph.GetText()}
                            </div>
                          ),
                        )}
                      </td>
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
