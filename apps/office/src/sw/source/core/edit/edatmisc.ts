/** @fileoverview Consumed SwEditShell::SetAttrSet character path from edatmisc.cxx using existing native fragment history; readonly, generic paragraph and auto-update services remain unrepresented. */
import { SwEditShell as SwAttributeEditShell } from "./edattr";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SwUndoAttr } from "../undo/unattr";
import type { SwUndoRedoContext } from "../undo/undobj";
import { SwTextNode } from "../txtnode/ndtxt";
import type { WriterTextRange, SwPaM } from "../crsr/pam";
import { SetAttrMode } from "../../../inc/swtypes";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import { SwpHints } from "../txtnode/ndhints";
import { SwFormatAutoFormat } from "../txtnode/txatbase";
import { MakeTextAttr } from "../txtnode/thints";
import { setCharacterItems } from "../txtnode/ndhints-font";
/** Character item edits remain in the native editing-shell core. */
export abstract class SwEditShell extends SwAttributeEditShell {
  /** Applies complete request items through original node/hint/history owners. @param items - Native character request. @param mode - Consumed DEFAULT mode. @param pam - Original optional explicit range, independent from the live cursor. @returns Whether selected content changed; caret typing state is updated independently. */
  public SetAttrSet(items: SfxItemSet, mode = SetAttrMode.DEFAULT, pam?: SwPaM): boolean {
    if (mode !== SetAttrMode.DEFAULT)
      throw new Error("Character SetAttrSet mode is not implemented.");
    const before = this.CaptureCursorState();
    const pending = this.GetPendingCharacterItems().Clone();
    pending.PutSet(items);
    this.SetPendingCharacterItems(pending);
    const cursor = pam ?? this.GetCursor();
    if (!cursor.HasMark() && !cursor.IsMultiSelection()) {
      this.GetDoc().GetUndoManager().BreakUndoGrouping();
      this.NotifySelectionChanged();
      return false;
    }
    const ranges: WriterTextRange[] = [];
    for (const current of cursor.GetRingContainer()) {
      if (
        !current.HasMark() ||
        (cursor.IsMultiSelection() &&
          !this.IsTableMode() &&
          current.Start().compare(current.End()) === 0)
      )
        continue;
      const start = current.Start(),
        end = current.End();
      for (let index = start.GetNodeIndex(); index <= end.GetNodeIndex(); index++) {
        const node = this.GetDoc().GetNodes().at(index);
        if (node instanceof SwTextNode)
          ranges.push({
            node,
            start: index === start.GetNodeIndex() ? start.GetContentIndex() : 0,
            end: index === end.GetNodeIndex() ? end.GetContentIndex() : node.Len(),
          });
      }
    }
    const actions: SwUndoAttr[] = [];
    for (const range of ranges) {
      const original =
        range.start === range.end
          ? { text: "", hints: new SwpHints(this.GetDoc().GetAttrPool()) }
          : range.node.CaptureTextFragment(range.start, range.end);
      if (range.start === range.end)
        for (const hint of range.node.GetpSwpHints()?.entries() ?? []) {
          if (hint.GetStart() !== range.start || hint.GetEnd() !== range.end) continue;
          const copy = hint.clone();
          copy.SetStart(0);
          copy.SetEnd(0);
          original.hints.Insert(copy);
        }
      const collapsed = new SfxItemSet(this.GetDoc().GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
      if (range.start === range.end) {
        for (const hint of original.hints.entries())
          if (hint.format instanceof SwFormatAutoFormat)
            collapsed.PutSet(hint.format.GetStyleHandle());
        collapsed.PutSet(items);
      }
      const replacement = {
        text: original.text,
        hints:
          range.start === range.end
            ? new SwpHints(this.GetDoc().GetAttrPool())
            : setCharacterItems(
                original.hints,
                this.GetDoc().GetAttrPool(),
                original.text.length,
                0,
                original.text.length,
                items.entries(),
                range.node.GetSwAttrSet(),
              ),
      };
      if (range.start === range.end) {
        for (const hint of original.hints.entries())
          if (!(hint.format instanceof SwFormatAutoFormat)) replacement.hints.Insert(hint.clone());
        replacement.hints.Insert(MakeTextAttr(this.GetDoc(), collapsed, 0, 0));
      }
      try {
        actions.push(
          new SwUndoAttr(
            range.node,
            range.start,
            original,
            replacement,
            before,
            this.CaptureCursorState(),
            range.start === 0 &&
              range.end === range.node.Len() &&
              !(
                range.node
                  .GetpSwpHints()
                  ?.entries()
                  .some(
                    /** Native full-node SetAttr uses hints when an actual character format is present. @param hint - Original hint. @returns Native flag. */
                    (hint) => hint.IsCharFormatAttr(),
                  ) ?? false
              )
              ? items
              : undefined,
          ),
        );
      } finally {
        original.hints.Dispose();
        replacement.hints.Dispose();
        collapsed.Dispose();
      }
    }
    if (actions.length === 0) return false;
    if (actions.length === 1) {
      const action = actions[0] as SwUndoAttr;
      return this.ApplyAction(
        action,
        false,
        /** Initial native mutation leaves original cursor owners in place. @returns Nothing. */
        () => action.ApplyExact(),
      );
    }
    const action = new SfxListUndoAction<SwUndoRedoContext>("Character Formatting");
    for (const child of actions) action.AddAction(child);
    return this.ApplyAction(
      action,
      false,
      /** Executes original per-range work before history navigation owns cursor restoration. @returns Nothing. */
      () => {
        for (const child of actions) child.ApplyExact();
      },
    );
  }
}
