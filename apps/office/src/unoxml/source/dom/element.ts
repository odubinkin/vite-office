/** @fileoverview Original CElement local names, native attributes, source copy semantics and mutation events. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { XElement } from "../../../offapi/com/sun/star/xml/dom/XElement";
import { XAttr } from "../../../offapi/com/sun/star/xml/dom/XAttr";
import type { XNodeList } from "../../../offapi/com/sun/star/xml/dom/XNodeList";
import type { XNamedNodeMap } from "../../../offapi/com/sun/star/xml/dom/XNamedNodeMap";
import { NodeType as N } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { DOMExceptionType as E } from "../../../offapi/com/sun/star/xml/dom/DOMExceptionType";
import { AttrChangeType } from "../../../offapi/com/sun/star/xml/dom/events/AttrChangeType";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { CNode, domError, withXmlStrings, xmlString } from "./node";
import { CAttr } from "./attr";
import { CAttributesMap } from "./attributesmap";
import { CElementList } from "./elementlist";
import type { CDocument } from "./document";

/** Original element component. */
export class CElement
  extends ImplInheritanceHelper.specialize(CNode, XElement)
  implements XElement
{
  /** Original native constructor. @param document - Actual document. @param node - Native element. @returns Actual native owner. */
  constructor(document: CDocument, node: number) {
    super(document, N.ELEMENT_NODE, node);
  }
  /** Original admitted children include the legacy special attribute-copy path. @param type - Proposed child. @param replaced - Ignored replaced type. @returns Admission. */
  protected override IsChildTypeAllowed(type: N, replaced: N | null): boolean {
    void replaced;
    return [
      N.ELEMENT_NODE,
      N.TEXT_NODE,
      N.COMMENT_NODE,
      N.PROCESSING_INSTRUCTION_NODE,
      N.CDATA_SECTION_NODE,
      N.ENTITY_REFERENCE_NODE,
      N.ATTRIBUTE_NODE,
    ].includes(type);
  }
  /** Original local raw name. @returns Owned tag name. */
  getTagName(): OUString {
    return this.m_aNodePtr
      ? xmlString(getLibXml2()._office_node_name_get(this.m_aNodePtr))
      : new OUString();
  }
  /** Original local name forwarding. @returns Owned local name. */ override getLocalName(): OUString {
    return this.getTagName();
  }
  /** Original node name excludes namespace prefix. @returns Owned local name. */ override getNodeName(): OUString {
    return this.getLocalName();
  }
  /** Original acquired attribute facet from the sole node factory. @param pointer - Native attribute. @returns Actual attribute or empty. */
  private attribute(pointer: number): Reference<XAttr> {
    if (!pointer) return new Reference<XAttr>();
    const node = this.GetOwnerDocument().GetCNode(pointer);
    try {
      return new Reference<XAttr>(node, UNO_QUERY_THROW, XAttr.static_type);
    } finally {
      node.dispose();
    }
  }
  /** Original xmlGetProp result ownership. @param name - Local name. @returns Owned value. */
  getAttribute(name: OUStringConstReference): OUString {
    if (!this.m_aNodePtr) return new OUString();
    return withXmlStrings(
      [name],
      /** Reads and frees native value. @param key - Native name. @returns Owned value. */ (
        key,
      ) => {
        const m = getLibXml2(),
          value = m._xmlGetProp(this.m_aNodePtr, key);
        try {
          return value ? xmlString(value) : new OUString();
        } finally {
          m._office_xmlFree(value);
        }
      },
    );
  }
  /** Original namespace value lookup. @param uri - Namespace URI. @param name - Local name. @returns Owned value. */
  getAttributeNS(uri: OUStringConstReference, name: OUStringConstReference): OUString {
    if (!this.m_aNodePtr) return new OUString();
    return withXmlStrings(
      [name, uri],
      /** Reads and frees native namespace value. @param key - Native name. @param ns - Native URI. @returns Owned value. */ (
        key,
        ns,
      ) => {
        const m = getLibXml2(),
          value = m._xmlGetNsProp(this.m_aNodePtr, key, ns);
        try {
          return value ? xmlString(value) : new OUString();
        } finally {
          m._office_xmlFree(value);
        }
      },
    );
  }
  /** Original attribute lookup. @param name - Local name. @returns Actual attribute. */
  getAttributeNode(name: OUStringConstReference): Reference<XAttr> {
    if (!this.m_aNodePtr) return new Reference<XAttr>();
    return withXmlStrings(
      [name],
      /** Resolves the native property pointer. @param key - Native name. @returns Acquired wrapper. */ (
        key,
      ) => this.attribute(getLibXml2()._xmlHasProp(this.m_aNodePtr, key)),
    );
  }
  /** Original namespace attribute lookup. @param uri - Namespace URI. @param name - Local name. @returns Actual attribute. */
  getAttributeNodeNS(uri: OUStringConstReference, name: OUStringConstReference): Reference<XAttr> {
    if (!this.m_aNodePtr) return new Reference<XAttr>();
    return withXmlStrings(
      [name, uri],
      /** Resolves native namespace property. @param key - Name. @param ns - URI. @returns Acquired wrapper. */ (
        key,
        ns,
      ) => this.attribute(getLibXml2()._xmlHasNsProp(this.m_aNodePtr, key, ns)),
    );
  }
  /** Original raw presence check. @param name - Local name. @returns Presence. */
  hasAttribute(name: OUStringConstReference): boolean {
    return withXmlStrings(
      [name],
      /** Native presence test. @param key - Name. @returns Presence. */ (key) =>
        !!this.m_aNodePtr && !!getLibXml2()._xmlHasProp(this.m_aNodePtr, key),
    );
  }
  /** Original namespace presence check. @param uri - URI. @param name - Local name. @returns Presence. */
  hasAttributeNS(uri: OUStringConstReference, name: OUStringConstReference): boolean {
    return withXmlStrings(
      [name, uri],
      /** Native namespace presence test. @param key - Name. @param ns - URI. @returns Presence. */ (
        key,
        ns,
      ) => !!this.m_aNodePtr && !!getLibXml2()._xmlHasNsProp(this.m_aNodePtr, key, ns),
    );
  }
  /** Original removal emits no mutation event and only invalidates an existing wrapper. @param name - Local name. @returns Nothing. */
  removeAttribute(name: OUStringConstReference): void {
    if (!this.m_aNodePtr) return;
    withXmlStrings(
      [name],
      /** Native removal and noncreating wrapper lookup. @param key - Name. @returns Nothing. */ (
        key,
      ) => {
        const m = getLibXml2(),
          attr = m._xmlHasProp(this.m_aNodePtr, key);
        if (m._xmlUnsetProp(this.m_aNodePtr, key) === 0) {
          const node = this.GetOwnerDocument().GetCNode(attr, false);
          try {
            node.get()?.["invalidate"]();
          } finally {
            node.dispose();
          }
        }
      },
    );
  }
  /** Original namespace removal uses a namespace pointer found by href. @param uri - URI. @param name - Local name. @returns Nothing. */
  removeAttributeNS(uri: OUStringConstReference, name: OUStringConstReference): void {
    if (!this.m_aNodePtr) return;
    withXmlStrings(
      [name, uri],
      /** Native namespace removal. @param key - Name. @param href - URI. @returns Nothing. */ (
        key,
        href,
      ) => {
        const m = getLibXml2(),
          ns = m._xmlSearchNsByHref(m._office_node_doc_get(this.m_aNodePtr), this.m_aNodePtr, href),
          attr = m._xmlHasNsProp(this.m_aNodePtr, key, href);
        if (m._xmlUnsetNsProp(this.m_aNodePtr, ns, key) === 0) {
          const node = this.GetOwnerDocument().GetCNode(attr, false);
          try {
            node.get()?.["invalidate"]();
          } finally {
            node.dispose();
          }
        }
      },
    );
  }
  /** Original setter distinguishes ADDITION from MODIFICATION and retains native old-value ownership across events. @param name - Local name. @param value - New value. @returns Nothing. */
  setAttribute(name: OUStringConstReference, value: OUStringConstReference): void {
    const old = new OUString(),
      m = getLibXml2();
    let previous = 0,
      change = AttrChangeType.MODIFICATION;
    try {
      withXmlStrings(
        [name, value],
        /** Original native setter. @param key - Name. @param bytes - Value. @returns Nothing. */ (
          key,
          bytes,
        ) => {
          if (!this.m_aNodePtr) throw new RuntimeException();
          previous = m._xmlGetProp(this.m_aNodePtr, key);
          if (!previous) {
            change = AttrChangeType.ADDITION;
            m._xmlNewProp(this.m_aNodePtr, key, bytes);
          } else {
            const copied = xmlString(previous);
            try {
              old.assign(copied);
            } finally {
              copied.dispose();
            }
            m._xmlSetProp(this.m_aNodePtr, key, bytes);
          }
        },
      );
      if (this.GetOwnerDocument().GetEventDispatcher().hasListeners()) {
        const related = this.getAttributeNode(name);
        try {
          this.emitMutation("DOMAttrModified", related, old, value, name, change);
        } finally {
          related.dispose();
        }
      }
    } finally {
      m._office_xmlFree(previous);
      old.dispose();
    }
  }
  /** Original namespace setter rejects empty URI and ambiguous existing prefix. @param uri - Namespace URI. @param qualifiedName - Qualified name. @param value - New value. @returns Nothing. */
  setAttributeNS(
    uri: OUStringConstReference,
    qualifiedName: OUStringConstReference,
    value: OUStringConstReference,
  ): void {
    if (uri.isEmpty()) throw new RuntimeException();
    const colon = qualifiedName.indexOf(58),
      prefix = colon < 0 ? new OUString() : qualifiedName.copy(0, colon),
      local = colon < 0 ? new OUString(qualifiedName) : qualifiedName.copy(colon + 1);
    const old = new OUString(),
      m = getLibXml2();
    let previous = 0,
      change = AttrChangeType.MODIFICATION;
    let related = new Reference<XAttr>();
    try {
      withXmlStrings(
        [prefix, local, uri, value],
        /** Original native namespace search and setter. @param pfx - Prefix. @param name - Local name. @param href - URI. @param bytes - Value. @returns Nothing. */ (
          pfx,
          name,
          href,
          bytes,
        ) => {
          if (!this.m_aNodePtr) throw new RuntimeException();
          let ns = m._xmlSearchNs(m._office_node_doc_get(this.m_aNodePtr), this.m_aNodePtr, pfx);
          if (!ns) ns = m._xmlNewNs(this.m_aNodePtr, href, pfx);
          if (m._xmlStrcmp(m._office_ns_href_get(ns), href) !== 0) throw new RuntimeException();
          previous = m._xmlGetNsProp(this.m_aNodePtr, name, m._office_ns_href_get(ns));
          if (!previous) {
            change = AttrChangeType.ADDITION;
            m._xmlNewNsProp(this.m_aNodePtr, ns, name, bytes);
          } else {
            const copied = xmlString(previous);
            try {
              old.assign(copied);
            } finally {
              copied.dispose();
            }
            m._xmlSetNsProp(this.m_aNodePtr, ns, name, bytes);
          }
          if (this.GetOwnerDocument().GetEventDispatcher().hasListeners()) {
            const lookup = xmlString(name);
            try {
              related.dispose();
              related = this.getAttributeNodeNS(uri, lookup);
            } finally {
              lookup.dispose();
            }
          }
        },
      );
      if (this.GetOwnerDocument().GetEventDispatcher().hasListeners()) {
        this.emitMutation("DOMAttrModified", related, old, value, qualifiedName, change);
      }
    } finally {
      related.dispose();
      m._office_xmlFree(previous);
      old.dispose();
      local.dispose();
      prefix.dispose();
    }
  }
  /** Original copy-on-removal returns a new detached attribute and invalidates the old one. @param oldAttr - Attached attribute. @returns Detached copy. */
  removeAttributeNode(oldAttr: Reference<XAttr>): Reference<XAttr> {
    if (!this.m_aNodePtr) return new Reference<XAttr>();
    const node = oldAttr.get();
    if (!(node instanceof CNode) || !node.GetNodePtr()) throw new RuntimeException();
    const held = new Reference(node);
    try {
      const m = getLibXml2(),
        raw = node.GetNodePtr();
      if (m._office_node_parent_get(raw) !== this.m_aNodePtr) domError(E.HIERARCHY_REQUEST_ERR);
      if (m._office_node_doc_get(raw) !== m._office_node_doc_get(this.m_aNodePtr))
        domError(E.WRONG_DOCUMENT_ERR);
      const attr = oldAttr.get() as XAttr,
        uri = attr.getNamespaceURI(),
        prefix = attr.getPrefix(),
        name = attr.getName(),
        value = attr.getValue(),
        qname = new OUStringBuffer(prefix);
      let result: Reference<XAttr>;
      try {
        if (!prefix.isEmpty()) qname.append(new Uint16Array([58]));
        qname.append(name);
        const qualified = qname.makeStringAndClear();
        try {
          result = uri.isEmpty()
            ? this.GetOwnerDocument().createAttribute(name)
            : this.GetOwnerDocument().createAttributeNS(uri, qualified);
        } finally {
          qualified.dispose();
        }
        try {
          result.get()?.setValue(value);
        } catch (error) {
          result.dispose();
          throw error;
        }
        m._xmlRemoveProp(raw);
        node["invalidate"]();
        return result;
      } finally {
        qname.dispose();
        value.dispose();
        name.dispose();
        prefix.dispose();
        uri.dispose();
      }
    } finally {
      held.dispose();
    }
  }
  /** Original setter copies the supplied attribute rather than moving or replacing it. @param newAttr - Detached actual attribute. @param namespace - Source namespace overload selector. @returns The new attached copy. */
  private setAttributeNode_Impl_Lock(
    newAttr: Reference<XAttr>,
    namespace: boolean,
  ): Reference<XAttr> {
    this.checkSameOwner(newAttr);
    if (!this.m_aNodePtr) throw new RuntimeException();
    const attr = newAttr.get();
    if (!(attr instanceof CAttr) || !attr.GetNodePtr()) throw new RuntimeException();
    const m = getLibXml2(),
      raw = attr.GetNodePtr();
    if (m._office_node_parent_get(raw)) domError(E.INUSE_ATTRIBUTE_ERR);
    const child = m._office_node_children_get(raw),
      content = child ? m._office_node_content_get(child) : 0;
    const result = this.attribute(
      namespace
        ? m._xmlNewNsProp(
            this.m_aNodePtr,
            attr.GetNamespace(this.m_aNodePtr),
            m._office_node_name_get(raw),
            content,
          )
        : m._xmlNewProp(this.m_aNodePtr, m._office_node_name_get(raw), content),
    );
    if (!result.is()) throw new RuntimeException();
    const value = result.get()?.getValue() as OUString,
      name = result.get()?.getName() as OUString,
      empty = new OUString();
    try {
      this.emitMutation("DOMAttrModified", result, empty, value, name, AttrChangeType.ADDITION);
    } catch (error) {
      result.dispose();
      throw error;
    } finally {
      empty.dispose();
      name.dispose();
      value.dispose();
    }
    return result;
  }
  /** Original nonnamespace overload. @param attr - Borrowed attribute. @returns Attached copy. */ setAttributeNode(
    attr: Reference<XAttr>,
  ): Reference<XAttr> {
    return this.setAttributeNode_Impl_Lock(attr, false);
  }
  /** Original namespace overload. @param attr - Borrowed attribute. @returns Attached copy. */ setAttributeNodeNS(
    attr: Reference<XAttr>,
  ): Reference<XAttr> {
    return this.setAttributeNode_Impl_Lock(attr, true);
  }
  /** Original named-node map owner. @returns Acquired map. */ override getAttributes(): Reference<XNamedNodeMap> {
    return new Reference(new CAttributesMap(this));
  }
  /** Original cached live list, including its base element. @param name - Local name. @returns Acquired list. */ getElementsByTagName(
    name: OUStringConstReference,
  ): Reference<XNodeList> {
    return new Reference(new CElementList(this, name));
  }
  /** Original namespace-filtered cached list. @param uri - URI. @param name - Local name. @returns Acquired list. */ getElementsByTagNameNS(
    uri: OUStringConstReference,
    name: OUStringConstReference,
  ): Reference<XNodeList> {
    return new Reference(new CElementList(this, name, uri));
  }
}
