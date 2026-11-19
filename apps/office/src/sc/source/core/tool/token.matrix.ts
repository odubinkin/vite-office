/** @fileoverview Validation and collapsing of the source-order inline matrix tokens in ScTokenArray::MergeArray. */
import { OpCode } from "../../../../formula/inc/opcode";
import {
  StackVar,
  type FormulaDoubleToken,
  type FormulaStringToken,
  type FormulaToken,
} from "../../../../formula/inc/token";
import { ScMatrix } from "./scmatrix";

/** Scans backwards with the native separator and dimension checks. @param code - Active token buffer. @param length - Native length. @returns Matrix dimensions and first token, or absence. */
function getDimensions(code: readonly FormulaToken[], length: number) {
  let start = 0,
    columns = -1,
    rows = 0,
    previousRowSeparator = -1,
    previousWasSeparator = false,
    numeric = false;

  for (let index = length - 1; index >= start; --index) {
    const token = code[index] as FormulaToken;
    const opcode = token.GetOpCode();
    switch (opcode) {
      case OpCode.ocPush: {
        if (!previousWasSeparator) return null;
        const type = token.GetType();
        if (type !== StackVar.svDouble && type !== StackVar.svString) return null;
        previousWasSeparator = false;
        numeric = type === StackVar.svDouble;
        break;
      }
      case OpCode.ocMissing:
      case OpCode.ocTrue:
      case OpCode.ocFalse:
        if (!previousWasSeparator) return null;
        previousWasSeparator = false;
        numeric = false;
        break;
      case OpCode.ocArrayColSep:
      case OpCode.ocSep:
        if (previousWasSeparator) return null;
        previousWasSeparator = true;
        numeric = false;
        break;
      case OpCode.ocArrayClose:
        if (index !== length - 1 || previousWasSeparator) return null;
        previousWasSeparator = true;
        previousRowSeparator = index;
        numeric = false;
        break;
      case OpCode.ocArrayOpen:
      case OpCode.ocArrayRowSep: {
        if (opcode === OpCode.ocArrayOpen) start = index;
        const width = previousRowSeparator - index;
        if (previousWasSeparator || previousRowSeparator < 0 || width % 2 === 1) return null;
        if (columns < 0) columns = width / 2;
        else if (columns !== width / 2) return null;
        previousWasSeparator = true;
        previousRowSeparator = index;
        ++rows;
        numeric = false;
        break;
      }
      case OpCode.ocAdd:
      case OpCode.ocNegSub:
        if (!numeric) return null;
        numeric = false;
        --previousRowSeparator;
        break;
      case OpCode.ocSpaces:
      case OpCode.ocWhitespace:
        --previousRowSeparator;
        break;
      default:
        return null;
    }
  }

  return columns > 0 && rows > 0 ? { columns, rows, start } : null;
}

/** Builds the original matrix from validated literal tokens. @param code - Active token buffer. @param length - Native length. @returns Matrix and source position, or absence when validation fails. */
export function MergeArray(code: readonly FormulaToken[], length: number) {
  const dimensions = getDimensions(code, length);
  if (!dimensions) return null;
  const { columns, rows, start } = dimensions;
  const matrix = new ScMatrix(columns, rows, 0);
  let column = 0,
    row = 0,
    sign = 1;

  for (let index = start; index < length; ++index) {
    const token = code[index] as FormulaToken;
    switch (token.GetOpCode()) {
      case OpCode.ocPush:
        if (token.GetType() === StackVar.svDouble) {
          matrix.PutDouble((token as FormulaDoubleToken).GetDouble() * sign, column, row);
          sign = 1;
        } else if (token.GetType() === StackVar.svString) {
          matrix.PutString((token as FormulaStringToken).GetString(), column, row);
        }
        break;
      case OpCode.ocMissing:
        matrix.PutEmpty(column, row);
        break;
      case OpCode.ocTrue:
      case OpCode.ocFalse:
        matrix.PutBoolean(token.GetOpCode() === OpCode.ocTrue, column, row);
        break;
      case OpCode.ocArrayColSep:
      case OpCode.ocSep:
        ++column;
        break;
      case OpCode.ocArrayRowSep:
        column = 0;
        ++row;
        break;
      case OpCode.ocNegSub:
        sign = -sign;
        break;
    }
  }

  return { matrix, start };
}
