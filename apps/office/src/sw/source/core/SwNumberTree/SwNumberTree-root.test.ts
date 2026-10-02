/** @fileoverview Verifies native protected root identity and browser list membership through public parent links without upstream access. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Exposes protected method types only within the test subclass. */
class RootContract extends SwNodeNum {
  /** Binds the native zero-argument root contract for type inspection. */
  public readonly root = this.GetRoot.bind(this);
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contract: [
  "GetRoot" extends keyof SwNumberTreeNode ? false : true,
  "GetRoot" extends keyof SwNodeNum ? false : true,
  Same<Parameters<RootContract["root"]>, []>,
  Same<ReturnType<RootContract["root"]>, SwNumberTreeNode | undefined>,
] = [true, true, true, true];

/** Reads protected roots solely through the test observer. @param node - Record. @returns Root, absent for a root or orphan. */
function getNumberTreeRoot(node: SwNumberTreeNode): SwNumberTreeNode | undefined {
  return (
    node as unknown as {
      /** Observes the protected root. @returns Root pointer or null equivalent. */
      GetRoot(): SwNumberTreeNode | undefined;
    }
  ).GetRoot();
}
/** Requires a fixture owner. @param value - Candidate. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing root fixture owner");
  return value;
}

it("keeps native root access protected without a public subclass re-export", /** Typechecking rejects the preceding public root exposure. @returns Nothing. */ () => {
  expect(contract).toEqual([true, true, true, true]);
});

it("retains exact roots and list membership across phantoms orphans foreign documents and list moves", /** Checks ownership-only getters without reading or validating counters. @returns Nothing. */ () => {
  const document = createWriterDocument();
  document.SetInReading(true);
  const texts = [0, 9, 0].map(
    /** Inserts owned records into two roots sharing a rule. @param level - Native depth. @param index - Document ordinal. @returns Paragraph. */
    (level, index) => {
      const text = index === 0 ? required(document.paragraphs[0]) : document.nodes.MakeTextNode();
      applyWriterParagraphList(text, {
        kind: "numbered",
        level,
        styleId: "Roots",
        listId: index === 2 ? "root-b" : "root-a",
      });
      return text;
    },
  );
  const first = required(texts[0]);
  const nested = required(texts[1]);
  const other = required(texts[2]);
  const firstRecord = required(first.GetNum());
  const nestedRecord = required(nested.GetNum());
  const otherRecord = required(other.GetNum());
  const a = required(document.GetDocumentListsManager().GetListByName("root-a"));
  const b = required(document.GetDocumentListsManager().GetListByName("root-b"));
  const rootA = required(getNumberTreeRoot(firstRecord));
  const rootB = required(getNumberTreeRoot(otherRecord));
  expect(getNumberTreeRoot(nestedRecord)).toBe(rootA);
  expect(required(nestedRecord.GetParent()).IsPhantom()).toBe(true);
  expect(getNumberTreeRoot(rootA)).toBeUndefined();
  expect(getNumberTreeRoot(rootB)).toBeUndefined();
  expect(rootA).not.toBe(rootB);
  expect(a.GetListItem(first)).toBe(firstRecord);
  expect(a.GetListItem(nested)).toBe(nestedRecord);
  expect(b.GetListItem(other)).toBe(otherRecord);
  expect(a.GetListItem(other)).toBeUndefined();
  expect(b.GetListItem(first)).toBeUndefined();
  const missing = document.nodes.MakeTextNode();
  expect(a.GetListItem(missing)).toBeUndefined();
  expect(getNumberTreeRoot(new SwNodeNum(missing))).toBeUndefined();
  const foreignDocument = createWriterDocument();
  const foreign = required(foreignDocument.paragraphs[0]);
  applyWriterParagraphList(foreign, {
    kind: "numbered",
    level: 0,
    styleId: "Roots",
    listId: "root-a",
  });
  expect(a.GetListItem(foreign)).toBeUndefined();
  expect(getNumberTreeRoot(required(foreign.GetNum()))).not.toBe(rootA);
  expect([
    firstRecord.GetNumber(false),
    nestedRecord.GetNumber(false),
    otherRecord.GetNumber(false),
  ]).toEqual([0, 0, 0]);
  nested.RemoveFromList();
  expect(getNumberTreeRoot(nestedRecord)).toBeUndefined();
  expect(a.GetListItem(nested)).toBeUndefined();
  nested.AddToList();
  const replacement = required(nested.GetNum());
  expect(replacement === nestedRecord).toBe(false);
  expect(a.GetListItem(nested)).toBe(replacement);
  expect(getNumberTreeRoot(replacement)).toBe(rootA);
  applyWriterParagraphList(nested, {
    kind: "numbered",
    level: 9,
    styleId: "Roots",
    listId: "root-b",
  });
  expect(a.GetListItem(nested)).toBeUndefined();
  const moved = required(nested.GetNum());
  expect(b.GetListItem(nested)).toBe(moved);
  expect(getNumberTreeRoot(moved)).toBe(rootB);
  expect(getNumberTreeRoot(firstRecord)).toBe(rootA);
  foreignDocument.Dispose();
  document.Dispose();
});
