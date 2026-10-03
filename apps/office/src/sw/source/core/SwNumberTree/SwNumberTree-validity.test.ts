/** @fileoverview Verifies protected native validity overloads using owned Writer records without upstream access. */
import { expect, it, vi } from "vitest";
import type { SortedVector } from "../../../../o3tl/inc/sorted_vector";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Binds the protected overloads solely for type inspection. */
class ValidityContract extends SwNodeNum {
  /** Retains both native overload signatures. */
  public readonly valid = this.IsValid.bind(this);
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contract: [
  Same<Extract<keyof SwNumberTreeNode, "IsValid">, never>,
  Same<Extract<keyof SwNodeNum, "IsValid">, never>,
  Same<Parameters<ValidityContract["valid"]>, [child: SwNumberTreeNode | undefined]>,
  Same<ReturnType<ValidityContract["valid"]>, boolean>,
] = [true, true, true, true];

/** Observes protected native contracts solely in tests. */
interface ValidityDiagnostic {
  readonly mChildren: SortedVector<SwNumberTreeNode>;
  /** Checks this node through its parent. @returns Validity. */
  IsValid(): boolean;
  /** Checks one explicitly supplied nullable child. @param child - Candidate. @returns Validity. */
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- Preserve the distinct self and required nullable-child contracts.
  IsValid(child: SwNumberTreeNode | undefined): boolean;
}
/** Reads test-only protected diagnostics. @param node - Actual record. @returns Hooks. */
function probe(node: SwNumberTreeNode): ValidityDiagnostic {
  return node as unknown as ValidityDiagnostic;
}
/** Requires an owned fixture value. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing validity fixture owner");
  return value;
}
/** Creates three actual owned paragraphs under reading suppression. @param levels - Item depths. @param continuous - Numbering policy. @returns Owners. */
function fixture(levels = [0, 0, 0], continuous = false) {
  const document = createWriterDocument();
  document.SetInReading(true);
  document.EnsureNumRule("Validity", "numbered").SetContinusNum(continuous);
  const texts = [
    required(document.paragraphs[0]),
    document.nodes.MakeTextNode(),
    document.nodes.MakeTextNode(),
  ];
  const records = texts.map(
    /** Attaches the actual text-owned record. @param text - Paragraph. @param index - Level index. @returns Record. */
    (text, index) => {
      applyWriterParagraphList(text, {
        kind: "numbered",
        level: required(levels[index]),
        styleId: "Validity",
        listId: "validity",
      });
      return required(text.GetNum());
    },
  );
  return { document, texts, records, root: required(required(records[0]).GetParent()) };
}
/** Reads self validity without validating caches. @param nodes - Actual records. @returns Flags. */
function validity(nodes: SwNumberTreeNode[]): boolean[] {
  return nodes.map(
    /** Observes the native zero-argument predicate. @param node - Record. @returns Flag. */
    (node) => probe(node).IsValid(),
  );
}
/** Reads raw counters without prefix validation. @param nodes - Actual records. @returns Values. */
function raw(nodes: SwNumberTreeNode[]): number[] {
  return nodes.map(
    /** Observes the existing stored counter. @param node - Record. @returns Counter. */
    (node) => node.GetNumber(false),
  );
}

it("provides protected zero and required nullable-child overloads to subclasses", /** Checks precise argument/result types and root/orphan defaults. @returns Nothing. */ () => {
  expect(contract).toEqual([true, true, true, true]);
  const root = new ValidityContract(undefined);
  const orphan = new ValidityContract(undefined);
  expect([root.valid(), root.valid(undefined), root.valid(orphan), orphan.valid()]).toEqual([
    false,
    false,
    false,
    false,
  ]);
  expect(raw([root, orphan])).toEqual([0, 0]);
});

it("observes owned prefixes through restart and removal without validating raw caches", /** Checks self/child dispatch against real owners and stale counters. @returns Nothing. */ () => {
  const { document, texts, records, root } = fixture();
  const [first, second, tail] = records.map(required);
  const nodes = [root, required(first), required(second), required(tail)];
  try {
    expect(validity(nodes)).toEqual([false, false, false, false]);
    expect(raw(nodes)).toEqual([0, 0, 0, 0]);
    expect(required(first).GetNumber()).toBe(1);
    expect(validity(nodes)).toEqual([false, true, false, false]);
    expect([probe(required(first)).IsValid(), probe(required(first)).IsValid(undefined)]).toEqual([
      true,
      false,
    ]);
    expect([
      probe(root).IsValid(undefined),
      probe(root).IsValid(first),
      probe(root).IsValid(second),
    ]).toEqual([false, true, false]);
    expect(raw(nodes)).toEqual([0, 1, 0, 0]);
    expect(required(second).GetNumber()).toBe(2);
    expect(validity(nodes)).toEqual([false, true, true, false]);
    required(texts[1]).SetListRestart(true);
    required(texts[1]).SetAttrListRestartValue(7);
    expect(required(texts[1]).GetNum()).toBe(second);
    expect(validity(nodes)).toEqual([false, true, false, false]);
    expect(raw(nodes)).toEqual([0, 1, 2, 0]);
    expect(required(second).GetNumber()).toBe(7);
    expect(validity(nodes)).toEqual([false, true, true, false]);
    expect(required(required(first).GetNumRule()).IsInvalidRule()).toBe(true);
    required(second).RemoveMe(document);
    expect(required(second).GetParent()).toBeUndefined();
    // Native removal from a still-invalid rule invalidates the remaining list prefix.
    expect(validity(nodes)).toEqual([false, false, false, false]);
    expect(raw(nodes)).toEqual([0, 1, 7, 0]);
    expect(root.GetChildCount()).toBe(2);
    expect(required(first).GetNumber()).toBe(1);
    expect(validity(nodes)).toEqual([false, true, false, false]);
  } finally {
    document.Dispose();
  }
});

it("looks up the stored valid boundary only for guarded owned children", /** Checks sorted-container lookup, foreign parents and explicit null dispatch. @returns Nothing. */ () => {
  const { document, texts, records, root } = fixture();
  const first = required(records[0]);
  const second = required(records[1]);
  const orphan = new SwNodeNum(required(texts[0]), false);
  const foreignText = document.nodes.MakeTextNode();
  applyWriterParagraphList(foreignText, {
    kind: "numbered",
    level: 0,
    styleId: "Validity",
    listId: "foreign-validity",
  });
  const foreign = required(foreignText.GetNum());
  try {
    expect(first.GetNumber()).toBe(1);
    expect(foreign.GetNumber()).toBe(1);
    const lookup = vi.spyOn(probe(root).mChildren, "find");
    expect([probe(root).IsValid(first), probe(root).IsValid(second)]).toEqual([true, false]);
    expect(lookup).toHaveBeenCalledTimes(2);
    expect(
      lookup.mock.calls.map(
        /** Identifies the actual cached boundary key. @param call - Lookup arguments. @returns Identity flag. */
        ([key]) => key === first,
      ),
    ).toEqual([true, true]);
    lookup.mockClear();
    expect([
      probe(root).IsValid(),
      probe(root).IsValid(undefined),
      probe(root).IsValid(orphan),
      probe(root).IsValid(foreign),
    ]).toEqual([false, false, false, false]);
    expect(lookup).not.toHaveBeenCalled();
    root.InvalidateTree();
    expect([probe(root).IsValid(first), probe(first).IsValid()]).toEqual([false, false]);
    expect(lookup).not.toHaveBeenCalled();
    expect(raw([first, second, orphan, foreign])).toEqual([1, 0, 0, 1]);
    expect(probe(foreign).IsValid()).toBe(true);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("retains hierarchical and continuous phantom validity across reading and invalidation", /** Checks real skipped ancestors, nonvalidating observations and normal-mode removal. @returns Nothing. */ () => {
  for (const continuous of [false, true]) {
    const { document, records, root } = fixture([0, 2, 0], continuous);
    const first = required(records[0]);
    const nested = required(records[1]);
    const tail = required(records[2]);
    const phantom = required(nested.GetParent());
    const nodes = [root, first, phantom, nested, tail];
    try {
      expect(phantom.IsPhantom()).toBe(true);
      expect(phantom.GetParent()).toBe(first);
      expect(validity(nodes)).toEqual([false, false, false, false, false]);
      expect(raw(nodes)).toEqual([0, 0, 0, 0, 0]);
      expect(nested.GetNumberVector()).toEqual(continuous ? [1, 1, 2] : [1, 1, 1]);
      expect(validity(nodes)).toEqual([false, true, true, true, false]);
      expect(raw(nodes)).toEqual(continuous ? [0, 1, 1, 2, 0] : [0, 1, 1, 1, 0]);
      document.SetInReading(false);
      expect(validity(nodes)).toEqual([false, true, true, true, false]);
      root.InvalidateTree();
      expect(validity(nodes)).toEqual([false, false, false, false, false]);
      expect(raw(nodes)).toEqual(continuous ? [0, 1, 1, 2, 0] : [0, 1, 1, 1, 0]);
      expect(nested.GetNumberVector()).toEqual(continuous ? [1, 1, 2] : [1, 1, 1]);
      expect(validity(nodes)).toEqual([false, true, true, true, false]);
      nested.RemoveMe(document);
      expect(probe(nested).IsValid()).toBe(false);
      expect(nested.GetParent()).toBeUndefined();
      expect([root.GetChildCount(), first.GetChildCount()]).toEqual([2, 0]);
    } finally {
      document.Dispose();
    }
  }
});
