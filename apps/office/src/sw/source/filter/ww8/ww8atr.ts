/** @fileoverview Admitted Word paragraph-numbering dispatch from ww8atr.cxx. Actual RTF and DOCX sinks share native list identity, override and restart dispatch. */
import type { MSWordExportBase } from "./wrtww8";
import type { SwNumRuleItem } from "../../core/para/paratr";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwTextFormatColl } from "../../core/doc/fmtcol";
import { RES_PARATR_LIST_LEVEL } from "../../../inc/hintids";
import type { SfxInt16Item } from "../../../../svl/source/items/intitem";
import type { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxInterLineSpaceRule, SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import type { SwAttrSet } from "../../core/attr/swatrset";
import { AttrSetToLineHeight } from "../../core/txtnode/swfont";

/** Converts the native item into the common Word line-spacing pair. @param item - Actual line-spacing item. @param set - Current paragraph or style attributes. @param script - Native script at the paragraph start. @returns Signed size and multi-line flag. */
export function ParaLineSpacing(
  item: SvxLineSpacingItem,
  set: SwAttrSet,
  script: number,
): readonly [space: number, multi: boolean] {
  let space = 240;
  let multi = false;
  switch (item.GetLineSpaceRule()) {
    case SvxLineSpaceRule.Fix:
      space = -item.GetLineHeight();
      break;
    case SvxLineSpaceRule.Min:
      space = item.GetLineHeight();
      break;
    case SvxLineSpaceRule.Auto:
      if (item.GetInterLineSpaceRule() === SvxInterLineSpaceRule.Fix)
        space =
          item.GetInterLineSpace() +
          AttrSetToLineHeight(set, script, set.GetDoc().GetDefaultFontDevice());
      else {
        if (item.GetInterLineSpaceRule() !== SvxInterLineSpaceRule.Off)
          space = Math.round((240 * item.GetPropLineSpace()) / 100);
        multi = true;
      }
      break;
  }
  return [(space << 16) >> 16, multi];
}
/** Native virtual-output base. The default void result matches native output; the RTF string result binds its established formatting buffer. */
export abstract class AttributeOutputBase<Result = void> {
  /** Original export-context virtual. @returns Actual export owner. */
  abstract GetExport(): MSWordExportBase;
  /** Original format-specific numbering sink. @param node - Actual text node or native null. @param level - Clamped Word level. @param id - One-based dispatch ID. @returns Paragraph controls. */
  protected abstract ParaNumRule_Impl(
    node: SwTextNode | undefined,
    level: number,
    id: number,
  ): Result;
  /** Original base default diagnoses the unimplemented WW8/RTF override sink. DOCX must provide its actual override before complete numbering output is admitted. @param rule - Existing rule. @param id - One-based instance ID. @param abstract - One-based abstract ID. @param levels - Restart values. @returns Nothing. */
  OverrideNumberingDefinition(
    rule: SwNumRule,
    id: number,
    abstract: number,
    levels: ReadonlyMap<number, number>,
  ): void {
    void rule;
    void id;
    void abstract;
    void levels;
    throw new Error("assert(false): numbering override output is not implemented");
  }
  /** Original empty/unknown/uncounted/style/restart dispatch for the actual exporting owner. Restart copies precede the final Word-level clamp. @param item - Actual paragraph rule item. @returns Format-specific controls. */
  ParaNumRule(item: SwNumRuleItem): Result | undefined {
    if (item.GetValue() === "") return this.ParaNumRule_Impl(undefined, 0, 0);
    const owner = this.GetExport(),
      rule = owner.m_rDoc.FindNumRulePtr(item.GetValue());
    if (rule === undefined) return;
    let id = (owner.GetNumberingId(rule) + 1) & 0xffff,
      level = 0;
    const formatNode = owner.m_pOutFormatNode;
    const node = formatNode instanceof SwTextNode ? formatNode : undefined;
    if (node !== undefined) {
      if (node.IsCountedInList()) {
        level = Math.max(0, Math.min(node.GetActualListLevel(), 9));
        const restart = node.IsListRestart();
        if (owner.GetExportFormat() === MSWordExportFormat.DOCX) {
          const listId = node.GetListId();
          if (listId !== "" && (listId !== rule.GetDefaultListId() || restart)) {
            const list = owner.m_rDoc.GetDocumentListsManager().GetListByName(listId);
            if (list !== undefined) {
              const abstract = owner.m_rDoc.FindNumRulePtr(list.GetDefaultListStyleName());
              if (abstract === undefined) throw new Error("assert(abstract numbering rule)");
              if (!AreListsDifferentForExport(abstract, rule) && !restart) {
                id = owner.GetNumberingId(abstract);
                id =
                  id === 0xffff
                    ? (owner.DuplicateAbsNum(listId, abstract) + 1) & 0xffff
                    : (id + 1) & 0xffff;
              } else {
                id = (owner.OverrideNumRule(rule, listId, abstract) + 1) & 0xffff;
                if (restart)
                  owner.AddListLevelOverride(
                    id - 1,
                    node.GetActualListLevel(),
                    node.GetActualListStartValue(),
                  );
              }
            }
          }
        } else if (restart) {
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

import { MSWordExportFormat } from "./wrtww8";
import { AreListsDifferentForExport } from "./ww8par";

import type { SwNumRule } from "../../core/doc/number";
