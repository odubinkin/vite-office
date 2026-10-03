/** @fileoverview Verifies text-owned numbering notification predicates and the existing document teardown boundary using owned fixtures only. */
import { expect, it, vi } from "vitest";
import { createWriterDocument, SwDoc } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "../SwNumberTree/SwNodeNum";
import type { SwNumberTreeNode } from "../SwNumberTree/SwNumberTree";
import type { SwTextNode } from "./ndtxt";

/** Checks exact native public signatures and private state boundaries. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contract: [
  Same<Parameters<SwTextNode["IsNotifiable"]>, []>,
  Same<ReturnType<SwTextNode["IsNotifiable"]>, boolean>,
  Same<Parameters<SwTextNode["IsNotificationEnabled"]>, []>,
  Same<ReturnType<SwTextNode["IsNotificationEnabled"]>, boolean>,
  Same<Parameters<SwDoc["IsInDtor"]>, []>,
  Same<ReturnType<SwDoc["IsInDtor"]>, boolean>,
  Same<Extract<keyof SwTextNode, "m_bNotifiable" | "SetNotifiable">, never>,
  Same<Extract<keyof SwDoc, "mbDtor" | "SetInDtor">, never>,
] = [true, true, true, true, true, true, true, true];

/** Retains protected traversal access solely for diagnostics. */
interface TreeDiagnostic {
  readonly mpLastValid: SwNumberTreeNode | undefined;
  /** Reads the actual inherited policy. @param document - Operation context. @returns Whether notifiable. */
  IsNotifiable(document: SwDoc): boolean;
}
/** Observes the native private temporary flag without a production setter. */
interface TextDiagnostic {
  m_bNotifiable: boolean;
}
/** Requires actual fixture ownership. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing notification-policy owner");
  return value;
}
/** Reads protected state without production access changes. @param node - Owner. @returns Diagnostic view. */
function tree(node: SwNumberTreeNode): TreeDiagnostic {
  return node as unknown as TreeDiagnostic;
}
/** Reads private flag state solely in tests. @param node - Owner. @returns Flag view. */
function flag(node: SwTextNode): TextDiagnostic {
  return node as unknown as TextDiagnostic;
}
/** Creates three actual list members whose counters remain unvalidated. @param level - First item level. @returns Owned document graph. */
function fixture(level = 0) {
  const document = createWriterDocument();
  document.SetInReading(true);
  const texts = [
    required(document.paragraphs[0]),
    document.nodes.MakeTextNode(),
    document.nodes.MakeTextNode(),
  ];
  for (let index = 0; index < texts.length; index++)
    applyWriterParagraphList(required(texts[index]), {
      kind: "numbered",
      level: index === 0 ? level : 0,
      styleId: "NotificationPolicy",
      listId: "notification-policy",
    });
  const records = texts.map(
    /** Retains canonical numbering ownership. @param node - Text owner. @returns Record. */
    (node) => required(node.GetNum()),
  );
  let root: SwNumberTreeNode = required(records[0]);
  while (root.GetParent() !== undefined) root = required(root.GetParent());
  return {
    document,
    texts,
    records,
    root: root as SwNodeNum,
    rule: required(document.FindNumRulePtr("NotificationPolicy")),
    list: required(document.GetDocumentListsManager().GetListByName("notification-policy")),
  };
}
/** Reads raw counters without prefix validation. @param records - Actual records. @returns Counters. */
function counters(records: SwNodeNum[]): number[] {
  return records.map(
    /** Reads one stored counter. @param record - Owner. @returns Counter. */
    (record) => record.GetNumber(false),
  );
}

it("owns zero-argument text policies and destruction query with native private defaults", /** Checks contracts and newly constructed versus cloned temporary state. @returns Nothing. */ () => {
  expect(contract).toEqual(Array(8).fill(true));
  const document = createWriterDocument();
  const target = createWriterDocument();
  const text = required(document.paragraphs[0]);
  try {
    expect(document.IsInDtor()).toBe(false);
    expect(flag(text).m_bNotifiable).toBe(true);
    expect([text.IsNotifiable(), text.IsNotificationEnabled()]).toEqual([true, true]);
    expect("SetNotifiable" in text).toBe(false);
    expect("SetInDtor" in document).toBe(false);
    flag(text).m_bNotifiable = false;
    const copy = text.CloneTo(target.nodes);
    expect(flag(copy).m_bNotifiable).toBe(true);
    expect([text.IsNotifiable(), copy.IsNotifiable()]).toEqual([false, true]);
  } finally {
    document.Dispose();
    target.Dispose();
  }
});

it("checks reading before destruction for text and caller-context root policy", /** Checks all native predicates and short-circuit call order at the bounded browser disposal boundary. @returns Nothing. */ () => {
  for (const [reading, destroying, enabled, expected] of [
    [false, false, true, ["reading", "dtor"]],
    [true, false, false, ["reading"]],
    [false, true, false, ["reading", "dtor"]],
    [true, true, false, ["reading"]],
  ] as const) {
    const document = createWriterDocument();
    const text = required(document.paragraphs[0]);
    const root = new SwNodeNum(undefined);
    if (destroying) document.Dispose();
    document.SetInReading(reading);
    const calls: string[] = [];
    vi.spyOn(document, "IsInReading").mockImplementation(
      /** Observes the owned reading query. @returns Actual profile flag. */ () => {
        calls.push("reading");
        return reading;
      },
    );
    vi.spyOn(document, "IsInDtor").mockImplementation(
      /** Observes the owned destruction query. @returns Actual profile flag. */ () => {
        calls.push("dtor");
        return destroying;
      },
    );
    try {
      expect(text.IsNotificationEnabled()).toBe(enabled);
      expect(calls).toEqual(expected);
      calls.length = 0;
      expect(text.IsNotifiable()).toBe(enabled);
      expect(calls).toEqual(expected);
      calls.length = 0;
      expect(root.IsNotificationEnabled(document)).toBe(enabled);
      expect(calls).toEqual(expected);
      calls.length = 0;
      expect(tree(root).IsNotifiable(document)).toBe(enabled);
      expect(calls).toEqual(expected);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("delegates the two real-record predicates independently to the text owner", /** Checks owner dispatch instead of collapsing notifiable into enabled or reading the foreign document. @returns Nothing. */ () => {
  const { document, texts, records, root } = fixture();
  const text = required(texts[0]),
    record = required(records[0]);
  const operation = new SwDoc(false);
  operation.SetInReading(true);
  document.SetInReading(false);
  const notifiable = vi.fn(
    /** Supplies a temporarily blocked owner policy. @returns Disabled. */ () => false,
  );
  const enabled = vi.fn(
    /** Supplies an independently enabled owner policy. @returns Enabled. */ () => true,
  );
  Object.defineProperties(text, {
    IsNotifiable: { configurable: true, value: notifiable },
    IsNotificationEnabled: { configurable: true, value: enabled },
  });
  const operationReading = vi.spyOn(operation, "IsInReading");
  try {
    expect(tree(record).IsNotifiable(operation)).toBe(false);
    expect(notifiable).toHaveBeenCalledExactlyOnceWith();
    expect(enabled).not.toHaveBeenCalled();
    expect(record.IsNotificationEnabled(operation)).toBe(true);
    expect(enabled).toHaveBeenCalledExactlyOnceWith();
    expect(operationReading).not.toHaveBeenCalled();
    expect(root.IsNotificationEnabled(operation)).toBe(false);
    expect(operationReading).toHaveBeenCalledExactlyOnceWith();
    expect(counters(records)).toEqual([0, 0, 0]);
    expect(tree(root).mpLastValid).toBeUndefined();
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
    operation.Dispose();
  }
});

it("keeps the private temporary blocker independent of global notification enablement", /** Checks the short circuit before querying enabled policy without adding a public flag setter. @returns Nothing. */ () => {
  const { document, texts, records } = fixture();
  const text = required(texts[0]),
    record = required(records[0]);
  document.SetInReading(false);
  const enabled = vi.spyOn(text, "IsNotificationEnabled");
  try {
    flag(text).m_bNotifiable = false;
    expect(text.IsNotifiable()).toBe(false);
    expect(tree(record).IsNotifiable(document)).toBe(false);
    expect(enabled).not.toHaveBeenCalled();
    expect(record.IsNotificationEnabled(document)).toBe(true);
    expect(enabled).toHaveBeenCalledExactlyOnceWith();
    flag(text).m_bNotifiable = true;
    expect(tree(record).IsNotifiable(document)).toBe(true);
    expect(enabled).toHaveBeenCalledTimes(2);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("skips a blocked owned paragraph notification while preserving validated prefix and topology", /** Checks actual tree traversal and independent numeric validation with a private diagnostic blocker. @returns Nothing. */ () => {
  const { document, texts, records, root, rule } = fixture();
  const middle = required(texts[1]);
  document.SetInReading(false);
  const notifications: number[] = [];
  for (const [index, text] of texts.entries()) {
    const original = text.NumRuleChgd.bind(text);
    vi.spyOn(text, "NumRuleChgd").mockImplementation(
      /** Retains the actual owner callback while observing its order. @returns Nothing. */ () => {
        notifications.push(index);
        original();
      },
    );
  }
  try {
    flag(middle).m_bNotifiable = false;
    root.NotifyInvalidChildren(document);
    expect(notifications).toEqual([0, 2]);
    expect(counters(records)).toEqual([1, 2, 3]);
    expect(tree(root).mpLastValid).toBe(records[2]);
    expect(
      records.map(
        /** Reads canonical membership. @param record - Owner. @returns Parent. */ (record) =>
          record.GetParent(),
      ),
    ).toEqual([root, root, root]);
    expect(rule.GetTextNodeListSize()).toBe(3);
    flag(middle).m_bNotifiable = true;
    notifications.length = 0;
    required(records[0]).InvalidateAndNotifyTree(document);
    expect(notifications).toEqual([0, 1, 2]);
    expect(counters(records)).toEqual([1, 2, 3]);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("suppresses numbering callbacks and counter validation during actual document disposal", /** Checks the pre-existing teardown behavior rather than only calling the new query. @returns Nothing. */ () => {
  const { document, texts, records, root, rule, list } = fixture();
  document.SetInReading(false);
  const notifications = texts.map(
    /** Observes actual text callbacks. @param text - Owner. @returns Spy. */ (text) =>
      vi.spyOn(text, "NumRuleChgd"),
  );
  const revision = document.GetDocumentStateManager().GetModelRevision();
  try {
    expect([root.GetPred(), root.GetPred(true)]).toEqual([undefined, undefined]);
    root.InvalidateAndNotifyTree(document);
    expect(counters(records)).toEqual([0, 0, 0]);
    for (const notification of notifications) expect(notification).not.toHaveBeenCalled();
    document.Dispose();
    for (const notification of notifications) expect(notification).not.toHaveBeenCalled();
    expect(counters(records)).toEqual([0, 0, 0]);
    expect(tree(root).mpLastValid).toBeUndefined();
    expect(root.GetChildCount()).toBe(0);
    expect(list.HasNodes()).toBe(false);
    expect(rule.GetTextNodeListSize()).toBe(0);
    for (const record of records) {
      expect(record.GetParent()).toBeUndefined();
      expect(record.GetNumRule()).toBeUndefined();
    }
    expect(document.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("sets destruction before list removal and retains existing undo and state disposal order", /** Checks actual teardown entries while owned policy remains queryable. @returns Nothing. */ () => {
  const { document, texts, root } = fixture();
  document.SetInReading(false);
  const calls: Array<[string, boolean]> = [];
  for (const [index, text] of texts.entries()) {
    const original = text.RemoveFromList.bind(text);
    vi.spyOn(text, "RemoveFromList").mockImplementation(
      /** Observes the teardown boundary before actual detachment. @returns Nothing. */ () => {
        calls.push([`text${index}`, document.IsInDtor()]);
        expect([
          text.IsNotifiable(),
          text.IsNotificationEnabled(),
          root.IsNotificationEnabled(document),
        ]).toEqual([false, false, false]);
        original();
      },
    );
  }
  for (const [name, owner] of [
    ["undo", document.GetUndoManager()],
    ["state", document.GetDocumentStateManager()],
  ] as const) {
    const original = owner.Dispose.bind(owner);
    vi.spyOn(owner, "Dispose").mockImplementation(
      /** Observes existing manager ordering without replacing teardown. @returns Nothing. */ () => {
        calls.push([name, document.IsInDtor()]);
        original();
      },
    );
  }
  try {
    document.Dispose();
    expect(calls).toEqual([
      ["text0", true],
      ["text1", true],
      ["text2", true],
      ["undo", true],
      ["state", true],
    ]);
    expect(document.IsInDtor()).toBe(true);
    expect(document.IsInReading()).toBe(false);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("uses destruction context for roots and phantoms while real records retain their live owner", /** Checks contextual no-text ancestors without changing raw prefix caches. @returns Nothing. */ () => {
  const { document, texts, records, root } = fixture(2);
  const operation = new SwDoc(false);
  operation.Dispose();
  document.SetInReading(false);
  const record = required(records[0]),
    phantom = required(record.GetParent()) as SwNodeNum;
  try {
    expect([record.IsPhantom(), phantom.IsPhantom(), root.IsPhantom()]).toEqual([
      false,
      true,
      false,
    ]);
    expect(record.IsNotificationEnabled(operation)).toBe(true);
    expect(tree(record).IsNotifiable(operation)).toBe(true);
    expect([
      root.IsNotificationEnabled(operation),
      phantom.IsNotificationEnabled(operation),
    ]).toEqual([false, false]);
    expect([tree(root).IsNotifiable(operation), tree(phantom).IsNotifiable(operation)]).toEqual([
      false,
      false,
    ]);
    expect(required(texts[0]).IsNotifiable()).toBe(true);
    expect(counters(records)).toEqual([0, 0, 0]);
    expect(tree(root).mpLastValid).toBeUndefined();
  } finally {
    document.Dispose();
  }
});
