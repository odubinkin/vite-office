/** @fileoverview Complete original cppu/Enterable.hxx C callback adapters and abstract wrapper; actual string fields and native JS argument cursors retain logical source contracts. */
import { OUString } from "../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../sal/inc/rtl/ustring.h";
import type { uno_EnvCallee } from "./uno/environment";
import type {
  uno_Enterable,
  uno_Enterable_enter,
  uno_Enterable_leave,
  uno_Enterable_callInto_v,
  uno_Enterable_callOut_v,
  uno_Enterable_isValid_v,
} from "./uno/Enterable";
/** Original context cast and virtual entry. @param context - Actual derived wrapper. @returns Nothing. */
export function Enterable_call_enter(context: unknown): void {
  (context as Enterable).v_enter();
}
/** Original context cast and virtual leave. @param context - Actual derived wrapper. @returns Nothing. */
export function Enterable_call_leave(context: unknown): void {
  (context as Enterable).v_leave();
}
/** Original context cast and borrowed callee/cursor forwarding. @param context - Actual derived wrapper. @param pCallee - Borrowed callee. @param pParam - Actual argument cursor. @returns Nothing. */
export function Enterable_call_callInto_v(
  context: unknown,
  pCallee: uno_EnvCallee,
  pParam: Iterator<unknown>,
): void {
  (context as Enterable).v_callInto_v(pCallee, pParam);
}
/** Original call-out adapter without argument copying. @param context - Actual derived wrapper. @param pCallee - Borrowed callee. @param pParam - Actual argument cursor. @returns Nothing. */
export function Enterable_call_callOut_v(
  context: unknown,
  pCallee: uno_EnvCallee,
  pParam: Iterator<unknown>,
): void {
  (context as Enterable).v_callOut_v(pCallee, pParam);
}
/** Original mutable reinterpret view over the very same reason field, without acquisition; bool-to-int conversion matches the C callback. @param context - Actual derived wrapper. @param pReason - Actual mutable field address. @returns Original integer validity. */
export function Enterable_call_isValid(context: unknown, pReason: rtl_uStringSlot): number {
  return Number((context as Enterable).v_isValid(OUString.unacquired(pReason) as OUString));
}
/** Original abstract wrapper, with its original empty destructor and constructor-populated C callback slots; derived classes supply every virtual body. */
export abstract class Enterable implements uno_Enterable {
  /** Original entry slot. */ m_enter: uno_Enterable_enter;
  /** Original leave slot. */ m_leave: uno_Enterable_leave;
  /** Original into slot. */ m_callInto_v: uno_Enterable_callInto_v;
  /** Original out slot. */ m_callOut_v: uno_Enterable_callOut_v;
  /** Original validity slot. */ m_isValid: uno_Enterable_isValid_v;
  /** Original pure virtual entry contract. @returns Nothing. */ abstract v_enter(): void;
  /** Original pure virtual leave contract. @returns Nothing. */ abstract v_leave(): void;
  /** Original pure virtual into contract. @param pCallee - Borrowed callee. @param pParam - Actual cursor. @returns Nothing. */ abstract v_callInto_v(
    pCallee: uno_EnvCallee,
    pParam: Iterator<unknown>,
  ): void;
  /** Original pure virtual out contract. @param pCallee - Borrowed callee. @param pParam - Actual cursor. @returns Nothing. */ abstract v_callOut_v(
    pCallee: uno_EnvCallee,
    pParam: Iterator<unknown>,
  ): void;
  /** Original pure virtual reason/validity contract. @param pReason - Borrowed mutable actual string view. @returns Original Boolean validity. */ abstract v_isValid(
    pReason: OUString,
  ): boolean;
  /** Complete original callback slot initialization. @returns Initialized wrapper. */
  constructor() {
    this.m_enter = Enterable_call_enter;
    this.m_leave = Enterable_call_leave;
    this.m_callInto_v = Enterable_call_callInto_v;
    this.m_callOut_v = Enterable_call_callOut_v;
    this.m_isValid = Enterable_call_isValid;
  }
  /** Original empty virtual destructor owns no resource; this is its complete body. @returns Nothing. */ dispose(): void {}
  /** Original entry invokes its C slot with this context. @returns Nothing. */ enter(): void {
    this.m_enter(this);
  }
  /** Original leave invokes its C slot with this context. @returns Nothing. */ leave(): void {
    this.m_leave(this);
  }
  /** Original direct into forwarding. @param pCallee - Borrowed callee. @param pParam - Actual cursor. @returns Nothing. */ callInto_v(
    pCallee: uno_EnvCallee,
    pParam: Iterator<unknown>,
  ): void {
    this.m_callInto_v(this, pCallee, pParam);
  }
  /** Original direct out forwarding. @param pCallee - Borrowed callee. @param pParam - Actual cursor. @returns Nothing. */ callOut_v(
    pCallee: uno_EnvCallee,
    pParam: Iterator<unknown>,
  ): void {
    this.m_callOut_v(this, pCallee, pParam);
  }
  /** Original variadic into call with one valid advancing logical va_list represented by native JS iterator. @param pCallee - Borrowed callee. @param args - Original argument values in order. @returns Nothing. */ callInto(
    pCallee: uno_EnvCallee,
    ...args: unknown[]
  ): void {
    const param = args[Symbol.iterator]();
    this.callInto_v(pCallee, param);
  }
  /** Original variadic out call with no coercion or callee/cursor clone. @param pCallee - Borrowed callee. @param args - Original argument values. @returns Nothing. */ callOut(
    pCallee: uno_EnvCallee,
    ...args: unknown[]
  ): void {
    const param = args[Symbol.iterator]();
    this.callOut_v(pCallee, param);
  }
  /** Original validity callback receives the actual output field address. @param pReason - Caller-owned reason string. @returns Original zero/one result. */ isValid(
    pReason: OUString,
  ): number {
    return this.m_isValid(this, pReason.getDataAddress());
  }
}
