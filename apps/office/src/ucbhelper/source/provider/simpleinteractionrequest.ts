/** @fileoverview Original simple request flags, ordered continuation construction and real queried response classification. */
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { XInteractionContinuation } from "../../../udkapi/com/sun/star/task/XInteractionContinuation";
import { XInteractionAbort } from "../../../udkapi/com/sun/star/task/XInteractionAbort";
import { XInteractionRetry } from "../../../udkapi/com/sun/star/task/XInteractionRetry";
import { XInteractionApprove } from "../../../offapi/com/sun/star/task/XInteractionApprove";
import { XInteractionDisapprove } from "../../../offapi/com/sun/star/task/XInteractionDisapprove";
import {
  InteractionRequest,
  InteractionAbort,
  InteractionRetry,
  InteractionApprove,
  InteractionDisapprove,
  type InteractionContinuation,
} from "./interactionrequest";
/** Original typed_flags source enum, including its zero response. */
export enum ContinuationFlags {
  NONE = 0,
  Abort = 1,
  Retry = 2,
  Approve = 4,
  Disapprove = 8,
}
const Continuations = Sequence.specialize<Reference<XInteractionContinuation>>(
  ["Reference", XInteractionContinuation.static_type],
  8,
);

/** Complete original simple request component inherits the actual base interface implementation. */
export class SimpleInteractionRequest extends InteractionRequest {
  /** Original source order is Abort, Retry, Approve, Disapprove; NONE has only a source diagnostic, not a thrown validation error. @param request - Borrowed source payload. @param flags - Original typed flag mask. @returns Actual request. */
  constructor(request: Any, flags: ContinuationFlags) {
    super(request);
    const vector: Reference<XInteractionContinuation>[] = [];
    try {
      if (flags & ContinuationFlags.Abort) vector.push(new Reference(new InteractionAbort(this)));
      if (flags & ContinuationFlags.Retry) vector.push(new Reference(new InteractionRetry(this)));
      if (flags & ContinuationFlags.Approve)
        vector.push(new Reference(new InteractionApprove(this)));
      if (flags & ContinuationFlags.Disapprove)
        vector.push(new Reference(new InteractionDisapprove(this)));
      const data: SequenceElements = {
          /** Compiler lowering of std::vector<Reference<T>>::data(), borrowing the actual pointer fields. @param offset - Logical source byte offset. @returns Existing field address. */
          get(offset: number): unknown {
            return (vector[offset / 8] as Reference<XInteractionContinuation>).getAddress();
          },
        },
        sequence = new Continuations(data, vector.length);
      try {
        this.setContinuations(sequence);
      } finally {
        sequence.dispose();
      }
    } finally {
      for (let i = vector.length - 1; i >= 0; --i) vector[i]?.dispose();
    }
  }
  /** Original acquired selection copy and source-ordered real interface queries. @returns Selected original flag or NONE for empty/unknown selection. */
  getResponse(): ContinuationFlags {
    const selection = new Reference<InteractionContinuation>(this.getSelection().get());
    try {
      const selected = selection.get();
      if (selected) {
        for (const [declaration, flag] of [
          [XInteractionAbort, ContinuationFlags.Abort],
          [XInteractionRetry, ContinuationFlags.Retry],
          [XInteractionApprove, ContinuationFlags.Approve],
          [XInteractionDisapprove, ContinuationFlags.Disapprove],
        ] as const) {
          const facet = new Reference<XInteractionContinuation>(
            selected.getXWeak(),
            UNO_QUERY,
            declaration.static_type,
          );
          try {
            if (facet.is()) return flag;
          } finally {
            facet.dispose();
          }
        }
      }
      return ContinuationFlags.NONE;
    } finally {
      selection.dispose();
    }
  }
}
