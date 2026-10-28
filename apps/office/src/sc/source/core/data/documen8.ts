/** @fileoverview Original compiled-token link-formula check from documen8.cxx. */
import type { ScDocument } from "../../../inc/document";
import type { ScTokenArray } from "../../../inc/tokenarray";
import { OpCode } from "../../../../formula/inc/opcode";
/** Original RPN-first DDE/Webservice check, retaining an already raised flag. Empty-code logging is diagnostic only. @param this - Actual document. @param code - Actual compiled tokens. @returns Nothing. */
export function CheckLinkFormulaNeedingCheck(this: ScDocument, code: ScTokenArray): void {
  if (this.HasLinkFormulaNeedingCheck()) return;
  if (code.GetCodeLen()) {
    if (code.HasOpCodeRPN(OpCode.ocDde) || code.HasOpCodeRPN(OpCode.ocWebservice))
      this.SetLinkFormulaNeedingCheck(true);
  } else if (code.GetLen()) {
    if (code.HasOpCode(OpCode.ocDde) || code.HasOpCode(OpCode.ocWebservice))
      this.SetLinkFormulaNeedingCheck(true);
  }
}
