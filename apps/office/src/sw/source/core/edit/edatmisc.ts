/** @fileoverview Consumed SwEditShell::SetAttrSet character path from edatmisc.cxx using existing native fragment history; readonly, generic paragraph and auto-update services remain unrepresented. */
import { SwEditShell as SwAttributeEditShell } from "./edattr";
import type { SfxItemSet } from "../../../../svl/inc/itemset";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SwUndoAttr } from "../undo/unattr";
import type { SwUndoRedoContext } from "../undo/undobj";
import { getWriterSelectedTextRanges } from "../crsr/pam";
import { setCharacterItems } from "../txtnode/ndhints-font";
/** Character item edits remain in the native editing-shell core. */
export abstract class SwEditShell extends SwAttributeEditShell {
  /** Applies complete request items through original node/hint/history owners. @param items - Native character request. @returns Whether selected content changed; caret typing state is updated independently. */
  public SetAttrSet(items: SfxItemSet): boolean {
    const before = this.CaptureCursorState();
    const pending = this.GetPendingCharacterItems().Clone();
    pending.PutSet(items);
    this.SetPendingCharacterItems(pending);
    const ranges = getWriterSelectedTextRanges(this.GetCursor());
    if (ranges === undefined || ranges.length === 0) {
      this.GetDoc().GetUndoManager().BreakUndoGrouping();
      this.NotifySelectionChanged();
      return false;
    }
    const actions: SwUndoAttr[] = [];
    for (const range of ranges) {
      const original = range.node.CaptureTextFragment(range.start, range.end);
      const replacement = {
        text: original.text,
        hints: setCharacterItems(
          original.hints,
          this.GetDoc().GetAttrPool(),
          original.text.length,
          0,
          original.text.length,
          items.entries(),
          range.node.GetSwAttrSet(),
        ),
      };
      if (!original.hints.equals(replacement.hints))
        actions.push(
          new SwUndoAttr(
            range.node,
            range.start,
            original,
            replacement,
            before,
            this.CaptureCursorState(),
          ),
        );
    }
    if (actions.length === 0) return false;
    if (actions.length === 1) return this.ApplyAction(actions[0] as SwUndoAttr);
    const action = new SfxListUndoAction<SwUndoRedoContext>("Character Formatting");
    for (const child of actions) action.AddAction(child);
    return this.ApplyAction(action);
  }
}
