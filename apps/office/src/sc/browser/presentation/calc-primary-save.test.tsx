/** @fileoverview Mounted Calc primary Save and imported file persistence regressions. */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { IndexedDbDocumentStore } from "../../../framework/browser/storage/document-store";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { cellPresentation } from "../editor/cell-input";
import { ScInputMode } from "../../inc/global";
import { ScAddress } from "../../inc/address";
import { readOdsDocument } from "../../source/filter/xml/xmlwrap";
afterEach(
  /** Releases mounted sessions and mocks. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
  },
);
/** Requires a result from the actual tested operation. @param value - Result. @returns Present result. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Expected operation result.");
  return value;
}
/** Mounts the actual production workflow owners. @param session - Production session. @returns Mounted tree. */
function mount(session: ReturnType<typeof createCalcSession>) {
  return render(
    <CalcWorkbench
      controller={session.controller}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
}
it("commits in-progress cell input and forces primary storage with Cmd/Ctrl+S from any focused control", /** Proves real Flush rather than page Save or Save As. @returns Completion. */ async () => {
  const db = new IndexedDbDocumentStore(crypto.randomUUID(), new IDBFactory()),
    session = createCalcSession(db),
    c = session.controller;
  mount(session);
  act(
    /** Updates canonical cell input. @returns Nothing. */ () => {
      c.StartInput(ScInputMode.SC_INPUT_TABLE, "Saved words");
    },
  );
  const flush = vi.spyOn(session.fileWorkflows, "Flush");
  await act(
    /** Waits for actual primary storage or UI completion. @returns Completion. */ async () => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });
      screen.getByRole("textbox", { name: "Edit cell A1" }).dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      await required(flush.mock.results[0]).value;
    },
  );
  expect(c.shell.IsModified()).toBe(false);
  const record = required((await db.list())[0]);
  expect(record.title).toBe("Saved words");
  expect(
    cellPresentation(
      await readOdsDocument(required(await db.load(record.id)).content),
      new ScAddress(0, 0, 0),
    ).text,
  ).toBe("Saved words");
  act(
    /** Updates canonical cell input. @returns Nothing. */ () => {
      c.EnterString("Changed words");
    },
  );
  await act(
    /** Waits for actual primary storage or UI completion. @returns Completion. */ async () => {
      fireEvent.keyDown(window, { key: "s", ctrlKey: true });
      await required(flush.mock.results[1]).value;
    },
  );
  expect(
    cellPresentation(
      await readOdsDocument(required(await db.load(record.id)).content),
      new ScAddress(0, 0, 0),
    ).text,
  ).toBe("Changed words");
  expect(screen.queryByRole("dialog")).toBeNull();
  cleanup();
  session.Close();
});
it("reports Error and non-Error immediate save failures on the current document medium", /** Retains visible failure feedback. @returns Completion. */ async () => {
  const session = createCalcSession(undefined);
  mount(session);
  const flush = vi.spyOn(session.fileWorkflows, "Flush");
  for (const error of [new Error("Storage failed"), "quota exceeded"]) {
    flush.mockRejectedValueOnce(error);
    await act(
      /** Waits for actual primary storage or UI completion. @returns Completion. */ async () => {
        fireEvent.keyDown(window, { key: "s", metaKey: true });
      },
    );
    expect(session.controller.shell.GetMedium().lastOperation.message).toBe(
      error instanceof Error ? error.message : error,
    );
  }
  cleanup();
  session.Close();
});
it("persists imported ODS immediately and reopens its bytes from a new browser session without edits", /** Verifies independent storage lifetime rather than live model retention. @returns Completion. */ async () => {
  const db = new IndexedDbDocumentStore(crypto.randomUUID(), new IDBFactory()),
    source = createCalcSession(undefined);
  source.controller.EnterString("Imported document");
  const bytes = source.controller.shell.SerializeOds();
  source.Close();
  const imported = createCalcSession(db);
  await imported.fileWorkflows.Import(new File([bytes as BlobPart], "External.ods"), bytes, {
    id: "external-id",
    title: "External",
  });
  expect(imported.controller.shell.GetMedium().kind).toBe("primary");
  expect(imported.controller.shell.IsModified()).toBe(false);
  imported.Close();
  const reopened = createCalcSession(db);
  mount(reopened);
  const listed = vi.spyOn(db, "list");
  fireEvent.click(screen.getByRole("button", { name: "Open" }));
  await act(
    /** Awaits the actual IndexedDB listing instead of depending on a polling deadline under full-suite load. @returns Completion. */ async () => {
      await required(listed.mock.results[0]).value;
    },
  );
  const opened = vi.spyOn(reopened.fileWorkflows, "OpenStored");
  const stored = screen.getByRole("button", { name: "External" });
  await act(
    /** Waits for actual primary storage or UI completion. @returns Completion. */ async () => {
      fireEvent.click(stored);
      await waitFor(
        /** Waits until the pre-open Flush completes and actual import starts. @returns Assertion. */ () =>
          expect(opened).toHaveBeenCalled(),
      );
      await required(opened.mock.results[0]).value;
    },
  );
  expect(
    cellPresentation(reopened.controller.shell.GetDocument(), new ScAddress(0, 0, 0)).text,
  ).toBe("Imported document");
  expect(reopened.controller.shell.GetDocumentId()).toBe("external-id");
  cleanup();
  reopened.Close();
});
