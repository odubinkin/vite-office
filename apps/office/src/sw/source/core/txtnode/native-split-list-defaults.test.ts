/** @fileoverview Verifies source-owned split paragraph list/style defaults without upstream execution. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import type { SwTextNode } from "./ndtxt";
import { SwPosition } from "../crsr/pam";
import { SwNumRuleItem } from "../para/paratr";
import { CopyDirectListLevel } from "./ndtxt-format-change";
import {
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_NUMRULE,
} from "../../../inc/hintids";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";

/** Requires a native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native list split owner");
  return value;
}
/** Creates a native paragraph and list rule. @param text - Original text. @returns Native owners. */
function fixture(text = "ABCD") {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText(text);
  doc.EnsureNumRule("Split", "numbered");
  return { doc, node };
}
/** Applies literal original list attributes. @param node - Native paragraph. @returns Nothing. */
function list(node: SwTextNode) {
  node.SetNumRule("Split");
  node.SetListId("original-list");
  node.SetAttrListLevel(2);
  node.SetListRestart(true);
  node.SetAttrListRestartValue(7);
  node.SetCountedInList(false);
}
/** Checks logical prefix and continuation list ownership. @param prefix - Original logical prefix. @param suffix - Actual continuation. @returns Nothing. */
function ownership(prefix: SwTextNode, suffix: SwTextNode) {
  expect(prefix.IsListRestart()).toBe(true);
  expect(prefix.GetAttrListRestartValue()).toBe(7);
  expect(prefix.IsCountedInList()).toBe(false);
  expect(suffix.IsListRestart()).toBe(false);
  expect(suffix.HasAttrListRestartValue()).toBe(false);
  expect(suffix.IsCountedInList()).toBe(true);
  for (const which of [
    RES_PARATR_LIST_ISRESTART,
    RES_PARATR_LIST_RESTARTVALUE,
    RES_PARATR_LIST_ISCOUNTED,
  ])
    expect(suffix.GetpSwAttrSet()?.GetItemIfSet(which, false)).toBeUndefined();
}
it.each([0, 1, 2, 4])(
  "native split resets continuation restart and counting without copying UI values at %s",
  /** Checks actual direct item and rule ownership. @param offset - Native split index. @returns Nothing. */
  (offset) => {
    const { doc, node } = fixture();
    list(node);
    const position = new SwPosition(node, offset);
    let suffix: SwTextNode;
    try {
      suffix = doc.GetDocumentContentOperationsManager().SplitNode(position);
    } finally {
      position.Dispose();
    }
    ownership(node, suffix);
    for (const paragraph of [node, suffix]) {
      expect(paragraph.GetListId()).toBe("original-list");
      expect(paragraph.GetAttrListLevel()).toBe(2);
      expect(paragraph.GetNumRule()).toBe(doc.FindNumRulePtr("Split"));
      expect(paragraph.GetNum()?.GetNumRule()).toBe(doc.FindNumRulePtr("Split"));
    }
    expect([node.GetText(), suffix.GetText()]).toEqual([
      "ABCD".slice(0, offset),
      "ABCD".slice(offset),
    ]);
  },
);
it.each([0, 2, 4])(
  "native split changes follow collection only at original end %s",
  /** Checks same versus follow collection and inherited rule departure. @param offset - Native offset. @returns Nothing. */
  (offset) => {
    const { doc, node } = fixture(),
      collection = doc.GetTextFormatColl("text-body"),
      next = doc.GetTextFormatColl("heading");
    collection.SetFormatAttr(new SwNumRuleItem("Split"));
    collection.SetNextTextFormatColl(next);
    node.ChgFormatColl(collection);
    node.SetListId("inherited-list");
    node.SetAttrListLevel(2);
    const suffix = node.SplitContent(offset);
    expect(node.GetTextFormatColl()).toBe(collection);
    expect(suffix.GetTextFormatColl()).toBe(offset === 4 ? next : collection);
    expect(suffix.GetNumRule()?.GetName()).toBe(offset === 4 ? undefined : "Split");
    expect(suffix.GetListId()).toBe(offset === 4 ? "" : "inherited-list");
    expect(suffix.GetAttrListLevel()).toBe(offset === 4 ? 0 : 2);
  },
);
it("native empty paragraph split applies its following collection", /** Checks the zero equals end contract. @returns Nothing. */ () => {
  const { doc, node } = fixture(""),
    original = node.GetTextFormatColl(),
    next = doc.GetTextFormatColl("text-body");
  original.SetNextTextFormatColl(next);
  expect(node.SplitContent(0).GetTextFormatColl()).toBe(next);
  expect(node.GetTextFormatColl()).toBe(original);
});
it("native non-list split clears stale continuation list identity and depth", /** Checks rule-less stale direct items. @returns Nothing. */ () => {
  const { node } = fixture();
  node.SetListId("stale");
  node.SetAttrListLevel(3);
  node.SetListRestart(true);
  node.SetAttrListRestartValue(7);
  node.SetCountedInList(false);
  const suffix = node.SplitContent(2);
  ownership(node, suffix);
  expect(node.GetListId()).toBe("stale");
  expect(node.GetAttrListLevel()).toBe(3);
  expect(suffix.GetListId()).toBe("");
  expect(suffix.GetAttrListLevel()).toBe(0);
  for (const which of [RES_PARATR_LIST_ID, RES_PARATR_LIST_LEVEL])
    expect(suffix.GetpSwAttrSet()?.GetItemIfSet(which, false)).toBeUndefined();
});
it("native ordinary direct numbering survives an end follow collection change", /** Checks hard rule is cleared only for outline parents. @returns Nothing. */ () => {
  const { doc, node } = fixture(),
    original = node.GetTextFormatColl(),
    next = doc.GetTextFormatColl("text-body");
  original.SetNextTextFormatColl(next);
  list(node);
  const suffix = node.SplitContent(4);
  ownership(node, suffix);
  expect(suffix.GetTextFormatColl()).toBe(next);
  expect(suffix.GetNumRule()?.GetName()).toBe("Split");
  expect(suffix.GetListId()).toBe("original-list");
  expect(suffix.GetAttrListLevel()).toBe(2);
});
it.each([0, 2, 4])(
  "native self-follow outline split preserves direct list depth at %s",
  /** Checks native CopyDirectListLevel and effective outline level. @param offset - Native offset. @returns Nothing. */
  (offset) => {
    const { doc, node } = fixture(),
      heading = doc.GetTextFormatColl("heading-2");
    doc.EnsureNumRule("Outline", "numbered");
    heading.SetFormatAttr(new SwNumRuleItem("Outline"));
    heading.SetNextTextFormatColl(heading);
    node.ChgFormatColl(heading);
    node.SetAttrListLevel(4);
    node.SetListId("outline-list");
    expect(CopyDirectListLevel(node)).toBe(true);
    const suffix = node.SplitContent(offset);
    for (const paragraph of [node, suffix]) {
      expect(paragraph.GetTextFormatColl()).toBe(heading);
      expect(paragraph.GetAttrListLevel()).toBe(4);
      expect(paragraph.GetListId()).toBe("outline-list");
      expect(paragraph.IsOutline()).toBe(true);
    }
  },
);
it("native outline copy guard rejects absent level and custom following collections", /** Checks every represented CopyDirectListLevel guard. @returns Nothing. */ () => {
  const { doc, node } = fixture(),
    heading = doc.GetTextFormatColl("heading-2");
  node.SetAttrListLevel(4);
  expect(CopyDirectListLevel(node)).toBe(false);
  heading.SetNextTextFormatColl(heading);
  node.ChgFormatColl(heading);
  node.ResetAttr(RES_PARATR_LIST_LEVEL);
  expect(CopyDirectListLevel(node)).toBe(false);
  node.SetAttrListLevel(4);
  expect(CopyDirectListLevel(node)).toBe(true);
  heading.SetNextTextFormatColl(doc.GetTextFormatColl("text-body"));
  expect(CopyDirectListLevel(node)).toBe(false);
});
it("native outline end split clears hard numbering and list identity on outline departure", /** Checks following style change and source parent-outline reset. @returns Nothing. */ () => {
  const { doc, node } = fixture(),
    heading = doc.GetTextFormatColl("heading-2"),
    next = doc.GetTextFormatColl("text-body");
  heading.SetNextTextFormatColl(next);
  node.ChgFormatColl(heading);
  list(node);
  expect(node.IsOutline()).toBe(true);
  const suffix = node.SplitContent(4);
  ownership(node, suffix);
  expect(node.GetTextFormatColl()).toBe(heading);
  expect(node.GetNumRule()?.GetName()).toBe("Split");
  expect(node.GetAttrListLevel()).toBe(1);
  expect(suffix.GetTextFormatColl()).toBe(next);
  expect(suffix.IsOutline()).toBe(false);
  expect(suffix.GetNumRule()).toBeUndefined();
  expect(suffix.GetListId()).toBe("");
  expect(suffix.GetAttrListLevel()).toBe(0);
  expect(suffix.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeUndefined();
});
it("native outline departure clears list identity even when follow style inherits numbering", /** Checks the parent-outline condition independently of missing rule. @returns Nothing. */ () => {
  const { doc, node } = fixture(),
    heading = doc.GetTextFormatColl("heading-2"),
    next = doc.GetTextFormatColl("text-body");
  next.SetFormatAttr(new SwNumRuleItem("Split"));
  heading.SetNextTextFormatColl(next);
  node.ChgFormatColl(heading);
  list(node);
  const suffix = node.SplitContent(4);
  ownership(node, suffix);
  expect(suffix.IsOutline()).toBe(false);
  expect(suffix.GetNumRule()?.GetName()).toBe("Split");
  expect(suffix.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_LIST_ID, false)).toBeUndefined();
  expect(suffix.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_LIST_LEVEL, false)).toBeUndefined();
  expect(suffix.GetAttrListLevel()).toBe(0);
});
it("native outline custom-follow interior split normalizes prefix but retains continuation level", /** Checks original suffix level independently of a follow change. @returns Nothing. */ () => {
  const { doc, node } = fixture(),
    heading = doc.GetTextFormatColl("heading-2");
  heading.SetNextTextFormatColl(doc.GetTextFormatColl("text-body"));
  node.ChgFormatColl(heading);
  list(node);
  const suffix = node.SplitContent(2);
  expect(node.GetAttrListLevel()).toBe(1);
  expect(suffix.GetAttrListLevel()).toBe(2);
  expect(suffix.GetTextFormatColl()).toBe(heading);
  expect(suffix.GetNumRule()?.GetName()).toBe("Split");
  ownership(node, suffix);
});
it("native shell Enter continues a restarted list through repeated Undo and Redo", /** Checks the actual UI command native model/history path. @returns Nothing. */ () => {
  const { doc, node } = fixture(),
    shell = new SwWrtShell(
      new SwDocShell(
        doc,
        createDocument({ id: "native-list-split", suiteId: "writer", title: "Native list split" }),
      ),
    );
  node.SetNumRule("Split");
  node.SetListId("command-list");
  node.SetListRestart(true);
  node.SetAttrListRestartValue(7);
  const position = new SwPosition(node, 4);
  try {
    shell.SetPaM(position);
  } finally {
    position.Dispose();
  }
  expect(node.GetListLabel()).toBe("7.");
  expect(shell.SplitNode()).toBe(true);
  const suffix = shell.GetActiveParagraph();
  for (let cycle = 0; cycle < 3; cycle += 1) {
    expect(doc.paragraphs).toEqual([node, suffix]);
    expect([node.GetListLabel(), suffix.GetListLabel()]).toEqual(["7.", "8."]);
    expect(suffix.IsListRestart()).toBe(false);
    expect(suffix.HasAttrListRestartValue()).toBe(false);
    expect(shell.Undo()).toBe(true);
    expect(doc.paragraphs).toEqual([node]);
    expect(node.GetText()).toBe("ABCD");
    expect(node.GetListLabel()).toBe("7.");
    expect(shell.Redo()).toBe(true);
    expect(shell.GetActiveParagraph()).toBe(suffix);
  }
});
