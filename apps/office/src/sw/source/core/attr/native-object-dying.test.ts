/** @fileoverview Verifies borrowed native Writer object-death hints, registration and surviving format inheritance. */
import { expect, it, vi } from "vitest";
import { SwClient, SwModify, BroadcastingModify, ModifyChangedHint } from "../../../inc/calbck";
import { ObjectDyingHint, type SwModelHint } from "../../../inc/hints";
import { SvtListener, type SvtDyingHint } from "../../../../svl/source/notify/listener";
import { SwDoc } from "../doc/doc";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwFormatVertOrient } from "../../../inc/fmtornt";

it("native CheckRegistration returns original replacement owners only for the exact dying registration and clears reciprocal root links", /** Checks the shared ClientBase semantics without synthetic owner copies. @returns Nothing. */ () => {
  const root = new SwModify(),
    parent = new SwModify(),
    foreign = new SwModify(),
    client = new SwClient();
  parent.RegisterToModify(root);
  client.RegisterToModify(parent);
  expect(client.CheckRegistration(new ObjectDyingHint(foreign))).toBeUndefined();
  expect(client.GetRegisteredIn()).toBe(parent);
  const changed = client.CheckRegistration(new ObjectDyingHint(parent));
  expect(changed).toEqual(new ModifyChangedHint(root));
  expect(changed?.m_pNew).toBe(root);
  expect(client.GetRegisteredIn()).toBe(root);
  expect(client.HasBroadcaster()).toBe(true);
  expect(parent.HasWriterListeners()).toBe(false);
  expect(client.CheckRegistration(new ObjectDyingHint(root))).toEqual(
    new ModifyChangedHint(undefined),
  );
  expect(client.GetRegisteredIn()).toBeUndefined();
  expect(client.HasBroadcaster()).toBe(false);
  expect(client.CheckRegistration(new ObjectDyingHint(root))).toBeUndefined();
  client.RegisterToModify(parent);
  client.EndListeningAll();
  expect(client.GetRegisteredIn()).toBeUndefined();
  expect(client.HasBroadcaster()).toBe(false);
  expect(parent.HasWriterListeners()).toBe(false);
  const modify = new SwModify();
  modify.RegisterToModify(root);
  expect(modify.CheckRegistration(new ObjectDyingHint(foreign))).toBeUndefined();
  expect(modify.CheckRegistration(new ObjectDyingHint(root))).toEqual(
    new ModifyChangedHint(undefined),
  );
  expect(modify.GetRegisteredIn()).toBeUndefined();
  modify.DisposeModify();
  client.Dispose();
  parent.DisposeModify();
  root.DisposeModify();
  foreign.DisposeModify();
});

it("native SwModify destruction notifies before disposal under the original lock and reparents callback clients before their receiver", /** Checks exact original hint identity, native source and recursion guard. @returns Nothing. */ () => {
  const root = new SwModify(),
    source = new SwModify(),
    events: SwModelHint[] = [];
  source.RegisterToModify(root);
  const client = new SwClient(
    /** Records the original dying owner after native base registration handling. @param owner - Dying source. @param hint - Borrowed hint. @returns Nothing. */
    (owner, hint) => {
      expect(owner).toBe(source);
      expect(source.IsDisposed()).toBe(false);
      expect(source.IsModifyLocked()).toBe(true);
      expect(client.GetRegisteredIn()).toBe(root);
      expect(hint).toBeInstanceOf(ObjectDyingHint);
      expect((hint as ObjectDyingHint).m_pDying).toBe(source);
      events.push(hint);
      source.SwClientNotify(source, hint);
    },
  );
  client.RegisterToModify(source);
  source.DisposeModify();
  expect(events).toHaveLength(1);
  expect(source.IsModifyLocked()).toBe(false);
  expect(source.IsDisposed()).toBe(true);
  expect(source.HasWriterListeners()).toBe(false);
  expect(source.GetRegisteredIn()).toBeUndefined();
  expect(client.GetRegisteredIn()).toBe(root);
  source.DisposeModify();
  expect(events).toHaveLength(1);
  client.Dispose();
  root.DisposeModify();
});

it("native destructor fallback checks original clients whose override did not call the base hook", /** Checks original fallback client cleanup and inherited modify registration. @returns Nothing. */ () => {
  const root = new SwModify(),
    source = new SwModify(),
    child = new SwModify(),
    events: SwModelHint[] = [];
  source.RegisterToModify(root);
  child.RegisterToModify(source);
  /** Represents a native override that leaves registration cleanup to the destructor fallback. */
  class DeferredClient extends SwClient {
    /** Preserves the original missing-base callback for fallback verification. @param owner - Actual source. @param hint - Original death note. @returns Nothing. */
    protected override SwClientNotify(owner: SwModify, hint: SwModelHint): void {
      expect(owner).toBe(source);
      expect(this.GetRegisteredIn()).toBe(source);
      events.push(hint);
    }
  }
  const client = new DeferredClient();
  client.RegisterToModify(source);
  source.DisposeModify();
  expect(events).toEqual([new ObjectDyingHint(source)]);
  expect(client.GetRegisteredIn()).toBe(root);
  expect(child.GetRegisteredIn()).toBe(root);
  expect(source.HasWriterListeners()).toBe(false);
  client.Dispose();
  child.DisposeModify();
  root.DisposeModify();
});

it("object death bypasses nested browser batching after independent Svt death and never flushes stale disposed transactions", /** Checks native base order, immediate original hint and idempotent observer cleanup. @returns Nothing. */ () => {
  const root = new SwModify(),
    source = new BroadcastingModify(),
    events: unknown[] = [];
  source.RegisterToModify(root);
  const client = new SwClient(
    /** Records the immediate native death notification. @param owner - Original dying owner. @param hint - Borrowed hint. @returns Nothing. */
    (owner, hint) => {
      expect(owner).toBe(source);
      expect(client.GetRegisteredIn()).toBe(root);
      events.push(["writer", hint]);
    },
  );
  client.RegisterToModify(source);
  /** Observes only the independent native Svt lifetime. */
  class Observer extends SvtListener<SwModelHint> {
    /** Records original observer notifications. @param hint - Original hint. @returns Nothing. */
    public override Notify(hint: SwModelHint | SvtDyingHint): void {
      events.push(["observer", hint]);
    }
  }
  const observer = new Observer();
  observer.StartListening(source.GetNotifier());
  const result = source.RunNotificationTransaction(
    /** Queues browser work before original native death. @returns Exact nested result. */ () => {
      source.CallSwClientNotify({ kind: "document-state-changed" });
      return source.RunNotificationTransaction(
        /** Destroys the original source while the browser batch is open. @returns Native sentinel. */ () => {
          source.CallSwClientNotify({ kind: "cursor-selection-changed" });
          source.DisposeModify();
          expect(events).toEqual([
            ["observer", { kind: "dying" }],
            ["writer", new ObjectDyingHint(source)],
          ]);
          return 17;
        },
      );
    },
  );
  expect(result).toBe(17);
  source.DisposeModify();
  source.CallSwClientNotify({ kind: "document-state-changed" });
  expect(events).toHaveLength(2);
  expect(observer.HasBroadcaster()).toBe(false);
  client.Dispose();
  observer.Dispose();
  root.DisposeModify();
});

it("original format death hints rebind or detach owned attribute inheritance under exact native dying-parent identity", /** Checks foreign, absent, surviving-parent and parentless paths with unchanged direct items and no model signals. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = doc.GetDfltFrameFormat(),
    parent = doc.MakeTableBoxFormat(),
    child = doc.MakeTableBoxFormat(),
    independent = new SwFrameFormat(doc.GetAttrPool(), "Native dying root"),
    detached = doc.MakeTableBoxFormat();
  parent.SetFormatAttr(new SwFormatVertOrient(720, 2, 7));
  child.SetDerivedFrom(parent);
  independent.SetFormatAttr(new SwFormatVertOrient(120, 3, 7));
  detached.SetDerivedFrom(independent);
  const set = child.GetAttrSet(),
    direct = child.GetAttrSet().Count(),
    model = vi.spyOn(doc, "NotifyModelChange"),
    revision = doc.GetDocumentStateManager().GetModelRevision(),
    events: SwModelHint[] = [];
  const receiver = new SwClient(
    /** Checks the original child before forwarding the native hint. @param source - Actual child source. @param hint - Borrowed death note. @returns Nothing. */
    (source, hint) => {
      expect(source).toBe(child);
      events.push(hint);
    },
  );
  receiver.RegisterToModify(child);
  try {
    const foreign = new ObjectDyingHint(independent);
    child.SwClientNotify(independent, foreign);
    expect(child.DerivedFrom()).toBe(parent);
    expect(set.GetParent()).toBe(parent.GetAttrSet());
    expect(events).toEqual([foreign]);
    const hint = new ObjectDyingHint(parent);
    parent.CallSwClientNotify(hint);
    expect(child.DerivedFrom()).toBe(root);
    expect(child.GetAttrSet()).toBe(set);
    expect(set.GetParent()).toBe(root.GetAttrSet());
    expect(set.Count()).toBe(direct);
    expect(events[1]).toBe(hint);
    expect(child.GetVertOrient()).toBe(root.GetVertOrient());
    independent.DisposeModify();
    expect(detached.DerivedFrom()).toBeUndefined();
    expect(detached.GetAttrSet().GetParent()).toBeUndefined();
    expect(detached.GetVertOrient()).toBe(
      doc.GetAttrPool().GetUserOrPoolDefaultItem(detached.GetVertOrient().Which()),
    );
    detached.SwClientNotify(independent, foreign);
    expect(detached.GetAttrSet().GetParent()).toBeUndefined();
    expect(model).not.toHaveBeenCalled();
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  } finally {
    receiver.Dispose();
    vi.restoreAllMocks();
    child.DisposeModify();
    parent.DisposeModify();
    detached.DisposeModify();
    independent.DisposeModify();
    doc.Dispose();
  }
});
