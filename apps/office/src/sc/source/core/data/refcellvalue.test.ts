/** @fileoverview Complete original scalar ScRefCellValue observations: borrowed identity, typed values and compiler-provided memberwise copies, without invalid union reads. */
import { expect, it } from "vitest";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { CellType } from "../../../inc/global";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import {
  CreateDoubleError,
  GetDoubleErrorValue,
  FormulaError,
} from "../../../../formula/inc/errorcodes";
import fixture from "./native-ref-cell-value-cases.json";
it("matches original scalar borrowed cell reference stream", /** Replays complete original legal scalar operations with live source objects. @returns Nothing. */ () => {
  const lines: string[] = [],
    text = new OUString(new Uint16Array([65, 0, 937]), 3),
    sourceString = new SharedString(text);
  /** Records original scalar values and pointer identity using legal typed getters only. @param label - Stage. @param value - Cell view. @param expected - Expected source object. @returns Nothing. */
  function state(
    label: string,
    value: ScRefCellValue,
    expected: SharedStringConstReference | null = null,
  ): void {
    let line = `${label} ${value.getType()} ${Number(value.isEmpty())}`;
    if (value.getType() === CellType.CELLTYPE_VALUE) {
      const number = value.getDouble(),
        error = GetDoubleErrorValue(number);
      const rendered =
        error === FormulaError.NONE ? (Object.is(number, -0) ? "-0" : String(number)) : "0";
      line += ` | ${error} ${Number(number < 0 || Object.is(number, -0))} ${rendered}`;
    }
    if (value.getType() === CellType.CELLTYPE_STRING) {
      const string = value.getSharedString();
      line += ` | ${Number(string === expected)} ${Number(string !== null)}`;
      if (string) {
        line += ` ${string.getLength()}`;
        const data = string.getData();
        if (data) for (let i = 0; i < data.length; ++i) line += ` ${data.buffer[i]}`;
      }
    }
    lines.push(line);
  }
  const empty = new ScRefCellValue();
  state("default", empty);
  const emptycopy = new ScRefCellValue(empty);
  state("emptycopy", emptycopy);
  empty.clear();
  state("clear", empty);
  const numbers = Array<number | undefined>(7).fill(undefined);
  numbers[0] = 0;
  numbers[1] = -0;
  numbers[2] = 2.5;
  numbers[3] = -3.5;
  numbers[4] = Infinity;
  numbers[5] = -Infinity;
  numbers[6] = CreateDoubleError(FormulaError.MatrixSize);
  for (const number of numbers) {
    const value = new ScRefCellValue(number as number);
    state("number", value);
    const copied = new ScRefCellValue(value);
    state("copied", copied);
    value.clear();
    state("clearsource", value);
    state("retained", copied);
    const target = new ScRefCellValue(sourceString);
    expect(target.copy_assign(copied)).toBe(target);
    state("assigned", target);
    target.copy_assign(target);
    state("selfcopy", target);
    target.clear();
    state("cleartarget", target);
  }
  const string = new ScRefCellValue(sourceString);
  state("string", string, sourceString);
  const copied = new ScRefCellValue(string);
  state("stringcopy", copied, sourceString);
  const target = new ScRefCellValue(4.5);
  target.copy_assign(string);
  state("stringassigned", target, sourceString);
  target.copy_assign(target);
  state("stringselfcopy", target, sourceString);
  string.clear();
  state("stringcleared", string);
  state("stringretained", copied, sourceString);
  const nullShared = new SharedString();
  sourceString.assign(nullShared);
  state("retargeted", copied, sourceString);
  state("retargetedassigned", target, sourceString);
  const restored = new SharedString(text);
  sourceString.assign(restored);
  state("retargetedback", copied, sourceString);
  target.clear();
  state("finalclear", target);
  const nullstring = new ScRefCellValue(null);
  state("nullstring", nullstring);
  const nullcopy = new ScRefCellValue(nullstring);
  state("nullcopy", nullcopy);
  target.copy_assign(nullstring);
  state("nullassigned", target);
  const literal = SharedString.getEmptyString(),
    emptystring = new ScRefCellValue(literal);
  state("emptystring", emptystring, literal);
  const emptystringcopy = new ScRefCellValue(emptystring);
  state("emptystringcopy", emptystringcopy, literal);
  target.copy_assign(empty);
  state("emptyassigned", target);
  expect(lines.join("\n") + "\n").toBe(fixture.captures.reference);
  copied.clear();
  emptystring.clear();
  emptystringcopy.clear();
  sourceString.dispose();
  restored.dispose();
  nullShared.dispose();
  text.dispose();
});
