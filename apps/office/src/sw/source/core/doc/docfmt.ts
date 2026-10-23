/** @fileoverview Ports supported SwDoc paragraph collection reset/range and MoveLeftMargin operations from pinned sw/source/core/doc/docfmt.cxx. */

import { SetAttrMode } from "../../../inc/swtypes";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_CHRATR_END } from "../../../inc/hintids";
import { setCharacterItems } from "../txtnode/ndhints-font";
import { SwFormatAutoFormat } from "../txtnode/txatbase";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import {
  SvxTextLeftMarginItem,
  SvxFirstLineIndentItem,
  SvxIndentValue,
} from "../../../../editeng/inc/lrspitem";
import { ListLevelIndents } from "../para/paratr";
import { SwRegHistory, type SwHistory } from "../undo/rolbck";
import { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import {
  RES_PARATR_TABSTOP,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_FIRSTLINE,
  RES_PARATR_NUMRULE,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PAGEDESC,
  RES_BREAK,
  WRITER_TEXT_NODE_WHICH_RANGES,
} from "../../../inc/hintids";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxInt16Item } from "../../../../svl/source/items/intitem";
import type { SwNumRuleItem } from "../para/paratr";
import type { SwFormatPageDesc } from "../attr/fmtpdsc";
import type { SwTextFormatColl } from "./fmtcol";
import type { SwNumRule } from "./number";
import type { SwDoc } from "./doc";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwPaM } from "../crsr/pam";
import { resetParagraphTextAttributes } from "../txtnode/txtedt";

/** Visits every text node in SwDoc::SetTextFormatColl's inclusive ordered span, retaining zero-width paragraph boundaries. @param document - Active model. @param range - Canonical point/mark. @returns Selected text nodes in native node order. */
export function getTextFormatCollNodes(document: SwDoc, range: SwPaM): readonly SwTextNode[] {
  const point = range.GetPoint().GetNode();
  const mark = range.GetMark().GetNode();
  const nodes = document.GetNodes();
  if (point.GetNodes() !== nodes || mark.GetNodes() !== nodes)
    throw new Error("Writer paragraph style range belongs to another node graph.");
  const ordered = nodes.entries();
  if (!ordered.includes(point) || !ordered.includes(mark))
    throw new Error("Writer paragraph style range is detached.");
  const start = range.Start().GetNodeIndex();
  const end = range.End().GetNodeIndex();
  return ordered.filter(
    /** Skips native non-text nodes while including both range endpoints. @param node - Candidate node. @returns Whether selected text. */
    (node): node is SwTextNode =>
      node.IsTextNode() && node.GetIndex() >= start && node.GetIndex() <= end,
  );
}

/** Ports lcl_RstAttr saved-item ordering and optional native deletion-set reset for the registered node profile. @param node - Target text node. @param resetSet - Full-character deletion set when requested. @returns Nothing. */
export function resetTextFormatCollAttributes(node: SwTextNode, resetSet?: SfxItemSet): void {
  const direct = node.GetpSwAttrSet();
  if (direct === undefined) return;
  const saved = new SfxItemSet(node.GetDoc().GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES);
  for (const which of [
    RES_PARATR_LIST_ID,
    RES_PARATR_LIST_LEVEL,
    RES_PARATR_LIST_ISRESTART,
    RES_PARATR_LIST_RESTARTVALUE,
    RES_PARATR_LIST_ISCOUNTED,
  ]) {
    const item = direct.GetItemIfSet(which, false);
    if (item !== undefined) saved.Put(item);
  }
  const rule = direct.GetItemIfSet(RES_PARATR_NUMRULE, false) as SwNumRuleItem | undefined;
  if (rule !== undefined && rule.GetValue().length !== 0) saved.Put(rule);
  const page = direct.GetItemIfSet(RES_PAGEDESC, false) as SwFormatPageDesc | undefined;
  if (page !== undefined && page.GetPageDescName().length !== 0) saved.Put(page);
  const pageBreak = direct.GetItemIfSet(RES_BREAK, false) as SfxInt16Item | undefined;
  if (pageBreak !== undefined && pageBreak.GetValue() !== 0) saved.Put(pageBreak);
  if (resetSet !== undefined && resetSet.Count() !== 0) {
    const protectedItems = new Set<number>([RES_PAGEDESC, RES_BREAK, RES_PARATR_NUMRULE]);
    for (const item of resetSet.entries())
      if (
        !protectedItems.has(item.Which()) ||
        saved.GetItemIfSet(item.Which(), false) === undefined
      )
        node.ResetAttr(item.Which());
  } else {
    node.ResetAllAttr();
    if (saved.Count() !== 0) node.SetAttr(saved);
  }
}

/** Applies lcl_SetTextFormatColl reset and list decisions before collection change. @param node - Selected text node. @param collection - Requested owned style. @param resetListAttrs - Native style list-reset eligibility. @param resetSet - Initial native full-character deletion set. @returns Nothing. */
export function setTextFormatCollAtNode(
  node: SwTextNode,
  collection: SwTextFormatColl,
  resetListAttrs: boolean,
  resetSet?: SfxItemSet,
): void {
  const previous = node.GetTextFormatColl();
  if (resetSet !== undefined) resetParagraphTextAttributes(node, false, resetSet);
  resetTextFormatCollAttributes(node, resetSet);
  if (resetListAttrs && (resetSet !== undefined || collection !== previous) && node.IsInList()) {
    // The registered list graph guarantees an owned rule for every in-list node.
    if ((node.GetNumRule() as SwNumRule).GetName() !== collection.GetNumRule().GetValue())
      node.ResetAttr([
        RES_PARATR_NUMRULE,
        RES_PARATR_LIST_LEVEL,
        RES_PARATR_LIST_ISRESTART,
        RES_PARATR_LIST_RESTARTVALUE,
        RES_PARATR_LIST_ISCOUNTED,
        RES_PARATR_LIST_ID,
      ]);
    else node.SetAttr(collection.GetAttrSet().Get(RES_PARATR_LIST_LEVEL));
  }
  node.ChgFormatColl(collection);
}

/** Upstream's 2 cm fallback when the document default tab item has no stops. */
export const SW_DEFAULT_INDENT_DISTANCE = 1134;

/** Reads the first document-default tab stop, as SwDoc::MoveLeftMargin does. @param document - Owning document. @returns Distance in twips. */
export function getMoveLeftMarginDistance(document: SwDoc): number {
  const tabs = document
    .GetAttrPool()
    .GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem;
  return tabs.Count() > 0 ? tabs.At(0).GetTabPos() : SW_DEFAULT_INDENT_DISTANCE;
}

/** Copies complete native paragraph items and merges independently applicable represented list geometry. @param paragraph - Original text owner. @returns Owned native first and left items. */
export function getMoveLeftMarginItems(paragraph: SwTextNode): {
  first: SvxFirstLineIndentItem;
  left: SvxTextLeftMarginItem;
} {
  const first = new SvxFirstLineIndentItem(
      paragraph.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem,
    ),
    left = new SvxTextLeftMarginItem(
      paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem,
    ),
    indents = paragraph.AreListLevelIndentsApplicable(),
    rule = paragraph.GetNumRule();
  if (indents !== ListLevelIndents.No && rule !== undefined) {
    const level = paragraph.GetActualListLevel();
    if (level >= 0) {
      const format = rule.Get(level);
      if (format.GetPositionAndSpaceMode() === "label-alignment") {
        if ((indents & ListLevelIndents.LeftMargin) !== 0)
          left.SetTextLeft(SvxIndentValue.twips(format.GetIndentAt()));
        // The current native numbering format profile stores first-line values in TWIP only.
        if ((indents & ListLevelIndents.FirstLine) !== 0)
          first.SetTextFirstLineOffset(SvxIndentValue.twips(format.GetFirstLineIndent()));
      }
    }
  }
  return { first, left };
}
/** Applies native typed margins in original first-then-left order over the inclusive current graph span. @param document - Original owner. @param range - Native selected range. @param right - Increase direction. @param modulus - Tab snapping. @param history - Optional native old-state receiver. @returns Nothing. */
export function moveLeftMargin(
  document: SwDoc,
  range: SwPaM,
  right: boolean,
  modulus: boolean,
  history?: SwHistory,
): void {
  const distance = getMoveLeftMarginDistance(document);
  for (const node of getTextFormatCollNodes(document, range)) {
    const { first, left } = getMoveLeftMarginItems(node);
    let next = left.ResolveTextLeft();
    if (modulus) next = Math.trunc(next / distance) * distance;
    if (right) next += distance;
    else if (next > 0) next -= distance;
    left.SetTextLeft(SvxIndentValue.twips(next));
    const registration = new SwRegHistory(node, node, history);
    try {
      node.SetAttr(first);
      node.SetAttr(left);
    } finally {
      registration.Dispose();
    }
  }
}

/** Applies a native item through paragraph or automatic-character format owners. @param document - Actual document. @param range - Registered selection. @param item - Concrete item delta. @returns Nothing.  @param mode - Native operation input. */
export function InsertPoolItem(
  document: SwDoc,
  range: SwPaM,
  item: SfxPoolItem,
  mode = SetAttrMode.DEFAULT,
): void {
  for (const node of getTextFormatCollNodes(document, range)) {
    const start = node === range.Start().GetNode() ? range.Start().GetContentIndex() : 0;
    const end = node === range.End().GetNode() ? range.End().GetContentIndex() : node.Len();
    if (item instanceof SwFormatINetFormat)
      node.SetHyperlink(start, end, item.GetValue() ? item.GetHyperlink() : undefined);
    else if (item instanceof SwFormatAutoFormat)
      node.SetTextHints(
        setCharacterItems(
          node.GetOrCreateSwpHints(),
          document.GetAttrPool(),
          node.Len(),
          start,
          end,
          item.GetStyleHandle().entries(),
          node.GetSwAttrSet(),
          true,
        ),
      );
    else if (
      item.Which() < RES_CHRATR_END &&
      start !== end &&
      ((mode & SetAttrMode.NOFORMATATTR) !== 0 || start !== 0 || end !== node.Len())
    )
      node.SetTextHints(
        setCharacterItems(
          node.GetOrCreateSwpHints(),
          document.GetAttrPool(),
          node.Len(),
          start,
          end,
          [item],
          node.GetSwAttrSet(),
          true,
        ),
      );
    else node.SetAttr(item);
  }
}

/** Resets represented direct attributes through original node and automatic-style owners. @param document - Canonical document. @param range - Registered selection. @param which - Selected item identity. @returns Nothing. */
export function ResetPoolItem(document: SwDoc, range: SwPaM, which: number): void {
  for (const node of getTextFormatCollNodes(document, range)) {
    const start = node === range.Start().GetNode() ? range.Start().GetContentIndex() : 0,
      end = node === range.End().GetNode() ? range.End().GetContentIndex() : node.Len();
    if (which < RES_CHRATR_END && start !== end) {
      node.FormatToTextAttr(node);
      const inherited = node.GetSwAttrSet();
      node.SetTextHints(
        setCharacterItems(
          node.GetOrCreateSwpHints(),
          document.GetAttrPool(),
          node.Len(),
          start,
          end,
          [inherited.Get(which)],
          inherited,
        ),
      );
    } else node.ResetAttr(which);
  }
}
