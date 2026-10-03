/** @fileoverview Verifies continuous validation policy and owner traversal using actual Writer records without upstream access. */
import { expect, it, vi } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Retains the protected signature solely in tests. */
class ContinuousContract extends SwNodeNum {
  /** Retains explicit nullable target validation. */
  public readonly continuous = this.ValidateContinuous.bind(this);
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contracts: [
  Same<Parameters<ContinuousContract["continuous"]>, [SwNumberTreeNode | undefined]>,
  Same<ReturnType<ContinuousContract["continuous"]>, void>,
  Same<Extract<keyof SwNumberTreeNode, "ValidateContinuous">, never>,
  Same<Extract<keyof SwNodeNum, "ValidateContinuous">, never>,
] = [true, true, true, true];
/** Observes protected ownership only in tests. */
interface Diagnostic {
  readonly mpLastValid: SwNumberTreeNode | undefined;
  /** Gets the attached root. @returns Root pointer. */
  GetRoot(): SwNumberTreeNode | undefined;
  /** Validates a continuous prefix. @param target - Explicit nullable target. @returns Nothing. */
  ValidateContinuous(target: SwNumberTreeNode | undefined): void;
}
/** Reads protected diagnostic state. @param node - Owner. @returns View. */
function probe(node: SwNumberTreeNode): Diagnostic {
  return node as unknown as Diagnostic;
}
/** Requires an owned fixture value. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing continuous policy owner");
  return value;
}
/** Describes actual paragraph attributes. */
interface Item {
  level: number;
  counted?: boolean;
  restart?: number;
}
/** Creates actual lists and rule-owned starts. @param items - Paragraph profiles. @param start - Level starts. @param continuous - Initial mode. @returns Owners. */
function fixture(items: Item[], start = 7, continuous = true) {
  const document = createWriterDocument();
  document.SetInReading(true);
  const rule = document.EnsureNumRule("ContinuousPolicy", "numbered");
  rule.SetContinusNum(continuous);
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
        styleId: "ContinuousPolicy",
        listId: "continuous-policy",
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
/** Reads stored counters only. @param records - Actual records. @returns Cache values. */
function raw(records: SwNodeNum[]): number[] {
  return records.map(
    /** Reads one unvalidated counter. @param node - Record. @returns Counter. */ (node) =>
      node.GetNumber(false),
  );
}

it("keeps protected nullable targets and owner starts for first counted uncounted and restart branches", /** Covers policy selection without a predecessor, including signed starts. @returns Nothing. */ () => {
  expect(contracts).toEqual([true, true, true, true]);
  for (const start of [0, 7]) {
    for (const [item, expected] of [
      [{ level: 0 }, start],
      [{ level: 0, restart: 0 }, 0],
      [{ level: 0, counted: false, restart: 0 }, start - 1],
    ] as const) {
      const { document, root, records } = fixture([item], start);
      try {
        const first = required(records[0]),
          predecessor = vi.spyOn(first, "GetPred"),
          restart = vi.spyOn(first, "IsRestart"),
          ownStart = vi.spyOn(root, "GetStartValue"),
          childStart = vi.spyOn(first, "GetStartValue");
        probe(root).ValidateContinuous(first);
        expect(predecessor).toHaveReturnedWith(undefined);
        expect(first.GetNumber(false)).toBe(expected);
        expect(probe(root).mpLastValid).toBe(first);
        expect(ownStart.mock.calls.length).toBe(
          item.counted === false || item.restart === undefined ? 1 : 0,
        );
        expect(childStart.mock.calls.length).toBe(
          item.counted !== false && item.restart !== undefined ? 1 : 0,
        );
        if (item.counted === false) expect(restart).not.toHaveBeenCalled();
      } finally {
        vi.restoreAllMocks();
        document.Dispose();
      }
    }
  }
  const empty = new SwNodeNum(undefined);
  probe(empty).ValidateContinuous(undefined);
  expect(probe(empty).mpLastValid).toBeUndefined();
});

it("uses parent helpers for shared-owner predecessor counters and skips them on counted restarts", /** Covers inherited and incremented counters plus restart short circuit. @returns Nothing. */ () => {
  for (const [item, expected] of [
    [{ level: 0 }, 8],
    [{ level: 0, counted: false, restart: 0 }, 7],
    [{ level: 0, restart: 0 }, 0],
  ] as const) {
    const { document, root, records } = fixture([{ level: 0 }, item]);
    try {
      const previous = required(records[0]),
        child = required(records[1]);
      probe(root).ValidateContinuous(previous);
      const previousParent = vi.spyOn(previous, "GetParent"),
        childParent = vi.spyOn(child, "GetParent"),
        counter = vi.spyOn(previous, "GetNumber"),
        restart = vi.spyOn(child, "IsRestart");
      probe(root).ValidateContinuous(child);
      const restarted = item.counted !== false && item.restart !== undefined;
      expect(previousParent.mock.calls).toEqual(restarted ? [] : [[]]);
      expect(childParent.mock.calls).toEqual(restarted ? [] : [[]]);
      expect(counter.mock.calls).toEqual(restarted ? [] : [[false]]);
      if (item.counted === false) expect(restart).not.toHaveBeenCalled();
      expect(raw(records)).toEqual([7, expected]);
      expect(probe(root).mpLastValid).toBe(child);
      expect(child.GetParent()).toBe(root);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("validates predecessor owners when the first nested child has a different parent", /** Covers nested counted and uncounted policy with genuine parent validation. @returns Nothing. */ () => {
  for (const counted of [true, false]) {
    const { document, root, records } = fixture([{ level: 0 }, { level: 1, counted }]);
    try {
      const previous = required(records[0]),
        child = required(records[1]),
        childParent = vi.spyOn(child, "GetParent"),
        counter = vi.spyOn(previous, "GetNumber");
      probe(previous).ValidateContinuous(child);
      expect(counter.mock.calls).toEqual([[true]]);
      expect(childParent.mock.calls).toEqual([[]]);
      expect(raw(records)).toEqual([7, counted ? 8 : 7]);
      expect(probe(root).mpLastValid).toBe(previous);
      expect(probe(previous).mpLastValid).toBe(child);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("uses the deepest predecessor and validates its distinct owner before incrementing", /** Traverses actual phantom ancestry rather than direct-sibling storage. @returns Nothing. */ () => {
  const { document, records, root } = fixture([{ level: 0 }, { level: 2 }, { level: 0 }]);
  try {
    const previous = required(records[0]),
      deepest = required(records[1]),
      tail = required(records[2]),
      phantom = required(deepest.GetParent());
    probe(root).ValidateContinuous(previous);
    const parent = vi.spyOn(tail, "GetParent"),
      counter = vi.spyOn(deepest, "GetNumber");
    probe(root).ValidateContinuous(tail);
    expect(counter.mock.calls).toEqual([[true]]);
    expect(parent.mock.calls).toEqual([[]]);
    expect(raw(records)).toEqual([7, 8, 9]);
    expect(phantom.IsPhantom()).toBe(true);
    expect(phantom.GetNumber(false)).toBe(7);
    expect(probe(phantom).mpLastValid).toBe(deepest);
    expect(probe(root).mpLastValid).toBe(tail);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("resumes after a valid prefix and uses target identity with end sentinel clearing", /** Covers retained prefixes, equivalent detached targets and null/foreign end traversal. @returns Nothing. */ () => {
  const { document, texts, records, root } = fixture([{ level: 0 }, { level: 0 }, { level: 0 }]);
  try {
    const first = required(records[0]),
      middle = required(records[1]),
      tail = required(records[2]);
    probe(root).ValidateContinuous(first);
    const firstPolicy = vi.spyOn(first, "IsCounted"),
      middlePolicy = vi.spyOn(middle, "IsCounted"),
      tailPolicy = vi.spyOn(tail, "IsCounted");
    probe(root).ValidateContinuous(middle);
    expect(firstPolicy).not.toHaveBeenCalled();
    expect(middlePolicy).toHaveBeenCalledTimes(1);
    expect(tailPolicy).not.toHaveBeenCalled();
    expect(raw(records)).toEqual([7, 8, 0]);
    expect(probe(root).mpLastValid).toBe(middle);
    const equivalent = new SwNodeNum(required(texts[2]), false);
    probe(root).ValidateContinuous(equivalent);
    expect(tailPolicy).toHaveBeenCalledTimes(1);
    expect(raw(records)).toEqual([7, 8, 9]);
    expect(probe(root).mpLastValid).toBeUndefined();
    vi.restoreAllMocks();
    probe(root).ValidateContinuous(tail);
    const policy = vi.spyOn(tail, "IsCounted");
    probe(root).ValidateContinuous(undefined);
    expect(policy).not.toHaveBeenCalled();
    expect(probe(root).mpLastValid).toBeUndefined();
    probe(root).ValidateContinuous(new SwNodeNum(document.nodes.MakeTextNode(), false));
    expect(policy).toHaveBeenCalledTimes(1);
    expect(raw(records)).toEqual([7, 8, 9]);
    expect(probe(root).mpLastValid).toBeUndefined();
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("retains genuine hierarchical continuation when continuous policy revalidates the subtree", /** Covers mode transition without fabricating the retained continuation flag. @returns Nothing. */ () => {
  const { document, records, root, rule } = fixture(
    [{ level: 0 }, { level: 1 }, { level: 0, counted: false }, { level: 1 }],
    0,
    false,
  );
  try {
    const child = required(records[3]),
      parent = required(child.GetParent());
    expect(child.GetNumberVector()).toEqual([0, 1]);
    expect(child.IsContinueingPreviousSubTree()).toBe(true);
    rule.SetContinusNum(true);
    root.InvalidateTree();
    const counted = child.IsCounted.bind(child),
      continuation: boolean[] = [];
    vi.spyOn(child, "IsCounted").mockImplementation(
      /** Observes retained policy state. @returns Counted. */ () => {
        continuation.push(child.IsContinueingPreviousSubTree());
        return counted();
      },
    );
    probe(parent).ValidateContinuous(child);
    expect(continuation).toEqual([true]);
    expect(child.IsContinueingPreviousSubTree()).toBe(true);
    expect(raw(records)).toEqual([0, 1, 1, 2]);
    expect(probe(parent).mpLastValid).toBe(child);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});
