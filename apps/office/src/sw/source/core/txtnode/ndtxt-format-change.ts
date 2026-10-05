/** @fileoverview Ports the anonymous-namespace format-change numbering helpers from pinned sw/source/core/txtnode/ndtxt.cxx; split from ndtxt.ts to preserve the module-size gate. */

import {
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_OUTLINELEVEL,
  RES_PARATR_NUMRULE,
} from "../../../inc/hintids";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SwNumRule } from "../doc/number";
import type { SwTextNode } from "./ndtxt";

/** Tests native outline direct-level preservation when a collection follows itself. @param node - Original paragraph. @returns Whether its directly assigned list level must survive. */
export function CopyDirectListLevel(node: SwTextNode): boolean {
  const collection = node.GetTextFormatColl();
  return (
    collection.GetNextTextFormatColl() === collection &&
    collection.IsAssignedToListLevelOfOutlineStyle() &&
    node.HasAttrListLevel()
  );
}

/** Applies represented MakeNewTextNode and SplitContentNode list/style defaults to logical paragraphs. @param prefix - Leading paragraph retaining original items. @param suffix - Prepared continuation. @param atEnd - Whether the split reaches the original text end. @returns Nothing. */
export function PrepareSplitTextNodeFormat(
  prefix: SwTextNode,
  suffix: SwTextNode,
  atEnd: boolean,
): void {
  const collection = prefix.GetTextFormatColl(),
    parentIsOutline = prefix.IsOutline(),
    setListLevel = !CopyDirectListLevel(prefix);
  prefix.ChgFormatColl(collection, setListLevel);
  if (atEnd) {
    const following = collection.GetNextTextFormatColl();
    if (following !== collection && parentIsOutline && suffix.GetNumRule() !== undefined)
      suffix.ResetAttr(RES_PARATR_NUMRULE);
    suffix.ChgFormatColl(following, setListLevel);
  }
  for (const which of [
    RES_PARATR_LIST_ISRESTART,
    RES_PARATR_LIST_RESTARTVALUE,
    RES_PARATR_LIST_ISCOUNTED,
  ])
    suffix.ResetAttr(which);
  if (suffix.GetNumRule() === undefined || (parentIsOutline && !suffix.IsOutline())) {
    suffix.ResetAttr(RES_PARATR_LIST_ID);
    suffix.ResetAttr(RES_PARATR_LIST_LEVEL);
  }
}

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
