/** @fileoverview Checks selective RstTextAttr states, no-op ownership and exact precedence through real Writer model and command owners. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SvxWeightItem, SvxPostureItem } from "../../../../editeng/source/items/textitem";
import { SfxViewFrame } from "../../../../sfx2/source/view/viewfrm";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwView } from "../../uibase/uiview/view";
import { SwpHints } from "./ndhints";
import { SwFormatAutoFormat, SwTextAttr } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
import { resetParagraphTextAttributes } from "./txtedt";

const views: SwView[] = [];
afterEach(
  /** Releases real view owners and spies. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const view of views.splice(0)) view.Close();
  },
);
/** Requires an actual model owner. @param value - Optional model value. @returns Defined value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing selective reset owner");
  return value;
}
/** Creates a real node, item sets and two independently ranged hints. @returns Native model owners. */
function fixture() {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("SelectiveText");
  const style = new SfxItemSet(doc.GetAttrPool(), [[1, 54]]);
  const reset = new SfxItemSet(doc.GetAttrPool(), [[1, 54]]);
  const link = new SwTextAttr(
    new SwFormatINetFormat({
      url: "https://example.test/selective",
      targetFrame: "_blank",
      name: "selective",
    }),
    2,
    5,
  );
  link.dontExpand = link.dontExpandStart = link.dontMoveAttr = true;
  return { doc, node, style, reset, link };
}
/** Installs an automatic style and independent link. @param owners - Fixture owners. @param start - Auto start. @param end - Auto end. @returns Nothing. */
function install(owners: ReturnType<typeof fixture>, start = 2, end = 5): void {
  const auto = new SwTextAttr(new SwFormatAutoFormat(owners.style), start, end);
  auto.dontExpand = auto.dontExpandStart = auto.dontMoveAttr = true;
  owners.node.SetTextHints(new SwpHints(owners.doc.GetAttrPool(), [auto, owners.link]));
}
/** Requires the remaining automatic style. @param node - Text node. @returns Direct style set. */
function automatic(node: ReturnType<typeof fixture>["node"]): SfxItemSet {
  return (required(node.GetpSwpHints()).Get(0).format as SwFormatAutoFormat).GetStyleHandle();
}

describe("native selective text hint reset", /** Tests registered native decisions independently. @returns Nothing. */ () => {
  it.each(["INVALID", "DISABLED", "inherited", "default", "unrelated", "empty"])(
    "keeps %s hints owned without notification or style cloning",
    /** Checks no common direct SET. @param kind - Independent state fixture. @returns Nothing. */ (
      kind,
    ) => {
      const f = fixture();
      f.style.Put(new SvxPostureItem(2, 11));
      if (kind === "INVALID") f.style.InvalidateItem(15);
      if (kind === "DISABLED") f.style.DisableItem(15);
      if (kind === "inherited") {
        const parent = new SfxItemSet(f.doc.GetAttrPool(), [[1, 54]]);
        parent.Put(new SvxWeightItem(8, 15));
        f.style.SetParent(parent);
      }
      if (kind !== "empty") f.reset.Put(new SvxWeightItem(5, 15));
      install(f);
      const owned = f.node.GetpSwpHints(),
        before = automatic(f.node);
      const state = before.GetItemState(15, false);
      const clone = vi.spyOn(before, "Clone");
      const notify = vi.spyOn(f.doc, "NotifyModelChange");
      resetParagraphTextAttributes(f.node, false, f.reset);
      expect(f.node.GetpSwpHints()).toBe(owned);
      expect(automatic(f.node)).toBe(before);
      expect(automatic(f.node).GetItemState(15, false)).toBe(state);
      expect(clone).not.toHaveBeenCalled();
      expect(notify).not.toHaveBeenCalled();
    },
  );
  it.each([SfxItemState.INVALID, SfxItemState.DISABLED])(
    "removes SET while retaining state marker %s and independent hint",
    /** Checks mixed automatic style state. @param marker - Native state. @returns Nothing. */ (
      marker,
    ) => {
      const f = fixture();
      f.style.Put(new SvxPostureItem(2, 11));
      if (marker === SfxItemState.INVALID) f.style.InvalidateItem(15);
      else f.style.DisableItem(15);
      f.reset.Put(new SvxPostureItem(0, 11));
      f.reset.Put(new SvxWeightItem(5, 15));
      install(f);
      const original = automatic(f.node);
      const notify = vi.spyOn(f.doc, "NotifyModelChange");
      resetParagraphTextAttributes(f.node, false, f.reset);
      expect(automatic(f.node).Count()).toBe(1);
      expect(automatic(f.node).GetItemState(15, false)).toBe(marker);
      expect(automatic(f.node).GetItemState(11, false)).toBe(SfxItemState.DEFAULT);
      expect(original.Count()).toBe(2);
      expect(original.GetItemState(11, false)).toBe(SfxItemState.SET);
      expect(required(f.node.GetpSwpHints()).Get(0)).toMatchObject({
        start: 2,
        end: 5,
        dontExpand: false,
        dontExpandStart: false,
        dontMoveAttr: false,
      });
      expect(required(f.node.GetpSwpHints()).Get(1).format.equals(f.link.format)).toBe(true);
      expect(notify).toHaveBeenCalledTimes(1);
      notify.mockClear();
      const owned = f.node.GetpSwpHints();
      resetParagraphTextAttributes(f.node, false, f.reset);
      expect(f.node.GetpSwpHints()).toBe(owned);
      expect(notify).not.toHaveBeenCalled();
    },
  );
  it("deletes all common values regardless of their reset values", /** Checks multiple common SET and empty result. @returns Nothing. */ () => {
    const f = fixture();
    f.style.Put(new SvxWeightItem(8, 15));
    f.style.Put(new SvxPostureItem(2, 11));
    f.reset.Put(new SvxWeightItem(5, 15));
    f.reset.Put(new SvxPostureItem(0, 11));
    install(f);
    resetParagraphTextAttributes(f.node, false, f.reset);
    expect(required(f.node.GetpSwpHints()).Count()).toBe(1);
    expect(required(f.node.GetpSwpHints()).Get(0).Which()).toBe(54);
  });
  it("keeps a pure internet hint without notification", /** Checks no automatic style. @returns Nothing. */ () => {
    const f = fixture();
    f.reset.Put(new SvxWeightItem(5, 15));
    f.node.SetTextHints(new SwpHints(f.doc.GetAttrPool(), [f.link]));
    const owned = f.node.GetpSwpHints(),
      notify = vi.spyOn(f.doc, "NotifyModelChange");
    resetParagraphTextAttributes(f.node, false, f.reset);
    expect(f.node.GetpSwpHints()).toBe(owned);
    expect(notify).not.toHaveBeenCalled();
  });
  it.each([53, 54])(
    "deletes a direct SET hint at WhichId %s",
    /** Checks direct hint deletion independent of nested values. @param which - Native hint identity. @returns Nothing. */ (
      which,
    ) => {
      const f = fixture();
      f.style.InvalidateItem(15);
      install(f);
      f.reset.Put(which === 53 ? new SwFormatAutoFormat(f.style) : f.link.format);
      resetParagraphTextAttributes(f.node, false, f.reset);
      expect(required(f.node.GetpSwpHints()).Count()).toBe(1);
      expect(required(f.node.GetpSwpHints()).Get(0).Which()).toBe(which === 53 ? 54 : 53);
    },
  );
  it.each([SfxItemState.INVALID, SfxItemState.DISABLED, SfxItemState.SET])(
    "ignores non-direct deletion-set state %s",
    /** Checks deletion set state and parent isolation. @param state - Reset state. @returns Nothing. */ (
      state,
    ) => {
      const f = fixture();
      f.style.Put(new SvxWeightItem(8, 15));
      install(f);
      if (state === SfxItemState.INVALID) {
        f.reset.InvalidateItem(15);
        f.reset.InvalidateItem(53);
        f.reset.InvalidateItem(54);
      } else if (state === SfxItemState.DISABLED) {
        f.reset.DisableItem(15);
        f.reset.DisableItem(53);
        f.reset.DisableItem(54);
      } else {
        const parent = new SfxItemSet(f.doc.GetAttrPool(), [[1, 54]]);
        parent.Put(new SvxWeightItem(5, 15));
        parent.Put(f.link.format);
        parent.Put(new SwFormatAutoFormat(f.style));
        f.reset.SetParent(parent);
      }
      const owned = f.node.GetpSwpHints(),
        notify = vi.spyOn(f.doc, "NotifyModelChange");
      resetParagraphTextAttributes(f.node, false, f.reset);
      expect(f.node.GetpSwpHints()).toBe(owned);
      expect(notify).not.toHaveBeenCalled();
    },
  );
  it.each(["whole", "prefix", "suffix", "middle"])(
    "uses exact %s range independently of the deletion set",
    /** Checks exact branch precedence. @param range - Hint range kind. @returns Nothing. */ (
      range,
    ) => {
      const f = fixture();
      f.style.Put(new SvxWeightItem(8, 15));
      f.reset.Put(new SwFormatAutoFormat(f.style));
      f.reset.Put(f.link.format);
      install(
        f,
        range === "whole" || range === "prefix" ? 0 : 2,
        range === "whole" || range === "suffix" ? f.node.Len() : 5,
      );
      const owned = f.node.GetpSwpHints(),
        notify = vi.spyOn(f.doc, "NotifyModelChange");
      resetParagraphTextAttributes(f.node, true, f.reset);
      expect(required(f.node.GetpSwpHints()).Count()).toBe(range === "whole" ? 1 : 2);
      expect(required(f.node.GetpSwpHints()).entries().at(-1)?.Which()).toBe(54);
      if (range !== "whole") {
        expect(f.node.GetpSwpHints()).toBe(owned);
        expect(notify).not.toHaveBeenCalled();
      } else expect(notify).toHaveBeenCalledTimes(1);
    },
  );
  it("keeps direct state markers through initial Ctrl style and repeated native history cycles", /** Checks actual frame command and paired undo owners. @returns Nothing. */ () => {
    const f = fixture();
    f.style.InvalidateItem(15);
    f.style.DisableItem(11);
    install(f);
    f.doc.MakeTextFormatColl("Selective target", f.doc.GetDfltTextFormatColl(), "SelectiveTarget");
    const owner = new SwDocShell(
      f.doc,
      createDocument({ id: "selective", title: "Selective", suiteId: "writer" }),
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
      .Execute(".uno:StyleApply", { Template: "Selective target", Family: 2, KeyModifier: 8192 });
    expect(f.node.GetParagraphStyle()).toBe("SelectiveTarget");
    expect(automatic(f.node).GetItemState(15, false)).toBe(SfxItemState.INVALID);
    expect(automatic(f.node).GetItemState(11, false)).toBe(SfxItemState.DISABLED);
    expect(required(f.node.GetpSwpHints()).Count()).toBe(2);
    expect(owner.GetUndoManager().GetUndoActionCount()).toBe(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(f.node.GetParagraphStyle()).toBe("default");
      expect(automatic(f.node).Count()).toBe(2);
      expect(automatic(f.node).GetItemState(15, false)).toBe(SfxItemState.INVALID);
      expect(automatic(f.node).GetItemState(11, false)).toBe(SfxItemState.DISABLED);
      expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(4);
      expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(1);
      expect(shell.Redo()).toBe(true);
      expect(f.node.GetpSwpHints()).toBeUndefined();
      expect(f.node.GetParagraphStyle()).toBe("SelectiveTarget");
      expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(f.node.Len());
      expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
    }
  });
});
