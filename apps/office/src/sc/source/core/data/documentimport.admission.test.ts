/** @fileoverview Native document import releases rejected edit owners and retains explicit cached formula results. */
import { assert, expect, it } from "vitest";
import { EditTextObjectImpl, TextRotation } from "../../../../editeng/inc/editobj";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { ScAddress } from "../../../inc/address";
import { ScDocumentImport } from "../../../inc/documentimport";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import { ScDocShell } from "../../ui/docshell/docsh";
import { ScSetStringParam } from "../../../inc/stringutil";

it("releases transferred edit text for missing sheets and invalid columns without writing other cells", /** Checks native admission before a column store or formula owner is allocated. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  const doc = shell.GetDocument();
  const importer = new ScDocumentImport(doc);
  const input = unicode("rejected");
  const formula = unicode("=1+2");
  try {
    for (const pos of [new ScAddress(0, 0, 99), new ScAddress(doc.MaxCol() + 1, 0, 0)]) {
      importer.setNumericCell(pos, 42);
      importer.setStringCell(pos, input);
      importer.setFormulaCell(pos, formula, FormulaGrammar.Grammar.GRAM_NATIVE);
      const edit = new EditTextObjectImpl(
        null,
        MapUnit.Map100thMM,
        false,
        TextRotation.NONE,
        SvtScriptType.LATIN,
      );
      edit.CreateAndInsertContent().SetText(input);
      expect(edit.GetParagraphCount()).toBe(1);
      importer.setEditCell(pos, edit);
      expect(edit.GetParagraphCount()).toBe(0);
    }
    importer.invalidateBlockPositionSet(99);
    importer.finalize();
    expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_NONE);
    expect(doc.GetFormulaCell(new ScAddress())).toBeNull();
  } finally {
    input.dispose();
    formula.dispose();
    shell.Close();
  }
});

it("checks auto-input admission and link policy before changing stored content", /** Invalid sheets/columns return before parsing; a supplied policy must explicitly admit original link checking. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    doc = shell.GetDocument(),
    importer = new ScDocumentImport(doc),
    position = new ScAddress(),
    input = unicode("123"),
    empty = unicode("");
  doc.SetValue(position, 42);
  try {
    importer.setAutoInput(new ScAddress(0, 0, 99), input);
    importer.setAutoInput(new ScAddress(doc.MaxCol() + 1, 0, 0), input);
    expect(doc.GetValue(position)).toBe(42);
    const policy = new ScSetStringParam();
    expect(
      /** Calls the actual assertion with a default policy that disables link checking. @returns Nothing. */ () =>
        importer.setAutoInput(position, input, policy),
    ).toThrow("assert(!pStringParam || pStringParam->mbCheckLinkFormula)");
    expect(doc.GetValue(position)).toBe(42);
    policy.mbCheckLinkFormula = true;
    importer.setAutoInput(position, input, policy);
    expect(doc.GetCellType(position)).toBe(CellType.CELLTYPE_VALUE);
    expect(doc.GetValue(position)).toBe(123);
    importer.setAutoInput(position, empty, policy);
    expect(doc.GetCellType(position)).toBe(CellType.CELLTYPE_NONE);
  } finally {
    empty.dispose();
    input.dispose();
    shell.Close();
  }
});

it.each([false, true])(
  "imports a real formula with explicit link policy %s",
  /** A real compiled formula is transferred from ScCellValue into the typed store with either original link-check route. @param explicit - Whether the caller supplies its own enabled checking policy. @returns Nothing. */ (
    explicit,
  ) => {
    const shell = new ScDocShell(),
      doc = shell.GetDocument(),
      importer = new ScDocumentImport(doc),
      formula = unicode("=1+2"),
      position = new ScAddress(),
      policy = new ScSetStringParam();
    policy.mbCheckLinkFormula = true;
    try {
      importer.setAutoInput(position, formula, explicit ? policy : null);
      expect(doc.GetCellType(position)).toBe(CellType.CELLTYPE_FORMULA);
      assert(doc.GetFormulaCell(position));
      importer.finalize();
      expect(doc.GetValue(position)).toBe(3);
    } finally {
      formula.dispose();
      shell.Close();
    }
  },
);

it("finalizes a sparse native clipboard while preserving absent source sheet slots", /** Checks real ResetClip holes and post-import metadata without creating placeholder tables. @returns Nothing. */ () => {
  const source = new ScDocument();
  const clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  try {
    for (const label of ["First", "Second", "Third"]) {
      const name = unicode(label);
      try {
        source.InsertTab(source.GetTableCount(), name);
      } finally {
        name.dispose();
      }
    }
    clip.ResetClip(source, 2);
    clip.SetValue(new ScAddress(0, 0, 2), 42);
    const importer = new ScDocumentImport(clip);
    const column = clip.FetchTable(2)?.FetchColumn(0);
    assert(column);
    const previous = column.GetCellTextAttr(0);
    importer.finalize();
    expect(clip.FetchTable(0)).toBeNull();
    expect(clip.FetchTable(1)).toBeNull();
    expect(clip.GetValue(new ScAddress(0, 0, 2))).toBe(42);
    expect(column.GetCellTextAttr(0)).not.toBeNull();
    expect(column.GetCellTextAttr(0)).not.toBe(previous);
  } finally {
    clip.Dispose();
    source.Dispose();
  }
});

it("retains an imported numeric formula cache until normal lazy calculation replaces it", /** Checks the source result setter does not clear dirty state or invent a second result owner. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  const doc = shell.GetDocument();
  const importer = new ScDocumentImport(doc);
  const formula = unicode("=1+2");
  doc.SetAutoCalc(false);
  try {
    importer.setFormulaCell(new ScAddress(), formula, FormulaGrammar.Grammar.GRAM_NATIVE, 99);
    const cell = doc.GetFormulaCell(new ScAddress());
    assert(cell);
    expect(cell.GetDirty()).toBe(true);
    expect(cell.GetValue()).toBe(99);
    importer.finalize();
    expect(doc.GetValue(new ScAddress())).toBe(99);
    doc.SetAutoCalc(true);
    expect(doc.GetValue(new ScAddress())).toBe(3);
    expect(cell.GetDirty()).toBe(false);
  } finally {
    formula.dispose();
    shell.Close();
  }
});
