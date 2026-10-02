/** @fileoverview Verifies source-owned signed first/sibling counters, zero restarts and uncounted-parent subtrees. */
import type { SwNumRule } from "../doc/number";
import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList, type SwList } from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";
import { SwNumberTreeNode } from "./SwNumberTree";

/** Literal source-derived list item policy. */
interface Item {
  readonly level: number;
  readonly counted?: boolean;
  readonly restart?: number;
}
/** Builds a canonical list from literal policies. @param items - Ordered items. @param start - Per-level start. @returns Document, items and owned list. */
function fixture(items: readonly Item[], start = 0) {
  const document = createWriterDocument();
  const rule = document.EnsureNumRule("Counters", "numbered", 0);
  for (let level = 0; level < 10; level++) {
    updateRuleStart(rule, level, start);
    const format = rule.Get(level).clone();
    format.SetListFormat(
      Array.from(
        { length: level + 1 },
        /** Adds one included level reference. @param _slot - Array slot. @param index - Level. @returns Placeholder. */
        (_slot, index) => `%${index + 1}%`,
      ).join(".") + ".",
    );
    rule.Set(level, format);
  }
  const nodes = items.map(
    /** Applies one literal node policy. @param item - Policy. @param index - Document index. @returns Text node. */
    (item, index) => {
      const node =
        index === 0 ? (document.paragraphs[0] as SwTextNode) : document.nodes.MakeTextNode();
      applyWriterParagraphList(node, {
        kind: "numbered",
        level: item.level,
        styleId: "Counters",
        listId: "counter-list",
      });
      if (item.counted === false) node.SetCountedInList(false);
      if (item.restart !== undefined) {
        node.SetListRestart(true);
        node.SetAttrListRestartValue(item.restart);
      }
      return node;
    },
  );
  return {
    document,
    nodes,
    list: document.GetDocumentListsManager().GetListByName("counter-list") as SwList,
  };
}

it("initializes structurally and advances counted siblings after zero", /** Asserts signed values and actual labels across starts, restarts and uncounted nodes. @returns Nothing. */ () => {
  for (const test of [
    {
      items: [{ level: 0 }, { level: 0 }, { level: 0 }],
      values: [0, 1, 2],
      labels: ["0.", "1.", "2."],
    },
    {
      start: 7,
      items: [{ level: 0 }, { level: 0, restart: 0 }, { level: 0 }],
      values: [7, 0, 1],
      labels: ["7.", "0.", "1."],
    },
    {
      items: [{ level: 0, restart: 0 }, { level: 0, restart: 0 }, { level: 0 }],
      values: [0, 0, 1],
      labels: ["0.", "0.", "1."],
    },
    {
      items: [{ level: 0, counted: false }, { level: 0 }, { level: 0 }],
      values: [-1, 0, 1],
      labels: [undefined, "0.", "1."],
    },
    {
      items: [{ level: 0 }, { level: 0, counted: false }, { level: 0 }],
      values: [0, 0, 1],
      labels: ["0.", undefined, "1."],
    },
    {
      items: [{ level: 0 }, { level: 0, counted: false, restart: 7 }, { level: 0 }],
      values: [0, 0, 1],
      labels: ["0.", undefined, "1."],
    },
  ]) {
    const { nodes, list } = fixture(test.items, test.start);
    expect(
      nodes.map(
        /** Reads a calculated counter. @param node - Item. @returns Counter. */ (node) =>
          node.GetListItemNumber(),
      ),
    ).toEqual(test.values);
    expect(
      nodes.map(
        /** Reads a visible marker. @param node - Item. @returns Marker. */ (node) =>
          node.GetListLabel(),
      ),
    ).toEqual(test.labels);
    expect(list.GetListItem(nodes[0] as SwTextNode)).toBeInstanceOf(SwNumberTreeNode);
    const root = list.GetListItem(nodes[0] as SwTextNode)?.GetParent() as SwNodeNum;
    expect(root.GetLevelInListTree()).toBe(-1);
    expect(root.GetTextNode()).toBeUndefined();
    expect(root.IsCounted()).toBe(true);
    expect(root.IsRestart()).toBe(false);
    expect(root.GetStartValue()).toBe(test.start ?? 0);
    expect(root.GetNumberVector()).toEqual([]);
  }
});

it("retains native first uncounted descendant and nested sibling rules", /** Verifies counted descendants, signed first values, nested reset and complete vectors. @returns Nothing. */ () => {
  for (const [items, values] of [
    [
      [{ level: 0, counted: false }, { level: 1 }, { level: 0 }],
      [0, 0, 1],
    ],
    [
      [{ level: 0, counted: false }, { level: 1, counted: false }, { level: 0 }],
      [-1, -1, 0],
    ],
    [
      [{ level: 0, counted: false }, { level: 1, counted: false }, { level: 2 }, { level: 0 }],
      [-1, 0, 0, 0],
    ],
    [
      [{ level: 0 }, { level: 1 }, { level: 1 }, { level: 0 }, { level: 1 }],
      [0, 0, 1, 1, 0],
    ],
  ] as const) {
    const { nodes } = fixture(items);
    expect(
      nodes.map(
        /** Reads a calculated counter. @param node - Item. @returns Counter. */ (node) =>
          node.GetListItemNumber(),
      ),
    ).toEqual(values);
  }
  const { nodes, list } = fixture([
    { level: 0 },
    { level: 1 },
    { level: 1 },
    { level: 0 },
    { level: 1 },
  ]);
  expect(nodes[4]?.GetListLabel()).toBe("1.0.");
  expect(list.GetListItemNumberVector(nodes[4] as SwTextNode)).toEqual([1, 0]);
});

it("continues a subtree only below native uncounted parents", /** Verifies prior-subtree search, counted barriers, ignored later restarts and first-child restart override. @returns Nothing. */ () => {
  for (const [items, values, continuation] of [
    [
      [{ level: 0 }, { level: 1 }, { level: 1 }, { level: 0, counted: false }, { level: 1 }],
      [0, 0, 1, 0, 2],
      [false, false, false, false, true],
    ],
    [
      [
        { level: 0 },
        { level: 1 },
        { level: 0, counted: false },
        { level: 0, counted: false },
        { level: 1 },
      ],
      [0, 0, 0, 0, 1],
      [false, false, false, false, true],
    ],
    [
      [{ level: 0 }, { level: 1 }, { level: 0 }, { level: 0, counted: false }, { level: 1 }],
      [0, 0, 1, 1, 0],
      [false, false, false, false, false],
    ],
    [
      [{ level: 0, counted: false }, { level: 1 }, { level: 0, counted: false }, { level: 1 }],
      [0, 0, 0, 1],
      [false, false, false, true],
    ],
    [
      [
        { level: 0 },
        { level: 1 },
        { level: 0, counted: false },
        { level: 1, restart: 0 },
        { level: 1 },
      ],
      [0, 0, 0, 0, 1],
      [false, false, false, false, false],
    ],
    [
      [
        { level: 0 },
        { level: 1 },
        { level: 1 },
        { level: 0, counted: false },
        { level: 1, counted: false },
        { level: 1 },
      ],
      [0, 0, 1, 0, 1, 2],
      [false, false, false, false, true, false],
    ],
  ] as const) {
    const { nodes, list } = fixture(items);
    expect(
      nodes.map(
        /** Reads a calculated counter. @param node - Item. @returns Counter. */ (node) =>
          node.GetListItemNumber(),
      ),
    ).toEqual(values);
    expect(
      nodes.map(
        /** Reads native continuation state. @param node - Item. @returns Continuation flag. */ (
          node,
        ) => list.GetListItem(node)?.IsContinueingPreviousSubTree(),
      ),
    ).toEqual(continuation);
  }
});

it("revalidates zero restarts, counted changes and phantom ancestors", /** Verifies invalidation, canonical reparenting/removal and source-owned skipped-level ancestors. @returns Nothing. */ () => {
  const { nodes, list } = fixture([{ level: 0 }, { level: 0 }, { level: 0 }]);
  const middle = nodes[1] as SwTextNode;
  middle.SetListRestart(true);
  middle.SetAttrListRestartValue(0);
  expect(nodes[2]?.GetListLabel()).toBe("1.");
  middle.SetCountedInList(false);
  expect(nodes[2]?.GetListLabel()).toBe("1.");
  middle.SetCountedInList(true);
  middle.SetAttrListLevel(1);
  expect(middle.GetListLabel()).toBe("0.0.");
  expect(nodes[2]?.GetListLabel()).toBe("1.");
  middle.RemoveFromList();
  list.ValidateListTree();
  expect(list.GetListItemNumber(middle)).toBeUndefined();
  const missing = fixture([{ level: 2 }, { level: 2 }, { level: 0 }, { level: 2 }]);
  expect(
    missing.nodes.map(
      /** Reads bounded counters. @param node - Item. @returns Counter. */ (node) =>
        node.GetListItemNumber(),
    ),
  ).toEqual([0, 1, 1, 0]);
  expect(missing.list.GetListItemNumberVector(missing.nodes[1] as SwTextNode)).toEqual([0, 0, 1]);
});

it("retains native root and unattached node numbering policy", /** Verifies no-text roots, missing rules and numbering-present descendant policy. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const node = new SwNodeNum(document.paragraphs[0] as SwTextNode);
  const root = new SwNodeNum(undefined);
  expect(node.GetStartValue()).toBe(1);
  expect(node.IsCountedForNumbering()).toBe(false);
  root.AddChild(node, 1);
  expect(root.HasCountedChildren()).toBe(false);
  expect(root.IsCountedForNumbering()).toBe(true);
  expect(root.GetStartValue()).toBe(1);
  const rule = document.EnsureNumRule("Levels", "numbered", 0);
  updateRuleStart(rule, 0, 7);
  updateRuleStart(rule, 1, 3);
  applyWriterParagraphList(document.paragraphs[0] as SwTextNode, {
    kind: "numbered",
    level: 0,
    styleId: "Levels",
  });
  node.RemoveMe();
  expect(node.GetStartValue()).toBe(1);
  root.AddChild(node, 1);
  expect(node.GetStartValue()).toBe(3);
  expect(root.HasCountedChildren()).toBe(true);
});

it("constructs rule-start phantom chains and retains them through removal", /** Verifies actual labels, derived depth, phantom topology and reinsertion. @returns Nothing. */ () => {
  const { document, nodes, list } = fixture([
    { level: 2 },
    { level: 2 },
    { level: 0 },
    { level: 2 },
  ]);
  const rule = document.FindNumRulePtr("Counters");
  updateRuleStart(rule, 0, 7);
  updateRuleStart(rule, 1, 5);
  updateRuleStart(rule, 2, 3);
  list.InvalidateListTree();
  expect(
    nodes.map(
      /** Reads the actual marker. @param node - Item. @returns Marker. */ (node) =>
        node.GetListLabel(),
    ),
  ).toEqual(["7.5.3.", "7.5.4.", "8.", "8.5.3."]);
  const item = list.GetListItem(nodes[0] as SwTextNode) as SwNodeNum;
  expect(item.GetNumberVector()).toEqual([7, 5, 3]);
  expect(item.GetLevelInListTree()).toBe(2);
  expect(item.GetParent()?.IsPhantom()).toBe(true);
  expect(item.GetParent()?.GetParent()?.IsPhantom()).toBe(true);
  expect(item.HasPhantomCountedParent()).toBe(false);
  const root = getNumberTreeRoot(item) as SwNodeNum;
  expect(getNumberTreeRoot(root)).toBeUndefined();
  expect(root.GetLevelInListTree()).toBe(-1);
  expect(root.IsPhantom()).toBe(false);
  (nodes[2] as SwTextNode).RemoveFromList();
  list.ValidateListTree();
  expect(list.GetListItemNumberVector(nodes[3] as SwTextNode)).toEqual([7, 5, 5]);
  (nodes[2] as SwTextNode).AddToList();
  list.ValidateListTree();
  expect(list.GetListItemNumberVector(nodes[3] as SwTextNode)).toEqual([8, 5, 3]);
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
