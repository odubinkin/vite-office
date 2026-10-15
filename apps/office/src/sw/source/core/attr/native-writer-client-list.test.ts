/** @fileoverview Original calbck.hxx/cxx WriterListener ownership, anchor insertion and active-cursor repair through genuine Writer clients. */
import { expect, it, vi } from "vitest";
import {
  SwClient,
  SwModify,
  SwIterator,
  WriterListenerIterator,
  LegacyModifyHint,
} from "../../../inc/calbck";
import { SfxBroadcaster } from "../../../../svl/source/notify/SfxBroadcaster";
import { ObjectDyingHint } from "../../../inc/hints";

it("uses original SwModify inheritance and anchor-right insertion rather than Sfx slots", /** Checks actual owner identities and native three-client order. @returns Nothing. */ () => {
  const source = new SwModify(),
    a = new SwClient(),
    b = new SwClient(),
    c = new SwClient();
  expect(source instanceof SwClient).toBe(true);
  expect(source instanceof SfxBroadcaster).toBe(false);
  expect(source.HasWriterListeners()).toBe(false);
  expect(source.HasOnlyOneListener()).toBe(false);
  source.Add(a);
  expect(source.HasOnlyOneListener()).toBe(true);
  source.Add(b);
  source.Add(c);
  source.Add(b);
  expect([...new SwIterator(SwClient, source)]).toEqual([a, c, b]);
  expect(source.HasOnlyOneListener()).toBe(false);
  expect(a.IsLast()).toBe(false);
  source.RemoveAllWriterListeners();
  expect(source.HasWriterListeners()).toBe(false);
  for (const value of [a, b, c]) expect(value.GetRegisteredIn()).toBeUndefined();
});
it("detaches foreign registrations and preserves source identity on repeated Add", /** Replays original Add/Remove transitions and root death cleanup. @returns Nothing. */ () => {
  const first = new SwModify(),
    second = new SwModify(),
    a = new SwClient();
  first.Add(a);
  first.Add(a);
  expect(first.HasOnlyOneListener()).toBe(true);
  second.Add(a);
  expect(first.HasWriterListeners()).toBe(false);
  expect(a.GetRegisteredIn()).toBe(second);
  expect(
    /** Enforces original Remove registration precondition. @returns Nothing. */ () =>
      first.Remove(a),
  ).toThrow("foreign Writer client");
  second.Remove(a);
  expect(a.IsLast()).toBe(true);
  expect(a.GetRegisteredIn()).toBeUndefined();
});
it("repairs removal of current next and last clients without snapshot or skipped deliveries", /** Exercises source current/position cursor repair. @returns Nothing. */ () => {
  const source = new SwModify(),
    a = new SwClient(),
    b = new SwClient(),
    c = new SwClient();
  for (const value of [a, b, c]) source.Add(value);
  const iter = new SwIterator(SwClient, source);
  try {
    expect(iter.First()).toBe(a);
    source.Remove(a);
    expect(iter.IsChanged()).toBe(true);
    expect(iter.Next()).toBe(c);
    source.Remove(b);
    expect(iter.IsChanged()).toBe(false);
    source.Remove(c);
    expect(iter.IsChanged()).toBe(true);
    expect(iter.Next()).toBeUndefined();
  } finally {
    iter.dispose();
  }
  expect(source.HasWriterListeners()).toBe(false);
});
it("repairs every nested cursor independently for the same actual owner", /** Covers original root-filtered active iterator repair. @returns Nothing. */ () => {
  const source = new SwModify(),
    a = new SwClient(),
    b = new SwClient(),
    c = new SwClient();
  for (const value of [a, b, c]) source.Add(value);
  const outer = new WriterListenerIterator(source),
    inner = new SwIterator(SwClient, source);
  try {
    expect(outer.First()).toBe(a);
    expect(inner.First()).toBe(a);
    expect(inner.Next()).toBe(c);
    source.Remove(c);
    expect(outer.IsChanged()).toBe(false);
    expect(inner.IsChanged()).toBe(true);
    expect(outer.Next()).toBe(b);
    expect(inner.Next()).toBe(b);
  } finally {
    inner.dispose();
    outer.dispose();
    source.RemoveAllWriterListeners();
  }
});
it("filters actual exact template types and handles empty or absent matches", /** Native dynamic type selection uses real class identity. @returns Nothing. */ () => {
  /** Native derived caller with no additional notification protocol. */ class SpecialClient extends SwClient {}
  const source = new SwModify(),
    a = new SwClient(),
    b = new SpecialClient(),
    c = new SwClient();
  expect([...new SwIterator(SpecialClient, source)]).toEqual([]);
  for (const value of [a, b, c]) source.Add(value);
  expect([...new SwIterator(SpecialClient, source)]).toEqual([b]);
  source.Remove(b);
  expect([...new SwIterator(SpecialClient, source)]).toEqual([]);
  source.RemoveAllWriterListeners();
});
it("ends native cursor scope on JS loop break and propagated callback errors", /** Checks the actual language-boundary cleanup needed for active cursor mutation semantics. @returns Nothing. */ () => {
  const source = new SwModify();
  source.Add(new SwClient());
  const iter = new SwIterator(SwClient, source),
    cleanup = vi.spyOn(iter, "dispose");
  for (const value of iter) {
    expect(value.GetRegisteredIn()).toBe(source);
    break;
  }
  expect(cleanup).toHaveBeenCalledOnce();
  const inner = new WriterListenerIterator(source),
    innerCleanup = vi.spyOn(inner, "dispose"),
    failure = new Error("caller");
  expect(
    /** Exercises actual abrupt loop scope exit. @returns Nothing. */ () => {
      for (const value of inner) {
        expect(value instanceof SwClient).toBe(true);
        throw failure;
      }
    },
  ).toThrow(failure);
  expect(innerCleanup).toHaveBeenCalledOnce();
  source.RemoveAllWriterListeners();
});
it("dispatches the original notification order and repairs clients reparented by death", /** Uses actual Native CallSwClientNotify and ClientBase CheckRegistration paths. @returns Nothing. */ () => {
  const root = new SwModify(),
    source = new SwModify(),
    order: string[] = [];
  source.RegisterToModify(root);
  const a = new SwClient(
      /** Records first original receiver. @returns Nothing. */ () => {
        order.push("a");
      },
    ),
    b = new SwClient(
      /** Records second original receiver. @returns Nothing. */ () => {
        order.push("b");
      },
    ),
    c = new SwClient(
      /** Records third original receiver. @returns Nothing. */ () => {
        order.push("c");
      },
    );
  for (const value of [a, b, c]) source.Add(value);
  source.CallSwClientNotify({ kind: "document-state-changed" });
  expect(order).toEqual(["a", "c", "b"]);
  order.length = 0;
  source.DisposeModify();
  expect(order).toEqual(["a", "c", "b"]);
  expect([...new SwIterator(SwClient, root)]).toEqual([b, c, a]);
  for (const value of [a, b, c]) expect(value.GetRegisteredIn()).toBe(root);
  expect(source.HasWriterListeners()).toBe(false);
  root.DisposeModify();
  for (const value of [a, b, c]) expect(value.GetRegisteredIn()).toBeUndefined();
  expect(a.CheckRegistration(new ObjectDyingHint(source))).toBeUndefined();
});

it("forwards represented legacy native hints through the original locked modify filter", /** Uses the actual source-supported SwLegacyModify hint rather than an unrelated browser event. @returns Nothing. */ () => {
  const parent = new SwModify(),
    child = new SwModify(),
    hint = new LegacyModifyHint(undefined, undefined),
    received: unknown[] = [];
  child.RegisterToModify(parent);
  const receiver = new SwClient(
    /** Checks native lock and borrowed identity at the actual child receiver. @param source - Actual owner. @param value - Native hint. @returns Nothing. */ (
      source,
      value,
    ) => {
      expect(source).toBe(child);
      expect(child.IsModifyLocked()).toBe(true);
      received.push(value);
    },
  );
  receiver.RegisterToModify(child);
  parent.SwClientNotify(parent, hint);
  expect(received).toEqual([hint]);
  receiver.Dispose();
  child.DisposeModify();
  parent.DisposeModify();
});

it("detaches from an absent copied registration without invoking a derived disposal hook", /** Original ClientBase::StartListeningToSameModifyAs calls EndListeningAll directly, not a virtual browser Dispose boundary. @returns Nothing. */ () => {
  let disposed = false;
  /** Native registration witness with an independently observable browser teardown hook. */
  class Client extends SwClient {
    /** Observes the unrelated explicit browser disposal boundary. @returns Nothing. */
    override Dispose(): void {
      disposed = true;
      super.Dispose();
    }
  }
  const source = new SwModify(),
    client = new Client();
  client.RegisterToModify(source);
  client.StartListeningToSameModifyAs(new SwClient());
  expect(disposed).toBe(false);
  expect(client.GetRegisteredIn()).toBeUndefined();
  expect(source.HasWriterListeners()).toBe(false);
});
