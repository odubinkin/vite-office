/** @fileoverview Verifies native format construction establishes original inheritance without invoking a document mutation. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFormat } from "./format";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwClient, type SwModify } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";
/** Reads actual registered original clients. @param format - Native broadcaster. @returns Original client identities. */
function clients(format: SwModify): unknown[] {
  const result: unknown[] = [];
  format.ForAllListeners(
    /** Captures native registration. @param client - Original client. @returns Continue flag. */ (
      client,
    ) => {
      result.push(client);
      return false;
    },
  );
  return result;
}
it("native format constructor registers original inheritance without document mutation", /** Checks actual parent, item set, inherited values and source notification contracts. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parent = doc.GetDfltFrameFormat();
  parent.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Minimum, 6000, 720));
  parent.SetFormatAttr(new SwFormatVertOrient(480, 3, 7));
  const revision = doc.GetDocumentStateManager().GetModelRevision(),
    before = clients(parent),
    hints: SwModelHint[] = [];
  const observer = new SwClient(
    /** Records actual document hints. @param source - Document modify. @param hint - Native hint. @returns Nothing. */ (
      source,
      hint,
    ) => {
      expect(source).toBe(doc.GetDocumentStateManager());
      hints.push(hint);
    },
  );
  observer.RegisterToModify(doc.GetDocumentStateManager());
  const mutate = vi.spyOn(SwFormat.prototype, "SetDerivedFrom");
  const format = new SwFrameFormat(doc.GetAttrPool(), "Constructed", undefined, parent);
  try {
    expect(mutate).not.toHaveBeenCalled();
    expect(format.GetRegisteredIn()).toBe(parent);
    expect(format.DerivedFrom()).toBe(parent);
    expect(format.GetAttrSet().GetParent()).toBe(parent.GetAttrSet());
    expect(format.GetAttrSet()).not.toBe(parent.GetAttrSet());
    expect(format.GetAttrSet().Count()).toBe(0);
    expect(format.GetFrameSize()).toBe(parent.GetFrameSize());
    expect([format.GetFrameSize().GetWidth(), format.GetFrameSize().GetHeight()]).toEqual([
      6000, 720,
    ]);
    expect(format.GetVertOrient()).toBe(parent.GetVertOrient());
    expect(clients(parent)).toEqual([...before, format]);
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(hints).toEqual([]);
  } finally {
    mutate.mockRestore();
    observer.Dispose();
    format.DisposeModify();
  }
  expect(clients(parent)).toEqual(before);
});
it("native parentless construction retains automatic defaults and independent item ownership", /** Checks literal defaults and no fabricated inheritance registration. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    revision = doc.GetDocumentStateManager().GetModelRevision();
  const first = new SwFrameFormat(doc.GetAttrPool(), "First"),
    second = new SwFrameFormat(doc.GetAttrPool(), "Second");
  try {
    expect(first.GetName()).toBe("First");
    expect(first.IsAuto()).toBe(true);
    expect(first.DerivedFrom()).toBeUndefined();
    expect(first.GetRegisteredIn()).toBeUndefined();
    expect(first.GetAttrSet().GetParent()).toBeUndefined();
    expect(first.GetAttrSet().Count()).toBe(0);
    expect(first.GetAttrSet()).not.toBe(second.GetAttrSet());
    expect([first.GetFrameSize().GetWidth(), first.GetFrameSize().GetHeight()]).toEqual([0, 0]);
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  } finally {
    first.DisposeModify();
    second.DisposeModify();
  }
});
it("native constructor rejects a foreign pool before registering a partially constructed client", /** Checks the existing ownership guard without a leaked parent registration or model delta. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    foreign = new SwDoc(),
    parent = foreign.GetDfltFrameFormat(),
    before = clients(parent),
    revision = doc.GetDocumentStateManager().GetModelRevision(),
    otherRevision = foreign.GetDocumentStateManager().GetModelRevision();
  expect(
    /** Attempts invalid cross-document inheritance. @returns Constructed native format. */ () =>
      new SwFrameFormat(doc.GetAttrPool(), "Foreign", undefined, parent),
  ).toThrow("SwFormat parent belongs to another pool.");
  expect(clients(parent)).toEqual(before);
  expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  expect(foreign.GetDocumentStateManager().GetModelRevision()).toBe(otherRevision);
});
it("native line and box allocation only links inheritance while later explicit parent changes stay observable", /** Checks real document factories and the distinct explicit mutation boundary. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parent = doc.GetDfltFrameFormat(),
    revision = doc.GetDocumentStateManager().GetModelRevision(),
    before = clients(parent),
    row = doc.MakeTableLineFormat(),
    box = doc.MakeTableBoxFormat();
  const alternate = new SwFrameFormat(doc.GetAttrPool(), "Alternate", undefined, parent);
  alternate.SetFormatAttr(new SwFormatVertOrient(720, 2, 9));
  const hints: SwModelHint[] = [],
    observer = new SwClient(
      /** Captures later explicit model deltas. @param source - Original document broadcaster. @param hint - Native hint. @returns Nothing. */ (
        source,
        hint,
      ) => {
        expect(source).toBe(doc.GetDocumentStateManager());
        hints.push(hint);
      },
    );
  observer.RegisterToModify(doc.GetDocumentStateManager());
  const nativeHints: SwModelHint[] = [];
  const nativeObserver = new SwClient(
    /** Captures the original box notification channel. @param source - Original format. @param hint - Native hint. @returns Nothing. */ (
      source,
      hint,
    ) => {
      expect(source).toBe(box);
      nativeHints.push(hint);
    },
  );
  nativeObserver.RegisterToModify(box);
  try {
    expect(row.GetAttrSet().GetParent()).toBe(parent.GetAttrSet());
    expect(box.GetAttrSet().GetParent()).toBe(parent.GetAttrSet());
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(box.SetDerivedFrom(parent)).toBe(false);
    expect(hints).toEqual([]);
    expect(box.SetDerivedFrom(alternate)).toBe(true);
    expect(box.GetRegisteredIn()).toBe(alternate);
    expect(box.GetAttrSet().GetParent()).toBe(alternate.GetAttrSet());
    expect(box.GetVertOrient()).toBe(alternate.GetVertOrient());
    expect(nativeHints).toEqual([{ kind: "format-inheritance-changed", formatId: box.GetName() }]);
    expect(hints).toEqual([]);
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(alternate.SetDerivedFrom(undefined)).toBe(false);
    expect(alternate.GetRegisteredIn()).toBe(parent);
    expect(alternate.GetAttrSet().GetParent()).toBe(parent.GetAttrSet());
    expect(hints).toEqual([]);
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(clients(parent)).not.toContain(box);
    expect(clients(alternate)).toEqual([box]);
  } finally {
    observer.Dispose();
    nativeObserver.Dispose();
    row.DisposeModify();
    box.DisposeModify();
    alternate.DisposeModify();
  }
  expect(clients(parent)).toEqual(before);
});
