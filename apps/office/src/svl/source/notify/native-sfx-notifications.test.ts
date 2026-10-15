/** @fileoverview Ports all five native SfxBroadcaster QA contracts and source-derived mutation, copy, duplicate and destruction cases. */
import { describe, expect, it } from "vitest";
import { SfxHint, SfxHintId } from "../../inc/hint";
import { SfxBroadcaster } from "./SfxBroadcaster";
import { DuplicateHandling, SfxListener } from "./lstner";

/** Native listener override records original source and hint identity. */
class Recorder extends SfxListener {
  public readonly received: [SfxBroadcaster, SfxHint][] = [];
  public action?: (source: SfxBroadcaster, hint: SfxHint) => void;
  /** Captures then invokes the caller mutation. @param source - Source. @param hint - Hint. @returns Nothing. */
  public override Notify(source: SfxBroadcaster, hint: SfxHint): void {
    this.received.push([source, hint]);
    this.action?.(source, hint);
  }
}
/** Native QA friend boundary, erased at runtime. */
interface BroadcasterFriend {
  AddListener(listener: SfxListener): void;
  RemoveListener(listener: SfxListener): void;
  Forward(source: SfxBroadcaster, hint: SfxHint): void;
}
/** Borrows native private/protected friend operations for original QA scenarios. @param source - Broadcaster. @returns Friend view. */
function friend(source: SfxBroadcaster): BroadcasterFriend {
  return source as unknown as BroadcasterFriend;
}

describe("native Sfx notification graph", /** Registers source-derived scenarios. @returns Nothing. */ () => {
  it("ports AddingListenersIncreasesCount", /** Checks native count. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      listener = new SfxListener();
    expect(source.GetListenerCount()).toBe(0);
    expect(source.HasListeners()).toBe(false);
    listener.StartListening(source, DuplicateHandling.Prevent);
    expect(source.GetListenerCount()).toBe(1);
    expect(source.HasListeners()).toBe(true);
    listener.Dispose();
  });
  it("ports RemovingListenersDecreasesCount", /** Checks removal. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      listener = new SfxListener();
    listener.StartListening(source, DuplicateHandling.Prevent);
    listener.EndListening(source, true);
    expect(source.GetListenerCount()).toBe(0);
  });
  it("ports HintsAreNotForwardedToRemovedListeners", /** Checks protected forward. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      a = new Recorder(),
      b = new Recorder(),
      hint = new SfxHint();
    a.StartListening(source, DuplicateHandling.Prevent);
    b.StartListening(source, DuplicateHandling.Prevent);
    a.EndListening(source, true);
    friend(source).Forward(source, hint);
    expect(a.received).toEqual([]);
    expect(b.received).toEqual([[source, hint]]);
    b.Dispose();
  });
  it("ports SameListenerCanBeAddedMoreThanOnce", /** Direct native QA friend additions. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      listener = new SfxListener();
    friend(source).AddListener(listener);
    friend(source).AddListener(listener);
    expect(source.GetListenerCount()).toBe(2);
    friend(source).RemoveListener(listener);
    friend(source).RemoveListener(listener);
  });
  it("ports StoppingListeningAffectsOnlyFirstOfIdenticalListeners", /** Removes one repeated slot. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      listener = new SfxListener();
    friend(source).AddListener(listener);
    friend(source).AddListener(listener);
    friend(source).RemoveListener(listener);
    expect(source.GetListenerCount()).toBe(1);
    friend(source).RemoveListener(listener);
  });
  it("preserves native hint IDs, defaults, copy and assignment", /** Exercises real values, including derived hints. @returns Nothing. */ () => {
    const empty = new SfxHint(),
      changed = new SfxHint(SfxHintId.ScDataChanged),
      copy = new SfxHint(changed);
    expect(empty.GetId()).toBe(SfxHintId.NONE);
    expect(copy.GetId()).toBe(SfxHintId.ScDataChanged);
    expect(empty.assign(changed)).toBe(empty);
    changed.assign(new SfxHint(SfxHintId.StyleSheetChanged));
    expect(copy.GetId()).toBe(SfxHintId.ScDataChanged);
    expect(empty.GetId()).toBe(SfxHintId.ScDataChanged);
    expect(SfxHintId.Dying).toBe(1);
  });
  it("implements Prevent, Allow, default duplicate precondition and first/all removals", /** Preserves vector multiplicity. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      other = new SfxBroadcaster(),
      listener = new Recorder();
    listener.StartListening(source);
    listener.StartListening(source, DuplicateHandling.Prevent);
    expect(listener.GetBroadcasterCount()).toBe(1);
    expect(
      /** Violates native assertion. @returns Nothing. */ () => listener.StartListening(source),
    ).toThrow("Unexpected duplicate");
    listener.StartListening(source, DuplicateHandling.Allow);
    listener.StartListening(other);
    listener.StartListening(source, DuplicateHandling.Allow);
    expect(listener.GetBroadcasterCount()).toBe(4);
    expect(listener.GetBroadcasterJOE(1)).toBe(source);
    expect(listener.GetBroadcasterJOE(2)).toBe(other);
    const hint = new SfxHint(SfxHintId.DataChanged);
    source.Broadcast(hint);
    expect(listener.received).toEqual([
      [source, hint],
      [source, hint],
      [source, hint],
    ]);
    listener.EndListening(source);
    expect(source.GetListenerCount()).toBe(2);
    listener.EndListening(source, true);
    expect(listener.IsListening(source)).toBe(false);
    listener.EndListening(source);
    expect(listener.GetBroadcasterCount()).toBe(1);
    listener.EndListeningAll();
    expect(other.GetListenerCount()).toBe(0);
  });
  it("copies listener vectors including duplicates and broadcaster holes", /** Tests both native copy constructors. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      other = new SfxBroadcaster(),
      a = new SfxListener(),
      b = new SfxListener();
    a.StartListening(source);
    b.StartListening(source);
    a.EndListening(source);
    const copied = new SfxBroadcaster(source);
    expect(b.IsListening(copied)).toBe(true);
    expect(copied.GetListenerCount()).toBe(1);
    b.StartListening(source, DuplicateHandling.Allow);
    b.StartListening(other);
    const listenerCopy = new SfxListener(b);
    expect(listenerCopy.GetBroadcasterCount()).toBe(4);
    expect(source.GetListenerCount()).toBe(4);
    listenerCopy.Notify(source, new SfxHint());
    listenerCopy.Dispose();
    b.Dispose();
    expect(source.HasListeners()).toBe(false);
    expect(copied.HasListeners()).toBe(false);
    expect(other.HasListeners()).toBe(false);
  });
  it("observes future reused slots but excludes appended slots from Broadcast", /** Tests live slots with fixed bound. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      first = new Recorder(),
      removed = new Recorder(),
      replacement = new Recorder(),
      appended = new Recorder();
    first.StartListening(source);
    removed.StartListening(source);
    first.action = /** Replaces a future slot and appends. @returns Nothing. */ () => {
      removed.EndListening(source);
      replacement.StartListening(source);
      appended.StartListening(source);
    };
    const hint = new SfxHint();
    source.Broadcast(hint);
    expect(removed.received).toEqual([]);
    expect(replacement.received).toEqual([[source, hint]]);
    expect(appended.received).toEqual([]);
    first.Dispose();
    replacement.Dispose();
    appended.Dispose();
  });
  it("Forward and ForAllListeners include appends and preserve original source", /** Tests dynamic loop bounds and early stop. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      original = new SfxBroadcaster(),
      first = new Recorder(),
      last = new Recorder();
    first.StartListening(source);
    first.action = /** Appends during Forward. @returns Nothing. */ () =>
      last.StartListening(source, DuplicateHandling.Prevent);
    const hint = new SfxHint();
    friend(source).Forward(original, hint);
    expect(last.received).toEqual([[original, hint]]);
    first.EndListening(source);
    const added = new SfxListener(),
      visited: SfxListener[] = [];
    source.ForAllListeners(
      /** Appends one native slot. @param listener - Live listener. @returns Whether stop. */ (
        listener,
      ) => {
        visited.push(listener);
        added.StartListening(source, DuplicateHandling.Prevent);
        return false;
      },
    );
    expect(visited).toEqual([last]); // append reused an already visited hole
    added.EndListening(source);
    const tail = new SfxListener();
    source.ForAllListeners(
      /** Appends beyond initial length after consuming hole. @param listener - Live listener. @returns Whether stop. */ (
        listener,
      ) => {
        visited.push(listener);
        added.StartListening(source, DuplicateHandling.Prevent);
        tail.StartListening(source, DuplicateHandling.Prevent);
        return false;
      },
    );
    expect(visited).toEqual([last, last, tail]);
    visited.length = 0;
    source.ForAllListeners(
      /** Stops immediately. @param listener - Live listener. @returns True. */ (listener) => {
        visited.push(listener);
        return true;
      },
    );
    expect(visited).toEqual([added]);
    last.Dispose();
    added.Dispose();
    tail.Dispose();
  });
  it("sends Dying while still registered, then detaches every duplicate", /** Tests destructor order with callback removal. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      other = new SfxBroadcaster(),
      first = new Recorder(),
      remaining = new Recorder();
    first.StartListening(source);
    remaining.StartListening(source);
    remaining.StartListening(source, DuplicateHandling.Allow);
    remaining.StartListening(other);
    first.action =
      /** Observes membership before self-detachment. @param current - Dying source. @param hint - Dying hint. @returns Nothing. */ (
        current,
        hint,
      ) => {
        expect(hint.GetId()).toBe(SfxHintId.Dying);
        expect(first.IsListening(current)).toBe(true);
        first.EndListening(current);
      };
    remaining.action =
      /** Confirms all duplicates still registered during notification. @param current - Dying source. @returns Nothing. */ (
        current,
      ) => {
        expect(remaining.IsListening(current)).toBe(true);
      };
    source.Dispose();
    expect(first.GetBroadcasterCount()).toBe(0);
    expect(remaining.GetBroadcasterCount()).toBe(1);
    expect(remaining.GetBroadcasterJOE(0)).toBe(other);
    expect(remaining.received).toHaveLength(2);
    delete remaining.action;
    remaining.Dispose();
    new SfxBroadcaster().Dispose();
  });
  it("preserves right/left neighbor removal and LIFO slot reuse", /** Tests original removal fast paths. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      listeners = Array.from(
        { length: 5 },
        /** Creates listener. @returns Listener. */ () => new SfxListener(),
      );
    for (const listener of listeners) listener.StartListening(source);
    (listeners[1] as SfxListener).EndListening(source);
    (listeners[2] as SfxListener).EndListening(source);
    (listeners[3] as SfxListener).EndListening(source);
    (listeners[0] as SfxListener).EndListening(source);
    (listeners[4] as SfxListener).EndListening(source);
    for (const listener of listeners) listener.StartListening(source);
    const order: SfxListener[] = [];
    source.ForAllListeners(
      /** Captures slot order. @param listener - Listener. @returns False. */ (listener) => {
        order.push(listener);
        return false;
      },
    );
    expect(order).toEqual([listeners[1], listeners[4], listeners[3], listeners[2], listeners[0]]);
    for (const listener of listeners) listener.Dispose();
    const left = new SfxBroadcaster(),
      a = new SfxListener(),
      b = new SfxListener(),
      c = new SfxListener();
    a.StartListening(left);
    b.StartListening(left);
    c.StartListening(left);
    b.EndListening(left);
    a.EndListening(left);
    c.EndListening(left);
    expect(left.GetListenerCount()).toBe(0);
  });
  it("detaches a source appended during Dying even when initial delivery bound excludes it", /** Tests the destructor's second live-bound loop. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      first = new Recorder(),
      appended = new Recorder();
    first.StartListening(source);
    first.action = /** Adds beyond the initial Dying broadcast length. @returns Nothing. */ () =>
      appended.StartListening(source);
    source.Dispose();
    expect(appended.received).toEqual([]);
    expect(appended.IsListening(source)).toBe(false);
    expect(first.IsListening(source)).toBe(false);
  });
  it("converts broadcaster count to the original sal_uInt16 return type", /** Tests the native narrowing boundary with allowed duplicate subscriptions. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      listener = new SfxListener();
    for (let i = 0; i < 65536; ++i) listener.StartListening(source, DuplicateHandling.Allow);
    expect(source.GetListenerCount()).toBe(65536);
    expect(listener.GetBroadcasterCount()).toBe(0);
    listener.EndListening(source);
    expect(listener.GetBroadcasterCount()).toBe(65535);
    listener.Dispose();
    expect(source.HasListeners()).toBe(false);
  });
  it("keeps native base flags and assertion preconditions explicit", /** Tests defined host bindings for native assertions. @returns Nothing. */ () => {
    const source = new SfxBroadcaster(),
      listener = new SfxListener();
    expect(source.IsSfxStyleSheet()).toBe(false);
    expect(listener.IsSdrView()).toBe(false);
    expect(listener.IsSwXStyle()).toBe(false);
    expect(
      /** Violates native membership assertion. @returns Nothing. */ () =>
        listener.Notify(source, new SfxHint()),
    ).toThrow("registered broadcaster");
    expect(
      /** Violates private removal precondition. @returns Nothing. */ () =>
        friend(source).RemoveListener(listener),
    ).toThrow("registered listener");
    listener.StartListening(source);
    source.Broadcast(new SfxHint());
    listener.Dispose();
  });
});
