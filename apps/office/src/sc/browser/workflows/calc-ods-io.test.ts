/** @fileoverview Real Calc ODS primary bytes,shared IndexedDB and autosave cadence/race integration. */
import type { ScPatternAttr } from "../../inc/patattr";
import { ScInputMode } from "../../inc/global";
import { afterEach, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { IndexedDbDocumentStore } from "../../../framework/browser/storage/document-store";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { CalcViewController } from "../controller/calc-view-controller";
import { createCalcSession } from "../composition/calc-module";
import { ScDocShell } from "../../source/ui/docshell/docsh";
import { ScAddress } from "../../inc/address";
import { readOdsDocument } from "../../source/filter/xml/xmlwrap";
import {
  autosaveCalc,
  createCalcDocumentStore,
  createCalcAutosave,
  saveCalcAsBrowserCopy,
  openBrowserCalcDocument,
  overwriteBrowserCalcDocument,
  getAutomaticCalcTitle,
  hasCalcContent,
} from "./calc-ods-io";

afterEach(
  /** Restores browser clock and globals. @returns Nothing. */ () => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  },
);
/** Creates a real isolated primary package store. @returns Store. */
function store(): IndexedDbDocumentStore {
  return new IndexedDbDocumentStore(crypto.randomUUID(), new IDBFactory());
}

it("shares Writer naming/empty rules and stores actual ODS bytes before adopting primary identity", /** Uses real scalar owners and package filters. @returns Completion. */ async () => {
  const c = new CalcViewController(),
    shell = c.shell,
    db = store();
  expect(hasCalcContent(shell.GetDocument())).toBe(false);
  expect(getAutomaticCalcTitle(shell.GetDocument())).toBeUndefined();
  expect(await autosaveCalc(shell, db)).toBe(false);
  await expect(saveCalcAsBrowserCopy(shell, db, " ")).rejects.toThrow(/name/);
  await expect(saveCalcAsBrowserCopy(shell, db, "Empty")).rejects.toThrow(/Empty/);
  await expect(
    overwriteBrowserCalcDocument(shell, db, {
      id: "missing",
      title: "Empty",
      version: 0,
    }),
  ).rejects.toThrow(/Empty/);
  c.EnterString("First");
  expect(await autosaveCalc(shell, db)).toBe(false);
  await expect(
    overwriteBrowserCalcDocument(shell, db, {
      id: "missing",
      title: "Copy",
      version: 0,
    }),
  ).rejects.toThrow(/two words/);
  c.Select(1, 0);
  c.EnterString("second");
  expect(getAutomaticCalcTitle(shell.GetDocument())).toBe("First second");
  expect(await autosaveCalc(shell, db)).toBe(true);
  expect(shell.GetTitle()).toBe("First second");
  const id = shell.GetDocumentId(),
    record = await db.load(id);
  if (record === undefined) throw new Error("Expected committed ODS record.");
  expect(record.content.format).toBe("xml");
  expect(record.content.files["content.xml"]).toContain("office:document-content");
  const loaded = await readOdsDocument(record.content);
  expect(hasCalcContent(loaded)).toBe(true);
  expect(shell.IsModified()).toBe(false);
  expect(shell.GetMedium().kind).toBe("primary");
  c.Select(2, 0);
  c.EnterString("=2*3");
  expect(await autosaveCalc(shell, db)).toBe(true);
  expect(shell.GetDocumentId()).toBe(id);
  shell.Rename(" Renamed ");
  expect(shell.Rename("Renamed")).toBe(false);
  await autosaveCalc(shell, db);
  expect((await db.load(id))?.title).toBe("Renamed");
  const copy = await saveCalcAsBrowserCopy(shell, db, "Independent");
  expect(copy).not.toBe(id);
  expect(await openBrowserCalcDocument(shell, db, "absent")).toBe(false);
  c.StartInput(ScInputMode.SC_INPUT_TABLE, "discard me");
  expect(await openBrowserCalcDocument(shell, db, id)).toBe(true);
  expect(c.mode).toBe(ScInputMode.SC_INPUT_NONE);
  expect(c.Address()).toBe("A1");
  expect(shell.GetDocument().GetValue(new ScAddress(2, 0, 0))).toBe(6);
  expect(shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(c.viewData.GetDocument()).toBe(shell.GetDocument());
  c.EnterString("Changed value");
  const target = await db.load(copy);
  if (target === undefined) throw new Error("Expected copy.");
  await overwriteBrowserCalcDocument(shell, db, target);
  expect(shell.GetDocumentId()).toBe(copy);
  expect(await db.load(id)).toBeUndefined();
  c.Close();
  new ScDocShell(loaded).Close();
});

it("preserves imported identity,explicit titles,multi-sheet content and storage failures", /** Actual primary/input media exercise each persistence route. @returns Completion. */ async () => {
  const c = new CalcViewController(),
    shell = c.shell,
    db = store();
  c.EnterString("  ");
  expect(hasCalcContent(shell.GetDocument())).toBe(false);
  c.InsertSheet();
  c.EnterString("Two words");
  shell.Rename("Chosen title");
  await autosaveCalc(shell, db);
  expect(shell.GetTitle()).toBe("Chosen title");
  const bytes = shell.SerializeOds();
  await shell.Open(bytes, createDocument({ id: "imported", suiteId: "calc", title: "Imported" }));
  expect(shell.GetMedium().kind).toBe("input");
  expect(await autosaveCalc(shell, db, true)).toBe(true);
  expect(shell.GetDocumentId()).toBe("imported");
  expect(shell.GetMedium().kind).toBe("primary");
  await shell.Open(bytes, createDocument({ id: "other", suiteId: "calc", title: "Other" }), {
    kind: "primary",
    name: "Previous",
    storageKey: "different",
  });
  expect(await autosaveCalc(shell, db, true)).toBe(true);
  expect(shell.GetMedium().name).toBe("Other");
  const before = shell.GetDocumentId();
  await expect(saveCalcAsBrowserCopy(shell, db, "Chosen title")).rejects.toThrow();
  expect(shell.GetDocumentId()).toBe(before);
  expect(shell.GetMedium().lastOperation.state).toBe("failed");
  c.Close();
});

it("uses the shared autosave capture policy with real Calc saves and explicit platform errors", /** Tests IME capture,source invalidation and stored bytes. @returns Completion. */ async () => {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  vi.setSystemTime(0);
  const c = new CalcViewController(),
    db = store(),
    target = new EventTarget(),
    auto = createCalcAutosave(c.shell, db, target as Document, Date.now);
  c.EnterString("Stored words");
  target.dispatchEvent(new Event("compositionstart"));
  await vi.advanceTimersByTimeAsync(11000);
  expect(await db.list()).toHaveLength(0);
  target.dispatchEvent(new Event("compositionend"));
  await vi.advanceTimersByTimeAsync(999);
  expect(await db.list()).toHaveLength(0);
  await vi.advanceTimersByTimeAsync(1);
  await auto.Flush();
  expect(await db.list()).toHaveLength(1);
  c.EnterString("Other words");
  vi.spyOn(db, "save").mockRejectedValueOnce(new Error("storage rejected"));
  await vi.advanceTimersByTimeAsync(10000);
  await vi.waitFor(
    /** Waits for real database transaction failure. @returns Assertion. */ () =>
      expect(c.shell.GetMedium().lastOperation.message).toBe("storage rejected"),
  );
  c.EnterString("More words");
  vi.spyOn(db, "save").mockRejectedValueOnce("platform rejected");
  await vi.advanceTimersByTimeAsync(10000);
  await vi.waitFor(
    /** Waits for real database transaction failure. @returns Assertion. */ () =>
      expect(c.shell.GetMedium().lastOperation.message).toBe("platform rejected"),
  );
  await auto.Flush();
  expect(c.shell.IsModified()).toBe(false);
  auto.Close();
  c.Close();
});

it("constructs suite-scoped production storage and owns its session scheduler", /** Tests real default and injected composition boundaries. @returns Completion. */ async () => {
  vi.stubGlobal("indexedDB", new IDBFactory());
  const db = createCalcDocumentStore(),
    session = createCalcSession(db);
  session.controller.EnterString("Primary document");
  if (session.autosave === undefined) throw new Error("Expected scheduler.");
  await session.autosave.Flush();
  expect(await db.list()).toHaveLength(1);
  session.Close();
  session.Close();
  const defaults = createCalcSession();
  expect(defaults.store).toBeDefined();
  defaults.Close();
});

it("autosaves font attributes on empty ranges in the same primary ODS and restores them through real open", /** Preserves Writer's existing visible-content/naming policy while testing empty styled cells inside a saved document. @returns Completion. */ async () => {
  const db = store(),
    session = createCalcSession(db),
    c = session.controller;
  c.EnterString("Font sample");
  c.Select(1, 2);
  c.MarkColumns();
  c.SetFontSize(18);
  await (session.autosave as NonNullable<typeof session.autosave>).Flush();
  const record = await db.load(c.shell.GetDocumentId());
  if (record === undefined) throw new Error("Expected primary font document");
  const loaded = await readOdsDocument(record.content);
  expect(
    (
      (loaded.GetPattern(new ScAddress(1, loaded.MaxRow(), 0)) as ScPatternAttr).GetItem(
        101,
      ) as import("../../../editeng/inc/fhgtitem").SvxFontHeightItem
    ).GetHeight(),
  ).toBe(360);
  expect(loaded.GetCellType(new ScAddress(1, 100, 0))).toBe(0);
  expect(c.shell.IsModified()).toBe(false);
  const reopened = new CalcViewController();
  expect(await openBrowserCalcDocument(reopened.shell, db, record.id)).toBe(true);
  reopened.Select(1, 20);
  expect(reopened.GetFontSize()).toBe(18);
  reopened.SetFontSize(24);
  expect(await autosaveCalc(reopened.shell, db)).toBe(true);
  const saved = await db.load(record.id);
  if (saved === undefined) throw new Error("Expected updated primary font document");
  const again = await readOdsDocument(saved.content);
  expect(
    (
      (again.GetPattern(new ScAddress(1, 20, 0)) as ScPatternAttr).GetItem(
        101,
      ) as import("../../../editeng/inc/fhgtitem").SvxFontHeightItem
    ).GetHeight(),
  ).toBe(480);
  loaded.DisposeAttributes();
  again.DisposeAttributes();
  reopened.Close();
  session.Close();
});
