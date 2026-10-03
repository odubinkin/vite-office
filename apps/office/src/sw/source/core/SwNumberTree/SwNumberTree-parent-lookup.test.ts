/** @fileoverview Checks source-owned parent helper paths using actual Writer numbering records without upstream access. */
import { expect, it, vi } from "vitest";
import type { SortedVector } from "../../../../o3tl/inc/sorted_vector";
import { createWriterDocument, type SwDoc } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Exposes inherited signatures only inside tests. */
class LookupContract extends SwNodeNum {
  /** Retains nullable pointer lookup. */
  public readonly lookup = this.GetIterator.bind(this);
  /** Retains prefix position and validation default. */
  public readonly prefix = this.SetLastValid.bind(this);
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contract: [
  Same<Parameters<SwNumberTreeNode["GetPred"]>, [sibling?: boolean | undefined]>,
  Same<ReturnType<SwNumberTreeNode["GetPred"]>, SwNumberTreeNode | undefined>,
  Same<Parameters<LookupContract["lookup"]>, [SwNumberTreeNode | undefined]>,
  Same<ReturnType<LookupContract["lookup"]>, number>,
  Same<Parameters<LookupContract["prefix"]>, [number, (boolean | undefined)?]>,
  Same<ReturnType<LookupContract["prefix"]>, void>,
  Same<Extract<keyof SwNodeNum, "GetIterator" | "SetLastValid">, never>,
] = [true, true, true, true, true, true, true];

/** Observes protected methods and state only in tests. */
interface Diagnostic {
  readonly mChildren: SortedVector<SwNumberTreeNode>;
  readonly mpLastValid: SwNumberTreeNode | undefined;
  /** Looks up ordered equivalence. @param node - Required nullable pointer. @returns Index or end. */
  GetIterator(node: SwNumberTreeNode | undefined): number;
  /** Retains a prefix. @param index - Owned index or end. @param validating - Validation mode. @returns Nothing. */
  SetLastValid(index: number, validating?: boolean): void;
  /** Invalidates the child prefix. @returns Nothing. */
  InvalidateChildren(): void;
  /** Observes depth-first lookup. @returns Last descendant or absent. */
  GetLastDescendant(): SwNumberTreeNode | undefined;
  /** Traverses notification. @param document - Operation context. @returns Nothing. */
  Notify(document: SwDoc): void;
  /** Transfers actual children. @param destination - Destination pointer. @returns Nothing. */
  MoveChildren(destination: SwNumberTreeNode | undefined): void;
}
/** Views actual protected state. @param node - Owner. @returns Diagnostic view. */
function probe(node: SwNumberTreeNode): Diagnostic {
  return node as unknown as Diagnostic;
}
/** Requires a fixture owner. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing parent lookup owner");
  return value;
}
/** Builds actual shown list ownership under reading suppression. @param levels - List levels. @param continuous - Numbering mode. @returns Owners. */
function fixture(levels: number[], continuous = false) {
  const document = createWriterDocument();
  document.SetInReading(true);
  const rule = document.EnsureNumRule("ParentLookup", "numbered");
  rule.SetContinusNum(continuous);
  const texts = levels.map(
    /** Creates and numbers an actual paragraph. @param level - Depth. @param index - Position. @returns Text. */
    (level, index) => {
      const text = index === 0 ? required(document.paragraphs[0]) : document.nodes.MakeTextNode();
      applyWriterParagraphList(text, {
        kind: "numbered",
        styleId: "ParentLookup",
        listId: "parent-lookup",
        level,
      });
      return text;
    },
  );
  const records = texts.map(
    /** Reads the text-owned record. @param text - Owner. @returns Record. */ (text) =>
      required(text.GetNum()),
  );
  return { document, rule, texts, records, root: required(required(records[0]).GetParent()) };
}
/** Captures counters and ownership without validating. @param owners - Actual fixture. @returns Stable observations. */
function state(owners: ReturnType<typeof fixture>) {
  const clients: SwTextNode[] = [],
    registered: SwNodeNum[] = [];
  owners.rule.GetTextNodeList(clients);
  owners.document.getIDocumentListItems().getNumItems(registered);
  return {
    clients,
    registered,
    raw: owners.records.map(
      /** Reads only the cache. @param node - Record. @returns Counter. */ (node) =>
        node.GetNumber(false),
    ),
    parents: owners.records.map(
      /** Reads ownership. @param node - Record. @returns Parent. */ (node) => node.GetParent(),
    ),
  };
}

it("retains public predecessor defaults and protected nullable lookup and prefix contracts", /** Checks exact types and root/orphan defaults. @returns Nothing. */ () => {
  expect(contract).toEqual(Array(7).fill(true));
  const root = new LookupContract(undefined);
  expect(root.GetPred()).toBeUndefined();
  expect(root.GetPred(true)).toBeUndefined();
  expect(root.lookup(undefined)).toBe(-1);
  expect(root.lookup(new SwNodeNum(undefined))).toBe(-1);
  root.prefix(-1);
  expect(probe(root).mpLastValid).toBeUndefined();
});

it("looks up predecessors through parent helpers while retaining root exclusion and deepest descendants", /** Checks helper paths on flat and nested owned lists. @returns Nothing. */ () => {
  for (const levels of [
    [0, 0, 0],
    [0, 1, 2, 0],
  ]) {
    const owners = fixture(levels),
      { document, records, root } = owners;
    try {
      const first = required(records[0]),
        tail = required(records.at(-1));
      const before = state(owners);
      const lookup = vi.spyOn(probe(root), "GetIterator"),
        parent = vi.spyOn(root, "GetParent");
      expect(first.GetPred()).toBeUndefined();
      expect(lookup).toHaveBeenCalledExactlyOnceWith(first);
      expect(parent).toHaveBeenCalledExactlyOnceWith();
      lookup.mockClear();
      parent.mockClear();
      const previous = levels.length === 3 ? required(records[1]) : first;
      const deepest = levels.length === 3 ? previous : required(records[2]);
      const descend = vi.spyOn(probe(previous), "GetLastDescendant");
      expect(tail.GetPred()).toBe(deepest);
      expect(lookup).toHaveBeenCalledExactlyOnceWith(tail);
      expect(descend).toHaveBeenCalledExactlyOnceWith();
      expect(parent).not.toHaveBeenCalled();
      lookup.mockClear();
      descend.mockClear();
      expect(tail.GetPred(true)).toBe(previous);
      expect(lookup).toHaveBeenCalledExactlyOnceWith(tail);
      expect(descend).not.toHaveBeenCalled();
      if (levels.length === 4) {
        const nested = required(records[1]),
          lookupFirst = vi.spyOn(probe(first), "GetIterator"),
          parentFirst = vi.spyOn(first, "GetParent");
        expect(nested.GetPred(true)).toBe(first);
        expect(lookupFirst).toHaveBeenCalledExactlyOnceWith(nested);
        expect(parentFirst).toHaveBeenCalledExactlyOnceWith();
      }
      expect(state(owners)).toEqual(before);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("retains comparator-equivalent lookup after an actual unique child transfer", /** Checks supplied key and retained stored identity without inventing missing-iterator behavior. @returns Nothing. */ () => {
  const owners = fixture([0, 0, 0]),
    { document, texts, records, rule, root } = owners;
  try {
    const source = new SwNodeNum(rule),
      equivalent = new SwNodeNum(required(texts[1]), false);
    source.AddChild(equivalent, 0, document);
    probe(source).MoveChildren(root);
    expect(equivalent.GetParent()).toBe(root);
    expect([...probe(root).mChildren]).toEqual(records);
    const before = state(owners),
      lookup = vi.spyOn(probe(root), "GetIterator");
    expect(equivalent.GetPred(true)).toBe(records[0]);
    expect(lookup).toHaveBeenCalledExactlyOnceWith(equivalent);
    expect(probe(root).mChildren.at(1)).toBe(records[1]);
    expect(state(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("queries parent helpers after children and before the following uncounted notification subtree", /** Observes the notification boundary while preserving actual owned state and reading suppression. @returns Nothing. */ () => {
  const owners = fixture([0, 1, 0, 1]),
    { document, texts, records, root } = owners;
  const first = required(records[0]),
    next = required(records[2]),
    trace: string[] = [];
  try {
    required(texts[2]).SetCountedInList(false);
    const before = state(owners);
    const parentGetter = first.GetParent.bind(first),
      iterator = probe(root).GetIterator.bind(probe(root));
    vi.spyOn(first, "GetParent").mockImplementation(
      /** Logs the owned parent. @returns Parent. */ () => {
        trace.push("parent");
        return parentGetter();
      },
    );
    const lookup = vi.spyOn(probe(root), "GetIterator").mockImplementation(
      /** Logs the actual lookup. @param node - Key. @returns Position. */ (node) => {
        trace.push(node === first ? "lookup-first" : "lookup-next");
        return iterator(node);
      },
    );
    for (const [index, label] of [
      [1, "child-first"],
      [3, "child-next"],
    ] as const)
      vi.spyOn(probe(required(records[index])), "Notify").mockImplementation(
        /** Records the callback boundary without prefix mutation. @param context - Document. @returns Nothing. */ (
          context,
        ) => {
          expect(context).toBe(document);
          trace.push(label);
        },
      );
    document.SetInReading(false);
    first.NotifyInvalidChildren(document);
    expect(trace).toEqual([
      "child-first",
      "parent",
      "parent",
      "lookup-first",
      "parent",
      "child-next",
      "lookup-next",
    ]);
    expect(lookup.mock.calls).toEqual([[first], [next]]);
    expect(state(owners)).toEqual(before);
    trace.length = 0;
    lookup.mockClear();
    document.SetInReading(true);
    first.NotifyInvalidChildren(document);
    expect(trace).toEqual([]);
    expect(lookup).not.toHaveBeenCalled();
    required(texts[2]).SetCountedInList(true);
    document.SetInReading(false);
    trace.length = 0;
    lookup.mockClear();
    first.NotifyInvalidChildren(document);
    expect(trace).toEqual(["child-first", "parent", "parent", "lookup-first", "parent"]);
    expect(lookup).toHaveBeenCalledExactlyOnceWith(first);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("looks up the next uncounted subtree only when the selected prefix guard changes its boundary", /** Checks false default, validation, rewind and end reset without counter mutation. @returns Nothing. */ () => {
  const owners = fixture([0, 1, 1, 0, 1, 0, 1]),
    { document, texts, records, root } = owners;
  const first = required(records[0]),
    next = required(records[3]),
    last = required(records[5]);
  try {
    required(texts[3]).SetCountedInList(false);
    for (const record of records) record.GetNumberVector();
    const before = state(owners),
      lookup = vi.spyOn(probe(root), "GetIterator"),
      parent = vi.spyOn(first, "GetParent"),
      invalidate = vi.spyOn(probe(next), "InvalidateChildren");
    probe(first).SetLastValid(1);
    expect(lookup).not.toHaveBeenCalled();
    expect(parent).not.toHaveBeenCalled();
    probe(first).SetLastValid(1, true);
    expect(lookup.mock.calls).toEqual([[first], [next]]);
    expect(parent).toHaveBeenCalledTimes(3);
    expect(invalidate).toHaveBeenCalledExactlyOnceWith();
    lookup.mockClear();
    parent.mockClear();
    invalidate.mockClear();
    probe(first).SetLastValid(0);
    expect(lookup.mock.calls).toEqual([[first], [next]]);
    expect(parent).toHaveBeenCalledTimes(3);
    expect(probe(first).mpLastValid).toBe(records[1]);
    expect(probe(next).mpLastValid).toBeUndefined();
    expect(probe(last).mpLastValid).toBe(records[6]);
    lookup.mockClear();
    parent.mockClear();
    probe(first).SetLastValid(-1);
    expect(lookup.mock.calls).toEqual([[first], [next]]);
    expect(parent).toHaveBeenCalledTimes(3);
    expect(probe(first).mpLastValid).toBeUndefined();
    expect(state(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("retains continuous parent propagation after helper lookup and invalidates suffix prefixes only", /** Checks actual caches, parent iterator forwarding and notification under reading suppression. @returns Nothing. */ () => {
  const owners = fixture([0, 1, 0, 1, 0, 1], true),
    { document, records, root } = owners;
  const first = required(records[0]),
    middle = required(records[2]),
    last = required(records[4]);
  try {
    expect(required(records[5]).GetNumberVector()).toEqual([5, 6]);
    const before = state(owners),
      lookup = vi.spyOn(probe(root), "GetIterator"),
      parent = vi.spyOn(first, "GetParent"),
      prefix = vi.spyOn(probe(root), "SetLastValid");
    probe(first).InvalidateChildren();
    expect(lookup.mock.calls).toEqual([[first], [first]]);
    expect(parent).toHaveBeenCalledTimes(3);
    expect(prefix).toHaveBeenCalledExactlyOnceWith(0, false);
    expect([
      probe(root).mpLastValid,
      probe(first).mpLastValid,
      probe(middle).mpLastValid,
      probe(last).mpLastValid,
    ]).toEqual([first, undefined, undefined, undefined]);
    expect(state(owners)).toEqual(before);
    lookup.mockClear();
    prefix.mockClear();
    parent.mockClear();
    const notify = vi.spyOn(root, "NotifyInvalidChildren");
    first.NotifyInvalidChildren(document);
    expect(notify).toHaveBeenCalledExactlyOnceWith(document);
    expect(lookup).not.toHaveBeenCalled();
    expect(parent).not.toHaveBeenCalled();
    expect(state(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});
