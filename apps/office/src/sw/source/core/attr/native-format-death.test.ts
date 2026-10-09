/** @fileoverview Verifies original Writer clients and inherited item sets move before native format destruction. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFormat } from "./format";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwClient } from "../../../inc/calbck";
import { SwFormatChangeHint, type SwModelHint } from "../../../inc/hints";
import { SvtListener, type SvtDyingHint } from "../../../../svl/source/notify/listener";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatPageDesc } from "./fmtpdsc";
import { RES_PAGEDESC } from "../../../inc/hintids";

it("dying parent reparents every original Writer client before the exact borrowed format hint and notifier death", /** Checks native source, original ownership, inheritance and independent observer ordering. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = doc.GetDfltFrameFormat(),
    parent = doc.MakeTableBoxFormat(),
    child = doc.MakeTableBoxFormat(),
    peer = doc.MakeTableBoxFormat();
  child.SetDerivedFrom(parent);
  peer.SetDerivedFrom(parent);
  root.SetFormatAttr(new SwFormatVertOrient(120, 3, 7));
  parent.SetFormatAttr(new SwFormatVertOrient(720, 2, 7));
  const set = child.GetAttrSet(),
    events: unknown[] = [],
    model = vi.spyOn(doc, "NotifyModelChange"),
    revision = doc.GetDocumentStateManager().GetModelRevision();
  const direct = new SwClient(
    /** Checks pre-callback native registration and lifetime. @param source - Original dying owner. @param hint - Borrowed replacement. @returns Nothing. */
    (source, hint) => {
      expect(source).toBe(parent);
      expect(direct.GetRegisteredIn()).toBe(root);
      expect(parent.IsDisposed()).toBe(false);
      expect(parent.IsFormatInDTOR()).toBe(true);
      expect(parent.IsModifyLocked()).toBe(false);
      events.push(["direct", hint]);
    },
  );
  direct.RegisterToModify(parent);
  const survivor = new SwClient(
    /** Records the propagated original borrowed hint. @param source - Actual surviving child. @param hint - Original replacement. @returns Nothing. */
    (source, hint) => {
      expect(source).toBe(child);
      expect(child.GetRegisteredIn()).toBe(root);
      expect(set.GetParent()).toBe(root.GetAttrSet());
      events.push(["child", hint]);
    },
  );
  survivor.RegisterToModify(child);
  /** Original Svt channel records the terminal inherited hint or independent notifier death. */
  class Observer extends SvtListener<SwModelHint> {
    /** Records the borrowed event. @param hint - Original notification. @returns Nothing. */
    public override Notify(hint: SwModelHint | SvtDyingHint): void {
      events.push(["observer", hint]);
    }
  }
  const observer = new Observer();
  observer.StartListening(child.GetNotifier());
  observer.StartListening(parent.GetNotifier());
  try {
    expect(child.GetVertOrient()).toBe(parent.GetVertOrient());
    parent.DisposeModify();
    expect(child.DerivedFrom()).toBe(root);
    expect(peer.DerivedFrom()).toBe(root);
    expect(peer.GetAttrSet().GetParent()).toBe(root.GetAttrSet());
    expect(child.GetAttrSet()).toBe(set);
    expect(child.GetVertOrient()).toBe(root.GetVertOrient());
    expect(parent.HasWriterListeners()).toBe(false);
    expect(parent.GetNotifier().HasListeners()).toBe(false);
    expect(parent.IsDisposed()).toBe(true);
    expect(events).toHaveLength(4);
    const hint = (events[0] as unknown[])[1];
    expect(hint).toEqual(new SwFormatChangeHint(parent, root));
    expect(events).toEqual([
      ["child", hint],
      ["observer", hint],
      ["direct", hint],
      ["observer", { kind: "dying" }],
    ]);
    expect(model).not.toHaveBeenCalled();
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    parent.DisposeModify();
    expect(events).toHaveLength(4);
  } finally {
    survivor.Dispose();
    direct.Dispose();
    observer.Dispose();
    vi.restoreAllMocks();
    child.DisposeModify();
    peer.DisposeModify();
    doc.Dispose();
  }
});

it("parentless format death clears the direct page descriptor through the base method before dependent teardown", /** Checks native root cleanup and flag without virtual reset substitution. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = new SwFormat(doc.GetAttrPool(), "Independent dying root", [
      [RES_PAGEDESC, RES_PAGEDESC],
    ]),
    client = new SwClient();
  root.SetFormatAttr(new SwFormatPageDesc("First Page", 4));
  client.RegisterToModify(root);
  const reset = vi.spyOn(root, "ResetFormatAttr");
  try {
    expect(root.IsFormatInDTOR()).toBe(false);
    root.DisposeModify();
    expect(root.IsFormatInDTOR()).toBe(true);
    expect(root.GetAttrSet().Count()).toBe(0);
    expect(reset).not.toHaveBeenCalled();
    expect(client.GetRegisteredIn()).toBeUndefined();
    expect(root.HasWriterListeners()).toBe(false);
  } finally {
    reset.mockRestore();
    client.Dispose();
    doc.Dispose();
  }
});

it("a format without Writer clients skips native death preparation and keeps direct attributes even with an Svt observer", /** Checks independent observer lifetime and original no-client flag. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = new SwFrameFormat(doc.GetAttrPool(), "Unobserved Writer root", [
      [RES_PAGEDESC, RES_PAGEDESC],
    ]),
    observer = new SvtListener<SwModelHint>();
  root.SetFormatAttr(new SwFormatPageDesc("First Page"));
  observer.StartListening(root.GetNotifier());
  try {
    expect(root.HasWriterListeners()).toBe(false);
    root.DisposeModify();
    expect(root.IsFormatInDTOR()).toBe(false);
    expect(root.GetAttrSet().Count()).toBe(1);
    expect(observer.HasBroadcaster()).toBe(false);
  } finally {
    observer.Dispose();
    doc.Dispose();
  }
});
