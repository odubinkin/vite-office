/** @fileoverview Verifies source-owned shown numbering records, lazy reads and rule-client transitions. */
import { createWriterNumFormat, type SwNumRule } from "../doc/number";
import type { SwNumberTreeNode } from "../SwNumberTree/SwNumberTree";

import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList, SwList } from "../doc/list";
import { SwNodeNum } from "../SwNumberTree/SwNodeNum";
import { SwNodes } from "../docnode/nodes";
import type { SwTextNode } from "./ndtxt";

it("owns records in text nodes and validates insertion notifications before prefix reads", /** Checks literal native owner, prefix, detached-rule and readd states. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const first = doc.paragraphs[0] as SwTextNode;
  const tail = doc.nodes.MakeTextNode();
  expect(first.GetNum()).toBeUndefined();
  expect(first.GetNumberVector()).toEqual([]);
  expect(first.IsInList()).toBe(false);
  expect(first.GetActualListLevel()).toBe(-1);
  expect(first.HasNumber()).toBe(false);
  expect(first.HasBullet()).toBe(false);
  const rule = doc.EnsureNumRule("Counters", "numbered");
  updateRuleStart(rule, 0, 7);
  for (const node of [first, tail])
    applyWriterParagraphList(node, {
      kind: "numbered",
      styleId: "Counters",
      listId: "A",
      level: 0,
    });
  const record = tail.GetNum() as SwNodeNum;
  const firstRecord = first.GetNum();
  expect(record.GetNumRule()).toBe(rule);
  expect(record.GetNumber(false)).toBe(8);
  expect(first.GetListItemNumber()).toBe(7);
  expect(record.GetNumber(false)).toBe(8);
  expect(first.GetNumberVector()).toEqual([7]);
  expect(first.GetListLabel()).toBe("7.");
  expect(record.GetNumber(false)).toBe(8);
  expect(tail.GetNumberVector()).toEqual([8]);
  first.AddToList();
  expect(first.GetNum()).toBe(firstRecord);
  const clients: SwTextNode[] = [tail];
  rule.GetTextNodeList(clients);
  expect(clients).toEqual([first, tail]);
  clients.pop();
  expect(rule.GetTextNodeListSize()).toBe(2);
  tail.RemoveFromList();
  expect(tail.GetNum()).toBeUndefined();
  expect(record.GetNumRule()).toBeUndefined();
  expect(record.GetStartValue()).toBe(1);
  expect(record.IsCountedForNumbering()).toBe(false);
  expect(tail.GetListLabel()).toBeUndefined();
  tail.RemoveFromList();
  tail.AddToList();
  expect(tail.GetNum()).not.toBe(record);
  expect(tail.GetNumberVector()).toEqual([8]);
  rule.GetTextNodeList(clients);
  expect(clients).toEqual([first, tail]);
  doc.Dispose();
  expect(rule.GetTextNodeListSize()).toBe(0);
  expect(first.GetNum()).toBeUndefined();
});
it("removes old clients before changing list attributes and preserves native registration order", /** Checks rule/list transitions, duplicate rule clients, invalid flags and independent copies. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const first = doc.paragraphs[0] as SwTextNode;
  const second = doc.nodes.MakeTextNode();
  const third = doc.nodes.MakeTextNode();
  const rule = doc.EnsureNumRule("Counters", "numbered");
  const other = doc.EnsureNumRule("Other", "numbered");
  for (const node of [first, second, third])
    applyWriterParagraphList(node, {
      kind: "numbered",
      styleId: "Counters",
      listId: "A",
      level: 0,
    });
  rule.AddTextNode(second);
  expect(rule.GetTextNodeListSize()).toBe(3);
  expect(rule.IsInvalidRule()).toBe(true);
  rule.Validate();
  expect(rule.IsInvalidRule()).toBe(false);
  second.SetNumRule("Other");
  const clients: SwTextNode[] = [];
  rule.GetTextNodeList(clients);
  expect(clients).toEqual([first, third]);
  other.GetTextNodeList(clients);
  expect(clients).toEqual([second]);
  second.SetListId("B");
  expect(second.GetNum()?.GetNumRule()).toBe(other);
  expect(second.GetNumberVector()).toEqual([1]);
  second.SetNumRule("Counters");
  rule.GetTextNodeList(clients);
  expect(clients).toEqual([first, third, second]);
  const retained = second.GetNum();
  second.SetNumRule("Counters");
  expect(second.GetNum()).not.toBe(retained);
  expect(second.GetNumberVector()).toEqual([1]);
  const bound = second.GetNum() as SwNodeNum;
  bound.ChangeNumRule(other);
  expect(bound.GetNumRule()).toBe(other);
  rule.GetTextNodeList(clients);
  expect(clients).toEqual([first, third]);
  other.GetTextNodeList(clients);
  expect(clients).toEqual([second]);
  bound.ChangeNumRule(rule);
  rule.Invalidate();
  expect(rule.IsInvalidRule()).toBe(true);
  rule.Validate();
  expect(rule.IsInvalidRule()).toBe(false);
  rule.Set(0, createWriterNumFormat("numbered", "", { start: 4 }));
  expect(rule.IsInvalidRule()).toBe(true);
  rule.Validate();
  expect(first.GetNumberVector()).toEqual([4]);
  expect(third.GetNumberVector()).toEqual([5]);
  const copy = rule.clone();
  expect(copy.GetTextNodeListSize()).toBe(0);
  expect(copy.IsInvalidRule()).toBe(true);
  updateRuleStart(copy, 0, 9);
  expect(rule.Get(0).GetStart()).toBe(4);
  rule.RemoveTextNode(doc.nodes.MakeTextNode());
  expect(rule.GetTextNodeListSize()).toBe(3);
  const absent = doc.nodes.MakeTextNode();
  rule.AddTextNode(absent);
  rule.Invalidate();
  rule.RemoveTextNode(absent);
  expect(rule.GetTextNodeListSize()).toBe(3);
  doc.Dispose();
});
it("restricts automatic ownership to connected document nodes and retains orphan contracts", /** Checks pending clones, foreign arrays, missing rules and explicit source orphan insertion. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const node = doc.paragraphs[0] as SwTextNode;
  node.AddToList();
  expect(node.GetNum()).toBeUndefined();
  node.SetListId("missing");
  expect(node.GetNum()).toBeUndefined();
  node.SetNumRule("missing-rule");
  expect(node.GetNum()).toBeUndefined();
  node.SetNumRule("");
  applyWriterParagraphList(node, { kind: "numbered", styleId: "Counters", listId: "A", level: 0 });
  const clone = node.CloneTo(doc.nodes);
  clone.AddToList();
  expect(clone.GetNum()).toBeUndefined();
  const extra = new SwNodes(doc);
  const foreign = extra.MakeTextNode();
  applyWriterParagraphList(foreign, {
    kind: "numbered",
    styleId: "Counters",
    listId: "B",
    level: 0,
  });
  foreign.AddToList();
  expect(extra.IsDocNodes()).toBe(false);
  expect(foreign.GetNum()).toBeUndefined();
  const record = node.GetNum() as SwNodeNum;
  SwList.RemoveListItem(record);
  expect(node.GetNum()).toBe(record);
  expect(node.IsInList()).toBe(false);
  expect(node.GetNumberVector()).toEqual([]);
  node.RemoveFromList();
  expect(node.GetNum()).toBe(record);
  expect(
    /** Calls the native rejected owner allocation with an existing orphan. @returns Nothing. */ () =>
      node.AddToList(),
  ).toThrow("orphan");
  const other = doc.EnsureNumRule("Other", "bullet");
  record.ChangeNumRule(other);
  expect(node.HasBullet()).toBe(true);
  expect(node.HasNumber()).toBe(false);
  const root = new SwNodeNum(undefined);
  root.ChangeNumRule(other);
  expect(root.GetNumRule()).toBe(other);
  doc.GetDocumentListsManager().GetListByName("A")?.InsertListItem(record, 0);
  node.RemoveFromList();
  node.SetNumRule("unknown");
  expect(node.IsInList()).toBe(false);
  expect(node.GetNum()?.GetNumRule()).toBeUndefined();
  expect(node.HasNumber()).toBe(false);
  expect(node.GetListLabel()).toBeUndefined();
  node.RemoveFromList();
});

it("keeps native registration guards for absent text and non-document records", /** Checks diagnostic no-text records and foreign-array clients without registering document items. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const rule = doc.EnsureNumRule("Counters", "numbered");
  const root = new SwNodeNum(undefined, rule);
  const absent = new SwNodeNum(undefined);
  root.AddChild(absent, 0);
  expect(absent.GetNumRule()).toBeUndefined();
  expect(absent.GetParent()).toBe(root);
  absent.RemoveMe();
  expect(getNumberTreeChildren(root)).toEqual([]);
  const foreign = new SwNodes(doc).MakeTextNode();
  applyWriterParagraphList(foreign, {
    kind: "numbered",
    styleId: "Counters",
    listId: "B",
    level: 0,
  });
  const record = new SwNodeNum(foreign);
  root.AddChild(record, 0);
  expect(record.GetNumRule()).toBe(rule);
  const clients: SwTextNode[] = [];
  rule.GetTextNodeList(clients);
  expect(clients).toEqual([foreign]);
  const output: SwNodeNum[] = [];
  doc.getIDocumentListItems().getNumItems(output);
  expect(output).toEqual([]);
  record.RemoveMe();
  expect(record.GetNumRule()).toBeUndefined();
  rule.GetTextNodeList(clients);
  expect(clients).toEqual([]);
  expect(getNumberTreeChildren(root)).toEqual([]);
});

/** Changes an independent level and applies it through native Set ownership. @param rule - Rule. @param level - Native level. @param start - Starting value. @returns Nothing. */
function updateRuleStart(rule: SwNumRule | undefined, level: number, start: number): void {
  const format = (rule as SwNumRule).Get(level).clone();
  format.SetStart(start);
  (rule as SwNumRule).Set(level, format);
}

/** Observes protected child storage solely for diagnostics. @param node - Owned tree record. @returns Direct children in native order. */
function getNumberTreeChildren(node: SwNumberTreeNode): readonly SwNumberTreeNode[] {
  return (node as unknown as { mChildren: SwNumberTreeNode[] }).mChildren;
}
