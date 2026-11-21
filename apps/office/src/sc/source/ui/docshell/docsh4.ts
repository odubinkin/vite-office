/** @fileoverview Page style setup and application from the native Calc document shell. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { SfxStyleSheetBase } from "../../../../svl/source/items/style-model";
import type { ScDocShell } from "./docsh";
import { ScStyleSaveData, ScUndoModifyStyle } from "../undo/undostyl";
import type { ScStyleDlgRequest, ScStyleDlgResult } from "../styleui/styledlg";

/** Invalidates actual sheets whose layout uses the changed page style. @param shell - Source document shell. @param oldName - Current usage name. @param newName - Name after the transaction. @returns Nothing. */
export function PageStyleModified(shell: ScDocShell, oldName: string, newName: string): void {
  const document = shell.GetDocument();
  for (let tab = 0; tab < document.GetTableCount(); tab++) {
    if (document.GetPageStyle(tab) !== oldName) continue;
    const sheet = document.FetchTable(tab);
    if (!sheet) continue;
    if (newName !== oldName) sheet.SetPageStyle(newName);
    sheet.SetStreamValid(false);
    sheet.InvalidatePageBreaks();
  }
}

/** Updates the source style name and respects the pool's collision checks. @param style - Actual style. @param name - Requested name. @returns Whether accepted. */
export function RenamePageStyle(style: SfxStyleSheetBase, name: string): boolean {
  const value = unicode(name);
  try {
    return style.SetName(value);
  } finally {
    value.dispose();
  }
}

/** Initializes the original page style dialog using a retained snapshot. @param shell - Workbook shell. @param style - Active page style. @param snapshot - Original style snapshot. @returns Dialog request. */
export function CreatePageStyleRequest(
  shell: ScDocShell,
  style: SfxStyleSheetBase,
  snapshot: ScStyleSaveData,
): ScStyleDlgRequest {
  return {
    name: snapshot.name,
    canRename: style.IsUserDefined(),
    items: snapshot.items,
    nameAvailable: (name) => {
      if (!name) return false;
      const existing = shell.GetDocument().GetStyleSheetPool()?.GetPageStyle(name);
      return !existing || existing === style;
    },
  };
}

/** Applies the original asynchronous page style result and transfers the old items into history. @param shell - Workbook shell. @param style - Active page style. @param before - Original snapshot. @param result - Accepted Sfx item changes. @returns Whether the result was applied. */
export function ApplyPageStyle(
  shell: ScDocShell,
  style: SfxStyleSheetBase,
  before: ScStyleSaveData,
  result: ScStyleDlgResult,
): boolean {
  if (
    result.name !== before.name &&
    (!style.IsUserDefined() || !RenamePageStyle(style, result.name))
  )
    return false;
  style.GetItemSet().PutSet(result.items);
  shell.GetUndoManager().AddUndoAction(new ScUndoModifyStyle(before, new ScStyleSaveData(style)));
  PageStyleModified(shell, before.name, result.name);
  shell.SetDocumentModified();
  return true;
}
