/** @fileoverview Verifies native phantom insertion, descendant relocation and orphan guards. */
import type { SwNumRule } from "../doc/number";
import nativeTiming from "../../../../test/writer-native-phantom-timing.json";
import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";
import { SwNumberTreeNode } from "./SwNumberTree";
/** Literal counted-list policy. */
interface Item {
  readonly level: number;
  readonly counted?: boolean;
}
/** Builds canonical text records. @param items - Source policies. @returns Document and ordered items. */
function fixture(items: readonly Item[]) {
  const document = createWriterDocument();
  document.EnsureNumRule("Counters", "numbered", 0);
  const nodes = items.map(
    /** Applies a source-derived policy. @param item - Policy. @param index - Position. @returns Text record. */
    (item, index) => {
      const node =
        index === 0 ? (document.paragraphs[0] as SwTextNode) : document.nodes.MakeTextNode();
      applyWriterParagraphList(node, { kind: "numbered", styleId: "Counters", level: item.level });
      if (item.counted === false) node.SetCountedInList(false);
      return node;
    },
  );
  return { document, nodes };
}
/** Enumerates insertion orders independent of counter calculations. @param indexes - Document positions. @returns Permutations. */
function orders(indexes: readonly number[]): number[][] {
  if (indexes.length === 0) return [[]];
  return indexes.flatMap(
    /** Prefixes one position. @param index - Position. @returns Orders beginning here. */
    (index) =>
      orders(
        indexes.filter(
          /** Omits the selected position. @param remaining - Position. @returns Whether retained. */
          (remaining) => remaining !== index,
        ),
      ).map(
        /** Appends remaining positions. @param rest - Remaining order. @returns Full order. */
        (rest) => [index, ...rest],
      ),
  );
}
it("preserves native phantom topology through sorted insertion", /** Verifies literal compiled-native vectors for ordered, reverse and interleaved insertion. @returns Nothing. */ () => {
  // Literal snapshots from pinned AddChild/CreatePhantom/ValidateHierarchical, with unchanged native notification timing compared before explicit full invalidation.
  const cases = [
    {
      levels: [2, 2, 0, 2],
      counted: [true, true, true, true],
      vectors: [[7, 5, 3], [7, 5, 4], [8], [8, 5, 3]],
    },
    {
      levels: [2, 2, 0, 2],
      counted: [false, true, true, true],
      vectors: [[7, 5, 2], [7, 5, 3], [8], [8, 5, 3]],
    },
    {
      levels: [2, 2, 0, 2],
      counted: [false, false, false, false],
      vectors: [[6, 4, 2], [6, 4, 2], [6], [6, 4, 2]],
    },
    {
      levels: [2, 1, 2, 0, 2],
      counted: [true, true, true, true, true],
      vectors: [[7, 5, 3], [7, 6], [7, 6, 3], [8], [8, 5, 3]],
    },
    {
      levels: [2, 1, 2, 0, 2],
      counted: [false, true, true, true, true],
      vectors: [[7, 4, 2], [7, 5], [7, 5, 3], [8], [8, 5, 3]],
    },
    {
      levels: [2, 1, 2, 0, 2],
      counted: [false, false, false, false, false],
      vectors: [[6, 4, 2], [6, 4], [6, 4, 2], [6], [6, 4, 2]],
    },
    {
      levels: [0, 2, 2, 0, 2],
      counted: [true, true, true, true, true],
      vectors: [[7], [7, 5, 3], [7, 5, 4], [8], [8, 5, 3]],
    },
    {
      levels: [0, 2, 2, 0, 2],
      counted: [false, true, true, true, true],
      vectors: [[7], [7, 5, 3], [7, 5, 4], [8], [8, 5, 3]],
    },
    {
      levels: [0, 2, 2, 0, 2],
      counted: [false, false, false, false, false],
      vectors: [[6], [6, 4, 2], [6, 4, 2], [6], [6, 4, 2]],
    },
    {
      levels: [0, 3, 1, 3, 0],
      counted: [true, true, true, true, true],
      vectors: [[7], [7, 5, 3, 2], [7, 6], [7, 6, 3, 2], [8]],
    },
    {
      levels: [0, 3, 1, 3, 0],
      counted: [false, true, true, true, true],
      vectors: [[7], [7, 5, 3, 2], [7, 6], [7, 6, 3, 2], [8]],
    },
    {
      levels: [0, 3, 1, 3, 0],
      counted: [false, false, false, false, false],
      vectors: [[6], [6, 4, 2, 1], [6, 4], [6, 4, 2, 1], [6]],
    },
    {
      levels: [9, 9, 0, 9],
      counted: [true, true, true, true],
      vectors: [
        [7, 5, 3, 2, 4, 6, 8, 9, 10, 11],
        [7, 5, 3, 2, 4, 6, 8, 9, 10, 12],
        [8],
        [8, 5, 3, 2, 4, 6, 8, 9, 10, 11],
      ],
    },
    {
      levels: [9, 9, 0, 9],
      counted: [false, true, true, true],
      vectors: [
        [7, 5, 3, 2, 4, 6, 8, 9, 10, 10],
        [7, 5, 3, 2, 4, 6, 8, 9, 10, 11],
        [8],
        [8, 5, 3, 2, 4, 6, 8, 9, 10, 11],
      ],
    },
    {
      levels: [9, 9, 0, 9],
      counted: [false, false, false, false],
      vectors: [
        [6, 4, 2, 1, 3, 5, 7, 8, 9, 10],
        [6, 4, 2, 1, 3, 5, 7, 8, 9, 10],
        [6],
        [6, 4, 2, 1, 3, 5, 7, 8, 9, 10],
      ],
    },
    {
      levels: [1, 3, 1, 3],
      counted: [true, true, true, true],
      vectors: [
        [7, 5],
        [7, 5, 3, 2],
        [7, 6],
        [7, 6, 3, 2],
      ],
    },
    {
      levels: [1, 3, 1, 3],
      counted: [false, true, true, true],
      vectors: [
        [7, 5],
        [7, 5, 3, 2],
        [7, 6],
        [7, 6, 3, 2],
      ],
    },
    {
      levels: [1, 3, 1, 3],
      counted: [false, false, false, false],
      vectors: [
        [6, 4],
        [6, 4, 2, 1],
        [6, 4],
        [6, 4, 2, 1],
      ],
    },
    {
      levels: [0, 3, 0, 1, 3],
      counted: [true, true, false, true, true],
      vectors: [[7], [7, 5, 3, 2], [7], [7, 6], [7, 6, 3, 2]],
    },
    {
      levels: [0, 4, 0, 2, 3],
      counted: [true, true, false, true, true],
      vectors: [[7], [7, 5, 3, 2, 4], [7], [7, 5, 3], [7, 5, 3, 2]],
    },
    {
      levels: [0, 1, 3, 1, 3],
      counted: [true, true, false, true, true],
      vectors: [[7], [7, 5], [7, 5, 2, 1], [7, 6], [7, 6, 3, 2]],
    },
    {
      levels: [3, 0, 3, 0, 3],
      counted: [true, true, false, true, true],
      vectors: [[7, 5, 3, 2], [8], [8, 4, 2, 1], [9], [9, 5, 3, 2]],
    },
    {
      levels: [2, 2, 1, 2],
      counted: [true, true, false, true],
      vectors: [
        [7, 5, 3],
        [7, 5, 4],
        [7, 5],
        [7, 5, 5],
      ],
    },
    {
      levels: [0, 2, 0, 2],
      counted: [true, true, false, true],
      vectors: [[7], [7, 5, 3], [7], [7, 5, 3]],
    },
  ];
  for (const test of cases) {
    const { document, nodes } = fixture(
      test.levels.map(
        /** Supplies source-derived node policy. @param level - Requested level. @param index - Document position. @returns Item. */
        (level, index) => ({ level, counted: test.counted[index] as boolean }),
      ),
    );
    const rule = document.FindNumRulePtr("Counters");
    [7, 5, 3, 2, 4, 6, 8, 9, 10, 11].forEach(
      /** Sets literal level starts. @param start - Start value. @param level - Rule level. @returns Nothing. */
      (start, level) => updateRuleStart(rule, level, start),
    );
    const indexes = nodes.map(
      /** Builds document positions. @param _node - Item. @param index - Position. @returns Position. */
      (_node, index) => index,
    );
    for (const [orderIndex, order] of orders(indexes).entries()) {
      const root = new SwNodeNum(undefined, rule);
      const records = nodes.map(
        /** Creates independent native insertion records. @param node - Canonical item. @param index - Position. @returns Orphan. */
        (node) => {
          const record = node.GetNum() as SwNodeNum;
          record.RemoveMe();
          return record;
        },
      );
      for (const index of order)
        root.AddChild(records[index] as SwNodeNum, test.levels[index] as number);
      const lastChild = root.GetChildren().at(-1);
      if (lastChild !== undefined)
        (
          root as unknown as {
            /** Requests the same protected native group prefix as the timing oracle. @param target - Last owned child. @returns Nothing. */
            ValidateHierarchical(target: typeof lastChild): void;
          }
        ).ValidateHierarchical(lastChild);
      const native = nativeTiming[cases.indexOf(test)];
      expect(
        records.map(
          /** Reads insertion-time counters before explicit invalidation. @param record - Native record. @returns Vector. */
          (record) => record.GetNumberVector(),
        ),
      ).toEqual(native?.expected[orderIndex]);
      root.InvalidateTree();
      expect(
        records.map(
          /** Reads the complete native vector. @param record - Tree item. @returns Counters. */
          (record) => record.GetNumberVector(),
        ),
      ).toEqual(test.vectors);
      records.forEach(
        /** Verifies independently supplied insertion levels. @param record - Attached record. @param index - Literal policy index. @returns Nothing. */ (
          record,
          index,
        ) => expect(record.GetLevelInListTree()).toBe(test.levels[index]),
      );
    }
  }
});

/** Exposes native protected phantom helpers for their documented rejection/cleanup contracts. */
class PhantomRoot extends SwNodeNum {
  /** Requests a native phantom child. @returns New record, absent for an existing phantom. */
  public createPhantom(): SwNumberTreeNode | undefined {
    return this.CreatePhantom();
  }
  /** Selects the native destination phantom, retaining one already present. @returns Destination record. */
  public destinationPhantom(): SwNumberTreeNode | undefined {
    return this.GetDestinationPhantom();
  }
  /** Clears a no-content phantom chain. @returns Nothing. */
  public clearPhantoms(): void {
    this.ClearObsoletePhantoms();
  }
}
it("rejects non-orphan insertion and duplicate phantom records", /** Verifies native orphan/depth/equivalence guards and cleanup of empty phantom chains. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const text = document.paragraphs[0] as SwTextNode;
  const root = new PhantomRoot(undefined);
  const orphan = new SwNodeNum(text);
  root.AddChild(orphan, -1);
  expect(root.GetChildren()).toEqual([]);
  const phantom = root.destinationPhantom() as SwNumberTreeNode;
  expect(root.destinationPhantom()).toBe(phantom);
  expect(root.createPhantom()).toBeUndefined();
  root.clearPhantoms();
  expect(root.GetChildren()).toEqual([]);
  expect(phantom.HasPhantomCountedParent()).toBe(false);
  root.AddChild(orphan, 0);
  const another = new PhantomRoot(undefined);
  another.AddChild(orphan, 0);
  another.AddChild(root, 0);
  expect(another.GetChildren()).toEqual([]);
  root.AddChild(new SwNodeNum(text), 0);
  expect(root.GetChildren()).toEqual([orphan]);
});

/** Changes an independent level and applies it through native Set ownership. @param rule - Rule. @param level - Native level. @param start - Starting value. @returns Nothing. */
function updateRuleStart(rule: SwNumRule | undefined, level: number, start: number): void {
  const format = (rule as SwNumRule).Get(level).clone();
  format.SetStart(start);
  (rule as SwNumRule).Set(level, format);
}
