/** @fileoverview Original CNode behavior and namespace reconciliation over actual pinned libxml2 allocations. Synchronous realm execution inlines native mutex scopes. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import {
  OUString,
  OUStringToOString,
  type OUStringConstReference,
} from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import type { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import type { XNamedNodeMap } from "../../../offapi/com/sun/star/xml/dom/XNamedNodeMap";
import type { XNodeList } from "../../../offapi/com/sun/star/xml/dom/XNodeList";
import { NodeType } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { DOMException } from "../../../offapi/com/sun/star/xml/dom/DOMException";
import { DOMExceptionType as E } from "../../../offapi/com/sun/star/xml/dom/DOMExceptionType";
import { XEventTarget } from "../../../offapi/com/sun/star/xml/dom/events/XEventTarget";
import { XDocumentEvent } from "../../../offapi/com/sun/star/xml/dom/events/XDocumentEvent";
import { XMutationEvent } from "../../../offapi/com/sun/star/xml/dom/events/XMutationEvent";
import { AttrChangeType } from "../../../offapi/com/sun/star/xml/dom/events/AttrChangeType";
import type { XEvent } from "../../../offapi/com/sun/star/xml/dom/events/XEvent";
import type { XEventListener } from "../../../offapi/com/sun/star/xml/dom/events/XEventListener";
import { getLibXml2, type XmlNodePtr } from "../../../external/libxml2/libxml2";
import type { CDocument } from "./document";
import type { CAttr } from "./attr";
import { CChildList } from "./childlist";

/** Binds original OString UTF8 temporaries to native C argument buffers, preserving RTL conversion and native termination. @param values - Original counted Unicode arguments. @param action - Synchronous native consumer. @returns Consumer result. */
export function withXmlStrings<const T extends readonly OUStringConstReference[], R>(
  values: T,
  action: (...pointers: { -readonly [K in keyof T]: number }) => R,
): R {
  const m = getLibXml2(),
    pointers: number[] = [];
  try {
    for (const value of values) {
      const bytes = OUStringToOString(
        value.getStr().subarray(0, value.getLength()),
        RTL_TEXTENCODING_UTF8,
      );
      try {
        const pointer = m._malloc(bytes.getLength() + 1);
        pointers.push(pointer);
        m.HEAPU8.set(bytes.getStr().subarray(0, bytes.getLength()), pointer);
        m.HEAPU8[pointer + bytes.getLength()] = 0;
      } finally {
        bytes.dispose();
      }
    }
    return action(...(pointers as { -readonly [K in keyof T]: number }));
  } finally {
    for (let i = pointers.length - 1; i >= 0; --i) m._free(pointers[i] as number);
  }
}
/** Original counted UTF8 OUString construction, with a realm-local byte view for the existing RTL overload. @param pointer - Native bytes. @param length - Optional explicit source count. @returns Owned RTL string. */
export function xmlString(pointer: number, length?: number): OUString {
  const m = getLibXml2(),
    count = length ?? m._xmlStrlen(pointer);
  return new OUString(
    new Uint8Array(m.HEAPU8.subarray(pointer, pointer + count)),
    count,
    RTL_TEXTENCODING_UTF8,
  );
}
/** Transports original source UTF16 literals into actual RTL values. @param value - Source literal. @returns Owned RTL value. */
export function domLiteral(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < units.length; ++i) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Original default-constructed DOMException and explicit code assignment. @param code - Native enum. @returns Never. */
export function domError(code: E): never {
  const error = new DOMException();
  error.Code = code;
  throw error;
}

/** Original recursive namespace pointer replacement on a sibling list. @param node - First native node. @param oldNs - Removed namespace. @param newNs - Surviving namespace. @returns Nothing. */
function exchangeNamespace(node: number, oldNs: number, newNs: number): void {
  const m = getLibXml2();
  for (let cur = node; cur; cur = m._office_node_next_get(cur)) {
    if (m._office_node_ns_get(cur) === oldNs) m._office_node_ns_set(cur, newNs);
    if (m._office_node_type_get(cur) === 1) {
      for (
        let attr = m._office_node_properties_get(cur);
        attr;
        attr = m._office_node_next_get(attr)
      )
        if (m._office_node_ns_get(attr) === oldNs) m._office_node_ns_set(attr, newNs);
      exchangeNamespace(m._office_node_children_get(cur), oldNs, newNs);
    }
  }
}
/** Original custom nscleanup, including attribute rebinding by prefix without an href equality check. @param node - First native node. @param parent - Namespace lookup context. @returns Nothing. */
export function nscleanup(node: number, parent: number): void {
  const m = getLibXml2();
  if (node && m._office_node_type_get(node) === 1) {
    for (
      let attr = m._office_node_properties_get(node);
      attr;
      attr = m._office_node_next_get(attr)
    ) {
      const old = m._office_node_ns_get(attr);
      if (old) {
        const found = m._xmlSearchNs(
          m._office_node_doc_get(node),
          parent,
          m._office_ns_prefix_get(old),
        );
        if (found) m._office_node_ns_set(attr, found);
      }
    }
  }
  for (let cur = node; cur; cur = m._office_node_next_get(cur)) {
    nscleanup(m._office_node_children_get(cur), cur);
    const old = m._office_node_ns_get(cur);
    if (!old) continue;
    const found = m._xmlSearchNs(m._office_node_doc_get(cur), parent, m._office_ns_prefix_get(old));
    if (
      !found ||
      found === old ||
      m._xmlStrcmp(m._office_ns_href_get(found), m._office_ns_href_get(old)) !== 0
    )
      continue;
    let previous = 0;
    for (let declaration = m._office_node_nsDef_get(cur); declaration;) {
      const next = m._office_ns_next_get(declaration);
      const replacement = m._xmlSearchNs(
        m._office_node_doc_get(cur),
        parent,
        m._office_ns_prefix_get(declaration),
      );
      if (
        replacement &&
        replacement !== declaration &&
        m._xmlStrcmp(m._office_ns_href_get(replacement), m._office_ns_href_get(declaration)) === 0
      ) {
        exchangeNamespace(cur, declaration, replacement);
        if (previous) m._office_ns_next_set(previous, next);
        else m._office_node_nsDef_set(cur, next);
        m._xmlFreeNs(declaration);
      } else previous = declaration;
      declaration = next;
    }
  }
}

/** Original common node owner. Concrete node construction belongs exclusively to CDocument.GetCNode. */
export class CNode
  extends WeakImplHelper.specialize(XNode, XEventTarget)
  implements XNode, XEventTarget
{
  protected m_bUnlinked = false;
  protected readonly m_aNodeType: NodeType;
  protected m_aNodePtr: XmlNodePtr;
  /** Original concrete document pointer, with its compile-time forward declaration erased to the actual implemented XDocument facet; no query or substitute owner is added. */
  private readonly m_xDocument: Reference<XDocument>;
  /** Original containing-document reference excludes the document itself. @param document - Actual document, or null during document base construction. @param type - Native UNO node enum. @param node - Actual native C allocation. @returns Actual native owner. */
  constructor(document: XDocument | null, type: NodeType, node: XmlNodePtr) {
    super();
    this.m_aNodeType = type;
    this.m_aNodePtr = node;
    this.m_xDocument = new Reference(
      getLibXml2()._office_node_type_get(node) !== 9 ? document : null,
    );
  }
  /** Original cache removal and unlinked native-node freeing; no JS finalizer substitutes for native logical destruction. @returns Nothing. */
  protected invalidate(): void {
    if (this.m_aNodePtr && this.m_xDocument.is())
      this.GetOwnerDocument().RemoveCNode(this.m_aNodePtr, this);
    if (this.m_bUnlinked) getLibXml2()._xmlFreeNode(this.m_aNodePtr);
    this.m_aNodePtr = 0;
  }
  /** Original destructor body followed by member/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.invalidate();
    this.m_xDocument.dispose();
    super.destroy();
  }
  /** Original borrowed containing-document access. @returns Document owner. */
  GetOwnerDocument(): CDocument {
    return this.m_xDocument.get() as CDocument;
  }
  /** Original borrowed raw pointer. @returns Native pointer or NULL after invalidation. */
  GetNodePtr(): XmlNodePtr {
    return this.m_aNodePtr;
  }
  /** Original base admits no children. @param type - Proposed child. @param replaced - Optional replaced type. @returns False. */
  protected IsChildTypeAllowed(type: NodeType, replaced: NodeType | null): boolean {
    void type;
    void replaced;
    return false;
  }
  /** Original UNO owner comparison. @param node - Borrowed node reference. @returns Nothing. */
  protected checkSameOwner(node: Reference<XNode>): void {
    const other = (node.get() as XNode).getOwnerDocument(),
      own = this.getOwnerDocument();
    try {
      if (other.get() !== own.get()) domError(E.WRONG_DOCUMENT_ERR);
    } finally {
      other.dispose();
      own.dispose();
    }
  }
  /** Original parent relation check on the reference overload. @param node - Borrowed child. @returns Nothing. */
  private checkChild(node: Reference<XNode>): void {
    const parent = node.get()?.getParentNode();
    try {
      if (parent?.get() !== this) domError(E.HIERARCHY_REQUEST_ERR);
    } finally {
      parent?.dispose();
    }
  }
  /** Original dynamic_cast and invalidated-pointer checks. @param node - Borrowed reference. @returns Actual node owner. */
  private implementation(node: Reference<XNode>): CNode {
    const result = node.get();
    if (!(result instanceof CNode) || !result.GetNodePtr()) throw new RuntimeException();
    return result;
  }
  /** Original raw child validation, in source order. @param child - Actual child. @param replaced - Optional replaced type. @returns Nothing. */
  private checkDetached(child: CNode, replaced: NodeType | null): void {
    const m = getLibXml2(),
      raw = child.GetNodePtr();
    if (
      raw === this.m_aNodePtr ||
      m._office_node_parent_get(raw) ||
      !this.IsChildTypeAllowed(child.m_aNodeType, replaced)
    )
      domError(E.HIERARCHY_REQUEST_ERR);
  }
  /** Original native insertion, attribute copy and text coalescing invalidation. @param newChild - Borrowed new child. @returns Acquired actual result. */
  appendChild(newChild: Reference<XNode>): Reference<XNode> {
    if (!this.m_aNodePtr) return new Reference<XNode>();
    const child = this.implementation(newChild),
      m = getLibXml2(),
      raw = child.GetNodePtr();
    if (m._office_node_doc_get(raw) !== m._office_node_doc_get(this.m_aNodePtr))
      domError(E.WRONG_DOCUMENT_ERR);
    this.checkDetached(child, null);
    let result: number;
    if (m._office_node_type_get(raw) === 2) {
      const attribute = child as CAttr;
      if (typeof attribute.GetNamespace !== "function") throw new RuntimeException();
      const text = m._office_node_children_get(raw),
        ns = attribute.GetNamespace(this.m_aNodePtr);
      const content = text ? m._office_node_content_get(text) : 0;
      if (text)
        result = ns
          ? m._xmlNewNsProp(this.m_aNodePtr, ns, m._office_node_name_get(raw), content)
          : m._xmlNewProp(this.m_aNodePtr, m._office_node_name_get(raw), content);
      else {
        const empty = domLiteral("");
        try {
          result = withXmlStrings(
            [empty],
            /** Original empty terminated attribute content. @param value - Native empty bytes. @returns New property. */ (
              value,
            ) =>
              ns
                ? m._xmlNewNsProp(this.m_aNodePtr, ns, m._office_node_name_get(raw), value)
                : m._xmlNewProp(this.m_aNodePtr, m._office_node_name_get(raw), value),
          );
        } finally {
          empty.dispose();
        }
      }
    } else {
      result = m._xmlAddChild(this.m_aNodePtr, raw);
      if (result && result !== raw) child.invalidate();
    }
    if (!result) return new Reference<XNode>();
    nscleanup(result, this.m_aNodePtr);
    const wrapped = this.GetOwnerDocument().GetCNode(result),
      owner = wrapped.get();
    if (!owner) return wrapped;
    owner.m_bUnlinked = false;
    try {
      if (this.GetOwnerDocument().GetEventDispatcher().hasListeners()) {
        const related = new Reference<XNode>(this);
        try {
          this.emitMutation("DOMNodeInserted", related);
        } finally {
          related.dispose();
        }
      }
      return wrapped;
    } catch (error) {
      wrapped.dispose();
      throw error;
    }
  }
  /** Original clone keeps the wrapper document owner while xmlCopyNode controls raw doc state. @param deep - Native recursion selector. @returns Acquired clone. */
  cloneNode(deep: boolean): Reference<XNode> {
    if (!this.m_aNodePtr) return new Reference<XNode>();
    const result = this.GetOwnerDocument().GetCNode(
      getLibXml2()._xmlCopyNode(this.m_aNodePtr, deep ? 1 : 0),
    );
    const node = result.get();
    if (node) node.m_bUnlinked = true;
    return result;
  }
  /** Original base attributes result. @returns Empty reference. */
  getAttributes(): Reference<XNamedNodeMap> {
    return new Reference<XNamedNodeMap>();
  }
  /** Original live child-list owner. @returns Acquired list or empty for invalidation. */
  getChildNodes(): Reference<XNodeList> {
    return this.m_aNodePtr ? new Reference(new CChildList(this)) : new Reference<XNodeList>();
  }
  /** Original first-child access. @returns Acquired child. */
  getFirstChild(): Reference<XNode> {
    return this.m_aNodePtr
      ? this.GetOwnerDocument().GetCNode(getLibXml2()._office_node_children_get(this.m_aNodePtr))
      : new Reference<XNode>();
  }
  /** Original last-child access. @returns Acquired child. */
  getLastChild(): Reference<XNode> {
    return this.m_aNodePtr
      ? this.GetOwnerDocument().GetCNode(getLibXml2()._xmlGetLastChild(this.m_aNodePtr))
      : new Reference<XNode>();
  }
  /** Original base local name. @returns Empty owned string. */
  getLocalName(): OUString {
    return new OUString();
  }
  /** Original element/attribute namespace access. @returns Owned namespace URI. */
  getNamespaceURI(): OUString {
    const m = getLibXml2(),
      ptr = this.m_aNodePtr;
    const ns =
      ptr && [1, 2].includes(m._office_node_type_get(ptr)) ? m._office_node_ns_get(ptr) : 0;
    return ns ? xmlString(m._office_ns_href_get(ns)) : new OUString();
  }
  /** Original next-sibling access. @returns Acquired sibling. */
  getNextSibling(): Reference<XNode> {
    return this.m_aNodePtr
      ? this.GetOwnerDocument().GetCNode(getLibXml2()._office_node_next_get(this.m_aNodePtr))
      : new Reference<XNode>();
  }
  /** Original base name. @returns Empty owned string. */
  getNodeName(): OUString {
    return new OUString();
  }
  /** Original stored type survives invalidation. @returns UNO node enum. */
  getNodeType(): NodeType {
    return this.m_aNodeType;
  }
  /** Original base value. @returns Empty owned string. */
  getNodeValue(): OUString {
    return new OUString();
  }
  /** Original acquired document, including document self ownership. @returns Acquired document or empty after invalidation. */
  getOwnerDocument(): Reference<XDocument> {
    return this.m_aNodePtr ? new Reference(this.GetOwnerDocument()) : new Reference<XDocument>();
  }
  /** Original parent access includes actual native attribute parents. @returns Acquired parent. */
  getParentNode(): Reference<XNode> {
    return this.m_aNodePtr
      ? this.GetOwnerDocument().GetCNode(getLibXml2()._office_node_parent_get(this.m_aNodePtr))
      : new Reference<XNode>();
  }
  /** Original namespace prefix access. @returns Owned prefix. */
  getPrefix(): OUString {
    const m = getLibXml2(),
      ptr = this.m_aNodePtr;
    const ns =
      ptr && [1, 2].includes(m._office_node_type_get(ptr)) ? m._office_node_ns_get(ptr) : 0;
    const prefix = ns ? m._office_ns_prefix_get(ns) : 0;
    return prefix ? xmlString(prefix) : new OUString();
  }
  /** Original previous-sibling access. @returns Acquired sibling. */
  getPreviousSibling(): Reference<XNode> {
    return this.m_aNodePtr
      ? this.GetOwnerDocument().GetCNode(getLibXml2()._office_node_prev_get(this.m_aNodePtr))
      : new Reference<XNode>();
  }
  /** Original raw property pointer test. @returns Whether properties exist. */
  hasAttributes(): boolean {
    return !!this.m_aNodePtr && !!getLibXml2()._office_node_properties_get(this.m_aNodePtr);
  }
  /** Original raw child pointer test. @returns Whether children exist. */
  hasChildNodes(): boolean {
    return !!this.m_aNodePtr && !!getLibXml2()._office_node_children_get(this.m_aNodePtr);
  }
  /** Original direct pointer splice, without coalescing/events, returns refChild. @param newChild - Detached new node. @param refChild - Existing child. @returns Original reference child. */
  insertBefore(newChild: Reference<XNode>, refChild: Reference<XNode>): Reference<XNode> {
    if (!newChild.is() || !refChild.is()) throw new RuntimeException();
    this.checkSameOwner(newChild);
    this.checkChild(refChild);
    const child = this.implementation(newChild),
      ref = this.implementation(refChild),
      m = getLibXml2();
    this.checkDetached(child, null);
    const raw = child.GetNodePtr(),
      before = ref.GetNodePtr();
    if (m._office_node_type_get(raw) === 2) return this.appendChild(newChild);
    for (
      let cur = m._office_node_children_get(this.m_aNodePtr);
      cur;
      cur = m._office_node_next_get(cur)
    ) {
      if (cur !== before) continue;
      const previous = m._office_node_prev_get(cur),
        parent = m._office_node_parent_get(cur);
      m._office_node_next_set(raw, cur);
      m._office_node_prev_set(raw, previous);
      m._office_node_prev_set(cur, raw);
      if (previous) m._office_node_next_set(previous, raw);
      m._office_node_parent_set(raw, parent);
      if (m._office_node_children_get(parent) === cur) m._office_node_children_set(parent, raw);
      child.m_bUnlinked = false;
      break;
    }
    return new Reference(refChild);
  }
  /** Original unimplemented feature query. @param feature - Ignored feature. @param ver - Ignored version. @returns False. */
  isSupported(feature: OUStringConstReference, ver: OUStringConstReference): boolean {
    void feature;
    void ver;
    return false;
  }
  /** Original #i113683# no-op. @returns Nothing. */ normalize(): void {}
  /** Original removal invalidates attributes and detaches other nodes before emitting parent-target events. @param oldChild - Existing child. @returns Original child, or empty for an attribute. */
  removeChild(oldChild: Reference<XNode>): Reference<XNode> {
    if (!oldChild.is()) throw new RuntimeException();
    this.checkSameOwner(oldChild);
    this.checkChild(oldChild);
    if (!this.m_aNodePtr) throw new RuntimeException();
    const child = this.implementation(oldChild),
      m = getLibXml2(),
      raw = child.GetNodePtr();
    const result = new Reference(oldChild),
      held = new Reference(child);
    try {
      if (m._office_node_type_get(raw) === 2) {
        m._xmlRemoveProp(raw);
        child.invalidate();
        result.clear();
      } else {
        m._xmlUnlinkNode(raw);
        child.m_bUnlinked = true;
      }
      if (this.GetOwnerDocument().GetEventDispatcher().hasListeners()) {
        const related = new Reference<XNode>(this);
        try {
          this.emitMutation("DOMNodeRemoved", related);
        } finally {
          related.dispose();
        }
      }
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    } finally {
      held.dispose();
    }
  }
  /** Original direct replacement and unconditional subtree event. @param newChild - Detached new node. @param oldChild - Existing node. @returns Original old node. */
  replaceChild(newChild: Reference<XNode>, oldChild: Reference<XNode>): Reference<XNode> {
    if (!newChild.is() || !oldChild.is()) throw new RuntimeException();
    this.checkSameOwner(newChild);
    this.checkChild(oldChild);
    const old = this.implementation(oldChild),
      child = this.implementation(newChild),
      m = getLibXml2();
    const heldOld = new Reference(old),
      heldNew = new Reference(child);
    try {
      this.checkDetached(child, old.m_aNodeType);
      const before = old.GetNodePtr(),
        raw = child.GetNodePtr();
      if (m._office_node_type_get(before) === 2) {
        if (m._office_node_type_get(raw) !== 2) domError(E.HIERARCHY_REQUEST_ERR);
        m._xmlRemoveProp(before);
        old.invalidate();
        const appended = this.appendChild(newChild);
        appended.dispose();
      } else {
        for (
          let cur = m._office_node_children_get(this.m_aNodePtr);
          cur;
          cur = m._office_node_next_get(cur)
        ) {
          if (cur !== before) continue;
          const previous = m._office_node_prev_get(before),
            next = m._office_node_next_get(before),
            parent = m._office_node_parent_get(before);
          m._office_node_prev_set(raw, previous);
          if (previous) m._office_node_next_set(previous, raw);
          m._office_node_next_set(raw, next);
          if (next) m._office_node_prev_set(next, raw);
          m._office_node_parent_set(raw, parent);
          if (m._office_node_children_get(parent) === before)
            m._office_node_children_set(parent, raw);
          if (m._office_node_last_get(parent) === before) m._office_node_last_set(parent, raw);
          m._office_node_next_set(before, 0);
          m._office_node_prev_set(before, 0);
          m._office_node_parent_set(before, 0);
          old.m_bUnlinked = true;
          child.m_bUnlinked = false;
        }
      }
      this.dispatchSubtreeModified();
      return new Reference(oldChild);
    } finally {
      heldNew.dispose();
      heldOld.dispose();
    }
  }
  /** Original source-created mutation through real document and event UNO facets. @param name - Original event literal. @param related - Borrowed related node. @param previous - Prior value. @param next - New value. @param attribute - Attribute name. @param change - Original change discriminator. @param subtree - Keeps the original mutation event alive across the following subtree dispatch. @returns Nothing. */
  protected emitMutation(
    name: string,
    related: Reference<XNode>,
    previous?: OUStringConstReference,
    next?: OUStringConstReference,
    attribute?: OUStringConstReference,
    change = AttrChangeType.MODIFICATION,
    subtree = true,
  ): void {
    const label = domLiteral(name),
      empty = new OUString(),
      document = this.getOwnerDocument();
    const facet = new Reference<XDocumentEvent>(document, UNO_QUERY, XDocumentEvent.static_type);
    try {
      const original = (facet.get() as XDocumentEvent).createEvent(label);
      try {
        const mutation = new Reference<XMutationEvent>(
          original,
          UNO_QUERY,
          XMutationEvent.static_type,
        );
        try {
          (mutation.get() as XMutationEvent).initMutationEvent(
            label,
            true,
            false,
            related,
            previous ?? empty,
            next ?? empty,
            attribute ?? empty,
            change,
          );
          this.dispatchEvent(mutation);
          if (subtree) this.dispatchSubtreeModified();
        } finally {
          mutation.dispose();
        }
      } finally {
        original.dispose();
      }
    } finally {
      facet.dispose();
      document.dispose();
      empty.dispose();
      label.dispose();
    }
  }
  /** Original unconditional DOMSubtreeModified creation. @returns Nothing. */
  protected dispatchSubtreeModified(): void {
    const empty = new Reference<XNode>();
    try {
      this.emitMutation(
        "DOMSubtreeModified",
        empty,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
      );
    } finally {
      empty.dispose();
    }
  }
  /** Original base write rejection. @param value - Ignored value. @returns Never. */
  setNodeValue(value: OUStringConstReference): void {
    void value;
    domError(E.NO_MODIFICATION_ALLOWED_ERR);
  }
  /** Original prefix mutation changes the shared namespace allocation. @param prefix - Native prefix input. @returns Nothing. */
  setPrefix(prefix: OUStringConstReference): void {
    const m = getLibXml2(),
      raw = this.m_aNodePtr;
    if (!raw || ![1, 2].includes(m._office_node_type_get(raw)))
      domError(E.NO_MODIFICATION_ALLOWED_ERR);
    const ns = m._office_node_ns_get(raw);
    if (ns)
      withXmlStrings(
        [prefix],
        /** Copies a new native namespace prefix after freeing its old allocation. @param value - Borrowed prefix bytes. @returns Nothing. */ (
          value,
        ) => {
          m._office_xmlFree(m._office_ns_prefix_get(ns));
          m._office_ns_prefix_set(ns, m._xmlStrdup(value));
        },
      );
  }
  /** Original dispatcher registration. @param type - Event type. @param listener - Callback. @param capture - Capture selector. @returns Nothing. */
  addEventListener(
    type: OUStringConstReference,
    listener: Reference<XEventListener>,
    capture: boolean,
  ): void {
    this.GetOwnerDocument()
      .GetEventDispatcher()
      .addListener(this.m_aNodePtr, type, listener, capture);
  }
  /** Original dispatcher removal. @param type - Event type. @param listener - Callback. @param capture - Capture selector. @returns Nothing. */
  removeEventListener(
    type: OUStringConstReference,
    listener: Reference<XEventListener>,
    capture: boolean,
  ): void {
    this.GetOwnerDocument()
      .GetEventDispatcher()
      .removeListener(this.m_aNodePtr, type, listener, capture);
  }
  /** Original unlocked dispatch returns true regardless of cancellation. @param event - Borrowed source event. @returns True. */
  dispatchEvent(event: Reference<XEvent>): boolean {
    const document = this.GetOwnerDocument(),
      self = new Reference<XNode>(this);
    try {
      document.GetEventDispatcher().dispatchEvent(document, this.m_aNodePtr, self, event);
    } finally {
      self.dispose();
    }
    return true;
  }
}
