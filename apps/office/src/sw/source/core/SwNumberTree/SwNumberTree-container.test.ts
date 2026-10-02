/** @fileoverview Verifies native sorted unique child transfers and retained container identity using owned document records only. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Observes protected native storage and transfer methods only within tests. */
interface TransferDiagnostic {
  readonly mChildren: Iterable<SwNumberTreeNode>;
  readonly mpLastValid?: SwNumberTreeNode;
  /** Moves all children. @param destination - Destination. @returns Nothing. */
  MoveChildren(destination: SwNumberTreeNode): void;
  /** Moves the later suffix. @param compare - Boundary. @param destination - Destination. @returns Nothing. */
  MoveGreaterChildren(compare: SwNumberTreeNode, destination: SwNumberTreeNode): void;
  /** Requests a native phantom. @returns New record or rejected equivalent. */
  CreatePhantom(): SwNumberTreeNode | undefined;
}
/** Reads the native protected diagnostic surface. @param node - Record. @returns Test-only view. */
function probe(node: SwNumberTreeNode): TransferDiagnostic {
  return node as unknown as TransferDiagnostic;
}
/** Requires an owned value. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing sorted-child fixture owner");
  return value;
}
/** Creates retained real records and independent core roots under reading suppression. @returns Owners. */
function fixture() {
  const document = createWriterDocument();
  document.SetInReading(true);
  const texts = [required(document.paragraphs[0])];
  for (let index = 1; index < 4; index++) texts.push(document.nodes.MakeTextNode());
  const records = texts.map(
    /** Retains the actual paragraph-owned record. @param text - Paragraph. @returns Record. */
    (text) => {
      applyWriterParagraphList(text, {
        kind: "numbered",
        styleId: "SortedChildren",
        listId: "sorted-children",
        level: 0,
      });
      const record = required(text.GetNum());
      record.RemoveMe(document);
      return record;
    },
  );
  const rule = required(texts[0]?.GetNumRule());
  return {
    document,
    texts,
    records,
    source: new SwNodeNum(undefined, rule),
    destination: new SwNodeNum(undefined, rule),
  };
}

it("merges children in comparator order and retains destination identity for equivalent keys", /** Checks native bulk sorted union and source-parent updates before rejected equality. @returns Nothing. */ () => {
  const { document, texts, records, source, destination } = fixture();
  const duplicate = new SwNodeNum(required(texts[1]));
  destination.AddChild(required(records[1]), 0, document);
  destination.AddChild(required(records[3]), 0, document);
  source.AddChild(required(records[0]), 0, document);
  source.AddChild(duplicate, 0, document);
  source.AddChild(required(records[2]), 0, document);
  const sourceStorage = probe(source).mChildren;
  const destinationStorage = probe(destination).mChildren;
  probe(source).MoveChildren(destination);
  expect([...probe(destination).mChildren]).toEqual(records);
  expect([...probe(source).mChildren]).toEqual([]);
  expect(probe(source).mChildren).toBe(sourceStorage);
  expect(probe(destination).mChildren).toBe(destinationStorage);
  expect(Array.isArray(sourceStorage)).toBe(false);
  expect(duplicate.GetParent()).toBe(destination);
  expect([...probe(destination).mChildren]).not.toContain(duplicate);
  expect(
    records.map(
      /** Reads raw counters. @param record - Item. @returns Counter. */ (record) =>
        record.GetNumber(false),
    ),
  ).toEqual([0, 0, 0, 0]);
  expect(
    records.map(
      /** Reads resulting owners. @param record - Item. @returns Parent. */ (record) =>
        record.GetParent(),
    ),
  ).toEqual([destination, destination, destination, destination]);
  expect(probe(source).mpLastValid).toBeUndefined();
  probe(source).MoveGreaterChildren(required(records[0]), destination);
  document.Dispose();
});

it("rejects a phantom factory result equivalent to an existing no-text record", /** Checks native unique insertion rejection without replacing or duplicating storage. @returns Nothing. */ () => {
  const { document, source } = fixture();
  const existing = new SwNodeNum(undefined);
  source.AddChild(existing, 0, document);
  expect(probe(source).CreatePhantom()).toBeUndefined();
  expect([...probe(source).mChildren]).toEqual([existing]);
  expect(existing.GetParent()).toBe(source);
  expect(existing.IsPhantom()).toBe(false);
  expect(existing.GetNumber(false)).toBe(0);
  document.Dispose();
});

it("inserts transferred suffix records uniquely into an existing destination", /** Checks source upper-bound transfer, destination identity and unchanged stored counters. @returns Nothing. */ () => {
  const { document, texts, records, source, destination } = fixture();
  const duplicate = new SwNodeNum(required(texts[3]));
  source.AddChild(required(records[1]), 0, document);
  source.AddChild(required(records[3]), 0, document);
  destination.AddChild(required(records[0]), 0, document);
  destination.AddChild(required(records[2]), 0, document);
  destination.AddChild(duplicate, 0, document);
  expect(required(records[3]).GetNumber()).toBe(2);
  probe(source).MoveGreaterChildren(required(records[0]), destination);
  expect([...probe(destination).mChildren]).toEqual([
    records[0],
    records[1],
    records[2],
    duplicate,
  ]);
  expect([...probe(source).mChildren]).toEqual([]);
  expect(required(records[3]).GetParent()).toBe(destination);
  expect([...probe(destination).mChildren]).not.toContain(records[3]);
  expect(
    records.map(
      /** Reads transferred cached values. @param record - Item. @returns Counter. */ (record) =>
        record.GetNumber(false),
    ),
  ).toEqual([0, 1, 0, 2]);
  expect(probe(source).mpLastValid).toBeUndefined();
  document.Dispose();
});

it("merges leading phantom chains into the retained destination tail without replacing containers", /** Checks recursive native ownership and cleared source storage. @returns Nothing. */ () => {
  const { document, records, source, destination } = fixture();
  source.AddChild(required(records[2]), 2, document);
  destination.AddChild(required(records[0]), 1, document);
  const sourcePhantom = required([...probe(source).mChildren][0]);
  const nestedPhantom = required([...probe(sourcePhantom).mChildren][0]);
  const destinationPhantom = required([...probe(destination).mChildren][0]);
  const sourceStorage = probe(source).mChildren;
  probe(source).MoveChildren(destination);
  expect([...probe(destination).mChildren]).toEqual([destinationPhantom]);
  expect([...probe(destinationPhantom).mChildren]).toEqual([records[0]]);
  expect([...probe(required(records[0])).mChildren]).toEqual([records[2]]);
  expect(required(records[2]).GetParent()).toBe(records[0]);
  expect(sourcePhantom.GetParent()).toBeUndefined();
  expect(nestedPhantom.GetParent()).toBeUndefined();
  expect([...probe(source).mChildren]).toEqual([]);
  expect(probe(source).mChildren).toBe(sourceStorage);
  expect([required(records[0]).GetNumber(false), required(records[2]).GetNumber(false)]).toEqual([
    0, 0,
  ]);
  document.Dispose();
});
