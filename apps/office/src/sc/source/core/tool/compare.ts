/** @fileoverview Native scalar comparison rules for normal Calc relational operands. */
import { OpCode } from "../../../../formula/inc/opcode";
import { approxEqual } from "../../../../sal/inc/rtl/math";
import { GetCollator, type ScQueryItem } from "./queryentry";

/** Compares two native scalar cells under the normal (non-query) comparison rules. @param left - Left operand, null for an empty cell. @param right - Right operand, null for an empty cell. @param opcode - Relational operator. @param ignoreCase - Native document option. @returns Logical comparison. */
export function CompareScalar(
  left: ScQueryItem | null,
  right: ScQueryItem | null,
  opcode: OpCode,
  ignoreCase: boolean,
): boolean {
  let order: number;
  if (left === null)
    order =
      right === null ? 0 : typeof right === "number" ? Math.sign(-right) : right.text ? -1 : 0;
  else if (right === null) order = typeof left === "number" ? Math.sign(left) : left.text ? 1 : 0;
  else if (typeof left === "number")
    order = typeof right !== "number" ? -1 : approxEqual(left, right) ? 0 : Math.sign(left - right);
  else if (typeof right === "number") order = 1;
  else if (opcode === OpCode.ocEqual || opcode === OpCode.ocNotEqual)
    order = Number(ignoreCase ? left.ignoreCase !== right.ignoreCase : left.text !== right.text);
  else order = GetCollator(ignoreCase).compare(left.text, right.text);

  switch (opcode) {
    case OpCode.ocEqual:
      return order === 0;
    case OpCode.ocNotEqual:
      return order !== 0;
    case OpCode.ocLess:
      return order < 0;
    case OpCode.ocGreater:
      return order > 0;
    case OpCode.ocLessEqual:
      return order <= 0;
    case OpCode.ocGreaterEqual:
      return order >= 0;
    default:
      return false;
  }
}
