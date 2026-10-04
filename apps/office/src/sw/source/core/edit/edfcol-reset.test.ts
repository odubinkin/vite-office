/** @fileoverview Verifies ordinary native StyleApply resets, protected attributes, exact hints and repeat history through actual Writer owners. */
import { afterEach, describe, expect, it } from "vitest";
import { SfxInt16Item, SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxViewFrame } from "../../../../sfx2/source/view/viewfrm";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import { SvxFirstLineIndentItem } from "../../../../editeng/source/items/frmitems";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwFormatPageDesc } from "../attr/fmtpdsc";
import { SwNumRuleItem } from "../para/paratr";
import { SwpHints } from "../txtnode/ndhints";
import { SwTextAttrEnd, SwFormatAutoFormat } from "../txtnode/txatbase";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwView } from "../../uibase/uiview/view";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";

const views: SwView[] = [];
/** Requires a real owned fixture value. @param value - Optional native owner. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native reset fixture");
  return value;
}
afterEach(
  /** Closes actual view owners. @returns Nothing. */ () => {
    for (const view of views.splice(0)) view.Close();
  },
);

/** Creates actual native frame owners and an independent owned collection. @returns Live owner chain. */
function fixture() {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("ResetText");
  const target = doc.MakeTextFormatColl("Reset target", doc.GetDfltTextFormatColl(), "ResetTarget");
  target.SetFormatAttr(new SvxFirstLineIndentItem(240, 92));
  const owner = new SwDocShell(
    doc,
    createDocument({ id: "native-reset", title: "Reset", suiteId: "writer" }),
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

/** Creates an actual character auto-format with literal native weight. @param doc - Owning pool. @returns Independent format. */
function bold(doc: SwDoc): SwFormatAutoFormat {
  const set = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  set.Put(new SvxWeightItem(8, 15));
  return new SwFormatAutoFormat(set);
}

const combinations = Array.from(
  { length: 27 },
  /** Derives independent presence/default/nondefault combinations. @param unused - Array placeholder. @param index - Cartesian index. @returns Three fixture states. */ (
    _,
    index,
  ) => [index % 3, Math.floor(index / 3) % 3, Math.floor(index / 9)] as const,
);

describe("ordinary native StyleApply reset", /** Groups real source-owned reset/history contracts. @returns Nothing. */ () => {
  it.each(combinations)(
    "protects rule=%s page=%s break=%s while clearing all other direct items",
    /** Checks saved-item native defaults and exact rollback. @param ruleState - Absent/empty/named. @param pageState - Absent/empty/named. @param breakState - Absent/NONE/page-before. @returns Nothing. */ (
      ruleState,
      pageState,
      breakState,
    ) => {
      const { doc, node, shell, target } = fixture();
      doc.EnsureNumRule("ProtectedRule", "numbered");
      node.SetAttr(new SvxAdjustItem(SvxAdjust.Right, 65));
      node.SetAttr(new SvxFirstLineIndentItem(720, 92));
      node.SetAttr(new SvxWeightItem(8, 15));
      node.SetAttr(new SfxStringItem(83, "ProtectedList"));
      node.SetAttr(new SfxInt16Item(84, 2));
      node.SetAttr(new SfxBoolItem(85, true));
      node.SetAttr(new SfxInt16Item(86, 7));
      node.SetAttr(new SfxBoolItem(87, false));
      if (ruleState !== 0) node.SetAttr(new SwNumRuleItem(ruleState === 1 ? "" : "ProtectedRule"));
      if (pageState !== 0) node.SetAttr(new SwFormatPageDesc(pageState === 1 ? "" : "Standard", 3));
      if (breakState !== 0) node.SetAttr(new SfxInt16Item(101, breakState === 1 ? 0 : 4));
      const before = required(node.GetpSwAttrSet()).Clone(),
        marker = node.IsEmptyListStyleDueToSetOutlineLevelAttr();
      expect(shell.SetParagraphStyle("ResetTarget")).toBe(true);
      expect(node.GetTextFormatColl()).toBe(target);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(15, false)).toBeUndefined();
      expect(node.GetpSwAttrSet()?.GetItemIfSet(65, false)).toBeUndefined();
      expect(node.GetpSwAttrSet()?.GetItemIfSet(92, false)).toBeUndefined();
      expect(node.GetParagraphFirstLineIndent()).toBe(240);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(73, false) !== undefined).toBe(ruleState === 2);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(100, false) !== undefined).toBe(pageState === 2);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(101, false) !== undefined).toBe(breakState === 2);
      for (const which of [83, 84, 85, 86, 87])
        expect(node.GetpSwAttrSet()?.GetItemIfSet(which, false)).toBeDefined();
      // Collection-change numbering cleanup is a separate native ndtxt transition when no rule remains.
      if (ruleState === 2) {
        expect(node.GetListId()).toBe("ProtectedList");
        expect(node.GetAttrListLevel()).toBe(2);
        expect(node.GetAttrListRestartValue()).toBe(7);
        expect(node.IsCountedInList()).toBe(false);
      }
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(node.GetpSwAttrSet()?.entries()).toEqual(before.entries());
        expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(marker);
        expect(shell.Redo()).toBe(true);
        expect(node.GetParagraphFirstLineIndent()).toBe(240);
        expect(node.GetpSwAttrSet()?.GetItemIfSet(15, false)).toBeUndefined();
      }
    },
  );

  it.each(["whole", "prefix", "suffix", "middle", "internet"] as const)(
    "removes only exact whole AUTOFMT for %s and restores hint flags",
    /** Checks native exact-range type and endpoint branches. @param kind - Independent hint range/type. @returns Nothing. */ (
      kind,
    ) => {
      const { doc, node, shell } = fixture();
      const start = kind === "suffix" || kind === "middle" ? 2 : 0;
      const end = kind === "prefix" || kind === "middle" ? 5 : node.Len();
      const hint = new SwTextAttrEnd(
        kind === "internet"
          ? new SwFormatINetFormat({
              url: "https://example.test/retained",
              name: "Preserved",
              targetFrame: "_blank",
            })
          : bold(doc),
        start,
        end,
      );
      hint.dontExpand = true;
      hint.dontExpandStart = true;
      hint.dontMoveAttr = true;
      node.SetTextHints(new SwpHints(doc.GetAttrPool(), [hint]));
      const original = required(node.GetpSwpHints()).clone();
      shell.SetParagraphStyle("ResetTarget");
      expect(node.GetpSwpHints()?.Count() ?? 0).toBe(kind === "whole" ? 0 : 1);
      if (kind !== "whole") expect(required(node.GetpSwpHints()).equals(original)).toBe(true);
      for (let cycle = 0; cycle < 3; cycle++) {
        shell.Undo();
        expect(required(node.GetpSwpHints()).equals(original)).toBe(true);
        shell.Redo();
        expect(node.GetpSwpHints()?.Count() ?? 0).toBe(0);
      }
    },
  );

  it.each([false, true])(
    "resets the entire inclusive mixed range with reversed=%s and one history owner",
    /** Checks full node attrs/hints outside the selected text offsets. @param reversed - Point/mark direction. @returns Nothing. */ (
      reversed,
    ) => {
      const { doc, node: first, shell, owner, target } = fixture();
      const empty = doc.GetNodes().MakeTextNode(""),
        last = doc.GetNodes().MakeTextNode("LastReset"),
        untouched = doc.GetNodes().MakeTextNode("Neighbor");
      first.ChgFormatColl(target);
      for (const node of [first, empty, last, untouched])
        node.SetAttr(new SvxFirstLineIndentItem(720, 92));
      first.SetTextHints(
        new SwpHints(doc.GetAttrPool(), [new SwTextAttrEnd(bold(doc), 0, first.Len())]),
      );
      last.SetTextHints(
        new SwpHints(doc.GetAttrPool(), [new SwTextAttrEnd(bold(doc), 2, last.Len())]),
      );
      const firstHints = required(first.GetpSwpHints()).clone(),
        lastHints = required(last.GetpSwpHints()).clone();
      const point = new SwPosition(reversed ? last : first, reversed ? 0 : 3),
        mark = new SwPosition(reversed ? first : last, reversed ? 3 : 0);
      shell.SetPaM(point, mark);
      shell.SetParagraphStyle("ResetTarget");
      expect(owner.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(owner.GetUndoManager().GetUndoAction()).toBeInstanceOf(SfxListUndoAction);
      for (const node of [first, empty, last]) {
        expect(node.GetParagraphFirstLineIndent()).toBe(240);
        expect(node.GetpSwAttrSet()).toBeUndefined();
      }
      expect(first.GetpSwpHints()).toBeUndefined();
      expect(required(last.GetpSwpHints()).equals(lastHints)).toBe(true);
      expect(untouched.GetParagraphFirstLineIndent()).toBe(720);
      for (let cycle = 0; cycle < 3; cycle++) {
        shell.Undo();
        for (const node of [first, empty, last])
          expect(node.GetParagraphFirstLineIndent()).toBe(720);
        expect(required(first.GetpSwpHints()).equals(firstHints)).toBe(true);
        expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
        expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(3);
        shell.Redo();
        expect(first.GetpSwpHints()).toBeUndefined();
      }
    },
  );

  it.each([false, true])(
    "uses native changed-list reset decisions with sameRule=%s",
    /** Checks inherited style eligibility and concrete list attributes. @param sameRule - Whether requested collection resolves the same rule. @returns Nothing. */ (
      sameRule,
    ) => {
      const { doc, node, shell, target } = fixture();
      doc.EnsureNumRule("BeforeRule", "numbered");
      doc.EnsureNumRule("AfterRule", "bullet");
      const beforeStyle = doc.MakeTextFormatColl(
        "Before list",
        doc.GetDfltTextFormatColl(),
        "BeforeList",
      );
      beforeStyle.SetFormatAttr(new SwNumRuleItem("BeforeRule"));
      const parent = doc.MakeTextFormatColl(
        "Inherited list",
        doc.GetDfltTextFormatColl(),
        "ListParent",
      );
      parent.SetFormatAttr(new SwNumRuleItem(sameRule ? "BeforeRule" : "AfterRule"));
      target.SetDerivedFrom(parent);
      target.SetFormatAttr(new SfxInt16Item(84, 1));
      node.ChgFormatColl(beforeStyle);
      node.SetListId("BeforeListIdentity");
      node.SetAttrListLevel(3);
      node.SetListRestart(true);
      node.SetAttrListRestartValue(7);
      node.SetCountedInList(false);
      const before = required(node.GetpSwAttrSet()).Clone();
      shell.SetParagraphStyle("ResetTarget");
      expect(node.GetAttrListLevel()).toBe(1);
      expect(node.HasAttrListLevel()).toBe(sameRule);
      expect(node.GetListId()).toBe(
        sameRule
          ? "BeforeListIdentity"
          : required(doc.FindNumRulePtr("AfterRule")).GetDefaultListId(),
      );
      expect(node.IsListRestart()).toBe(sameRule);
      expect(node.HasAttrListRestartValue()).toBe(sameRule);
      expect(node.IsCountedInList()).toBe(!sameRule);
      shell.Undo();
      expect(required(node.GetpSwAttrSet()).entries()).toEqual(before.entries());
      shell.Redo();
      expect(node.GetAttrListLevel()).toBe(1);
      expect(node.HasAttrListLevel()).toBe(sameRule);
      node.SetAttrListLevel(4);
      shell.SetParagraphStyle("ResetTarget");
      expect(node.GetAttrListLevel()).toBe(4);
    },
  );

  it("records every actual unchanged SfxRequest, retains family2 and restores reset state independently", /** Checks native repeated-request history through document dispatch. @returns Nothing. */ () => {
    const { doc, node, shell, dispatch, target, owner } = fixture();
    node.ChgFormatColl(target);
    node.SetAttr(new SvxFirstLineIndentItem(720, 92));
    node.SetTextHints(
      new SwpHints(doc.GetAttrPool(), [new SwTextAttrEnd(bold(doc), 0, node.Len())]),
    );
    shell.SetPaM(new SwPosition(node, 5), new SwPosition(node, 2));
    const cursor = shell.GetCursor();
    for (let requestIndex = 0; requestIndex < 2; requestIndex++) {
      const request = new SfxRequest(5552, [
        new SfxStringItem(5552, "Reset target"),
        new SfxUInt16Item(5553, 2),
      ]);
      dispatch.ExecuteRequest(request);
      expect(request.GetReturnValue()).toBeInstanceOf(SfxUInt16Item);
      expect((request.GetReturnValue() as SfxUInt16Item).GetValue()).toBe(2);
      expect(owner.GetUndoManager().GetUndoActionCount()).toBe(requestIndex + 1);
      expect(node.GetParagraphFirstLineIndent()).toBe(240);
    }
    shell.Undo();
    expect(node.GetParagraphFirstLineIndent()).toBe(240);
    shell.Undo();
    expect(node.GetParagraphFirstLineIndent()).toBe(720);
    expect(required(node.GetpSwpHints()).Count()).toBe(1);
    shell.Redo();
    shell.Redo();
    expect(node.GetParagraphFirstLineIndent()).toBe(240);
    expect(node.GetpSwpHints()).toBeUndefined();
    expect(shell.GetCursor()).toBe(cursor);
    expect(cursor.GetPoint().GetContentIndex()).toBe(node.Len());
    expect(cursor.GetMark().GetContentIndex()).toBe(0);
  });
});
