/** @fileoverview Original CMutationEvent component and value ownership through the native CEvent and ImplInheritanceHelper chain. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { XMutationEvent } from "../../../offapi/com/sun/star/xml/dom/events/XMutationEvent";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { AttrChangeType } from "../../../offapi/com/sun/star/xml/dom/events/AttrChangeType";
import { CEvent } from "../../inc/event";
/** Original mutation event, with complete inherited XEvent behavior on the same weak object identity. */
export class CMutationEvent
  extends ImplInheritanceHelper.specialize(CEvent, XMutationEvent)
  implements XMutationEvent
{
  private readonly m_relatedNode = new Reference<XNode>();
  private readonly m_prevValue = new OUString();
  private readonly m_newValue = new OUString();
  private readonly m_attrName = new OUString();
  private m_attrChangeType = AttrChangeType.MODIFICATION;
  /** Original implicit reverse member destruction before base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_attrName.dispose();
    this.m_newValue.dispose();
    this.m_prevValue.dispose();
    this.m_relatedNode.dispose();
    super.destroy();
  }
  /** Original acquired related node result. @returns Related node. */
  getRelatedNode(): Reference<XNode> {
    return new Reference(this.m_relatedNode);
  }
  /** Original owned prior-value copy. @returns Prior value. */
  getPrevValue(): OUString {
    return new OUString(this.m_prevValue);
  }
  /** Original owned new-value copy. @returns New value. */
  getNewValue(): OUString {
    return new OUString(this.m_newValue);
  }
  /** Original owned attribute-name copy. @returns Attribute name. */
  getAttrName(): OUString {
    return new OUString(this.m_attrName);
  }
  /** Original change discriminator. @returns Native enum. */
  getAttrChange(): AttrChangeType {
    return this.m_attrChangeType;
  }
  /** Original base initialization precedes ordered related-node and string assignments. @param typeArg - Type. @param canBubbleArg - Bubble flag. @param cancelableArg - Cancelability. @param relatedNodeArg - Borrowed node. @param prevValueArg - Prior value. @param newValueArg - New value. @param attrNameArg - Attribute name. @param attrChangeArg - Change kind. @returns Nothing. */
  initMutationEvent(
    typeArg: OUStringConstReference,
    canBubbleArg: boolean,
    cancelableArg: boolean,
    relatedNodeArg: Reference<XNode>,
    prevValueArg: OUStringConstReference,
    newValueArg: OUStringConstReference,
    attrNameArg: OUStringConstReference,
    attrChangeArg: AttrChangeType,
  ): void {
    CEvent.prototype.initEvent.call(this, typeArg, canBubbleArg, cancelableArg);
    this.m_relatedNode.assign(relatedNodeArg);
    this.m_prevValue.assign(prevValueArg);
    this.m_newValue.assign(newValueArg);
    this.m_attrName.assign(attrNameArg);
    this.m_attrChangeType = (attrChangeArg | 0) as AttrChangeType;
  }
}
