/** @fileoverview Original Writer Grow/Shrink ExecCharAttr/GetAttrState branches from txtattr.cxx over actual editing-shell script/items/ranges and undo owners. */
import { SvxScriptSetItem } from "../../../../editeng/source/items/textitem.scriptset";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { RES_CHRATR_FONTSIZE } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwPaM } from "../../core/crsr/pam";
import type { SwItemWithPaM } from "../../core/edit/edattr-items";
import type { SwTextShellTarget } from "./textsh1";
const nFontInc = 40,
  nFontMaxSz = 19998;
/** Reads the original script aggregate before deciding between uniform and source contribution paths. @param target - Actual editing shell. @returns Original set and uniform height or absent. */
function aggregate(
  target: SwTextShellTarget,
): readonly [SvxScriptSetItem, SvxFontHeightItem | undefined] {
  const set = new SvxScriptSetItem(10015, target.GetDoc().GetAttrPool());
  target.GetCurAttr(set.GetItemSet());
  return [set, set.GetItemOfScript(target.GetScriptType()) as SvxFontHeightItem | undefined];
}
/** Original GetAttrState uses equality at each limit and disables both commands on a null contribution. @param target - Actual editing shell. @param grow - Requested command. @returns Original enabled flag. */
export function canChangeWriterFontSize(target: SwTextShellTarget, grow: boolean): boolean {
  const [, size] = aggregate(target);
  if (size !== undefined) return size.GetHeight() !== (grow ? nFontMaxSz : nFontInc);
  const items = target.GetItemWithPaM(RES_CHRATR_FONTSIZE);
  try {
    for (const [item] of items)
      if (
        item === undefined ||
        (item as SvxFontHeightItem).GetHeight() === (grow ? nFontMaxSz : nFontInc)
      )
        return false;
    return true;
  } finally {
    for (const [, pam] of items) pam.Dispose();
  }
}
/** Original ExecCharAttr preserves source contribution order, unsigned32 arithmetic and one complete history group. @param target - Actual editing shell. @param grow - Original grow versus shrink slot. @returns Whether stored ranges changed. */
export function changeWriterFontSize(target: SwTextShellTarget, grow: boolean): boolean {
  const [set, uniform] = aggregate(target),
    document = target.GetDoc(),
    cursor = target.GetCursor();
  const items: SwItemWithPaM[] =
    uniform !== undefined && !target.IsTableMode()
      ? [[uniform, new SwPaM(cursor.GetMark(), cursor.GetPoint())]]
      : target.GetItemWithPaM(RES_CHRATR_FONTSIZE);
  const attributes = new SfxItemSet(document.GetAttrPool(), set.GetItemSet().GetRanges());
  try {
    return document.RunModelTransaction(
      /** Retains original grouped per-range edits without replacing current cursor ownership. @returns Whether changed. */ () => {
        const undo = document.GetUndoManager();
        undo.StartUndo("Character Formatting");
        let changed = false;
        try {
          for (const [item, pam] of items) {
            set.GetItemSet().ClearItem();
            target.GetPaMAttr(pam, set.GetItemSet());
            if (item === undefined) continue;
            const size = new SvxFontHeightItem(item as SvxFontHeightItem);
            let height = (size.GetHeight() + (grow ? nFontInc : -nFontInc)) >>> 0;
            if (grow && height > nFontMaxSz) height = nFontMaxSz;
            else if (!grow && height < nFontInc) height = nFontInc;
            size.SetHeight(height);
            set.PutItemForScriptType(
              SvtScriptType.LATIN | SvtScriptType.ASIAN | SvtScriptType.COMPLEX,
              size,
            );
            attributes.PutSet(set.GetItemSet());
            changed = target.SetAttrSet(attributes, SetAttrMode.DEFAULT, pam) || changed;
          }
          return changed;
        } finally {
          undo.EndUndo();
        }
      },
    );
  } finally {
    for (const [, pam] of items) pam.Dispose();
  }
}
