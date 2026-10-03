/** @fileoverview Verifies hierarchical policy state and owner traversal using actual Writer records without upstream access. */
import { expect, it, vi } from "vitest";
import type { SortedVector } from "../../../../o3tl/inc/sorted_vector";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Retains the protected signature solely in tests. */
class HierarchicalContract extends SwNodeNum {
  /** Retains explicit nullable target validation. */
  public readonly hierarchical = this.ValidateHierarchical.bind(this);
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contracts: [
  Same<Parameters<HierarchicalContract["hierarchical"]>, [SwNumberTreeNode | undefined]>,
  Same<ReturnType<HierarchicalContract["hierarchical"]>, void>,
  Same<Extract<keyof SwNumberTreeNode, "ValidateHierarchical">, never>,
  Same<Extract<keyof SwNodeNum, "ValidateHierarchical">, never>,
] = [true, true, true, true];
/** Observes protected ownership and policies only in tests. */
interface Diagnostic {
  readonly mChildren: SortedVector<SwNumberTreeNode>;
  readonly mpLastValid: SwNumberTreeNode | undefined;
  /** Gets the attached root. @returns Root pointer. */
  GetRoot(): SwNumberTreeNode | undefined;
  /** Validates a child prefix. @param target - Explicit nullable target. @returns Nothing. */
  ValidateHierarchical(target: SwNumberTreeNode | undefined): void;
  /** Gets an ordered key. @param target - Explicit nullable key. @returns Position. */
  GetIterator(target: SwNumberTreeNode | undefined): number;
  /** Commits the prefix. @param index - Owned position or end. @param validating - Validation flag. @returns Nothing. */
  SetLastValid(index: number, validating?: boolean): void;
  /** Reads actual counted descendants. @returns Policy. */
  HasCountedChildren(): boolean;
}
/** Reads the native protected diagnostic surface. @param node - Actual owner. @returns View. */
function probe(node: SwNumberTreeNode): Diagnostic {
  return node as unknown as Diagnostic;
}
/** Requires an owned fixture value. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing hierarchical policy owner");
  return value;
}
/** Describes actual paragraph attributes. */
interface Item {
  level: number;
  counted?: boolean;
  restart?: number;
}
/** Creates actual lists and rule-owned starts. @param items - Paragraph profiles. @param start - Start for every owned level. @param phantoms - Phantom counting mode. @returns Owners. */
function fixture(items: Item[], start = 0, phantoms = true) {
  const document = createWriterDocument();
  document.SetInReading(true);
  const rule = document.EnsureNumRule("HierarchicalPolicy", "numbered");
  rule.SetCountPhantoms(phantoms);
  for (let level = 0; level < 10; level++) {
    const format = rule.Get(level).clone();
    format.SetStart(start);
    rule.Set(level, format);
  }
  const texts = items.map(
    /** Allocates a canonical paragraph with source attributes. @param item - Policy. @param index - Ordinal. @returns Text. */
    (item, index) => {
      const text = index === 0 ? required(document.paragraphs[0]) : document.nodes.MakeTextNode();
      applyWriterParagraphList(text, {
        kind: "numbered",
        level: item.level,
        styleId: "HierarchicalPolicy",
        listId: "hierarchical-policy",
      });
      if (item.counted === false) text.SetCountedInList(false);
      if (item.restart !== undefined) {
        text.SetListRestart(true);
        text.SetAttrListRestartValue(item.restart);
      }
      return text;
    },
  );
  const records = texts.map(
    /** Gets actual text ownership. @param text - Paragraph. @returns Record. */ (text) =>
      required(text.GetNum()),
  );
  return { document, texts, records, rule, root: required(probe(required(records[0])).GetRoot()) };
}
/** Captures ownership without reading counters. @param owners - Fixture. @returns Stable owners. */
function ownership(owners: ReturnType<typeof fixture>) {
  const clients: SwTextNode[] = [],
    registered: SwNodeNum[] = [];
  owners.rule.GetTextNodeList(clients);
  owners.document.getIDocumentListItems().getNumItems(registered);
  return {
    clients,
    registered,
    parents: owners.records.map(
      /** Reads the parent. @param node - Record. @returns Parent. */ (node) => node.GetParent(),
    ),
  };
}
/** Reads stored counters only. @param records - Actual records. @returns Cache values. */
function raw(records: SwNodeNum[]): number[] {
  return records.map(
    /** Reads one unvalidated counter. @param node - Record. @returns Counter. */ (node) =>
      node.GetNumber(false),
  );
}

it("keeps protected required nullable targets and returns before policies for null or missing keys", /** Checks exact signature and unchanged first caches on release end targets. @returns Nothing. */ () => {
  expect(contracts).toEqual([true, true, true, true]);
  const owners = fixture([{ level: 0 }, { level: 0 }]),
    { document, records, root } = owners;
  try {
    const before = ownership(owners),
      lookup = vi.spyOn(probe(root), "GetIterator"),
      start = vi.spyOn(required(records[0]), "GetStartValue"),
      prefix = vi.spyOn(probe(root), "SetLastValid");
    const foreign = new SwNodeNum(document.nodes.MakeTextNode(), false);
    probe(root).ValidateHierarchical(undefined);
    probe(root).ValidateHierarchical(foreign);
    expect(lookup.mock.calls).toEqual([[undefined], [foreign]]);
    expect(start).not.toHaveBeenCalled();
    expect(prefix).not.toHaveBeenCalled();
    expect(raw(records)).toEqual([0, 0]);
    expect(probe(root).mpLastValid).toBeUndefined();
    expect(ownership(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("clears actual retained continuation before virtual start counted and descendant policies", /** Revalidates genuine continuation under counted and uncounted child profiles. @returns Nothing. */ () => {
  for (const counted of [true, false]) {
    const owners = fixture([
        { level: 0 },
        { level: 1 },
        { level: 0, counted: false },
        { level: 1, counted },
      ]),
      { document, records, root } = owners;
    const child = required(records[3]),
      parent = required(child.GetParent()),
      trace: string[] = [];
    try {
      expect(child.GetNumberVector()).toEqual([0, counted ? 1 : 0]);
      expect(child.IsContinueingPreviousSubTree()).toBe(true);
      root.InvalidateTree();
      expect(child.IsContinueingPreviousSubTree()).toBe(true);
      const before = ownership(owners),
        caches = raw(records),
        start = child.GetStartValue.bind(child),
        count = child.IsCounted.bind(child),
        descendants = probe(child).HasCountedChildren.bind(probe(child));
      vi.spyOn(child, "GetStartValue").mockImplementation(
        /** Observes pre-policy state. @returns Start. */ () => {
          trace.push(`start:${child.IsContinueingPreviousSubTree()}`);
          return start();
        },
      );
      vi.spyOn(child, "IsCounted").mockImplementation(
        /** Observes counted-policy state. @returns Counted. */ () => {
          trace.push(`counted:${child.IsContinueingPreviousSubTree()}`);
          return count();
        },
      );
      vi.spyOn(probe(child), "HasCountedChildren").mockImplementation(
        /** Observes descendant-policy state. @returns Descendant policy. */ () => {
          trace.push(`children:${child.IsContinueingPreviousSubTree()}`);
          return descendants();
        },
      );
      probe(parent).ValidateHierarchical(child);
      expect(trace).toEqual([
        "start:false",
        "counted:false",
        ...(counted ? [] : ["children:false"]),
        "counted:true",
      ]);
      expect(child.IsContinueingPreviousSubTree()).toBe(true);
      expect(probe(parent).mpLastValid).toBe(child);
      expect(raw(records)).toEqual(caches);
      expect(ownership(owners)).toEqual(before);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("uses parent lookup and preceding child-count policy while skipping empty uncounted siblings", /** Checks the actual backward search and default validated previous counter before prefix commit. @returns Nothing. */ () => {
  const owners = fixture([
      { level: 0 },
      { level: 1 },
      { level: 0, counted: false },
      { level: 0, counted: false },
      { level: 1 },
    ]),
    { document, records, root } = owners;
  const first = required(records[0]),
    preceding = required(records[1]),
    empty = required(records[2]),
    parent = required(records[3]),
    child = required(records[4]),
    trace: string[] = [];
  try {
    preceding.GetNumberVector();
    const before = ownership(owners),
      originalParent = parent.GetParent.bind(parent),
      originalLookup = probe(root).GetIterator.bind(probe(root)),
      originalCount = first.GetChildCount.bind(first),
      emptyCount = empty.GetChildCount.bind(empty),
      emptyPolicy = empty.IsCounted.bind(empty),
      previousNumber = preceding.GetNumber.bind(preceding),
      commit = probe(parent).SetLastValid.bind(probe(parent));
    vi.spyOn(parent, "GetParent").mockImplementation(
      /** Reads the actual parent. @returns Parent. */ () => {
        trace.push("parent");
        return originalParent();
      },
    );
    vi.spyOn(probe(root), "GetIterator").mockImplementation(
      /** Reads the actual key. @param target - Child. @returns Position. */ (target) => {
        trace.push(target === parent ? "iterator-parent" : "iterator-other");
        return originalLookup(target);
      },
    );
    vi.spyOn(empty, "GetChildCount").mockImplementation(
      /** Reads the empty sibling. @returns Count. */ () => {
        trace.push("count-empty");
        return emptyCount();
      },
    );
    vi.spyOn(empty, "IsCounted").mockImplementation(
      /** Reads the empty policy. @returns Counted. */ () => {
        trace.push("policy-empty");
        return emptyPolicy();
      },
    );
    vi.spyOn(first, "GetChildCount").mockImplementation(
      /** Reads the preceding subtree. @returns Count. */ () => {
        trace.push("count-subtree");
        return originalCount();
      },
    );
    const counter = vi.spyOn(preceding, "GetNumber").mockImplementation(
      /** Preserves native default counter validation. @param validate - Optional validation. @returns Counter. */ (
        validate,
      ) => {
        trace.push("number");
        return previousNumber(validate);
      },
    );
    vi.spyOn(probe(parent), "SetLastValid").mockImplementation(
      /** Marks the commit boundary. @param index - Position. @param validating - Mode. @returns Nothing. */ (
        index,
        validating,
      ) => {
        trace.push("prefix");
        commit(index, validating);
      },
    );
    probe(parent).ValidateHierarchical(child);
    expect(trace.slice(0, trace.indexOf("prefix"))).toEqual([
      "parent",
      "parent",
      "iterator-parent",
      "count-empty",
      "policy-empty",
      "count-subtree",
      "number",
    ]);
    expect(counter).toHaveBeenCalledExactlyOnceWith();
    expect(child.GetNumber(false)).toBe(1);
    expect(child.IsContinueingPreviousSubTree()).toBe(true);
    expect(probe(parent).mpLastValid).toBe(child);
    expect(ownership(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("stops backward continuation at a counted empty sibling and retains the owned start", /** Checks the counted barrier without reading the older subtree counter. @returns Nothing. */ () => {
  const owners = fixture(
      [{ level: 0 }, { level: 1 }, { level: 0 }, { level: 0, counted: false }, { level: 1 }],
      7,
    ),
    { document, records } = owners;
  const barrier = required(records[2]),
    parent = required(records[3]),
    child = required(records[4]);
  try {
    const count = vi.spyOn(barrier, "GetChildCount"),
      counted = vi.spyOn(barrier, "IsCounted"),
      oldCounter = vi.spyOn(required(records[1]), "GetNumber");
    probe(parent).ValidateHierarchical(child);
    expect(count).toHaveBeenCalledExactlyOnceWith();
    expect(counted).toHaveBeenCalledExactlyOnceWith();
    expect(oldCounter).not.toHaveBeenCalled();
    expect(child.GetNumber(false)).toBe(7);
    expect(child.IsContinueingPreviousSubTree()).toBe(false);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("short-circuits previous lookup for restarted children counted parents and first-position parents", /** Covers restart zero,counted-parent and empty backward-search boundaries. @returns Nothing. */ () => {
  for (const [counted, restart, first] of [
    [true, undefined, false],
    [false, 0, false],
    [false, undefined, true],
  ] as const) {
    const items: Item[] = first
      ? [{ level: 0, counted }, { level: 1 }]
      : [
          { level: 0 },
          { level: 1 },
          { level: 0, counted },
          { level: 1, ...(restart === undefined ? {} : { restart }) },
        ];
    const owners = fixture(items, 5),
      { document, records, root } = owners;
    const child = required(records.at(-1)),
      parent = required(child.GetParent());
    try {
      const lookup = vi.spyOn(probe(root), "GetIterator"),
        count = vi.spyOn(required(records[0]), "GetChildCount");
      probe(parent).ValidateHierarchical(child);
      expect(lookup.mock.calls.slice(0, first ? 2 : 1)).toEqual(
        first ? [[parent], [parent]] : [[parent]],
      );
      expect(count).not.toHaveBeenCalled();
      expect(child.GetNumber(false)).toBe(restart ?? 5);
      expect(child.IsContinueingPreviousSubTree()).toBe(false);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("retains ordered-equivalent targets cached prefixes signed starts restarts and phantom profiles", /** Checks first and later sibling policies and deferred phantom caches against literal source-derived values. @returns Nothing. */ () => {
  for (const [items, start, phantoms, values] of [
    [[{ level: 0, counted: false }, { level: 0 }, { level: 0, restart: 0 }], 0, true, [-1, 0, 0]],
    [[{ level: 0, counted: false }, { level: 1 }, { level: 0 }], 0, true, [0, 0, 1]],
    [[{ level: 0 }, { level: 0, counted: false, restart: 8 }, { level: 0 }], 7, true, [7, 7, 8]],
    [[{ level: 2 }], 0, false, [0]],
    [[{ level: 2 }], 0, true, [0]],
  ] as const) {
    const owners = fixture([...items], start, phantoms),
      { document, texts, records, root } = owners;
    try {
      const before = ownership(owners);
      if (items[0].level === 0) {
        const equivalent = new SwNodeNum(required(texts[0]), false);
        probe(root).ValidateHierarchical(equivalent);
        expect(probe(root).mpLastValid).toBe(records[0]);
        const startPolicy = vi.spyOn(required(records[0]), "GetStartValue");
        probe(root).ValidateHierarchical(required(records.at(-1)));
        expect(startPolicy).not.toHaveBeenCalled();
      }
      for (const record of records) record.GetNumberVector();
      expect(raw(records)).toEqual(values);
      if (items[0].level === 2)
        expect(required(records[0]).GetNumberVector()).toEqual(phantoms ? [0, 0, 0] : [-1, -1, 0]);
      expect(ownership(owners)).toEqual(before);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});
