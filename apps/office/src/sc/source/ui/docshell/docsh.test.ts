/** @fileoverview Atomic Calc ODS shell replacement,confirmed save generations and real undo boundaries. */
import { expect, it, vi } from "vitest";
import { ScXMLImportWrapper } from "../../filter/xml/xmlwrap";
import { CalcViewController } from "../../../browser/controller/calc-view-controller";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
/** Builds valid replacement state. @param title - Title. @returns State. */
function state(title = "Opened") {
  return createDocument({ id: crypto.randomUUID(), suiteId: "calc", title });
}
/** Creates a deferred source save completion. @returns Controls. */
function pending() {
  let resolve!: (value: { generation: number }) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<{ generation: number }>(
    /** Keeps a real asynchronous persistence boundary. @param yes - Resolve. @param no - Reject. @returns Nothing. */ (
      yes,
      no,
    ) => {
      resolve = yes;
      reject = no;
    },
  );
  return { promise, resolve, reject };
}

it("acknowledges only the captured generation and history position while later edits remain dirty", /** Source actions and actual ODS serialization are retained during deferred storage. @returns Completion. */ async () => {
  const c = new CalcViewController(),
    s = c.shell;
  c.EnterString("2");
  const gen = s.GetContentGeneration(),
    p = pending();
  const save = s.SaveAs(
    { kind: "primary", name: "First", storageKey: "first" },
    /** Defers real save acknowledgement. @returns Completion. */ () => p.promise,
  );
  c.EnterString("3");
  p.resolve({ generation: gen });
  await save;
  expect(s.IsModified()).toBe(true);
  expect(s.GetMedium().name).toBe("First");
  expect(s.Undo()).toBe(true);
  expect(s.IsModified()).toBe(false);
  expect(s.GetDocument().GetValue(new ScAddress())).toBe(2);
  s.Redo();
  expect(s.IsModified()).toBe(true);
  const next = s.GetContentGeneration();
  await s.Save(
    /** Confirms current bytes. @returns Save evidence. */ async () => ({ generation: next }),
  );
  expect(s.IsModified()).toBe(false);
  const doomed = pending(),
    generation = s.GetContentGeneration(),
    saveBranch = s.Save(
      /** Defers acknowledgement while history branches. @returns Completion. */ () =>
        doomed.promise,
    );
  s.Undo();
  c.EnterString("4");
  doomed.resolve({ generation });
  await saveBranch;
  expect(s.IsModified()).toBe(true);
  s.Undo();
  expect(s.IsModified()).toBe(true);
  c.Close();
});

it("rejects invalid destinations,evidence,late results and replacement races without adopting failed state", /** Preserves previous primary and model owners under actual asynchronous failures. @returns Completion. */ async () => {
  const c = new CalcViewController(),
    s = c.shell;
  c.EnterString("two words");
  await expect(
    s.Save(
      /** Uncalled invalid-medium callback. @returns Completion. */ async () => ({ generation: 0 }),
    ),
  ).rejects.toThrow(/Save As/);
  await expect(
    s.SaveAs(
      { kind: "input", name: "read-only", source: { kind: "external", reference: {} } },
      /** Uncalled invalid-medium callback. @returns Completion. */ async () => ({ generation: 0 }),
    ),
  ).rejects.toThrow(/confirmed writable/);
  const original = s.GetMedium();
  await expect(
    s.SaveAs(
      { kind: "primary", name: "Bad", storageKey: "bad" },
      /** Supplies mismatched adapter evidence. @returns Completion. */ async () => ({
        generation: 999,
      }),
    ),
  ).rejects.toThrow(/generation/);
  expect(s.GetMedium()).toBe(original);
  await expect(
    s.SaveAs(
      { kind: "primary", name: "Rejected", storageKey: "r" },
      /** Rejects platform write. @returns Completion. */ async () => {
        throw "denied";
      },
    ),
  ).rejects.toBe("denied");
  expect(s.GetMedium().lastOperation.message).toBe("denied");
  const delayed = pending(),
    gen = s.GetContentGeneration(),
    save = s.SaveAs(
      { kind: "primary", name: "Old", storageKey: "old" },
      /** Defers source completion. @returns Completion. */ () => delayed.promise,
    );
  s.ReplaceDocument(new ScDocument(), state(), { kind: "untitled", name: "New" });
  delayed.resolve({ generation: gen });
  await expect(save).rejects.toThrow(/no longer active/);
  expect(s.GetTitle()).toBe("Opened");
  const changed = pending(),
    start = s.GetContentGeneration(),
    late = s.SaveAs(
      { kind: "primary", name: "Late", storageKey: "late" },
      /** Defers until shell closure. @returns Completion. */ () => changed.promise,
    );
  c.Close();
  changed.resolve({ generation: start });
  await expect(late).rejects.toThrow(/Closed/);
});

it("loads candidates atomically,discards stale/cancelled imports and resets model/view/history together", /** Imports use the actual package wrapper and preserve live owner on failure. @returns Completion. */ async () => {
  const c = new CalcViewController(),
    s = c.shell;
  c.EnterString("=2*3");
  const bytes = s.SerializeOds(),
    initial = s.GetDocument();
  await expect(s.Open(new Uint8Array(), state())).rejects.toThrow();
  expect(s.GetDocument()).toBe(initial);
  await expect(
    s.Open(bytes, state(), undefined, {
      isCancelled: /** Cancels before import. @returns True. */ () => true,
    }),
  ).rejects.toThrow(/cancelled/);
  await s.Open(bytes, state());
  expect(s.GetDocument()).not.toBe(initial);
  expect(s.GetDocument().GetValue(new ScAddress())).toBe(6);
  const original = s.GetDocument(),
    pendingOpen = s.Open(bytes, state());
  c.EnterString("7");
  await expect(pendingOpen).rejects.toThrow(/cancelled|stale/);
  expect(s.GetDocument()).toBe(original);
  const first = s.Open(bytes, state("Stale")),
    second = s.Open(bytes, state("Latest"));
  await expect(first).rejects.toThrow(/cancelled|stale/);
  await second;
  expect(s.GetTitle()).toBe("Latest");
  expect(
    /** Rejects reusing the active graph. @returns Replacement. */ () =>
      s.ReplaceDocument(s.GetDocument(), state(), { kind: "untitled", name: "same" }),
  ).toThrow(/new Calc graph/);
  s.ReplaceDocument(
    new ScDocument(),
    { ...state(), isModified: true, lifecycle: "dirty" },
    { kind: "untitled", name: "Dirty" },
  );
  expect(s.GetUndoManager().IsAtSavePosition()).toBe(false);
  const importOds = ScXMLImportWrapper.prototype.Import;
  const filtered = vi.spyOn(ScXMLImportWrapper.prototype, "Import").mockImplementationOnce(
    /** Exercises an edit at the filter-completion/adoption boundary using the real import. @param this - Actual import wrapper. @param bytes - Package. @param options - Controls. @returns Completion. */
    async function (this: ScXMLImportWrapper, bytes, options) {
      await importOds.call(this, bytes, options);
      c.EnterString("9");
    },
  );
  await expect(s.Open(bytes, state())).rejects.toThrow(/stale/);
  filtered.mockRestore();
  const closeOpen = s.Open(bytes, state());
  c.Close();
  await expect(closeOpen).rejects.toThrow(/cancelled|Closed/);
});
