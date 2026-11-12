/** @fileoverview Original CEvent state, UNO getters and initialization over the actual weak component owner. Native synchronous calls inline locking; no browser Event or thread synchronization substitute is supplied. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { XEvent } from "../../../offapi/com/sun/star/xml/dom/events/XEvent";
import type { XEventTarget } from "../../../offapi/com/sun/star/xml/dom/events/XEventTarget";
import { PhaseType } from "../../../offapi/com/sun/star/xml/dom/events/PhaseType";
import { Time } from "../../../offapi/com/sun/star/util/Time";
/** Original native event component. Source default timestamp remains zero and preventDefault remains empty. */
export class CEvent extends WeakImplHelper.specialize(XEvent) implements XEvent {
  protected m_canceled = false;
  protected readonly m_eventType = new OUString();
  protected readonly m_target = new Reference<XEventTarget>();
  protected readonly m_currentTarget = new Reference<XEventTarget>();
  protected m_phase = PhaseType.CAPTURING_PHASE;
  protected m_bubbles = false;
  protected m_cancelable = true;
  protected readonly m_time = new Time();
  /** Original noncopyable mutex-owning default construction. @returns Actual event. */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Native mutex-owning CEvent permits only default construction, not the weak base copy parameter.
  constructor() {
    super();
  }
  /** Original implicit reverse member destruction after the event destructor body. @returns Nothing. */
  protected override destroy(): void {
    this.m_currentTarget.dispose();
    this.m_target.dispose();
    this.m_eventType.dispose();
    super.destroy();
  }
  /** Original string result is an independent owned value. @returns Event type. */
  getType(): OUString {
    return new OUString(this.m_eventType);
  }
  /** Original acquired target reference. @returns Target. */
  getTarget(): Reference<XEventTarget> {
    return new Reference(this.m_target);
  }
  /** Original acquired current target reference. @returns Current target. */
  getCurrentTarget(): Reference<XEventTarget> {
    return new Reference(this.m_currentTarget);
  }
  /** Original phase read. @returns Current phase. */
  getEventPhase(): PhaseType {
    return this.m_phase;
  }
  /** Original bubble flag. @returns Bubble flag. */
  getBubbles(): boolean {
    return this.m_bubbles;
  }
  /** Original cancelability field read, distinct from CUIEvent override. @returns Cancelability. */
  getCancelable(): boolean {
    return this.m_cancelable;
  }
  /** Original timestamp value copy, without synthesizing wall-clock time. @returns Independent time. */
  getTimeStamp(): Time {
    return new Time(this.m_time);
  }
  /** Original source only stops propagation when the stored cancelable flag is true. @returns Nothing. */
  stopPropagation(): void {
    if (this.m_cancelable) this.m_canceled = true;
  }
  /** Original empty body. @returns Nothing. */
  preventDefault(): void {}
  /** Original three-field assignment does not reset cancellation, phase, targets or time. @param eventTypeArg - Borrowed type. @param canBubbleArg - Bubble flag. @param cancelableArg - Stored cancelability. @returns Nothing. */
  initEvent(
    eventTypeArg: OUStringConstReference,
    canBubbleArg: boolean,
    cancelableArg: boolean,
  ): void {
    this.m_eventType.assign(eventTypeArg);
    this.m_bubbles = canBubbleArg;
    this.m_cancelable = cancelableArg;
  }
}
