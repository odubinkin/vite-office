/** @fileoverview Splits native text-node list-indent ownership and supported alignment selection from ndtxt.cxx. */
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_NUMRULE,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_LIST_ISCOUNTED,
} from "../../../inc/hintids";
import type {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/source/items/frmitems";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { WRITER_LIST_WHICH_RANGES } from "../doc/list";
import { getWriterNumFormatBullet, SvxNumType } from "../doc/number";
import { SwTextFormatColl } from "../doc/fmtcol";
import { ListLevelIndents } from "../para/paratr";
import type { SwTextNode } from "./ndtxt";

/** Resolves the native numbering margin delta using supported twip items. @param node - Native text node. @param textLeft - Whether to compare text-left instead of outer-left margins. @returns Native delta, zero without a number record. */
export function resolveSwLeftMarginWithNum(node: SwTextNode, textLeft = false): number {
  const rule = node.GetNum()?.GetNumRule();
  if (rule === undefined) return 0;
  const format = rule.Get(Math.max(0, Math.min(9, node.GetActualListLevel()))),
    left = (node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
    first = (
      node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
    ).ResolveTextFirstLineOffset(),
    outerLeft = left + Math.min(0, first);
  if (format.GetPositionAndSpaceMode() === "label-width-and-position") {
    let result = format.GetAbsLSpace();
    if (!textLeft)
      result =
        format.GetFirstLineOffset() < 0 && result > -format.GetFirstLineOffset()
          ? result + format.GetFirstLineOffset()
          : 0;
    return rule.IsAbsSpaces() ? result - outerLeft : result;
  }
  const mask = node.AreListLevelIndentsApplicable(),
    resolvedLeft = mask & ListLevelIndents.LeftMargin ? format.GetIndentAt() : left,
    resolvedFirst = mask & ListLevelIndents.FirstLine ? format.GetFirstLineIndent() : first;
  return textLeft ? resolvedLeft - left : resolvedLeft + Math.min(0, resolvedFirst) - outerLeft;
}

/** Resolves native tab calculations independently of visible numbering. @param node - Native text node. @returns Left margin for tab calculations. */
export function resolveSwLeftMarginForTabCalculation(node: SwTextNode): number {
  const rule = node.GetNum()?.GetNumRule();
  if (rule !== undefined) {
    const format = rule.Get(Math.max(0, Math.min(9, node.GetActualListLevel())));
    if (
      format.GetPositionAndSpaceMode() === "label-alignment" &&
      node.AreListLevelIndentsApplicable() & ListLevelIndents.LeftMargin
    )
      return format.GetIndentAt();
  }
  return (node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft();
}

/** Determines independent native list-indent applicability from current ownership. @param node - Canonical text node. @returns Native bitmask. */
export function resolveSwListLevelIndents(node: SwTextNode): ListLevelIndents {
  let result = ListLevelIndents.No;
  if (isApplicable(node, RES_MARGIN_FIRSTLINE)) result |= ListLevelIndents.FirstLine;
  if (isApplicable(node, RES_MARGIN_TEXTLEFT)) result |= ListLevelIndents.LeftMargin;
  return result;
}

/** Checks one native axis with indent-before-rule style precedence. @param node - Canonical text node. @param which - Margin identity. @returns Whether list geometry applies. */
function isApplicable(node: SwTextNode, which: number): boolean {
  if (node.GetNum()?.GetNumRule() === undefined) return false;
  const direct = node.GetpSwAttrSet();
  if (direct?.GetItemIfSet(which, false) !== undefined) return false;
  if (direct?.GetItemIfSet(RES_PARATR_NUMRULE, false) !== undefined) return true;
  let style: SwTextFormatColl | undefined = node.GetTextFormatColl();
  while (style !== undefined) {
    if (style.GetAttrSet().GetItemIfSet(which, false) !== undefined) return false;
    if (style.GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false) !== undefined) return true;
    const parent = style.DerivedFrom();
    style = parent instanceof SwTextFormatColl ? parent : undefined;
  }
  return true;
}

/** Supported native alignment-mode text-left and signed-short first-line inputs. */
export interface SwListParagraphIndents {
  readonly textLeft: number;
  readonly firstLine: number;
  readonly listLevelIndents: ListLevelIndents;
}

/** Selects native alignment items without resolving wider layout or legacy numbering placement. @param node - Canonical text node. @returns Effective inputs or no alignment rule. */
export function resolveSwListParagraphIndents(
  node: SwTextNode,
): SwListParagraphIndents | undefined {
  const rule = node.GetNum()?.GetNumRule();
  if (rule === undefined) return undefined;
  const format = rule.Get(Math.max(0, Math.min(9, node.GetActualListLevel())));
  if (format.GetPositionAndSpaceMode() !== "label-alignment") return undefined;
  const mask = node.AreListLevelIndentsApplicable();
  const raw = (
    node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
  ).ResolveTextFirstLineOffset();
  const first = !node.IsCountedInList()
    ? 0
    : mask & ListLevelIndents.FirstLine
      ? format.GetFirstLineIndent()
      : node.GetDoc().GetDocumentSettingManager().get("IGNORE_FIRST_LINE_INDENT_IN_NUMBERING")
        ? 0
        : raw;
  return {
    firstLine: (first << 16) >> 16,
    listLevelIndents: mask,
    textLeft:
      mask & ListLevelIndents.LeftMargin ? format.GetIndentAt() : node.GetParagraphTextLeftMargin(),
  };
}

/** Resolves native list text-left placement independently of label visibility. @param node - Canonical text node. @returns Text-left position in twips, or no bound rule. */
export function resolveSwListTextLeftMargin(node: SwTextNode): number | undefined {
  const rule = node.GetNum()?.GetNumRule();
  if (rule === undefined) return undefined;
  const alignment = resolveSwListParagraphIndents(node);
  if (alignment !== undefined) return alignment.textLeft;
  const format = rule.Get(Math.max(0, Math.min(9, node.GetActualListLevel())));
  const firstLine = node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem;
  // Absolute legacy spacing subtracts ResolveLeft, including its hanging
  // first-line part, from the caller's text-left margin.
  return (
    format.GetAbsLSpace() +
    (rule.IsAbsSpaces()
      ? -Math.min(0, firstLine.ResolveTextFirstLineOffset())
      : node.GetParagraphTextLeftMargin())
  );
}

/** Resolves native first-line placement through bound list ownership or ordinary paragraph layout. @param node - Canonical text node. @returns First-line offset in twips. */
export function resolveSwListFirstLineIndent(node: SwTextNode): number {
  const rule = node.GetNum()?.GetNumRule();
  if (rule === undefined) return node.GetParagraphFirstLineIndent();
  const alignment = resolveSwListParagraphIndents(node);
  if (alignment !== undefined) return alignment.firstLine;
  if (!node.IsCountedInList()) return 0;
  const format = rule.Get(Math.max(0, Math.min(9, node.GetActualListLevel())));
  const firstLine = node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem;
  const value =
    format.GetFirstLineOffset() +
    (node.GetDoc().GetDocumentSettingManager().get("IGNORE_FIRST_LINE_INDENT_IN_NUMBERING")
      ? 0
      : firstLine.ResolveTextFirstLineOffset());
  return (value << 16) >> 16;
}

/** Native text-node GetNumString body extracted under the physical-line budget. @param node - Actual native owner. @returns Native result. */
export function GetSwTextNodeNumString(node: SwTextNode): string {
  const rule = node.GetNum()?.GetNumRule();
  if (rule === undefined || !node.IsCountedInList()) return "";
  const level = Math.max(0, Math.min(9, node.GetActualListLevel())),
    format = rule.Get(level);
  return format.IsTextFormat() || format.GetNumberingType() === SvxNumType.SVX_NUM_NUMBER_NONE
    ? rule.MakeNumString(node.GetNumberVector(), level)
    : "";
}

/** Native text-node HasVisibleNumberingOrBullet body extracted under the physical-line budget. @param node - Actual native owner. @returns Native result. */
export function HasSwTextNodeVisibleNumbering(node: SwTextNode): boolean {
  const rule = node.GetNum()?.GetNumRule();
  if (rule === undefined || !node.IsCountedInList()) return false;
  const level = Math.max(0, Math.min(9, node.GetActualListLevel()));
  return (
    rule.Get(level).GetNumberingType() !== SvxNumType.SVX_NUM_NUMBER_NONE ||
    rule.MakeNumString(node.GetNumberVector(), level).length !== 0
  );
}

/** Native text-node CaptureListItems body extracted under the physical-line budget. @param node - Actual native owner. @returns Native result. */
export function CaptureSwTextNodeListItems(node: SwTextNode): SfxItemSet {
  const captured = new SfxItemSet(node.GetDoc().GetAttrPool(), WRITER_LIST_WHICH_RANGES);
  const attributes = node.GetpSwAttrSet();
  for (const which of [
    RES_PARATR_NUMRULE,
    RES_PARATR_LIST_ID,
    RES_PARATR_LIST_LEVEL,
    RES_PARATR_LIST_ISRESTART,
    RES_PARATR_LIST_RESTARTVALUE,
    RES_PARATR_LIST_ISCOUNTED,
  ]) {
    const item = attributes?.GetItemIfSet(which, false);
    if (item !== undefined) captured.Put(item);
  }
  return captured;
}

/** Preserves the existing visible list-label body under the node physical-line budget. @param node - Actual native owner. @returns Existing label or undefined. */
export function GetSwTextNodeListLabel(node: SwTextNode): string | undefined {
  const rule = node.GetNum()?.GetNumRule();
  if (rule === undefined || !node.IsCountedInList()) return undefined;
  const level = node.GetActualListLevel();
  const format = rule.Get(level);
  if (format.GetNumberingType() === SvxNumType.SVX_NUM_CHAR_SPECIAL)
    return getWriterNumFormatBullet(format);
  return rule.MakeNumString(node.GetNumberVector(), level);
}
