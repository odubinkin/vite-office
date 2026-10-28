/** @fileoverview Original FinalScan dispatch over shared automatic locals, with source early returns and common postprocessing. */
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { SvNumFormatType as T } from "../../inc/zforlist";
import type { ImpSvNumberformatScan } from "./zforscan";
import { FinalScanState } from "./zforscan.final-state";
import { FinalScanDateOrText } from "./zforscan.final-date";
import { FinalScanNumber } from "./zforscan.final-number";
import { FinalScanComplete } from "./zforscan.final-common";
/** Original type-dependent final analysis, retaining a numeric zero early return separately from completing a switch branch. @param this - Actual scanner. @param code - Original in/out code. @returns Native control position. */
export function FinalScan(this: ImpSvNumberformatScan, code: OUString): number {
  const state = new FinalScanState(this);
  try {
    let control: number | undefined;
    switch (this["eScannedType"]) {
      case T.NUMBER:
      case T.PERCENT:
      case T.CURRENCY:
      case T.SCIENTIFIC:
      case T.FRACTION:
        control = FinalScanNumber.call(this, state);
        break;
      default:
        control = FinalScanDateOrText.call(this, state);
    }
    if (control !== undefined) return control;
    return FinalScanComplete.call(this, state, code);
  } finally {
    state.dispose();
  }
}
