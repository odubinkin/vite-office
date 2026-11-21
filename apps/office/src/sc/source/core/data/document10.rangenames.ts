/** @fileoverview Source all-scope name replacement and hybrid formula boundaries. */
import { OpCode } from "../../../../formula/inc/opcode";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { SfxHintId } from "../../../../svl/inc/hint";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { ScMatrixMode, type ScFormulaCell } from "../../../inc/formulacell";
import { ScCompiler } from "../tool/compiler";
import type { ScRangeNameMap } from "../tool/rangenam";
import type { ScFormulaCellGroup } from "./formulacellgroup";
import type { ScTokenArray } from "../tool/token";

/** Original hybrid string before and after resolving renamed indexes. */
export interface ScRangeNameFormula {
  readonly position: ScAddress;
  readonly before: string;
  readonly after: string;
}

/** Captures the formulas containing a source name token before replacing the scope maps. @param document - Live workbook. @param replacement - New scopes. @returns Hybrid formula pairs. */
export function PreprocessAllRangeNamesUpdate(
  document: ScDocument,
  replacement: ScRangeNameMap,
): ScRangeNameFormula[] {
  const changes: ScRangeNameFormula[] = [];
  const grammar = document.GetGrammar();
  for (let tab = 0; tab < document.GetTableCount(); tab++) {
    const iterator = new ScHorizontalCellIterator(
      document,
      tab,
      0,
      0,
      document.MaxCol(),
      document.MaxRow(),
    );
    const x: [number] = [0],
      y: [number] = [0];
    for (let entry = iterator.GetNext(x, y); entry; entry = iterator.GetNext(x, y)) {
      const cell = entry.getFormula();
      const code = cell?.GetCode();
      if (!code?.GetArray()?.some((token) => token.GetOpCode() === OpCode.ocName)) continue;
      const position = new ScAddress(x[0], y[0], tab);
      const compiler = new ScCompiler(document, position, code, grammar);
      const symbol = new OUString();
      try {
        compiler.CreateStringFromTokenArray(symbol);
        const before = "=" + text(symbol);
        compiler.SetRangeNameUpdate(replacement).CreateStringFromTokenArray(symbol);
        changes.push({ position, before, after: "=" + text(symbol) });
      } finally {
        symbol.dispose();
      }
    }
  }
  return changes;
}

/** Applies a scope map between listener teardown and hybrid compilation. @param document - Workbook. @param names - Snapshot to install. @param formulas - Affected cells. @param forward - Choose edited spellings. @returns Nothing. */
export function SetAllRangeNames(
  document: ScDocument,
  names: ScRangeNameMap,
  formulas: readonly ScRangeNameFormula[],
  forward: boolean,
): void {
  const affected: { cell: ScFormulaCell; formula: ScRangeNameFormula }[] = [];
  const groups = new Map<ScFormulaCellGroup, ScRangeNameFormula>();
  for (const formula of formulas) {
    const cell = document.GetFormulaCell(formula.position);
    if (!cell || cell.GetMatrixFlag() === ScMatrixMode.Reference) continue;
    cell.EndListeningTo(document);
    affected.push({ cell, formula });
    const group = cell.GetCellGroup();
    if (group?.mpTopCell === cell) groups.set(group, formula);
  }
  for (const [scope, list] of names) document.GetRangeName(scope)?.Assign(list);
  const grammar = document.GetGrammar();
  const previousGroupCodes: ScTokenArray[] = [];
  for (const [group, formula] of groups) {
    const value = unicode(forward ? formula.after : formula.before);
    const previousCode = group.mpCode;
    try {
      const code = new ScCompiler(document, formula.position, grammar).CompileString(value);
      try {
        group.setCode(code);
        group.compileCode(document, formula.position, grammar);
      } finally {
        code.Clear();
      }
    } finally {
      if (previousCode && group.mpCode !== previousCode) previousGroupCodes.push(previousCode);
      value.dispose();
    }
  }
  for (const { cell } of affected) cell.SyncSharedCode();
  for (const code of previousGroupCodes) code.Clear();
  for (const { cell, formula } of affected) {
    if (!cell.IsShared()) {
      const value = unicode(forward ? formula.after : formula.before);
      const geometry = cell.GetMatColsRows();
      try {
        cell.Compile(value, true, grammar);
        if (geometry) cell.SetMatColsRows(...geometry);
      } finally {
        value.dispose();
      }
    }
    if (cell.GetCode().GetCodeError() === FormulaError.NONE) cell.StartListeningTo(document);
  }
  for (const { cell, formula } of affected) {
    cell.SetDirty();
    document.BroadcastCells(new ScRange(formula.position), SfxHintId.ScDataChanged);
  }
  for (let tab = 0; tab < document.GetTableCount(); tab++)
    document.FetchTable(tab)?.SetStreamValid(false);
}
