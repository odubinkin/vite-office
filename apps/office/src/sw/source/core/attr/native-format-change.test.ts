/** @fileoverview Verifies native SwFormatChangeHint borrowed identities, original registration and locked inheritance propagation. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwClient } from "../../../inc/calbck";
import { SwFormatChangeHint, type SwModelHint } from "../../../inc/hints";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwCellFrame } from "../layout/tabfrm";
import { SvtListener } from "../../../../svl/source/notify/listener";

/** Records exact original notifier hints without adding a Writer client. */
class Observer extends SvtListener<SwModelHint> {
  public readonly hints: SwModelHint[] = [];
  /** Captures an actual native hint. @param hint - Original notification. @returns Nothing. */
  public override Notify(hint: SwModelHint | { kind: "dying" }): void {
    if (hint.kind !== "dying") this.hints.push(hint);
  }
}

it("accepted parent changes propagate one original hint through locked Writer clients and native observers without document signals", /** Checks native old/new owners, inherited values, recursion suppression and client-before-observer ordering. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = doc.GetDfltFrameFormat(),
    alternate = new SwFrameFormat(doc.GetAttrPool(), "Alternate", undefined, root),
    child = new SwFrameFormat(doc.GetAttrPool(), "Child", undefined, root),
    leaf = new SwFrameFormat(doc.GetAttrPool(), "Leaf", undefined, child);
  alternate.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 6000, 720));
  const revision = doc.GetDocumentStateManager().GetModelRevision(),
    model = vi.spyOn(doc, "NotifyModelChange"),
    events: string[] = [],
    hints: SwModelHint[] = [],
    observer = new Observer(),
    client = new SwClient(
      /** Observes exact accepted descendant hints under native locking. @param source - Original leaf owner. @param hint - Exact hint. @returns Nothing. */
      (source, hint) => {
        expect(source).toBe(leaf);
        expect(leaf.IsModifyLocked()).toBe(true);
        expect(child.IsModifyLocked()).toBe(true);
        hints.push(hint);
        events.push("writer");
        leaf.SwClientNotify(leaf, hint);
      },
    );
  client.RegisterToModify(leaf);
  observer.StartListening(leaf.GetNotifier());
  const broadcast = vi.spyOn(observer, "Notify").mockImplementation(
    /** Records native Writer-before-observer order. @param hint - Original hint. @returns Nothing. */
    (hint) => {
      events.push("observer");
      Observer.prototype.Notify.call(observer, hint);
    },
  );
  try {
    expect(child.SetDerivedFrom(alternate)).toBe(true);
    expect(hints).toHaveLength(1);
    const hint = hints[0];
    expect(hint).toBeInstanceOf(SwFormatChangeHint);
    expect(hint).toEqual(new SwFormatChangeHint(child, child));
    expect(observer.hints).toEqual([hint]);
    expect(observer.hints[0]).toBe(hint);
    expect(broadcast).toHaveBeenCalledOnce();
    expect(events).toEqual(["writer", "observer"]);
    expect(child.GetRegisteredIn()).toBe(alternate);
    expect(child.DerivedFrom()).toBe(alternate);
    expect(child.GetAttrSet().GetParent()).toBe(alternate.GetAttrSet());
    expect(leaf.DerivedFrom()).toBe(child);
    expect(leaf.GetAttrSet().GetParent()).toBe(child.GetAttrSet());
    expect(leaf.GetFrameSize()).toBe(alternate.GetFrameSize());
    expect(leaf.GetFrameSize().GetHeight()).toBe(720);
    expect(model).not.toHaveBeenCalled();
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(child.IsModifyLocked()).toBe(false);
    expect(leaf.IsModifyLocked()).toBe(false);
    expect(child.SetDerivedFrom(alternate)).toBe(false);
    expect(root.SetDerivedFrom(leaf)).toBe(false);
    expect(hints).toHaveLength(1);
    child.LockModify();
    expect(child.SetDerivedFrom()).toBe(true);
    expect(child.DerivedFrom()).toBe(root);
    expect(child.GetAttrSet().GetParent()).toBe(root.GetAttrSet());
    expect(hints).toHaveLength(1);
    child.UnlockModify();
  } finally {
    client.Dispose();
    observer.EndListeningAll();
    vi.restoreAllMocks();
    leaf.DisposeModify();
    child.DisposeModify();
    alternate.DisposeModify();
    doc.Dispose();
  }
});

it("native client registration copies subscribe to the actual format and retain base frame preparation defaults", /** Checks original registration sharing and native default Prepare return. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Native clients"),
    row = doc.nodes.AppendTableRow(table, 1),
    box = row.GetTabBoxes()[0];
  if (!box) throw Error("Missing original native box");
  const format = box.GetFrameFormat(),
    parent = doc.MakeTableBoxFormat(),
    frame = new SwCellFrame(box),
    template = new SwClient(),
    hints: SwModelHint[] = [],
    client = new SwClient(
      /** Receives the accepted native format owner. @param source - Original format. @param hint - Borrowed hint. @returns Nothing. */
      (source, hint) => {
        expect(source).toBe(format);
        hints.push(hint);
      },
    );
  template.RegisterToModify(format);
  client.StartListeningToSameModifyAs(template);
  try {
    expect(client.GetRegisteredIn()).toBe(format);
    expect(frame.Prepare()).toBe(false);
    expect(format.SetDerivedFrom(parent)).toBe(true);
    expect(hints).toEqual([new SwFormatChangeHint(format, format)]);
    expect(frame.GetFormat()).toBe(format);
    expect(format.GetAttrSet().GetParent()).toBe(parent.GetAttrSet());
    client.StartListeningToSameModifyAs(new SwClient());
    expect(client.GetRegisteredIn()).toBeUndefined();
    expect(format.SetDerivedFrom()).toBe(true);
    expect(hints).toHaveLength(1);
  } finally {
    client.Dispose();
    template.Dispose();
    frame.Dispose();
    doc.Dispose();
  }
});

it("inherited format changes rebind the item set to actual registration and support an absent native parent", /** Checks source pointer conditions without a mirrored parent cache. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = doc.GetDfltFrameFormat(),
    alternate = new SwFrameFormat(doc.GetAttrPool(), "Alternate", undefined, root),
    child = new SwFrameFormat(doc.GetAttrPool(), "Child", undefined, root),
    observer = new Observer();
  observer.StartListening(child.GetNotifier());
  try {
    child.RegisterToModify(alternate);
    expect(child.DerivedFrom()).toBe(alternate);
    expect(child.GetAttrSet().GetParent()).toBe(root.GetAttrSet());
    const unrelated = new SwFormatChangeHint(root, root);
    child.SwClientNotify(root, unrelated);
    expect(child.GetAttrSet().GetParent()).toBe(root.GetAttrSet());
    const inherited = new SwFormatChangeHint(root, alternate);
    alternate.CallSwClientNotify(inherited);
    expect(child.GetAttrSet().GetParent()).toBe(alternate.GetAttrSet());
    expect(observer.hints.at(-1)).toBe(inherited);
    child.EndListening();
    expect(child.DerivedFrom()).toBeUndefined();
    const detached = new SwFormatChangeHint(alternate, undefined);
    child.SwClientNotify(alternate, detached);
    expect(child.GetAttrSet().GetParent()).toBeUndefined();
    expect(observer.hints.at(-1)).toBe(detached);
    expect(child.SetDerivedFrom()).toBe(false);
  } finally {
    observer.EndListeningAll();
    child.DisposeModify();
    alternate.DisposeModify();
    doc.Dispose();
  }
});

it("native inheritance hints remain identical through existing bounded transactions and foreign-source rejection", /** Checks atomic parent filtering and stable borrowed format pointers. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parent = doc.MakeTableBoxFormat(),
    child = doc.MakeTableBoxFormat(),
    foreign = doc.MakeTableBoxFormat(),
    observer = new Observer();
  child.SetDerivedFrom(parent);
  observer.StartListening(child.GetNotifier());
  const hint = new SwFormatChangeHint(parent, parent);
  try {
    child.Notify(foreign, hint);
    expect(observer.hints).toEqual([]);
    parent.RunNotificationTransaction(
      /** Queues original native inheritance alongside an existing bounded selection hint. @returns Nothing. */ () => {
        parent.SwClientNotify(parent, hint);
        parent.CallSwClientNotify({ kind: "cursor-selection-changed" });
      },
    );
    expect(observer.hints).toHaveLength(1);
    const batch = observer.hints[0];
    expect(batch?.kind).toBe("model-transaction");
    if (batch?.kind !== "model-transaction") throw Error("Missing actual native transaction");
    expect(batch.hints[0]).toBe(hint);
    expect(batch.hints[1]).toEqual({ kind: "cursor-selection-changed" });
    expect(child.GetAttrSet().GetParent()).toBe(parent.GetAttrSet());
    expect(child.IsModifyLocked()).toBe(false);
  } finally {
    observer.EndListeningAll();
    doc.Dispose();
  }
});
