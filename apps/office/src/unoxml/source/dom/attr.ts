/** @fileoverview Original CAttr content children, detached namespace values and mutation events over native C allocations. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import {
  OUString,
  OUStringToOString,
  type OUStringConstReference,
} from "../../../sal/inc/rtl/ustring";
import type { OString } from "../../../sal/inc/rtl/string";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { XAttr } from "../../../offapi/com/sun/star/xml/dom/XAttr";
import { XElement } from "../../../offapi/com/sun/star/xml/dom/XElement";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { NodeType as N } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { CNode, withXmlStrings, xmlString } from "./node";
import type { CDocument } from "./document";

/** Original attribute owner; optional namespace bytes belong only to newly created detached attributes. */
export class CAttr extends ImplInheritanceHelper.specialize(CNode, XAttr) implements XAttr {
  private readonly m_aAttrPtr: number;
  private m_oNamespace: [uri: OString, prefix: OString] | undefined;
  /** Original native constructor. @param document - Actual owner. @param node - Native attribute. @returns Actual native owner. */
  constructor(document: CDocument, node: number) {
    super(document, N.ATTRIBUTE_NODE, node);
    this.m_aAttrPtr = node;
  }
  /** Original optional pair destruction precedes base node destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_oNamespace?.[1].dispose();
    this.m_oNamespace?.[0].dispose();
    super.destroy();
  }
  /** Original allowed attribute child types. @param type - Proposed child. @param replaced - Ignored replaced type. @returns Admission. */
  protected override IsChildTypeAllowed(type: N, replaced: N | null): boolean {
    void replaced;
    return type === N.TEXT_NODE || type === N.ENTITY_REFERENCE_NODE;
  }
  /** Original namespace lookup retains the source differing-href branch. @param node - Receiving element. @returns Borrowed native namespace. */
  GetNamespace(node: number): number {
    if (!this.m_oNamespace) return 0;
    const uri = this.getNamespaceURI(),
      prefix = this.getPrefix();
    try {
      return withXmlStrings(
        [uri, prefix],
        /** Original prefix search, creation and href fallback. @param href - Native URI. @param name - Native prefix. @returns Namespace pointer. */ (
          href,
          name,
        ) => {
          const m = getLibXml2();
          let ns = m._xmlSearchNs(m._office_node_doc_get(node), node, name);
          if (ns && m._xmlStrcmp(m._office_ns_href_get(ns), href) !== 0) return ns;
          ns = m._xmlNewNs(node, href, name);
          return ns || m._xmlSearchNsByHref(m._office_node_doc_get(node), node, href);
        },
      );
    } finally {
      prefix.dispose();
      uri.dispose();
    }
  }
  /** Original local raw attribute name. @returns Owned name. */
  getName(): OUString {
    return this.m_aNodePtr && this.m_aAttrPtr
      ? xmlString(getLibXml2()._office_node_name_get(this.m_aAttrPtr))
      : new OUString();
  }
  /** Original acquired owner element. @returns Element or empty. */
  getOwnerElement(): Reference<XElement> {
    const raw =
      this.m_aNodePtr && this.m_aAttrPtr
        ? getLibXml2()._office_node_parent_get(this.m_aAttrPtr)
        : 0;
    if (!raw) return new Reference<XElement>();
    const wrapped = this.GetOwnerDocument().GetCNode(raw);
    try {
      return new Reference<XElement>(wrapped, UNO_QUERY_THROW, XElement.static_type);
    } finally {
      wrapped.dispose();
    }
  }
  /** Original source constant, including after invalidation. @returns True. */ getSpecified(): boolean {
    return true;
  }
  /** Original value reads only the first native content child. @returns Owned value. */
  getValue(): OUString {
    const m = getLibXml2(),
      child = this.m_aNodePtr && this.m_aAttrPtr ? m._office_node_children_get(this.m_aAttrPtr) : 0;
    return child ? xmlString(m._office_node_content_get(child)) : new OUString();
  }
  /** Original entity encoding, child-list replacement and unconditional attribute/subtree events. @param value - Borrowed value. @returns Nothing. */
  setValue(value: OUStringConstReference): void {
    if (!this.m_aNodePtr || !this.m_aAttrPtr) return;
    const old = this.getValue(),
      m = getLibXml2();
    try {
      withXmlStrings(
        [value],
        /** Original native child-content replacement. @param bytes - Borrowed UTF8 value. @returns Nothing. */ (
          bytes,
        ) => {
          const encoded = m._xmlEncodeEntitiesReentrant(
            m._office_node_doc_get(this.m_aAttrPtr),
            bytes,
          );
          try {
            m._xmlFreeNodeList(m._office_node_children_get(this.m_aAttrPtr));
            m._office_node_children_set(
              this.m_aAttrPtr,
              m._xmlStringGetNodeList(m._office_node_doc_get(this.m_aAttrPtr), encoded),
            );
            for (
              let child = m._office_node_children_get(this.m_aAttrPtr);
              child;
              child = m._office_node_next_get(child)
            ) {
              m._office_node_parent_set(child, this.m_aNodePtr);
              m._office_node_doc_set(child, m._office_node_doc_get(this.m_aAttrPtr));
              if (!m._office_node_next_get(child)) m._office_node_last_set(this.m_aNodePtr, child);
            }
          } finally {
            m._office_xmlFree(encoded);
          }
        },
      );
      const related = new Reference<XNode>(this),
        name = this.getName();
      try {
        this.emitMutation("DOMAttrModified", related, old, value, name);
      } finally {
        name.dispose();
        related.dispose();
      }
    } finally {
      old.dispose();
    }
  }
  /** Original detached prefix assignment; attached attributes delegate to shared namespace mutation. @param prefix - Borrowed prefix. @returns Nothing. */
  override setPrefix(prefix: OUStringConstReference): void {
    if (!this.m_aNodePtr) return;
    if (this.m_oNamespace) {
      const value = OUStringToOString(
        prefix.getStr().subarray(0, prefix.getLength()),
        RTL_TEXTENCODING_UTF8,
      );
      this.m_oNamespace[1].assign(value);
      value.dispose();
    } else super.setPrefix(prefix);
  }
  /** Original counted detached prefix getter. @returns Owned prefix. */
  override getPrefix(): OUString {
    if (!this.m_aNodePtr) return new OUString();
    const value = this.m_oNamespace?.[1];
    return value
      ? new OUString(
          new Uint8Array(value.getStr().subarray(0, value.getLength())),
          value.getLength(),
          RTL_TEXTENCODING_UTF8,
        )
      : super.getPrefix();
  }
  /** Original counted detached URI getter. @returns Owned namespace URI. */
  override getNamespaceURI(): OUString {
    if (!this.m_aNodePtr) return new OUString();
    const value = this.m_oNamespace?.[0];
    return value
      ? new OUString(
          new Uint8Array(value.getStr().subarray(0, value.getLength())),
          value.getLength(),
          RTL_TEXTENCODING_UTF8,
        )
      : super.getNamespaceURI();
  }
  /** Original name forwarding. @returns Owned local name. */ override getLocalName(): OUString {
    return this.getName();
  }
  /** Original name forwarding. @returns Owned name. */ override getNodeName(): OUString {
    return this.getName();
  }
  /** Original value forwarding. @returns Owned value. */ override getNodeValue(): OUString {
    return this.getValue();
  }
  /** Original value forwarding. @param value - Borrowed value. @returns Nothing. */ override setNodeValue(
    value: OUStringConstReference,
  ): void {
    this.setValue(value);
  }
}
