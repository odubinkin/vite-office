/** @fileoverview Verifies required operation document forwarding through owned numbering rules, lists and protected traversal without upstream access. */
import { expect, it, vi } from "vitest";
import { createWriterDocument, SwDoc } from "../doc/doc";
import { applyWriterParagraphList, SwList } from "../doc/list";
import type { SwNumRule } from "../doc/number";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Exposes protected traversal and policy only through a test subclass. */
class ContextRoot extends SwNodeNum {
  /** Retains the required traversal document. */
  public readonly notify = this.Notify.bind(this);
  /** Retains the required notification-policy document. */
  public readonly notifiable = this.IsNotifiable.bind(this);
}
/** Checks exact parameter and visibility types. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contract: {
  add: Same<Parameters<SwNumberTreeNode["AddChild"]>, [SwNumberTreeNode, number, SwDoc]>;
  remove: Same<Parameters<SwNumberTreeNode["RemoveChild"]>, [SwNumberTreeNode, SwDoc]>;
  detach: Same<Parameters<SwNumberTreeNode["RemoveMe"]>, [SwDoc]>;
  level: Same<Parameters<SwNumberTreeNode["SetLevelInListTree"]>, [number, SwDoc]>;
  children: Same<Parameters<SwNumberTreeNode["NotifyInvalidChildren"]>, [SwDoc]>;
  siblings: Same<Parameters<SwNumberTreeNode["NotifyInvalidSiblings"]>, [SwDoc]>;
  tree: Same<Parameters<SwNumberTreeNode["InvalidateAndNotifyTree"]>, [SwDoc]>;
  notify: Same<Parameters<ContextRoot["notify"]>, [SwDoc]>;
  notifiable: Same<Parameters<ContextRoot["notifiable"]>, [SwDoc]>;
  enabled: Same<Parameters<SwNodeNum["IsNotificationEnabled"]>, [SwDoc]>;
  listInsert: Same<Parameters<SwList["InsertListItem"]>, [SwNodeNum, number, SwDoc]>;
  listRemove: Same<Parameters<typeof SwList.RemoveListItem>, [SwNodeNum, SwDoc]>;
  listValidate: Same<Parameters<SwList["ValidateListTree"]>, [SwDoc]>;
  ruleValidate: Same<Parameters<SwNumRule["Validate"]>, [SwDoc]>;
  baseVisibility: Same<Extract<keyof SwNumberTreeNode, "Notify">, never>;
  writerVisibility: Same<Extract<keyof SwNodeNum, "Notify">, never>;
} = {
  add: true,
  remove: true,
  detach: true,
  level: true,
  children: true,
  siblings: true,
  tree: true,
  notify: true,
  notifiable: true,
  enabled: true,
  listInsert: true,
  listRemove: true,
  listValidate: true,
  ruleValidate: true,
  baseVisibility: true,
  writerVisibility: true,
};
/** Observes retained roots and raw prefix state solely in tests. */
interface Diagnostic {
  readonly mpLastValid: SwNumberTreeNode | undefined;
  readonly mChildren: Iterable<SwNumberTreeNode>;
  /** Reads inherited contextual policy. @param document - Operation context. @returns Whether enabled. */
  IsNotifiable(document: SwDoc): boolean;
  /** Notifies a concrete record. @returns Nothing. */
  NotifyNode(): void;
}
/** Requires an actual fixture owner. @param value - Candidate. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing document context fixture owner");
  return value;
}
/** Reads protected diagnostics. @param node - Actual owner. @returns Test view. */
function probe(node: SwNumberTreeNode): Diagnostic {
  return node as unknown as Diagnostic;
}
/** Reads the private retained root without adding production access. @param list - Actual list. @returns Root. */
function rootOf(list: SwList): SwNodeNum {
  return (list as unknown as { readonly root: SwNodeNum }).root;
}
/** Creates three owned records with untouched counters under reading suppression. @returns Owners and foreign operation context. */
function fixture() {
  const document = createWriterDocument();
  const operation = new SwDoc(false);
  document.SetInReading(true);
  operation.SetInReading(true);
  const texts = [required(document.paragraphs[0])];
  for (let index = 1; index < 3; index++) texts.push(document.nodes.MakeTextNode());
  for (const text of texts)
    applyWriterParagraphList(text, {
      kind: "numbered",
      level: 0,
      styleId: "OperationContext",
      listId: "operation-context",
    });
  const records = texts.map(
    /** Retains the canonical number record. @param text - Paragraph. @returns Record. */
    (text) => required(text.GetNum()),
  );
  const rule = required(document.FindNumRulePtr("OperationContext"));
  const list = required(document.GetDocumentListsManager().GetListByName("operation-context"));
  return { document, operation, texts, records, rule, list, root: rootOf(list) };
}
/** Reads stored values without validation. @param records - Actual records. @returns Counters. */
function counters(records: SwNodeNum[]): number[] {
  return records.map(
    /** Reads one cache. @param record - Owner. @returns Counter. */ (record) =>
      record.GetNumber(false),
  );
}

it("requires explicit document arguments across rule list and tree APIs and hides traversal", /** Checks exact inherited arity and empty clientless context behavior. @returns Nothing. */ () => {
  expect(Object.values(contract)).toEqual(Array(16).fill(true));
  const document = new SwDoc(false);
  const rule = document.EnsureNumRule("Empty", "numbered");
  const list = document.GetDocumentListsManager().CreateList(rule.GetName(), "empty");
  const root = new ContextRoot(rule);
  try {
    document.SetInReading(true);
    expect(root.notifiable(document)).toBe(false);
    root.notify(document);
    list.ValidateListTree(document);
    rule.Validate(document);
    expect([root.GetNumber(false), root.GetChildCount(), rule.GetTextNodeListSize()]).toEqual([
      0, 0, 0,
    ]);
    expect(rule.IsInvalidRule()).toBe(false);
    expect(list.HasNodes()).toBe(false);
    document.SetInReading(false);
    expect(root.notifiable(document)).toBe(true);
    root.notify(document);
  } finally {
    document.Dispose();
  }
});

it("forwards the rule caller document through invalidation and list validation instead of its first client", /** Checks actual foreign reading suppression and later ordinary validation. @returns Nothing. */ () => {
  const { document, operation, records, rule, list, root } = fixture();
  try {
    document.SetInReading(false);
    const invalidation = vi.spyOn(list, "InvalidateListTree");
    const validation = vi.spyOn(list, "ValidateListTree");
    rule.Validate(operation);
    expect(invalidation).toHaveBeenCalledExactlyOnceWith();
    expect(validation).toHaveBeenCalledExactlyOnceWith(operation);
    expect(invalidation.mock.invocationCallOrder[0]).toBeLessThan(
      required(validation.mock.invocationCallOrder[0]),
    );
    expect(counters(records)).toEqual([0, 0, 0]);
    expect(probe(root).mpLastValid).toBeUndefined();
    expect(rule.IsInvalidRule()).toBe(false);
    operation.SetInReading(false);
    rule.Validate(operation);
    expect(counters(records)).toEqual([1, 2, 3]);
    expect(probe(root).mpLastValid).toBe(records[2]);
    document.SetInReading(true);
    rule.Validate(operation);
    expect(counters(records)).toEqual([1, 2, 3]);
    expect(probe(root).mpLastValid).toBeUndefined();
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
    operation.Dispose();
  }
});

it("forwards an explicit insertion context while preserving text-owner policy and retained list topology", /** Checks foreign root suppression after detached owned record insertion. @returns Nothing. */ () => {
  const { document, operation, records, list, root } = fixture();
  const first = required(records[0]);
  try {
    SwList.RemoveListItem(first, document);
    expect(first.GetParent()).toBeUndefined();
    document.SetInReading(false);
    const insertion = vi.spyOn(root, "AddChild");
    list.InsertListItem(first, 0, operation);
    expect(insertion).toHaveBeenCalledExactlyOnceWith(first, 0, operation);
    expect(first.GetParent()).toBe(root);
    expect([...probe(root).mChildren]).toEqual(records);
    expect(counters(records)).toEqual([0, 0, 0]);
    expect(probe(root).mpLastValid).toBeUndefined();
    expect(first.IsNotificationEnabled(operation)).toBe(true);
    expect(root.IsNotificationEnabled(operation)).toBe(false);
    operation.SetInReading(false);
    list.ValidateListTree(operation);
    expect(counters(records)).toEqual([1, 2, 3]);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
    operation.Dispose();
  }
});

it("forwards removal context without borrowing the text document and retains remaining raw counters", /** Checks static bridge, actual detachment and suppressed remaining prefix. @returns Nothing. */ () => {
  const { document, operation, records, texts, list, root } = fixture();
  const first = required(records[0]);
  try {
    document.SetInReading(false);
    const removal = vi.spyOn(first, "RemoveMe");
    SwList.RemoveListItem(first, operation);
    expect(removal).toHaveBeenCalledExactlyOnceWith(operation);
    expect(first.GetParent()).toBeUndefined();
    expect(first.GetNumRule()).toBeUndefined();
    expect(list.GetListItem(required(texts[0]))).toBeUndefined();
    expect([...probe(root).mChildren]).toEqual(records.slice(1));
    expect(counters(records)).toEqual([0, 0, 0]);
    expect(probe(root).mpLastValid).toBeUndefined();
    operation.SetInReading(false);
    list.ValidateListTree(operation);
    expect(counters(records)).toEqual([0, 1, 2]);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
    operation.Dispose();
  }
});

it("passes the operation context through protected root and phantom traversal before text-owner notification", /** Checks real owned descendants, phantom self exclusion and owner-context precedence. @returns Nothing. */ () => {
  const { document, operation, records, rule } = fixture();
  const root = new ContextRoot(rule);
  try {
    for (const record of records) {
      record.RemoveMe(document);
      root.AddChild(record, 2, document);
    }
    const phantom = required(required(records[0]).GetParent());
    const ancestor = required(phantom.GetParent());
    const rootPolicy = vi.spyOn(probe(root), "IsNotifiable");
    const ancestorPolicy = vi.spyOn(probe(ancestor), "IsNotifiable");
    const phantomPolicy = vi.spyOn(probe(phantom), "IsNotifiable");
    const notification = vi.spyOn(probe(required(records[0])), "NotifyNode");
    operation.SetInReading(false);
    root.notify(operation);
    expect(rootPolicy).toHaveBeenCalledExactlyOnceWith(operation);
    expect(ancestorPolicy).toHaveBeenCalledExactlyOnceWith(operation);
    expect(phantomPolicy).toHaveBeenCalledExactlyOnceWith(operation);
    expect(notification).not.toHaveBeenCalled();
    expect(counters(records)).toEqual([0, 0, 0]);
    document.SetInReading(false);
    operation.SetInReading(true);
    root.notify(operation);
    expect(notification).not.toHaveBeenCalled();
    expect(counters(records)).toEqual([0, 0, 0]);
    operation.SetInReading(false);
    root.notify(operation);
    expect(notification).toHaveBeenCalledExactlyOnceWith();
    expect(counters(records)).toEqual([1, 2, 3]);
    expect(
      records.map(
        /** Reads actual levels. @param record - Owner. @returns Level. */ (record) =>
          record.GetLevelInListTree(),
      ),
    ).toEqual([2, 2, 2]);
    expect(ancestor.IsPhantom()).toBe(true);
    expect(phantom.IsPhantom()).toBe(true);
    expect(root.IsPhantom()).toBe(false);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
    operation.Dispose();
  }
});
