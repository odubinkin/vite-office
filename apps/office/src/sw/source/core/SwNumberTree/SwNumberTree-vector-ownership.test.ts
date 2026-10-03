/** @fileoverview Verifies caller-owned mutable numbering vectors using owned documents without upstream access. */
import { expect, it, vi } from "vitest";
import type { tNumberVector, tSwNumTreeNumber } from "../../../inc/SwNumberTreeTypes";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList, type SwList } from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Exposes protected append contracts solely through the test subclass. */
class VectorContract extends SwNodeNum {
  /** Retains the protected argument and result types. */
  public readonly append = this.GetNumberVector_.bind(this);
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contract: [
  Same<tSwNumTreeNumber, number>,
  Same<tNumberVector, number[]>,
  Same<Parameters<SwNumberTreeNode["GetNumberVector"]>, []>,
  Same<ReturnType<SwNumberTreeNode["GetNumberVector"]>, number[]>,
  Same<Parameters<SwTextNode["GetNumberVector"]>, []>,
  Same<ReturnType<SwTextNode["GetNumberVector"]>, number[]>,
  Same<Parameters<SwList["GetListItemNumberVector"]>, [SwTextNode]>,
  Same<ReturnType<SwList["GetListItemNumberVector"]>, number[] | undefined>,
  Same<
    Parameters<VectorContract["append"]>,
    [numbers: tNumberVector, validate?: boolean | undefined]
  >,
  Same<ReturnType<VectorContract["append"]>, void>,
] = [true, true, true, true, true, true, true, true, true, true];

/** Requires an owned fixture value. @param value - Candidate. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing vector ownership fixture");
  return value;
}
/** Captures raw cache identities without validating. @param node - Owner. @returns Comparable tree state. */
function cache(node: SwNumberTreeNode): unknown {
  const diagnostic = node as unknown as {
    mChildren: Iterable<SwNumberTreeNode>;
    mpLastValid?: SwNumberTreeNode;
  };
  const children = [...diagnostic.mChildren];
  return [
    node.GetNumber(false),
    node.IsContinueingPreviousSubTree(),
    children.indexOf(diagnostic.mpLastValid as SwNumberTreeNode),
    children.map(
      /** Captures one owned child. @param child - Record. @returns Raw state. */ (child) =>
        cache(child),
    ),
  ];
}
/** Creates actual registered hierarchy or continuous records. @param continuous - Rule policy. @param deep - Whether skipped ancestors reach nine. @returns Owners. */
function fixture(continuous: boolean, deep: boolean) {
  const document = createWriterDocument();
  document.SetInReading(true);
  const rule = document.EnsureNumRule("VectorOwnership", "numbered", 0);
  rule.SetContinusNum(continuous);
  for (let level = 0; level < 10; level++) {
    const format = rule.Get(level).clone();
    format.SetStart(level === 0 ? 7 : level === 1 ? 5 : level === 2 ? 3 : 2);
    rule.Set(level, format);
  }
  const texts = (deep ? [0, 9, 0] : [0, 1, 2, 0]).map(
    /** Inserts one canonical paragraph. @param level - Native level. @param index - Position. @returns Text node. */ (
      level,
      index,
    ) => {
      const text = index === 0 ? required(document.paragraphs[0]) : document.nodes.MakeTextNode();
      applyWriterParagraphList(text, {
        kind: "numbered",
        styleId: "VectorOwnership",
        listId: "vector-ownership",
        level,
      });
      return text;
    },
  );
  const list = required(document.GetDocumentListsManager().GetListByName("vector-ownership"));
  const text = required(texts[deep ? 1 : 2]);
  const record = required(text.GetNum());
  let root: SwNumberTreeNode = record;
  while (root.GetParent() !== undefined) root = required(root.GetParent());
  return { document, texts, rule, list, text, record, root };
}

it("exposes mutable source-owned vector aliases and exact shown getter contracts", /** Verifies compile-time mutability without invoking upstream. @returns Nothing. */ () => {
  expect(contract).toEqual(Array(10).fill(true));
});

it("returns separate mutable empty values for roots, orphans and paragraphs without records", /** Checks caller mutation never changes native empty policy. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const text = required(document.paragraphs[0]);
    const root = new SwNodeNum(undefined);
    const orphan = new SwNodeNum(text);
    const vectors: number[][] = [
      root.GetNumberVector(),
      root.GetNumberVector(),
      orphan.GetNumberVector(),
      text.GetNumberVector(),
      text.GetNumberVector(),
    ];
    expect(new Set(vectors).size).toBe(vectors.length);
    for (const vector of vectors) {
      expect(vector).toEqual([]);
      vector.push(43);
    }
    expect(root.GetNumberVector()).toEqual([]);
    expect(orphan.GetNumberVector()).toEqual([]);
    expect(text.GetNumberVector()).toEqual([]);
    expect(root.GetNumber(false)).toBe(0);
    expect(orphan.GetNumber(false)).toBe(0);
  } finally {
    document.Dispose();
  }
});

it("obtains the shown record through GetNum and delegates once without changing its returned value", /** Observes actual owner getters rather than a fabricated record. @returns Nothing. */ () => {
  const { document, text, record } = fixture(false, false);
  try {
    const owner = vi.spyOn(text, "GetNum");
    const getVector = vi.spyOn(record, "GetNumberVector");
    const vector: number[] = text.GetNumberVector();
    expect(owner).toHaveBeenCalledTimes(1);
    expect(getVector).toHaveBeenCalledTimes(1);
    expect(vector).toEqual([7, 5, 3]);
    vector.splice(0, vector.length, 99);
    expect(record.GetNumberVector()).toEqual([7, 5, 3]);
    text.RemoveFromList();
    owner.mockClear();
    getVector.mockClear();
    expect(text.GetNumberVector()).toEqual([]);
    expect(owner).toHaveBeenCalledTimes(1);
    expect(getVector).not.toHaveBeenCalled();
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("keeps each returned vector independent through phantom depth nine, continuous policy, restarts and reading transitions", /** Mutates caller values while preserving literal vectors and cache/client topology. @returns Nothing. */ () => {
  for (const continuous of [false, true])
    for (const deep of [false, true]) {
      const { document, texts, rule, list, text, record, root } = fixture(continuous, deep);
      try {
        const parent = record.GetParent();
        for (const restart of [undefined, 0, 11]) {
          if (restart !== undefined) {
            const first = required(texts[0]);
            first.SetListRestart(true);
            first.SetAttrListRestartValue(restart);
            list.InvalidateListTree();
          }
          const start = restart ?? 7;
          const expected = deep
            ? continuous
              ? [...Array(9).fill(start), start + 1]
              : [start, 5, 3, 2, 2, 2, 2, 2, 2, 2]
            : continuous
              ? [start, start + 1, start + 2]
              : [start, 5, 3];
          const vectors: number[][] = [
            record.GetNumberVector(),
            text.GetNumberVector(),
            required(list.GetListItemNumberVector(text)),
            record.GetNumberVector(),
          ];
          const state = cache(root);
          const clients: SwTextNode[] = [];
          rule.GetTextNodeList(clients);
          expect(new Set(vectors).size).toBe(4);
          for (const vector of vectors) expect(vector).toEqual(expected);
          required(vectors[0]).push(91);
          required(vectors[0]).splice(0, 1);
          required(vectors[1]).length = 0;
          required(vectors[2]).reverse();
          required(vectors[2]).sort();
          expect(required(vectors[3])).toEqual(expected);
          expect(cache(root)).toEqual(state);
          expect(record.GetParent()).toBe(parent);
          expect(record.GetNumRule()).toBe(rule);
          const afterClients: SwTextNode[] = [];
          rule.GetTextNodeList(afterClients);
          expect(afterClients).toEqual(clients);
          expect(text.GetNumberVector()).toEqual(expected);
          document.SetInReading(false);
          expect(list.GetListItemNumberVector(text)).toEqual(expected);
          expect(cache(root)).toEqual(state);
          document.SetInReading(true);
        }
        const missing = document.nodes.MakeTextNode();
        expect(list.GetListItemNumberVector(missing)).toBeUndefined();
        const returned: number[] = text.GetNumberVector();
        text.RemoveFromList();
        returned.push(101);
        expect(record.GetNumberVector()).toEqual([]);
        expect(text.GetNumberVector()).toEqual([]);
        expect(list.GetListItemNumberVector(text)).toBeUndefined();
      } finally {
        document.Dispose();
      }
    }
});
