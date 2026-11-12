/** @fileoverview Original InteractionRequest, borrowed continuation parent and four basic selection components; authentication-related continuation owners remain outside this consumed slice and are not advertised. */
import { WeakImplHelper, ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XInteractionRequest } from "../../../udkapi/com/sun/star/task/XInteractionRequest";
import { XInteractionContinuation } from "../../../udkapi/com/sun/star/task/XInteractionContinuation";
import { XInteractionAbort } from "../../../udkapi/com/sun/star/task/XInteractionAbort";
import { XInteractionRetry } from "../../../udkapi/com/sun/star/task/XInteractionRetry";
import { XInteractionApprove } from "../../../offapi/com/sun/star/task/XInteractionApprove";
import { XInteractionDisapprove } from "../../../offapi/com/sun/star/task/XInteractionDisapprove";

const Continuations = Sequence.specialize<Reference<XInteractionContinuation>>(
  ["Reference", XInteractionContinuation.static_type],
  8,
);
/** Original private implementation owns selection, payload and sequence in source declaration order. */
class InteractionRequest_Impl {
  readonly m_xSelection: Reference<InteractionContinuation>;
  readonly m_aRequest: Any;
  readonly m_aContinuations: Sequence<Reference<XInteractionContinuation>>;
  /** Original default construction or move from the already copied by-value parameter, with member initialization in source declaration order. @param request - Optional actual by-value parameter owner. @returns Actual private owner. */
  constructor(request?: Any) {
    this.m_xSelection = new Reference<InteractionContinuation>();
    this.m_aRequest = request === undefined ? new Any() : Any.move(request);
    this.m_aContinuations = new Continuations();
  }
  /** Original reverse field destruction. @returns Nothing. */
  dispose(): void {
    this.m_aContinuations.dispose();
    this.m_aRequest.dispose();
    this.m_xSelection.dispose();
  }
}

/** Original complete interaction request component. */
export class InteractionRequest
  extends WeakImplHelper.specialize(XInteractionRequest)
  implements XInteractionRequest
{
  private readonly m_pImpl: InteractionRequest_Impl;
  /** Original public payload constructor and protected default-constructor body; overload access control is erased in this JS binding. @param request - Optional native payload. @returns Actual request. */
  constructor(request?: Any) {
    super();
    if (request === undefined) this.m_pImpl = new InteractionRequest_Impl();
    else {
      const parameter = new Any(request);
      try {
        this.m_pImpl = new InteractionRequest_Impl(parameter);
      } finally {
        parameter.dispose();
      }
    }
  }
  /** Original private implementation destruction before the base. @returns Nothing. */
  protected override destroy(): void {
    this.m_pImpl.dispose();
    super.destroy();
  }
  /** Original protected payload assignment. @param request - Borrowed new payload. @returns Nothing. */
  protected setRequest(request: Any): void {
    this.m_pImpl.m_aRequest.assign(request);
  }
  /** Original sequence assignment retains the caller's value independently. @param continuations - Actual native sequence. @returns Nothing. */
  setContinuations(continuations: Sequence<Reference<XInteractionContinuation>>): void {
    this.m_pImpl.m_aContinuations.assign(continuations);
  }
  /** Original borrowed const-reference return; the same field owner is exposed only through read operations. @returns Borrowed selection. */
  getSelection(): Pick<Reference<InteractionContinuation>, "get" | "is"> {
    return this.m_pImpl.m_xSelection;
  }
  /** Original acquired selection assignment, including empty reset. @param selection - Borrowed source reference. @returns Nothing. */
  setSelection(selection: Reference<InteractionContinuation>): void {
    this.m_pImpl.m_xSelection.assign(selection);
  }
  /** Original by-value payload copy. @returns Actual owned Any. */
  getRequest(): Any {
    return new Any(this.m_pImpl.m_aRequest);
  }
  /** Original by-value shared sequence copy. @returns Actual owned sequence. */
  getContinuations(): Sequence<Reference<XInteractionContinuation>> {
    return new Continuations(this.m_pImpl.m_aContinuations);
  }
}

/** Original base advertises no continuation interface and borrows its parent without acquiring it. */
export class InteractionContinuation extends WeakImplHelper.specialize() {
  /** Original raw parent pointer; logical parent lifetime remains the caller's source precondition. @param m_pRequest - Actual containing request. @returns Actual owner. */
  constructor(private readonly m_pRequest: InteractionRequest) {
    super();
  }
  /** Original implicit rtl::Reference temporary around this, followed by parent selection assignment. @returns Nothing. */
  protected recordSelection(): void {
    const selected = new Reference<InteractionContinuation>(this);
    try {
      this.m_pRequest.setSelection(selected);
    } finally {
      selected.dispose();
    }
  }
}
/** Original abort continuation adds its complete declared interface. */
export class InteractionAbort
  extends ImplInheritanceHelper.specialize(InteractionContinuation, XInteractionAbort)
  implements XInteractionAbort
{
  /** Original selection delegates to recordSelection. @returns Nothing. */ select(): void {
    this.recordSelection();
  }
}
/** Original retry continuation. */
export class InteractionRetry
  extends ImplInheritanceHelper.specialize(InteractionContinuation, XInteractionRetry)
  implements XInteractionRetry
{
  /** Original selection delegates to recordSelection. @returns Nothing. */ select(): void {
    this.recordSelection();
  }
}
/** Original approval continuation. */
export class InteractionApprove
  extends ImplInheritanceHelper.specialize(InteractionContinuation, XInteractionApprove)
  implements XInteractionApprove
{
  /** Original selection delegates to recordSelection. @returns Nothing. */ select(): void {
    this.recordSelection();
  }
}
/** Original disapproval continuation. */
export class InteractionDisapprove
  extends ImplInheritanceHelper.specialize(InteractionContinuation, XInteractionDisapprove)
  implements XInteractionDisapprove
{
  /** Original selection delegates to recordSelection. @returns Nothing. */ select(): void {
    this.recordSelection();
  }
}
