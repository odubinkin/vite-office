/** @fileoverview Verifies upstream-shaped broadcaster/listener and SwModify registration invariants. */

import { describe, expect, it } from "vitest";

import { SwClient, SwModify } from "../../../sw/inc/calbck";
import { hasSwModelHintKind, type SwModelHint } from "../../../sw/inc/hints";
import { SfxBroadcaster, type SfxHint, type SfxListenerTarget } from "./broadcast";
import { SfxListener } from "./listener";

/** Minimal typed hint used by notification fixtures. */
interface TestHint extends SfxHint {
  readonly kind: "changed";
  readonly value: number;
}

/** Captures typed hints from any number of broadcasters. */
class CapturingListener extends SfxListener<TestHint> {
  public readonly values: number[] = [];

  /** Records one typed hint. @param _broadcaster - Emitting source. @param hint - Typed hint. @returns Nothing. */
  public override Notify(_broadcaster: SfxBroadcaster<TestHint>, hint: TestHint): void {
    this.values.push(hint.value);
  }
}

describe("Sfx notification graph", /** Registers notification tests. @returns Nothing. */ () => {
  it("maintains reciprocal M:N registrations and safe destruction", /** Verifies reciprocal registration. @returns Nothing. */ () => {
    const first = new SfxBroadcaster<TestHint>();
    const second = new SfxBroadcaster<TestHint>();
    const listener = new CapturingListener();
    expect(listener.StartListening(first)).toBe(true);
    expect(listener.StartListening(first)).toBe(false);
    expect(listener.StartListening(second)).toBe(true);
    first.Broadcast({ kind: "changed", value: 1 });
    second.Broadcast({ kind: "changed", value: 2 });
    expect(listener.values).toEqual([1, 2]);
    first.PrepareForDestruction();
    expect(first.IsDisposed()).toBe(true);
    expect(listener.HasBroadcaster()).toBe(true);
    listener.EndListeningAll();
    expect(listener.HasBroadcaster()).toBe(false);
    expect(second.HasListeners()).toBe(false);
    expect(
      /** Attempts to attach to a disposed broadcaster. @returns Invalid registration. */ () =>
        listener.StartListening(first),
    ).toThrow("disposed");
    listener.EndListening(first);
    first.Broadcast({ kind: "changed", value: 3 });
    first.PrepareForDestruction();
  });

  it("skips a listener removed during a stable broadcast snapshot", /** Verifies upstream mutation-safe iteration. @returns Nothing. */ () => {
    const broadcaster = new SfxBroadcaster<TestHint>();
    const values: number[] = [];
    const removed: SfxListenerTarget<TestHint> = {
      BroadcasterDying: /** Ignores destruction. @returns Nothing. */ () => undefined,
      Notify:
        /** Records delivery. @param _source - Source. @param hint - Test hint. @returns New length. */ (
          _source,
          hint,
        ) => values.push(hint.value),
    };
    const removing: SfxListenerTarget<TestHint> = {
      BroadcasterDying: /** Ignores destruction. @returns Nothing. */ () => undefined,
      Notify: /** Removes the following listener. @returns Nothing. */ () => {
        broadcaster.RemoveListener(removed);
      },
    };
    expect(broadcaster.AddListener(removing)).toBe(true);
    expect(broadcaster.AddListener(removing)).toBe(false);
    expect(broadcaster.AddListener(removed)).toBe(true);
    broadcaster.Broadcast({ kind: "changed", value: 1 });
    expect(values).toEqual([]);
  });

  it("aggregates nested SwModify changes into one bounded transaction", /** Verifies aggregation and disposal. @returns Nothing. */ () => {
    const source = new SwModify();
    const hints: SwModelHint[] = [];
    const client = new SwClient(
      /** Captures one Writer hint. @param _source - Emitting source. @param hint - Typed hint. @returns New array length. */ (
        _source,
        hint,
      ) => hints.push(hint),
    );
    client.RegisterToModify(source);
    source.RunNotificationTransaction(
      /** Emits a nested notification transaction. @returns Nothing. */ () => {
        source.CallSwClientNotify({ index: 1, kind: "node-inserted", nodeId: "p-1" });
        source.RunNotificationTransaction(
          /** Emits one nested model hint. @returns Nothing. */ () => {
            source.CallSwClientNotify({ kind: "node-content-changed", nodeId: "p-1" });
          },
        );
      },
    );
    expect(hints).toEqual([
      {
        hints: [
          { index: 1, kind: "node-inserted", nodeId: "p-1" },
          { kind: "node-content-changed", nodeId: "p-1" },
        ],
        kind: "model-transaction",
      },
    ]);
    source.DisposeModify();
    expect(client.GetRegisteredIn()).toBeUndefined();
    expect(source.HasListeners()).toBe(false);
  });

  it("propagates SwModify parent hints and safely rebinds clients", /** Covers atomic and transactional parent propagation plus defensive identities. @returns Nothing. */ () => {
    const first = new SwModify();
    const second = new SwModify();
    const child = new SwModify();
    const hints: SwModelHint[] = [];
    const client = new SwClient(
      /** Captures relayed hints. @param _source - Child source. @param hint - Typed hint. @returns New length. */ (
        _source,
        hint,
      ) => hints.push(hint),
    );
    child.RegisterToModify(first);
    child.RegisterToModify(first);
    client.RegisterToModify(child);
    client.RegisterToModify(child);
    first.CallSwClientNotify({ kind: "node-content-changed", nodeId: "p-1" });
    first.RunNotificationTransaction(
      /** Emits a parent transaction. @returns Nothing. */ () =>
        first.CallSwClientNotify({ kind: "numbering-changed", ruleName: "list" }),
    );
    child.RunNotificationTransaction(
      /** Nests a parent transaction inside a child transaction. @returns Nothing. */ () =>
        first.RunNotificationTransaction(
          /** Emits a nested parent hint. @returns Nothing. */ () =>
            first.CallSwClientNotify({ kind: "attribute-set-changed", nodeId: "p-1" }),
        ),
    );
    child.Notify(second, { kind: "document-state-changed" });
    client.Notify(second, { kind: "document-state-changed" });
    child.BroadcasterDying(second);
    client.BroadcasterDying(second);
    child.RegisterToModify(second);
    first.DisposeModify();
    second.DisposeModify();
    expect(
      hints.map(
        /** Projects one hint discriminator. @param hint - Typed hint. @returns Hint kind. */ (
          hint,
        ) => hint.kind,
      ),
    ).toEqual(["node-content-changed", "model-transaction", "model-transaction"]);
    child.DisposeModify();
    expect(client.GetRegisteredIn()).toBeUndefined();
    client.Dispose();

    const silentSource = new SwModify();
    const silentClient = new SwClient();
    silentClient.RegisterToModify(silentSource);
    silentSource.CallSwClientNotify({ kind: "document-state-changed" });
    silentSource.DisposeModify();
    expect(silentClient.GetRegisteredIn()).toBeUndefined();
  });

  it("finds atomic kinds in atomic and transactional hints", /** Covers the typed hint predicate. @returns Nothing. */ () => {
    expect(hasSwModelHintKind({ kind: "document-disposed" }, "document-disposed")).toBe(true);
    expect(hasSwModelHintKind({ kind: "document-disposed" }, "node-removed")).toBe(false);
    const transaction: SwModelHint = {
      hints: [{ index: 1, kind: "node-removed", nodeId: "p-1" }],
      kind: "model-transaction",
    };
    expect(hasSwModelHintKind(transaction, "node-removed")).toBe(true);
    expect(hasSwModelHintKind(transaction, "node-inserted")).toBe(false);
  });
});
