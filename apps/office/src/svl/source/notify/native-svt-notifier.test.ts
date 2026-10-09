/** @fileoverview Verifies original native Svt membership, ordering, copy and destruction contracts without upstream runtime. */
import { expect, it, vi } from "vitest";
import { SvtBroadcaster } from "./broadcast";
import { SvtListener, SvtQueryBase, type SvtDyingHint } from "./listener";
import { BroadcastingModify, BroadcasterMixin, SwClient } from "../../../sw/inc/calbck";
import type { SwModelHint } from "../../../sw/inc/hints";
import { SwDoc } from "../../../sw/source/core/doc/doc";
import { SwFormatVertOrient } from "../../../sw/inc/fmtornt";

/** Test hint retains original borrowed identity. */
interface Hint {
  readonly kind: "event";
  readonly value: number;
}
/** Original typed native listener with ordered event capture. */
class Listener extends SvtListener<Hint> {
  public readonly hints: (Hint | SvtDyingHint)[] = [];
  /** Captures an optional synchronous native reaction. @param reaction - Callback. @returns Nothing. */
  public constructor(private readonly reaction?: (hint: Hint | SvtDyingHint) => void) {
    super();
  }
  /** Reads the exact same original hint. @param hint - Original native hint. @returns Nothing. */
  public override Notify(hint: Hint | SvtDyingHint): void {
    this.hints.push(hint);
    this.reaction?.(hint);
  }
}

it("native Svt registration is reciprocal M:N and orders original allocation identities after unsorted insertion", /** Checks source identities and normalized original order. @returns Nothing. */ () => {
  const a = new SvtBroadcaster<Hint>(),
    b = new SvtBroadcaster<Hint>();
  const first = new Listener(),
    second = new Listener(),
    third = new Listener();
  expect(a.HasListeners()).toBe(false);
  expect(first.HasBroadcaster()).toBe(false);
  expect(third.StartListening(a)).toBe(true);
  expect(first.StartListening(a)).toBe(true);
  expect(second.StartListening(a)).toBe(true);
  expect(first.StartListening(a)).toBe(false);
  first.StartListening(b);
  expect(a.GetAllListeners()).toEqual([first, second, third]);
  expect(b.GetAllListeners()[0]).toBe(first);
  const hint: Hint = { kind: "event", value: 17 };
  a.Broadcast(hint);
  for (const listener of [first, second, third]) expect(listener.hints[0]).toBe(hint);
  first.EndListening(new SvtBroadcaster<Hint>());
  first.EndListening(a);
  expect(first.HasBroadcaster()).toBe(true);
  expect(a.GetAllListeners()).toEqual([second, third]);
  first.Dispose();
  second.Dispose();
  third.Dispose();
  expect(a.HasListeners()).toBe(false);
  expect(b.HasListeners()).toBe(false);
});

it("native Svt complete broadcast membership snapshot survives ordinary removals and excludes added listeners", /** Checks live membership separately from the original current dispatch. @returns Nothing. */ () => {
  const source = new SvtBroadcaster<Hint>();
  const first = new Listener(
    /** Mutates reciprocal membership inside the first callback. @returns Nothing. */ () => {
      future.EndListening(source);
      added.StartListening(source);
    },
  );
  const future = new Listener(),
    added = new Listener();
  first.StartListening(source);
  future.StartListening(source);
  const original: Hint = { kind: "event", value: 1 };
  source.Broadcast(original);
  expect(future.HasBroadcaster()).toBe(false);
  expect(future.hints).toEqual([original]);
  expect(added.hints).toEqual([]);
  source.Broadcast(original);
  expect(future.hints).toHaveLength(1);
  expect(added.hints[0]).toBe(original);
  first.Dispose();
  added.Dispose();
  source.Dispose();
});

it("native Svt tombstones reuse the original sorted pointer slot and ListenersGone runs at the final removal", /** Checks native reuse, query compaction and empty callbacks. @returns Nothing. */ () => {
  /** Native source exposing its empty-membership hook. */
  class Source extends SvtBroadcaster<Hint> {
    public gone = 0;
    /** Records the native final-listener hook. @returns Nothing. */
    protected override ListenersGone(): void {
      this.gone++;
    }
  }
  const source = new Source(),
    first = new Listener(),
    second = new Listener(),
    third = new Listener();
  first.StartListening(source);
  second.StartListening(source);
  third.StartListening(source);
  second.EndListening(source);
  expect(source.HasListeners()).toBe(true);
  second.StartListening(source);
  expect(source.GetAllListeners()).toEqual([first, second, third]);
  first.Dispose();
  second.Dispose();
  third.Dispose();
  expect(source.gone).toBe(1);
  expect(source.GetAllListeners()).toEqual([]);
  source.Dispose();
});

it("native Svt unsorted additions and sparse removal normalize original listeners without duplication", /** Covers large native listener removal and sorted-tail reuse contracts. @returns Nothing. */ () => {
  const source = new SvtBroadcaster<Hint>();
  const listeners = Array.from(
    { length: 1100 },
    /** Allocates original listener identities. @returns Native listener. */ () => new Listener(),
  );
  for (const listener of listeners) listener.StartListening(source);
  for (const listener of listeners.slice(0, 1050)) listener.EndListening(source);
  expect(source.GetAllListeners()).toEqual(listeners.slice(1050));
  const earlier = listeners[0] as Listener;
  earlier.StartListening(source);
  (listeners[1051] as Listener).EndListening(source);
  expect(source.GetAllListeners()).toEqual([
    earlier,
    ...listeners.slice(1050).filter(
      /** Selects surviving original registrations. @param listener - Original listener. @returns Whether retained. */
      (listener) => listener !== listeners[1051],
    ),
  ]);
  for (const listener of listeners) listener.Dispose();
  source.Dispose();
});

it("native Svt broadcaster copy attaches original listeners reciprocally and listener CopyAll replaces sources including self-clear", /** Checks native original membership copies without listener or hint clones. @returns Nothing. */ () => {
  const source = new SvtBroadcaster<Hint>(),
    other = new SvtBroadcaster<Hint>();
  const first = new Listener(),
    second = new Listener();
  second.StartListening(source);
  first.StartListening(source);
  const copy = new SvtBroadcaster(source);
  expect(copy.GetAllListeners()).toEqual([first, second]);
  first.EndListening(source);
  expect(first.HasBroadcaster()).toBe(true);
  first.StartListening(other);
  first.CopyAllBroadcasters(second);
  expect(other.HasListeners()).toBe(false);
  expect(source.GetAllListeners()).toEqual([first, second]);
  first.CopyAllBroadcasters(first);
  expect(first.HasBroadcaster()).toBe(false);
  expect(source.GetAllListeners()).toEqual([second]);
  const declarationCopy = new SvtListener(second);
  expect(declarationCopy.HasBroadcaster()).toBe(true);
  expect(source.GetAllListeners()).toEqual([second]);
  declarationCopy.BroadcasterDying(source);
  declarationCopy.BroadcasterDying(copy);
  declarationCopy.Dispose();
  second.Dispose();
  source.Dispose();
  copy.Dispose();
});

it("native Svt prepare defers Dying and skips listeners removed before destruction in normalized identity order", /** Checks prepare and destructor as distinct operations. @returns Nothing. */ () => {
  const source = new SvtBroadcaster<Hint>(),
    first = new Listener(),
    second = new Listener(),
    third = new Listener();
  first.StartListening(source);
  second.StartListening(source);
  third.StartListening(source);
  source.PrepareForDestruction();
  expect(first.hints).toEqual([]);
  expect(source.HasListeners()).toBe(true);
  third.Dispose();
  first.Dispose();
  source.Dispose();
  expect(first.hints).toEqual([]);
  expect(third.hints).toEqual([]);
  expect(second.hints).toEqual([{ kind: "dying" }]);
  expect(second.HasBroadcaster()).toBe(false);
  expect(source.HasListeners()).toBe(false);
  source.Dispose();
  source.Broadcast({ kind: "event", value: 0 });
  expect(second.hints).toHaveLength(1);
});

it("native Svt disposing guards retain the Dying membership snapshot while callbacks unregister themselves", /** Checks actual destructor callback ordering and native release add guards. @returns Nothing. */ () => {
  const source = new SvtBroadcaster<Hint>(),
    added = new Listener();
  const first = new Listener(
    /** Ends reciprocal ownership inside destructor dispatch. @returns Nothing. */ () => {
      first.Dispose();
      future.Dispose();
      added.StartListening(source);
    },
  );
  const future = new Listener();
  first.StartListening(source);
  future.StartListening(source);
  source.Dispose();
  expect(first.hints).toEqual([{ kind: "dying" }]);
  expect(future.hints).toEqual([{ kind: "dying" }]);
  expect(source.GetAllListeners()).toEqual([]);
  added.Dispose();
  const prepared = new SvtBroadcaster<Hint>();
  prepared.PrepareForDestruction();
  added.StartListening(prepared);
  expect(prepared.HasListeners()).toBe(false);
  added.Dispose();
  prepared.Dispose();
});

it("native default Svt hooks and QueryBase retain their declared no-op and unsigned identity contracts", /** Checks default native callbacks without inventing payload conversion. @returns Nothing. */ () => {
  const listener = new SvtListener<Hint>(),
    query = new SvtQueryBase(65537);
  expect(query.getId()).toBe(1);
  listener.Notify({ kind: "event", value: 2 });
  listener.Query(query);
  listener.BroadcasterDying(new SvtBroadcaster<Hint>());
  listener.Dispose();
});

it("native sorted additions append when an earlier empty slot cannot accept the original listener identity", /** Checks native lower-bound insertion past a different live identity. @returns Nothing. */ () => {
  const source = new SvtBroadcaster<Hint>();
  const first = new Listener(),
    gap = new Listener(),
    third = new Listener(),
    last = new Listener();
  first.StartListening(source);
  third.StartListening(source);
  last.StartListening(source);
  last.EndListening(source);
  gap.StartListening(source);
  expect(source.GetAllListeners()).toEqual([first, gap, third]);
  first.Dispose();
  gap.Dispose();
  third.Dispose();
  source.Dispose();
});

it("native default listener copy retains only its declaration set and release removal leaves original reciprocal clients intact", /** Checks the header's default copy and native release nonmember guard; C++ debug assertion remains outside the browser boundary. @returns Nothing. */ () => {
  const source = new SvtBroadcaster<Hint>(),
    first = new Listener();
  first.StartListening(source);
  const copy = new SvtListener(first);
  expect(copy.HasBroadcaster()).toBe(true);
  copy.EndListeningAll();
  expect(copy.HasBroadcaster()).toBe(false);
  expect(first.HasBroadcaster()).toBe(true);
  expect(source.GetAllListeners()).toEqual([first]);
  first.Dispose();
  source.Dispose();
});

it("native BroadcastingModify dispatches the same exact hint after Writer clients under the original lock without document signals", /** Checks original native writer/notifier order and final-client lifetime. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableBoxFormat(),
    events: unknown[] = [];
  const writer = new SwClient(
    /** Records original Writer callback. @param source - Original format. @param hint - Borrowed hint. @returns Nothing. */
    (source, hint) => events.push(["writer", source, hint, format.IsModifyLocked()]),
  );
  /** Original observer channel receiver, separate from Writer clients. */
  class Observer extends SvtListener<SwModelHint> {
    /** Records original native notifier callback. @param hint - Original hint. @returns Nothing. */
    public override Notify(hint: SwModelHint | SvtDyingHint): void {
      events.push(["observer", hint, format.IsModifyLocked()]);
    }
  }
  const observer = new Observer();
  observer.StartListening(format.GetNotifier());
  expect(format.HasWriterListeners()).toBe(false);
  writer.RegisterToModify(format);
  const signal = vi.spyOn(doc.GetDocumentStateManager(), "CallSwClientNotify");
  const revision = doc.GetDocumentStateManager().GetModelRevision();
  format.SetFormatAttr(new SwFormatVertOrient(720, 2, 7));
  expect(events).toHaveLength(2);
  const first = events[0] as unknown[];
  expect(first.slice(0, 2)).toEqual(["writer", format]);
  expect(events[1]).toEqual(["observer", first[2], true]);
  expect(first[3]).toBe(true);
  expect(signal).not.toHaveBeenCalled();
  expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  writer.Dispose();
  expect(format.HasWriterListeners()).toBe(false);
  expect(format.GetNotifier().HasListeners()).toBe(true);
  format.DisposeModify();
  expect(observer.HasBroadcaster()).toBe(false);
  expect((events[2] as unknown[])[1]).toEqual({ kind: "dying" });
  format.CallSwClientNotify({ kind: "cursor-selection-changed" });
  expect(events).toHaveLength(3);
  signal.mockRestore();
});

it("native BroadcastingModify preserves one original accepted transaction and independent mixin copies", /** Checks terminal transaction dispatch and original notifier ownership. @returns Nothing. */ () => {
  const modify = new BroadcastingModify(),
    writerHints: SwModelHint[] = [];
  const writer = new SwClient(
    /** Records the terminal original batch. @param source - Original modify. @param hint - Original hint. @returns Nothing. */
    (_source, hint) => writerHints.push(hint),
  );
  writer.RegisterToModify(modify);
  const observer = new SvtListener<SwModelHint>(),
    notify = vi.spyOn(observer, "Notify");
  observer.StartListening(modify.GetNotifier());
  const first: SwModelHint = { kind: "cursor-selection-changed" },
    second: SwModelHint = { kind: "document-disposed" };
  modify.RunNotificationTransaction(
    /** Queues two original accepted atomic hints. @returns Nothing. */ () => {
      modify.CallSwClientNotify(first);
      modify.CallSwClientNotify(second);
      expect(notify).not.toHaveBeenCalled();
    },
  );
  expect(notify).toHaveBeenCalledOnce();
  expect(notify.mock.calls[0]?.[0]).toBe(writerHints[0]);
  expect(writerHints[0]).toEqual({ kind: "model-transaction", hints: [first, second] });
  const mixin = new BroadcasterMixin();
  observer.StartListening(mixin.GetNotifier());
  const copy = new BroadcasterMixin(mixin);
  expect(copy.GetNotifier()).not.toBe(mixin.GetNotifier());
  expect(copy.GetNotifier().GetAllListeners()).toEqual([observer]);
  modify.DisposeModify();
  observer.Dispose();
  copy.GetNotifier().Dispose();
  mixin.GetNotifier().Dispose();
});
