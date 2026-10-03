/** @fileoverview Verifies source-owned descendant destination selection using owned records and explicit diagnostic traces only. */
import { expect, it, vi } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import { SwNumberTreeNode } from "./SwNumberTree";
import type { SortedVector } from "../../../../o3tl/inc/sorted_vector";

/** Observes native protected transfer and factory contracts exclusively in tests. */
interface DestinationDiagnostic {
  readonly mChildren: SortedVector<SwNumberTreeNode>;
  readonly mpLastValid: SwNumberTreeNode | undefined;
  /** Moves a later suffix. @param compare - Boundary. @param destination - New owner. @returns Nothing. */
  MoveGreaterChildren(compare: SwNumberTreeNode, destination: SwNumberTreeNode): void;
  /** Creates a source phantom. @returns Created node or rejected duplicate. */
  CreatePhantom(): SwNumberTreeNode | undefined;
}
/** Reads test-only diagnostics. @param node - Owned node. @returns Native hooks. */
function probe(node: SwNumberTreeNode): DestinationDiagnostic {
  return node as unknown as DestinationDiagnostic;
}
/** Requires a fixture value. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing destination fixture owner");
  return value;
}
/** Builds a retained orphan and its real predecessor subtree. @param levels - List depths. @param inserted - Orphan index. @returns Owners. */
function fixture(levels: number[], inserted: number) {
  const document = createWriterDocument();
  document.SetInReading(true);
  const texts = levels.map(
    /** Allocates canonical paragraphs. @param _level - Depth. @param index - Position. @returns Owner. */
    (_level, index) =>
      index === 0 ? required(document.paragraphs[0]) : document.nodes.MakeTextNode(),
  );
  const records = texts.map(
    /** Registers actual records. @param text - Owner. @param index - Depth index. @returns Record. */
    (text, index) => {
      applyWriterParagraphList(text, {
        kind: "numbered",
        level: required(levels[index]),
        styleId: "Destination",
        listId: "destination",
      });
      return required(text.GetNum());
    },
  );
  const child = required(records[inserted]);
  const root = required(child.GetParent());
  child.RemoveMe(document);
  return { document, records, child, root };
}
/** Reads real owned raw counters. @param records - Records. @returns Stored numbers. */
function raw(records: SwNodeNum[]): number[] {
  return records.map(
    /** Reads without validation. @param node - Record. @returns Counter. */ (node) =>
      node.GetNumber(false),
  );
}
/** Records native count/transfer/factory calls without changing their implementations. @param records - Labeled owners. @returns Trace and phantom identities. */
function observe(records: readonly (readonly [SwNumberTreeNode, string])[]) {
  const labels = new Map(records);
  const events: string[] = [];
  const phantoms: SwNumberTreeNode[] = [];
  /** Watches one owner and each subsequently created phantom. @param node - Record. @returns Nothing. */
  function watch(node: SwNumberTreeNode): void {
    const name = required(labels.get(node));
    const count = node.GetChildCount.bind(node);
    vi.spyOn(node, "GetChildCount").mockImplementation(
      /** Records an actual count. @returns Count. */ () => {
        const result = count();
        events.push(`count:${name}:${result}`);
        return result;
      },
    );
    const hooks = probe(node);
    const move = hooks.MoveGreaterChildren.bind(node);
    vi.spyOn(hooks, "MoveGreaterChildren").mockImplementation(
      /** Records an actual transfer. @param compare - Boundary. @param destination - New owner. @returns Nothing. */
      (compare, destination) => {
        events.push(`move:${name}:${required(labels.get(destination))}`);
        move(compare, destination);
      },
    );
    const create = hooks.CreatePhantom.bind(node);
    vi.spyOn(hooks, "CreatePhantom").mockImplementation(
      /** Retains the actual factory result. @returns Phantom. */ () => {
        const result = required(create());
        const label = `P${phantoms.length}`;
        labels.set(result, label);
        phantoms.push(result);
        events.push(`create:${name}:${label}`);
        watch(result);
        return result;
      },
    );
  }
  for (const [node] of records) watch(node);
  return { events, phantoms };
}
/** Verifies the final real topology and unchanged native raw/default observations. @param records - Owners. @param root - List root. @param reading - Policy. @returns Nothing. */
function checkDeep(records: SwNodeNum[], root: SwNumberTreeNode, reading: boolean): void {
  const [first, earlier, leaf, inserted, later, nested] = records.map(required);
  expect([...probe(root).mChildren]).toEqual([first, inserted]);
  expect([...probe(required(first)).mChildren]).toEqual([earlier]);
  expect([...probe(required(earlier)).mChildren]).toEqual([leaf]);
  expect([...probe(required(inserted)).mChildren]).toEqual([later]);
  expect([...probe(required(later)).mChildren]).toEqual([nested]);
  expect(raw(records)).toEqual(reading ? [0, 0, 0, 0, 0, 0] : [1, 1, 1, 2, 1, 1]);
  expect(probe(root).mpLastValid).toBe(reading ? undefined : inserted);
  expect(probe(required(inserted)).mpLastValid).toBe(reading ? undefined : later);
  expect(Object.hasOwn(SwNumberTreeNode.prototype, "GetDestinationPhantom")).toBe(false);
}

it("selects real-child parent and empty destinations in native count order with retained reading and notification behavior", /** Checks actual deep insertion under both notification policies. @returns Nothing. */ () => {
  for (const reading of [true, false]) {
    const { document, records, child, root } = fixture([0, 1, 2, 0, 1, 2], 3);
    const trace = observe(
      records.map(
        /** Labels canonical owners. @param node - Record. @param index - Position. @returns Entry. */ (
          node,
          index,
        ) => [node, required(["A", "B", "C", "new", "D", "E"][index])] as const,
      ),
    );
    const notifications = vi.spyOn(root, "NotifyInvalidChildren");
    try {
      document.SetInReading(reading);
      root.AddChild(child, 0, document);
      expect(trace.events).toEqual([
        "count:new:0",
        "count:A:2",
        "move:A:new",
        "count:A:1",
        "count:new:1",
        "create:new:P0",
        "count:B:1",
        "move:B:P0",
        "count:B:1",
        "count:P0:0",
        "create:P0:P1",
        "count:C:0",
      ]);
      expect(notifications).toHaveBeenCalledTimes(reading ? 0 : 1);
      expect(
        trace.phantoms.map(
          /** Reads released factory nodes. @param phantom - Created node. @returns Parent. */ (
            phantom,
          ) => phantom.GetParent(),
        ),
      ).toEqual([undefined, undefined]);
      checkDeep(records, root, reading);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("retains an existing destination phantom at an explicit comparator diagnostic boundary", /** Exercises the source phantom branch without claiming native Writer final-class reentrancy. @returns Nothing. */ () => {
  const { document, records, child, root } = fixture([0, 1, 2, 0, 1, 2], 3);
  const first = required(records[0]),
    earlier = required(records[1]);
  const trace = observe(
    records.map(
      /** Labels owners. @param node - Record. @param index - Position. @returns Entry. */ (
        node,
        index,
      ) => [node, required(["A", "B", "C", "new", "D", "E"][index])] as const,
    ),
  );
  let moving = false,
    injected = false;
  const source = probe(first).mChildren,
    upper = source.upper_bound.bind(source);
  vi.spyOn(source, "upper_bound").mockImplementation(
    /** Identifies the actual transfer lookup. @param key - Boundary. @returns Position. */ (
      key,
    ) => {
      moving = true;
      try {
        return upper(key);
      } finally {
        moving = false;
      }
    },
  );
  const compare = child.LessThan.bind(child);
  vi.spyOn(child, "LessThan").mockImplementation(
    /** Inserts a real factory phantom only at the explicit diagnostic boundary. @param other - Compared owner. @returns Original ordering. */ (
      other,
    ) => {
      const result = compare(other);
      if (moving && other === earlier && !injected) {
        injected = true;
        probe(child).CreatePhantom();
      }
      return result;
    },
  );
  try {
    root.AddChild(child, 0, document);
    expect(injected).toBe(true);
    expect(trace.events).toEqual([
      "count:new:0",
      "count:A:2",
      "move:A:new",
      "create:new:P0",
      "count:A:1",
      "count:new:2",
      "count:B:1",
      "move:B:P0",
      "count:B:1",
      "count:P0:0",
      "create:P0:P1",
      "count:C:0",
    ]);
    expect(trace.phantoms).toHaveLength(2);
    checkDeep(records, root, true);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("stops destination selection when transfer empties the predecessor and creates no additional phantom", /** Checks native early loop exit and actual retained owner state. @returns Nothing. */ () => {
  const { document, records, child, root } = fixture([0, 0, 1], 1);
  const trace = observe(
    records.map(
      /** Labels owners. @param node - Record. @param index - Position. @returns Entry. */ (
        node,
        index,
      ) => [node, required(["A", "new", "D"][index])] as const,
    ),
  );
  try {
    root.AddChild(child, 0, document);
    expect(trace.events).toEqual(["count:new:0", "count:A:1", "move:A:new", "count:A:0"]);
    expect(trace.phantoms).toEqual([]);
    expect([...probe(root).mChildren]).toEqual([records[0], child]);
    expect([...probe(child).mChildren]).toEqual([records[2]]);
    expect(required(records[2]).GetParent()).toBe(child);
    expect(raw(records)).toEqual([0, 0, 0]);
    expect(probe(root).mpLastValid).toBeUndefined();
    expect(Object.hasOwn(SwNumberTreeNode.prototype, "GetDestinationPhantom")).toBe(false);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});
