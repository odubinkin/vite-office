/** @fileoverview Verifies the pinned paragraph collection numbering transition and owned undo state with literal contracts. */
import { expect, it } from "vitest";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SwDoc } from "../doc/doc";
import { SwFormatColl, SwTextFormatColl } from "../doc/fmtcol";
import { SwNodes } from "../docnode/nodes";
import { SwNumRuleItem } from "../para/paratr";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { HandleApplyTextNodeFormatChange } from "./ndtxt-format-change";
import {
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_NUMRULE,
  RES_PARATR_OUTLINELEVEL,
} from "../../../inc/hintids";

/** Builds real owned rule and collection dependencies. @returns Test document and styles. */
function fixture() {
  const doc = new SwDoc();
  const counters = doc.EnsureNumRule("Counters", "numbered");
  const bullets = doc.EnsureNumRule("Bullets", "bullet");
  const outline = doc.EnsureNumRule("Outline", "numbered");
  const first = doc.GetTextFormatColl("text-body");
  const second = doc.GetTextFormatColl("heading");
  first.SetFormatAttr(new SwNumRuleItem("Counters"));
  second.SetFormatAttr(new SwNumRuleItem("Bullets"));
  const node = doc.paragraphs[0];
  if (node === undefined) throw new Error("Style fixture has no paragraph.");
  return { doc, node, first, second, counters, bullets, outline };
}

it("attaches initial inherited rules, rebinds owned records and retains native list attributes", /** Verifies the original stale-record regression and no-op identity. @returns Nothing. */ () => {
  const { doc, node, first, second, counters, bullets } = fixture();
  const original = node.GetTextFormatColl();
  expect(node.ChgFormatColl(first)).toBe(original);
  expect(node.GetNum()?.GetNumRule()).toBe(counters);
  expect(node.GetNumberVector()).toEqual([1]);
  expect(node.GetListLabel()).toBe("1.");
  expect(node.GetNumRule(false)).toBe(counters);
  const record = node.GetNum();
  expect(node.ChgFormatColl(first)).toBe(first);
  expect(node.GetNum()).toBe(record);
  node.SetListId("Retained");
  node.SetAttrListLevel(2);
  node.SetListRestart(true, 7);
  node.SetCountedInList(false);
  expect(node.GetNumRule(false)).toBeUndefined();
  node.ChgFormatColl(second);
  expect(node.GetNum()).not.toBe(record);
  expect(node.GetNum()?.GetNumRule()).toBe(bullets);
  expect(counters.GetTextNodeListSize()).toBe(0);
  expect(bullets.GetTextNodeListSize()).toBe(1);
  expect(node.GetListId()).toBe("Retained");
  expect(node.GetAttrListLevel()).toBe(2);
  expect(node.IsListRestart()).toBe(true);
  expect(node.GetAttrListRestartValue()).toBe(7);
  expect(node.IsCountedInList()).toBe(false);
  node.SetCountedInList(true);
  expect(node.GetNumberVector()).toEqual([1, 1, 7]);
  expect(node.GetListLabel()).toBe("▪");
  node.RemoveFromList();
  node.ChgFormatColl(second);
  expect(node.IsInList()).toBe(false);
  node.ChgFormatColl(first);
  expect(node.IsInList()).toBe(true);
  node.SetAttr(new SwNumRuleItem("Bullets"));
  const direct = node.GetNum();
  node.ChgFormatColl(second);
  expect(node.GetNum()).toBe(direct);
  expect(node.GetNumRule(false)).toBe(bullets);
  expect(
    /** Attempts an incompatible collection owner. @returns Previous collection if accepted. */ () =>
      node.ChgFormatColl(new SwFormatColl(doc.GetAttrPool(), "Generic")),
  ).toThrow("text format collection");
  expect(
    /** Attempts a collection from another document. @returns Previous collection if accepted. */ () =>
      node.ChgFormatColl(new SwDoc().GetDfltTextFormatColl()),
  ).toThrow("another document");
});

it("resets list attributes on removal and clears synthesized suppression on return to a numbered style", /** Verifies native five-item reset, direct outline suppression and distinct explicit empty rules. @returns Nothing. */ () => {
  const { doc, node, first, second } = fixture();
  node.ChgFormatColl(first);
  node.SetListId("Retained");
  node.SetAttrListLevel(2);
  node.SetListRestart(true, 7);
  node.SetCountedInList(false);
  node.SetAttrOutlineLevel(4);
  node.ChgFormatColl(doc.GetDfltTextFormatColl());
  expect(node.IsInList()).toBe(false);
  expect(node.GetAttrListLevel()).toBe(0);
  expect(node.GetListId()).toBe("");
  expect(node.IsListRestart()).toBe(false);
  expect(node.HasAttrListRestartValue()).toBe(false);
  expect(node.IsCountedInList()).toBe(true);
  expect(
    node
      .GetpSwAttrSet()
      ?.entries()
      .map(
        /** Projects direct item identity after native reset. @param item - Remaining item. @returns Which identifier. */ (
          item,
        ) => item.Which(),
      ),
  ).toEqual([73, 80]);
  expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(true);
  const attrs = node.GetpSwAttrSet();
  node.SetEmptyListStyleDueToSetOutlineLevelAttr();
  expect(node.GetpSwAttrSet()).toBe(attrs);
  node.ChgFormatColl(second);
  expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(false);
  expect(node.GetNumRuleName()).toBe("Bullets");
  expect(node.GetListLabel()).toBe("•");
  node.ResetEmptyListStyleDueToResetOutlineLevelAttr();
  expect(node.GetNumRuleName()).toBe("Bullets");
  node.SetAttr(new SwNumRuleItem());
  node.ChgFormatColl(first);
  expect(node.GetNumRule()).toBeUndefined();
  expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(false);
  for (const level of [-1, 11, 0.5])
    expect(
      /** Attempts an invalid paragraph outline level. @returns Nothing. */ () =>
        node.SetAttrOutlineLevel(level),
    ).toThrow("0-10");
  node.SetAttrOutlineLevel(0);
  expect(node.GetAttrOutlineLevel()).toBe(0);
});

it("applies assigned heading levels independently of numbering and honors false and foreign-array guards", /** Verifies the existing heading assignment with pooled unsigned ownership. @returns Nothing. */ () => {
  const { doc, node, outline } = fixture();
  const parent = new SwTextFormatColl(doc.GetAttrPool(), "audit-parent", "Parent");
  parent.AssignToListLevelOfOutlineStyle(2);
  parent.SetFormatAttr(new SwNumRuleItem("Outline"));
  const child = new SwTextFormatColl(doc.GetAttrPool(), "audit-child", "Child", parent);
  node.ChgFormatColl(child);
  expect(node.GetNumRuleName()).toBe("Outline");
  expect(node.GetNumRule()).toBeUndefined();
  node.SetAttr(new SwNumRuleItem("Outline"));
  expect(node.GetNumRule()).toBe(outline);
  node.ResetAttr(RES_PARATR_NUMRULE);
  for (let level = 0; level < 10; level++) {
    const style = doc.GetTextFormatColl(`heading-${level + 1}`);
    expect(style.IsAssignedToListLevelOfOutlineStyle()).toBe(true);
    expect(style.GetAttrOutlineLevel()).toBe(level + 1);
    node.ChgFormatColl(style);
    expect(node.GetAttrListLevel()).toBe(level);
    expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_LIST_LEVEL, false)).toBeDefined();
    node.SetAttrListLevel(4);
    node.ChgFormatColl(style, false);
    expect(node.GetAttrListLevel()).toBe(4);
    node.ChgFormatColl(style);
    expect(node.GetAttrListLevel()).toBe(level);
  }
  const zero = doc.GetTextFormatColl("heading-1");
  zero.SetAttrOutlineLevel(0);
  node.SetAttrListLevel(4);
  node.ChgFormatColl(zero);
  expect(node.GetAttrListLevel()).toBe(4);
  zero.SetFormatAttr(new SwNumRuleItem("Outline"));
  node.ChgFormatColl(doc.GetDfltTextFormatColl());
  node.ChgFormatColl(zero, false);
  expect(node.GetAttrListLevel()).toBe(0);
  zero.SetAttrOutlineLevel(3);
  node.ChgFormatColl(doc.GetDfltTextFormatColl());
  node.ChgFormatColl(zero, false);
  expect(node.GetAttrListLevel()).toBe(2);
  zero.DeleteAssignmentToListLevelOfOutlineStyle();
  expect(zero.IsAssignedToListLevelOfOutlineStyle()).toBe(false);
  expect(zero.GetAttrOutlineLevel()).toBe(0);
  expect(zero.GetAssignedOutlineStyleLevel()).toBe(-1);
  expect(
    /** Attempts an assignment outside the ten native levels. @returns Nothing. */ () =>
      zero.AssignToListLevelOfOutlineStyle(10),
  ).toThrow("0-9");
  for (const level of [-1, 11, 0.5])
    expect(
      /** Attempts an invalid style outline level. @returns Nothing. */ () =>
        zero.SetAttrOutlineLevel(level),
    ).toThrow("0-10");
  const foreign = new SwNodes(doc).MakeTextNode();
  foreign.ChgFormatColl(doc.GetTextFormatColl("heading-4"));
  expect(foreign.GetAttrListLevel()).toBe(0);
  expect(foreign.IsInList()).toBe(false);
  const item = node.GetDoc().GetAttrPool().GetUserOrPoolDefaultItem(RES_PARATR_OUTLINELEVEL);
  expect(item).toBeInstanceOf(SfxUInt16Item);
  expect(item.QueryValue()).toBe(0);
  expect(doc.GetAttrPool().CreateItem({ which: 80, value: 10 })).toEqual(new SfxUInt16Item(80, 10));
});

it("retains the shared helper branches for explicit rule changes without paragraph reset", /** Verifies empty-rule, same-rule reattachment and invalid outline-level guards directly at the native helper boundary. @returns Nothing. */ () => {
  const { doc, node, first } = fixture();
  node.ChgFormatColl(first);
  node.SetAttrListLevel(2);
  HandleApplyTextNodeFormatChange(node, "", "Counters", true, false);
  expect(node.GetAttrListLevel()).toBe(2);
  HandleApplyTextNodeFormatChange(node, "Counters", "Counters", true, false);
  expect(node.IsInList()).toBe(true);
  HandleApplyTextNodeFormatChange(node, "Counters", "Counters", true, false);
  HandleApplyTextNodeFormatChange(node, "", "Counters", false, false);
  expect(node.GetAttrListLevel()).toBe(2);
  node.SetAttr(new SwNumRuleItem());
  HandleApplyTextNodeFormatChange(node, "", "Counters", true, true);
  expect(node.GetAttrListLevel()).toBe(0);
  HandleApplyTextNodeFormatChange(node, "", "", false, true);
  node.ChgFormatColl(doc.GetDfltTextFormatColl());
});

it("handles a cleared retained binding and the native upper outline-level guard", /** Verifies the retained-record null binding and raw pooled outline sentinel without synthesizing valid levels. @returns Nothing. */ () => {
  const { doc, node, first } = fixture();
  node.ChgFormatColl(first);
  const orphan = node.GetNum();
  if (orphan === undefined) throw new Error("Missing source-owned record.");
  orphan.RemoveMe();
  expect(orphan.GetNumRule()).toBeUndefined();
  node.ChgFormatColl(doc.GetDfltTextFormatColl());
  expect(node.GetNum()).toBe(orphan);
  const other = doc.nodes.MakeTextNode(),
    heading = doc.GetTextFormatColl("heading-1");
  heading.SetFormatAttr(new SfxUInt16Item(RES_PARATR_OUTLINELEVEL, 11));
  heading.SetFormatAttr(new SwNumRuleItem("Outline"));
  other.ChgFormatColl(heading);
  expect(other.GetAttrListLevel()).toBe(0);
  expect(other.GetNum()?.GetNumRule()?.GetName()).toBe("Outline");
});

it("restores exact direct list-item history and suppression through repeated style undo and redo", /** Verifies source history ownership for all attributes destroyed by style transitions. @returns Nothing. */ () => {
  const { doc, node, first } = fixture();
  const shell = new SwWrtShell(
    new SwDocShell(
      doc,
      createDocument({ id: "style-history", suiteId: "writer", title: "History" }),
    ),
  );
  shell.SetParagraphStyle(first.id);
  node.SetListId("Retained");
  node.SetAttrListLevel(2);
  node.SetListRestart(true, 7);
  node.SetCountedInList(false);
  node.SetAttrOutlineLevel(4);
  const before = node.CaptureListItems();
  expect(shell.SetParagraphStyle("default")).toBe(true);
  expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(true);
  for (let i = 0; i < 2; i++) {
    expect(shell.Undo()).toBe(true);
    expect(node.GetParagraphStyle()).toBe("text-body");
    expect(node.CaptureListItems().entries()).toEqual(before.entries());
    expect(node.CaptureListItems().entries()[0]).not.toBe(before.entries()[0]);
    expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(false);
    expect(shell.Redo()).toBe(true);
    expect(node.IsInList()).toBe(false);
    expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(true);
  }
  const empty = node.CaptureListItems();
  shell.SetParagraphStyle("heading");
  expect(node.GetListLabel()).toBe("•");
  expect(shell.Undo()).toBe(true);
  expect(node.CaptureListItems().entries()).toEqual(empty.entries());
  expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(true);
  expect(shell.Redo()).toBe(true);
  expect(node.GetListLabel()).toBe("•");
});
