/** @fileoverview GetSelectionScriptType browser binding over actual ScDocument script services and ScGlobal fallback. Formatted-cell cache updates remain unported. */
import { BreakIteratorImpl } from "../../../i18npool/source/breakiterator/breakiteratorImpl";
import type { ScViewData } from "../../source/ui/inc/viewdata";
import { ScAddress } from "../../inc/address";
import { ScHorizontalCellIterator } from "../../inc/dociter";
import { cellPresentation } from "../editor/cell-input";
import { ScGlobal } from "../../inc/global";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvtScriptType } from "../../../svl/inc/languageoptions";

/** Supplies the actual shared backend at the native process-context read site;the document retains the created interface. @returns Real script service. */
function createBreakIterator(): BreakIteratorImpl {
  return new BreakIteratorImpl();
}

/** Classifies actual displayed cell strings;like FillRangeListWithMarks(false),grouping does not union script types from other selected sheets. @param view - Actual cursor and mark owner. @returns Nonempty source flags,using office UI language for entirely weak/empty text. */
export function getCalcSelectionScriptType(view: ScViewData): SvtScriptType {
  const doc = view.GetDocument(),
    marks = view.GetMarkData(),
    tab = view.GetTabNumber();
  let script = SvtScriptType.NONE;
  const classify =
    /** Classifies one actual displayed cell through the borrowed script service. @param pos - Actual cell position. @returns Operation result. */ (
      pos: ScAddress,
    ): void => {
      const string = unicode(cellPresentation(doc, pos).text);
      try {
        script |= doc.GetStringScriptType(string, createBreakIterator);
      } finally {
        string.dispose();
      }
    };
  if (!marks.IsMarked() && !marks.IsMultiMarked())
    classify(new ScAddress(view.GetCurX(), view.GetCurY(), tab));
  else
    for (const range of marks.GetMarkedRanges()) {
      const cells = new ScHorizontalCellIterator(
        doc,
        range.aStart.Tab(),
        range.aStart.Col(),
        range.aStart.Row(),
        range.aEnd.Col(),
        range.aEnd.Row(),
      );
      const col: [number] = [0],
        row: [number] = [0];
      while (cells.GetNext(col, row) !== null)
        classify(new ScAddress(col[0], row[0], range.aStart.Tab()));
    }
  if (script === SvtScriptType.NONE) script = ScGlobal.GetDefaultScriptType();
  return script;
}
