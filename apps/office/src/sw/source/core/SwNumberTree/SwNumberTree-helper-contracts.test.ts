/** @fileoverview Verifies protected numbering helpers with owned types, virtual-call traces and document records only. */
import { expect, it, vi } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import { SwNumberTreeNode } from "./SwNumberTree";

/** Exposes the inherited signatures within a test subclass only. */
class HelperContract extends SwNodeNum {
  /** Retains required nullable validation. */
  public readonly validateChild = this.Validate.bind(this);
  /** Retains phantom-only recursion. */
  public readonly onlyPhantoms = this.HasOnlyPhantoms.bind(this);
  /** Retains counted phantom-ancestor policy. */
  public readonly countedParent = this.HasPhantomCountedParent.bind(this);
  /** Retains first real descendant lookup. */
  public readonly firstReal = this.GetFirstNonPhantomChild.bind(this);
  /** Retains required nullable transfer destination. */
  public readonly moveAll = this.MoveChildren.bind(this);
  /** Retains two required transfer references. */
  public readonly moveLater = this.MoveGreaterChildren.bind(this);
}
/** Checks exact inherited types. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
/** Names the protected helper family. */
type HelperName =
  | "Validate"
  | "HasOnlyPhantoms"
  | "HasPhantomCountedParent"
  | "GetFirstNonPhantomChild"
  | "MoveChildren"
  | "MoveGreaterChildren";
const contract: [
  Same<Parameters<HelperContract["validateChild"]>, [SwNumberTreeNode | undefined]>,
  Same<Parameters<HelperContract["onlyPhantoms"]>, []>,
  Same<Parameters<HelperContract["countedParent"]>, []>,
  Same<Parameters<HelperContract["firstReal"]>, []>,
  Same<Parameters<HelperContract["moveAll"]>, [SwNumberTreeNode | undefined]>,
  Same<Parameters<HelperContract["moveLater"]>, [SwNumberTreeNode, SwNumberTreeNode]>,
  Same<ReturnType<HelperContract["validateChild"]>, void>,
  Same<ReturnType<HelperContract["onlyPhantoms"]>, boolean>,
  Same<ReturnType<HelperContract["countedParent"]>, boolean>,
  Same<ReturnType<HelperContract["firstReal"]>, SwNumberTreeNode>,
  Same<ReturnType<HelperContract["moveAll"]>, void>,
  Same<ReturnType<HelperContract["moveLater"]>, void>,
  Same<Extract<keyof SwNumberTreeNode, HelperName>, never>,
  Same<Extract<keyof SwNodeNum, HelperName>, never>,
] = [true, true, true, true, true, true, true, true, true, true, true, true, true, true];

/** Observes existing protected methods and storage only in tests. */
interface Diagnostic {
  readonly mChildren: Iterable<SwNumberTreeNode>;
  readonly mpLastValid: SwNumberTreeNode | undefined;
  /** Creates an actual phantom. @returns Factory result. */
  CreatePhantom(): SwNumberTreeNode | undefined;
  /** Inspects phantom-only descendants. @returns Policy result. */
  HasOnlyPhantoms(): boolean;
  /** Inspects counted phantom ancestors. @returns Policy result. */
  HasPhantomCountedParent(): boolean;
  /** Finds a real descendant in a nonempty phantom chain. @returns Real record. */
  GetFirstNonPhantomChild(): SwNumberTreeNode;
  /** Validates the explicit target. @param target - Required nullable child. @returns Nothing. */
  Validate(target: SwNumberTreeNode | undefined): void;
  /** Validates hierarchical counters. @param target - Required nullable child. @returns Nothing. */
  ValidateHierarchical(target: SwNumberTreeNode | undefined): void;
  /** Validates continuous counters. @param target - Required nullable child. @returns Nothing. */
  ValidateContinuous(target: SwNumberTreeNode | undefined): void;
  /** Moves all children in the valid destination domain. @param destination - Required pointer, nullable for an empty source. @returns Nothing. */
  MoveChildren(destination: SwNumberTreeNode | undefined): void;
}
/** Views protected diagnostics. @param node - Actual record. @returns Test view. */
function probe(node: SwNumberTreeNode): Diagnostic {
  return node as unknown as Diagnostic;
}
/** Requires a fixture record. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing helper contract fixture owner");
  return value;
}
/** Creates owned detached paragraph records and independent roots. @param continuous - Numbering policy. @returns Owners. */
function fixture(continuous = false) {
  const document = createWriterDocument();
  document.SetInReading(true);
  const rule = document.EnsureNumRule("Helpers", "numbered");
  rule.SetContinusNum(continuous);
  const texts = [required(document.paragraphs[0])];
  for (let index = 1; index < 3; index++) texts.push(document.nodes.MakeTextNode());
  const records = texts.map(
    /** Retains a paragraph-owned record after list removal. @param text - Paragraph. @returns Record. */
    (text) => {
      applyWriterParagraphList(text, {
        kind: "numbered",
        styleId: "Helpers",
        listId: "helpers",
        level: 0,
      });
      const record = required(text.GetNum());
      record.RemoveMe(document);
      return record;
    },
  );
  return {
    document,
    rule,
    texts,
    records,
    source: new HelperContract(rule),
    destination: new HelperContract(rule),
  };
}
/** Reads cached values without validation. @param records - Actual records. @returns Counters. */
function counters(records: SwNodeNum[]): number[] {
  return records.map(
    /** Reads one cache. @param record - Item. @returns Counter. */ (record) =>
      record.GetNumber(false),
  );
}
/** Records real child-count dispatch. @param node - Owner. @param label - Trace label. @param trace - Call order. @returns Nothing. */
function traceCount(node: SwNumberTreeNode, label: string, trace: string[]): void {
  const original = node.GetChildCount.bind(node);
  vi.spyOn(node, "GetChildCount").mockImplementation(
    /** Logs and preserves the count. @returns Count. */ () => {
      trace.push(label);
      return original();
    },
  );
}

it("inherits all six protected helpers with required pointer and reference arguments", /** Checks exact arity, return types, visibility and release empty-source pointer domain. @returns Nothing. */ () => {
  expect(contract).toEqual(Array(14).fill(true));
  const empty = new HelperContract(undefined);
  const storage = probe(empty).mChildren;
  expect(empty.firstReal()).toBe(empty);
  empty.validateChild(undefined);
  empty.moveAll(undefined);
  empty.moveLater(empty, new HelperContract(undefined));
  expect(probe(empty).mChildren).toBe(storage);
  expect([...storage]).toEqual([]);
  expect(probe(empty).mpLastValid).toBeUndefined();
  expect(empty.GetNumber(false)).toBe(0);
});

it("dispatches explicit-null validation through the actual hierarchical and continuous engines", /** Checks null policy, stored counters, prefix sentinel and valid-child fast path. @returns Nothing. */ () => {
  for (const continuous of [false, true]) {
    const { document, records, source } = fixture(continuous);
    try {
      for (const record of records) source.AddChild(record, 0, document);
      const hierarchical = vi.spyOn(probe(source), "ValidateHierarchical");
      const linear = vi.spyOn(probe(source), "ValidateContinuous");
      source.validateChild(undefined);
      expect(hierarchical.mock.calls).toEqual(continuous ? [] : [[undefined]]);
      expect(linear.mock.calls).toEqual(continuous ? [[undefined]] : []);
      expect(counters(records)).toEqual(continuous ? [1, 2, 3] : [0, 0, 0]);
      expect(probe(source).mpLastValid).toBeUndefined();
      source.validateChild(required(records[1]));
      expect(probe(source).mpLastValid).toBe(records[1]);
      expect(counters(records)).toEqual(continuous ? [1, 2, 3] : [1, 2, 0]);
      hierarchical.mockClear();
      linear.mockClear();
      const policy = vi.spyOn(source, "IsContinuous");
      source.validateChild(required(records[0]));
      expect(policy).not.toHaveBeenCalled();
      expect(hierarchical).not.toHaveBeenCalled();
      expect(linear).not.toHaveBeenCalled();
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("queries one child before the empty case and recursively dispatches through phantom owners", /** Checks real child-count calls, phantom chain recursion and multi-child rejection. @returns Nothing. */ () => {
  const { document, records, source } = fixture();
  const trace: string[] = [];
  try {
    traceCount(source, "root", trace);
    expect(source.onlyPhantoms()).toBe(true);
    expect(trace).toEqual(["root", "root"]);
    const phantom = required(probe(source).CreatePhantom());
    const nested = required(probe(phantom).CreatePhantom());
    traceCount(phantom, "phantom", trace);
    traceCount(nested, "nested", trace);
    trace.length = 0;
    expect(source.onlyPhantoms()).toBe(true);
    expect(trace).toEqual(["root", "phantom", "nested", "nested"]);
    nested.AddChild(required(records[0]), 0, document);
    trace.length = 0;
    expect(source.onlyPhantoms()).toBe(false);
    expect(trace).toEqual(["root", "phantom", "nested"]);
    source.AddChild(required(records[1]), 0, document);
    trace.length = 0;
    expect(source.onlyPhantoms()).toBe(false);
    expect(trace).toEqual(["root", "root"]);
    expect(counters(records)).toEqual([0, 0, 0]);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("checks a real parent phantom flag before counted policy including the uncounted branch", /** Checks source dispatch order on actual paragraph-owned parents. @returns Nothing. */ () => {
  const { document, texts, records, source } = fixture();
  const trace: string[] = [];
  const parent = required(records[0]);
  try {
    source.AddChild(parent, 0, document);
    parent.AddChild(required(records[1]), 1, document);
    const phantom = required(required(records[1]).GetParent());
    const phantomPolicy = parent.IsPhantom.bind(parent);
    const countPolicy = parent.IsCounted.bind(parent);
    vi.spyOn(parent, "IsPhantom").mockImplementation(
      /** Preserves real-node policy. @returns Flag. */ () => {
        trace.push("phantom");
        return phantomPolicy();
      },
    );
    vi.spyOn(parent, "IsCounted").mockImplementation(
      /** Preserves paragraph counted policy. @returns Flag. */ () => {
        trace.push("counted");
        return countPolicy();
      },
    );
    expect(probe(phantom).HasPhantomCountedParent()).toBe(true);
    expect(trace).toEqual(["phantom", "counted"]);
    required(texts[0]).SetCountedInList(false);
    trace.length = 0;
    expect(probe(phantom).HasPhantomCountedParent()).toBe(false);
    expect(trace).toEqual(["phantom", "counted"]);
    expect(probe(parent).HasPhantomCountedParent()).toBe(false);
    expect(source.countedParent()).toBe(false);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("recurses through counted phantom parents after their phantom branch and stops at the root or uncounted policy", /** Checks actual phantom ancestry and recursive short circuit. @returns Nothing. */ () => {
  const { document, records, source, rule } = fixture();
  const trace: string[] = [];
  try {
    source.AddChild(required(records[0]), 2, document);
    const child = required(required(records[0]).GetParent());
    const parent = required(child.GetParent());
    const phantomPolicy = parent.IsPhantom.bind(parent);
    const countPolicy = parent.IsCounted.bind(parent);
    vi.spyOn(parent, "IsPhantom").mockImplementation(
      /** Preserves factory phantom policy. @returns Flag. */ () => {
        trace.push("phantom");
        return phantomPolicy();
      },
    );
    vi.spyOn(parent, "IsCounted").mockImplementation(
      /** Preserves descendant counting. @returns Flag. */ () => {
        trace.push("counted");
        return countPolicy();
      },
    );
    const ancestor = vi.spyOn(probe(parent), "HasPhantomCountedParent");
    expect(probe(child).HasPhantomCountedParent()).toBe(true);
    expect(trace.slice(0, 2)).toEqual(["phantom", "counted"]);
    expect(ancestor).toHaveBeenCalledExactlyOnceWith();
    ancestor.mockClear();
    rule.SetCountPhantoms(false);
    trace.length = 0;
    expect(probe(child).HasPhantomCountedParent()).toBe(false);
    expect(trace.slice(0, 2)).toEqual(["phantom", "counted"]);
    expect(ancestor).not.toHaveBeenCalled();
    trace.length = 0;
    expect(probe(parent).HasPhantomCountedParent()).toBe(true);
    expect(trace).toEqual(["phantom"]);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("moves actual phantom descendants through empty or retained destination tails with inherited transfer access", /** Checks factory choice, real descendant identity, sorted ownership and cleared prefixes. @returns Nothing. */ () => {
  for (const retainedTail of [false, true]) {
    const { document, records, source, destination } = fixture();
    try {
      source.AddChild(required(records[1]), 1, document);
      const leading = required([...probe(source).mChildren][0]);
      expect(probe(leading).GetFirstNonPhantomChild()).toBe(records[1]);
      if (retainedTail) destination.AddChild(required(records[0]), 0, document);
      const factory = vi.spyOn(probe(destination), "CreatePhantom");
      const storage = probe(destination).mChildren;
      source.moveAll(destination);
      expect(factory.mock.calls).toEqual(retainedTail ? [] : [[]]);
      const tail = required([...storage][0]);
      expect(tail.IsPhantom()).toBe(!retainedTail);
      if (retainedTail) expect(tail).toBe(records[0]);
      expect([...probe(tail).mChildren]).toEqual([records[1]]);
      expect(required(records[1]).GetParent()).toBe(tail);
      expect(leading.GetParent()).toBeUndefined();
      expect([...probe(source).mChildren]).toEqual([]);
      expect(probe(source).mpLastValid).toBeUndefined();
      expect(probe(destination).mChildren).toBe(storage);
      expect(counters(records)).toEqual([0, 0, 0]);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});
