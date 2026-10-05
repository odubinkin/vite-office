/** @fileoverview Splits native text-node list-indent ownership and supported alignment selection from ndtxt.cxx. */
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_NUMRULE,
} from "../../../inc/hintids";
import type { SvxFirstLineIndentItem } from "../../../../editeng/source/items/frmitems";
import { SwTextFormatColl } from "../doc/fmtcol";
import { ListLevelIndents } from "../para/paratr";
import type { SwTextNode } from "./ndtxt";

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
