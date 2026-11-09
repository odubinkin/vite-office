/** @fileoverview Native CSV diagnostics through the real Calc shell and importer. */
import { expect, it, vi } from "vitest";
import { ErrCodeMsg } from "../../../../comphelper/inc/errcode";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScImportOptions } from "../dbgui/imoptdlg";
import { ScDocShell } from "./docsh";
import { ScImportExport } from "./impex";

/** Imports raw CSV into the current shell with the default source option route. @param shell - Active Calc shell. @param source - CSV contents. @returns Installed document. */
function openCsv(shell: ScDocShell, source: string): Promise<ScDocument> {
  const bytes = new TextEncoder().encode(source);
  return shell.Open(
    bytes,
    createDocument({ id: crypto.randomUUID(), suiteId: "calc", title: "CSV" }),
    {
      kind: "input",
      name: "warnings.csv",
      filterId: ScDocShell.CSV_FILTER_NAME,
      source: { kind: "external", reference: bytes },
    },
  );
}

it.each([
  [false, false, 0x80041105],
  [false, true, 0x80041103],
  [true, true, 0x80041102],
] as const)(
  "keeps the successful CSV import and retains warning %j %j %i",
  /** Checks upstream precedence using the real importer and bounded sheet dimensions. @param rowOverflow - Include an overflowing second row. @param colOverflow - Include an overflowing second column. @param expected - Original packed warning. @returns Completion. */ async (
    rowOverflow,
    colOverflow,
    expected,
  ) => {
    const shell = new ScDocShell();
    const rows = vi.spyOn(ScDocument.prototype, "MaxRow");
    const columns = vi.spyOn(ScDocument.prototype, "MaxCol");
    try {
      if (rowOverflow) rows.mockReturnValue(0);
      if (colOverflow) columns.mockReturnValue(0);
      const cell = "x".repeat(65536);
      const document = await openCsv(
        shell,
        cell + (colOverflow ? ",extra" : "") + "\n" + (rowOverflow ? "another\n" : ""),
      );
      expect(text(document.GetSharedString(new ScAddress()).getString())).toBe(
        cell.slice(0, 65535),
      );
      expect(shell.GetMedium().GetLastOperation().state).toBe("succeeded");
      expect(shell.GetMedium().GetWarningError().GetCode().valueOf()).toBe(expected);
      expect(shell.GetErrorCode().IsSet()).toBe(false);
    } finally {
      rows.mockRestore();
      columns.mockRestore();
      shell.Close();
    }
  },
);

it("associates a failed candidate with its source code and replaces warnings on the next successful open", /** Confirms the reused browser shell installs diagnostics together with the selected document. @returns Completion. */ async () => {
  const shell = new ScDocShell();
  try {
    const document = await openCsv(shell, "x".repeat(65536) + "\n");
    const warning = shell.GetMedium().GetWarningError();
    expect(warning.IsWarning()).toBe(true);
    const importer = vi.spyOn(ScImportExport.prototype, "ImportStream").mockReturnValue(false);
    try {
      const error = await openCsv(shell, "ignored\n").catch(
        /** Observes a failed conversion's diagnostic. @param value - Rejected open. @returns Rejection. */ (
          value: Error,
        ) => value,
      );
      expect(error).toBeInstanceOf(Error);
      const diagnostic = (error as Error).cause as ErrCodeMsg;
      expect(diagnostic.GetCode().valueOf()).toBe(0x00040b01);
      expect(shell.GetDocument()).toBe(document);
      expect(shell.GetMedium().GetWarningError()).toBe(warning);
    } finally {
      importer.mockRestore();
    }
    const replacement = await openCsv(shell, "42\n");
    expect(replacement.GetValue(new ScAddress())).toBe(42);
    expect(shell.GetMedium().GetWarningError().IsSet()).toBe(false);
  } finally {
    shell.Close();
  }
});

it("reports the source export error only for the rejected numbered sheet selection", /** Exercises the original invalid-sheet branch after a nonfatal open. @returns Completion. */ async () => {
  const shell = new ScDocShell();
  try {
    await openCsv(shell, "x".repeat(65536) + "\n");
    const options = new ScImportOptions();
    options.nSheetToExport = 2;
    expect(
      /** Calls the source numbered-sheet selection. @returns Exported sheets. */ () =>
        shell.ConvertToCsv(options.BuildString()),
    ).toThrow("Invalid CSV sheet number.");
    const diagnostic = shell.GetErrorCode();
    expect(diagnostic.GetCode().valueOf()).toBe(0x00040c02);
    expect(shell.GetErrorIgnoreWarning()).toBe(diagnostic);
  } finally {
    shell.Close();
  }
});
