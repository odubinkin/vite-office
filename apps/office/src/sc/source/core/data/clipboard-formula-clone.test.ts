/** @fileoverview Native column4 bulk span cloning,group identity and metadata acceptance. */
import type { ScTable } from "../../../inc/table";
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScFormulaCell, ScMatrixMode } from "../../../inc/formulacell";
import { CellTextAttr } from "../../../inc/celltextattr";
import { RowSpan } from "../../../inc/columnspanset";
import { ColumnBlockPosition } from "../../../inc/mtvelements";
import { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
it("clones shareable spans through actual bulk storage and joins real neighboring shared code", /** Formula source is compiled once;cell clones use token/group owners. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const grammar = FormulaGrammar.Grammar.GRAM_NATIVE,
    source = new ScFormulaCell(doc, new ScAddress(1, 0, 0), unicode("=A1+$A$1"), grammar),
    column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(1),
    attr = new CellTextAttr();
  attr.mnScriptType = SvtScriptType.LATIN;
  column.CloneFormulaCell(source, attr, [new RowSpan(1, 3)]);
  const first = column.GetFormulaCell(1) as ScFormulaCell;
  expect(first.GetSharedLength()).toBe(3);
  expect(text(first.GetFormula(grammar))).toBe("=A2+$A$1");
  expect((column.GetFormulaCell(3) as ScFormulaCell).GetCode()).toBe(first.GetCode());
  expect(first.GetCode()).not.toBe(source.GetCode());
  expect(column.GetScriptType(2)).toBe(SvtScriptType.LATIN);
  const block = new ColumnBlockPosition();
  column.InitBlockPosition(block);
  column.CloneFormulaCell(block, source, attr, [new RowSpan(0, 0), new RowSpan(4, 5)]);
  const top = column.GetFormulaCell(0) as ScFormulaCell;
  expect(top.GetSharedLength()).toBe(6);
  expect((column.GetFormulaCell(5) as ScFormulaCell).GetCode()).toBe(top.GetCode());
  column.StartListeningFormulaCells(
    new StartListeningContext(doc),
    new EndListeningContext(doc),
    0,
    5,
  );
  doc.SetValue(new ScAddress(), 2);
  doc.SetValue(new ScAddress(0, 3, 0), 7);
  expect(doc.GetValue(new ScAddress(1, 3, 0))).toBe(9);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(4);
  source.Dispose();
  doc.Dispose();
});
it("keeps separated singleton spans as real independent code owners and rejects an empty span", /** Native span preconditions remain explicit. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const source = new ScFormulaCell(
      doc,
      new ScAddress(1, 0, 0),
      unicode("=A1*2"),
      FormulaGrammar.Grammar.GRAM_NATIVE,
    ),
    column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(1);
  column.CloneFormulaCell(source, new CellTextAttr(), [new RowSpan(0, 0), new RowSpan(3, 3)]);
  expect((column.GetFormulaCell(0) as ScFormulaCell).IsShared()).toBe(false);
  expect((column.GetFormulaCell(3) as ScFormulaCell).IsShared()).toBe(false);
  expect((column.GetFormulaCell(3) as ScFormulaCell).GetCode()).not.toBe(
    (column.GetFormulaCell(0) as ScFormulaCell).GetCode(),
  );
  expect(
    /** Calls the actual native invalid-input boundary. @returns Native result. */ () =>
      column.CloneFormulaCell(source, new CellTextAttr(), [new RowSpan(3, 2)]),
  ).toThrow("span must be nonempty");
  source.Dispose();
  doc.Dispose();
});

it("rejects actual matrix-mode code at this scalar clipboard boundary", /** Genuine precompiled code retains its native matrix metadata;no matrix evaluator is substituted. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const scalar = new ScFormulaCell(
      doc,
      new ScAddress(),
      unicode("=1"),
      FormulaGrammar.Grammar.GRAM_NATIVE,
    ),
    matrix = new ScFormulaCell(
      doc,
      new ScAddress(),
      scalar.GetCode().Clone(),
      FormulaGrammar.Grammar.GRAM_NATIVE,
      ScMatrixMode.Reference,
    ),
    column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0);
  expect(
    /** Calls the scalar-only matrix boundary with actual native metadata. @returns Nothing. */ () =>
      column.CloneFormulaCell(matrix, new CellTextAttr(), [new RowSpan(0, 0)]),
  ).toThrow("Matrix clipboard cloning");
  matrix.Dispose();
  scalar.Dispose();
  doc.Dispose();
});
