/** @fileoverview Verifies protected native prefix invalidation contracts and owned document state without upstream access. */
import { expect, it, vi } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Exposes inherited contracts only in the test subclass. */
class PrefixContract extends SwNodeNum {
  /** Retains the inherited iterator position and optional validation contract. */
  public readonly setPrefix = this.SetLastValid.bind(this);
  /** Retains native zero-argument child invalidation. */
  public readonly clearPrefix = this.InvalidateChildren.bind(this);
  /** Retains the inherited required-child contract. */
  public readonly invalidateChild = this.Invalidate.bind(this);
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contract: [
  Same<Parameters<PrefixContract["setPrefix"]>, [number, (boolean | undefined)?]>,
  Same<Parameters<PrefixContract["clearPrefix"]>, []>,
  Same<Parameters<PrefixContract["invalidateChild"]>, [SwNumberTreeNode]>,
  Same<ReturnType<PrefixContract["setPrefix"]>, void>,
  Same<ReturnType<PrefixContract["clearPrefix"]>, void>,
  Same<ReturnType<PrefixContract["invalidateChild"]>, void>,
  Same<
    Extract<keyof SwNumberTreeNode, "SetLastValid" | "InvalidateChildren" | "Invalidate">,
    never
  >,
  Same<Extract<keyof SwNodeNum, "SetLastValid" | "InvalidateChildren" | "Invalidate">, never>,
] = [true, true, true, true, true, true, true, true];

/** Observes protected helpers and saved prefix only within tests. */
interface PrefixDiagnostic {
  readonly mpLastValid: SwNumberTreeNode | undefined;
  /** Sets a prefix position. @param index - Owned position or end. @param validating - Advance flag. @returns Nothing. */
  SetLastValid(index: number, validating?: boolean): void;
  /** Invalidates direct children. @returns Nothing. */
  InvalidateChildren(): void;
  /** Invalidates an owned child. @param child - Changed child. @returns Nothing. */
  Invalidate(child: SwNumberTreeNode): void;
}
/** Reads protected test diagnostics. @param node - Actual owner. @returns View. */
function probe(node: SwNumberTreeNode): PrefixDiagnostic {
  return node as unknown as PrefixDiagnostic;
}
/** Requires a fixture owner. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing prefix fixture owner");
  return value;
}
/** Creates real paragraph-owned records under reading suppression. @param levels - Depths. @param continuous - Policy. @returns Owners. */
function fixture(levels: number[], continuous = false) {
  const document = createWriterDocument();
  document.SetInReading(true);
  document.EnsureNumRule("Prefix", "numbered").SetContinusNum(continuous);
  const texts = levels.map(
    /** Allocates canonical paragraphs. @param _level - Depth. @param index - Ordinal. @returns Owner. */
    (_level, index) =>
      index === 0 ? required(document.paragraphs[0]) : document.nodes.MakeTextNode(),
  );
  const records = texts.map(
    /** Registers actual records. @param text - Owner. @param index - Depth index. @returns Record. */
    (text, index) => {
      applyWriterParagraphList(text, {
        kind: "numbered",
        level: required(levels[index]),
        styleId: "Prefix",
        listId: "prefix",
      });
      return required(text.GetNum());
    },
  );
  return { document, texts, records, root: required(required(records[0]).GetParent()) };
}
/** Reads raw counters without validation. @param records - Owned records. @returns Counters. */
function counters(records: SwNodeNum[]): number[] {
  return records.map(
    /** Reads one cache. @param node - Record. @returns Counter. */ (node) => node.GetNumber(false),
  );
}

it("provides protected required-position prefix and child invalidation contracts without public exports", /** Checks inherited types, defaults and empty end forwarding. @returns Nothing. */ () => {
  expect(contract).toEqual([true, true, true, true, true, true, true, true]);
  const node = new PrefixContract(undefined);
  node.setPrefix(-1);
  expect(probe(node).mpLastValid).toBeUndefined();
  const forwarded = vi.spyOn(probe(node), "SetLastValid");
  node.clearPrefix();
  expect(forwarded).toHaveBeenCalledExactlyOnceWith(-1);
  node.invalidateChild(new PrefixContract(undefined));
  expect(probe(node).mpLastValid).toBeUndefined();
  vi.restoreAllMocks();
});

it("retains native false-default prefix guards rewind validation and end semantics without counter reads", /** Checks exact stored child identity for all supported positions. @returns Nothing. */ () => {
  const { document, records, root } = fixture([0, 0, 0]);
  const prefixes: (SwNumberTreeNode | undefined)[] = [];
  const api = probe(root);
  try {
    for (const [index, validating] of [
      [1, undefined],
      [2, true],
      [2, undefined],
      [1, false],
      [2, false],
      [0, undefined],
      [2, true],
      [-1, true],
      [1, false],
      [1, true],
      [-1, undefined],
    ] as const) {
      api.SetLastValid(index, validating);
      prefixes.push(api.mpLastValid);
    }
    expect(prefixes).toEqual([
      undefined,
      records[2],
      records[2],
      records[1],
      records[1],
      records[0],
      records[2],
      undefined,
      undefined,
      records[1],
      undefined,
    ]);
    expect(counters(records)).toEqual([0, 0, 0]);
  } finally {
    document.Dispose();
  }
});

it("dispatches the native following-uncounted invalidation helper while retaining hierarchical counters and later prefixes", /** Checks actual continuation groups and direct prefix effects. @returns Nothing. */ () => {
  const { document, texts, records, root } = fixture([0, 1, 0, 1, 0, 1]);
  const first = required(records[0]),
    next = required(records[2]),
    last = required(records[4]);
  try {
    required(texts[2]).SetCountedInList(false);
    expect(required(records[1]).GetNumberVector()).toEqual([1, 1]);
    expect(required(records[3]).GetNumberVector()).toEqual([1, 2]);
    expect(required(records[5]).GetNumberVector()).toEqual([2, 1]);
    const raw = counters(records);
    const invalidation = vi.spyOn(probe(next), "InvalidateChildren");
    probe(first).SetLastValid(-1);
    expect(invalidation).toHaveBeenCalledExactlyOnceWith();
    expect([
      probe(first).mpLastValid,
      probe(next).mpLastValid,
      probe(last).mpLastValid,
      probe(root).mpLastValid,
    ]).toEqual([undefined, undefined, records[5], last]);
    expect(counters(records)).toEqual(raw);
    expect(required(records[3]).IsContinueingPreviousSubTree()).toBe(true);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("invalidates continuous suffixes and propagates parent iterator positions without changing raw counters", /** Checks full owned suffix topology and root-end invalidation. @returns Nothing. */ () => {
  const { document, records, root } = fixture([0, 1, 0, 1, 0, 1], true);
  const first = required(records[0]),
    middle = required(records[2]),
    last = required(records[4]);
  try {
    expect(required(records[5]).GetNumberVector()).toEqual([5, 6]);
    expect(counters(records)).toEqual([1, 2, 3, 4, 5, 6]);
    const forwarded = vi.spyOn(probe(root), "SetLastValid");
    probe(first).InvalidateChildren();
    expect(forwarded).toHaveBeenCalledExactlyOnceWith(0, false);
    expect([
      probe(root).mpLastValid,
      probe(first).mpLastValid,
      probe(middle).mpLastValid,
      probe(last).mpLastValid,
    ]).toEqual([first, undefined, undefined, undefined]);
    expect(counters(records)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(required(records[5]).GetNumberVector()).toEqual([5, 6]);
    probe(root).InvalidateChildren();
    expect([
      probe(root).mpLastValid,
      probe(first).mpLastValid,
      probe(middle).mpLastValid,
      probe(last).mpLastValid,
    ]).toEqual([undefined, undefined, undefined, undefined]);
    expect(counters(records)).toEqual([1, 2, 3, 4, 5, 6]);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("rewinds direct child invalidation to first middle and last predecessor positions and ignores unattached records", /** Checks exact saved prefixes under both numbering modes. @returns Nothing. */ () => {
  for (const continuous of [false, true]) {
    const { document, records, root } = fixture([0, 0, 0], continuous);
    try {
      for (const [index, expected] of [
        [0, undefined],
        [1, records[0]],
        [2, records[1]],
      ] as const) {
        expect(required(records[2]).GetNumberVector()).toEqual([3]);
        probe(root).Invalidate(required(records[index]));
        expect(probe(root).mpLastValid).toBe(expected);
        expect(counters(records)).toEqual([1, 2, 3]);
      }
      probe(root).Invalidate(new SwNodeNum(undefined));
      expect(probe(root).mpLastValid).toBe(records[1]);
      expect(counters(records)).toEqual([1, 2, 3]);
    } finally {
      document.Dispose();
    }
  }
});
