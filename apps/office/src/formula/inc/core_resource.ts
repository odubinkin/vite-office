/** @fileoverview Consumed scalar and aggregate entries from native RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF. Other function/locale resource tables remain unsupported. */
import { OpCode } from "./opcode";
/** Actual ODFF symbol data shared by scanning and output; opcode keys preserve duplicate textual minus entries. */
export const RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF: ReadonlyMap<OpCode, string> = new Map([
  [OpCode.ocOpen, "("],
  [OpCode.ocClose, ")"],
  [OpCode.ocSep, ";"],
  [OpCode.ocSum, "SUM"],
  [OpCode.ocSumSQ, "SUMSQ"],
  [OpCode.ocProduct, "PRODUCT"],
  [OpCode.ocAverage, "AVERAGE"],
  [OpCode.ocPercentSign, "%"],
  [OpCode.ocAdd, "+"],
  [OpCode.ocSub, "-"],
  [OpCode.ocMul, "*"],
  [OpCode.ocDiv, "/"],
  [OpCode.ocPow, "^"],
  [OpCode.ocNegSub, "-"],
]);
