/** @fileoverview Original CUIEvent view/detail ownership and source unconditional false cancelability, on the actual event component. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { XUIEvent } from "../../../offapi/com/sun/star/xml/dom/events/XUIEvent";
import type { XAbstractView } from "../../../offapi/com/sun/star/xml/dom/views/XAbstractView";
import { CEvent } from "../../inc/event";
/** Original native UI-event value component; this is not a browser UI event adapter. */
export class CUIEvent
  extends ImplInheritanceHelper.specialize(CEvent, XUIEvent)
  implements XUIEvent
{
  private m_detail = 0;
  private readonly m_view = new Reference<XAbstractView>();
  /** Original implicit view member destruction before event base. @returns Nothing. */
  protected override destroy(): void {
    this.m_view.dispose();
    super.destroy();
  }
  /** Original acquired view copy. @returns View reference. */
  getView(): Reference<XAbstractView> {
    return new Reference(this.m_view);
  }
  /** Original signed32 detail. @returns Detail. */
  getDetail(): number {
    return this.m_detail;
  }
  /** Original base initialization followed by view and detail assignment. @param typeArg - Type. @param canBubbleArg - Bubble flag. @param cancelableArg - Stored base cancelability. @param viewArg - Borrowed view. @param detailArg - Signed32 detail. @returns Nothing. */
  initUIEvent(
    typeArg: OUStringConstReference,
    canBubbleArg: boolean,
    cancelableArg: boolean,
    viewArg: Reference<XAbstractView>,
    detailArg: number,
  ): void {
    CEvent.prototype.initEvent.call(this, typeArg, canBubbleArg, cancelableArg);
    this.m_view.assign(viewArg);
    this.m_detail = detailArg | 0;
  }
  /** Original override always returns false despite the base initialization argument. @returns False. */
  override getCancelable(): boolean {
    return false;
  }
}
