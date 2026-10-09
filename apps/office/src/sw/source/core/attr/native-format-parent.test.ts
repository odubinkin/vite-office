/** @fileoverview Verifies native SwFormat root fallback and cycle rejection on original format, item-set and client identities. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwClient, type SwModify } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatVertOrient } from "../../../inc/fmtornt";

/** Borrows original registrations without graph copies. @param format - Native owner. @returns Actual clients. */
function clients(format: SwModify): unknown[] {
  const result: unknown[] = [];
  format.ForAllListeners(
    /** Collects a registered original client. @param client - Native client. @returns Continue flag. */
    (client) => {
      result.push(client);
      return false;
    },
  );
  return result;
}

it("omitted parent returns to the existing root while retaining direct items and original client identity", /** Checks inherited source values, no detached substitute and exactly one accepted notification. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = doc.GetDfltFrameFormat(),
    parent = doc.MakeTableBoxFormat(),
    child = doc.MakeTableBoxFormat(),
    peer = doc.MakeTableBoxFormat();
  root.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Minimum, 3000, 480));
  parent.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 6000, 720));
  child.SetDerivedFrom(parent);
  peer.SetDerivedFrom(parent);
  child.SetFormatAttr(new SwFormatVertOrient(240, 3, 7));
  const set = child.GetAttrSet(),
    item = child.GetVertOrient(),
    hints: SwModelHint[] = [],
    observer = new SwClient(
      /** Records original child hints. @param source - Actual owner. @param hint - Accepted hint. @returns Nothing. */
      (source, hint) => {
        expect(source).toBe(child);
        hints.push(hint);
      },
    );
  observer.RegisterToModify(child);
  const before = clients(child),
    revision = doc.GetDocumentStateManager().GetModelRevision();
  try {
    expect(child.GetFrameSize()).toBe(parent.GetFrameSize());
    expect(child.SetDerivedFrom()).toBe(true);
    expect(child.DerivedFrom()).toBe(root);
    expect(child.GetRegisteredIn()).toBe(root);
    expect(child.GetAttrSet()).toBe(set);
    expect(set.GetParent()).toBe(root.GetAttrSet());
    expect(child.GetVertOrient()).toBe(item);
    expect(set.Count()).toBe(1);
    expect(child.GetFrameSize()).toBe(root.GetFrameSize());
    expect([child.GetFrameSize().GetWidth(), child.GetFrameSize().GetHeight()]).toEqual([
      3000, 480,
    ]);
    expect(clients(child)).toEqual(before);
    expect(clients(parent)).not.toContain(child);
    expect(clients(parent)).toContain(peer);
    expect(clients(root)).toContain(child);
    expect(hints).toEqual([{ kind: "format-inheritance-changed", formatId: child.GetName() }]);
    expect(child.SetDerivedFrom(undefined)).toBe(false);
    expect(child.SetDerivedFrom(root)).toBe(false);
    expect(hints).toHaveLength(1);
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    parent.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 9000, 960));
    expect(child.GetFrameSize().GetHeight()).toBe(480);
    expect(peer.GetFrameSize().GetHeight()).toBe(960);
    expect(hints).toHaveLength(1);
    root.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Minimum, 3000, 600));
    expect(child.GetFrameSize().GetHeight()).toBe(600);
    expect(child.GetVertOrient()).toBe(item);
    expect(hints).toHaveLength(2);
  } finally {
    observer.Dispose();
    doc.Dispose();
  }
});

it("self and descendant proposals return false without changing any original inheritance edge", /** Checks transitive rejection before registration, item mutation or notification. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = doc.GetDfltFrameFormat(),
    parent = doc.MakeTableBoxFormat(),
    child = doc.MakeTableBoxFormat(),
    leaf = doc.MakeTableBoxFormat();
  child.SetDerivedFrom(parent);
  leaf.SetDerivedFrom(child);
  parent.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 6000, 720));
  const owners = [root, parent, child, leaf],
    registrations = owners.map(clients),
    hints: SwModelHint[] = [],
    observers = owners.map(
      /** Observes every original owner. @param owner - Native format. @returns Registered client. */
      (owner) => {
        const observer = new SwClient(
          /** Records any rejected mutation leak. @param source - Original source. @param hint - Native hint. @returns Nothing. */
          (_source, hint) => hints.push(hint),
        );
        observer.RegisterToModify(owner);
        return observer;
      },
    ),
    revision = doc.GetDocumentStateManager().GetModelRevision();
  try {
    for (const [owner, proposed] of [
      [root, leaf],
      [parent, leaf],
      [child, leaf],
      [leaf, leaf],
    ] as const) {
      expect(owner.SetDerivedFrom(proposed)).toBe(false);
    }
    expect(
      owners.map(
        /** Reads original parent edges. @param owner - Native format. @returns Actual parent. */
        (owner) => owner.DerivedFrom(),
      ),
    ).toEqual([undefined, root, parent, child]);
    expect(root.GetRegisteredIn()).toBeUndefined();
    expect(root.GetAttrSet().GetParent()).toBeUndefined();
    for (const [owner, expectedParent] of [
      [parent, root],
      [child, parent],
      [leaf, child],
    ] as const) {
      expect(owner.GetRegisteredIn()).toBe(expectedParent);
      expect(owner.GetAttrSet().GetParent()).toBe(expectedParent.GetAttrSet());
      expect(owner.GetFrameSize().GetHeight()).toBe(720);
    }
    expect(owners.map(clients)).toEqual(
      registrations.map(
        /** Includes only the deliberately added observers. @param before - Prior clients. @param index - Owner ordinal. @returns Original registration list. */
        (before, index) => [...before, observers[index]],
      ),
    );
    expect(hints).toEqual([]);
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  } finally {
    for (const observer of observers) observer.Dispose();
    doc.Dispose();
  }
});

it("explicit base-format name broadcast and parent reset retain distinct accepted mutation boundaries", /** Checks a real base format notification, default no-op and original root ownership. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = doc.GetDfltFrameFormat(),
    parent = new SwFrameFormat(doc.GetAttrPool(), "Named parent", undefined, root),
    child = new SwFrameFormat(doc.GetAttrPool(), "Named child", undefined, parent),
    hints: SwModelHint[] = [],
    observer = new SwClient(
      /** Captures original base-format document hints. @param source - Document owner. @param hint - Native hint. @returns Nothing. */
      (source, hint) => {
        expect(source).toBe(doc.GetDocumentStateManager());
        hints.push(hint);
      },
    );
  observer.RegisterToModify(doc.GetDocumentStateManager());
  try {
    child.SetFormatName("Renamed child", true);
    expect(child.DerivedFrom()).toBe(parent);
    expect(child.GetRegisteredIn()).toBe(parent);
    expect(child.SetDerivedFrom()).toBe(true);
    expect(child.GetName()).toBe("Renamed child");
    expect(child.DerivedFrom()).toBe(root);
    expect(child.GetAttrSet().GetParent()).toBe(root.GetAttrSet());
    expect(child.SetDerivedFrom()).toBe(false);
    expect(root.SetDerivedFrom(child)).toBe(false);
    expect(hints).toEqual([
      { kind: "format-inheritance-changed", formatId: "Renamed child" },
      { kind: "format-inheritance-changed", formatId: "Renamed child" },
    ]);
  } finally {
    observer.Dispose();
    child.DisposeModify();
    parent.DisposeModify();
    doc.Dispose();
  }
});

it("parentless default reset is a silent no-op and fallback resolves the actual independent tree root", /** Checks own-root no-op and multi-level root lookup rather than a fabricated document default. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = new SwFrameFormat(doc.GetAttrPool(), "Independent root"),
    parent = new SwFrameFormat(doc.GetAttrPool(), "Independent parent", undefined, root),
    child = new SwFrameFormat(doc.GetAttrPool(), "Independent child", undefined, parent),
    revision = doc.GetDocumentStateManager().GetModelRevision();
  try {
    expect(root.SetDerivedFrom()).toBe(false);
    expect(root.SetDerivedFrom(root)).toBe(false);
    expect(root.DerivedFrom()).toBeUndefined();
    expect(root.GetRegisteredIn()).toBeUndefined();
    expect(root.GetAttrSet().GetParent()).toBeUndefined();
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(child.SetDerivedFrom()).toBe(true);
    expect(child.DerivedFrom()).toBe(root);
    expect(child.GetRegisteredIn()).toBe(root);
    expect(child.GetAttrSet().GetParent()).toBe(root.GetAttrSet());
    expect(child.DerivedFrom()).not.toBe(doc.GetDfltFrameFormat());
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision + 1);
    expect(child.SetDerivedFrom()).toBe(false);
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision + 1);
  } finally {
    child.DisposeModify();
    parent.DisposeModify();
    root.DisposeModify();
    doc.Dispose();
  }
});
