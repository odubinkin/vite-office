/** @fileoverview Verifies upstream-shaped broadcaster/listener and SwModify registration invariants. */

import { describe, expect, it } from "vitest";

import { SwClient, SwModify } from "../../../sw/inc/calbck";
import { ObjectDyingHint, hasSwModelHintKind, type SwModelHint } from "../../../sw/inc/hints";
describe("Writer notification graph", /** Registers notification tests. @returns Nothing. */ () => {
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
    expect(source.HasWriterListeners()).toBe(false);
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
    child.CheckRegistration(new ObjectDyingHint(second));
    client.CheckRegistration(new ObjectDyingHint(second));
    child.RegisterToModify(second);
    first.DisposeModify();
    second.DisposeModify();
    expect(
      hints.map(
        /** Projects one hint discriminator. @param hint - Typed hint. @returns Hint kind. */ (
          hint,
        ) => hint.kind,
      ),
    ).toEqual(["object-dying"]);
    expect(hints[0]).toEqual(new ObjectDyingHint(second));
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

  it("reparents Writer clients and child modifies when an intermediate source dies", /** Verifies upstream death reparenting. @returns Nothing. */ () => {
    const root = new SwModify();
    const intermediate = new SwModify();
    const child = new SwModify();
    const directClient = new SwClient();
    const childClient = new SwClient();
    intermediate.RegisterToModify(root);
    child.RegisterToModify(intermediate);
    directClient.RegisterToModify(intermediate);
    childClient.RegisterToModify(child);

    intermediate.DisposeModify();

    expect(directClient.GetRegisteredIn()).toBe(root);
    expect(child.GetRegisteredIn()).toBe(root);
    root.CallSwClientNotify({ kind: "document-state-changed" });
    child.DisposeModify();
    root.DisposeModify();
    expect(childClient.GetRegisteredIn()).toBeUndefined();
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
