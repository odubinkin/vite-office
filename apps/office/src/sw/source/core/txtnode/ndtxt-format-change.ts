/** @fileoverview Ports the anonymous-namespace format-change numbering helpers from pinned sw/source/core/txtnode/ndtxt.cxx; split from ndtxt.ts to preserve the module-size gate. */

import {
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_OUTLINELEVEL,
} from "../../../inc/hintids";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SwNumRule } from "../doc/number";
import type { SwTextNode } from "./ndtxt";

/** Resets the five paragraph list attributes after leaving a list style. @param node - Changed paragraph. @returns Nothing. */
function lcl_ResetParAttrs(node: SwTextNode): void {
  for (const which of [
    RES_PARATR_LIST_ID,
    RES_PARATR_LIST_LEVEL,
    RES_PARATR_LIST_ISRESTART,
    RES_PARATR_LIST_RESTARTVALUE,
    RES_PARATR_LIST_ISCOUNTED,
  ])
    node.ResetAttr(which);
}

/** Applies the source-owned transition after a numbering or paragraph style change. @param node - Changed paragraph. @param rule - Effective rule name. @param oldRule - Retained record's former rule name. @param ruleSet - Whether a rule is set. @param paragraphStyleChanged - Whether to reset paragraph attributes. @returns Nothing. */
export function HandleApplyTextNodeFormatChange(
  node: SwTextNode,
  rule: string,
  oldRule: string,
  ruleSet: boolean,
  paragraphStyleChanged: boolean,
): void {
  if (rule !== oldRule) {
    if (ruleSet) {
      if (rule.length === 0) {
        node.RemoveFromList();
        if (paragraphStyleChanged) lcl_ResetParAttrs(node);
      } else {
        node.RemoveFromList();
        if (rule === SwNumRule.GetOutlineRuleName()) {
          const level = node.GetTextFormatColl().GetAssignedOutlineStyleLevel();
          if (level >= 0 && level < 10) node.SetAttrListLevel(level);
        }
        node.AddToList();
      }
    } else {
      node.RemoveFromList();
      if (paragraphStyleChanged) {
        lcl_ResetParAttrs(node);
        if ((node.GetAttr(RES_PARATR_OUTLINELEVEL, false) as SfxUInt16Item).GetValue() > 0)
          node.SetEmptyListStyleDueToSetOutlineLevelAttr();
      }
    }
  } else if (rule.length > 0 && !node.IsInList()) node.AddToList();
}

/** Resolves owned and effective rules after explicit collection reparenting. @param node - Changed paragraph. @returns Nothing. */
export function HandleModifyAtTextNodeFormatChange(node: SwTextNode): void {
  let ruleSet = false;
  let rule = "";
  let oldRule = "";
  if (node.GetNodes().IsDocNodes()) {
    oldRule = node.GetNum()?.GetNumRule()?.GetName() ?? "";
    if (
      node.IsEmptyListStyleDueToSetOutlineLevelAttr() &&
      node.GetTextFormatColl().GetNumRule().GetValue().length > 0
    )
      node.ResetEmptyListStyleDueToResetOutlineLevelAttr();
    const effectiveRule = node.GetNumRule();
    if (effectiveRule !== undefined) {
      ruleSet = true;
      rule = effectiveRule.GetName();
    }
  }
  HandleApplyTextNodeFormatChange(node, rule, oldRule, ruleSet, true);
}
