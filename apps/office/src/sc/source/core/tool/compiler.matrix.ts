/** @fileoverview Native inline matrix text generation from Calc compiler.cxx. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import {
  RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF,
  RID_STRLIST_FUNCTION_NAMES_ENGLISH_OOXML,
} from "../../../../formula/inc/core_resource";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { doubleToString } from "../../../../sal/rtl/strtmpl.math";
import type { ScMatrix } from "./scmatrix";

/** Emits an inline matrix using the source grammar and the original typed values. @param matrix - Original matrix. @param ooxml - Excel grammar. @param quote - String output. @param printError - Error output. @returns Formula source. */
export function CreateStringFromMatrix(
  matrix: ScMatrix,
  ooxml: boolean,
  quote: (value: OUStringConstReference) => string,
  printError: (error: FormulaError) => string,
): string {
  const symbols = ooxml
    ? RID_STRLIST_FUNCTION_NAMES_ENGLISH_OOXML
    : RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF;
  const size = { row: 0, column: 0 };
  matrix.GetDimensions(size);
  let result = symbols.get(OpCode.ocArrayOpen) as string;
  for (let row = 0; row < size.row; ++row) {
    if (row) result += symbols.get(OpCode.ocArrayRowSep);
    for (let column = 0; column < size.column; ++column) {
      if (column) result += symbols.get(OpCode.ocArrayColSep);
      const value = matrix.Get(column, row);
      try {
        if (matrix.IsBoolean(column, row))
          result += symbols.get(value.GetBoolean() ? OpCode.ocTrue : OpCode.ocFalse);
        else if (matrix.IsValue(column, row)) {
          const error = value.GetError();
          result += error === FormulaError.NONE ? doubleToString(value.fVal) : printError(error);
        } else if (matrix.IsEmpty(column, row)) result += "#N/A";
        else if (matrix.IsStringOrEmpty(column, row))
          result += quote(value.GetString().getString());
      } finally {
        value.dispose();
      }
    }
  }
  return result + symbols.get(OpCode.ocArrayClose);
}
