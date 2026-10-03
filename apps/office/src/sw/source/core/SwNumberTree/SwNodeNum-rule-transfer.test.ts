/** @fileoverview Verifies complete Writer rule-client transfer owner branches using actual records without upstream access. */
import { expect, it, vi } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import type { SwNumRule } from "../doc/number";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contracts: [
  Same<Parameters<SwNodeNum["ChangeNumRule"]>, [SwNumRule]>,
  Same<ReturnType<SwNodeNum["ChangeNumRule"]>, void>,
  Same<Extract<keyof SwNodeNum, "ChangeNumRule">, "ChangeNumRule">,
  Same<Extract<keyof SwNodeNum, "mpNumRule" | "textNode" | "m_isHiddenRedlines">, never>,
] = [true, true, true, true];
/** Observes protected topology only in tests. */
interface Diagnostic {
  readonly mChildren: Iterable<SwNumberTreeNode>;
  /** Finds the actual root. @returns Root pointer. */
  GetRoot(): SwNumberTreeNode | undefined;
}
/** Reads test-only diagnostics. @param node - Record. @returns View. */
function probe(node: SwNumberTreeNode): Diagnostic {
  return node as unknown as Diagnostic;
}
/** Requires an actual owner. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing rule-transfer fixture owner");
  return value;
}
/** Reads actual client order. @param rule - Rule. @returns Clients. */
function clients(rule: SwNumRule): SwTextNode[] {
  const output: SwTextNode[] = [];
  rule.GetTextNodeList(output);
  return output;
}
/** Creates two actual rules with independent insertion-ordered clients. @returns Owners. */
function fixture() {
  const document = createWriterDocument();
  document.SetInReading(true);
  const oldRule = document.EnsureNumRule("RuleTransferOld", "numbered"),
    newRule = document.EnsureNumRule("RuleTransferNew", "numbered"),
    texts = [required(document.paragraphs[0])];
  for (let index = 1; index < 4; index++) texts.push(document.nodes.MakeTextNode());
  const records = texts.map(
    /** Applies canonical list attributes. @param text - Owner. @param index - Rule selection. @returns Record. */
    (text, index) => {
      applyWriterParagraphList(text, {
        kind: "numbered",
        level: 1,
        styleId: index < 2 ? "RuleTransferOld" : "RuleTransferNew",
        listId: index < 2 ? "rule-transfer-old" : "rule-transfer-new",
      });
      return required(text.GetNum());
    },
  );
  const first = required(records[0]),
    root = required(probe(first).GetRoot()) as SwNodeNum,
    phantom = required(first.GetParent()) as SwNodeNum;
  return { document, oldRule, newRule, texts, records, first, root, phantom };
}
/** Captures stable identity/topology/registry/counters while excluding intentionally transferred rule membership. @param owners - Fixture. @returns State. */
function stable(owners: ReturnType<typeof fixture>) {
  const registered: SwNodeNum[] = [];
  owners.document.getIDocumentListItems().getNumItems(registered);
  return {
    registered,
    records: owners.texts.map(
      /** Reads actual text ownership. @param text - Owner. @returns Record. */ (text) =>
        text.GetNum(),
    ),
    topology: [owners.root, owners.phantom, ...owners.records].map(
      /** Reads raw state without validating. @param node - Record. @returns State. */ (node) => ({
        parent: node.GetParent(),
        cache: node.GetNumber(false),
        storage: probe(node).mChildren,
        children: [...probe(node).mChildren],
      }),
    ),
  };
}
/** Observes native helper paths and actual assignment boundaries, retaining real delegation. @param record - Transfer record. @param oldRule - Old binding. @param replacement - New binding. @returns Trace. */
function observe(record: SwNodeNum, oldRule: SwNumRule, replacement: SwNumRule): string[] {
  const trace: string[] = [],
    readRule = record.GetNumRule.bind(record),
    readText = record.GetTextNode.bind(record),
    remove = oldRule.RemoveTextNode.bind(oldRule),
    add = replacement.AddTextNode.bind(replacement);
  vi.spyOn(record, "GetNumRule").mockImplementation(
    /** Observes a pure nonvirtual helper lookup. @returns Actual binding. */ () => {
      const rule = readRule();
      trace.push(rule === undefined ? "rule:none" : rule === oldRule ? "rule:old" : "rule:new");
      return rule;
    },
  );
  vi.spyOn(record, "GetTextNode").mockImplementation(
    /** Observes the nullable owner helper. @returns Actual text. */ () => {
      trace.push("text");
      return readText();
    },
  );
  vi.spyOn(oldRule, "RemoveTextNode").mockImplementation(
    /** Observes removal before assignment. @param text - Client. @returns Nothing. */ (text) => {
      expect(readRule()).toBe(oldRule);
      expect(text).toBe(readText());
      trace.push("remove:old");
      remove(text);
    },
  );
  vi.spyOn(replacement, "AddTextNode").mockImplementation(
    /** Observes registration after assignment. @param text - Client. @returns Nothing. */ (
      text,
    ) => {
      expect(readRule()).toBe(replacement);
      expect(text).toBe(readText());
      trace.push(replacement === oldRule ? "add:old" : "add:new");
      add(text);
    },
  );
  return trace;
}
const boundTransfer = [
  "rule:old",
  "text",
  "rule:old",
  "text",
  "remove:old",
  "rule:new",
  "text",
  "rule:new",
  "text",
  "add:new",
];

it("retains the required public rule reference and void transfer contract", /** Checks exact local signature and private storage without native ABI claims. @returns Nothing. */ () => {
  expect(contracts).toEqual([true, true, true, true]);
});

it("removes the old client before rebinding and appends it after new rule guard lookups", /** Exercises actual distinct-rule transfer with stable topology and registry. @returns Nothing. */ () => {
  const owners = fixture(),
    { document, oldRule, newRule, first, texts } = owners;
  try {
    const before = stable(owners),
      trace = observe(first, oldRule, newRule);
    expect(first.ChangeNumRule(newRule)).toBeUndefined();
    expect(trace).toEqual(boundTransfer);
    expect(first.GetNumRule()).toBe(newRule);
    expect(clients(oldRule)).toEqual([texts[1]]);
    expect(clients(newRule)).toEqual([texts[2], texts[3], texts[0]]);
    expect(stable(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("retains same-rule removal and reappend order without duplicate clients", /** Checks native client order rather than assuming transfer preserves ordinal. @returns Nothing. */ () => {
  const owners = fixture(),
    { document, oldRule, newRule, first, texts } = owners;
  try {
    const before = stable(owners),
      trace = observe(first, oldRule, oldRule);
    first.ChangeNumRule(oldRule);
    expect(trace).toEqual(
      boundTransfer.map(
        /** Maps both phases to the same actual rule. @param entry - Event. @returns Event. */
        (entry) => entry.replace(":new", ":old"),
      ),
    );
    expect(first.GetNumRule()).toBe(oldRule);
    expect(clients(oldRule)).toEqual([texts[1], texts[0]]);
    expect(clients(newRule)).toEqual([texts[2], texts[3]]);
    expect(stable(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("short circuits absent old rule then registers the retained detached text after assignment", /** Covers native release guards without fabricating private fields. @returns Nothing. */ () => {
  const owners = fixture(),
    { document, oldRule, newRule, first, texts } = owners;
  try {
    first.RemoveMe(document);
    expect(first.GetNumRule()).toBeUndefined();
    const before = stable(owners),
      trace = observe(first, oldRule, newRule);
    first.ChangeNumRule(newRule);
    expect(trace).toEqual(["rule:none", "rule:new", "text", "rule:new", "text", "add:new"]);
    expect(first.GetNumRule()).toBe(newRule);
    expect(clients(oldRule)).toEqual([texts[1]]);
    expect(clients(newRule)).toEqual([texts[2], texts[3], texts[0]]);
    expect(stable(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("retains bound and unbound no-text root and actual phantom release guard paths", /** Checks pointer reassignment without adding or removing a text client. @returns Nothing. */ () => {
  const owners = fixture(),
    { document, oldRule, newRule, phantom } = owners;
  try {
    for (const record of [new SwNodeNum(undefined), new SwNodeNum(oldRule), phantom]) {
      const bound = record.GetNumRule() !== undefined,
        before = stable(owners),
        oldClients = clients(oldRule),
        newClients = clients(newRule),
        trace = observe(record, oldRule, newRule);
      record.ChangeNumRule(newRule);
      expect(trace).toEqual(
        bound ? ["rule:old", "text", "rule:new", "text"] : ["rule:none", "rule:new", "text"],
      );
      expect(record.GetNumRule()).toBe(newRule);
      expect(clients(oldRule)).toEqual(oldClients);
      expect(clients(newRule)).toEqual(newClients);
      expect(stable(owners)).toEqual(before);
      vi.restoreAllMocks();
    }
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("uses the same explicit client transfer for a bound hidden record without altering shown ownership", /** Preserves hidden-flag-independent ChangeNumRule registration and hidden removal behavior. @returns Nothing. */ () => {
  const owners = fixture(),
    { document, oldRule, newRule, first, texts } = owners,
    hidden = new SwNodeNum(required(texts[0]), true),
    hiddenRoot = new SwNodeNum(oldRule);
  try {
    hiddenRoot.AddChild(hidden, 2, document);
    const before = stable(owners),
      parent = hidden.GetParent(),
      cache = hidden.GetNumber(false),
      trace = observe(hidden, oldRule, newRule);
    hidden.ChangeNumRule(newRule);
    expect(trace).toEqual(boundTransfer);
    expect(hidden.GetNumRule()).toBe(newRule);
    expect(hidden.GetParent()).toBe(parent);
    expect(hidden.GetNumber(false)).toBe(cache);
    expect(clients(oldRule)).toEqual([texts[1]]);
    expect(clients(newRule)).toEqual([texts[2], texts[3], texts[0]]);
    expect(required(texts[0]).GetNum()).toBe(first);
    expect(first.GetNumRule()).toBe(oldRule);
    expect(stable(owners)).toEqual(before);
    vi.restoreAllMocks();
    hidden.RemoveMe(document);
    expect(hidden.GetNumRule()).toBeUndefined();
    expect(clients(newRule)).toEqual([texts[2], texts[3], texts[0]]);
    expect(stable(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    hidden.RemoveMe(document);
    document.Dispose();
  }
});
