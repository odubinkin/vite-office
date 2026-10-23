/** @fileoverview Original reference-copy context,metadata,undo and formula boundary acceptance. */
import { expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { RefUpdateContext, UpdatedRangeNames } from "../../../inc/refupdatecontext";
import { ColumnSet } from "../../../inc/columnset";
import { ColumnBlockPositionSet } from "../../../inc/mtvelements";
import type { ScTable } from "../../../inc/table";
import { ScFormulaCell } from "../../../inc/formulacell";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScSingleRefData, ScComplexRefData } from "../../../inc/refdata";
import { FormulaByteToken, type FormulaToken } from "../../../../formula/inc/token";
import { OpCode } from "../../../../formula/inc/opcode";
import {
  ScSingleRefToken,
  ScDoubleRefToken,
  ScTableRefToken,
  ScHybridCellToken,
} from "../../../inc/token";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { UpdateRefMode } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
it("retains original sparse column output and insertion-only global-name normalization", /** Native output containers have independent value semantics. @returns Nothing. */ () => {
  const columns = new ColumnSet(),
    output = [9],
    names = new UpdatedRangeNames();
  expect(columns.empty()).toBe(true);
  columns.getColumns(0, output);
  expect(output).toEqual([]);
  columns.set(2, 7);
  columns.set(2, 1);
  columns.set(2, 7);
  columns.getColumns(2, output);
  expect(output).toEqual([1, 7]);
  expect(columns.hasTab(2)).toBe(true);
  expect(columns.hasTab(1)).toBe(false);
  expect(columns.empty()).toBe(false);
  expect(names.isEmpty(-1)).toBe(true);
  expect(names.isNameUpdated(-1, 4)).toBe(false);
  expect(names.getUpdatedNames(2).size).toBe(0);
  names.setUpdatedName(-8, 65540);
  names.setUpdatedName(2, 3);
  names.setUpdatedName(2, 5);
  expect(names.isNameUpdated(-1, 4)).toBe(true);
  expect(names.isNameUpdated(-8, 4)).toBe(false);
  expect(names.isEmpty(-8)).toBe(true);
  expect(names.isEmpty(-1)).toBe(false);
  const copy = names.getUpdatedNames(-1);
  copy.clear();
  expect(names.getUpdatedNames(-1)).toEqual(new Set([4]));
});
it("preserves context defaults,mixed insertion/deletion signs and borrowed cursor binding", /** Contexts consume real clipboard parameters and native column caches. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  const context = new RefUpdateContext(doc);
  expect(context.mrDoc).toBe(doc);
  expect(context.meMode).toBe(UpdateRefMode.URM_INSDEL);
  expect(context.maRange.aStart.equals(new ScAddress())).toBe(true);
  expect(context.mbTransposed).toBe(false);
  expect(context.maRefErrors.mbErrorCreated).toBe(false);
  expect(context.maRefErrors.maFormulaCell.equals(new ScAddress())).toBe(true);
  expect(context.isInserted()).toBe(false);
  expect(context.isDeleted()).toBe(false);
  context.mnRowDelta = 1;
  context.mnColDelta = -1;
  expect(context.isInserted()).toBe(true);
  expect(context.isDeleted()).toBe(true);
  context.mnRowDelta = 0;
  context.mnColDelta = 0;
  context.mnTabDelta = -1;
  expect(context.isDeleted()).toBe(true);
  context.mnTabDelta = 1;
  expect(context.isInserted()).toBe(true);
  context.meMode = UpdateRefMode.URM_COPY;
  expect(context.isInserted()).toBe(false);
  expect(context.isDeleted()).toBe(false);
  expect(context.getBlockPosition(0, 0)).toBe(null);
  const positions = new ColumnBlockPositionSet(doc);
  context.setBlockPositionReference(positions);
  expect(context.getBlockPosition(0, 0)).toBe(positions.getBlockPosition(0, 0));
  context.setBlockPositionReference(null);
  expect(context.getBlockPosition(0, 0)).toBe(null);
  clip.GetClipParam().mbTransposed = true;
  expect(new RefUpdateContext(doc, clip).mbTransposed).toBe(true);
  expect(
    /** Rejects a genuine wrong document category. @returns Context. */ () =>
      new RefUpdateContext(doc, doc),
  ).toThrow("clipboard document");
  clip.Dispose();
  doc.Dispose();
});
it("rejoins both native copy boundaries without relocating the compiled references twice", /** A middle member is unshared before the original copy-update phase. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const table = doc.FetchTable(0) as ScTable;
  for (let row = 0; row < 3; ++row) {
    doc.SetValue(new ScAddress(0, row, 0), row + 10);
    doc.SetFormula(new ScAddress(1, row, 0), unicode(`=A${row + 1}+1`), grammar);
  }
  const column = table.CreateColumnIfNotExists(1),
    context = new RefUpdateContext(doc);
  column.RegroupFormulaCells();
  doc.SetFormula(new ScAddress(1, 1, 0), unicode("=A2+1"), grammar);
  context.meMode = UpdateRefMode.URM_COPY;
  context.maRange.assign(new ScRange(1, 1, 0, 1, 1, 0));
  context.mnRowDelta = 1;
  expect(column.UpdateReference(context)).toBe(false);
  expect((doc.GetFormulaCell(new ScAddress(1, 0, 0)) as ScFormulaCell).GetSharedLength()).toBe(3);
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(12);
  const formula = (doc.GetFormulaCell(new ScAddress(1, 1, 0)) as ScFormulaCell).GetFormula(grammar);
  expect(text(formula)).toBe("=A2+1");
  formula.dispose();
  doc.Dispose();
});
it("recompiles the actual referenced cell and preserves the first on-move undo formula", /** Native false return does not mean the compile and undo phases did nothing. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  doc.InsertTab(0, unicode("Data"));
  undo.InitUndo(doc, 0, 0);
  const position = new ScAddress(1, 1, 0),
    cell = new ScFormulaCell(doc, position, unicode("=A2+1"), grammar);
  doc.SetFormulaCell(position, cell);
  doc.SetValue(new ScAddress(0, 1, 0), 4);
  expect(cell.GetValue()).toBe(5);
  const context = new RefUpdateContext(doc);
  context.meMode = UpdateRefMode.URM_COPY;
  context.maRange.assign(new ScRange(position, position));
  context.mnRowDelta = 1;
  cell.GetCode().SetRecalcModeOnRefMove();
  cell.SetCompile(true);
  expect(cell.UpdateReference(context, undo)).toBe(false);
  expect(cell.IsChanged()).toBe(true);
  expect(cell.GetDirty()).toBe(true);
  const saved = undo.GetFormulaCell(position);
  expect(saved).not.toBe(null);
  cell.SetChanged(false);
  cell.UpdateReference(context, undo);
  expect(undo.GetFormulaCell(position)).toBe(saved);
  expect(cell.IsChanged()).toBe(false);
  expect(doc.GetAutoCalc()).toBe(true);
  undo.Dispose();
  doc.Dispose();
});
it("retains copy dispatch guards,unrepresented shift boundaries and cached column positions", /** Actual normal,clipboard and undo owners exercise their native early returns. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  const context = new RefUpdateContext(doc),
    column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0);
  expect(column.UpdateReference(context)).toBe(false);
  doc.SetValue(new ScAddress(), 8);
  expect(
    /** Non-copy engine is an explicit admission boundary. @returns Flag. */ () =>
      column.UpdateReference(context),
  ).toThrow("Non-copy column");
  context.meMode = UpdateRefMode.URM_COPY;
  const positions = new ColumnBlockPositionSet(doc);
  context.setBlockPositionReference(positions);
  expect(column.UpdateReference(context)).toBe(false);
  doc.SetFormula(new ScAddress(0, 0, 0), unicode("=1"), grammar);
  const cell = doc.GetFormulaCell(new ScAddress()) as ScFormulaCell;
  expect(cell.UpdateReference(context)).toBe(false);
  expect(cell.UpdateReferenceOnCopy(new RefUpdateContext(doc), null, null)).toBe(false);
  context.meMode = UpdateRefMode.URM_REORDER;
  expect(cell.UpdateReference(context)).toBe(false);
  context.meMode = UpdateRefMode.URM_MOVE;
  expect(
    /** Source-specific move engine is not silently approximated. @returns Flag. */ () =>
      cell.UpdateReference(context),
  ).toThrow("shift/move");
  const clipCell = new ScFormulaCell(clip, new ScAddress(), unicode("=1"), grammar);
  clip.SetFormulaCell(new ScAddress(), clipCell);
  expect(clipCell.UpdateReference(context)).toBe(false);
  expect((clip.FetchTable(0) as ScTable).CreateColumnIfNotExists(0).UpdateReference(context)).toBe(
    false,
  );
  context.meMode = UpdateRefMode.URM_COPY;
  context.maRange.assign(new ScRange(0, doc.MaxRow(), 0, 0, doc.MaxRow(), 0));
  context.setBlockPositionReference(null);
  expect(column.UpdateReference(context)).toBe(false);
  clip.Dispose();
  doc.Dispose();
});
it("recompiles in place while retaining formula-tree membership and real listener ownership", /** Recompile changes code,result and subscriptions without replacing the cell. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const position = new ScAddress(1, 0, 0);
  doc.SetValue(new ScAddress(), 3);
  doc.SetFormula(position, unicode("=A1+1"), grammar);
  const cell = doc.GetFormulaCell(position) as ScFormulaCell;
  expect(cell.GetValue()).toBe(4);
  doc.PutInFormulaTree(cell);
  cell.SetCompile(true);
  cell.CompileTokenArray();
  expect(doc.IsInFormulaTree(cell)).toBe(true);
  expect(cell.IsChanged()).toBe(true);
  cell.Compile(unicode("=A1+2"), false, grammar);
  cell.SetDirty();
  expect(cell.GetValue()).toBe(5);
  doc.SetValue(new ScAddress(), 10);
  expect(cell.GetValue()).toBe(12);
  cell.SetCompile(true);
  doc.SetInsertingFromOtherDoc(true);
  cell.CompileTokenArray();
  doc.SetInsertingFromOtherDoc(false);
  cell.SetCompile(false);
  cell.CompileTokenArray(true);
  cell.Compile(unicode("=1+"), true, grammar);
  expect(cell.IsChanged()).toBe(true);
  doc.Dispose();
});
it("limits document copy updates to actual sparse sheets and allocated destination columns", /** No copy-reference phase creates sheets or columns. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  for (let tab = 0; tab < 3; ++tab) doc.InsertTab(tab, unicode(`Sheet${tab}`));
  clip.ResetClip(doc, 2);
  const context = new RefUpdateContext(clip);
  context.meMode = UpdateRefMode.URM_COPY;
  context.maRange.assign(new ScRange(0, 0, 0, 5, 5, 4));
  clip.UpdateReference(context);
  const table = doc.FetchTable(0) as ScTable;
  doc.SetValue(new ScAddress(), 2);
  const normal = new RefUpdateContext(doc);
  normal.meMode = UpdateRefMode.URM_COPY;
  normal.maRange.assign(new ScRange(0, 0, 0, 5, 5, 4));
  const allocated = table.GetAllocatedColumnsCount();
  doc.UpdateReference(normal);
  expect(table.GetAllocatedColumnsCount()).toBe(allocated);
  normal.maRange.assign(new ScRange(-1, 0, 0, 0, 0, 0));
  doc.UpdateReference(normal);
  normal.maRange.assign(new ScRange());
  normal.meMode = UpdateRefMode.URM_MOVE;
  expect(
    /** Non-copy global services remain explicit. @returns Nothing. */ () =>
      doc.UpdateReference(normal),
  ).toThrow("Non-copy document");
  expect(
    /** Non-copy sheet services remain explicit. @returns Nothing. */ () =>
      table.UpdateReference(normal),
  ).toThrow("Non-copy table");
  clip.Dispose();
  doc.Dispose();
});
it("handles original hybrid compile recursion guards and compiler error states", /** Imported hybrid result tokens retain their actual formula ownership. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  for (const source of ["=", " "]) {
    const cell = new ScFormulaCell(doc, new ScAddress(), unicode("=1"), grammar);
    cell.GetCode().Clear();
    cell.SetResultToken(
      new ScHybridCellToken(0, SharedString.getEmptyString(), unicode(source), false),
    );
    expect(
      /** Native bad token reaches the existing shared compiler admission boundary. @returns Nothing. */ () =>
        cell.CompileTokenArray(true),
    ).toThrow("Formula opcode");
    expect(cell.GetCode().GetLen()).toBe(1);
    cell.Dispose();
  }
  const cell = new ScFormulaCell(doc, new ScAddress(), unicode("=1"), grammar);
  cell.SetResultToken(
    new ScHybridCellToken(0, SharedString.getEmptyString(), unicode("=2"), false),
  );
  cell.Compile(unicode(""), true, grammar);
  expect(cell.GetValue()).toBe(2);
  cell.SetCompile(true);
  cell.GetCode().SetCodeError(FormulaError.NoName);
  cell.CompileTokenArray();
  expect(cell.GetCode().GetCodeError()).toBe(FormulaError.NoName);
  cell.Compile(unicode("=)"), true, grammar);
  expect(cell.IsChanged()).toBe(true);
  cell.Dispose();
  doc.Dispose();
});
it("retains clipboard compile guards and the shared recompilation boundary", /** Native operation flags are set through real public owner methods. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  const imported = new ScFormulaCell(clip, new ScAddress(), unicode("=1"), grammar);
  imported.Compile(unicode("=2"), false, grammar);
  imported.SetCompile(true);
  imported.CompileTokenArray();
  expect(imported.GetValue()).toBe(0);
  imported.Dispose();
  for (let row = 0; row < 2; row++)
    doc.SetFormula(new ScAddress(0, row, 0), unicode(`=B${row + 1}`), grammar);
  (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0).RegroupFormulaCells();
  const member = doc.GetFormulaCell(new ScAddress(0, 1, 0)) as ScFormulaCell;
  expect(
    /** Native shared shift remains unported. @returns Flag. */ () =>
      member.UpdateReference(new RefUpdateContext(doc)),
  ).toThrow("shared formula shift");
  expect(
    /** Shared recompilation requires the native unsharing caller. @returns Nothing. */ () =>
      member.Compile(unicode("=1"), true, grammar),
  ).toThrow("unshared");
  clip.Dispose();
  doc.Dispose();
});
it("retains unchanged positions,explicit undo coordinates and disabled automatic calculation", /** Copy metadata is processed independently of code relocation. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  doc.InsertTab(0, unicode("Data"));
  undo.InitUndo(doc, 0, 0);
  const cell = new ScFormulaCell(doc, new ScAddress(1, 1, 0), unicode("=A2"), grammar),
    context = new RefUpdateContext(doc);
  context.meMode = UpdateRefMode.URM_COPY;
  expect(cell.UpdateReference(context)).toBe(false);
  cell.GetCode().SetRecalcModeOnRefMove();
  expect(cell.UpdateReference(context, undo)).toBe(false);
  expect(undo.GetFormulaCell(new ScAddress(1, 1, 0))).toBe(null);
  context.maRange.assign(new ScRange(1, 1, 0, 1, 1, 0));
  context.mnColDelta = 1;
  const undoAt = new ScAddress(3, 4, 0);
  doc.SetAutoCalc(false);
  expect(cell.UpdateReference(context, undo, undoAt)).toBe(false);
  expect(undo.GetFormulaCell(undoAt)).not.toBe(null);
  expect(doc.GetAutoCalc()).toBe(false);
  cell.Dispose();
  undo.Dispose();
  doc.Dispose();
});
it("recompiles a clipboard aggregate whose range is already a compiled double reference", /** Copied lexical range code and shared pooled owners are genuine. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  const source = new ScFormulaCell(doc, new ScAddress(), unicode("=SUM(B1:B2)"), grammar);
  const imported = new ScFormulaCell(source, clip, new ScAddress());
  imported.SetCompile(true);
  const copied = new ScFormulaCell(imported, doc, new ScAddress(2, 2, 0));
  expect(copied.IsChanged()).toBe(true);
  const context = new RefUpdateContext(doc);
  context.meMode = UpdateRefMode.URM_COPY;
  context.maRange.assign(new ScRange(2, 2, 0, 2, 2, 0));
  copied.UpdateReference(context);
  expect(copied.IsChanged()).toBe(true);
  source.Dispose();
  imported.Dispose();
  copied.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("defers genuine range-operator,column-name and table-reference lexical code", /** Precompiled native arrays retain separate lexical and expanded RPN owners,as in existing native token tests. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  const reference = new ScSingleRefData();
  reference.InitAddress(0, 0, 0);
  const area = new ScComplexRefData();
  area.InitRange(0, 0, 0, 0, 1, 0);
  const expanded = new ScDoubleRefToken(doc.GetSheetLimits(), area);
  const variants: FormulaToken[][] = [
    [
      new ScSingleRefToken(doc.GetSheetLimits(), reference),
      new FormulaByteToken(OpCode.ocRange),
      new ScSingleRefToken(doc.GetSheetLimits(), reference),
    ],
    [new ScSingleRefToken(doc.GetSheetLimits(), reference, OpCode.ocColRowName)],
    [new ScTableRefToken(2, ScTableRefToken.Item.DATA)],
  ];
  for (const lexical of variants) {
    const code = new ScTokenArray(clip);
    for (const token of lexical) code.AddToken(token);
    code.CreateNewRPNArrayFromData([expanded], 1);
    const source = new ScFormulaCell(clip, new ScAddress(), code, grammar);
    source.SetCompile(true);
    const copied = new ScFormulaCell(source, doc, new ScAddress());
    expect(copied.IsChanged()).toBe(false);
    source.Dispose();
    copied.Dispose();
  }
  clip.Dispose();
  doc.Dispose();
});
