/** @fileoverview Verifies native numbering constructor modes and shown/hidden registration without upstream access. */
import { expect, it, vi } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import type { SwNumRule } from "../doc/number";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";

/** Describes the two native constructor families. */
interface NativeConstruction {
  /** Creates a text record. @param text - Nullable text pointer. @param hidden - Required redline mode. @returns Record. */
  new (text: SwTextNode | undefined, hidden: boolean): SwNodeNum;
  /** Creates a root or factory record. @param rule - Nullable rule pointer. @returns Record. */
  new (rule: SwNumRule | undefined): SwNodeNum;
}
const construction: NativeConstruction = SwNodeNum;
const privateContract: [
  "m_isHiddenRedlines" extends keyof SwNodeNum ? false : true,
  "SetHiddenRedlines" extends keyof SwNodeNum ? false : true,
  "SetNumRule" extends keyof SwNodeNum ? false : true,
] = [true, true, true];

/** Rejects removed bridges solely during typechecking. @param text - Owner. @param rule - Rule. @returns Nothing. */
function rejectedConstructors(text: SwTextNode, rule: SwNumRule): void {
  // @ts-expect-error Native text construction requires the redline flag.
  new SwNodeNum(text);
  // @ts-expect-error A rule cannot replace the required text mode flag.
  new SwNodeNum(text, rule);
  // @ts-expect-error Root construction takes only the nullable rule pointer.
  new SwNodeNum(rule, false);
  // @ts-expect-error The root pointer remains required even when absent.
  new SwNodeNum();
}
/** Requires an actual fixture owner. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing construction fixture owner");
  return value;
}
/** Reads the private flag only for test diagnostics. @param record - Actual record. @returns Stored mode. */
function hiddenFlag(record: SwNodeNum): boolean {
  return (record as unknown as { m_isHiddenRedlines: boolean }).m_isHiddenRedlines;
}
/** Calls the native protected factory only in tests. @param record - Actual owner. @returns New no-text record. */
function create(record: SwNodeNum): SwNodeNum {
  return (
    record as unknown as {
      /** Creates the source-owned record. @returns Record. */ Create(): SwNodeNum;
    }
  ).Create();
}
/** Observes protected lifecycle without constructing a fake owner. @param record - Actual record. @returns Lifecycle diagnostics. */
function lifecycle(record: SwNodeNum) {
  return record as unknown as {
    /** Binds and registers. @returns Nothing. */ PreAdd(): void;
    /** Releases registration. @returns Nothing. */ PostRemove(): void;
  };
}
/** Builds an actual shown text record and bound rule. @returns Owners. */
function fixture() {
  const document = createWriterDocument();
  document.SetInReading(true);
  const text = required(document.paragraphs[0]);
  applyWriterParagraphList(text, {
    kind: "numbered",
    styleId: "Construction",
    listId: "construction",
    level: 0,
  });
  return {
    document,
    text,
    rule: required(text.GetNumRule()),
    shown: required(text.GetNum()),
    registry: document.getIDocumentListItems(),
  };
}

it("keeps distinct required native constructors and private mode defaults", /** Checks initial pointers, root defaults and rejected old signatures. @returns Nothing. */ () => {
  const { document, text, rule } = fixture();
  try {
    expect(privateContract).toEqual([true, true, true]);
    expect(typeof rejectedConstructors).toBe("function");
    for (const mode of [false, true]) {
      const record = new construction(text, mode);
      expect(record.GetTextNode()).toBe(text);
      expect(record.GetNumRule() === undefined).toBe(true);
      expect(hiddenFlag(record)).toBe(mode);
      expect(record.GetParent()).toBeUndefined();
      expect(record.GetStartValue()).toBe(1);
      expect(record.GetNumber(false)).toBe(0);
    }
    for (const owner of [undefined, rule]) {
      const root = new construction(owner);
      expect(root.GetTextNode() === undefined).toBe(true);
      expect(root.GetNumRule()).toBe(owner);
      expect(hiddenFlag(root)).toBe(false);
      expect(root.IsPhantom()).toBe(false);
    }
  } finally {
    document.Dispose();
  }
});

it("binds hidden records while preserving the actual shown client and numbered registry", /** Inserts/removes an actual hidden record through a phantom chain. @returns Nothing. */ () => {
  const { document, text, rule, shown, registry } = fixture();
  const hidden = new construction(text, true);
  const root = new construction(rule);
  try {
    const clients: SwTextNode[] = [];
    rule.GetTextNodeList(clients);
    const entries: SwNodeNum[] = [];
    registry.getNumItems(entries);
    const addClient = vi.spyOn(rule, "AddTextNode");
    const removeClient = vi.spyOn(rule, "RemoveTextNode");
    const addItem = vi.spyOn(registry, "addListItem");
    const removeItem = vi.spyOn(registry, "removeListItem");
    root.AddChild(hidden, 2, document);
    expect(hidden.GetNumRule()).toBe(rule);
    expect(hidden.GetLevelInListTree()).toBe(2);
    expect(required(hidden.GetParent()).IsPhantom()).toBe(true);
    expect(hidden.GetNumber(false)).toBe(0);
    expect(shown.GetNumber(false)).toBe(0);
    expect(text.GetNum()).toBe(shown);
    expect(addClient).not.toHaveBeenCalled();
    expect(addItem).not.toHaveBeenCalled();
    hidden.RemoveMe(document);
    expect(hidden.GetParent()).toBeUndefined();
    expect(hidden.GetNumRule()).toBeUndefined();
    expect(hiddenFlag(hidden)).toBe(true);
    expect(root.GetChildCount()).toBe(0);
    expect(removeClient).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
    const afterClients: SwTextNode[] = [];
    const afterEntries: SwNodeNum[] = [];
    rule.GetTextNodeList(afterClients);
    registry.getNumItems(afterEntries);
    expect(afterClients).toEqual(clients);
    expect(afterEntries).toEqual(entries);
  } finally {
    hidden.RemoveMe(document);
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("creates shown production records and registers rule before registry, removing in reverse order", /** Traces actual AddToList and RemoveFromList owner operations. @returns Nothing. */ () => {
  const { document, text, rule, registry } = fixture();
  try {
    text.RemoveFromList();
    const trace: string[] = [];
    const addRule = rule.AddTextNode.bind(rule),
      removeRule = rule.RemoveTextNode.bind(rule);
    const addRegistry = registry.addListItem.bind(registry),
      removeRegistry = registry.removeListItem.bind(registry);
    vi.spyOn(rule, "AddTextNode").mockImplementation(
      /** Observes client registration. @param node - Actual owner. @returns Nothing. */ (node) => {
        trace.push("rule-add");
        addRule(node);
      },
    );
    vi.spyOn(registry, "addListItem").mockImplementation(
      /** Observes item registration. @param record - Actual record. @returns Nothing. */ (
        record,
      ) => {
        trace.push("registry-add");
        addRegistry(record);
      },
    );
    vi.spyOn(rule, "RemoveTextNode").mockImplementation(
      /** Observes client removal. @param node - Actual owner. @returns Nothing. */ (node) => {
        trace.push("rule-remove");
        removeRule(node);
      },
    );
    vi.spyOn(registry, "removeListItem").mockImplementation(
      /** Observes item removal. @param record - Actual record. @returns Nothing. */ (record) => {
        trace.push("registry-remove");
        removeRegistry(record);
      },
    );
    text.AddToList();
    const record = required(text.GetNum());
    expect(hiddenFlag(record)).toBe(false);
    expect(record.GetNumRule()).toBe(rule);
    expect(trace).toEqual(["rule-add", "registry-add"]);
    text.RemoveFromList();
    expect(trace).toEqual(["rule-add", "registry-add", "registry-remove", "rule-remove"]);
    expect(record.GetNumRule()).toBeUndefined();
    expect(text.GetNum()).toBeUndefined();
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("uses the rule-only factory with false mode for roots and records of either text mode", /** Checks native factory defaults independently of hidden owner mode. @returns Nothing. */ () => {
  const { document, text, rule } = fixture();
  try {
    for (const hidden of [false, true]) {
      const record = new construction(text, hidden);
      const unbound = create(record);
      expect(unbound.GetTextNode() === undefined).toBe(true);
      expect(unbound.GetNumRule()).toBeUndefined();
      expect(hiddenFlag(unbound)).toBe(false);
      lifecycle(record).PreAdd();
      const bound = create(record);
      expect(bound.GetTextNode() === undefined).toBe(true);
      expect(bound.GetNumRule()).toBe(rule);
      expect(hiddenFlag(bound)).toBe(false);
      expect(bound.GetParent()).toBeUndefined();
      lifecycle(record).PostRemove();
    }
    const root = new construction(rule);
    expect(create(root).GetNumRule()).toBe(rule);
    expect(hiddenFlag(create(root))).toBe(false);
  } finally {
    document.Dispose();
  }
});

it("retains native no-rule, no-text and non-document registration branches", /** Exercises release policy boundaries without claiming native debug or undo-array lifetime. @returns Nothing. */ () => {
  const document = createWriterDocument();
  document.SetInReading(true);
  const text = required(document.paragraphs[0]),
    registry = document.getIDocumentListItems();
  try {
    const add = vi.spyOn(registry, "addListItem"),
      remove = vi.spyOn(registry, "removeListItem");
    const shown = new construction(text, false);
    lifecycle(shown).PreAdd();
    expect(shown.GetNumRule()).toBeUndefined();
    expect(add).toHaveBeenCalledTimes(1);
    lifecycle(shown).PostRemove();
    expect(remove).toHaveBeenCalledTimes(1);
    add.mockClear();
    remove.mockClear();
    const hidden = new construction(text, true);
    lifecycle(hidden).PreAdd();
    lifecycle(hidden).PostRemove();
    expect(add).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    const rule = document.EnsureNumRule("NoText", "numbered", 0);
    const root = new construction(rule);
    lifecycle(root).PreAdd();
    lifecycle(root).PostRemove();
    expect(root.GetNumRule()).toBeUndefined();
    expect(add).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    applyWriterParagraphList(text, { kind: "numbered", styleId: "NoText", level: 0 });
    add.mockClear();
    remove.mockClear();
    vi.spyOn(text.GetNodes(), "IsDocNodes").mockReturnValue(false);
    const nonDocument = new construction(text, false);
    const addClient = vi.spyOn(rule, "AddTextNode");
    lifecycle(nonDocument).PreAdd();
    expect(addClient).toHaveBeenCalledWith(text);
    expect(add).not.toHaveBeenCalled();
    lifecycle(nonDocument).PostRemove();
    expect(remove).toHaveBeenCalledWith(nonDocument);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("leaves existing ChangeNumRule policy independent of the hidden constructor flag", /** Preserves native explicit rule-client transfer behavior and normal notification policy. @returns Nothing. */ () => {
  const { document, text, rule } = fixture();
  try {
    const hidden = new construction(text, true);
    const replacement = document.EnsureNumRule("Replacement", "numbered", 0);
    lifecycle(hidden).PreAdd();
    const remove = vi.spyOn(rule, "RemoveTextNode"),
      add = vi.spyOn(replacement, "AddTextNode");
    hidden.ChangeNumRule(replacement);
    expect(remove).toHaveBeenCalledWith(text);
    expect(add).toHaveBeenCalledWith(text);
    expect(hidden.GetNumRule()).toBe(replacement);
    document.SetInReading(false);
    expect(hidden.IsNotificationEnabled(document)).toBe(true);
    document.SetInReading(true);
    lifecycle(hidden).PostRemove();
    expect(replacement.GetTextNodeListSize()).toBe(1);
    expect(hidden.GetNumRule()).toBeUndefined();
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});
