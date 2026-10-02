/** @fileoverview Verifies retained Writer list topology and native validating reads across document mutations. */
import type { SwNumberTreeNode } from "./SwNumberTree";
import type { SwNumRule } from "../doc/number";
import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";
/** Creates canonical Arabic items with literal native per-level starts. @param levels - Initial levels. @returns Document, nodes and retained list. */
function fixture(levels: readonly number[]) {
  const document = createWriterDocument();
  const rule = document.EnsureNumRule("Counters", "numbered");
  for (let level = 0; level < 10; level++) updateRuleStart(rule, level, [7, 5, 3][level] ?? 1);
  const nodes = levels.map(
    /** Registers one canonical list item. @param level - Item level. @param index - Body position. @returns Item. */
    (level, index) => {
      const node =
        index === 0 ? (document.paragraphs[0] as SwTextNode) : document.nodes.MakeTextNode();
      applyWriterParagraphList(node, {
        kind: "numbered",
        level,
        styleId: "Counters",
        listId: "retained",
      });
      return node;
    },
  );
  const list = required(document.GetDocumentListsManager().GetListByName("retained"));
  return { document, nodes, list };
}
it("attaches items at insertion and validates reverse-order reads without replacing their root", /** Checks immediate topology, native vectors and stable ownership across repeated validation. @returns Nothing. */ () => {
  const { nodes, list } = fixture([0, 1, 2, 0]);
  const records = nodes.map(
    /** Reads the retained item. @param node - Paragraph. @returns Record. */ (node) =>
      required(list.GetListItem(node)),
  );
  const root = getNumberTreeRoot(required(records[0]));
  expect(
    records.every(
      /** Checks the root identity before validation. @param item - Record. @returns Ownership equality. */ (
        item,
      ) => getNumberTreeRoot(item) === root,
    ),
  ).toBe(true);
  expect(required(records[2]).GetParent()).toBe(records[1]);
  expect(list.GetListItemNumberVector(required(nodes[3]))).toEqual([8]);
  expect(list.GetListItemNumberVector(required(nodes[2]))).toEqual([7, 5, 3]);
  expect(list.GetListItemNumber(required(nodes[1]))).toBe(5);
  expect(required(records[2]).GetNumber(false)).toBe(3);
  required(nodes[0]).SetListRestart(true);
  required(nodes[0]).SetAttrListRestartValue(0);
  expect(list.GetListItemNumberVector(required(nodes[2]))).toEqual([0, 5, 3]);
  required(nodes[0]).SetCountedInList(false);
  expect(list.GetListItemNumberVector(required(nodes[3]))).toEqual([1]);
  list.ValidateListTree();
  list.ValidateListTree();
  expect(getNumberTreeRoot(required(records[0]))).toBe(root);
  expect(list.GetListItem(required(nodes[2]))).toBe(records[2]);
});
it("reparents retained items and moves descendants through native predecessor phantoms", /** Checks level transitions, parent deletion and phantom cleanup with literal vectors. @returns Nothing. */ () => {
  const { nodes, list } = fixture([0, 1, 2, 0]);
  const records = nodes.map(
    /** Captures an owned record. @param node - Paragraph. @returns Record. */ (node) =>
      required(list.GetListItem(node)),
  );
  const root = getNumberTreeRoot(required(records[0]));
  required(nodes[1]).SetAttrListLevel(0);
  expect(list.GetListItem(required(nodes[1]))).toBe(records[1]);
  expect(list.GetListItemNumberVector(required(nodes[2]))).toEqual([8, 5, 3]);
  expect(required(records[2]).GetParent()?.IsPhantom()).toBe(true);
  required(nodes[1]).SetAttrListLevel(1);
  expect(list.GetListItemNumberVector(required(nodes[2]))).toEqual([7, 5, 3]);
  required(nodes[0]).RemoveFromList();
  expect(list.GetListItem(required(nodes[0]))).toBeUndefined();
  expect(required(records[0]).GetParent()).toBeUndefined();
  expect(list.GetListItemNumberVector(required(nodes[2]))).toEqual([7, 5, 3]);
  expect(required(records[1]).GetParent()?.IsPhantom()).toBe(true);
  required(nodes[0]).AddToList();
  expect(getNumberTreeRoot(required(records[2]))).toBe(root);
  required(nodes[1]).AddToList();
  expect(list.GetListItem(required(nodes[1]))).toBe(records[1]);
  expect(list.GetListItemNumberVector(required(nodes[2]))).toEqual([7, 5, 3]);
  required(nodes[2]).RemoveFromList();
  required(nodes[1]).RemoveFromList();
  expect(list.GetListItemNumberVector(required(nodes[3]))).toEqual([8]);
  expect(getNumberTreeChildren(root as SwNodeNum).length).toBe(2);
});
it("moves canonical paragraphs with retained list records and independent copied trees", /** Checks document position transitions, deletion and copy ownership without manual validation. @returns Nothing. */ () => {
  const { document, nodes, list } = fixture([0, 1, 0]);
  const item = required(list.GetListItem(required(nodes[2])));
  const nested = required(list.GetListItem(required(nodes[1])));
  const root = getNumberTreeRoot(item);
  document.nodes.moveTextNode(required(nodes[2]), -1);
  expect(list.GetListItem(required(nodes[2]))).toBe(item);
  expect(list.GetListItem(required(nodes[1]))).toBe(nested);
  expect(getNumberTreeRoot(item)).toBe(root);
  expect(list.GetListItemNumberVector(required(nodes[1]))).toEqual([8, 5]);
  expect(nested.GetParent()).toBe(item);
  document.nodes.removeTextNode(required(nodes[2]));
  expect(list.GetListItemNumberVector(required(nodes[1]))).toEqual([7, 5]);
  const copy = createWriterDocument();
  copy.nodes.copyContentFrom(document.nodes);
  const copied = required(
    copy.paragraphs.find(
      /** Finds the copied nested item. @param node - Copied paragraph. @returns Match. */ (node) =>
        node.GetAttrListLevel() === 1,
    ),
  );
  const copiedList = required(copy.GetDocumentListsManager().GetListByName(copied.GetListId()));
  expect(copiedList.GetListItemNumberVector(copied)).toEqual([7, 5]);
  expect(copiedList.GetListItem(copied)).not.toBe(nested);
  expect(getNumberTreeRoot(required(copiedList.GetListItem(copied)))).not.toBe(root);
});
it("keeps native orphan and invalid removal contracts bounded", /** Checks source no-op branches and an empty retained root. @returns Nothing. */ () => {
  const root = new SwNodeNum(undefined);
  const diagnostic = root as unknown as {
    /** Invokes the protected native missing-child diagnostic. @param target - Foreign record. @returns Nothing. */
    ValidateHierarchical(target: SwNodeNum): void;
  };
  const document = createWriterDocument();
  const node = new SwNodeNum(document.paragraphs[0]);
  const missing = new SwNodeNum(document.nodes.MakeTextNode());
  node.SetLevelInListTree(-1);
  node.SetLevelInListTree(1);
  node.RemoveMe();
  root.RemoveChild(missing);
  root.AddChild(node, 2);
  diagnostic.ValidateHierarchical(missing);
  const phantom = required(node.GetParent());
  required(phantom.GetParent()).RemoveChild(phantom);
  expect(node.GetLevelInListTree()).toBe(2);
  node.SetLevelInListTree(-1);
  node.SetLevelInListTree(2);
  node.RemoveMe();
  expect(getNumberTreeChildren(root)).toEqual([]);
  expect(node.GetNumberVector()).toEqual([]);
  diagnostic.ValidateHierarchical(missing);
});

/** Requires a fixture record before asserting its literal state. @param value - Fixture record. @returns Present record. */
function required<Value>(value: Value | undefined): Value {
  if (value === undefined) throw new Error("Missing native lifecycle fixture record.");
  return value;
}

it("invalidates a validated uncounted parent when its first numbered descendant arrives", /** Verifies native InvalidateMe turns an empty uncounted start into a counted-descendant start. @returns Nothing. */ () => {
  const { document, nodes, list } = fixture([0]);
  const first = required(nodes[0]);
  first.SetCountedInList(false);
  expect(list.GetListItemNumber(first)).toBe(6);
  const child = document.nodes.MakeTextNode();
  applyWriterParagraphList(child, {
    kind: "numbered",
    level: 1,
    styleId: "Counters",
    listId: "retained",
  });
  expect(list.GetListItemNumberVector(child)).toEqual([7, 5]);
  expect(list.GetListItemNumber(first)).toBe(7);
});

/** Exposes native creation of an empty phantom pending cleanup. */
class EmptyPhantomItem extends SwNodeNum {
  /** Creates the source-owned empty child. @returns Nothing. */
  public createEmptyPhantom(): void {
    this.CreatePhantom();
  }
}
it("removes a real item with an empty phantom descendant without leaving root children", /** Verifies MoveChildren handles the empty nested phantom created before cleanup. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const root = new SwNodeNum(undefined);
  const item = new EmptyPhantomItem(document.paragraphs[0]);
  root.AddChild(item, 0);
  item.createEmptyPhantom();
  item.RemoveMe();
  expect(getNumberTreeChildren(root)).toEqual([]);
  expect(item.GetParent()).toBeUndefined();
  expect(getNumberTreeChildren(item)).toEqual([]);
});

/** Changes an independent level and applies it through native Set ownership. @param rule - Rule. @param level - Native level. @param start - Starting value. @returns Nothing. */
function updateRuleStart(rule: SwNumRule | undefined, level: number, start: number): void {
  const format = (rule as SwNumRule).Get(level).clone();
  format.SetStart(start);
  (rule as SwNumRule).Set(level, format);
}

/** Observes native protected root identity only in tests. @param node - Diagnostic record, absent for an empty fixture. @returns Root pointer or null equivalent. */
function getNumberTreeRoot(node: SwNumberTreeNode | undefined): SwNumberTreeNode | undefined {
  return (
    node as unknown as
      | {
          /** Reads the protected root. @returns Root pointer or null equivalent. */
          GetRoot(): SwNumberTreeNode | undefined;
        }
      | undefined
  )?.GetRoot();
}

/** Observes protected child storage solely for diagnostics. @param node - Owned tree record. @returns Direct children in native order. */
function getNumberTreeChildren(node: SwNumberTreeNode): readonly SwNumberTreeNode[] {
  return (node as unknown as { mChildren: SwNumberTreeNode[] }).mChildren;
}
