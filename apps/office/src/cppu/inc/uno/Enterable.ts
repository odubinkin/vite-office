/** @fileoverview Original five-slot uno/Enterable.h callback contract over borrowed context, argument cursor and actual reason field address. */
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import type { uno_EnvCallee } from "./environment";
/** Original context entry callback. */
export type uno_Enterable_enter = (context: unknown) => void;
/** Original context leave callback. */
export type uno_Enterable_leave = (context: unknown) => void;
/** Original call-into callback. */
export type uno_Enterable_callInto_v = (
  context: unknown,
  pCallee: uno_EnvCallee,
  pParam: Iterator<unknown>,
) => void;
/** Original call-out callback. */
export type uno_Enterable_callOut_v = (
  context: unknown,
  pCallee: uno_EnvCallee,
  pParam: Iterator<unknown>,
) => void;
/** Original integer validity result and mutable inout reason address. */
export type uno_Enterable_isValid_v = (context: unknown, ppReason: rtl_uStringSlot) => number;
/** Original required five C function-pointer slots; declared null callbacks have no valid call contract. */
export interface uno_Enterable {
  /** Original entry slot. */ m_enter: uno_Enterable_enter | null;
  /** Original leave slot. */ m_leave: uno_Enterable_leave | null;
  /** Original call-into slot. */ m_callInto_v: uno_Enterable_callInto_v | null;
  /** Original call-out slot. */ m_callOut_v: uno_Enterable_callOut_v | null;
  /** Original validity slot. */ m_isValid: uno_Enterable_isValid_v | null;
}
