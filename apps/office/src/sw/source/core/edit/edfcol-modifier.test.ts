/** @fileoverview Checks registered Ctrl StyleApply reset sets, native list decisions and distinct initial/redo history through real Writer owners. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { SfxInt16Item, SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxViewFrame } from "../../../../sfx2/source/view/viewfrm";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SvxFirstLineIndentItem } from "../../../../editeng/source/items/frmitems";
import { SvxWeightItem, SvxPostureItem } from "../../../../editeng/source/items/textitem";
import { SwDoc } from "../doc/doc";
import { createParagraphStyleResetSet } from "../doc/DocumentContentOperationsManager";
import { resetTextFormatCollAttributes, setTextFormatCollAtNode } from "../doc/docfmt";
import { SwPosition } from "../crsr/pam";
import { SwFormatPageDesc } from "../attr/fmtpdsc";
import { SwNumRuleItem } from "../para/paratr";
import { SwpHints } from "../txtnode/ndhints";
import { SwTextAttr, SwFormatAutoFormat } from "../txtnode/txatbase";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { resetParagraphTextAttributes } from "../txtnode/txtedt";
import { SwUndoResetAttr } from "../undo/unattr";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwView } from "../../uibase/uiview/view";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";

const views: SwView[] = [];
/** Requires a real source owner. @param value - Optional owner. @returns Owned value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing modifier owner");
  return value;
}
afterEach(
  /** Releases owners and observations. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const view of views.splice(0)) view.Close();
  },
);
/** Builds the actual document/view/frame graph. @returns Native owners. */
function fixture() {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("CtrlResetText");
  const target = doc.MakeTextFormatColl("Ctrl target", doc.GetDfltTextFormatColl(), "CtrlTarget");
  target.SetFormatAttr(new SvxFirstLineIndentItem(240, 92));
  const owner = new SwDocShell(
    doc,
    createDocument({ id: "ctrl-reset", title: "Ctrl", suiteId: "writer" }),
  );
  const view = new SwView(owner),
    frame = new SfxViewFrame<SwView>();
  view.AttachFrame(frame);
  frame.SetActiveView(view, [
    owner.GetCommandShell(),
    view.GetCommandShell(),
    view.GetWrtShell().GetCommandShell(),
  ]);
  views.push(view);
  return { doc, node, target, owner, shell: view.GetWrtShell(), dispatch: frame.GetDispatcher() };
}
/** Builds independent ranged automatic style plus internet hint with native flags. @param doc - Pool. @param start - Start. @param end - End. @returns Hints. */
function hints(doc: SwDoc, start: number, end: number): SwpHints {
  const items = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  items.Put(new SvxWeightItem(8, 15));
  items.Put(new SvxPostureItem(2, 11));
  const auto = new SwTextAttr(new SwFormatAutoFormat(items), start, end);
  const link = new SwTextAttr(
    new SwFormatINetFormat({
      url: "https://example.test/ctrl",
      targetFrame: "_blank",
      name: "Ctrl link",
    }),
    start,
    end,
  );
  auto.dontExpand = link.dontExpand = true;
  auto.dontExpandStart = link.dontExpandStart = true;
  auto.dontMoveAttr = link.dontMoveAttr = true;
  return new SwpHints(doc.GetAttrPool(), [auto, link]);
}

describe("native Ctrl paragraph StyleApply", /** Checks request to real core history. @returns Nothing. */ () => {
  it("retains the native repeated empty Ctrl request and expanded redo mark", /** Checks empty selective history and collapsed initial state. @returns Nothing. */ () => {
    const { doc, node, owner, shell, dispatch } = fixture();
    node.SetText("");
    shell.SetPaM(new SwPosition(node, 0));
    dispatch.Execute(".uno:StyleApply", { Template: "Default Paragraph Style", KeyModifier: 8192 });
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(owner.GetUndoManager().GetUndoAction()?.GetPayloadSize()).toBe(3);
    expect(shell.GetCursor().HasMark()).toBe(false);
    shell.Undo();
    expect(shell.GetCursor().HasMark()).toBe(false);
    shell.Redo();
    expect(shell.GetCursor().HasMark()).toBe(true);
    expect(node.GetpSwpHints()).toBeUndefined();
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
    expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
  });
  it.each([0, 4096, 8192, 12288, 16384, 32768, 65535])(
    "honors only KEY_MOD1 in actual command mask %s",
    /** Checks complete dispatch, flags, history and redo contracts. @param modifier - Independent native mask. @returns Nothing. */ (
      modifier,
    ) => {
      const { doc, node, target, owner, shell, dispatch } = fixture();
      node.SetTextHints(hints(doc, 2, 5));
      node.SetAttr(new SvxFirstLineIndentItem(720, 92));
      const original = required(node.GetpSwpHints()).clone();
      shell.SetPaM(new SwPosition(node, 4), new SwPosition(node, 1));
      const request = new SfxRequest(5552, [
        new SfxStringItem(5552, "Ctrl target"),
        new SfxUInt16Item(5553, 2),
      ]);
      request.SetModifier(modifier);
      expect(dispatch.ExecuteRequest(request)).toMatchObject({ status: "executed", value: 2 });
      expect((request.GetReturnValue() as SfxUInt16Item).GetValue()).toBe(2);
      expect(request.GetModifier()).toBe(modifier);
      expect(node.GetTextFormatColl()).toBe(target);
      expect(node.GetParagraphFirstLineIndent()).toBe(240);
      expect(required(node.GetpSwpHints()).Count()).toBe((modifier & 8192) !== 0 ? 1 : 2);
      expect(required(node.GetpSwpHints()).entries().at(-1)?.Which()).toBe(
        (modifier & 8192) !== 0 ? 54 : 53,
      );
      const action = owner.GetUndoManager().GetUndoAction() as SfxListUndoAction<unknown>;
      expect(action.GetActionCount()).toBe(2);
      expect(action.GetPayloadSize()).toBe((modifier & 8192) !== 0 ? 7 : 6);
      expect(owner.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(4);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(required(node.GetpSwpHints()).equals(original)).toBe(true);
        expect(node.GetParagraphFirstLineIndent()).toBe(720);
        expect(node.GetParagraphStyle()).toBe("default");
        expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(4);
        expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(1);
        expect(shell.Redo()).toBe(true);
        expect(node.GetpSwpHints()).toBeUndefined();
        expect(node.GetTextFormatColl()).toBe(target);
        expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(node.Len());
        expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
      }
    },
  );

  for (const reversed of [false, true])
    it.each(["whole", "prefix", "suffix", "middle"])(
      "resets %s across inclusive empty/end-zero nodes and preserves neighbors, reversed=" +
        reversed,
      /** Checks native Ctrl whole-node scope and history ownership boundary. @param kind - Independent hint range. @returns Nothing. */ (
        kind,
      ) => {
        const { doc, node, target, shell, dispatch } = fixture();
        const empty = doc.GetNodes().MakeTextNode(""),
          last = doc.GetNodes().MakeTextNode("LastCtrl"),
          neighbor = doc.GetNodes().MakeTextNode("UntouchedCtrl");
        const start = kind === "middle" || kind === "suffix" ? 2 : 0;
        const end = kind === "middle" || kind === "prefix" ? 5 : node.Len();
        node.SetTextHints(hints(doc, start, end));
        last.SetTextHints(hints(doc, 2, 5));
        neighbor.SetTextHints(hints(doc, 2, 5));
        const before = required(node.GetpSwpHints()).clone(),
          beforeLast = required(last.GetpSwpHints()).clone(),
          beforeNeighbor = required(neighbor.GetpSwpHints()).clone();
        shell.SetPaM(
          new SwPosition(reversed ? last : node, reversed ? 0 : 3),
          new SwPosition(reversed ? node : last, reversed ? 3 : 0),
        );
        dispatch.Execute(".uno:StyleApply", {
          Template: "Ctrl target",
          Family: 2,
          KeyModifier: 8192,
        });
        for (const selected of [node, empty, last])
          expect(selected.GetTextFormatColl()).toBe(target);
        expect(required(node.GetpSwpHints()).Count()).toBe(1);
        expect(required(last.GetpSwpHints()).Count()).toBe(1);
        const resetUndo = SwUndoResetAttr.prototype.UndoWithContext;
        const counts: number[] = [];
        vi.spyOn(SwUndoResetAttr.prototype, "UndoWithContext").mockImplementation(
          /** Observes actual second-owner rollback before collection rollback. @param this - Actual reset history owner. @param context - Native undo context. @returns Nothing. */ function (
            this: SwUndoResetAttr,
            context,
          ) {
            resetUndo.call(this, context);
            counts.push(node.GetpSwpHints()?.Count() ?? 0);
          },
        );
        for (let cycle = 0; cycle < 3; cycle++) {
          shell.Undo();
          expect(required(node.GetpSwpHints()).equals(before)).toBe(true);
          expect(required(last.GetpSwpHints()).equals(beforeLast)).toBe(true);
          expect(counts.at(-1)).toBe(1);
          expect(shell.GetCursor().GetPoint().GetNode()).toBe(last);
          expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
          expect(shell.GetCursor().GetMark().GetNode()).toBe(node);
          expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(3);
          shell.Redo();
          expect(node.GetpSwpHints()).toBeUndefined();
          expect(last.GetpSwpHints()).toBeUndefined();
          expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(last.Len());
          expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
          expect(neighbor.GetParagraphStyle()).toBe("default");
          expect(required(neighbor.GetpSwpHints()).equals(beforeNeighbor)).toBe(true);
        }
      },
    );

  it.each([false, true])(
    "reapplies matching list level on initial Ctrl and retains native redo asymmetry, repeated=%s",
    /** Checks actual same/different collection branch. @param repeated - Initial collection already matches. @returns Nothing. */ (
      repeated,
    ) => {
      const { doc, node, target, shell, dispatch } = fixture();
      doc.EnsureNumRule("CtrlRule", "numbered");
      target.SetFormatAttr(new SwNumRuleItem("CtrlRule"));
      target.SetFormatAttr(new SfxInt16Item(84, 2));
      if (repeated) node.ChgFormatColl(target);
      node.SetAttr(new SwNumRuleItem("CtrlRule"));
      node.SetAttr(new SfxStringItem(83, "CtrlList"));
      node.SetAttr(new SfxInt16Item(84, 4));
      node.SetAttr(new SfxBoolItem(85, true));
      node.SetAttr(new SfxInt16Item(86, 7));
      node.SetAttr(new SfxBoolItem(87, false));
      const before = required(node.GetpSwAttrSet()).Clone();
      dispatch.Execute(".uno:StyleApply", { Template: "Ctrl target", KeyModifier: 8192 });
      expect(node.GetAttrListLevel()).toBe(2);
      expect(node.GetListId()).toBe("CtrlList");
      expect(node.GetAttrListRestartValue()).toBe(7);
      expect(node.IsCountedInList()).toBe(false);
      for (let cycle = 0; cycle < 3; cycle++) {
        shell.Undo();
        expect(node.GetpSwAttrSet()?.entries()).toEqual(before.entries());
        shell.Redo();
        expect(node.GetAttrListLevel()).toBe(repeated ? 4 : 2);
        expect(node.GetListId()).toBe("CtrlList");
      }
    },
  );

  it.each([false, true])(
    "clears six list items when Ctrl target changes rule, targetRule=%s",
    /** Checks Ctrl eligibility without requiring target NUMRULE. @param targetRule - Target has a different rule. @returns Nothing. */ (
      targetRule,
    ) => {
      const { doc, node, target, shell, dispatch } = fixture();
      doc.EnsureNumRule("BeforeRule", "numbered");
      if (targetRule) {
        doc.EnsureNumRule("AfterRule", "numbered");
        target.SetFormatAttr(new SwNumRuleItem("AfterRule"));
      }
      node.SetAttr(new SwNumRuleItem("BeforeRule"));
      node.SetAttr(new SfxStringItem(83, "BeforeList"));
      node.SetAttr(new SfxInt16Item(84, 4));
      node.SetAttr(new SfxBoolItem(85, true));
      node.SetAttr(new SfxInt16Item(86, 7));
      node.SetAttr(new SfxBoolItem(87, false));
      const before = required(node.GetpSwAttrSet()).Clone();
      dispatch.Execute(".uno:StyleApply", { Template: "Ctrl target", KeyModifier: 8192 });
      for (const which of [73, 83, 84, 85, 86, 87])
        expect(node.GetpSwAttrSet()?.GetItemIfSet(which, false)).toBeUndefined();
      shell.Undo();
      expect(node.GetpSwAttrSet()?.entries()).toEqual(before.entries());
      shell.Redo();
      for (const which of [73, 83, 84, 85, 86, 87])
        expect(node.GetpSwAttrSet()?.GetItemIfSet(which, false)).toBeUndefined();
    },
  );

  it.each(
    Array.from(
      { length: 27 },
      /** Builds independent default/nondefault combinations. @param _unused - Placeholder. @param index - Index. @returns Cartesian states. */ (
        _unused,
        index,
      ) => [index % 3, Math.floor(index / 3) % 3, Math.floor(index / 9)] as const,
    ),
  )(
    "uses native deletion-set protection for rule=%s page=%s break=%s",
    /** Checks the actual document primitive before independent list-reset eligibility. @param ruleState - Absent/default/nondefault. @param pageState - Absent/default/nondefault. @param breakState - Absent/default/nondefault. @returns Nothing. */ (
      ruleState,
      pageState,
      breakState,
    ) => {
      const { doc, node, target } = fixture();
      doc.EnsureNumRule("ProtectedCtrl", "numbered");
      if (ruleState !== 0) node.SetAttr(new SwNumRuleItem(ruleState === 1 ? "" : "ProtectedCtrl"));
      if (pageState !== 0) node.SetAttr(new SwFormatPageDesc(pageState === 1 ? "" : "Standard", 3));
      if (breakState !== 0) node.SetAttr(new SfxInt16Item(101, breakState === 1 ? 0 : 4));
      node.SetAttr(new SfxInt16Item(84, 4));
      node.SetAttr(new SvxWeightItem(8, 15));
      node.SetAttr(new SvxFirstLineIndentItem(720, 92));
      const resetSet = createParagraphStyleResetSet(doc);
      expect(resetSet.GetItemIfSet(15, false)?.QueryValue()).toBe(5);
      for (const which of [83, 84, 85, 86, 87])
        expect(resetSet.GetItemIfSet(which, false)).toBeUndefined();
      setTextFormatCollAtNode(node, target, false, resetSet);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(73, false) !== undefined).toBe(ruleState === 2);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(100, false) !== undefined).toBe(pageState === 2);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(101, false) !== undefined).toBe(breakState === 2);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(15, false)).toBeUndefined();
      expect(node.GetParagraphFirstLineIndent()).toBe(240);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(84, false)?.QueryValue()).toBe(4);
    },
  );

  it("retains unrelated automatic-style items and internet flags while normalizing empty styles", /** Checks native common-item deletion rather than whole-hint filtering. @returns Nothing. */ () => {
    const { doc, node } = fixture();
    node.SetTextHints(hints(doc, 2, 5));
    const original = required(node.GetpSwpHints()).clone();
    const onlyWeight = new SfxItemSet(doc.GetAttrPool(), [[15, 15]]);
    onlyWeight.Put(new SvxWeightItem(5, 15));
    resetParagraphTextAttributes(node, false, onlyWeight);
    const remaining = required(node.GetpSwpHints()).entries();
    expect(remaining).toHaveLength(2);
    expect(
      (remaining[1]?.format as SwFormatAutoFormat)
        .GetStyleHandle()
        .entries()
        .map(
          /** Reads item identity. @param item - Remaining item. @returns WhichId. */ (item) =>
            item.Which(),
        ),
    ).toEqual([11]);
    expect(remaining[1]).toMatchObject({
      start: 2,
      end: 5,
      dontExpand: false,
      dontExpandStart: false,
      dontMoveAttr: false,
    });
    expect(remaining[0]?.format.QueryValue()).toEqual(original.entries()[0]?.format.QueryValue());
    const once = required(node.GetpSwpHints()).clone();
    resetParagraphTextAttributes(node, false, onlyWeight);
    expect(required(node.GetpSwpHints()).equals(once)).toBe(true);
    node.SetTextHints(
      new SwpHints(doc.GetAttrPool(), [
        new SwTextAttr(
          new SwFormatAutoFormat(new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES)),
          0,
          node.Len(),
        ),
      ]),
    );
    expect(node.GetpSwpHints()).toBeUndefined();
    resetParagraphTextAttributes(node, false, createParagraphStyleResetSet(doc));
    expect(node.GetpSwpHints()).toBeUndefined();
    node.SetAttr(new SvxWeightItem(8, 15));
    resetTextFormatCollAttributes(node, new SfxItemSet(doc.GetAttrPool(), [[15, 15]]));
    expect(node.GetpSwAttrSet()).toBeUndefined();
  });
});
