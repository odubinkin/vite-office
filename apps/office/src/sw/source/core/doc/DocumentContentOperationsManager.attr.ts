/** @fileoverview Consumed native InsertItemSet paths for selected character edits and HTML paragraph attribute restoration. */
import type { SwDoc } from "./doc";
import { getTextFormatCollNodes } from "./docfmt";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type { SwPaM } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { MakeCharacterFormattingUndo, SwUndoParagraphItem } from "../undo/unattr";
import { createWriterUndoCursorState } from "../undo/undobj";
import { SwRegHistory } from "../undo/rolbck";
import { SetAttrMode } from "../../../inc/swtypes";
import * as H from "../../../inc/hintids";
import { XATTR_FILL_FIRST, XATTR_FILL_LAST } from "../../../../svx/inc/xdef";
import { SwFormatAutoFormat } from "../txtnode/fmtatr2";
import { releaseStyleHandle } from "../../../../svl/source/items/stylepool";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
/** Admits native paragraph-family items supported by the represented selected edit path. @param which - Native item identity. @returns Whether the paragraph owner can apply it. */
export function isParagraphEditItem(which: number): boolean {
  return (
    which === H.RES_PARATR_ADJUST ||
    which === H.RES_PARATR_VERTALIGN ||
    which === H.RES_PARATR_SCRIPTSPACE ||
    which === H.RES_PARATR_HANGINGPUNCTUATION ||
    which === H.RES_PARATR_FORBIDDEN_RULES ||
    which === H.RES_PARATR_LINESPACING ||
    which === H.RES_PARATR_SPLIT ||
    which === H.RES_PARATR_ORPHANS ||
    which === H.RES_PARATR_WIDOWS ||
    which === H.RES_MARGIN_TEXTLEFT ||
    which === H.RES_MARGIN_FIRSTLINE ||
    which === H.RES_MARGIN_RIGHT ||
    which === H.RES_UL_SPACE
  );
}

/** Identifies a native direct character item. @param which - Native item identity. @returns Whether it belongs to the character set. */
function isCharacterItem(which: number): boolean {
  return H.RES_CHRATR_BEGIN <= which && which < H.RES_CHRATR_END;
}

/** Applies represented character and paragraph items to a same-node selected edit. @param doc - Active document. @param range - Native selected range. @param items - Direct formatting deltas. @returns Nothing. */
function insertSelectedItems(doc: SwDoc, range: SwPaM, items: readonly SfxPoolItem[]): void {
  const start = range.Start();
  const end = range.End();
  const node = start.GetNode();
  if (!(node instanceof SwTextNode) || end.GetNode() !== node || node.GetDoc() !== doc)
    throw new Error("InsertItemSet selected formatting requires a same-node range.");

  const characterItems = new SfxItemSet(doc.GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
  const pending = new SfxItemSet(doc.GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
  const state = createWriterUndoCursorState(
    node,
    range.GetPoint().GetContentIndex(),
    node,
    range.GetMark().GetContentIndex(),
    node,
    pending,
  );
  const undo = doc.GetUndoManager();
  const grouped =
    undo.DoesUndo() &&
    items.some(
      /** Detects the paragraph half of a mixed set. @param item - Direct delta. @returns Whether it belongs to the paragraph. */ (
        item,
      ) => isParagraphEditItem(item.Which()),
    ) &&
    items.length > 1;
  if (grouped) undo.StartUndo("Formatting");
  try {
    for (const item of items) if (isCharacterItem(item.Which())) characterItems.Put(item);
    if (characterItems.Count() > 0) {
      const action = MakeCharacterFormattingUndo(
        { node, start: start.GetContentIndex(), end: end.GetContentIndex() },
        characterItems,
        state,
        state,
      );
      try {
        action.ApplyExact();
      } catch (error) {
        action.Dispose();
        throw error;
      }
      if (undo.DoesUndo()) undo.AddUndoAction(action);
      else action.Dispose();
    }
    for (const item of items) {
      if (!isParagraphEditItem(item.Which())) continue;
      const old = node.GetpSwAttrSet()?.GetItemIfSet(item.Which(), false);
      const action = undo.DoesUndo()
        ? new SwUndoParagraphItem(node, old, item, state, state)
        : undefined;
      let changed = false;
      try {
        changed = node.SetAttr(item);
      } finally {
        if (changed && action !== undefined) undo.AddUndoAction(action);
        else action?.Dispose();
      }
    }
    doc.NotifyModelChange({ kind: "document-modified", modified: true });
  } finally {
    if (grouped) undo.EndUndo();
    state.pendingCharacterItems.Dispose();
    characterItems.Dispose();
    pending.Dispose();
  }
}

/** Applies selected formatting or deltas from the original HTML filter path. @param doc - Actual document. @param range - Native selection or filter range. @param set - Actual attribute set. @param mode - Native flags. @returns Nothing. */
export function InsertItemSet(doc: SwDoc, range: SwPaM, set: SfxItemSet, mode: SetAttrMode): void {
  const items = set.entries();
  if (
    !range.IsInFrontOfLabel() &&
    range.HasMark() &&
    mode === SetAttrMode.DEFAULT &&
    items.length === set.Count() &&
    items.every(
      /** Identifies the represented editing branches. @param item - Formatting delta. @returns Whether this owner handles the item. */ (
        item,
      ) => isCharacterItem(item.Which()) || isParagraphEditItem(item.Which()),
    )
  ) {
    if (items.length > 0) insertSelectedItems(doc, range, items);
    return;
  }
  if (doc.GetUndoManager().DoesUndo() || range.IsInFrontOfLabel())
    throw new Error(
      "InsertItemSet filter path requires disabled undo and an ordinary paragraph range",
    );
  if (range.HasMark()) {
    if (
      items.length !== set.Count() ||
      items.some(
        /** Admits the drawing fill subset of the native paragraph OtherSet. @param item - Actual set entry. @returns Whether outside the represented range. */
        (item) => item.Which() < XATTR_FILL_FIRST || item.Which() > XATTR_FILL_LAST,
      )
    )
      throw new Error("InsertItemSet selected filter range requires only drawing fill items");
    if (!items.length) return;
    const nodes = getTextFormatCollNodes(doc, range);
    let changed = false;
    for (const node of nodes) changed = node.SetAttr(set) || changed;
    if (
      changed ||
      nodes.length > 1 ||
      (nodes[0] &&
        range.Start().GetContentIndex() === 0 &&
        range.End().GetContentIndex() === nodes[0].Len())
    )
      doc.NotifyModelChange({ kind: "document-modified", modified: true });
    return;
  }
  const point = range.GetPoint(),
    node = point.GetNode(),
    offset = point.GetContentIndex();
  if (
    !(node instanceof SwTextNode) ||
    node.GetDoc() !== doc ||
    (offset !== 0 && offset !== node.Len())
  )
    throw new Error("InsertItemSet filter path requires an actual paragraph boundary");
  const allowed = new SfxItemSet(doc.GetAttrPool(), [
    [H.RES_CHRATR_BEGIN, H.RES_CHRATR_END - 1],
    [H.RES_PARATR_BEGIN, H.RES_PARATR_NUMRULE - 1],
    [H.RES_PARATR_NUMRULE + 1, H.RES_PARATR_CONNECT_BORDER],
    [H.RES_LR_SPACE, H.RES_UL_SPACE],
    [XATTR_FILL_FIRST, XATTR_FILL_LAST],
  ]);
  const characters = new SfxItemSet(doc.GetAttrPool(), [
      [H.RES_CHRATR_BEGIN, H.RES_CHRATR_END - 1],
    ]),
    other = new SfxItemSet(doc.GetAttrPool(), [
      [H.RES_PARATR_BEGIN, H.RES_GRFATR_END - 1],
      [H.RES_UNKNOWNATR_BEGIN, H.RES_UNKNOWNATR_END - 1],
      [XATTR_FILL_FIRST, XATTR_FILL_LAST],
    ]);
  try {
    allowed.PutSet(set);
    if (allowed.Count() !== set.Count())
      throw new Error("InsertItemSet filter path requires native HTML target-attribute ranges");
    characters.PutSet(set);
    other.PutSet(set);
    let changed = false;
    if (characters.Count()) {
      if (
        !(mode & SetAttrMode.DONTREPLACE) &&
        node.GetpSwpHints()?.Count() &&
        offset === 0 &&
        offset === node.Len()
      )
        node.RstTextAttr(0, node.Len(), 0, characters);
      const history = new SwRegHistory(node, node);
      try {
        changed = history.InsertItems(characters, offset, offset, mode);
      } finally {
        history.Dispose();
      }
      const marker = node.GetSwAttrSet().GetItemIfSet(H.RES_PARATR_LIST_AUTOFMT, true);
      if (changed && offset === node.Len() && marker instanceof SwFormatAutoFormat) {
        const old = marker.GetStyleHandle();
        if (!old) throw new Error("assert(paragraph marker automatic style)");
        const copy = old.Clone();
        try {
          copy.PutSet(characters);
          const handle = doc
            .GetIStyleAccess()
            .getAutomaticStyle(copy, SwAutoStyleFamily.AUTO_STYLE_CHAR);
          const item = new SwFormatAutoFormat(handle, H.RES_PARATR_LIST_AUTOFMT);
          releaseStyleHandle(handle);
          try {
            node.SetAttr(item);
          } finally {
            item.Dispose();
          }
        } finally {
          copy.Dispose();
        }
      }
    }
    if (other.Count()) changed = node.SetAttr(other) || changed;
    if (changed) doc.NotifyModelChange({ kind: "document-modified", modified: true });
  } finally {
    allowed.Dispose();
    characters.Dispose();
    other.Dispose();
  }
}
