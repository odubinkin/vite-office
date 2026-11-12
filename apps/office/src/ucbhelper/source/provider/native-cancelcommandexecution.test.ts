/** @fileoverview Actual Any cancellation, real continuation selection and Content property failure through the JavaScript exception ABI. */
import { afterEach, expect, it } from "vitest";
import { cancelCommandExecution } from "./cancelcommandexecution";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  UnknownPropertyException,
  cppu_detail_getUnoType as propertyType,
} from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import {
  CommandFailedException,
  cppu_detail_getUnoType as failedType,
} from "../../../offapi/com/sun/star/ucb/CommandFailedException";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XInteractionHandler } from "../../../udkapi/com/sun/star/task/XInteractionHandler";
import type { XInteractionRequest } from "../../../udkapi/com/sun/star/task/XInteractionRequest";
import type { XInteractionContinuation } from "../../../udkapi/com/sun/star/task/XInteractionContinuation";
import type { SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { CommandEnvironment } from "../client/commandenvironment";
import { ActiveDataSink } from "../client/activedatasink";
import { Content } from "../../inc/content";
import { throwException, getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import {
  initializeExceptionAbi,
  withCaughtException,
} from "../../../cppuhelper/browser/exception-abi";
import { own, api, u, read, releaseDomScope } from "../../../test/native-dom";
initializeExceptionAbi();
afterEach(releaseDomScope);
/** Application-owned implementation of the actual public interaction callback; it inspects and optionally selects the real request continuation. */
class Handler
  extends WeakImplHelper.specialize(XInteractionHandler)
  implements XInteractionHandler
{
  calls = 0;
  /** Callback policy, with no replacement provider or request. @param choice - Application response. @returns Handler. */
  constructor(private readonly choice: "ignore" | "abort" | "throw") {
    super();
  }
  /** Handles the actual request. @param request - Original borrowed reference. @returns Nothing. */
  handle(request: Reference<XInteractionRequest>): void {
    ++this.calls;
    const payload = api(request).getRequest(),
      continuations = api(request).getContinuations();
    try {
      expect(payload.getValueType().equals(propertyType())).toBe(true);
      expect(continuations.getLength()).toBe(1);
      if (this.choice === "abort") {
        const cell = (continuations.getConstArray() as SequenceElements).get(0) as [
          XInteractionContinuation,
        ];
        cell[0].select();
      }
      if (this.choice === "throw")
        throw new UnknownPropertyException(u("handler failed"), own(new Reference()));
    } finally {
      continuations.dispose();
      payload.dispose();
    }
  }
}
it.each(["absent", "empty", "ignore", "abort", "throw"] as const)(
  "preserves original Any cancellation with %s interaction",
  /** Exercises real environment and request owners. @param choice - Application response. @returns Nothing. */ (
    choice,
  ) => {
    const context = own(new Reference(new ActiveDataSink())),
      source = own(new UnknownPropertyException(u("missing"), context)),
      payload = own(new Any(source, propertyType));
    const handler =
      choice === "absent" || choice === "empty"
        ? own(new Reference<XInteractionHandler>())
        : own(new Reference(new Handler(choice)));
    const environment =
      choice === "absent"
        ? own(new Reference<CommandEnvironment>())
        : own(new Reference(new CommandEnvironment(handler, own(new Reference()))));
    try {
      cancelCommandExecution(payload, environment);
      expect.fail("Expected source exception");
    } catch (error) {
      if (choice === "abort") {
        expect(error).toBeInstanceOf(CommandFailedException);
        const caught = own(error as CommandFailedException),
          reason = own(new UnknownPropertyException());
        expect(caught.Message.isEmpty()).toBe(true);
        expect(caught.Context.is()).toBe(false);
        expect(caught.Reason.extract(reason, propertyType)).toBe(true);
        expect(read(reason.Message.copy(0))).toBe("missing");
        expect(reason.Context.get()).toBe(context.get());
        withCaughtException(
          caught,
          /** The linked actual CommandFailedException is round-tripped. @returns Nothing. */ () => {
            const captured = own(getCaughtException());
            expect(captured.getValueType().equals(failedType())).toBe(true);
            try {
              throwException(captured);
              expect.fail("Expected rethrow");
            } catch (again) {
              expect(again).toBeInstanceOf(CommandFailedException);
              own(again as CommandFailedException);
            }
          },
        );
      } else {
        expect(error).toBeInstanceOf(UnknownPropertyException);
        const caught = own(error as UnknownPropertyException);
        expect(read(caught.Message.copy(0))).toBe(
          choice === "throw" ? "handler failed" : "missing",
        );
        if (choice !== "throw") expect(caught.Context.get()).toBe(context.get());
      }
    }
    if (handler.is()) expect((api(handler) as Handler).calls).toBe(1);
  },
);
it.each(["isDocument", "openStream"] as const)(
  "retains genuine empty Content %s failure",
  /** Default content has no broker or manufactured property response. @param method - Actual public method. @returns Nothing. */ (
    method,
  ) => {
    const content = own(new Content());
    try {
      content[method]();
      expect.fail("Expected original missing-property failure");
    } catch (error) {
      expect(error).toBeInstanceOf(UnknownPropertyException);
      const caught = own(error as UnknownPropertyException);
      expect(read(caught.Message.copy(0))).toBe(
        "Unable to retrieve value of property 'IsDocument'!",
      );
      expect(caught.Context.is()).toBe(false);
    }
  },
);
