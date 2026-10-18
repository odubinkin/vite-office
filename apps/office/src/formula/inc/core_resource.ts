/** @fileoverview Consumed scalar entries from native RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF. Full function/locale resource tables remain unsupported. */
import { OpCode } from "./opcode";
/** Actual ODFF symbol data shared by scanning and output; opcode keys preserve duplicate textual minus entries. */
export const RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF: ReadonlyMap<OpCode, string> = new Map([
  [OpCode.ocOpen, "("],
  [OpCode.ocClose, ")"],
  [OpCode.ocPercentSign, "%"],
  [OpCode.ocAdd, "+"],
  [OpCode.ocSub, "-"],
  [OpCode.ocMul, "*"],
  [OpCode.ocDiv, "/"],
  [OpCode.ocPow, "^"],
  [OpCode.ocNegSub, "-"],
]);
