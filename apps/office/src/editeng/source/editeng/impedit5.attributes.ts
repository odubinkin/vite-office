/** @fileoverview Original ImpEditEngine paragraph attribute assignment over real item sets and edit undo. */
import { SfxItemSet, SfxItemState } from "../../../svl/source/items/itemset";
import { EE_CHAR_LANGUAGE, EE_CHAR_LANGUAGE_CJK, EE_CHAR_LANGUAGE_CTL } from "../../inc/eeitem";
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
