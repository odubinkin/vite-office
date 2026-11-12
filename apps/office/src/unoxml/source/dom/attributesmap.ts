/** @fileoverview Original CAttributesMap counts only native properties and preserves namespace pointer identity and source forwarding checks. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { XNamedNodeMap } from "../../../offapi/com/sun/star/xml/dom/XNamedNodeMap";
import { XAttr } from "../../../offapi/com/sun/star/xml/dom/XAttr";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { DOMException } from "../../../offapi/com/sun/star/xml/dom/DOMException";
import { DOMExceptionType as E } from "../../../offapi/com/sun/star/xml/dom/DOMExceptionType";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { domLiteral, withXmlStrings } from "./node";
import type { CElement } from "./element";

/** Original element-owned map. */
export class CAttributesMap
  extends WeakImplHelper.specialize(XNamedNodeMap)
  implements XNamedNodeMap
{
  private readonly m_pElement: Reference<CElement>;
  /** Original strong element reference. @param element - Actual element. @returns Actual native owner. */
  constructor(element: CElement) {
    super();
    this.m_pElement = new Reference(element);
  }
  /** Original implicit member destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_pElement.dispose();
    super.destroy();
  }
  /** Original native property count excludes namespace declarations. @returns Count. */
  getLength(): number {
    const m = getLibXml2(),
      raw = this.m_pElement.get()?.GetNodePtr() ?? 0;
    let count = 0;
    for (
      let attr = raw ? m._office_node_properties_get(raw) : 0;
      attr;
      attr = m._office_node_next_get(attr)
    )
      ++count;
    return count | 0;
  }
  /** Original local-name comparison. @param name - Local name. @returns Acquired property. */
  getNamedItem(name: OUStringConstReference): Reference<XNode> {
    const element = this.m_pElement.get() as CElement,
      raw = element.GetNodePtr();
    if (!raw) return new Reference<XNode>();
    return withXmlStrings(
      [name],
      /** Searches actual property siblings. @param key - Native name. @returns Acquired wrapper. */ (
        key,
      ) => {
        const m = getLibXml2();
        for (
          let attr = m._office_node_properties_get(raw);
          attr;
          attr = m._office_node_next_get(attr)
        )
          if (m._xmlStrcmp(key, m._office_node_name_get(attr)) === 0)
            return element.GetOwnerDocument().GetCNode(attr);
        return new Reference<XNode>();
      },
    );
  }
  /** Original URI lookup then namespace-pointer comparison. @param uri - URI. @param name - Local name. @returns Acquired property. */
  getNamedItemNS(uri: OUStringConstReference, name: OUStringConstReference): Reference<XNode> {
    const element = this.m_pElement.get() as CElement,
      raw = element.GetNodePtr();
    if (!raw) return new Reference<XNode>();
    return withXmlStrings(
      [name, uri],
      /** Preserves native namespace identity. @param key - Name. @param href - URI. @returns Acquired wrapper. */ (
        key,
        href,
      ) => {
        const m = getLibXml2(),
          ns = m._xmlSearchNsByHref(m._office_node_doc_get(raw), raw, href);
        for (
          let attr = m._office_node_properties_get(raw);
          attr && ns;
          attr = m._office_node_next_get(attr)
        )
          if (
            m._xmlStrcmp(key, m._office_node_name_get(attr)) === 0 &&
            m._office_node_ns_get(attr) === ns
          )
            return element.GetOwnerDocument().GetCNode(attr);
        return new Reference<XNode>();
      },
    );
  }
  /** Original negative/out-of-range item result is empty. @param index - Signed32 index. @returns Acquired property. */
  item(index: number): Reference<XNode> {
    const element = this.m_pElement.get() as CElement,
      raw = element.GetNodePtr(),
      m = getLibXml2();
    index |= 0;
    let count = 0;
    for (
      let attr = raw ? m._office_node_properties_get(raw) : 0;
      attr;
      attr = m._office_node_next_get(attr)
    )
      if (count++ === index) return element.GetOwnerDocument().GetCNode(attr);
    return new Reference<XNode>();
  }
  /** Original comprehensive map exception includes this component context and source message. @param message - Source literal. @param code - Native code. @returns Never. */
  private error(message: string, code: E): never {
    const text = domLiteral(message),
      self = new Reference(this);
    try {
      throw new DOMException(text, self, code);
    } finally {
      self.dispose();
      text.dispose();
    }
  }
  /** Original missing-name check then element removal. @param name - Local name. @returns Detached copied attribute. */
  removeNamedItem(name: OUStringConstReference): Reference<XNode> {
    const element = this.m_pElement.get() as CElement,
      attr = element.getAttributeNode(name);
    try {
      if (!attr.is())
        this.error("CAttributesMap::removeNamedItem: no such attribute", E.NOT_FOUND_ERR);
      return element.removeAttributeNode(attr);
    } finally {
      attr.dispose();
    }
  }
  /** Original namespace missing-name check then removal. @param uri - URI. @param name - Local name. @returns Detached copied attribute. */
  removeNamedItemNS(uri: OUStringConstReference, name: OUStringConstReference): Reference<XNode> {
    const element = this.m_pElement.get() as CElement,
      attr = element.getAttributeNodeNS(uri, name);
    try {
      if (!attr.is())
        this.error("CAttributesMap::removeNamedItemNS: no such attribute", E.NOT_FOUND_ERR);
      return element.removeAttributeNode(attr);
    } finally {
      attr.dispose();
    }
  }
  /** Original source checks the input reference, not the queried attribute. @param node - Borrowed node. @returns New attached copy. */
  setNamedItem(node: Reference<XNode>): Reference<XNode> {
    const attr = new Reference<XAttr>(node, UNO_QUERY, XAttr.static_type);
    try {
      if (!node.is())
        this.error(
          "CAttributesMap::setNamedItem: XAttr argument expected",
          E.HIERARCHY_REQUEST_ERR,
        );
      return (this.m_pElement.get() as CElement).setAttributeNode(attr);
    } finally {
      attr.dispose();
    }
  }
  /** Original namespace forwarding retains the same input-reference check. @param node - Borrowed node. @returns New attached copy. */
  setNamedItemNS(node: Reference<XNode>): Reference<XNode> {
    const attr = new Reference<XAttr>(node, UNO_QUERY, XAttr.static_type);
    try {
      if (!node.is())
        this.error(
          "CAttributesMap::setNamedItemNS: XAttr argument expected",
          E.HIERARCHY_REQUEST_ERR,
        );
      return (this.m_pElement.get() as CElement).setAttributeNodeNS(attr);
    } finally {
      attr.dispose();
    }
  }
}
