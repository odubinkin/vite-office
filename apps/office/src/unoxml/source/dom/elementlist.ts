/** @fileoverview Original CElementList facade, cached native pointer vector and weak mutation-listener owner. Name matching is exact and includes the base element. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { XNodeList } from "../../../offapi/com/sun/star/xml/dom/XNodeList";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { XEventListener } from "../../../offapi/com/sun/star/xml/dom/events/XEventListener";
import { XEventTarget } from "../../../offapi/com/sun/star/xml/dom/events/XEventTarget";
import type { XEvent } from "../../../offapi/com/sun/star/xml/dom/events/XEvent";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { domLiteral, withXmlStrings } from "./node";
import type { CElement } from "./element";

/** Original weak listener proxy prevents the document's dispatcher from retaining the list owner. */
class WeakEventListener
  extends WeakImplHelper.specialize(XEventListener)
  implements XEventListener
{
  private readonly mxOwner: WeakReferenceHelper;
  /** Original typed weak reference binding. @param owner - Actual list implementation. @returns Actual native owner. */
  constructor(owner: Reference<CElementListImpl>) {
    super();
    this.mxOwner = new WeakReferenceHelper(owner);
  }
  /** Original weak reference destruction. @returns Nothing. */ protected override destroy(): void {
    this.mxOwner.dispose();
    super.destroy();
  }
  /** Original acquired weak resolution during the callback. @param event - Borrowed event. @returns Nothing. */
  handleEvent(event: Reference<XEvent>): void {
    const owner = this.mxOwner.get();
    try {
      if (owner.is()) (owner.get() as CElementListImpl).handleEvent(event);
    } finally {
      owner.dispose();
    }
  }
}

/** Original cached implementation, separate from its public facade. */
class CElementListImpl
  extends WeakImplHelper.specialize(XNodeList, XEventListener)
  implements XNodeList, XEventListener
{
  private readonly m_pElement: Reference<CElement>;
  private readonly m_pName: number;
  private readonly m_pURI: number;
  private m_bRebuild = true;
  private readonly m_nodevector: number[] = [];
  private readonly m_xEventListener = new Reference<XEventListener>();
  /** Original terminated name/optional URI copies. @param element - Base element, possibly absent. @param name - Exact local name. @param uri - Optional URI discriminator. @returns Actual native owner. */
  constructor(
    element: CElement | null,
    name: OUStringConstReference,
    uri?: OUStringConstReference,
  ) {
    super();
    this.m_pElement = new Reference(element);
    this.m_pName = withXmlStrings(
      [name],
      /** Copies the source counted name's terminated representation. @param value - Native bytes. @returns Owned name. */ (
        value,
      ) => getLibXml2()._xmlStrdup(value),
    );
    this.m_pURI = uri
      ? withXmlStrings(
          [uri],
          /** Copies the optional namespace discriminator. @param value - Native bytes. @returns Owned URI. */ (
            value,
          ) => getLibXml2()._xmlStrdup(value),
        )
      : 0;
  }
  /** Original unregistering body and reverse member destruction. @returns Nothing. */
  protected override destroy(): void {
    const name = domLiteral("DOMSubtreeModified");
    try {
      if (this.m_xEventListener.is() && this.m_pElement.is())
        this.m_pElement.get()?.removeEventListener(name, this.m_xEventListener, false);
    } finally {
      name.dispose();
    }
    this.m_xEventListener.dispose();
    getLibXml2()._office_xmlFree(this.m_pURI);
    getLibXml2()._office_xmlFree(this.m_pName);
    this.m_pElement.dispose();
    super.destroy();
  }
  /** Original queried event target and weak callback registration. @param element - Actual base element. @returns Nothing. */
  registerListener(element: CElement): void {
    const self = new Reference(this),
      name = domLiteral("DOMSubtreeModified");
    try {
      const target = new Reference<XEventTarget>(
        element,
        UNO_QUERY_THROW,
        XEventTarget.static_type,
      );
      try {
        this.m_xEventListener.set(new WeakEventListener(self));
        target.get()?.addEventListener(name, this.m_xEventListener, false);
      } finally {
        target.dispose();
      }
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    } finally {
      name.dispose();
      self.dispose();
    }
  }
  /** Original depth-first cache rebuild traverses siblings only on recursive calls. @param node - Native start node. @param start - Top-level selector. @returns Nothing. */
  private buildlist(node: number, start = true): void {
    if (start) {
      if (!this.m_bRebuild) return;
      this.m_nodevector.length = 0;
      this.m_bRebuild = false;
    }
    const m = getLibXml2();
    for (let cur = node; cur; cur = start ? 0 : m._office_node_next_get(cur)) {
      if (
        m._office_node_type_get(cur) === 1 &&
        m._xmlStrcmp(m._office_node_name_get(cur), this.m_pName) === 0
      ) {
        const ns = m._office_node_ns_get(cur);
        if (!this.m_pURI || (ns && m._xmlStrcmp(m._office_ns_href_get(ns), this.m_pURI) === 0))
          this.m_nodevector.push(cur);
      }
      const children = m._office_node_children_get(cur);
      if (children) this.buildlist(children, false);
    }
  }
  /** Original cached live count. @returns Count. */
  getLength(): number {
    if (!this.m_pElement.is()) return 0;
    this.buildlist((this.m_pElement.get() as CElement).GetNodePtr());
    return this.m_nodevector.length | 0;
  }
  /** Original negative/range failures and absent-base empty result. @param index - Signed32 index. @returns Acquired node. */
  item(index: number): Reference<XNode> {
    index |= 0;
    if (index < 0) throw new RuntimeException();
    const element = this.m_pElement.get();
    if (!element) return new Reference<XNode>();
    this.buildlist(element.GetNodePtr());
    if (index >= this.m_nodevector.length) throw new RuntimeException();
    return element.GetOwnerDocument().GetCNode(this.m_nodevector[index] as number);
  }
  /** Original any-event invalidation. @param event - Ignored event. @returns Nothing. */ handleEvent(
    event: Reference<XEvent>,
  ): void {
    void event;
    this.m_bRebuild = true;
  }
}

/** Original public list facade, with its real separately owned implementation. */
export class CElementList
  extends WeakImplHelper.specialize(XNodeList, XEventListener)
  implements XNodeList, XEventListener
{
  private readonly m_xImpl: Reference<CElementListImpl>;
  /** Original facade construction registers only when a base element exists. @param element - Actual base or null. @param name - Exact local name. @param uri - Optional namespace. @returns Actual native owner. */
  constructor(
    element: CElement | null,
    name: OUStringConstReference,
    uri?: OUStringConstReference,
  ) {
    super();
    this.m_xImpl = new Reference(new CElementListImpl(element, name, uri));
    if (element) this.m_xImpl.get()?.registerListener(element);
  }
  /** Original implementation member destruction. @returns Nothing. */ protected override destroy(): void {
    this.m_xImpl.dispose();
    super.destroy();
  }
  /** Original facade delegation. @returns Length. */ getLength(): number {
    return (this.m_xImpl.get() as CElementListImpl).getLength();
  }
  /** Original facade delegation. @param index - Signed32 index. @returns Actual node. */ item(
    index: number,
  ): Reference<XNode> {
    return (this.m_xImpl.get() as CElementListImpl).item(index);
  }
  /** Original facade delegation. @param event - Borrowed event. @returns Nothing. */ handleEvent(
    event: Reference<XEvent>,
  ): void {
    (this.m_xImpl.get() as CElementListImpl).handleEvent(event);
  }
}
