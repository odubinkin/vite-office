/** @fileoverview Actual Calc file/menu/dialog integration over shared browser UI,IndexedDB and ODS owners. */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { IndexedDbDocumentStore } from "../../../framework/browser/storage/document-store";
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { NfIndexTableOffset } from "../../../svl/inc/zforlist";
import type { DocumentExportRequest } from "../../../svl/source/misc/storage";
import { Color } from "../../../tools/inc/color";
import { ScAddress } from "../../inc/address";
import type { ScMergeAttr, ScMergeFlagAttr } from "../../inc/attrib";
import { ScInputMode } from "../../inc/global";
import { ATTR_BACKGROUND, ATTR_FONT_HEIGHT, ATTR_MERGE, ATTR_MERGE_FLAG } from "../../inc/scitems";
import { readOdsDocument } from "../../source/filter/xml/xmlwrap";
import { ScImportOptions } from "../../source/ui/dbgui/imoptdlg";
import { ScDocShell } from "../../source/ui/docshell/docsh";
import { getCalcCommandResource } from "../../uiconfig/scalc/menubar/menubar";
import { createCalcSession } from "../composition/calc-module";
import { CalcViewController } from "../controller/calc-view-controller";
import { CalcFileWorkflows } from "../workflows/calc-file-workflows";
import { openBrowserCalcDocument } from "../workflows/calc-ods-io";
import { CalcWorkbench } from "./calc-workbench";
import { CalcFileDialog } from "./CalcFileDialog";
import { DocumentArchive } from "../../../package/source/zippackage/document-archive";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";

beforeAll(initializeLibXml2);

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
async function ods(): Promise<Uint8Array> {
  const c = new CalcViewController();
  c.EnterString("Imported words");
  c.Select(1, 0);
  c.EnterString("=2*3");
  const bytes = await c.shell.SerializeOds();
  c.Close();
  return bytes;
}

it("downloads and reopens an Excel workbook through the Calc file dialog", /** Asserts production filter bytes, recalculated cells and browser persistence. @returns Completion. */ async () => {
  const db = store();
  const controller = new CalcViewController();
  let exported: DocumentExportRequest | undefined;
  const workflows = new CalcFileWorkflows(controller, db, undefined, {
    export:
      /** Captures the actual browser request. @param request - Export request. @returns Nothing. */ (
        request,
      ) => {
        exported = request;
      },
  });
  try {
    controller.EnterString("29");
    controller.Select(1, 0);
    controller.EnterString("=A1+13");
    const document = controller.shell.GetDocument();
    const value = new ScAddress(0, 0, 0);
    const formatter = document.GetFormatTable();
    document.SetNumberFormat(value, formatter.GetFormatIndex(NfIndexTableOffset.NF_PERCENT_DEC2));
    const sheet = document.FetchTable(0);
    sheet?.SetMergedCells(2, 4, 3, 6);
    sheet?.SetRowHeightOnly(0, 0, 600);
    sheet?.SetManualHeight(0, 0, true);
    sheet?.SetColHidden(8, 8, true);
    for (const item of [
      new SvxFontHeightItem(340, 100, ATTR_FONT_HEIGHT),
      new SvxBrushItem(new Color(0x8fadce), ATTR_BACKGROUND),
    ]) {
      try {
        sheet?.ApplyAttr(1, 0, item);
        sheet?.ApplyAttr(5, 10, item);
      } finally {
        item.Dispose();
      }
    }
    const originalMedium = controller.shell.GetMedium();
    const modified = controller.shell.IsModified();
    render(<CalcFileDialog workflows={workflows} kind="export" onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Download XLSX" }));
    await waitFor(
      /** Waits for the actual XLSX port call. @returns Nothing. */ () =>
        expect(exported).toBeDefined(),
    );
    if (!exported) throw new Error("Missing Excel download.");
    expect(exported.mediaType).toBe(ScDocShell.XLSX_MEDIA_TYPE);
    const bytes = Uint8Array.from(exported.data as Uint8Array);
    const archive = await DocumentArchive.open(bytes);
    const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
    expect(xml).toContain("<f>A1+13</f>");
    expect(xml).toContain(
      '<row r="1" ht="30" hidden="false" customHeight="true" outlineLevel="0" collapsed="false">',
    );
    expect(xml).toMatch(/<col min="9" max="9"[^>]+hidden="true"/);
    expect(xml).toContain('<mergeCell ref="C5:D7"/>');
    expect(xml).toMatch(/<c r="F11" s="\d+"\/>/);
    expect(await archive.readTextEntry("xl/styles.xml")).toContain('rgb="FF8FADCE"');
    expect(await archive.readTextEntry("xl/styles.xml")).toContain('formatCode="0.00%"');
    expect(controller.shell.GetMedium()).toBe(originalMedium);
    expect(controller.shell.IsModified()).toBe(modified);
    cleanup();
    const close = vi.fn();
    render(<CalcFileDialog workflows={workflows} kind="open" onClose={close} />);
    fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
    fireEvent.change(screen.getByLabelText("Browse"), {
      target: { files: [new File([bytes], "Budget.xlsx")] },
    });
    await waitFor(
      /** Waits for import and primary persistence. @returns Nothing. */ () =>
        expect(close).toHaveBeenCalledOnce(),
      { timeout: 5000 },
    );
    expect(
      controller.shell
        .GetDocument()
        .GetFormulaCell(new ScAddress(1, 0, 0))
        ?.GetValue(),
    ).toBe(42);
    expect(controller.shell.GetTitle()).toBe("Budget");
    const saved = await first(db);
    expect(saved.title).toBe("Budget");
    cleanup();
    const session = createCalcSession(db);
    const reopened = session.controller;
    try {
      expect(await openBrowserCalcDocument(reopened.shell, db, saved.id)).toBe(true);
      const restored = reopened.shell.GetDocument();
      const sheet = restored.FetchTable(0);
      expect(sheet?.GetRowHeight(0)).toBe(600);
      expect(sheet?.ColHidden(8)).toBe(true);
      const merge = sheet?.GetPattern(2, 4)?.GetItem(ATTR_MERGE) as ScMergeAttr;
      const covered = sheet?.GetPattern(3, 6)?.GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr;
      expect([merge.GetColMerge(), merge.GetRowMerge()]).toEqual([2, 3]);
      expect(covered.IsHorOverlapped() && covered.IsVerOverlapped()).toBe(true);
      const formats = restored.GetFormatTable();
      const output = new OUString();
      try {
        formats.GetOutputString(
          restored.GetValue(value),
          restored.GetPattern(value)?.GetNumberFormat(formats) ?? 0,
          output,
          [null],
        );
        expect(text(output)).toBe("2900.00%");
      } finally {
        output.dispose();
      }
      for (const [col, row] of [
        [1, 0],
        [5, 10],
      ] as const) {
        const pattern = sheet?.GetPattern(col, row);
        expect((pattern?.GetItem(ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(340);
        expect(
          (pattern?.GetItem(ATTR_BACKGROUND) as SvxBrushItem)
            .GetColor()
            .equals(new Color(0x8fadce)),
        ).toBe(true);
      }
      render(
        <CalcWorkbench
          controller={reopened}
          frame={session.frame}
          fileWorkflows={session.fileWorkflows}
          sheetWorkflows={session.sheetWorkflows}
        />,
      );
      expect(screen.getByRole("gridcell", { name: /^A1(?:\s|$)/ })).toHaveTextContent("2900.00%");
    } finally {
      reopened.Close();
    }
  } finally {
    controller.Close();
  }
});

it("imports CSV from the file dialog and downloads the active sheet through the text filter", /** Checks imports CSV from the file dialog and downloads the active sheet through the text filter. @returns Test completion or assertion result. */ async () => {
  const db = store(),
    c = new CalcViewController();
  let exported: DocumentExportRequest | undefined;
  const workflows = new CalcFileWorkflows(c, db, undefined, {
    export: /** Captures the platform download. @param request - Bytes. @returns Nothing. */ (
      request,
    ) => {
      exported = request;
    },
  });
  const onClose = vi.fn();
  render(<CalcFileDialog workflows={workflows} kind="open" onClose={onClose} />);
  fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
  const input = screen.getByLabelText("Browse");
  fireEvent.change(input, {
    target: { files: [new File(['Name,Value\n"A, B",42\n'], "sample.csv", { type: "text/csv" })] },
  });
  await waitFor(
    /** Waits for import and primary ODS persistence. @returns Assertion. */ () =>
      expect(onClose).toHaveBeenCalledTimes(1),
  );
  expect(c.shell.GetTitle()).toBe("sample");
  const sheetName = unicode("");
  expect(c.shell.GetDocument().GetName(0, sheetName)).toBe(true);
  expect(text(sheetName)).toBe("sample");
  sheetName.dispose();
  expect(c.shell.GetDocument().GetValue(new ScAddress(1, 1, 0))).toBe(42);
  expect(await db.list()).toHaveLength(1);
  cleanup();
  render(<CalcFileDialog workflows={workflows} kind="export" onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Download CSV" }));
  await waitFor(
    /** Waits for CSV download bytes. @returns Assertion. */ () => expect(exported).toBeDefined(),
  );
  if (exported === undefined) throw new Error("Expected CSV export.");
  expect(exported.name).toBe("sample.csv");
  expect(exported.mediaType).toBe("text/csv");
  expect(new TextDecoder().decode(exported.data as Uint8Array)).toBe('Name,Value\n"A, B",42\n');
  c.Close();
});
it("routes the native all-sheet CSV selector to separate browser downloads", /** Checks routes the native all-sheet CSV selector to separate browser downloads. @returns Test completion or assertion result. */ async () => {
  const controller = new CalcViewController(),
    document = controller.shell.GetDocument(),
    downloads: DocumentExportRequest[] = [];
  expect(document.InsertTab(1, unicode("Data"))).toBe(true);
  document.SetTextCell(new ScAddress(0, 0, 0), unicode("First"));
  document.SetTextCell(new ScAddress(0, 0, 1), unicode("Second"));
  const workflows = new CalcFileWorkflows(controller, undefined, undefined, {
    export:
      /** Checks routes the native all-sheet CSV selector to separate browser downloads. @param request - Request. @returns Test completion or assertion result. */ (
        request,
      ) => {
        downloads.push(request);
      },
  });
  const options = new ScImportOptions();
  options.nSheetToExport = -1;
  await workflows.DownloadCsv(options.BuildString());
  expect(
    downloads.map(
      /** Checks routes the native all-sheet CSV selector to separate browser downloads. @param input1 - Input1. @returns Test completion or assertion result. */ ({
        name,
      }) => name,
    ),
  ).toEqual(["Untitled Calc Document-Sheet1.csv", "Untitled Calc Document-Data.csv"]);
  expect(
    downloads.map(
      /** Checks routes the native all-sheet CSV selector to separate browser downloads. @param input1 - Input1. @returns Test completion or assertion result. */ ({
        data,
      }) => new TextDecoder().decode(data as Uint8Array),
    ),
  ).toEqual(["First\n", "Second\n"]);
  controller.Close();
});
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
  fireEvent.click(screen.getByRole("button", { description: "Edit document title" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
    target: { value: "Retitled document" },
  });
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Document title" }), { key: "Enter" });
  expect(c.shell.GetTitle()).toBe("Retitled document");
  fireEvent.click(screen.getByRole("button", { description: "Edit document title" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
    target: { value: " " },
  });
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Document title" }), { key: "a" });
  fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
  expect(c.shell.GetTitle()).toBe("Retitled document");
  fireEvent.click(screen.getByRole("button", { description: "Edit document title" }));
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
    bytes = await ods(),
    file = new File([bytes as BlobPart], "Budget.ods");
  fireEvent.change(input, { target: { files: [new File(["bad"], "bad.txt")] } });
  await screen.findByRole("alert");
  expect(screen.getByRole("alert")).toHaveTextContent("Choose an ODS, XLSX or CSV file");
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
  await workflows.Import(new File([], ".ods"), await ods(), {
    id: "import",
    title: "Imported document",
  });
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
