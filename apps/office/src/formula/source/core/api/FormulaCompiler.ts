/** @fileoverview Original FormulaCompiler jump-command classification member; remaining compiler responsibilities are not implemented here. */
import { OpCode } from "../../../inc/opcode";

/** Original static compiler member binding; instance constructors and the remaining compiler are not implemented. */
export const FormulaCompiler = {
  /** Original jump command switch. @param eOp - Original opcode. @returns Whether this is a jump command. */
  IsOpCodeJumpCommand(eOp: OpCode): boolean {
    switch (eOp & 0xffff) {
      case OpCode.ocIf:
      case OpCode.ocIfError:
      case OpCode.ocIfNA:
      case OpCode.ocChoose:
      case OpCode.ocLet:
        return true;
      default:
        return false;
    }
  },
} as const;
