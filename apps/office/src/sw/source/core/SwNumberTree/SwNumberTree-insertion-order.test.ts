/** @fileoverview Verifies insertion evaluation order with actual Writer owners and owned traces only. */
import { expect, it, vi } from "vitest";
import type { SortedVector } from "../../../../o3tl/inc/sorted_vector";
import { createWriterDocument, type SwDoc } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Exposes insertion diagnostics exclusively to tests. */
interface InsertionDiagnostic {
  readonly mChildren: SortedVector<SwNumberTreeNode>;
  /** Binds the rule before insertion. @returns Nothing. */
  PreAdd(): void;
  /** Removes unused phantoms. @returns Nothing. */
  ClearObsoletePhantoms(): void;
}
/** Reads the protected diagnostic surface. @param node - Actual record. @returns Test-only hooks. */
function probe(node: SwNumberTreeNode): InsertionDiagnostic {
  return node as unknown as InsertionDiagnostic;
}
/** Requires a fixture value. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing insertion fixture owner");
  return value;
}
/** Records actual calls while retaining the original implementations. @param root - Destination. @param child - Inserted record. @param document - Owner. @returns Trace and captured policy state. */
function observe(root: SwNumberTreeNode, child: SwNodeNum, document: SwDoc) {
  const events: string[] = [];
  const policies: {
    parent: boolean;
    rule: boolean;
    children: number;
    reading: boolean;
    context: boolean;
  }[] = [];
  const storage = probe(root).mChildren;
  for (const name of ["upper_bound", "lower_bound"] as const) {
    const original = storage[name].bind(storage);
    vi.spyOn(storage, name).mockImplementation(
      /** Records the lookup. @param value - Comparison key. @returns Position. */
      (value) => {
        if (
          name === "upper_bound" ||
          (policies.length === 0 && (value === child || value.IsPhantom()))
        )
          events.push(name === "upper_bound" ? "upper" : "lower");
        return original(value);
      },
    );
  }
  for (const name of ["PreAdd", "ClearObsoletePhantoms"] as const) {
    const hooks = probe(child);
    const original = hooks[name].bind(child);
    vi.spyOn(hooks, name).mockImplementation(
      /** Records the insertion hook. @returns Nothing. */ () => {
        events.push(name === "PreAdd" ? "pre" : "child-clear");
        original();
      },
    );
  }
  const original = child.IsNotificationEnabled.bind(child);
  vi.spyOn(child, "IsNotificationEnabled").mockImplementation(
    /** Records state at the native policy boundary. @param context - Supplied document. @returns Actual policy. */
    (context) => {
      events.push("policy");
      policies.push({
        parent: child.GetParent() !== undefined,
        rule: child.GetNumRule() !== undefined,
        children: child.GetChildCount(),
        reading: document.IsInReading(),
        context: context === document,
      });
      return original(context);
    },
  );
  const notification = vi.spyOn(root, "NotifyInvalidChildren");
  return { events, policies, notification };
}
/** Creates an orphan retaining its actual paragraph owner and list root. @returns Owned fixture. */
function emptyFixture() {
  const document = createWriterDocument();
  document.SetInReading(true);
  const text = required(document.paragraphs[0]);
  applyWriterParagraphList(text, {
    kind: "numbered",
    level: 0,
    styleId: "Insertion",
    listId: "insertion",
  });
  const child = required(text.GetNum());
  const root = required(child.GetParent());
  child.RemoveMe(document);
  return { document, text, child, root };
}
/** Creates a preceding item whose later descendant must transfer to an inserted sibling. @returns Owned fixture. */
function siblingFixture() {
  const document = createWriterDocument();
  document.SetInReading(true);
  const texts = [
    required(document.paragraphs[0]),
    document.nodes.MakeTextNode(),
    document.nodes.MakeTextNode(),
  ];
  for (const [index, level] of [
    [0, 0],
    [2, 1],
    [1, 0],
  ] as const)
    applyWriterParagraphList(required(texts[index]), {
      kind: "numbered",
      level,
      styleId: "Insertion",
      listId: "insertion",
    });
  const first = required(required(texts[0]).GetNum());
  const child = required(required(texts[1]).GetNum());
  const nested = required(required(texts[2]).GetNum());
  const root = required(first.GetParent());
  child.RemoveMe(document);
  expect(nested.GetParent()).toBe(first);
  return { document, first, child, nested, root };
}
/** Asserts policy observations without serializing the owner graph. @param reading - Original mode. @returns Expected observation. */
function policy(reading: boolean) {
  return [{ parent: true, rule: true, children: 0, reading, context: true }];
}

it("uses direct unique insertion and skips first-child cleanup, duplicate policies and invalid guards", /** Checks callback ordering and literal raw state. @returns Nothing. */ () => {
  const { document, text, child, root } = emptyFixture();
  try {
    const first = observe(root, child, document);
    root.AddChild(child, -1, document);
    expect(first.events).toEqual([]);
    root.AddChild(child, 0, document);
    expect(first.events).toEqual(["pre", "lower", "policy"]);
    expect(first.policies).toEqual(policy(true));
    expect(first.notification).not.toHaveBeenCalled();
    expect(child.GetParent()).toBe(root);
    expect(child.GetNumber(false)).toBe(0);
    first.events.length = 0;
    root.AddChild(child, 0, document);
    expect(first.events).toEqual([]);
    vi.restoreAllMocks();
    const duplicate = new SwNodeNum(text, false);
    const rejected = observe(root, duplicate, document);
    root.AddChild(duplicate, 0, document);
    expect(rejected.events).toEqual(["pre", "lower"]);
    expect(rejected.policies).toEqual([]);
    expect(rejected.notification).not.toHaveBeenCalled();
    expect(duplicate.GetParent()).toBeUndefined();
    expect(duplicate.GetNumRule()).toBe(child.GetNumRule());
    expect([...probe(root).mChildren]).toEqual([child]);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("captures the bound sibling policy before descendant transfer and child cleanup", /** Checks actual document ownership and raw caches. @returns Nothing. */ () => {
  const { document, first, child, nested, root } = siblingFixture();
  try {
    const trace = observe(root, child, document);
    root.AddChild(child, 0, document);
    expect(trace.events).toEqual(["pre", "lower", "policy", "child-clear"]);
    expect(trace.policies).toEqual(policy(true));
    expect([...probe(root).mChildren]).toEqual([first, child]);
    expect([...probe(child).mChildren]).toEqual([nested]);
    expect(nested.GetParent()).toBe(child);
    expect([first.GetNumber(false), child.GetNumber(false), nested.GetNumber(false)]).toEqual([
      0, 0, 0,
    ]);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("retains both captured notification decisions when reading changes during suffix comparison", /** Checks policy timing through real owner mode changes. @returns Nothing. */ () => {
  for (const reading of [true, false]) {
    const { document, first, child, nested, root } = siblingFixture();
    try {
      document.SetInReading(reading);
      const trace = observe(root, child, document);
      const original = child.LessThan.bind(child);
      let flipped = false;
      let moving = false;
      const source = probe(first).mChildren;
      const upper = source.upper_bound.bind(source);
      vi.spyOn(source, "upper_bound").mockImplementation(
        /** Identifies actual transfer comparisons independently of registry comparisons. @param value - Boundary. @returns Position. */
        (value) => {
          moving = true;
          try {
            return upper(value);
          } finally {
            moving = false;
          }
        },
      );
      vi.spyOn(child, "LessThan").mockImplementation(
        /** Changes the owner mode only at the first descendant comparison. @param other - Native comparison record. @returns Original ordering. */
        (other) => {
          if (moving && other === nested && !flipped) {
            flipped = true;
            document.SetInReading(!reading);
            trace.events.push("flip");
          }
          return original(other);
        },
      );
      root.AddChild(child, 0, document);
      expect(trace.events).toEqual(["pre", "lower", "policy", "flip", "child-clear"]);
      expect(trace.policies).toEqual(policy(reading));
      expect(trace.notification).toHaveBeenCalledTimes(reading ? 0 : 1);
      expect(document.IsInReading()).toBe(!reading);
      expect([...probe(root).mChildren]).toEqual([first, child]);
      expect(nested.GetParent()).toBe(child);
      expect([first.GetNumber(false), child.GetNumber(false), nested.GetNumber(false)]).toEqual([
        0, 0, 0,
      ]);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("reserves upper-bound lookup for deeper insertion and binds a first child below its phantom", /** Checks the recursive branch without validating counters. @returns Nothing. */ () => {
  const { document, child, root } = emptyFixture();
  try {
    const trace = observe(root, child, document);
    root.AddChild(child, 1, document);
    expect(trace.events).toEqual(["upper", "lower", "pre", "policy"]);
    expect(trace.policies).toEqual(policy(true));
    const phantom = required(child.GetParent());
    expect(phantom.IsPhantom()).toBe(true);
    expect(phantom.GetParent()).toBe(root);
    expect([root.GetChildCount(), phantom.GetChildCount(), child.GetChildCount()]).toEqual([
      1, 1, 0,
    ]);
    expect([root.GetNumber(false), phantom.GetNumber(false), child.GetNumber(false)]).toEqual([
      0, 0, 0,
    ]);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});
