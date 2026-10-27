/** @fileoverview Atomic Calc ODS shell replacement,confirmed save generations and real undo boundaries. */
import { expect, it, vi } from "vitest";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  RTL_TEXTENCODING_ASCII_US,
  RTL_TEXTENCODING_MS_1251,
  RTL_TEXTENCODING_MS_1252,
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_UTF8,
} from "../../../../sal/inc/rtl/textenc";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { CalcViewController } from "../../../browser/controller/calc-view-controller";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScXMLImportWrapper } from "../../filter/xml/xmlwrap";
import { ScImportOptions } from "../dbgui/imoptdlg";
import { ScDocShell } from "./docsh";
/** Builds valid replacement state. @param title - Title. @returns State. */
function state(title = "Opened") {
  return createDocument({ id: crypto.randomUUID(), suiteId: "calc", title });
}

it("opens CSV through the text filter and exports the canonical cells without adopting the export medium", /** Checks opens CSV through the text filter and exports the canonical cells without adopting the export medium. @returns Test completion or assertion result. */ async () => {
  const shell = new ScDocShell();
  const bytes = new TextEncoder().encode('Name,Amount,Formula\n"A, B",42,=B2*2\n');
  await shell.Open(bytes, state("Imported CSV"), {
    kind: "input",
    name: "input.csv",
    filterId: ScDocShell.CSV_FILTER_NAME,
    mediaType: ScDocShell.CSV_MEDIA_TYPE,
    source: { kind: "external", reference: bytes },
  });
  const document = shell.GetDocument();
  const sheetName = unicode("");
  expect(document.GetName(0, sheetName)).toBe(true);
  expect(text(sheetName)).toBe("input");
  sheetName.dispose();
  expect(text(document.GetSharedString(new ScAddress(0, 1, 0)).getString())).toBe("A, B");
  expect(document.GetValue(new ScAddress(1, 1, 0))).toBe(42);
  const importedFormula = document.GetFormulaCell(new ScAddress(2, 1, 0));
  expect(importedFormula && document.IsInFormulaTree(importedFormula)).toBe(true);
  expect(document.GetValue(new ScAddress(2, 1, 0))).toBe(84);
  const medium = shell.GetMedium();
  const csv = new TextDecoder().decode(shell.AsciiSave());
  expect(csv).toContain('"A, B",42,84\n');
  expect(shell.GetMedium()).toBe(medium);
  shell.Close();
});
it("passes CSV DETECT options through the source shell separator scanner", /** Checks passes CSV DETECT options through the source shell separator scanner. @returns Test completion or assertion result. */ async () => {
  const shell = new ScDocShell();
  const bytes = new TextEncoder().encode('"A,B";42\n"C,D";43\n');
  try {
    await shell.Open(bytes, state("Detected CSV"), {
      kind: "input",
      name: "detected.csv",
      filterId: ScDocShell.CSV_FILTER_NAME,
      mediaType: ScDocShell.CSV_MEDIA_TYPE,
      filterOptions: "DETECT,34,UTF-8",
      source: { kind: "external", reference: bytes },
    });
    const document = shell.GetDocument();
    expect(text(document.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe("A,B");
    expect(document.GetValue(new ScAddress(1, 0, 0))).toBe(42);
    expect(document.GetValue(new ScAddress(1, 1, 0))).toBe(43);
  } finally {
    shell.Close();
  }
});
it("rewinds the detected source stream before importing a BOM-prefixed CSV", /** Checks rewinds the detected source stream before importing a BOM-prefixed CSV. @returns Test completion or assertion result. */ async () => {
  const shell = new ScDocShell();
  const bytes = new TextEncoder().encode("\uFEFFsep=;\nA;42\n");
  try {
    await shell.Open(bytes, state("Detected BOM CSV"), {
      kind: "input",
      name: "detected-bom.csv",
      filterId: ScDocShell.CSV_FILTER_NAME,
      mediaType: ScDocShell.CSV_MEDIA_TYPE,
      filterOptions: "DETECT,34,DETECT",
      source: { kind: "external", reference: bytes },
    });
    const document = shell.GetDocument();
    expect(text(document.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe("sep=");
    expect(text(document.GetSharedString(new ScAddress(0, 1, 0)).getString())).toBe("A");
    expect(document.GetValue(new ScAddress(1, 1, 0))).toBe(42);
    expect(shell.GetMedium()?.filterOptions?.split(",")[13]).toBe("true");
  } finally {
    shell.Close();
  }
});
it("writes source fixed-width fields using Calc column widths and standard numeric alignment", /** Checks writes source fixed-width fields using Calc column widths and standard numeric alignment. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  const doc = shell.GetDocument();
  const table = doc.FetchTable(0);
  expect(table).not.toBeNull();
  if (!table) return;
  table.SetColWidthOnly(0, 600);
  table.SetColWidthOnly(1, 600);
  doc.SetTextCell(new ScAddress(0, 0, 0), unicode("hi"));
  doc.SetValue(new ScAddress(1, 0, 0), 42);
  const options = new ScImportOptions();
  options.bFixedWidth = true;
  expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe("hi      42\n");
  shell.Close();
});
it("uses ConvertTo CSV's zero, all-sheet, one-based and invalid sheet selectors", /** Checks uses ConvertTo CSV's zero, all-sheet, one-based and invalid sheet selectors. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell(),
    document = shell.GetDocument();
  expect(document.InsertTab(1, unicode("Data"))).toBe(true);
  document.SetTextCell(new ScAddress(0, 0, 0), unicode("First"));
  document.SetTextCell(new ScAddress(0, 0, 1), unicode("Second"));
  const options = new ScImportOptions(),
    decode =
      /** Checks uses ConvertTo CSV's zero, all-sheet, one-based and invalid sheet selectors. @param bytes - Bytes. @returns Test completion or assertion result. */ (
        bytes: Uint8Array,
      ) => new TextDecoder().decode(bytes);
  expect(
    shell
      .ConvertToCsv(undefined, 1)
      .map(
        /** Checks uses ConvertTo CSV's zero, all-sheet, one-based and invalid sheet selectors. @param stream - Stream. @returns Test completion or assertion result. */ (
          stream,
        ) => decode(stream.bytes),
      ),
  ).toEqual(["Second\n"]);
  expect(
    shell
      .ConvertToCsv("", 1)
      .map(
        /** Checks uses ConvertTo CSV's zero, all-sheet, one-based and invalid sheet selectors. @param stream - Stream. @returns Test completion or assertion result. */ (
          stream,
        ) => decode(stream.bytes),
      ),
  ).toEqual(["Second\n"]);
  options.nSheetToExport = -1;
  const all = shell.ConvertToCsv(options.BuildString(), 1);
  expect(
    all.map(
      /** Checks uses ConvertTo CSV's zero, all-sheet, one-based and invalid sheet selectors. @param stream - Stream. @returns Test completion or assertion result. */ (
        stream,
      ) => stream.sheetName,
    ),
  ).toEqual(["Sheet1", "Data"]);
  expect(
    all.map(
      /** Checks uses ConvertTo CSV's zero, all-sheet, one-based and invalid sheet selectors. @param stream - Stream. @returns Test completion or assertion result. */ (
        stream,
      ) => decode(stream.bytes),
    ),
  ).toEqual(["First\n", "Second\n"]);
  options.nSheetToExport = 1;
  expect(
    shell
      .ConvertToCsv(options.BuildString(), 1)
      .map(
        /** Checks uses ConvertTo CSV's zero, all-sheet, one-based and invalid sheet selectors. @param stream - Stream. @returns Test completion or assertion result. */ (
          stream,
        ) => decode(stream.bytes),
      ),
  ).toEqual(["First\n"]);
  options.nSheetToExport = 3;
  expect(
    /** Checks uses ConvertTo CSV's zero, all-sheet, one-based and invalid sheet selectors. @returns Test completion or assertion result. */ () =>
      shell.ConvertToCsv(options.BuildString(), 1),
  ).toThrow(RangeError);
  options.nSheetToExport = -23;
  expect(
    /** Checks uses ConvertTo CSV's zero, all-sheet, one-based and invalid sheet selectors. @returns Test completion or assertion result. */ () =>
      shell.ConvertToCsv(options.BuildString(), 1),
  ).toThrow(RangeError);
  shell.Close();
});
it("follows upstream empty fixed-width column bounds across sparse rows", /** Checks follows upstream empty fixed-width column bounds across sparse rows. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  const doc = shell.GetDocument(),
    table = doc.FetchTable(0);
  expect(table).not.toBeNull();
  if (!table) return;
  for (let col = 0; col < 3; col++) table.SetColWidthOnly(col, 600);
  doc.SetTextCell(new ScAddress(0, 0, 0), unicode("A"));
  doc.SetTextCell(new ScAddress(2, 2, 0), unicode("C"));
  const options = new ScImportOptions();
  options.bFixedWidth = true;
  expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe(
    "A         \n          \n          C    \n",
  );
  shell.Close();
});
it("writes only the source row terminator for an empty fixed-width sheet", /** Checks writes only the source row terminator for an empty fixed-width sheet. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  const options = new ScImportOptions();
  options.bFixedWidth = true;
  expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe("\n");
  shell.Close();
});
it("exports numeric cells through the source input-line formatter independently of display precision", /** Checks exports numeric cells through the source input-line formatter independently of display precision. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  shell.GetDocument().SetValue(new ScAddress(), 1.2345);
  shell.GetDocument().GetFormatTable().ChangeStandardPrec(0);
  const options = new ScImportOptions();
  expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe("1.2345\n");
  options.bSaveAsShown = true;
  expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe("1\n");
  expect(shell.GetDocument().GetFormatTable().GetStandardPrec()).toBe(0);
  shell.Close();
});
it("ignores trailing CSV filter tokens beyond the upstream fourteen-token contract", /** Checks ignores trailing CSV filter tokens beyond the upstream fourteen-token contract. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  shell.GetDocument().SetTextCell(new ScAddress(), unicode("A,B"));
  const options = new ScImportOptions();
  const source = options.BuildString();
  expect(new ScImportOptions(`${source},unknown`).BuildString()).toBe(source);
  expect(shell.AsciiSave(`${source},unknown`)).toEqual(shell.AsciiSave(source));
  shell.Close();
});
it("uses the stream charset for Unicode BOM and limits the IncludeBOM option to UTF-8", /** Checks uses the stream charset for Unicode BOM and limits the IncludeBOM option to UTF-8. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  shell.GetDocument().SetTextCell(new ScAddress(), unicode("A"));
  const options = new ScImportOptions();
  options.bIncludeBOM = false;
  options.SetTextEncoding(RTL_TEXTENCODING_UNICODE);
  expect([...shell.AsciiSave(options.BuildString())]).toEqual([0xff, 0xfe, 0x41, 0, 0x0a, 0]);
  options.SetTextEncoding(RTL_TEXTENCODING_UTF8);
  options.bIncludeBOM = true;
  expect([...shell.AsciiSave(options.BuildString())]).toEqual([0xef, 0xbb, 0xbf, 0x41, 0x0a]);
  shell.Close();
});
it("converts ANSI CSV text through the original MS-1252 byte table", /** Checks converts ANSI CSV text through the original MS-1252 byte table. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  shell.GetDocument().SetTextCell(new ScAddress(), unicode("Café €"));
  const options = new ScImportOptions();
  options.SetTextEncoding(RTL_TEXTENCODING_MS_1252);
  expect(options.aStrFont).toBe("ANSI");
  expect([...shell.AsciiSave(options.BuildString())]).toEqual([
    0x43, 0x61, 0x66, 0xe9, 0x20, 0x80, 0x0a,
  ]);
  shell.Close();
});
it("uses the original MS-1251 converter when the filter string selects that encoding", /** Checks uses the original MS-1251 converter when the filter string selects that encoding. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  shell.GetDocument().SetTextCell(new ScAddress(), unicode("Привет"));
  const options = new ScImportOptions();
  options.SetTextEncoding(RTL_TEXTENCODING_MS_1251);
  expect([...shell.AsciiSave(options.BuildString())]).toEqual([
    0xcf, 0xf0, 0xe8, 0xe2, 0xe5, 0xf2, 0x0a,
  ]);
  shell.Close();
});
it("escapes a delimiter produced by source character replacement after ASCII encoding", /** Checks escapes a delimiter produced by source character replacement after ASCII encoding. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  shell.GetDocument().SetTextCell(new ScAddress(), unicode("“"));
  const options = new ScImportOptions();
  options.SetTextEncoding(RTL_TEXTENCODING_ASCII_US);
  expect([...shell.AsciiSave(options.BuildString())]).toEqual([0x22, 0x22, 0x22, 0x22, 0x0a]);
  shell.Close();
});
it("doubles the complete encoded UTF-8 text delimiter before writing CSV bytes", /** Checks doubles the complete encoded UTF-8 text delimiter before writing CSV bytes. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  shell.GetDocument().SetTextCell(new ScAddress(), unicode("Café"));
  const options = new ScImportOptions();
  options.nTextSepCode = "é";
  expect([...shell.AsciiSave(options.BuildString())]).toEqual([
    ...new TextEncoder().encode("éCafééé\n"),
  ]);
  shell.Close();
});
it("forces ASCII double quotes around a top-left sep directive even with another text delimiter", /** Checks forces ASCII double quotes around a top-left sep directive even with another text delimiter. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  shell.GetDocument().SetTextCell(new ScAddress(), unicode("sep=;"));
  const options = new ScImportOptions();
  options.nTextSepCode = "|";
  expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe('"sep=,"\n');
  shell.Close();
});
it("treats zero text and field separator codes as disabled in the native export branches", /** Checks treats zero text and field separator codes as disabled in the native export branches. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell(),
    document = shell.GetDocument(),
    options = new ScImportOptions();
  document.SetTextCell(new ScAddress(0, 0, 0), unicode('A,"B"'));
  options.nTextSepCode = "\0";
  options.bQuoteAllText = true;
  expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe('A,"B"\n');
  document.SetTextCell(new ScAddress(0, 0, 0), unicode("A"));
  document.SetTextCell(new ScAddress(1, 0, 0), unicode("B"));
  options.nTextSepCode = '"';
  options.nFieldSepCode = "\0";
  options.bQuoteAllText = false;
  expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe("AB\n");
  shell.Close();
});
it("does not rewrite a sep directive when the native field separator code is zero", /** Checks does not rewrite a sep directive when the native field separator code is zero. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell(),
    options = new ScImportOptions();
  shell.GetDocument().SetTextCell(new ScAddress(), unicode("sep=;"));
  options.nFieldSepCode = "\0";
  expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe("sep=;\n");
  shell.Close();
});
it("writes the sep directive without quotes when the native text separator code is zero", /** Checks writes the sep directive without quotes when the native text separator code is zero. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell(),
    options = new ScImportOptions();
  shell.GetDocument().SetTextCell(new ScAddress(), unicode("sep=;"));
  options.nTextSepCode = "\0";
  expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe("sep=,\n");
  shell.Close();
});
it("follows SAL's missing-converter byte fallback without an export-option error", /** Checks follows SAL's missing-converter byte fallback without an export-option error. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  shell.GetDocument().SetTextCell(new ScAddress(), unicode("€"));
  const options = new ScImportOptions();
  options.SetTextEncoding(9999);
  expect([...shell.AsciiSave(options.BuildString())]).toEqual([0xac, 0x0a]);
  shell.Close();
});
it("exports with surplus filter tokens using the native recognized positions", /** Checks exports with surplus filter tokens using the native recognized positions. @returns Test completion or assertion result. */ () => {
  const shell = new ScDocShell();
  shell.GetDocument().SetTextCell(new ScAddress(), unicode("A"));
  const options = new ScImportOptions();
  expect(new TextDecoder().decode(shell.AsciiSave(`${options.BuildString()},ignored,extra`))).toBe(
    "A\n",
  );
  shell.Close();
});
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
