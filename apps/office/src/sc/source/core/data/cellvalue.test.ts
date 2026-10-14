/** @fileoverview Complete original scalar ScCellValue constructor/setter/query/swap/move stream, with genuine shared values and no unported pointee substitute. */
import { expect, it } from "vitest";
import { ScCellValue } from "../../../inc/cellvalue";
import { CellType } from "../../../inc/global";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import {
  CreateDoubleError,
  GetDoubleErrorValue,
  FormulaError,
} from "../../../../formula/inc/errorcodes";
import fixture from "./native-cell-value-cases.json";
it("matches original scalar cell value and logical move stream", /** Replays complete original scalar observations without native memory/pointer behavior claims. @returns Nothing. */ () => {
  const lines: string[] = [],
    text = new OUString(new Uint16Array([65, 0, 937]), 3),
    sourceString = new SharedString(text);
  /** Records type-specific values and native wrong-variant exception messages; JS exception class remains a native TypeError boundary. @param label - Stage. @param value - Actual cell owner. @returns Nothing. */
  function state(label: string, value: ScCellValue): void {
    let line = `${label} ${value.getType()} ${Number(value.isEmpty())}`;
    if (value.getType() === CellType.CELLTYPE_VALUE) {
      const number = value.getDouble(),
        error = GetDoubleErrorValue(number);
      const rendered =
        error === FormulaError.NONE ? (Object.is(number, -0) ? "-0" : String(number)) : "0";
      line += ` | ${error} ${Number(number < 0 || Object.is(number, -0))} ${rendered}`;
    }
    if (value.getType() === CellType.CELLTYPE_STRING) {
      const string = value.getSharedString(),
        data = string.getData();
      line += ` | ${string.getLength()}`;
      if (data) for (let i = 0; i < data.length; ++i) line += ` ${data.buffer[i]}`;
    }
    lines.push(line);
    try {
      value.getDouble();
      lines.push("double ok");
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      lines.push(`double ${(error as Error).message}`);
    }
    try {
      value.getSharedString();
      lines.push("string ok");
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      lines.push(`string ${(error as Error).message}`);
    }
  }
  const empty = new ScCellValue();
  state("default", empty);
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
    const value = new ScCellValue(number as number);
    state("number", value);
    const moved = ScCellValue.move(value);
    state("movesource", value);
    state("moved", moved);
    const target = new ScCellValue(sourceString);
    target.move_assign(moved);
    state("assignsource", moved);
    state("assigned", target);
    target.move_assign(target);
    state("selfmove", target);
  }
  const string = new ScCellValue(sourceString);
  state("string", string);
  sourceString.dispose();
  state("retained", string);
  const moved = ScCellValue.move(string);
  state("stringsource", string);
  state("stringmoved", moved);
  const other = new ScCellValue(9.5);
  other.swap(moved);
  state("swapleft", other);
  state("swapright", moved);
  other.swap(other);
  state("selfswap", other);
  moved.set(other.getSharedString());
  other.clear();
  state("setcopied", moved);
  state("clearedsource", other);
  moved.set(4.5);
  state("setnumber", moved);
  const nullString = new SharedString();
  moved.set(nullString);
  state("nullstring", moved);
  moved.set(SharedString.getEmptyString());
  state("emptystring", moved);
  const target = new ScCellValue();
  expect(target.move_assign(moved)).toBe(target);
  state("stringassignsource", moved);
  state("stringassigned", target);
  target.move_assign(target);
  state("stringselfmove", target);
  target.clear();
  state("finalclear", target);
  expect(lines.join("\n") + "\n").toBe(fixture.captures.scalar);
  nullString.dispose();
  text.dispose();
});
