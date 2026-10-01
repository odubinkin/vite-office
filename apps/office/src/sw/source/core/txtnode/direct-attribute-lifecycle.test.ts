/** @fileoverview Verifies literal native list attribute, outline index and notification contracts independent of generated comparisons. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwNodes } from "../docnode/nodes";
import { SwNumRuleType } from "../doc/number";
import { createWriterNumRule } from "../doc/DocumentListsManager";
import { SwNumRuleItem } from "../para/paratr";
import { SwNodeNum } from "../SwNumberTree/SwNodeNum";
import { SwTextNode } from "./ndtxt";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxUInt16Item, SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { HasNumberingWhichNeedsLayoutUpdate } from "./ndtxt-attribute-handlers";

/** Creates a canonical paragraph with real native ownership. @returns Document and paragraph. */
function fixture() {
  const doc = new SwDoc();
  return { doc, node: doc.paragraphs[0] as SwTextNode };
}

it("synthesizes outline suppression and clears it on explicit numbering and full reset", /** Protects the initial marker regression and recursive reset order. @returns Nothing. */ () => {
  const { doc, node } = fixture();
  node.SetAttrOutlineLevel(4);
  expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(true);
  expect(node.GetNumRuleName()).toBe("");
  expect(
    node
      .GetpSwAttrSet()
      ?.entries()
      .map(
        /** Reads direct item ownership. @param item - Direct item. @returns WhichId. */
        (item) => item.Which(),
      ),
  ).toEqual([73, 80]);
  expect(doc.nodes.GetOutLineNds().entries()).toEqual([node]);
  doc.EnsureNumRule("Counters", "numbered");
  node.SetAttr(new SwNumRuleItem("Counters"));
  expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(false);
  expect(node.GetNum()?.GetNumRule()).toBe(doc.FindNumRulePtr("Counters"));
  node.SetAttrOutlineLevel(0);
  expect(doc.nodes.GetOutLineNds().entries()).toEqual([]);
  node.SetAttrOutlineLevel(4);
  node.SetAttr(new SwNumRuleItem());
  node.ResetAllAttr();
  expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(false);
  expect(node.GetpSwAttrSet()).toBeUndefined();
  node.SetAttrOutlineLevel(3);
  node.ResetAttr(80);
  expect(node.GetpSwAttrSet()).toBeUndefined();
  expect(doc.nodes.GetOutLineNds().entries()).toEqual([]);
  node.ResetAttr([]);
  node.ResetAttr(84, 83);
  node.ResetAllAttr();
});
it("retains absent inherited IDs and preserves the Arabic versus bullet count distinction", /** Proves source registration identity and pre-vector cache/event semantics. @returns Nothing. */ () => {
  for (const kind of ["numbered", "bullet"] as const) {
    const { doc, node } = fixture();
    const rule = doc.EnsureNumRule("Counters", kind);
    const style = doc.GetTextFormatColl("text-body");
    style.SetFormatAttr(new SwNumRuleItem("Counters"));
    node.ChgFormatColl(style);
    const tail = doc.nodes.MakeTextNode();
    tail.ChgFormatColl(style);
    const owned = node.GetNum();
    expect(node.ResetAttr(83)).toBe(false);
    expect(node.GetNum()).toBe(owned);
    const events: number[] = [];
    const notify = doc.NotifyModelChange.bind(doc);
    doc.NotifyModelChange =
      /** Captures native numbering notifications only. @param hint - Model hint. @returns Nothing. */
      (hint) => {
        if (hint.kind === "numbering-changed") events.push(hint.nodeIndex as number);
        notify(hint);
      };
    expect(HasNumberingWhichNeedsLayoutUpdate(node)).toBe(kind === "numbered");
    node.SetCountedInList(false);
    expect(events).toEqual(kind === "numbered" ? [node.GetIndex(), tail.GetIndex()] : []);
    expect(node.GetNum()?.GetNumber(false)).toBe(kind === "numbered" ? 0 : 1);
    expect(tail.GetNum()?.GetNumber(false)).toBe(kind === "numbered" ? 1 : 2);
    events.splice(0);
    node.ResetAttr(87);
    expect(events).toEqual([node.GetIndex(), tail.GetIndex()]);
    expect(node.GetNum()?.GetNumber(false)).toBe(1);
    expect(tail.GetNum()?.GetNumber(false)).toBe(2);
    const clients: SwTextNode[] = [];
    rule.GetTextNodeList(clients);
    expect(clients).toEqual([node, tail]);
    node.SetAttr(new SfxBoolItem(85, false));
    node.SetAttr(new SfxInt16Item(86, 0));
    node.SetAttr(new SfxInt16Item(86, 0));
    node.ResetAttr([85, 86, 84, 87]);
  }
});
it("maintains real sorted outline identity across move, clone, replacement, deletion and copying", /** Verifies index ownership rather than filtered projections, including detached and foreign guards. @returns Nothing. */ () => {
  const { doc, node } = fixture();
  const second = doc.nodes.MakeTextNode(),
    third = doc.nodes.MakeTextNode();
  third.SetAttrOutlineLevel(2);
  node.SetAttrOutlineLevel(1);
  second.SetAttrOutlineLevel(3);
  const index = doc.nodes.GetOutLineNds();
  expect(index.entries()).toEqual([node, second, third]);
  expect(index.contains(node)).toBe(true);
  doc.nodes.moveTextNode(node, 1);
  expect(index.entries()).toEqual([second, node, third]);
  const clone = node.CloneTo(doc.nodes);
  expect(clone.IsOutline()).toBe(true);
  doc.nodes.UpdateOutlineNode(clone);
  expect(index.entries()).toEqual([second, node, third]);
  doc.nodes.insertTextNodeAfter(node, clone);
  expect(index.entries()).toEqual([second, node, clone, third]);
  const replacement = second.CloneTo(doc.nodes);
  doc.nodes.replaceTextNode(second, replacement);
  expect(index.entries()).toEqual([replacement, node, clone, third]);
  doc.nodes.removeTextNode(clone);
  expect(index.entries()).toEqual([replacement, node, third]);
  replacement.ResetAttr(80);
  expect(index.entries()).toEqual([node, third]);
  expect(index.contains(replacement)).toBe(false);
  doc.nodes.UpdateOutlineNode(doc.nodes.GetEndOfContent());
  const foreign = new SwNodes(doc),
    foreignNode = foreign.MakeTextNode();
  foreignNode.SetAttrOutlineLevel(3);
  expect(foreign.GetOutLineNds().entries()).toEqual([]);
  const copy = new SwDoc(false);
  copy.nodes.copyContentFrom(doc.nodes);
  expect(copy.nodes.GetOutLineNds().entries()).toEqual([copy.paragraphs[1], copy.paragraphs[2]]);
  const start = doc.nodes.GetEndOfRedlines().StartOfSectionNode();
  const redline = new SwTextNode(doc.nodes, start, doc.GetDfltTextFormatColl());
  (doc.nodes as unknown as { nodeArray: SwTextNode[] }).nodeArray.splice(
    doc.nodes.GetEndOfRedlines().GetIndex(),
    0,
    redline,
  );
  redline.SetAttrOutlineLevel(3);
  expect(redline.IsOutline()).toBe(false);
});

/** Exposes native notification suppression through number-tree policy, without claiming full document flags. */
class SilentRoot extends SwNodeNum {
  /** Supplies a suppressed policy. @returns Disabled. */
  protected override IsNotifiable(): boolean {
    return false;
  }
}
it("retains shown record operation and notification policy boundaries", /** Verifies no-root and suppressed branches, real rule rebinding and detached model notifications. @returns Nothing. */ () => {
  const { doc, node } = fixture();
  expect(HasNumberingWhichNeedsLayoutUpdate(node)).toBe(false);
  expect(
    /** Rejects an operation without an owned shown record. @returns Nothing. */
    () =>
      node.DoNum(
        /** Supplies an otherwise valid validation operation. @param record - Number record. @returns Nothing. */
        (record) => record.ValidateMe(),
      ),
  ).toThrow("owned number record");
  const root = new SilentRoot(undefined);
  root.Notify();
  root.NotifyInvalidChildren();
  root.InvalidateAndNotifyTree();
  root.ValidateMe();
  root.InvalidateMe();
  root.NotifyInvalidSiblings();
  const rule = doc.EnsureNumRule("Counters", "numbered"),
    other = doc.EnsureNumRule("Other", "bullet");
  node.SetNumRule(rule.GetName());
  node.GetNum()?.ChangeNumRule(other);
  node.NumRuleChgd();
  expect(node.GetNum()?.GetNumRule()).toBe(rule);
  node.RemoveFromList();
  node.NumRuleChgd();
  node.CloneTo(doc.nodes).NumRuleChgd();
  node.SetAttr(new SfxUInt16Item(80, 0));
  expect(node.IsOutline()).toBe(false);
  node.ResetAttr([73, 84, 85, 86, 87]);
});
it("distinguishes explicit outline rule type from its reserved name and retains clone metadata", /** Verifies native setter invalidation and no name inference without adding outline factories. @returns Nothing. */ () => {
  const named = createWriterNumRule("Outline");
  expect(named.GetRuleType()).toBe(SwNumRuleType.NUM_RULE);
  expect(named.IsOutlineRule()).toBe(false);
  named.Validate();
  expect(named.IsInvalidRule()).toBe(false);
  named.SetRuleType(SwNumRuleType.OUTLINE_RULE);
  expect(named.IsInvalidRule()).toBe(true);
  expect(named.IsOutlineRule()).toBe(true);
  expect(named.clone().GetRuleType()).toBe(SwNumRuleType.OUTLINE_RULE);
  const { doc, node } = fixture();
  const rule = doc.EnsureNumRule("Chapter", "numbered");
  rule.SetRuleType(SwNumRuleType.OUTLINE_RULE);
  node.SetNumRule("Chapter");
  expect(node.IsOutline()).toBe(true);
  node.SetAttr(new SfxBoolItem(85, false));
  expect(doc.nodes.GetOutLineNds().entries()).toEqual([node]);
  node.ResetAllAttr();
  expect(node.IsOutline()).toBe(false);
  expect(doc.nodes.GetOutLineNds().entries()).toEqual([]);
});

it("preserves outline index identity across repeated registration and independently cleared membership", /** Verifies idempotent native index operations and state transitions when callers already registered or removed a node. @returns Nothing. */ () => {
  const { doc, node } = fixture();
  const index = doc.nodes.GetOutLineNds();
  index.insert(node);
  index.insert(node);
  node.SetAttrOutlineLevel(2);
  expect(index.entries()).toEqual([node]);
  index.erase(node);
  node.SetAttrOutlineLevel(0);
  expect(index.entries()).toEqual([]);
  expect(node.IsOutlineStateChanged()).toBe(false);
});

it("leaves absent rules unattached and does not invent a level for assigned zero-outline styles", /** Verifies failed rule resolution with explicit identity and the native invalid assigned-level reset guard using real pooled style state. @returns Nothing. */ () => {
  const { doc, node } = fixture();
  node.SetAttr(new SwNumRuleItem("unknown"));
  node.SetAttr(new SfxStringItem(83, "MissingRuleList"));
  node.AddToList();
  expect(node.GetNum()).toBeUndefined();
  expect(doc.GetDocumentListsManager().GetListByName("MissingRuleList")).toBeUndefined();
  doc.EnsureNumRule("Outline", "numbered");
  const style = doc.GetTextFormatColl("heading-1");
  style.SetFormatAttr(new SwNumRuleItem("Outline"));
  style.SetAttrOutlineLevel(0);
  expect(style.IsAssignedToListLevelOfOutlineStyle()).toBe(true);
  expect(style.GetAssignedOutlineStyleLevel()).toBe(-1);
  node.ResetAllAttr();
  node.ChgFormatColl(style, false);
  for (const outline of [0, 11]) {
    style.SetFormatAttr(new SfxUInt16Item(80, outline));
    node.ResetAttr([73, 84]);
    expect(node.GetNum()?.GetNumRule()).toBe(doc.FindNumRulePtr("Outline"));
    expect(node.HasAttrListLevel()).toBe(false);
    expect(node.GetAttrListLevel()).toBe(0);
  }
});
