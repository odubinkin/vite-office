/** @fileoverview Original ImpEditEngine paragraph attribute assignment over real item sets and edit undo. */
import { SfxItemSet, SfxItemState } from "../../../svl/source/items/itemset";
import {
  EE_CHAR_END,
  EE_CHAR_LANGUAGE,
  EE_CHAR_LANGUAGE_CJK,
  EE_CHAR_LANGUAGE_CTL,
  EE_ITEMS_START,
  EE_PARA_END,
} from "../../inc/eeitem";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { EditSelection } from "../../inc/EditSelection";
import { FindAttribs } from "./editdoc.attributes";
import { EditUndoSetParaAttribs } from "./editundo";
import type { ImpEditEngine } from "./impedit.lifecycle";

/** Original paragraph assignment, retaining source item-pool normalization and notification order. @param engine - Actual engine. @param paragraph - Native paragraph index. @param source - Native item set. @returns Nothing. */
export function SetParaAttribs(engine: ImpEditEngine, paragraph: number, source: SfxItemSet): void {
  const document = engine.GetEditDoc();
  const node = document.GetObject(paragraph);
  if (node === null) return;
  const attributes = node.GetContentAttribs().GetItems();
  if (attributes === source) return;
  const status = engine.GetStatus();
  if (engine.IsUndoEnabled() && !engine.IsInUndo() && status.DoUndoAttribs()) {
    if (source.GetPool() !== document.GetItemPool()) {
      const local = new SfxItemSet(engine.GetEmptyItemSet());
      try {
        local.PutSet(source);
        engine.InsertUndo(
          new EditUndoSetParaAttribs(engine.GetEditEnginePtr(), paragraph, attributes, local),
        );
      } finally {
        local.Dispose();
      }
    } else
      engine.InsertUndo(
        new EditUndoSetParaAttribs(engine.GetEditEnginePtr(), paragraph, attributes, source),
      );
  }
  attributes.Set(source);
  const wrongs = node.GetWrongList();
  if (
    wrongs !== null &&
    (source.GetItemState(EE_CHAR_LANGUAGE) === SfxItemState.SET ||
      source.GetItemState(EE_CHAR_LANGUAGE_CJK) === SfxItemState.SET ||
      source.GetItemState(EE_CHAR_LANGUAGE_CTL) === SfxItemState.SET)
  )
    wrongs.ResetInvalidRange(0n, BigInt(node.Len()));
  if (status.UseCharAttribs()) node.CreateDefFont();
  engine.ParaAttribsChanged(node);
}

/** Reads the native EditEngine All attribute set for a selection. @param engine - Actual engine. @param selection - Actual selection. @returns Owned effective item set. */
export function GetAttribs(engine: ImpEditEngine, selection: EditSelection): SfxItemSet {
  const document = engine.GetEditDoc();
  const range = new EditSelection(selection);
  range.Adjust(document);
  const result = new SfxItemSet(engine.GetEmptyItemSet());
  const first = document.GetPos(range.Min().GetNode());
  const last = document.GetPos(range.Max().GetNode());
  for (let index = first; index <= last; index++) {
    const node = document.GetObject(index);
    if (!node) continue;
    const start = index === first ? range.Min().GetIndex() : 0;
    const end = index === last ? range.Max().GetIndex() : node.Len();
    FindAttribs(node, start, end, result);
    for (let which = EE_ITEMS_START; which <= EE_CHAR_END; which++) {
      const state = result.GetItemState(which);
      if (state === SfxItemState.DEFAULT) result.Put(node.GetContentAttribs().GetItem(which));
      else if (
        state === SfxItemState.SET &&
        which <= EE_PARA_END &&
        !SfxPoolItem.areSame(result.Get(which), node.GetContentAttribs().GetItem(which))
      )
        result.InvalidateItem(which);
    }
  }
  for (let which = EE_ITEMS_START; which <= EE_CHAR_END; which++)
    if (result.GetItemState(which) === SfxItemState.DEFAULT)
      result.Put(document.GetItemPool().GetUserOrPoolDefaultItem(which));
  return result;
}
