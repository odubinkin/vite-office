/** @fileoverview Browser binding of source GetSelectionScriptType for the current plain-cell display boundary. The unported native formatted-cell script cache is not emulated. */
import type { ScViewData } from "../../source/ui/inc/viewdata";
import { ScAddress } from "../../inc/address";
import { ScHorizontalCellIterator } from "../../inc/dociter";
import { cellPresentation } from "../editor/cell-input";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getConfiguredSystemUILanguage } from "../../../i18nlangtag/source/isolang/mslangid";
import { getScriptType, ScriptType } from "../../../i18nlangtag/source/isolang/mslangid.script";
import { SvtScriptType } from "../../../svl/inc/languageoptions";
import { GetStringScriptType } from "../../source/core/data/documen6";
import { BreakIteratorImpl } from "../../../i18npool/source/breakiterator/breakiteratorImpl";
const breakIterator = new BreakIteratorImpl();

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
        script |= GetStringScriptType(string, breakIterator);
      } finally {
        string.dispose();
      }
    };
  if (!marks.IsMarked()) classify(new ScAddress(view.GetCurX(), view.GetCurY(), tab));
  else {
    const range = marks.GetMarkArea();
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
  if (script === SvtScriptType.NONE) {
    const officeScript = getScriptType(getConfiguredSystemUILanguage());
    script =
      officeScript === ScriptType.ASIAN
        ? SvtScriptType.ASIAN
        : officeScript === ScriptType.COMPLEX
          ? SvtScriptType.COMPLEX
          : SvtScriptType.LATIN;
  }
  return script;
}
