/** @fileoverview Calc shell admission and export over unchanged Strict and Transitional workbooks. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ScAddress } from "../../../inc/address";
import type { ScMergeAttr } from "../../../inc/attrib";
import type { ScDocument } from "../../../inc/document";
import { ATTR_MERGE } from "../../../inc/scitems";
import { ScDocShell } from "./docsh";

/** Reads an original LibreOffice workbook. @param filename - Fixture name. @returns Package bytes. */
function fixture(filename: string): Uint8Array {
  return new Uint8Array(
    readFileSync(`../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/${filename}`),
  );
}

/** Uses the same shell filter route as a file from the Calc dialog. @param shell - Active shell. @param bytes - Input package. @param title - New document title. @param isCancelled - Optional request state. @returns Installed document. */
function openXlsx(
  shell: ScDocShell,
  bytes: Uint8Array,
  title: string,
  isCancelled?: () => boolean,
): Promise<ScDocument> {
  return shell.Open(
    bytes,
    createDocument({ id: crypto.randomUUID(), suiteId: "calc", title }),
    {
      kind: "input",
      name: `${title}.xlsx`,
      filterId: ScDocShell.XLSX_FILTER_NAME,
      mediaType: ScDocShell.XLSX_MEDIA_TYPE,
      source: { kind: "external", reference: bytes },
    },
    isCancelled ? { isCancelled } : {},
  );
}

/** Checks the common canonical content in the original workbook pair. @param document - Imported workbook. @returns Nothing. */
function checkWorkbook(document: ScDocument): void {
  expect(document.GetTableCount()).toBe(2);
  const name = unicode("");
  try {
    expect(document.GetName(1, name)).toBe(true);
    expect(text(name)).toBe("Sheet2");
  } finally {
    name.dispose();
  }
  for (const [row, value] of [1, 2].entries()) {
    expect(document.GetValue(new ScAddress(0, row))).toBe(value);
    expect(text(document.GetSharedString(new ScAddress(1, row)).getString())).toBe(
      `String${value}`,
    );
  }
  for (const [row, value] of [6, 5, -1, 11].entries())
    expect(document.GetFormulaCell(new ScAddress(2, row))?.GetValue()).toBe(value);
  const merge = document.GetPattern(new ScAddress(4, 1))?.GetItem(ATTR_MERGE) as ScMergeAttr;
  expect([merge.GetColMerge(), merge.GetRowMerge()]).toEqual([2, 2]);
}

it.each(["universal-content.xlsx", "universal-content-strict.xlsx"])(
  "round-trips the native workbook and leaves the active medium in place for %s",
  /** Checks production shell Open, native structures, output XML and actual reopen. @param filename - Upstream fixture. @returns Completion. */ async (
    filename,
  ) => {
    const shell = new ScDocShell();
    try {
      const document = await openXlsx(shell, fixture(filename), filename);
      checkWorkbook(document);
      const medium = shell.GetMedium();
      shell.SetDocumentModified();
      const bytes = await shell.SerializeXlsx();
      expect(shell.GetMedium()).toBe(medium);
      expect(shell.IsModified()).toBe(true);
      const archive = await DocumentArchive.open(bytes);
      const sheet = await archive.readTextEntry("xl/worksheets/sheet1.xml");
      expect(sheet).toContain("<f>C1+C2</f>");
      expect(sheet).toContain('<mergeCell ref="E2:F3"/>');
      checkWorkbook(await openXlsx(shell, bytes, "Reopened"));
    } finally {
      shell.Close();
    }
  },
);

it("discards malformed, cancelled and stale XLSX candidates without replacing the active document", /** Does an actual import while updating the request state. @returns Completion. */ async () => {
  const shell = new ScDocShell();
  try {
    const initial = shell.GetDocument();
    const medium = shell.GetMedium();
    initial.SetValue(new ScAddress(), 73);
    const bytes = fixture("universal-content.xlsx");
    await expect(openXlsx(shell, bytes.subarray(0, 12), "Malformed")).rejects.toThrow();
    let cancelled = false;
    const pending = openXlsx(
      shell,
      bytes,
      "Cancelled",
      /** Reports the current cancellation state. @returns Whether the user cancelled. */ () =>
        cancelled,
    );
    cancelled = true;
    await expect(pending).rejects.toThrow(/cancelled/u);
    await expect(
      openXlsx(
        shell,
        bytes,
        "Already cancelled",
        /** Cancels before import. @returns True. */ () => true,
      ),
    ).rejects.toThrow(/cancelled/u);
    expect(shell.GetDocument()).toBe(initial);
    expect(shell.GetMedium()).toBe(medium);
    expect(initial.GetValue(new ScAddress())).toBe(73);

    const earlier = openXlsx(shell, bytes, "Earlier");
    const latest = openXlsx(shell, bytes, "Latest");
    await expect(earlier).rejects.toThrow(/stale/u);
    expect(await latest).toBe(shell.GetDocument());
    expect(shell.GetTitle()).toBe("Latest");
  } finally {
    shell.Close();
  }
});
