/** @fileoverview Native no-undo boundary InsertItemSet profile used by HTML target snapshots, with actual sets, marks and automatic-style handles. */
import { expect, it, assert } from "vitest";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { XATTR_FILLSTYLE } from "../../../../svx/inc/xdef";
import { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import { SwDoc } from "./doc";
import { SwPosition, SwPaM } from "../crsr/pam";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT, RES_UL_SPACE, RES_PARATR_LIST_AUTOFMT } from "../../../inc/hintids";
import { SwFormatAutoFormat } from "../txtnode/fmtatr2";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { releaseStyleHandle } from "../../../../svl/source/items/stylepool";
import { projectWriterTextRuns } from "../txtnode/ndtxt";
/** Supplies genuine collapsed boundary, recording policy and item owners. @param run - Original operation observations. @param text - Existing native string. @returns Nothing. */
function withNode(run: (doc: SwDoc, pam: SwPaM, set: SfxItemSet) => void, text = "AB"): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText(text);
  const position = new SwPosition(node, text.length),
    pam = new SwPaM(position);
  position.Dispose();
  doc.GetUndoManager().DoUndo(false);
  const set = new SfxItemSet(doc.GetAttrPool(), [
    [RES_CHRATR_WEIGHT, RES_CHRATR_WEIGHT],
    [RES_UL_SPACE, RES_UL_SPACE],
  ]);
  try {
    run(doc, pam, set);
  } finally {
    set.Dispose();
    pam.Dispose();
    doc.Dispose();
  }
}
it("applies a boundary character set and paragraph items through actual native owners", /** At paragraph end the original range stays collapsed; later insertion expands that native empty hint. @returns Nothing. */ () => {
  withNode(
    /** Supplies an actual pooled delta then uses native InsertString expansion. @param doc - Native graph. @param pam - Native cursor. @param set - Actual item set. @returns Nothing. */ (
      doc,
      pam,
      set,
    ) => {
      set.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
      set.Put(new SvxULSpaceItem(10, 20, RES_UL_SPACE));
      doc.GetDocumentContentOperationsManager().InsertItemSet(pam, set);
      doc.GetDocumentContentOperationsManager().InsertString(pam, "X");
      const node = doc.paragraphs[0];
      assert(node);
      expect((node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(20);
      expect(
        projectWriterTextRuns(node).map(
          /** Reads real formatting runs. @param run - Native projection. @returns Text and weight. */ (
            run,
          ) => [run.text, run.attributes.bold],
        ),
      ).toEqual([
        ["AB", false],
        ["X", true],
      ]);
    },
  );
});
it("updates an existing paragraph-marker automatic style at the same native end boundary", /** Shared style handles come from the actual document pool and are released using their native ownership contract. @returns Nothing. */ () => {
  withNode(
    /** Installs a real paragraph marker item, not a projected label format. @param doc - Graph. @param pam - Cursor. @param set - Target items. @returns Nothing. */ (
      doc,
      pam,
      set,
    ) => {
      const node = doc.paragraphs[0];
      assert(node);
      const old = new SfxItemSet(doc.GetAttrPool(), [[RES_CHRATR_WEIGHT, RES_CHRATR_WEIGHT]]);
      old.Put(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
      const handle = doc
          .GetIStyleAccess()
          .getAutomaticStyle(old, SwAutoStyleFamily.AUTO_STYLE_CHAR),
        item = new SwFormatAutoFormat(handle, RES_PARATR_LIST_AUTOFMT);
      releaseStyleHandle(handle);
      try {
        node.SetAttr(item);
      } finally {
        item.Dispose();
        old.Dispose();
      }
      set.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
      doc.GetDocumentContentOperationsManager().InsertItemSet(pam, set);
      const marker = node.GetAttr(RES_PARATR_LIST_AUTOFMT);
      assert(marker instanceof SwFormatAutoFormat);
      const style = marker.GetStyleHandle();
      assert(style);
      expect((style.Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetValue()).toBe(
        FontWeight.WEIGHT_BOLD,
      );
    },
  );
});
it("rejects unsupported editing and word-interior profiles before applying a filter delta", /** No native break iterator, editing history or mark operation is faked for an unconsumed caller. @returns Nothing. */ () => {
  withNode(
    /** Uses real native preconditions and observes the unchanged graph. @param doc - Graph. @param pam - Cursor. @param set - Actual item set. @returns Nothing. */ (
      doc,
      pam,
      set,
    ) => {
      set.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
      doc.GetUndoManager().DoUndo(true);
      expect(
        /** Calls a non-filter recording profile. @returns Nothing. */ () =>
          doc.GetDocumentContentOperationsManager().InsertItemSet(pam, set),
      ).toThrow("disabled undo");
      doc.GetUndoManager().DoUndo(false);
      pam.GetPoint().SetContent(1);
      expect(
        /** Calls a real word-interior position without a word service substitution. @returns Nothing. */ () =>
          doc.GetDocumentContentOperationsManager().InsertItemSet(pam, set),
      ).toThrow("paragraph boundary");
      const node = doc.paragraphs[0];
      assert(node);
      expect(node.GetText()).toBe("AB");
      expect(node.GetpSwpHints()).toBeUndefined();
      expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_CHRATR_WEIGHT, false)).toBeUndefined();
    },
  );
});

it("applies a drawing fill set to the source range's partial first and final paragraphs", /** Uses actual point and mark ownership and the native whole-paragraph OtherSet path. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    doc.GetUndoManager().DoUndo(false);
    const first = doc.paragraphs[0];
    assert(first);
    first.SetText("First");
    const last = doc.nodes.MakeTextNode("Last");
    const tail = doc.nodes.MakeTextNode("Tail");
    const point = new SwPosition(last, 0);
    const mark = new SwPosition(first, 3);
    const range = new SwPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    const fill = new SfxItemSet(doc.GetAttrPool(), [[XATTR_FILLSTYLE, XATTR_FILLSTYLE]]);
    const item = new XFillStyleItem(FillStyle.SOLID);
    try {
      fill.Put(item);
      doc.GetDocumentContentOperationsManager().InsertItemSet(range, fill);
      expect((first.GetAttr(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(FillStyle.SOLID);
      expect((last.GetAttr(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(FillStyle.SOLID);
      expect((tail.GetAttr(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(FillStyle.NONE);
    } finally {
      item.Dispose();
      fill.Dispose();
      range.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});
