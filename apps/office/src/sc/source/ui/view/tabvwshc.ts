/** @fileoverview Consumed native DoAutoSum command orchestration from tabvwshc.cxx over actual view/mark owners. Named database filters remain an unported boundary. */
import type { ScTabViewShell } from "./tabvwsh4";
import { ScRangeList } from "../../../inc/rangelst";
import { ScAddress } from "../../../inc/address";
import type { OpCode } from "../../../../formula/inc/opcode";
import { OUString } from "../../../../sal/inc/rtl/ustring";
/** Original represented filtered-row scan;named database/autofilter collections are not represented by the current document and are not replaced with an empty service. @param view - Actual view shell. @param ranges - Native ranges. @returns A represented filtered row intersects. */
export function UseSubTotal(view: ScTabViewShell, ranges: ScRangeList): boolean {
  const doc = view.GetViewData().GetDocument();
  let subtotal = false,
    index = 0;
  while (!subtotal && index < ranges.size()) {
    const range = ranges.at(index);
    let tab = range.aStart.Tab();
    while (!subtotal && tab <= range.aEnd.Tab()) {
      let row = range.aStart.Row();
      while (!subtotal && row <= range.aEnd.Row()) {
        if (doc.RowFiltered(row, tab)) subtotal = true;
        else ++row;
      }
      ++tab;
    }
    ++index;
  }
  return subtotal;
}
/** Original marked/unmarked AutoSum orchestration. A marked empty range uses actual EnterAutoSum/EnterBlock/PasteFromClip. @param view - Actual view shell. @param rangeFinder - Native output. @param subtotal - Native output. @param code - Aggregate opcode. @returns Owned input-line formula or empty after block insertion. */
export function DoAutoSum(
  view: ScTabViewShell,
  rangeFinder: [boolean],
  subtotal: [boolean],
  code: OpCode,
): OUString {
  const data = view.GetViewData(),
    marks = data.GetMarkData(),
    doc = data.GetDocument();
  if (marks.IsMarked() || marks.IsMultiMarked()) {
    const marked = new ScRangeList();
    rangeFinder[0] = subtotal[0] = false;
    marks.FillRangeListWithMarks(marked, false);
    let empty = false;
    for (const range of marked)
      if (
        doc.IsBlockEmpty(
          range.aStart.Col(),
          range.aStart.Row(),
          range.aEnd.Col(),
          range.aEnd.Row(),
          range.aStart.Tab(),
        )
      ) {
        empty = true;
        break;
      }
    if (empty) {
      const ranges = new ScRangeList();
      if (view.GetAutoSumArea(ranges)) {
        const address = new ScAddress(ranges.back().aEnd);
        address.IncRow();
        view.EnterAutoSum(ranges, view.UseSubTotal(ranges), address, code);
      }
    } else {
      const useSubtotal = view.UseSubTotal(marked);
      for (let i = 0; i < marked.size(); i++) {
        const range = marked.at(i);
        if (!view.AutoSum(range, useSubtotal, i === marked.size() - 1, i !== 0, code)) {
          view.MarkRange(range, false);
          view.SetCursor(range.aEnd.Col(), range.aEnd.Row());
          const address = new ScAddress(range.aEnd);
          address.SetRow(address.Row() + 1);
          return view.GetAutoSumFormula(new ScRangeList(), useSubtotal, address, code);
        }
      }
    }
    return new OUString();
  }
  const ranges = new ScRangeList();
  rangeFinder[0] = view.GetAutoSumArea(ranges);
  subtotal[0] = view.UseSubTotal(ranges);
  return view.GetAutoSumFormula(
    ranges,
    subtotal[0],
    new ScAddress(data.GetCurX(), data.GetCurY(), data.GetTabNumber()),
    code,
  );
}
