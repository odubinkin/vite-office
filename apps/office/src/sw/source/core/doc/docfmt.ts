/** @fileoverview Ports supported SwDoc paragraph collection reset/range and MoveLeftMargin operations from pinned sw/source/core/doc/docfmt.cxx. */

import type { SwCharFormat } from "../../../inc/charfmt";
import { SfxItemIter } from "../../../../svl/inc/itemiter";
import { BroadcastingModify } from "../../../inc/calbck";
import { SwAttrSet } from "../attr/swatrset";
import { SwUndoFormatAttr, SwUndoDefaultAttr } from "../undo/unattr";
import { AttrSetChangeHint, SwAttrSetChg, SwFormatChangeHint } from "../../../inc/hints";
import { SwContentNode } from "../docnode/node";
import { SvxTabAdjust } from "../../../../editeng/inc/svxenum";
import {
  isDrawingLayerAttribute,
  RES_CHRATR_BEGIN,
  RES_TXTATR_END,
  RES_PARATR_BEGIN,
  RES_PARATR_LIST_END,
  RES_FRMATR_BEGIN,
  RES_FRMATR_END,
  RES_GRFATR_BEGIN,
  RES_GRFATR_END,
  RES_BOXATR_BEGIN,
  RES_BOXATR_END,
} from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_CHRATR_END } from "../../../inc/hintids";
import { setCharacterItems } from "../txtnode/ndhints-font";
import { SwFormatAutoFormat } from "../txtnode/txatbase";
import { SwFormatCharFormat, SwFormatINetFormat } from "../txtnode/fmtatr2";
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
import { SwTextFormatColl, isWriterParagraphStyle } from "./fmtcol";
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
    if (item instanceof SwFormatCharFormat) node.InsertItem(item, start, end, mode);
    else if (item instanceof SwFormatINetFormat)
      node.SetHyperlink(start, end, item.GetValue() ? item.GetHyperlink() : undefined);
    else if (item instanceof SwFormatAutoFormat) node.InsertItem(item, start, end, mode);
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

/** Copies absent custom style ownership with native parent/follow/direct-item and manual-rule handling. @param document - Owning document. @param source - Source collection. @returns Destination collection; the existing builtin identity adapter is retained. */
export function CopyTextColl(document: SwDoc, source: SwTextFormatColl): SwTextFormatColl {
  if (isWriterParagraphStyle(source.id)) return document.GetTextFormatColl(source.id);
  const existing = document.FindTextFormatCollByName(source.GetName());
  if (existing !== undefined) return existing;
  const sourceParent = source.DerivedFrom();
  const parent =
    sourceParent instanceof SwTextFormatColl
      ? document.CopyTextColl(sourceParent)
      : document.GetDfltTextFormatColl();
  const completed = document.FindTextFormatCollByName(source.GetName());
  if (completed !== undefined) return completed;
  const copied = document.MakeTextFormatColl(source.GetName(), parent, source.id);
  copied.SetFormatAttrSet(source.GetAttrSet());
  if (source.IsAssignedToListLevelOfOutlineStyle())
    copied.AssignToListLevelOfOutlineStyle(source.GetAssignedOutlineStyleLevel());
  const follow = source.GetNextTextFormatColl();
  if (follow !== source) copied.SetNextTextFormatColl(document.CopyTextColl(follow));
  const ruleName = (
    source.GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false) as SwNumRuleItem | undefined
  )?.GetValue();
  const rule =
    ruleName === undefined || ruleName === ""
      ? undefined
      : source.GetAttrSet().GetDoc().FindNumRulePtr(ruleName);
  if (rule !== undefined && !rule.IsAutoRule() && source.GetAttrSet().GetDoc() !== document) {
    const destinationRule = document.FindNumRulePtr(rule.GetName());
    if (destinationRule === undefined) document.AddNumRule(rule);
    else destinationRule.Invalidate();
  }
  return copied;
}

/** Original ChgFormat stores explicit INVALID markers for newly introduced identities before the format mutation. @param document - Owning document. @param format - Represented paragraph collection. @param set - Incoming set. @returns Nothing. */
export function ChgFormat(document: SwDoc, format: SwTextFormatColl, set: SfxItemSet): void {
  if (document.GetUndoManager().DoesUndo()) {
    const added = new SfxItemSet(set);
    added.Differentiate(format.GetAttrSet());
    const old = new SfxItemSet(format.GetAttrSet());
    old.PutSet(added);
    for (const iterator = new SfxItemIter(added); !iterator.IsAtEnd(); iterator.Next())
      old.InvalidateItem(iterator.GetCurItem().Which());
    document.GetUndoManager().AddUndoAction(new SwUndoFormatAttr(old, format));
  }
  format.SetFormatAttrSet(set);
}

/** Native traversal visits inherited authored items too, first content-node order then style-table order; duplicate shared items are deliberately visited repeatedly. @param document - Owning document. @param callback - Native visitor with early-stop result. @returns Nothing. */
export function ForEachParaAtrTabStopItem(
  document: SwDoc,
  callback: (item: SvxTabStopItem) => boolean,
): void {
  const count = document.GetNodes().entries().length;
  for (let index = 0; index < count; ++index) {
    const node = document.GetNodes().at(index);
    if (node instanceof SwContentNode && node.HasSwAttrSet()) {
      const item = node.GetSwAttrSet().GetItemIfSet(RES_PARATR_TABSTOP) as
        SvxTabStopItem | undefined;
      if (item && !callback(item)) return;
    }
  }
  for (const format of document.GetTextFormatColls()) {
    const item = format.GetAttrSet().GetItemIfSet(RES_PARATR_TABSTOP) as SvxTabStopItem | undefined;
    if (item && !callback(item)) return;
  }
}

/** Original default-tab-stop mutation keeps its strict increment/removal boundary and reports true for any nonempty unequal-width input. @param oldWidth - Previous default width. @param newWidth - New default width. @param tabs - Actual authored native item. @returns Native change flag. */
export function lcl_SetNewDefTabStops(
  oldWidth: number,
  newWidth: number,
  tabs: SvxTabStopItem,
): boolean {
  const count = tabs.Count();
  if (!count || oldWidth === newWidth) return false;
  let index = count;
  for (; index; --index) if (tabs.At(index - 1).GetAdjustment() !== SvxTabAdjust.Default) break;
  ++index;
  if (index < count) tabs.Remove(index, count - index);
  return true;
}

/** Original SetDefault updates real pool defaults, temporarily registers the real default formats and sends original old/new hints. @param document - Owning document. @param source - Borrowed item or set. @returns Nothing. */
export function SetDefault(document: SwDoc, source: SfxPoolItem | SfxItemSet): void {
  if (!(source instanceof SfxItemSet)) {
    const set = new SfxItemSet(document.GetAttrPool(), [[source.Which(), source.Which()]]);
    set.Put(source);
    SetDefault(document, set);
    return;
  }
  if (!source.Count()) return;
  const notify = new BroadcastingModify(),
    pool = document.GetAttrPool(),
    old = new SwAttrSet(pool, source.GetRanges()),
    next = new SwAttrSet(pool, source.GetRanges()),
    secondary = pool.GetSecondaryPool();
  try {
    for (const iterator = new SfxItemIter(source); !iterator.IsAtEnd(); iterator.Next()) {
      const item = iterator.GetCurItem(),
        which = item.Which();
      let checkSecondary = false;
      old.Put(pool.GetUserOrPoolDefaultItem(which));
      pool.SetUserDefaultItem(item);
      next.Put(pool.GetUserOrPoolDefaultItem(which));
      if (which >= RES_CHRATR_BEGIN && which < RES_TXTATR_END) {
        notify.Add(document.GetDfltTextFormatColl());
        notify.Add(document.GetDfltCharFormat());
        checkSecondary = secondary !== null;
      } else if (which >= RES_PARATR_BEGIN && which < RES_PARATR_LIST_END) {
        notify.Add(document.GetDfltTextFormatColl());
        checkSecondary = secondary !== null;
      } else if (which >= RES_GRFATR_BEGIN && which < RES_GRFATR_END) {
        notify.Add(document.GetDfltGrfFormatColl());
      } else if (
        (which >= RES_FRMATR_BEGIN && which < RES_FRMATR_END) ||
        isDrawingLayerAttribute(which)
      ) {
        notify.Add(document.GetDfltGrfFormatColl());
        notify.Add(document.GetDfltTextFormatColl());
        notify.Add(document.GetDfltFrameFormat());
      } else if (which >= RES_BOXATR_BEGIN && which < RES_BOXATR_END)
        notify.Add(document.GetDfltFrameFormat());
      if (checkSecondary) {
        const slot = pool.GetSlotId(which);
        if (slot !== 0 && slot !== which) {
          const target = (secondary as NonNullable<typeof secondary>).GetWhichIDFromSlotID(slot);
          if (target !== 0 && target !== slot) {
            const copy = item.Clone() as SfxPoolItem;
            copy.SetWhich(target);
            (secondary as NonNullable<typeof secondary>).SetUserDefaultItem(copy);
          }
        }
      }
    }
    if (next.Count() && notify.HasWriterListeners()) {
      if (document.GetUndoManager().DoesUndo())
        document.GetUndoManager().AddUndoAction(new SwUndoDefaultAttr(old, document));
      const tabs = next.GetItemIfSet(RES_PARATR_TABSTOP, false) as SvxTabStopItem | undefined;
      if (tabs && tabs.Count()) {
        const newWidth = tabs.At(0).GetTabPos(),
          oldWidth = (old.Get(RES_PARATR_TABSTOP) as SvxTabStopItem).At(0).GetTabPos();
        let changed = false;
        ForEachParaAtrTabStopItem(
          document,
          /** Mutates each original visited item with native non-short-circuit accumulation. @param item - Borrowed item. @returns Continue. */ (
            item,
          ) => {
            changed = lcl_SetNewDefTabStops(oldWidth, newWidth, item) || changed;
            return true;
          },
        );
        next.ClearItem(RES_PARATR_TABSTOP);
        old.ClearItem(RES_PARATR_TABSTOP);
        if (changed)
          notify.CallSwClientNotify(
            new SwFormatChangeHint(document.GetDfltCharFormat(), document.GetDfltCharFormat()),
          );
      }
    }
    if (next.Count() && notify.HasWriterListeners())
      notify.CallSwClientNotify(
        new AttrSetChangeHint(new SwAttrSetChg(old, old), new SwAttrSetChg(next, next)),
      );
  } finally {
    notify.RemoveAllWriterListeners();
    notify.DisposeModify();
  }
  document.GetDocumentStateManager().SetModified();
}

/** Copies the represented native CopyFormat character branch, preserving name lookup, parent recursion, direct items and pool identity. @param doc - Destination. @param source - Actual character owner. @returns Destination style. */
export function CopyCharFormat(doc: SwDoc, source: SwCharFormat): SwCharFormat {
  if (!source.IsAuto() || source.GetRegisteredIn() === undefined) {
    const existing = doc.FindCharFormatByName(source.GetName());
    if (existing !== undefined) return existing;
  }
  const defaultFormat = doc.GetDfltCharFormat();
  const oldParent = source.DerivedFrom() as SwCharFormat | undefined;
  const parent =
    oldParent !== undefined && oldParent !== defaultFormat
      ? CopyCharFormat(doc, oldParent)
      : defaultFormat;
  const format = doc.MakeCharFormat(source.GetName(), parent);
  format.SetAuto(source.IsAuto());
  for (const item of source.GetAttrSet().entries()) format.SetFormatAttr(item);
  format.SetPoolFormatId(source.GetPoolFormatId());
  return format;
}
