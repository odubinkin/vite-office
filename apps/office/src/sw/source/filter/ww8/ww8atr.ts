/** @fileoverview Admitted Word paragraph-numbering dispatch from ww8atr.cxx. The actual current derived owner is RTF; DOCX-only abstract/override list machinery is not admitted by this interface slice. */
import type { MSWordExportBase } from "./wrtww8";
import type { SwNumRuleItem } from "../../core/para/paratr";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwTextFormatColl } from "../../core/doc/fmtcol";
import { RES_PARATR_LIST_LEVEL } from "../../../inc/hintids";
import type { SfxInt16Item } from "../../../../svl/source/items/intitem";
/** Real native virtual-output base for the currently consumed non-DOCX paragraph path. String results bind the existing paragraph formatting buffer. */
export abstract class AttributeOutputBase {
  /** Original export-context virtual. @returns Actual export owner. */
  abstract GetExport(): MSWordExportBase;
  /** Original format-specific numbering sink. @param node - Actual text node or native null. @param level - Clamped Word level. @param id - One-based dispatch ID. @returns Paragraph controls. */
  protected abstract ParaNumRule_Impl(
    node: SwTextNode | undefined,
    level: number,
    id: number,
  ): string;
  /** Original empty/unknown/uncounted/style/restart dispatch for the actual non-DOCX owner. Restart copies precede the final Word-level clamp. @param item - Actual paragraph rule item. @returns Format-specific controls. */
  ParaNumRule(item: SwNumRuleItem): string {
    if (item.GetValue() === "") return this.ParaNumRule_Impl(undefined, 0, 0);
    const owner = this.GetExport(),
      rule = owner.m_rDoc.FindNumRulePtr(item.GetValue());
    if (rule === undefined) return "";
    let id = (owner.GetNumberingId(rule) + 1) & 0xffff,
      level = 0;
    const formatNode = owner.m_pOutFormatNode;
    const node = formatNode instanceof SwTextNode ? formatNode : undefined;
    if (node !== undefined) {
      if (node.IsCountedInList()) {
        level = Math.max(0, Math.min(node.GetActualListLevel(), 9));
        if (node.IsListRestart()) {
          id = owner.DuplicateNumRule(rule, level, node.GetActualListStartValue() & 0xffff);
          if (id !== 0xffff) id = (id + 1) & 0xffff;
        }
      } else id = 0;
    } else if (formatNode instanceof SwTextFormatColl) {
      if (formatNode.IsAssignedToListLevelOfOutlineStyle())
        level = formatNode.GetAssignedOutlineStyleLevel() & 0xff;
      else {
        const entry = owner.m_pISet?.GetItemIfSet(RES_PARATR_LIST_LEVEL, true) as
          SfxInt16Item | undefined;
        if (entry !== undefined) level = entry.GetValue() & 0xff;
      }
    }
    if (level >= 9) level = 8;
    return this.ParaNumRule_Impl(node, level, id);
  }
}

/** Original correction removes default/before-indent stops and subtracts the legacy absolute indent in place from retained stops. @param set - Actual temporary paragraph set. @param left - Legacy indent. @returns Nothing. */
export function CorrectTabStopInSet(set: SfxItemSet, left: number): void {
  const source = set.GetItemIfSet(RES_PARATR_TABSTOP, true) as SvxTabStopItem | undefined;
  if (source === undefined) return;
  const tabs = new SvxTabStopItem(source);
  for (let index = 0; index < tabs.Count();) {
    const stop = tabs.At(index);
    if (stop.GetAdjustment() !== SvxTabAdjust.Default && stop.GetTabPos() >= left) {
      (stop as SvxTabStop).GetTabPos(true)[0] -= left;
      ++index;
    } else tabs.Remove(index);
  }
  set.Put(tabs);
}

import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxTabStop, SvxTabStopItem, SvxTabAdjust } from "../../../../editeng/inc/tstpitem";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
