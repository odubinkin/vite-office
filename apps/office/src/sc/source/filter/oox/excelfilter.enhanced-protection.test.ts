/** @fileoverview Native XLSX protected-range and edit-admission regressions. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScMarkData } from "../../../inc/markdata";
import { ScRangeList } from "../../../inc/rangelst";
import { InsertDeleteFlags } from "../../../inc/global";
import { ScTableProtection } from "../../core/data/tabprotection";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ExcelFilter } from "./excelfilter";
import { exportXlsx } from "../excel/xetable";
import {
  encodeCalcDocument,
  decodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { CalcViewController } from "../../../browser/controller/calc-view-controller";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ScDocShell } from "../../ui/docshell/docsh";

/** Loads an unchanged upstream workbook. @param name - Fixture base name. @returns XLSX package. */
function fixture(name: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(
    readFileSync(`../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/${name}.xlsx`),
  );
}

it("tests enhanced editability in the original protected range fixture through Worker and XLSX reopen", /** Ports the original testEnhancedProtectionXLSX assertions. @returns Completion. */ async () => {
  const document = await ExcelFilter.importDocument(fixture("enhanced-protection"));
  const transfer = structuredClone(encodeCalcDocument(document));
  const worker = decodeCalcDocument(transfer);
  const reopened = await ExcelFilter.importDocument(await exportXlsx(worker));
  try {
    const sheet = transfer.sheets[0];
    const sourceProtection = sheet?.protection;
    const first = sourceProtection?.enhanced?.[0];
    if (!sheet || !sourceProtection || !first) throw new Error("Missing transferred range.");
    expect(
      /** Rejects a malformed verifier while leaving the imported graph intact. @returns Decoded document. */ () =>
        decodeCalcDocument({
          ...transfer,
          sheets: [
            {
              ...sheet,
              protection: {
                ...sourceProtection,
                enhanced: [{ ...first, passwordVerifier: -1 }],
              },
            },
            ...transfer.sheets.slice(1),
          ],
        }),
    ).toThrow("Calc worker enhanced protection is invalid.");
    for (const doc of [document, worker, reopened]) {
      const protection = doc.GetTabProtection(0);
      expect(protection?.getEnhancedProtection()).toHaveLength(5);
      for (const [first, last, editable] of [
        [0, 0, false],
        [1, 1, true],
        [2, 2, true],
        [3, 3, false],
        [4, 4, false],
        [5, 5, false],
        [1, 2, true],
        [0, 1, false],
        [2, 3, false],
      ] as const) {
        expect(protection?.isBlockEditable(new ScRange(0, first, 0, 0, last, 0))).toBe(editable);
        expect(doc.IsBlockEditable(0, 0, first, 0, last)).toBe(editable);
      }
    }
  } finally {
    reopened.Dispose();
    worker.Dispose();
    document.Dispose();
  }
});

it("re-exports an entire enhanced protection column in its original shorthand", /** Ports testEnhancedProtectionRangeShorthand. @returns Completion. */ async () => {
  const doc = await ExcelFilter.importDocument(fixture("enhancedProtectionRangeShorthand"));
  try {
    expect(doc.IsBlockEditable(0, 2, 3, 2, doc.MaxRow())).toBe(true);
    expect(doc.IsBlockEditable(0, 1, 3, 2, doc.MaxRow())).toBe(false);
    const archive = await DocumentArchive.open(await exportXlsx(doc));
    expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
      '<protectedRange name="Range1" sqref="C:C"/>',
    );
  } finally {
    doc.Dispose();
  }
});

it("joins separate sqref tokens in one record and preserves the legacy range verifier", /** Checks the original union path, absent range handling and attribute output. @returns Completion. */ async () => {
  const path = "xl/worksheets/sheet1.xml";
  const archive = await DocumentArchive.open(fixture("enhancedProtectionRangeShorthand"));
  const output = new DocumentArchiveWriter();
  for (const entry of archive.getEntryNames()) {
    const bytes =
      entry === path
        ? new TextEncoder().encode(
            (await archive.readTextEntry(entry)).replace(
              /<protectedRange name="Range1" sqref="C:C"\/>/u,
              '<protectedRange name="Union" sqref="A1 A2"/><protectedRange name="Legacy" password="CC3D" sqref="A3"/><protectedRange name="Invalid"/>',
            ),
          )
        : await archive.readEntry(entry);
    output.putNextEntry(entry, bytes);
  }
  const doc = await ExcelFilter.importDocument(await output.finish());
  try {
    expect(doc.IsBlockEditable(0, 0, 0, 0, 1)).toBe(true);
    expect(doc.IsBlockEditable(0, 0, 2, 0, 2)).toBe(false);
    const saved = await (await DocumentArchive.open(await exportXlsx(doc))).readTextEntry(path);
    expect(saved).toContain('<protectedRange name="Legacy" password="cc3d" sqref="A3"/>');
    expect(saved).not.toContain('name="Invalid"');
  } finally {
    doc.Dispose();
  }
});

it("routes browser input through native protection before touching values or history", /** Exercises the normal browser controller with a pinned native workbook. @returns Completion. */ async () => {
  const controller = new CalcViewController();
  const file = fixture("enhanced-protection");
  try {
    await controller.shell.Open(
      file,
      createDocument({ id: "protected", title: "Protected", suiteId: "calc" }),
      {
        kind: "input",
        name: "Protected.xlsx",
        filterId: ScDocShell.XLSX_FILTER_NAME,
        mediaType: ScDocShell.XLSX_MEDIA_TYPE,
        source: { kind: "external", reference: new File([file], "Protected.xlsx") },
      },
    );
    const document = controller.shell.GetDocument();
    const history = controller.shell.GetUndoManager();
    expect(controller.EnterString("123")).toBe(false);
    expect(history.GetUndoActionCount()).toBe(0);
    expect(controller.error).toBe("Protected cells can not be modified.");
    controller.Select(0, 1);
    expect(controller.EnterString("123")).toBe(true);
    expect(document.GetValue(new ScAddress(0, 1, 0))).toBe(123);
    expect(history.GetUndoActionCount()).toBe(1);
    controller.Select(0, 3);
    expect(controller.EnterString("456")).toBe(false);
    expect(history.GetUndoActionCount()).toBe(1);
  } finally {
    controller.Close();
  }
});

it("protects cursor and multi-mark deletion before modifying values or history", /** Exercises both original delete operations and content undo on the imported workbook. @returns Completion. */ async () => {
  const doc = await ExcelFilter.importDocument(fixture("enhanced-protection"));
  const shell = new ScDocShell(doc);
  const fn = shell.GetDocFunc();
  const lock = new ScAddress(0, 0, 0);
  const allowed = new ScAddress(0, 1, 0);
  const next = new ScAddress(0, 2, 0);
  const marks = new ScMarkData(doc.GetSheetLimits());
  marks.SelectTable(0, true);
  const errors: string[] = [];
  shell.SetErrorMessageHandler(
    /** Observes document-owned operation errors. @param message - Native resource. @returns Nothing. */ (
      message,
    ) => {
      errors.push(message);
    },
  );
  const history = shell.GetUndoManager();
  try {
    doc.SetValue(lock, 7);
    doc.SetValue(allowed, 8);
    doc.SetValue(next, 9);
    expect(fn.DeleteCell(lock, marks, InsertDeleteFlags.CONTENTS, true, false)).toBe(false);
    expect(doc.GetValue(lock)).toBe(7);
    marks.SetMultiMarkArea(new ScRange(lock));
    marks.SetMultiMarkArea(new ScRange(next));
    expect(fn.DeleteContents(marks, InsertDeleteFlags.CONTENTS, true, true)).toBe(false);
    expect(fn.DeleteContents(marks, InsertDeleteFlags.CONTENTS, true, false)).toBe(false);
    expect(fn.ChangeIndent(marks, true, true)).toBe(false);
    expect(fn.ChangeIndent(marks, true, false)).toBe(false);
    expect(doc.GetValue(next)).toBe(9);
    expect(errors).toEqual(Array(3).fill("Protected cells can not be modified."));
    expect(history.GetUndoActionCount()).toBe(0);

    expect(fn.DeleteCell(allowed, marks, InsertDeleteFlags.CONTENTS, true, false)).toBe(true);
    expect(doc.GetValue(allowed)).toBe(0);
    history.Undo(shell);
    expect(doc.GetValue(allowed)).toBe(8);
    const ranges = new ScRangeList(new ScRange(allowed));
    ranges.push_back(new ScRange(next));
    const unlocked = new ScMarkData(doc.GetSheetLimits(), ranges);
    expect(fn.DeleteContents(unlocked, InsertDeleteFlags.CONTENTS, true, false)).toBe(true);
    expect(doc.GetValue(allowed)).toBe(0);
    expect(doc.GetValue(next)).toBe(0);
    expect(doc.GetValue(lock)).toBe(7);
    history.Undo(shell);
    expect(doc.GetValue(allowed)).toBe(8);
    expect(doc.GetValue(next)).toBe(9);
  } finally {
    shell.Close();
  }
});

it("keeps the original sheet identity of enhanced multi-marks across grouped tabs", /** Reproduces selection handling for grouped protected tabs and the source sparse-span test. @returns Completion. */ async () => {
  const doc = await ExcelFilter.importDocument(fixture("enhanced-protection"));
  const name = unicode("Second");
  try {
    expect(doc.InsertTab(1, name)).toBe(true);
    const source = doc.GetTabProtection(0);
    const protection = new ScTableProtection();
    protection.setProtected(true);
    const first = source
      ?.getEnhancedProtection()
      .find(
        /** Picks an uncredentialed range. @param record - Imported record. @returns Whether it covers A2. */ (
          record,
        ) => record.title === "Range1_without_password",
      );
    if (!first) throw new Error("Missing imported range");
    const secondRange = new ScRange(0, 1, 1, 0, 2, 1);
    protection.setEnhancedProtection([{ ...first, ranges: new ScRangeList(secondRange) }]);
    doc.SetTabProtection(1, protection);
    const block = new ScRange(0, 1, 0, 0, 2, 0);
    const marks = new ScMarkData(doc.GetSheetLimits());
    marks.SetMarkArea(block);
    marks.SetSelectedTabs([0, 1, 20]);
    expect(doc.IsSelectionEditable(marks)).toBe(true);
    marks.MarkToMulti();
    const matrix: [boolean] = [true];
    expect(doc.IsSelectionEditable(marks, matrix)).toBe(false);
    expect(matrix[0]).toBe(false);
    marks.SetSelectedTabs([0]);
    expect(doc.IsSelectionEditable(marks)).toBe(true);
  } finally {
    name.dispose();
    doc.Dispose();
  }
});
