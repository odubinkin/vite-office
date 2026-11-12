/** @fileoverview Full source interaction/environment/sink declarations use normal CPPU metadata and typed-null Any transport; no command service or context is fabricated. */
import { expect, it } from "vitest";
import { UnoType } from "../../../cppu/inc/unotype";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { typelib_InterfaceTypeDescription as I } from "../../../cppu/inc/typelib/typedescription";
import * as Handler from "../../../udkapi/com/sun/star/task/XInteractionHandler";
import * as Request from "../../../udkapi/com/sun/star/task/XInteractionRequest";
import * as Continuation from "../../../udkapi/com/sun/star/task/XInteractionContinuation";
import * as Abort from "../../../udkapi/com/sun/star/task/XInteractionAbort";
import * as Retry from "../../../udkapi/com/sun/star/task/XInteractionRetry";
import * as Approve from "../../../offapi/com/sun/star/task/XInteractionApprove";
import * as Disapprove from "../../../offapi/com/sun/star/task/XInteractionDisapprove";
import * as Environment from "../../../offapi/com/sun/star/ucb/XCommandEnvironment";
import * as Progress from "../../../offapi/com/sun/star/ucb/XProgressHandler";
import * as Sink from "../../../udkapi/com/sun/star/io/XActiveDataSink";
const root = /** Original implicit root. @returns Actual root type. */ () =>
  UnoType.get("XInterface");
const continuation = /** Original explicit direct base. @returns Actual base type. */ () =>
  Continuation.XInteractionContinuation.static_type();
it.each([
  [Handler, Handler.XInteractionHandler, root],
  [Request, Request.XInteractionRequest, root],
  [Continuation, Continuation.XInteractionContinuation, root],
  [Abort, Abort.XInteractionAbort, continuation],
  [Retry, Retry.XInteractionRetry, continuation],
  [Approve, Approve.XInteractionApprove, continuation],
  [Disapprove, Disapprove.XInteractionDisapprove, continuation],
  [Environment, Environment.XCommandEnvironment, root],
  [Progress, Progress.XProgressHandler, root],
  [Sink, Sink.XActiveDataSink, root],
] as const)(
  "retains original declared bases and real typed-null transport %#",
  /** All metadata is registered through shared CPPU factories. @param binding - Actual generated module. @param api - Actual generated static API. @param parent - Original base. @returns Nothing. */ (
    binding,
    api,
    parent,
  ) => {
    const type = binding.cppu_detail_getUnoType();
    expect(binding.getCppuType()).toBe(type);
    expect(binding.getCppuType(null)).toBe(type);
    expect(api.static_type()).toBe(type);
    expect(api.static_type(null)).toBe(type);
    const description = type.getTypeLibType()?.pType as unknown as I;
    expect(description.nBaseTypes).toBe(1);
    expect(description.pBaseTypeDescription?.aBase.pWeakRef).toBe(parent().getTypeLibType());
    expect(parent().isAssignableFrom(type)).toBe(true);
    const value = new Any([null], ["Reference", binding.cppu_detail_getUnoType]),
      copy = new Any(value),
      output: [XInterface | null] = [null];
    try {
      expect(value.hasValue()).toBe(true);
      expect(copy.extract(output, ["Reference", binding.cppu_detail_getUnoType])).toBe(true);
      expect(output[0]).toBe(null);
    } finally {
      copy.dispose();
      value.dispose();
    }
  },
);
