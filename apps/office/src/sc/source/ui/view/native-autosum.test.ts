/** @fileoverview Independent source-bound AutoSum reference/directional vectors over actual Calc tokens,columns and views. */
import type { ScDocumentPool } from "../../core/data/docpool";
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange, MAXCOL, MAXROW } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { ScDirection, CellType } from "../../../inc/global";
import { ScCompiler } from "../../../inc/compiler";
import { ScViewData } from "../inc/viewdata";
import { ScTabViewShell } from "../inc/tabvwsh";
import { ScFormulaCell } from "../../../inc/formulacell";
import { HasAttrFlags } from "../../../inc/global";
import { ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
import { ScCondFormatItem } from "../../../inc/attrib";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import type { ScRotateValueItem } from "../../../inc/attrib";
import type { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellHorJustify } from "../../../../editeng/inc/svxenum";
import {
  ATTR_STACKED,
  ATTR_LINEBREAK,
  ATTR_HOR_JUSTIFY,
  ATTR_ROTATE_VALUE,
} from "../../../inc/scitems";
import { ScDocShell } from "../docshell/docsh";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { OpCode } from "../../../../formula/inc/opcode";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Uses actual default shell/view owners. @returns Live owners. */
function setup(): {
  doc: ScDocument;
  view: ScViewData;
  functions: ScTabViewShell;
  shell: ScDocShell;
} {
  const shell = new ScDocShell(),
    doc = shell.GetDocument(),
    functions = new ScTabViewShell(shell),
    view = functions.GetViewData();
  return { doc, view, functions, shell };
}
/** Compiles actual tokens with the document's real convention. @param doc - Document. @param position - Formula position. @param source - Formula text. @returns Token array. */
function compile(doc: ScDocument, position: ScAddress, source: string) {
  const compiler = new ScCompiler(doc, position, doc.GetGrammar()),
    array = compiler.CompileString(unicode(source));
  compiler.CompileTokenArray();
  return array;
}
/** Reads original ordered output coordinates. @param ranges - Native list. @returns Independent coordinate observations. */
function coordinates(ranges: ScRangeList) {
  return Array.from(
    ranges,
    /** Copies original coordinates. @param r - Range. @returns Coordinates. */ (r) => r.GetVars(),
  );
}

it("preserves original directional outer-function reference extension and early output boundaries", /** Real scalar/double RPN tokens participate in every source direction. @returns Nothing. */ () => {
  const { doc } = setup(),
    pos = new ScAddress(3, 3, 0);
  for (const [source, direction, expected] of [
    ["=SUM(D5)", ScDirection.DIR_BOTTOM, 4],
    ["=SUM(D5:D8)", ScDirection.DIR_BOTTOM, 7],
    ["=SUM(E4)", ScDirection.DIR_RIGHT, 4],
    ["=SUM(E4:H4)", ScDirection.DIR_RIGHT, 7],
    ["=SUM(D3)", ScDirection.DIR_TOP, 2],
    ["=SUM(D1:D3)", ScDirection.DIR_TOP, 0],
    ["=SUM(C4)", ScDirection.DIR_LEFT, 2],
    ["=SUM(A4:C4)", ScDirection.DIR_LEFT, 0],
  ] as const) {
    const output: [number] = [99];
    expect(compile(doc, pos, source).GetAdjacentExtendOfOuterFuncRefs(output, pos, direction)).toBe(
      true,
    );
    expect(output[0]).toBe(expected);
  }
  const array = compile(doc, pos, "=SUM(1)"),
    output: [number] = [99];
  for (const [position, direction] of [
    [new ScAddress(0, MAXROW, 0), ScDirection.DIR_BOTTOM],
    [new ScAddress(MAXCOL, 0, 0), ScDirection.DIR_RIGHT],
    [new ScAddress(), ScDirection.DIR_TOP],
    [new ScAddress(), ScDirection.DIR_LEFT],
  ] as const) {
    expect(array.GetAdjacentExtendOfOuterFuncRefs(output, position, direction)).toBe(false);
    expect(output[0]).toBe(99);
  }
  expect(array.GetAdjacentExtendOfOuterFuncRefs(output, pos, 99 as ScDirection)).toBe(false);
  expect(output[0]).toBe(99);
  for (const source of ["=1", "=SUM()", "=SUM(D2)", "=SUM(D1:D2)", "=SUM(2;3)"]) {
    expect(
      compile(doc, pos, source).GetAdjacentExtendOfOuterFuncRefs(output, pos, ScDirection.DIR_TOP),
    ).toBe(false);
    expect(output[0]).toBe(3);
  }
  doc.Dispose();
});

it("retains upstream axis-only adjacency instead of inventing same-column or same-row guards", /** Literal witnesses show the original method ignores the other reference axis. @returns Nothing. */ () => {
  const { doc } = setup(),
    position = new ScAddress(0, 3, 0),
    output: [number] = [99];
  expect(
    compile(doc, position, "=SUM(B1:B3)").GetAdjacentExtendOfOuterFuncRefs(
      output,
      position,
      ScDirection.DIR_TOP,
    ),
  ).toBe(true);
  expect(output[0]).toBe(0);
  doc.Dispose();
});

it("rejects gaps in each directional reference scan and leaves uncompiled code without RPN adjacency", /** Independent negative reference vectors complement the neighboring-cell cases. @returns Nothing. */ () => {
  const { doc } = setup(),
    position = new ScAddress(3, 3, 0);
  for (const [direction, source] of [
    [ScDirection.DIR_BOTTOM, "=SUM(D6)"],
    [ScDirection.DIR_BOTTOM, "=SUM(D6:D8)"],
    [ScDirection.DIR_RIGHT, "=SUM(F4)"],
    [ScDirection.DIR_RIGHT, "=SUM(F4:H4)"],
    [ScDirection.DIR_LEFT, "=SUM(B4)"],
    [ScDirection.DIR_LEFT, "=SUM(A4:B4)"],
  ] as const) {
    const output: [number] = [99];
    expect(
      compile(doc, position, source).GetAdjacentExtendOfOuterFuncRefs(output, position, direction),
    ).toBe(false);
    expect(output[0]).toBe(3);
  }
  const compiler = new ScCompiler(doc, position, doc.GetGrammar()),
    uncompiled = compiler.CompileString(unicode("=SUM(D3)")),
    output: [number] = [99];
  expect(uncompiled.GetCodeLen()).toBe(0);
  expect(uncompiled.GetAdjacentExtendOfOuterFuncRefs(output, position, ScDirection.DIR_TOP)).toBe(
    false,
  );
  expect(output[0]).toBe(3);
  doc.Dispose();
});

it("prefers adjacent vertical data before horizontal data and serializes actual relative range tokens", /** Expected references are independent source-priority vectors. @returns Nothing. */ () => {
  const { doc, view, functions } = setup();
  doc.SetValue(new ScAddress(1, 0, 0), 2);
  doc.SetValue(new ScAddress(1, 1, 0), 3);
  doc.SetValue(new ScAddress(0, 2, 0), 9);
  view.SetCurX(1);
  view.SetCurY(2);
  const ranges = new ScRangeList();
  expect(functions.GetAutoSumArea(ranges)).toBe(true);
  expect(coordinates(ranges)).toEqual([[1, 0, 0, 1, 1, 0]]);
  const source = functions.GetAutoSumFormula(ranges, false, new ScAddress(1, 2, 0), OpCode.ocSum);
  expect(text(source)).toBe("=SUM(B1:B2)");
  source.dispose();
  doc.SetGrammar(FormulaGrammar.Grammar.GRAM_ODFF);
  const odff = functions.GetAutoSumFormula(ranges, false, new ScAddress(1, 2, 0), OpCode.ocAverage);
  expect(text(odff)).toBe("=AVERAGE([.B1:.B2])");
  odff.dispose();
  doc.Dispose();
});

it("preserves native twenty-cell seek cutoff and the left fallback after an empty top search", /** Both cutoff endpoints use actual sparse column storage. @returns Nothing. */ () => {
  const { doc, view, functions } = setup();
  doc.SetValue(new ScAddress(0, 0, 0), 2);
  view.SetCurY(20);
  let ranges = new ScRangeList();
  expect(functions.GetAutoSumArea(ranges)).toBe(true);
  expect(coordinates(ranges)).toEqual([[0, 0, 0, 0, 19, 0]]);
  view.SetCurY(21);
  ranges = new ScRangeList();
  expect(functions.GetAutoSumArea(ranges)).toBe(false);
  expect(ranges.empty()).toBe(true);
  doc.SetValue(new ScAddress(0, 21, 0), 7);
  view.SetCurX(2);
  ranges = new ScRangeList();
  expect(functions.GetAutoSumArea(ranges)).toBe(true);
  expect(coordinates(ranges)).toEqual([[0, 21, 0, 1, 21, 0]]);
  doc.Dispose();
});

it("builds original sum-of-sums ranges while excluding intervening raw data", /** Existing aggregate references determine the native preceding extent. @returns Nothing. */ () => {
  const { doc, view, functions } = setup();
  doc.SetValue(new ScAddress(0, 0, 0), 2);
  doc.SetFormula(new ScAddress(0, 1, 0), unicode("=SUM(A1:A1)"), doc.GetGrammar());
  doc.SetValue(new ScAddress(0, 2, 0), 3);
  doc.SetFormula(new ScAddress(0, 3, 0), unicode("=SUM(A3:A3)"), doc.GetGrammar());
  view.SetCurY(4);
  const ranges = new ScRangeList();
  expect(functions.GetAutoSumArea(ranges)).toBe(true);
  expect(coordinates(ranges)).toEqual([
    [0, 3, 0, 0, 3, 0],
    [0, 1, 0, 0, 1, 0],
  ]);
  const result = functions.GetAutoSumFormula(ranges, false, new ScAddress(0, 4, 0), OpCode.ocSum);
  expect(text(result)).toBe("=SUM(A4:A4;A2:A2)");
  result.dispose();
  doc.Dispose();
});

it("retains source treatment of unrecognized adjacent outer functions and initialized block emptiness", /** SUMSQ is numeric but absent from the original AutoSum classification switch. @returns Nothing. */ () => {
  const { doc, view, functions } = setup();
  doc.SetValue(new ScAddress(), 2);
  doc.SetFormula(new ScAddress(0, 1, 0), unicode("=SUMSQ(A1:A1)"), doc.GetGrammar());
  view.SetCurY(2);
  const ranges = new ScRangeList();
  expect(functions.GetAutoSumArea(ranges)).toBe(true);
  expect(coordinates(ranges)).toEqual([[0, 0, 0, 0, 1, 0]]);
  expect(doc.IsBlockEmpty(0, 0, 0, 0, 99)).toBe(false);
  expect(doc.IsBlockEmpty(-1, 0, 0, 0, 0)).toBe(false);
  expect(doc.IsBlockEmpty(0, 0, MAXCOL + 1, 0, 0)).toBe(false);
  expect(doc.IsBlockEmpty(4, 0, 5, 2, 0)).toBe(true);
  expect(doc.IsBlockEmpty(0, 0, 0, 0, 0)).toBe(false);
  const empty = functions.GetAutoSumFormula(
    new ScRangeList(),
    false,
    new ScAddress(),
    OpCode.ocSum,
  );
  expect(text(empty)).toBe("=SUM()");
  empty.dispose();
  expect(
    /** Keeps unavailable filtered execution explicit. @returns Formula. */ () =>
      functions.GetAutoSumFormula(
        new ScRangeList(new ScRange()),
        true,
        new ScAddress(),
        OpCode.ocSum,
      ),
  ).toThrow(/SUBTOTAL/);
  assert(doc.GetGrammar() === FormulaGrammar.Grammar.GRAM_NATIVE);
  doc.Dispose();
});

it("inserts genuine selected-column sums through original formula operations and per-cell undo", /** Selection,formula ownership and history remain in the real kernel. @returns Nothing. */ () => {
  const { doc, view, functions, shell } = setup(),
    range = new ScRange(0, 0, 0, 1, 1, 0);
  doc.SetValue(new ScAddress(0, 0, 0), 1);
  doc.SetValue(new ScAddress(0, 1, 0), 3);
  doc.SetValue(new ScAddress(1, 0, 0), 2);
  doc.SetValue(new ScAddress(1, 1, 0), 4);
  view.GetMarkData().SetMarkArea(range);
  const finder: [boolean] = [true],
    subtotal: [boolean] = [true],
    source = functions.DoAutoSum(finder, subtotal, OpCode.ocSum);
  expect(source.isEmpty()).toBe(true);
  source.dispose();
  expect(finder[0]).toBe(false);
  expect(subtotal[0]).toBe(false);
  expect(doc.GetValue(new ScAddress(0, 2, 0))).toBe(4);
  expect(doc.GetValue(new ScAddress(1, 2, 0))).toBe(6);
  expect([view.GetCurX(), view.GetCurY()]).toEqual([1, 2]);
  expect(view.GetMarkData().GetMarkArea().GetVars()).toEqual([0, 0, 0, 1, 2, 0]);
  expect(shell.GetUndoManager().GetUndoActionCount()).toBe(2);
  shell.Undo();
  expect(doc.GetFormulaCell(new ScAddress(1, 2, 0))).toBeNull();
  shell.Undo();
  expect(doc.GetFormulaCell(new ScAddress(0, 2, 0))).toBeNull();
  shell.Redo();
  shell.Redo();
  expect(doc.GetValue(new ScAddress(1, 2, 0))).toBe(6);
  shell.Close();
});

it("keeps native row totals,unselected drafts and blank-data fallbacks separate", /** Real marks and source output flags determine whether input begins or data is inserted. @returns Nothing. */ () => {
  const { doc, view, functions, shell } = setup(),
    range = new ScRange(0, 0, 0, 2, 1, 0);
  doc.SetValue(new ScAddress(0, 0, 0), 1);
  doc.SetValue(new ScAddress(1, 0, 0), 2);
  doc.SetValue(new ScAddress(0, 1, 0), 3);
  doc.SetValue(new ScAddress(1, 1, 0), 4);
  expect(functions.AutoSum(range, false, true, false, OpCode.ocSum)).toBe(true);
  expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(3);
  expect(doc.GetValue(new ScAddress(2, 1, 0))).toBe(7);
  view.GetMarkData().ResetMark();
  view.SetCurX(3);
  view.SetCurY(1);
  const finder: [boolean] = [false],
    subtotal: [boolean] = [false],
    source = functions.DoAutoSum(finder, subtotal, OpCode.ocSum);
  expect(text(source)).toBe("=SUM(C2:C2)");
  expect(finder[0]).toBe(true);
  source.dispose();
  expect(functions.AutoSum(new ScRange(9, 9, 0, 10, 10, 0), false, true, false, OpCode.ocSum)).toBe(
    false,
  );
  view.GetMarkData().SetMarkArea(new ScRange(9, 9, 0, 10, 10, 0));
  view.SetCurX(9);
  view.SetCurY(9);
  const empty = functions.DoAutoSum(finder, subtotal, OpCode.ocSum);
  expect(empty.isEmpty()).toBe(true);
  empty.dispose();
  shell.Close();
});

it("retains interactive manual-calculation results and actual source filtered-row detection", /** API calls and UI calls use the same prepared native formula owner. @returns Nothing. */ () => {
  const { doc, functions, shell } = setup(),
    position = new ScAddress(0, 0, 0);
  doc.SetAutoCalc(false);
  const cell = new ScFormulaCell(doc, position, unicode("=2+3"), doc.GetGrammar());
  expect(shell.GetDocFunc().SetFormulaCell(position, cell, true)).toBe(true);
  expect(doc.GetFormulaCell(position)).toBe(cell);
  expect(doc.GetValue(position)).toBe(5);
  expect(cell.GetDirty()).toBe(true);
  const apiPosition = new ScAddress(1, 0, 0),
    apiCell = new ScFormulaCell(doc, apiPosition, unicode("=4+3"), doc.GetGrammar());
  shell.GetDocFunc().SetFormulaCell(apiPosition, apiCell, false);
  expect(apiCell.GetDirty()).toBe(true);
  const ranges = new ScRangeList(new ScRange(0, 0, 0, 1, 3, 0));
  expect(functions.UseSubTotal(ranges)).toBe(false);
  doc.SetRowFiltered(2, 2, 0, true);
  expect(functions.UseSubTotal(ranges)).toBe(true);
  shell.Close();
});

it("queries original NeedHeight attributes through actual sparse patterns and default-column tails", /** All five source attribute branches use real registered item classes. @returns Nothing. */ () => {
  const { doc, shell } = setup();
  expect(doc.HasAttrib(new ScRange(0, 0, 0, 5, 1, 0), HasAttrFlags.NeedHeight)).toBe(false);
  for (const which of [ATTR_STACKED, ATTR_LINEBREAK, ATTR_HOR_JUSTIFY, 154, ATTR_ROTATE_VALUE]) {
    const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
    if (which === 154) pattern.GetItemSet().Put(new ScCondFormatItem(1));
    else {
      const item = (doc.GetPool() as ScDocumentPool).GetPoolDefaultItem(which).Clone();
      assert(item);
      if (which === ATTR_STACKED || which === ATTR_LINEBREAK) (item as SfxBoolItem).SetValue(true);
      else if (which === ATTR_HOR_JUSTIFY)
        (item as SvxHorJustifyItem).SetValue(SvxCellHorJustify.Block);
      else (item as ScRotateValueItem).SetValue(4500);
      pattern.GetItemSet().Put(item);
    }
    doc.ApplyPatternAreaTab(0, 2, 0, 3, 0, pattern);
    expect(doc.HasAttrib(new ScRange(0, 2, 0, 0, 3, 0), HasAttrFlags.NeedHeight)).toBe(true);
    if (which === ATTR_LINEBREAK) {
      const height = (
          doc.FetchTable(0) as NonNullable<ReturnType<ScDocument["FetchTable"]>>
        ).GetRowHeight(2),
        position = new ScAddress(0, 2, 0);
      shell
        .GetDocFunc()
        .SetFormulaCell(
          position,
          new ScFormulaCell(doc, position, unicode("=1"), doc.GetGrammar()),
          true,
        );
      expect(doc.GetValue(position)).toBe(1);
      expect(
        (doc.FetchTable(0) as NonNullable<ReturnType<ScDocument["FetchTable"]>>).GetRowHeight(2),
      ).toBe(height);
    }
    const cleared = new CellAttributeHolder(new ScPatternAttr(doc.getCellAttributeHelper()));
    try {
      doc.SetPattern(0, 2, 0, cleared);
      doc.SetPattern(0, 3, 0, cleared);
    } finally {
      cleared.Dispose();
    }
    expect(doc.HasAttrib(new ScRange(0, 2, 0, 0, 3, 0), HasAttrFlags.NeedHeight)).toBe(false);
  }
  expect(
    /** Leaves other native masks explicit. @returns Query. */ () =>
      doc.HasAttrib(new ScRange(), HasAttrFlags.Protected),
  ).toThrow(/NeedHeight/);
  shell.Close();
});

it("retains original selected aggregate chains in both axes with live native dependencies", /** Actual SUM references determine ordered sum-of-sums ranges rather than flattening numeric results. @returns Nothing. */ () => {
  for (const horizontal of [false, true]) {
    const { doc, functions, shell } = setup();
    const first = new ScAddress(0, 0, 0),
      second = horizontal ? new ScAddress(1, 0, 0) : new ScAddress(0, 1, 0),
      third = horizontal ? new ScAddress(2, 0, 0) : new ScAddress(0, 2, 0),
      fourth = horizontal ? new ScAddress(3, 0, 0) : new ScAddress(0, 3, 0),
      result = horizontal ? new ScAddress(4, 0, 0) : new ScAddress(0, 4, 0);
    doc.SetValue(first, 1);
    doc.SetFormula(second, unicode("=SUM(A1:A1)"), doc.GetGrammar());
    doc.SetValue(third, 2);
    doc.SetFormula(fourth, unicode(horizontal ? "=SUM(C1:C1)" : "=SUM(A3:A3)"), doc.GetGrammar());
    expect(functions.AutoSum(new ScRange(first, fourth), false, false, false, OpCode.ocSum)).toBe(
      true,
    );
    const resultCell = doc.GetFormulaCell(result);
    assert(resultCell);
    expect(text(resultCell.GetFormula(doc.GetGrammar()))).toBe(
      horizontal ? "=SUM(D1:D1;B1:B1)" : "=SUM(A4:A4;A2:A2)",
    );
    expect(doc.GetValue(result)).toBe(3);
    doc.SetValue(first, 5);
    expect(doc.GetValue(result)).toBe(7);
    expect(shell.GetUndoManager().GetUndoActionCount()).toBe(1);
    shell.Undo();
    expect(doc.GetFormulaCell(result)).toBeNull();
    shell.Redo();
    expect(doc.GetValue(result)).toBe(7);
    shell.Close();
  }
});
it("preserves original row and column placement boundaries and skips occupied output spans", /** Sparse actual cells exercise source MaxRow/MaxCol limits without replacing document dimensions. @returns Nothing. */ () => {
  for (const horizontal of [false, true]) {
    const { doc, functions, shell } = setup();
    const bound = horizontal ? doc.MaxCol() : doc.MaxRow(),
      first = horizontal ? new ScAddress(bound - 1, 0, 0) : new ScAddress(0, bound - 1, 0),
      last = horizontal ? new ScAddress(bound, 0, 0) : new ScAddress(0, bound, 0);
    doc.SetValue(first, 2);
    doc.SetValue(last, 3);
    expect(functions.AutoSum(new ScRange(first, last), false, true, false, OpCode.ocSum)).toBe(
      false,
    );
    const before = horizontal ? new ScAddress(bound - 2, 0, 0) : new ScAddress(0, bound - 2, 0);
    doc.SetValue(before, 1);
    expect(functions.AutoSum(new ScRange(before, first), false, true, false, OpCode.ocSum)).toBe(
      false,
    );
    expect(shell.GetUndoManager().GetUndoActionCount()).toBe(0);
    shell.Close();
  }
  for (const horizontal of [false, true]) {
    const { doc, functions, shell } = setup();
    doc.SetValue(new ScAddress(), 2);
    doc.SetValue(horizontal ? new ScAddress(1, 0, 0) : new ScAddress(0, 1, 0), 3);
    doc.SetValue(horizontal ? new ScAddress(2, 0, 0) : new ScAddress(0, 2, 0), 9);
    const end = horizontal ? new ScAddress(1, 0, 0) : new ScAddress(0, 1, 0),
      output = horizontal ? new ScAddress(3, 0, 0) : new ScAddress(0, 3, 0);
    expect(
      functions.AutoSum(new ScRange(new ScAddress(), end), false, true, false, OpCode.ocSum),
    ).toBe(true);
    expect(doc.GetValue(output)).toBe(5);
    const outputCell = doc.GetFormulaCell(output);
    assert(outputCell);
    expect(text(outputCell.GetFormula(doc.GetGrammar()))).toBe(
      horizontal ? "=SUM(A1:B1)" : "=SUM(A1:A2)",
    );
    shell.Close();
  }
});
it("retains directional unknown-function classification and marked text fallback without a fake block fill", /** Genuine SUMSQ references and public marked input reach independent native negative paths. @returns Nothing. */ () => {
  const { doc, functions, view, shell } = setup();
  doc.SetValue(new ScAddress(), 2);
  doc.SetFormula(new ScAddress(1, 0, 0), unicode("=SUMSQ(A1:A1)"), doc.GetGrammar());
  expect(functions.AutoSum(new ScRange(1, 0, 0, 1, 1, 0), false, true, false, OpCode.ocSum)).toBe(
    false,
  );
  doc.SetTextCell(new ScAddress(2, 0, 0), unicode("text"));
  view.GetMarkData().SetMarkArea(new ScRange(2, 0, 0, 2, 0, 0));
  const finder: [boolean] = [true],
    subtotal: [boolean] = [true],
    fallback = functions.DoAutoSum(finder, subtotal, OpCode.ocSum);
  expect(text(fallback)).toBe("=SUM()");
  fallback.dispose();
  expect(finder[0]).toBe(false);
  expect(subtotal[0]).toBe(false);
  view.GetMarkData().SetMarkArea(new ScRange(0, 1, 0, 0, 2, 0));
  view.SetCurX(0);
  view.SetCurY(1);
  const inserted = functions.DoAutoSum(finder, subtotal, OpCode.ocSum);
  expect(text(inserted)).toBe("");
  inserted.dispose();
  expect(doc.GetValue(new ScAddress(0, 1, 0))).toBe(2);
  expect(doc.GetValue(new ScAddress(0, 2, 0))).toBe(2);
  expect(shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(shell.Undo()).toBe(true);
  expect(doc.GetFormulaCell(new ScAddress(0, 1, 0))).toBeNull();
  expect(doc.GetFormulaCell(new ScAddress(0, 2, 0))).toBeNull();
  expect(shell.Redo()).toBe(true);
  expect(doc.GetValue(new ScAddress(0, 2, 0))).toBe(2);
  shell.Close();
});

it("infers original ordered horizontal aggregate chains at the cursor", /** The native horizontal search mirrors its independently tested vertical ordering. @returns Nothing. */ () => {
  const { doc, view, functions, shell } = setup();
  doc.SetValue(new ScAddress(), 2);
  doc.SetFormula(new ScAddress(1, 0, 0), unicode("=SUM(A1:A1)"), doc.GetGrammar());
  doc.SetValue(new ScAddress(2, 0, 0), 3);
  doc.SetFormula(new ScAddress(3, 0, 0), unicode("=SUM(C1:C1)"), doc.GetGrammar());
  view.SetCurX(4);
  const ranges = new ScRangeList();
  expect(functions.GetAutoSumArea(ranges)).toBe(true);
  expect(coordinates(ranges)).toEqual([
    [3, 0, 0, 3, 0, 0],
    [1, 0, 0, 1, 0, 0],
  ]);
  const formula = functions.GetAutoSumFormula(ranges, false, new ScAddress(4, 0, 0), OpCode.ocSum);
  expect(text(formula)).toBe("=SUM(D1:D1;B1:B1)");
  formula.dispose();
  shell.Close();
});
it("stops original selected raw-data totals after a preceding aggregate in each axis", /** Actual aggregate references define the source scan break;selected earlier data is not reparsed or flattened. @returns Nothing. */ () => {
  for (const horizontal of [false, true]) {
    const { doc, functions, shell } = setup();
    doc.SetValue(new ScAddress(), 1);
    const aggregate = horizontal ? new ScAddress(1, 0, 0) : new ScAddress(0, 1, 0),
      next = horizontal ? new ScAddress(2, 0, 0) : new ScAddress(0, 2, 0),
      end = horizontal ? new ScAddress(3, 0, 0) : new ScAddress(0, 3, 0),
      output = horizontal ? new ScAddress(4, 0, 0) : new ScAddress(0, 4, 0);
    doc.SetFormula(aggregate, unicode("=SUM(A1:A1)"), doc.GetGrammar());
    doc.SetValue(next, 2);
    doc.SetValue(end, 3);
    expect(
      functions.AutoSum(new ScRange(new ScAddress(), end), false, true, false, OpCode.ocSum),
    ).toBe(true);
    const cell = doc.GetFormulaCell(output);
    assert(cell);
    expect(text(cell.GetFormula(doc.GetGrammar()))).toBe(
      horizontal ? "=SUM(C1:D1)" : "=SUM(A3:A4)",
    );
    expect(doc.GetValue(output)).toBe(5);
    shell.Close();
  }
});
it("retains native leading empty references and an already selected empty output row or column", /** Transposed literal witnesses exercise the original None-to-Data fallback and inclusive source endpoints. @returns Nothing. */ () => {
  for (const horizontal of [false, true]) {
    const { doc, functions, shell } = setup();
    for (const [col, row, value] of [
      [1, 0, 1],
      [0, 1, 2],
      [1, 1, 3],
      [1, 2, 4],
    ] as const)
      doc.SetValue(horizontal ? new ScAddress(row, col, 0) : new ScAddress(col, row, 0), value);
    const range = horizontal ? new ScRange(0, 0, 0, 3, 1, 0) : new ScRange(0, 0, 0, 1, 3, 0),
      first = horizontal ? new ScAddress(3, 0, 0) : new ScAddress(0, 3, 0),
      second = horizontal ? new ScAddress(3, 1, 0) : new ScAddress(1, 3, 0);
    expect(functions.AutoSum(range, false, true, false, OpCode.ocSum)).toBe(true);
    const formula = doc.GetFormulaCell(first);
    assert(formula);
    expect(text(formula.GetFormula(doc.GetGrammar()))).toBe(
      horizontal ? "=SUM(A1:C1)" : "=SUM(A1:A3)",
    );
    expect(doc.GetValue(first)).toBe(2);
    expect(doc.GetValue(second)).toBe(8);
    expect(shell.GetUndoManager().GetUndoActionCount()).toBe(2);
    shell.Close();
  }
});
it("skips actual empty internal columns or rows while retaining both surrounding totals", /** Sparse real storage distinguishes an empty span from a zero-valued formula result. @returns Nothing. */ () => {
  for (const horizontal of [false, true]) {
    const { doc, functions, shell } = setup();
    for (const [col, row, value] of [
      [0, 0, 2],
      [0, 1, 3],
      [2, 0, 4],
      [2, 1, 5],
    ] as const)
      doc.SetValue(horizontal ? new ScAddress(row, col, 0) : new ScAddress(col, row, 0), value);
    expect(functions.AutoSum(new ScRange(0, 0, 0, 2, 2, 0), false, true, false, OpCode.ocSum)).toBe(
      true,
    );
    expect(doc.GetValue(horizontal ? new ScAddress(2, 0, 0) : new ScAddress(0, 2, 0))).toBe(5);
    expect(doc.GetValue(new ScAddress(2, 2, 0))).toBe(9);
    expect(
      doc.GetFormulaCell(horizontal ? new ScAddress(2, 1, 0) : new ScAddress(1, 2, 0)),
    ).toBeNull();
    expect(shell.GetUndoManager().GetUndoActionCount()).toBe(2);
    shell.Close();
  }
});

it("retains native multi-range totals,cursor placement and grouped marks across actual view commands", /** Public native selection operations preserve both separated blocks while AutoSum iterates its owned range list. @returns Nothing. */ () => {
  const { doc, view, functions, shell } = setup();
  functions.SetCursor(1, 0);
  functions.SetCursor(1, 1);
  functions.SetCursor(1, 1);
  functions.SetCursor(1, 1, true);
  expect([view.GetCurX(), view.GetCurY()]).toEqual([1, 1]);
  for (const [col, row, value] of [
    [0, 0, 2],
    [0, 1, 3],
    [2, 0, 4],
    [2, 1, 5],
  ] as const)
    doc.SetValue(new ScAddress(col, row, 0), value);
  functions.MarkRange(new ScRange(0, 0, 0, 0, 1, 0), false);
  functions.MarkRange(new ScRange(2, 0, 0, 2, 1, 0), false, true);
  expect(view.GetMarkData().IsMultiMarked()).toBe(true);
  expect([view.GetCurX(), view.GetCurY()]).toEqual([1, 1]);
  const finder: [boolean] = [true],
    subtotal: [boolean] = [true],
    formula = functions.DoAutoSum(finder, subtotal, OpCode.ocSum);
  expect(formula.isEmpty()).toBe(true);
  formula.dispose();
  expect(doc.GetValue(new ScAddress(0, 2, 0))).toBe(5);
  expect(doc.GetValue(new ScAddress(2, 2, 0))).toBe(9);
  expect([view.GetCurX(), view.GetCurY()]).toEqual([2, 2]);
  const ranges = new ScRangeList();
  view.GetMarkData().FillRangeListWithMarks(ranges, false);
  expect(coordinates(ranges)).toEqual([
    [0, 0, 0, 0, 2, 0],
    [2, 0, 0, 2, 2, 0],
  ]);
  expect(shell.GetUndoManager().GetUndoActionCount()).toBe(2);
  shell.Close();
});
it("keeps absent-sheet row sizing and unavailable nonformula view input nonmutating", /** Native FetchTable failure and an explicit unported entry boundary operate on real public owners. @returns Nothing. */ () => {
  const { doc, functions, shell } = setup(),
    count = doc.GetTableCount();
  expect(shell.GetDocFunc().AdjustRowHeight(new ScRange(0, 0, 99, 0, 1, 99), true, true)).toBe(
    false,
  );
  expect(doc.GetTableCount()).toBe(count);
  expect(
    /** Requests the actual unported nonformula branch without changing document state. @returns Nothing or explicit unsupported error. */ () =>
      functions.EnterData(0, 0, 0, unicode("text")),
  ).toThrow("Nonformula EnterData processing is not implemented");
  expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_NONE);
  expect(shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  shell.Close();
});
