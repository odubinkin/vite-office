/** @fileoverview Automatic-style usage follows actual undo history, fragment and disconnected-node ownership. */
import { assert, expect, it } from "vitest";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_CHRATR_FONT, WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { createWriterTextColorItem } from "../attr/swatrset";
import { SwDoc } from "../doc/doc";
import { MakeTextAttr } from "../txtnode/thints";
import { SwpHints } from "../txtnode/ndhints";
import { SwHistory } from "./rolbck";
import { createWriterInsertTextAction } from "../edit/editsh";
import { createWriterCollapsedCursorState, type SwUndoRedoContext } from "./undobj";
/** Actual authored native font set. @param doc - Owner. @param name - Family. @returns Owned input set. */
function fontSet(doc: SwDoc, name = "Undo Font"): SfxItemSet {
  const set = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  set.Put(
    new SvxFontItem(
      FontFamily.FAMILY_ROMAN,
      name,
      "",
      FontPitch.PITCH_VARIABLE,
      1,
      RES_CHRATR_FONT,
    ),
  );
  return set;
}
/** Reads the source font collector, including used automatic styles. @param doc - Actual document. @returns Font names. */
function names(doc: SwDoc): string[] {
  const result: string[] = [];
  doc.ForEachCharacterFontItem(RES_CHRATR_FONT, false, (font) => {
    result.push(font.GetFamilyName());
    return true;
  });
  return result;
}
it.each(["dispose", "rollback", "temporary"])(
  "releases native history-held styles through %s",
  (mode) => {
    const doc = new SwDoc(),
      history = new SwHistory();
    try {
      const node = doc.paragraphs[0];
      assert(node);
      node.SetText("A");
      const items = fontSet(doc),
        hint = MakeTextAttr(doc, items, 0, 1);
      items.Dispose();
      node.InsertHint(hint, SetAttrMode.NOHINTADJUST);
      history.AddTextAttr(hint, node.GetIndex(), false);
      node.ClearSwpHintsArr(true);
      expect(names(doc)).toEqual(["Undo Font"]);
      if (mode === "rollback") {
        history.Rollback(doc);
        expect(history.Count()).toBe(0);
      } else if (mode === "temporary") {
        history.TmpRollback(doc, 0);
        expect(history.Count()).toBe(1);
      }
      if (mode !== "dispose") {
        expect(names(doc)).toEqual(["Undo Font"]);
        node.ClearSwpHintsArr(true);
      }
      history.Dispose();
      expect(names(doc)).toEqual([]);
    } finally {
      history.Dispose();
      doc.Dispose();
    }
  },
);
it("moves unique history entries without keeping a reference in the source history", () => {
  const doc = new SwDoc(),
    source = new SwHistory(),
    target = new SwHistory();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("A");
    const items = fontSet(doc),
      hint = MakeTextAttr(doc, items, 0, 1);
    items.Dispose();
    node.InsertHint(hint, SetAttrMode.NOHINTADJUST);
    source.AddTextAttr(hint, node.GetIndex(), false);
    node.ClearSwpHintsArr(true);
    target.Move(0, source);
    source.Dispose();
    expect(names(doc)).toEqual(["Undo Font"]);
    target.Dispose();
    expect(names(doc)).toEqual([]);
  } finally {
    source.Dispose();
    target.Dispose();
    doc.Dispose();
  }
});
it.each([false, true])("clears insertion history after real redo and grouping=%s", (group) => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    const items = fontSet(doc),
      state = createWriterCollapsedCursorState(node, 0, items);
    const context: SwUndoRedoContext = { GetDoc: () => doc, RestoreCursor: () => {} };
    const first = createWriterInsertTextAction(node, 0, "A", items, "word", state, state);
    first.RedoWithContext(context);
    doc.GetUndoManager().AddUndoAction(first, true);
    if (group) {
      const second = createWriterInsertTextAction(node, 1, "B", items, "word", state, state);
      second.RedoWithContext(context);
      doc.GetUndoManager().AddUndoAction(second, true);
    }
    node.ClearSwpHintsArr(true);
    expect(names(doc)).toEqual(["Undo Font"]);
    doc.GetUndoManager().DelAllUndoObj();
    expect(names(doc)).toEqual([]);
    state.pendingCharacterItems.Dispose();
    items.Dispose();
  } finally {
    doc.Dispose();
  }
});
it.each([false, true])(
  "destroys retained undo-node resources only when disconnected, restored=%s",
  (restored) => {
    const doc = new SwDoc();
    try {
      const first = doc.paragraphs[0];
      assert(first);
      const node = doc.GetNodes().MakeTextNode("A"),
        items = fontSet(doc);
      node.InsertHint(MakeTextAttr(doc, items, 0, 1), SetAttrMode.NOHINTADJUST);
      items.Dispose();
      doc.GetNodes().removeTextNode(node);
      const storage = doc.GetUndoManager().GetUndoNodes(),
        id = storage.RetainNode(node);
      if (restored) doc.GetNodes().insertTextNodeAfter(first, node);
      storage.Release(id);
      expect(names(doc)).toEqual(restored ? ["Undo Font"] : []);
      if (restored) expect(node.GetpSwpHints()?.Count()).toBe(1);
    } finally {
      doc.Dispose();
    }
  },
);
it("does not leave temporary owners behind after slice, shift, concatenate and replacement", () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("ABC");
    const items = fontSet(doc);
    node.InsertHint(MakeTextAttr(doc, items, 0, 3), SetAttrMode.NOHINTADJUST);
    items.Dispose();
    const source = node.GetpSwpHints();
    assert(source);
    const slice = source.slice(0, 1),
      shifted = slice.shifted(1),
      concatenated = slice.concat(slice, 1),
      empty = new SwpHints(doc.GetAttrPool()),
      replaced = source.replaceRange(3, 1, 2, empty, 0);
    node.ClearSwpHintsArr(true);
    for (const owner of [slice, shifted, concatenated, empty, replaced]) owner.Dispose();
    expect(names(doc)).toEqual([]);
  } finally {
    doc.Dispose();
  }
});

it("releases styles retained by real selected shell formatting and undo", () => {
  const session = createWriterDocumentSession();
  try {
    const shell = session.view.GetWrtShell(),
      doc = shell.GetDoc(),
      node = doc.paragraphs[0];
    assert(node);
    node.SetText("ABCD");
    const items = fontSet(doc),
      point = new SwPosition(node, 3),
      mark = new SwPosition(node, 1);
    try {
      shell.SetPaM(point, mark);
      expect(shell.SetAttrSet(items)).toBe(true);
      expect(names(doc)).toContain("Undo Font");
      node.ClearSwpHintsArr(true);
      doc.GetUndoManager().DelAllUndoObj();
      expect(names(doc)).not.toContain("Undo Font");
    } finally {
      items.Dispose();
      point.Dispose();
      mark.Dispose();
    }
  } finally {
    session.Close();
  }
});
it("releases reduced automatic styles after a selective native attribute reset", () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    assert(node);
    node.SetText("ABC");
    const items = fontSet(doc),
      color = createWriterTextColorItem("#123456");
    items.Put(color);
    node.InsertHint(MakeTextAttr(doc, items, 0, 3), SetAttrMode.NOHINTADJUST);
    items.Dispose();
    node.RstTextAttr(1, 1, color.Which());
    expect(names(doc)).toContain("Undo Font");
    node.ClearSwpHintsArr(true);
    expect(names(doc)).toEqual([]);
  } finally {
    doc.Dispose();
  }
});
