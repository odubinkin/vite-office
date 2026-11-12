/** @fileoverview Original CMouseEvent coordinates, modifiers and ignored related-target contract over actual CUIEvent inheritance. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { XMouseEvent } from "../../../offapi/com/sun/star/xml/dom/events/XMouseEvent";
import type { XEventTarget } from "../../../offapi/com/sun/star/xml/dom/events/XEventTarget";
import type { XAbstractView } from "../../../offapi/com/sun/star/xml/dom/views/XAbstractView";
import { CUIEvent } from "../../inc/uievent";
/** Original native mouse event component, independent of host pointer events. */
export class CMouseEvent
  extends ImplInheritanceHelper.specialize(CUIEvent, XMouseEvent)
  implements XMouseEvent
{
  private m_screenX = 0;
  private m_screenY = 0;
  private m_clientX = 0;
  private m_clientY = 0;
  private m_ctrlKey = false;
  private m_shiftKey = false;
  private m_altKey = false;
  private m_metaKey = false;
  private m_button = 0;
  /** Original coordinate getter. @returns Signed32 screen X. */ getScreenX(): number {
    return this.m_screenX;
  }
  /** Original coordinate getter. @returns Signed32 screen Y. */ getScreenY(): number {
    return this.m_screenY;
  }
  /** Original coordinate getter. @returns Signed32 client X. */ getClientX(): number {
    return this.m_clientX;
  }
  /** Original coordinate getter. @returns Signed32 client Y. */ getClientY(): number {
    return this.m_clientY;
  }
  /** Original modifier getter. @returns Ctrl flag. */ getCtrlKey(): boolean {
    return this.m_ctrlKey;
  }
  /** Original modifier getter. @returns Shift flag. */ getShiftKey(): boolean {
    return this.m_shiftKey;
  }
  /** Original modifier getter. @returns Alt flag. */ getAltKey(): boolean {
    return this.m_altKey;
  }
  /** Original modifier getter. @returns Meta flag. */ getMetaKey(): boolean {
    return this.m_metaKey;
  }
  /** Original button getter. @returns Signed16 button. */ getButton(): number {
    return this.m_button;
  }
  /** Original source always returns an empty related target. @returns New empty reference. */
  getRelatedTarget(): Reference<XEventTarget> {
    return new Reference<XEventTarget>();
  }
  /** Original UI initialization precedes coordinate/modifier assignments and ignores relatedTargetArg. @param typeArg - Type. @param canBubbleArg - Bubble flag. @param cancelableArg - Stored base cancelability. @param viewArg - Borrowed view. @param detailArg - Signed32 detail. @param screenXArg - Screen X. @param screenYArg - Screen Y. @param clientXArg - Client X. @param clientYArg - Client Y. @param ctrlKeyArg - Ctrl. @param altKeyArg - Alt. @param shiftKeyArg - Shift. @param metaKeyArg - Meta. @param buttonArg - Signed16 button. @param relatedTargetArg - Ignored native argument. @returns Nothing. */
  initMouseEvent(
    typeArg: OUStringConstReference,
    canBubbleArg: boolean,
    cancelableArg: boolean,
    viewArg: Reference<XAbstractView>,
    detailArg: number,
    screenXArg: number,
    screenYArg: number,
    clientXArg: number,
    clientYArg: number,
    ctrlKeyArg: boolean,
    altKeyArg: boolean,
    shiftKeyArg: boolean,
    metaKeyArg: boolean,
    buttonArg: number,
    relatedTargetArg: Reference<XEventTarget>,
  ): void {
    CUIEvent.prototype.initUIEvent.call(
      this,
      typeArg,
      canBubbleArg,
      cancelableArg,
      viewArg,
      detailArg,
    );
    this.m_screenX = screenXArg | 0;
    this.m_screenY = screenYArg | 0;
    this.m_clientX = clientXArg | 0;
    this.m_clientY = clientYArg | 0;
    this.m_ctrlKey = ctrlKeyArg;
    this.m_altKey = altKeyArg;
    this.m_shiftKey = shiftKeyArg;
    this.m_metaKey = metaKeyArg;
    this.m_button = (buttonArg << 16) >> 16;
    void relatedTargetArg;
  }
}
