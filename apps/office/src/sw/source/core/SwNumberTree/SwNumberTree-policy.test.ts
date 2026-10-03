/** @fileoverview Differentially verifies complete native continuous/phantom tree policy,raw caches and notification paths against pinned source output. */
import { expect, it } from "vitest";
import { isDeepStrictEqual } from "node:util";
import { gunzipSync } from "node:zlib";
import data from "./SwNumberTree-policy-native.json";
import { SwNodeNum } from "./SwNodeNum";
import { type SwNumberTreeNode } from "./SwNumberTree";
import { SwDoc } from "../doc/doc";
import { SwNumRule } from "../doc/number";
import { SwTextFormatColl } from "../doc/fmtcol";
import { SwNumRuleItem } from "../para/paratr";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import type { SwTextNode } from "../txtnode/ndtxt";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
/** Native diagnostic tree observation; protected last-valid input is observed only in tests. */
type TreeState = [number, number, number, boolean, boolean, boolean, boolean, TreeState[]];
/** Literal native snapshot. */
interface Snapshot {
  events: number[];
  raw: (number | null)[];
  tree: TreeState | null;
  vectors: number[][];
  pred: number[][];
  clients: number[];
  registry: number[];
}
/** Native matrix inputs; no local counter calculations build expected output. */
interface Case {
  levels: number[];
  continuous: boolean;
  phantoms: boolean;
  reading: boolean;
  start: number;
  mask: number;
  readOrder: number;
  ops: number[][];
  expected: Snapshot[];
}
/** Test-only observer for native protected traversal and validation diagnostics. */
interface TreeDiagnostic {
  /** Native validated child pointer. */
  readonly mpLastValid?: SwNumberTreeNode;
  /** Reads native protected traversal. @returns Last descendant. */
  GetLastDescendant(): SwNumberTreeNode | undefined;
  /** Invokes native protected continuous validation. @param target - Requested child. @returns Nothing. */
  ValidateContinuous(target: SwNumberTreeNode | undefined): void;
}
/** Decodes stored literal output without consulting or invoking upstream. */
const native = JSON.parse(gunzipSync(Buffer.from(data.data, "base64")).toString("utf8")) as {
  cases: Case[];
  policy: (boolean | null)[][];
  markers: [boolean, number, number, boolean, string][];
};
/** Requires an actual test fixture owner. @param value - Candidate. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native fixture owner");
  return value;
}
/** Maps native ordinal positions and phantom depths without reading counters. @param node - Record. @param texts - Actual connected nodes. @returns Diagnostic identity. */
function id(node: SwNumberTreeNode | undefined, texts: SwTextNode[]): number {
  if (node === undefined) return -999;
  const text = (node as SwNodeNum).GetTextNode();
  return text === undefined ? -1 - node.GetLevelInListTree() : texts.indexOf(text);
}
/** Observes native raw prefix state independently of validating getters. @param node - Record. @param texts - Connected nodes. @returns State. */
function tree(node: SwNumberTreeNode, texts: SwTextNode[]): TreeState {
  return [
    id(node, texts),
    node.GetNumber(false),
    id((node as unknown as { mpLastValid?: SwNumberTreeNode }).mpLastValid, texts),
    node.IsPhantom(),
    node.IsCounted(),
    node.IsContinuous(),
    observePhantomCounting(node),
    getNumberTreeChildren(node).map(
      /** Observes each child without validation. @param child - Child. @returns State. */ (
        child,
      ) => tree(child, texts),
    ),
  ];
}
/** Captures raw state before chosen-order reads and registry state afterwards. @param doc - Actual document. @param rule - Stored owner. @param texts - Actual nodes. @param events - Nonvalidating event capture. @param readOrder - Native read order. @returns Snapshot. */
function snapshot(
  doc: SwDoc,
  rule: SwNumRule,
  texts: SwTextNode[],
  events: number[],
  readOrder: number,
): Snapshot {
  const raw = texts.map(
      /** Reads raw cache only. @param p - Paragraph. @returns Cache. */ (p) =>
        p.GetNum()?.GetNumber(false) ?? null,
    ),
    root = getNumberTreeRoot(
      texts
        .find(
          /** Finds an attached record. @param p - Paragraph. @returns Attachment. */ (p) =>
            p.GetNum() !== undefined,
        )
        ?.GetNum(),
    ),
    rawTree = root === undefined ? null : tree(root, texts),
    vectors: number[][] = Array.from({ length: texts.length });
  for (let k = 0; k < texts.length; k++) {
    const i = readOrder ? texts.length - 1 - k : k;
    vectors[i] = [...required(texts[i]).GetNumberVector()];
  }
  const clients: SwTextNode[] = [],
    registry: SwNodeNum[] = [];
  rule.GetTextNodeList(clients);
  doc.getIDocumentListItems().getNumItems(registry);
  return {
    events: [...events],
    raw,
    tree: rawTree,
    vectors,
    pred: texts.map(
      /** Observes native depth-first and sibling predecessor modes plus last descendant. @param p - Paragraph. @returns Identities. */ (
        p,
      ) => {
        const n = p.GetNum();
        return [
          id(n?.GetPred(), texts),
          id(n?.GetPred(true), texts),
          id((n as unknown as TreeDiagnostic | undefined)?.GetLastDescendant(), texts),
        ];
      },
    ),
    clients: clients.map(
      /** Maps actual client order. @param p - Client. @returns Ordinal. */ (p) => texts.indexOf(p),
    ),
    registry: registry.map(
      /** Maps actual sorted registry. @param n - Record. @returns Ordinal. */ (n) =>
        texts.indexOf(required(n.GetTextNode())),
    ),
  };
}
it("matches native bound orphan and inherited continuous phantom policies", /** Compares five literal source profiles,including native independent no-rule phantom fallback. @returns Nothing. */ () => {
  const operationDocument = createWriterDocument();
  for (const row of native.policy) {
    const [continuous, phantoms] = row;
    if (continuous === null) {
      const orphan = new SwNodeNum(undefined);
      expect([orphan.IsContinuous(), observePhantomCounting(orphan)]).toEqual(row.slice(2));
      continue;
    }
    const rule = new SwNumRule("policy", "label-alignment");
    rule.SetContinusNum(continuous as boolean);
    rule.SetCountPhantoms(phantoms as boolean);
    const root = new SwNodeNum(undefined, rule),
      child = new SwNodeNum(undefined);
    root.AddChild(child, 0, operationDocument);
    expect([
      root.IsContinuous(),
      observePhantomCounting(root),
      child.IsContinuous(),
      observePhantomCounting(child),
    ]).toEqual(row.slice(2));
  }

  operationDocument.Dispose();
});
it("retains native empty and end sentinel validation with protected traversal", /** Exercises source sentinel boundaries independently of paragraph insertion traces. @returns Nothing. */ () => {
  const rule = new SwNumRule("sentinel", "label-alignment");
  rule.SetContinusNum(true);
  const root = new SwNodeNum(undefined, rule),
    probe = root as unknown as TreeDiagnostic;
  probe.ValidateContinuous(undefined);
  expect(probe.mpLastValid).toBeUndefined();
  expect(probe.GetLastDescendant()).toBeUndefined();
  const child = new SwNodeNum(undefined, rule),
    foreign = new SwNodeNum(undefined, rule),
    doc = new SwDoc(false);
  doc.SetInReading(true);
  root.AddChild(child, 0, doc);
  probe.ValidateContinuous(foreign);
  expect(child.GetNumber(false)).toBe(1);
  expect(probe.mpLastValid).toBeUndefined();
  expect(probe.GetLastDescendant()).toBe(child);
  probe.ValidateContinuous(child);
  expect(probe.mpLastValid).toBe(child);
  probe.ValidateContinuous(undefined);
  expect(probe.mpLastValid).toBeUndefined();
  const skippedRoot = new SwNodeNum(undefined, rule),
    descendant = new SwNodeNum(undefined, rule);
  skippedRoot.AddChild(descendant, 1, doc);
  (skippedRoot as unknown as TreeDiagnostic).ValidateContinuous(undefined);
  const phantom = required(getNumberTreeChildren(skippedRoot)[0]);
  expect(phantom.IsCounted()).toBe(false);
  expect(phantom.GetPred()).toBeUndefined();
  expect(phantom.GetNumber(false)).toBe(0);
  expect(descendant.GetNumber()).toBe(1);
  const restartRule = doc.AddNumRule(new SwNumRule("first-restart", "label-alignment")),
    first = doc.nodes.MakeTextNode();
  restartRule.SetAutoRule(false);
  restartRule.SetContinusNum(true);
  applyWriterParagraphList(first, {
    kind: "numbered",
    styleId: "first-restart",
    listId: "first-restart",
    level: 0,
  });
  first.SetListRestart(true);
  first.SetAttrListRestartValue(7);
  expect(first.IsListRestart()).toBe(true);
  expect(first.GetActualListStartValue()).toBe(7);
  expect(required(first.GetNum()).GetPred()).toBeUndefined();
  expect(first.GetListItemNumber()).toBe(7);
  first.SetCountedInList(false);
  expect(first.IsCountedInList()).toBe(false);
  required(first.GetNum()).InvalidateMe();
  expect(first.GetListItemNumber()).toBe(0);
  doc.Dispose();
});
it("matches native complete policy counter cache notification and traversal sequences", /** Compares69120 actual record states through source-owned document/list/attribute APIs. @returns Nothing. */ () => {
  let states = 0;
  for (const [caseIndex, test] of native.cases.entries()) {
    const doc = new SwDoc(false),
      rule = doc.AddNumRule(new SwNumRule("Counters", "label-alignment"));
    rule.SetAutoRule(false);
    rule.SetContinusNum(test.continuous);
    rule.SetCountPhantoms(test.phantoms);
    for (let n = 0; n < 10; n++)
      if (test.mask & (1 << n)) {
        const f = rule.Get(n).clone();
        f.SetStart(test.start + n);
        rule.Set(n, f);
      }
    const style = new SwTextFormatColl(doc.GetAttrPool(), "audit", "Audit"),
      texts = test.levels.map(
        /** Creates connected blank-style nodes before native ordered insertion. @returns Node. */ () => {
          const node = doc.nodes.MakeTextNode();
          node.ChgFormatColl(style);
          return node;
        },
      );
    doc.SetInReading(test.reading);
    const events: number[] = [],
      notify = doc.NotifyModelChange.bind(doc);
    doc.NotifyModelChange =
      /** Captures source numbering events without eager reads. @param hint - Hint. @returns Nothing. */ (
        hint,
      ) => {
        if (hint.kind === "numbering-changed")
          events.push(
            texts.findIndex(
              /** Maps the actual hinted node. @param n - Node. @returns Identity. */ (n) =>
                n.GetIndex() === hint.nodeIndex,
            ),
          );
        notify(hint);
      };
    for (const [step, op] of test.ops.entries()) {
      const [kind, at, value] = op as [number, number, number],
        node = required(texts[at]);
      events.splice(0);
      if (kind === 0) {
        const items = new SfxItemSet(doc.GetAttrPool(), [[1, 87]]);
        items.Put(new SwNumRuleItem("Counters"));
        items.Put(new SfxStringItem(83, "A"));
        items.Put(new SfxInt16Item(84, required(test.levels[at])));
        node.SetAttr(items);
      }
      if (kind === 1) node.SetCountedInList(Boolean(value));
      if (kind === 2) {
        const items = new SfxItemSet(doc.GetAttrPool(), [[1, 87]]);
        items.Put(new SfxBoolItem(85, true));
        items.Put(new SfxInt16Item(86, value));
        node.SetAttr(items);
      }
      if (kind === 3) node.SetAttrListLevel(value);
      if (kind === 4) node.ResetAttr(73);
      if (kind === 5) rule.Validate(doc);
      if (kind === 6) {
        rule.SetContinusNum(Boolean(value));
        doc.GetDocumentListsManager().GetListByName("A")?.InvalidateListTree();
      }
      if (kind === 7) {
        rule.SetCountPhantoms(Boolean(value));
        doc.GetDocumentListsManager().GetListByName("A")?.InvalidateListTree();
      }
      if (kind === 8) doc.GetDocumentListsManager().GetListByName("A")?.ValidateListTree(doc);
      if (kind === 9) doc.SetInReading(Boolean(value));
      if (kind === 10) node.GetNum()?.InvalidateAndNotifyTree(doc);
      const actual = snapshot(doc, rule, texts, events, test.readOrder),
        expected = required(test.expected[step]);
      if (!isDeepStrictEqual(actual, expected))
        expect(actual, `case${caseIndex} step${step} op${op}`).toEqual(expected);
      states += texts.length;
    }
    doc.Dispose();
  }
  expect(states).toBe(69120);
});
it("matches native continuous legacy marker selection without changing explicit list patterns", /** Compares64 native full MakeNumString results for supported decimal profiles. @returns Nothing. */ () => {
  for (const [continuous, include, level, pattern, result] of native.markers) {
    const rule = new SwNumRule("markers", "label-alignment");
    rule.SetContinusNum(continuous);
    for (let n = 0; n < 10; n++) {
      const f = rule.Get(n).clone();
      f.SetPrefix("[");
      f.SetSuffix("]");
      f.SetIncludeUpperLevels(include);
      if (pattern) f.SetListFormat("%1%.%2%.%3%");
      rule.Set(n, f);
    }
    expect(rule.MakeNumString([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], level)).toBe(result);
  }
});
it("retains continuous and phantom policy on real Worker document owners and native copy reset boundaries", /** Exercises real nested document records,registry and snapshots;ODT retains only its already supported fields. @returns Completion. */ async () => {
  const doc = createWriterDocument(),
    rule = doc.AddNumRule(new SwNumRule("attached", "label-alignment"));
  rule.SetAutoRule(false);
  rule.SetContinusNum(true);
  rule.SetCountPhantoms(false);
  rule.SetDefaultListId("list");
  const levels = [0, 2, 2, 0],
    texts = levels.map(
      /** Inserts canonical nested nodes. @param level - Level. @param index - Position. @returns Node. */ (
        level,
        index,
      ) => {
        const n = index === 0 ? required(doc.paragraphs[0]) : doc.nodes.MakeTextNode();
        applyWriterParagraphList(n, {
          kind: "numbered",
          styleId: "attached",
          listId: "list",
          level,
        });
        return n;
      },
    );
  expect(
    texts.map(
      /** Reads source continuous count. @param p - Paragraph. @returns Counter. */ (p) =>
        p.GetListItemNumber(),
    ),
  ).toEqual([1, 2, 3, 4]);
  const copied = decodeWriterDocument(encodeWriterDocument(doc)),
    owner = required(copied.FindNumRulePtr("attached"));
  expect(owner.IsContinusNum()).toBe(true);
  expect(owner.IsCountPhantoms()).toBe(false);
  expect(owner.GetTextNodeListSize()).toBe(4);
  expect(
    copied.paragraphs.map(
      /** Reads restored actual tree counts. @param p - Paragraph. @returns Counter. */ (p) =>
        p.GetListItemNumber(),
    ),
  ).toEqual([1, 2, 3, 4]);
  const copy = new SwNumRule(rule);
  expect(copy.IsContinusNum()).toBe(true);
  expect(copy.IsCountPhantoms()).toBe(true);
  expect(copy.GetTextNodeListSize()).toBe(0);
  rule.Reset("attached");
  expect(rule.IsContinusNum()).toBe(false);
  expect(rule.IsCountPhantoms()).toBe(false);
  rule.Validate(doc);
  expect(
    texts.map(
      /** Reads hierarchical counters after native reset. @param p - Paragraph. @returns Counter. */ (
        p,
      ) => p.GetListItemNumber(),
    ),
  ).toEqual([1, 1, 2, 2]);
  const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "Policy" }), {
    title: "Policy",
  });
  expect(
    reopened.document.paragraphs.map(
      /** Reads already supported ODT levels. @param p - Paragraph. @returns Level. */ (p) =>
        p.GetAttrListLevel(),
    ),
  ).toEqual(levels);
  reopened.document.Dispose();
  copied.Dispose();
  doc.Dispose();
});

/** Observes native protected root identity only in tests. @param node - Diagnostic record, absent for an empty fixture. @returns Root pointer or null equivalent. */
function getNumberTreeRoot(node: SwNumberTreeNode | undefined): SwNumberTreeNode | undefined {
  return (
    node as unknown as
      | {
          /** Reads the protected root. @returns Root pointer or null equivalent. */
          GetRoot(): SwNumberTreeNode | undefined;
        }
      | undefined
  )?.GetRoot();
}

/** Observes protected child storage solely for diagnostics. @param node - Owned tree record. @returns Direct children in native order. */
function getNumberTreeChildren(node: SwNumberTreeNode): readonly SwNumberTreeNode[] {
  return [...(node as unknown as { mChildren: Iterable<SwNumberTreeNode> }).mChildren];
}

/** Observes the protected IsCountPhantoms policy solely in tests. @param node - Owned record. @returns Native policy flag. */
function observePhantomCounting(node: SwNumberTreeNode): boolean {
  return (
    node as unknown as {
      /** Reads the native protected policy. @returns Flag. */ IsCountPhantoms(): boolean;
    }
  ).IsCountPhantoms();
}
