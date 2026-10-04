/** @fileoverview Checks native fresh automatic hint flags versus retained flags through actual text reset and Writer command/history owners. */
import { afterEach, describe, expect, it } from "vitest";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SvxWeightItem, SvxPostureItem } from "../../../../editeng/source/items/textitem";
import { SfxViewFrame } from "../../../../sfx2/source/view/viewfrm";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwView } from "../../uibase/uiview/view";
import { SwpHints } from "./ndhints";
import { SwTextAttrEnd, SwFormatAutoFormat } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
import { resetParagraphTextAttributes } from "./txtedt";
const views: SwView[] = [];
afterEach(
  /** Releases real view owners. @returns Nothing. */ () => {
    for (const view of views.splice(0)) view.Close();
  },
);
/** Requires an actual owner. @param value - Optional value. @returns Owned value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing replacement owner");
  return value;
}
/** Reads independently registered flags. @param hint - Real hint. @returns Literal flag tuple. */
function flags(hint: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>): boolean[] {
  return [hint.dontExpand, hint.dontExpandStart, hint.dontMoveAttr];
}
/** Builds actual node with concrete automatic items and an independent internet hint. @param mask - Three source flags. @param start - Hint start. @param end - Hint end. @returns Real model owners. */
function fixture(mask: number, start = 2, end = 5) {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("FreshHintText");
  const items = new SfxItemSet(doc.GetAttrPool(), [[1, 15]]);
  items.Put(new SvxWeightItem(8, 15));
  items.Put(new SvxPostureItem(2, 11));
  const auto = new SwTextAttrEnd(new SwFormatAutoFormat(items), start, end);
  auto.dontExpand = (mask & 1) !== 0;
  auto.dontExpandStart = (mask & 2) !== 0;
  auto.dontMoveAttr = (mask & 4) !== 0;
  const link = new SwTextAttrEnd(
    new SwFormatINetFormat({
      url: "https://example.test/fresh",
      targetFrame: "_blank",
      name: "Fresh",
    }),
    start,
    end,
  );
  link.dontExpand = link.dontExpandStart = link.dontMoveAttr = true;
  node.SetTextHints(new SwpHints(doc.GetAttrPool(), [auto, link]));
  return { doc, node, auto, link };
}

describe("native fresh selective automatic hint flags", /** Groups actual model and history evidence. @returns Nothing. */ () => {
  for (const kind of ["replace", "retain", "delete"])
    it.each([0, 1, 2, 3, 4, 5, 6, 7])(
      "uses native " + kind + " flag ownership for mask %s",
      /** Checks all registered flags and original ownership. @param mask - Independent source flags. @returns Nothing. */ (
        mask,
      ) => {
        const f = fixture(mask),
          owned = required(f.node.GetpSwpHints()),
          original = owned.Get(1),
          reset = new SfxItemSet(f.doc.GetAttrPool(), [[1, 54]]);
        if (kind === "replace") reset.Put(new SvxWeightItem(5, 15));
        if (kind === "delete")
          reset.Put(new SwFormatAutoFormat(new SfxItemSet(f.doc.GetAttrPool(), [[1, 15]])));
        resetParagraphTextAttributes(f.node, false, reset);
        const remaining = required(f.node.GetpSwpHints());
        expect(flags(original)).toEqual(flags(f.auto));
        expect(
          (original.format as SwFormatAutoFormat).GetStyleHandle().GetItemState(15, false),
        ).toBe(SfxItemState.SET);
        expect(remaining.Get(0).format.equals(f.link.format)).toBe(true);
        expect(flags(remaining.Get(0))).toEqual([true, true, true]);
        if (kind === "delete") {
          expect(remaining.Count()).toBe(1);
          expect(remaining.Get(0).Which()).toBe(54);
        } else {
          expect(remaining.Count()).toBe(2);
          expect(remaining.Get(1)).toMatchObject({ start: 2, end: 5 });
          expect(flags(remaining.Get(1))).toEqual(
            kind === "replace" ? [false, false, false] : flags(f.auto),
          );
          const style = (remaining.Get(1).format as SwFormatAutoFormat).GetStyleHandle();
          expect(style.GetItemState(11, false)).toBe(SfxItemState.SET);
          expect(style.GetItemState(15, false)).toBe(
            kind === "replace" ? SfxItemState.DEFAULT : SfxItemState.SET,
          );
          if (kind === "retain") expect(remaining).toBe(owned);
          else expect(remaining.Get(1)).not.toBe(original);
        }
      },
    );
  it.each([0, 1, 2, 3, 4, 5, 6, 7])(
    "retains partial exact-reset flags for mask %s",
    /** Checks exact branch does not manufacture a replacement. @param mask - Independent source flags. @returns Nothing. */ (
      mask,
    ) => {
      const f = fixture(mask),
        owned = f.node.GetpSwpHints(),
        reset = new SfxItemSet(f.doc.GetAttrPool(), [[1, 54]]);
      reset.Put(new SvxWeightItem(5, 15));
      resetParagraphTextAttributes(f.node, true, reset);
      expect(f.node.GetpSwpHints()).toBe(owned);
      expect(flags(required(f.node.GetpSwpHints()).Get(1))).toEqual(flags(f.auto));
    },
  );
  it.each([0, 1, 2, 3, 4, 5, 6, 7])(
    "restores original flags on actual Ctrl StyleApply undo for mask %s",
    /** Checks fresh replacement and paired native redo lifecycle. @param mask - Independent source flags. @returns Nothing. */ (
      mask,
    ) => {
      const f = fixture(mask);
      f.doc.MakeTextFormatColl("Fresh target", f.doc.GetDfltTextFormatColl(), "FreshTarget");
      const owner = new SwDocShell(
        f.doc,
        createDocument({ id: "fresh-hints", title: "Fresh", suiteId: "writer" }),
      );
      const view = new SwView(owner),
        frame = new SfxViewFrame<SwView>();
      views.push(view);
      view.AttachFrame(frame);
      frame.SetActiveView(view, [
        owner.GetCommandShell(),
        view.GetCommandShell(),
        view.GetWrtShell().GetCommandShell(),
      ]);
      const shell = view.GetWrtShell();
      shell.SetPaM(new SwPosition(f.node, 4), new SwPosition(f.node, 1));
      frame
        .GetDispatcher()
        .Execute(".uno:StyleApply", { Template: "Fresh target", Family: 2, KeyModifier: 8192 });
      const initial = required(f.node.GetpSwpHints());
      expect(initial.Count()).toBe(1);
      expect(initial.Get(0).Which()).toBe(54);
      expect(flags(initial.Get(0))).toEqual([true, true, true]);
      expect(owner.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        const restored = required(f.node.GetpSwpHints());
        expect(flags(restored.Get(1))).toEqual(flags(f.auto));
        expect(flags(restored.Get(0))).toEqual([true, true, true]);
        expect(
          (restored.Get(1).format as SwFormatAutoFormat).GetStyleHandle().GetItemState(15, false),
        ).toBe(SfxItemState.SET);
        expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(4);
        expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(1);
        expect(shell.Redo()).toBe(true);
        expect(f.node.GetpSwpHints()).toBeUndefined();
        expect(f.node.GetParagraphStyle()).toBe("FreshTarget");
        expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(f.node.Len());
        expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
      }
    },
  );
});
