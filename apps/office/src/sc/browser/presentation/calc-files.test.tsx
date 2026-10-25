/** @fileoverview Actual Calc file/menu/dialog integration over shared browser UI,IndexedDB and ODS owners. */
import { ScInputMode } from "../../inc/global";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { IndexedDbDocumentStore } from "../../../framework/browser/storage/document-store";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { CalcFileWorkflows } from "../workflows/calc-file-workflows";
import { CalcViewController } from "../controller/calc-view-controller";
import { CalcFileDialog } from "./CalcFileDialog";
import { ScAddress } from "../../inc/address";
import { readOdsDocument } from "../../source/filter/xml/xmlwrap";
import { ScDocShell } from "../../source/ui/docshell/docsh";
import { getCalcCommandResource } from "../../uiconfig/scalc/menubar/menubar";
import type { DocumentExportRequest } from "../../../svl/source/misc/storage";

afterEach(
  /** Releases rendered controls and restores browser mocks. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
  },
);
/** Uses a real isolated primary database. @returns Store. */
function store() {
  return new IndexedDbDocumentStore(crypto.randomUUID(), new IDBFactory());
}
/** Creates supported actual ODS source bytes. @returns Package. */
function ods(): Uint8Array {
  const c = new CalcViewController();
  c.EnterString("Imported words");
  c.Select(1, 0);
  c.EnterString("=2*3");
  const bytes = c.shell.SerializeOds();
  c.Close();
  return bytes;
}
/** Reads one actual committed primary record. @param db - Store. @returns Record. */
async function first(db: IndexedDbDocumentStore) {
  const record = (await db.list())[0];
  if (record === undefined) throw new Error("Expected stored ODS.");
  return record;
}

/** Observes a genuine file operation while preserving its original Promise and failures. @param operation - Real bound file operation. @returns Completion and the call-through observer. */
function observeOperation<Args extends unknown[], Result>(
  operation: (...args: Args) => Promise<Result>,
) {
  let resolveResult: (value: Result) => void;
  let rejectResult: (error: unknown) => void;
  const completion = new Promise<Result>(
    /** Retains the actual operation completion. @param resolve - Successful native result. @param reject - Actual operation error. @returns Nothing. */ (
      resolve,
      reject,
    ) => {
      resolveResult = resolve;
      rejectResult = reject;
    },
  );
  return {
    completion,
    call: /** Forwards the original operation without changing its scheduling or result. @param args - Actual file arguments. @returns Original Promise. */ (
      ...args: Args
    ): Promise<Result> => {
      try {
        const pending = operation(...args);
        void pending.then(resolveResult, rejectResult);
        return pending;
      } catch (error) {
        rejectResult(error);
        throw error;
      }
    },
  };
}

it("opens real Calc file dialogs from the shared menu and keyboard,then saves and reopens primary ODS", /** Mounted production owners drive canonical operations. @returns Completion. */ async () => {
  const db = store(),
    session = createCalcSession(db),
    c = session.controller;
  c.EnterString("Working document");
  render(
    <CalcWorkbench
      controller={c}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  fireEvent.click(screen.getByRole("menuitem", { name: "File" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /Save As/ }));
  expect(screen.getByRole("dialog", { name: "Save As" })).toBeVisible();
  expect(screen.getByRole("grid").closest("[inert]")).toHaveAttribute("inert");
  fireEvent.change(screen.getByRole("textbox", { name: "New copy name" }), {
    target: { value: "Named copy" },
  });
  const saved = observeOperation(session.fileWorkflows.SaveCopy.bind(session.fileWorkflows));
  vi.spyOn(session.fileWorkflows, "SaveCopy").mockImplementation(saved.call);
  await act(
    /** Waits for actual ODS persistence and the resulting dialog update. @returns Completion. */ async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save copy" }));
      await saved.completion;
    },
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(c.shell.GetTitle()).toBe("Named copy");
  expect(await db.list()).toHaveLength(2);
  const listed = observeOperation(db.list.bind(db));
  vi.spyOn(db, "list").mockImplementation(listed.call);
  fireEvent.keyDown(screen.getByRole("grid"), { key: "o", ctrlKey: true });
  await act(
    /** Waits for the real IndexedDB list instead of a default one-second query deadline. @returns Completion. */ async () => {
      await listed.completion;
    },
  );
  expect(screen.getByRole("button", { name: "Working document" })).toBeVisible();
  const opened = observeOperation(session.fileWorkflows.OpenStored.bind(session.fileWorkflows));
  vi.spyOn(session.fileWorkflows, "OpenStored").mockImplementation(opened.call);
  await act(
    /** Waits for actual package loading before checking source replacement. @returns Completion. */ async () => {
      fireEvent.click(screen.getByRole("button", { name: "Working document" }));
      await opened.completion;
    },
  );
  expect(c.shell.GetTitle()).toBe("Working document");
  expect(c.viewData.GetDocument()).toBe(c.shell.GetDocument());
  fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
    target: { value: "Retitled document" },
  });
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Document title" }), { key: "Enter" });
  expect(c.shell.GetTitle()).toBe("Retitled document");
  fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
    target: { value: " " },
  });
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Document title" }), { key: "a" });
  fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
  expect(c.shell.GetTitle()).toBe("Retitled document");
  fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
  fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));

  fireEvent.keyDown(screen.getByRole("grid"), { key: "s", shiftKey: true, metaKey: true });
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "o", ctrlKey: true });
  expect(screen.getByRole("dialog", { name: "Save As" })).toBeVisible();
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.getByRole("grid")).toHaveFocus();
  fireEvent.click(screen.getByRole("menuitem", { name: "File" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Export…" }));
  expect(screen.getByRole("button", { name: "Download ODS" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  cleanup();
  session.Close();
});

it("imports computer ODS,offers name collision choices,and preserves real formula owners", /** Shared import UI delegates to actual Calc filter and primary store. @returns Completion. */ async () => {
  const db = store(),
    c = new CalcViewController(),
    workflows = new CalcFileWorkflows(c, db, undefined),
    onClose = vi.fn();
  const mounted = render(<CalcFileDialog workflows={workflows} kind="open" onClose={onClose} />);
  fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
  const input = screen.getByLabelText("Browse"),
    bytes = ods(),
    file = new File([bytes as BlobPart], "Budget.ods");
  fireEvent.change(input, { target: { files: [new File(["bad"], "bad.txt")] } });
  await screen.findByRole("alert");
  expect(screen.getByRole("alert")).toHaveTextContent("Choose an ODS file");
  fireEvent.change(input, { target: { files: [file] } });
  await waitFor(
    /** Waits for actual ODS storage. @returns Assertion. */ () =>
      expect(onClose).toHaveBeenCalledTimes(1),
  );
  expect(c.shell.GetTitle()).toBe("Budget");
  expect(c.shell.GetDocument().GetValue(new ScAddress(1, 0, 0))).toBe(6);
  const identity = (await first(db)).id;
  mounted.unmount();
  onClose.mockClear();
  render(<CalcFileDialog workflows={workflows} kind="open" onClose={onClose} />);
  fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
  fireEvent.change(screen.getByLabelText("Browse"), { target: { files: [file] } });
  await screen.findByText("A document with this name exists");
  expect(screen.getByRole("textbox", { name: "New document name" })).toHaveValue("Budget (1)");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByRole("tab", { name: "On computer" })).toBeVisible();
  fireEvent.change(screen.getByLabelText("Browse"), { target: { files: [file] } });
  await screen.findByText("A document with this name exists");
  fireEvent.click(screen.getByRole("button", { name: "Save as new" }));
  await waitFor(
    /** Waits for independent imported primary copy. @returns Assertion. */ () =>
      expect(onClose).toHaveBeenCalledTimes(1),
  );
  expect(await db.list()).toHaveLength(2);
  expect(c.shell.GetDocumentId()).not.toBe(identity);
  cleanup();
  onClose.mockClear();
  render(<CalcFileDialog workflows={workflows} kind="open" onClose={onClose} />);
  fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
  fireEvent.change(screen.getByLabelText("Browse"), { target: { files: [file] } });
  await screen.findByText("A document with this name exists");
  fireEvent.click(screen.getByRole("button", { name: "Replace existing" }));
  await waitFor(
    /** Waits for imported overwrite identity. @returns Assertion. */ () =>
      expect(onClose).toHaveBeenCalledTimes(1),
  );
  expect(c.shell.GetDocumentId()).toBe(identity);
  expect(await db.list()).toHaveLength(2);
  cleanup();
  onClose.mockClear();
  render(<CalcFileDialog workflows={workflows} kind="open" onClose={onClose} />);
  fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
  fireEvent.change(screen.getByLabelText("Browse"), {
    target: { files: [new File([bytes as BlobPart], ".ods")] },
  });
  await waitFor(
    /** Waits for a supported bare-extension filename with fallback title. @returns Assertion. */ () =>
      expect(onClose).toHaveBeenCalledTimes(1),
  );
  expect(c.shell.GetTitle()).toBe("Imported document");
  cleanup();
  c.Close();
});

it("downloads actual ODS without changing primary identity,save position or dirty state,and retains failures", /** Export uses the shared port and an independent native-shaped medium. @returns Completion. */ async () => {
  const db = store(),
    c = new CalcViewController();
  c.EnterString("Saved words");
  let exported: DocumentExportRequest | undefined;
  const workflows = new CalcFileWorkflows(c, db, undefined, {
    export:
      /** Captures the actual platform export boundary. @param request - Source bytes. @returns Nothing. */ (
        request,
      ) => {
        exported = request;
      },
  });
  await workflows.SaveCopy("Source");
  c.EnterString("Changed words");
  const identity = c.shell.GetDocumentId(),
    medium = c.shell.GetMedium(),
    generation = c.shell.GetContentGeneration(),
    history = c.shell.GetUndoManager().GetUndoActionCount();
  render(<CalcFileDialog workflows={workflows} kind="export" onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Download ODS" }));
  await waitFor(
    /** Waits for external package creation. @returns Assertion. */ () =>
      expect(exported).toBeDefined(),
  );
  if (exported === undefined) throw new Error("Expected actual export.");
  expect(exported.name).toBe("Source.ods");
  const loaded = await readOdsDocument(exported.data as Uint8Array);
  new ScDocShell(loaded).Close();
  expect(c.shell.GetDocumentId()).toBe(identity);
  expect(c.shell.GetMedium()).toBe(medium);
  expect(c.shell.GetContentGeneration()).toBe(generation);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(history);
  expect(c.shell.IsModified()).toBe(true);
  expect(c.Undo()).toBe(true);
  expect(c.shell.IsModified()).toBe(false);
  expect(c.Input()).toBe("Saved words");
  expect(c.Redo()).toBe(true);
  expect(c.shell.IsModified()).toBe(true);
  cleanup();
  const broken = new CalcFileWorkflows(c, db, undefined, {
    export: /** Rejects the platform download. @returns Nothing. */ () => {
      throw new Error("Download rejected");
    },
  });
  render(<CalcFileDialog workflows={broken} kind="export" onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Download ODS" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Download rejected");
  await expect(
    c.shell.Export(
      { kind: "export", name: "bad" },
      /** Rejects a non-Error port value. @returns Nothing. */ () => {
        throw "platform failure";
      },
    ),
  ).rejects.toBe("platform failure");
  cleanup();
  c.Close();
});

it("rejects failed source input or unavailable storage,and exposes source command state and resources", /** Exercises real dispatch,flush guards and missing record errors. @returns Completion. */ async () => {
  const c = new CalcViewController(),
    db = store(),
    workflows = new CalcFileWorkflows(c, db, undefined),
    missing = new CalcFileWorkflows(c, undefined, undefined);
  expect(workflows.GetShell()).toBeDefined();
  expect(getCalcCommandResource(".uno:OpenFromCalc").shortcuts[0]).toBe("Ctrl+O");
  expect(getCalcCommandResource(".uno:SaveAs").shortcuts[0]).toBe("Ctrl+Shift+S");
  expect(getCalcCommandResource(".uno:Undo").shortcuts[0]).toBe("Ctrl+Z");
  expect(getCalcCommandResource(".uno:Redo").shortcuts[0]).toBe("Ctrl+Shift+Z");

  expect(getCalcCommandResource(".uno:Undo").label).toBe("Undo");
  expect(
    /** Rejects an absent resource. @returns Resource. */ () => getCalcCommandResource("missing"),
  ).toThrow(/Unknown/);
  c.StartInput(ScInputMode.SC_INPUT_TABLE, "=UNPORTED(A1)");
  expect(workflows.Show("open")).toBe(false);
  await expect(workflows.Flush()).rejects.toThrow();
  c.Cancel();
  await expect(missing.OpenStored("missing")).rejects.toThrow(/unavailable/);
  await expect(workflows.OpenStored("missing")).rejects.toThrow(/no longer exists/);
  await workflows.Import(new File([], ".ods"), ods(), { id: "import", title: "Imported document" });
  await workflows.Flush();
  expect(workflows.Show("open")).toBe(true);
  workflows.dialogs.Close();
  const shell = c.shell;
  await shell.Export(
    { kind: "export", name: "empty" },
    /** Uses default successful no-result persistence. @returns Nothing. */ () => undefined,
  );
  c.Close();
});
