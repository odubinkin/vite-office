/** @fileoverview Native database shell's source-range contract for Text to Columns. */
import { ScRange } from "../../../inc/address";
import type { ScViewData } from "./viewdata";

/** Gets the source rectangle for the command state or the used rows for execution. @param view - Native view. @param range - Destination for the selected range. @param emptyCheckOnly - Whether this is the command-state query. @returns Whether the range is admitted. */
export function GetTextToColumnsRange(
  view: ScViewData,
  range: ScRange,
  emptyCheckOnly: boolean,
): boolean {
  const marks = view.GetMarkData();
  const doc = view.GetDocument();
  if (marks.IsMarked()) {
    if (marks.IsMultiMarked()) return false;
    range.assign(marks.GetMarkArea());
    if (range.aStart.Col() !== range.aEnd.Col()) return false;
  } else {
    const col = view.GetCurX(),
      row = view.GetCurY(),
      tab = view.CurrentTabForData();
    range.assign(new ScRange(col, row, tab, col, row, tab));
  }
  if (emptyCheckOnly)
    return !doc.IsBlockEmpty(
      range.aStart.Col(),
      range.aStart.Row(),
      range.aEnd.Col(),
      range.aEnd.Row(),
      range.aStart.Tab(),
    );

  range.PutInOrder();
  const startRow: [number] = [range.aStart.Row()];
  const endRow: [number] = [range.aEnd.Row()];
  const shrunk: [boolean] = [false];
  doc.ShrinkToUsedDataArea(
    shrunk,
    range.aStart.Tab(),
    [range.aStart.Col()],
    startRow,
    [range.aEnd.Col()],
    endRow,
    false,
    false,
    true,
  );
  if (shrunk[0]) {
    range.aStart.SetRow(startRow[0]);
    range.aEnd.SetRow(endRow[0]);
  }
  return true;
}
