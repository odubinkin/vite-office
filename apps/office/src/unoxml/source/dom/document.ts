/** @fileoverview Original CDocument node factory, weak identity cache and complete XDocument/XDocumentEvent operations. SAX/IO service facets are not advertised until their concrete owners are represented. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { UnoTypeArgument } from "../../../cppu/inc/unotype";
import {
  OUString,
  OUStringToOString,
  type OUStringConstReference,
} from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import { XAttr } from "../../../offapi/com/sun/star/xml/dom/XAttr";
import { XElement } from "../../../offapi/com/sun/star/xml/dom/XElement";
import { XText } from "../../../offapi/com/sun/star/xml/dom/XText";
import { XComment } from "../../../offapi/com/sun/star/xml/dom/XComment";
import { XCDATASection } from "../../../offapi/com/sun/star/xml/dom/XCDATASection";
import { XDocumentFragment } from "../../../offapi/com/sun/star/xml/dom/XDocumentFragment";
import { XEntityReference } from "../../../offapi/com/sun/star/xml/dom/XEntityReference";
import { XProcessingInstruction } from "../../../offapi/com/sun/star/xml/dom/XProcessingInstruction";
import { XDocumentType } from "../../../offapi/com/sun/star/xml/dom/XDocumentType";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import type { XNodeList } from "../../../offapi/com/sun/star/xml/dom/XNodeList";
import type { XDOMImplementation } from "../../../offapi/com/sun/star/xml/dom/XDOMImplementation";
import { NodeType as N } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { XDocumentEvent } from "../../../offapi/com/sun/star/xml/dom/events/XDocumentEvent";
import type { XEvent } from "../../../offapi/com/sun/star/xml/dom/events/XEvent";
import { getLibXml2, withXmlBytes } from "../../../external/libxml2/libxml2";
import * as C from "@vite-office/libxml2-wasm/constants";
import { CEventDispatcher } from "../../inc/eventdispatcher";
import { CEvent } from "../../inc/event";
import { CMutationEvent } from "../../inc/mutationevent";
import { CUIEvent } from "../../inc/uievent";
import { CMouseEvent } from "../../inc/mouseevent";
import { CNode, domLiteral, withXmlStrings } from "./node";
import { CElement } from "./element";
import { CAttr } from "./attr";
import { CText } from "./text";
import { CCDATASection } from "./cdatasection";
import { CComment } from "./comment";
import { CProcessingInstruction } from "./processinginstruction";
import { CDocumentFragment } from "./documentfragment";
import { CDocumentType } from "./documenttype";
import { CEntityReference } from "./entityreference";
import { CEntity } from "./entity";
import { CNotation } from "./notation";
import { CElementList } from "./elementlist";
import { CDOMImplementation } from "./domimplementation";
import { importNode } from "./document.import";

/** Original document owner; children keep it alive through the CNode strong member. */
export class CDocument
  extends ImplInheritanceHelper.specialize(CNode, XDocument, XDocumentEvent)
  implements XDocument, XDocumentEvent
{
  private readonly m_aDocPtr: number;
  private readonly m_NodeMap = new Map<number, { weak: WeakReferenceHelper; identity: CNode }>();
  private readonly m_pEventDispatcher = new CEventDispatcher();
  /** Original private document constructor; only the two source factory sites call it. @param document - Actual native document. @returns Actual native owner. */
  private constructor(document: number) {
    super(null, N.DOCUMENT_NODE, document);
    this.m_aDocPtr = document;
  }
  /** Original sole document factory registers its own wrapper in the weak node map. @param document - Native document ownership transfer. @returns Acquired document. */
  static CreateCDocument(document: number): Reference<CDocument> {
    const node = new CDocument(document),
      owner = new Reference(node);
    node.m_NodeMap.set(document, { weak: new WeakReferenceHelper(owner), identity: node });
    return owner;
  }
  /** Original destructor body frees the C document before reverse members and base. @returns Nothing. */
  protected override destroy(): void {
    getLibXml2()._xmlFreeDoc(this.m_aDocPtr);
    this.m_pEventDispatcher.dispose();
    for (const entry of this.m_NodeMap.values()) entry.weak.dispose();
    this.m_NodeMap.clear();
    super.destroy();
  }
  /** Original document self owner. @returns This document. */ override GetOwnerDocument(): CDocument {
    return this;
  }
  /** Original borrowed dispatcher. @returns Actual dispatcher. */ GetEventDispatcher(): CEventDispatcher {
    return this.m_pEventDispatcher;
  }
  /** Original weak factory lookup and native node-type dispatch. @param pointer - Native node or NULL. @param create - Whether construction is permitted. @returns Acquired actual wrapper. */
  GetCNode(pointer: number, create = true): Reference<CNode> {
    if (!pointer) return new Reference<CNode>();
    const cached = this.m_NodeMap.get(pointer);
    if (cached) {
      const resolved = cached.weak.get();
      try {
        if (resolved.is()) return new Reference(resolved.get() as CNode);
      } finally {
        resolved.dispose();
      }
    }
    if (!create) return new Reference<CNode>();
    let node: CNode | undefined;
    switch (getLibXml2()._office_node_type_get(pointer)) {
      case C.XML_ELEMENT_NODE:
        node = new CElement(this, pointer);
        break;
      case C.XML_ATTRIBUTE_NODE:
        node = new CAttr(this, pointer);
        break;
      case C.XML_TEXT_NODE:
        node = new CText(this, pointer);
        break;
      case C.XML_CDATA_SECTION_NODE:
        node = new CCDATASection(this, pointer);
        break;
      case C.XML_ENTITY_REF_NODE:
        node = new CEntityReference(this, pointer);
        break;
      case C.XML_ENTITY_NODE:
        node = new CEntity(this, pointer);
        break;
      case C.XML_PI_NODE:
        node = new CProcessingInstruction(this, pointer);
        break;
      case C.XML_COMMENT_NODE:
        node = new CComment(this, pointer);
        break;
      case C.XML_DOCUMENT_NODE:
        node = new CDocument(pointer);
        break;
      case C.XML_DOCUMENT_TYPE_NODE:
      case C.XML_DTD_NODE:
        node = new CDocumentType(this, pointer);
        break;
      case C.XML_DOCUMENT_FRAG_NODE:
        node = new CDocumentFragment(this, pointer);
        break;
      case C.XML_NOTATION_NODE:
        node = new CNotation(this, pointer);
        break;
      default:
        return new Reference<CNode>();
    }
    const result = new Reference(node),
      weak = new WeakReferenceHelper(result);
    if (this.m_NodeMap.has(pointer)) {
      weak.dispose();
      result.dispose();
      return new Reference<CNode>();
    }
    this.m_NodeMap.set(pointer, { weak, identity: node });
    return result;
  }
  /** Original identity guard prevents a dying wrapper from erasing another instance. @param pointer - Native cache key. @param node - Actual wrapper being invalidated. @returns Nothing. */
  RemoveCNode(pointer: number, node: CNode): void {
    const entry = this.m_NodeMap.get(pointer);
    if (entry?.identity === node) {
      this.m_NodeMap.delete(pointer);
      entry.weak.dispose();
    }
  }
  /** Original root scan only considers native element children. @returns Native root or NULL. */
  private root(): number {
    const m = getLibXml2();
    for (
      let node = m._office_node_children_get(this.m_aDocPtr);
      node;
      node = m._office_node_next_get(node)
    )
      if (m._office_node_type_get(node) === C.XML_ELEMENT_NODE) return node;
    return 0;
  }
  /** Original DTD/document-type scan. @returns Native doctype or NULL. */
  private doctype(): number {
    const m = getLibXml2();
    for (
      let node = m._office_node_children_get(this.m_aDocPtr);
      node;
      node = m._office_node_next_get(node)
    )
      if ([C.XML_DTD_NODE, C.XML_DOCUMENT_TYPE_NODE].includes(m._office_node_type_get(node)))
        return node;
    return 0;
  }
  /** Original document admits only one element/doctype, plus comments and PI. @param type - Proposed type. @param replaced - Optional replaced type. @returns Admission. */
  protected override IsChildTypeAllowed(type: N, replaced: N | null): boolean {
    if (type === N.PROCESSING_INSTRUCTION_NODE || type === N.COMMENT_NODE) return true;
    if (type === N.ELEMENT_NODE) return replaced === type || !this.root();
    if (type === N.DOCUMENT_TYPE_NODE) return replaced === type || !this.doctype();
    return false;
  }
  /** Original Reference query construction around a temporary factory result. @param pointer - Native node. @param type - Actual declared interface type. @param throwing - Source query-throw selector. @returns Acquired actual facet. */
  private facet<T extends XNode>(
    pointer: number,
    type: UnoTypeArgument,
    throwing = true,
  ): Reference<T> {
    const node = this.GetCNode(pointer);
    try {
      return throwing
        ? new Reference<T>(node, UNO_QUERY_THROW, type)
        : new Reference<T>(node, UNO_QUERY, type);
    } finally {
      node.dispose();
    }
  }
  /** Original named attribute creation marks its detached allocation unlinked. @param name - Attribute name. @returns Actual attribute. */
  createAttribute(name: OUStringConstReference): Reference<XAttr> {
    return withXmlStrings(
      [name],
      /** Native attribute allocation. @param key - Name. @returns Acquired attribute. */ (key) => {
        const node = this.GetCNode(getLibXml2()._xmlNewDocProp(this.m_aDocPtr, key, 0));
        try {
          const attr = node.get();
          if (attr) attr["m_bUnlinked"] = true;
          return new Reference<XAttr>(node, UNO_QUERY_THROW, XAttr.static_type);
        } finally {
          node.dispose();
        }
      },
    );
  }
  /** Original namespace attribute keeps a detached OString pair rather than creating an attached xmlNs. @param uri - Namespace URI, including empty. @param qualified - Qualified name. @returns Actual detached attribute. */
  createAttributeNS(
    uri: OUStringConstReference,
    qualified: OUStringConstReference,
  ): Reference<XAttr> {
    const colon = qualified.indexOf(58),
      prefix = colon < 0 ? new OUString() : qualified.copy(0, colon),
      local = colon < 0 ? new OUString(qualified) : qualified.copy(colon + 1);
    try {
      return withXmlStrings(
        [local],
        /** Allocates the native local-name property. @param key - Local name. @returns Acquired attribute. */ (
          key,
        ) => {
          const node = this.GetCNode(getLibXml2()._xmlNewDocProp(this.m_aDocPtr, key, 0));
          try {
            const attr = node.get() as CAttr;
            attr["m_oNamespace"] = [
              OUStringToOString(uri.getStr().subarray(0, uri.getLength()), RTL_TEXTENCODING_UTF8),
              OUStringToOString(
                prefix.getStr().subarray(0, prefix.getLength()),
                RTL_TEXTENCODING_UTF8,
              ),
            ];
            attr["m_bUnlinked"] = true;
            return new Reference<XAttr>(node, UNO_QUERY_THROW, XAttr.static_type);
          } finally {
            node.dispose();
          }
        },
      );
    } finally {
      local.dispose();
      prefix.dispose();
    }
  }
  /** Original CDATA creation passes the complete UTF8 byte count. @param data - Borrowed data. @returns Actual CDATA. */
  createCDATASection(data: OUStringConstReference): Reference<XCDATASection> {
    const bytes = OUStringToOString(
      data.getStr().subarray(0, data.getLength()),
      RTL_TEXTENCODING_UTF8,
    );
    try {
      return withXmlBytes(
        bytes.getStr().subarray(0, bytes.getLength()),
        /** Native counted CDATA allocation. @param value - Bytes. @param length - Count. @returns Actual facet. */ (
          value,
          length,
        ) =>
          this.facet(
            getLibXml2()._xmlNewCDataBlock(this.m_aDocPtr, value, length),
            XCDATASection.static_type,
          ),
      );
    } finally {
      bytes.dispose();
    }
  }
  /** Original comment creation. @param data - Borrowed data. @returns Actual comment. */
  createComment(data: OUStringConstReference): Reference<XComment> {
    return withXmlStrings(
      [data],
      /** Native comment allocation. @param value - Bytes. @returns Actual facet. */ (value) =>
        this.facet(getLibXml2()._xmlNewDocComment(this.m_aDocPtr, value), XComment.static_type),
    );
  }
  /** Original fragment creation. @returns Actual fragment. */
  createDocumentFragment(): Reference<XDocumentFragment> {
    return this.facet(
      getLibXml2()._xmlNewDocFragment(this.m_aDocPtr),
      XDocumentFragment.static_type,
    );
  }
  /** Original raw-name element creation performs no extra QName validation. @param name - Raw name. @returns Actual element. */
  createElement(name: OUStringConstReference): Reference<XElement> {
    return withXmlStrings(
      [name],
      /** Native element allocation. @param key - Name. @returns Actual facet. */ (key) =>
        this.facet(getLibXml2()._xmlNewDocNode(this.m_aDocPtr, 0, key, 0), XElement.static_type),
    );
  }
  /** Original element namespace creation uses a terminated empty prefix when no colon exists. @param uri - Nonempty URI. @param qualified - Qualified name. @returns Actual element. */
  createElementNS(
    uri: OUStringConstReference,
    qualified: OUStringConstReference,
  ): Reference<XElement> {
    const colon = qualified.indexOf(58);
    if (uri.isEmpty()) throw new RuntimeException();
    const prefix = colon < 0 ? new OUString() : qualified.copy(0, colon),
      local = colon < 0 ? new OUString(qualified) : qualified.copy(colon + 1);
    try {
      return withXmlStrings(
        [prefix, local, uri],
        /** Native element and namespace allocation. @param pfx - Prefix. @param key - Local name. @param href - URI. @returns Actual facet. */ (
          pfx,
          key,
          href,
        ) => {
          const m = getLibXml2(),
            node = m._xmlNewDocNode(this.m_aDocPtr, 0, key, 0),
            ns = m._xmlNewNs(node, href, pfx);
          m._xmlSetNs(node, ns);
          return this.facet(node, XElement.static_type);
        },
      );
    } finally {
      local.dispose();
      prefix.dispose();
    }
  }
  /** Original entity reference creation. @param name - Entity name. @returns Actual reference. */
  createEntityReference(name: OUStringConstReference): Reference<XEntityReference> {
    return withXmlStrings(
      [name],
      /** Native reference allocation. @param key - Name. @returns Actual facet. */ (key) =>
        this.facet(
          getLibXml2()._xmlNewReference(this.m_aDocPtr, key),
          XEntityReference.static_type,
        ),
    );
  }
  /** Original PI creation explicitly writes its containing document. @param target - Target. @param data - Data. @returns Actual PI. */
  createProcessingInstruction(
    target: OUStringConstReference,
    data: OUStringConstReference,
  ): Reference<XProcessingInstruction> {
    return withXmlStrings(
      [target, data],
      /** Native PI allocation. @param name - Target. @param value - Data. @returns Actual facet. */ (
        name,
        value,
      ) => {
        const m = getLibXml2(),
          node = m._xmlNewDocPI(this.m_aDocPtr, name, value);
        m._office_node_doc_set(node, this.m_aDocPtr);
        return this.facet(node, XProcessingInstruction.static_type);
      },
    );
  }
  /** Original terminated text creation. @param data - Data. @returns Actual text. */
  createTextNode(data: OUStringConstReference): Reference<XText> {
    return withXmlStrings(
      [data],
      /** Native text allocation. @param value - Bytes. @returns Actual facet. */ (value) =>
        this.facet(getLibXml2()._xmlNewDocText(this.m_aDocPtr, value), XText.static_type),
    );
  }
  /** Original queried doctype. @returns Actual doctype or empty. */
  getDoctype(): Reference<XDocumentType> {
    return this.facet(this.doctype(), XDocumentType.static_type, false);
  }
  /** Original internal acquired concrete element. @returns Actual element or empty. */
  GetDocumentElement(): Reference<CElement> {
    const node = this.GetCNode(this.root());
    try {
      return new Reference(node.get() as CElement | null);
    } finally {
      node.dispose();
    }
  }
  /** Original root query. @returns Actual element or empty. */
  getDocumentElement(): Reference<XElement> {
    const root = this.root();
    return root ? this.facet(root, XElement.static_type, false) : new Reference<XElement>();
  }
  /** Original DFS checks native ID attribute type rather than an untyped name convention. @param id - Counted ID argument. @returns First matching element. */
  getElementById(id: OUStringConstReference): Reference<XElement> {
    return withXmlStrings(
      [id],
      /** Searches actual native ID properties. @param value - Native ID. @returns Actual element or empty. */ (
        value,
      ) => {
        const m = getLibXml2();
        /** Original current/children/siblings traversal order. @param node - Native node. @returns Native match. */
        function search(node: number): number {
          if (!node) return 0;
          if (m._office_node_type_get(node) === C.XML_ELEMENT_NODE) {
            for (
              let attr = m._office_node_properties_get(node);
              attr;
              attr = m._office_node_next_get(attr)
            )
              if (
                m._office_attr_atype_get(attr) === C.XML_ATTRIBUTE_ID &&
                m._xmlStrcmp(
                  m._office_node_content_get(m._office_node_children_get(attr)),
                  value,
                ) === 0
              )
                return node;
          }
          return search(m._office_node_children_get(node)) || search(m._office_node_next_get(node));
        }
        const node = search(this.m_aNodePtr);
        return node ? this.facet(node, XElement.static_type, false) : new Reference<XElement>();
      },
    );
  }
  /** Original list is based on the current root element, not on a substitute document traversal. @param name - Exact local name. @returns Actual list. */
  getElementsByTagName(name: OUStringConstReference): Reference<XNodeList> {
    const root = this.GetDocumentElement();
    try {
      return new Reference(new CElementList(root.get(), name));
    } finally {
      root.dispose();
    }
  }
  /** Original namespace list. @param uri - URI. @param name - Exact local name. @returns Actual list. */
  getElementsByTagNameNS(
    uri: OUStringConstReference,
    name: OUStringConstReference,
  ): Reference<XNodeList> {
    const root = this.GetDocumentElement();
    try {
      return new Reference(new CElementList(root.get(), name, uri));
    } finally {
      root.dispose();
    }
  }
  /** Original immortal implementation object. @returns Actual singleton. */ getImplementation(): Reference<XDOMImplementation> {
    return new Reference(CDOMImplementation.get());
  }
  /** Original document name. @returns Owned source literal. */ override getNodeName(): OUString {
    return domLiteral("#document");
  }
  /** Original event-name dispatch, rather than DOM category aliases. @param type - Source event name. @returns Actual uninitialized event component. */
  createEvent(type: OUStringConstReference): Reference<XEvent> {
    const equal =
      /** Original comparison with ASCII source literals. @param name - Literal. @returns Equality. */ (
        name: string,
      ) => type.equalsAsciiL(new TextEncoder().encode(name), name.length);
    if (
      [
        "DOMSubtreeModified",
        "DOMNodeInserted",
        "DOMNodeRemoved",
        "DOMNodeRemovedFromDocument",
        "DOMNodeInsertedIntoDocument",
        "DOMAttrModified",
        "DOMCharacterDataModified",
      ].some(equal)
    )
      return new Reference(new CMutationEvent());
    if (["DOMFocusIn", "DOMFocusOut", "DOMActivate"].some(equal))
      return new Reference(new CUIEvent());
    if (["click", "mousedown", "mouseup", "mouseover", "mousemove", "mouseout"].some(equal))
      return new Reference(new CMouseEvent());
    return new Reference(new CEvent());
  }
  /** Original import returns same-document input without cloning and otherwise uses only actual UNO operations. @param imported - Borrowed source node. @param deep - Recursion selector. @returns Imported actual node. */
  importNode(imported: Reference<XNode>, deep: boolean): Reference<XNode> {
    if (!imported.is()) throw new RuntimeException();
    const owner = (imported.get() as XNode).getOwnerDocument();
    try {
      if (owner.get() === this) return new Reference(imported);
    } finally {
      owner.dispose();
    }
    return importNode(this, imported, deep);
  }
}
