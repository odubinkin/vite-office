/** @fileoverview Original Any-exception cancelCommandExecution overload and interaction/abort selection path. The IOErrorCode overload requires its own complete request owners and is not advertised here. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { throwException } from "../../../cppuhelper/inc/exc_hlp";
import { CommandFailedException } from "../../../offapi/com/sun/star/ucb/CommandFailedException";
import type { XCommandEnvironment } from "../../../offapi/com/sun/star/ucb/XCommandEnvironment";
import { XInteractionContinuation } from "../../../udkapi/com/sun/star/task/XInteractionContinuation";
import { InteractionRequest, InteractionAbort } from "../../inc/interactionrequest";
const Continuations = Sequence.specialize<Reference<XInteractionContinuation>>(
  ["Reference", XInteractionContinuation.static_type],
  8,
);
/** Original handler/request/abort/selection path followed by the generic throw. @param exception - Original borrowed exception Any. @param environment - Actual command environment. @returns Never. */
export function cancelCommandExecution(
  exception: Any,
  environment: Reference<XCommandEnvironment>,
): never {
  if (environment.is()) {
    const handler = environment.operatorStar().getInteractionHandler();
    try {
      if (handler.is()) {
        const request = new RtlReference(new InteractionRequest(exception));
        try {
          const abort = new Reference<XInteractionContinuation>(
            new InteractionAbort(request.get() as InteractionRequest),
          );
          try {
            const sequence = new Continuations(
              {
                /** Original initializer-list field address. @param offset - Zero offset. @returns Actual abort pointer cell. */ get(
                  offset: number,
                ): unknown {
                  void offset;
                  return abort.getAddress();
                },
              },
              1,
            );
            try {
              request.operatorStar().setContinuations(sequence);
            } finally {
              sequence.dispose();
            }
          } finally {
            abort.dispose();
          }
          const passed = new Reference(request.get());
          try {
            handler.operatorStar().handle(passed);
          } finally {
            passed.dispose();
          }
          const selection = new RtlReference(request.operatorStar().getSelection().get());
          try {
            if (selection.is()) {
              const message = new OUString(),
                context = new Reference();
              try {
                throw new CommandFailedException(message, context, exception);
              } finally {
                context.dispose();
                message.dispose();
              }
            }
          } finally {
            selection.dispose();
          }
        } finally {
          request.dispose();
        }
      }
    } finally {
      handler.dispose();
    }
  }
  return throwException(exception);
}
