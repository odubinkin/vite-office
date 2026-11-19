/** @fileoverview Original legacyfastparser.cxx NamespaceHandler and CallbackDocumentHandler over actual native UNO/RTL/string/attribute owners. Parser service construction remains with its separate source owner. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import {
  Reference,
  type ReferenceConstParameter,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { XFastNamespaceHandler } from "../../../offapi/com/sun/star/xml/sax/XFastNamespaceHandler";
import { XFastDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XFastDocumentHandler";
import type { XFastContextHandler } from "../../../offapi/com/sun/star/xml/sax/XFastContextHandler";
import type { XFastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/XFastTokenHandler";
import type { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import type { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import type { XFastAttributeList } from "../../../offapi/com/sun/star/xml/sax/XFastAttributeList";
import { FastAttribute } from "../../../offapi/com/sun/star/xml/FastAttribute";
import { Attribute } from "../../../offapi/com/sun/star/xml/Attribute";
import { AttributeList } from "../../../comphelper/source/xml/attributelist";
import type { SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";

/** Original unique namespace declaration value. */
class NamespaceDefine {
  readonly m_aPrefix: OUString;
  readonly m_aNamespaceURI: OUString;
  /** Original by-value parameters moved into members. @param prefix - Borrowed source. @param uri - Borrowed source. @returns Owned declaration. */
  constructor(prefix: OUStringConstReference, uri: OUStringConstReference) {
    this.m_aPrefix = new OUString(prefix);
    this.m_aNamespaceURI = new OUString(uri);
  }
  /** Original reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.m_aNamespaceURI.dispose();
    this.m_aPrefix.dispose();
  }
}
/** Original pending-declaration queue, not a namespace resolver or scope map. */
export class NamespaceHandler
  extends WeakImplHelper.specialize(XFastNamespaceHandler)
  implements XFastNamespaceHandler
{
  private readonly m_aNamespaceDefines: NamespaceDefine[] = [];
  /** Original pending attributes in insertion order, clearing only after successful completion. @param attributes - Actual intrusive attribute-list owner. @returns Nothing. */
  addNSDeclAttributes(attributes: RtlReference<AttributeList>): void {
    for (const declaration of this.m_aNamespaceDefines) {
      const name = new OUString(new Uint8Array([120, 109, 108, 110, 115, 0]));
      try {
        if (!declaration.m_aPrefix.isEmpty()) {
          name.append(new Uint16Array([58]));
          name.append(declaration.m_aPrefix);
        }
        attributes.operatorArrow().AddAttribute(name, declaration.m_aNamespaceURI);
      } finally {
        name.dispose();
      }
    }
    for (const declaration of this.m_aNamespaceDefines) declaration.dispose();
    this.m_aNamespaceDefines.length = 0;
  }
  /** Original declaration append permits duplicates. @param prefix - Declared prefix. @param uri - Declared URI. @returns Nothing. */
  registerNamespace(prefix: OUStringConstReference, uri: OUStringConstReference): void {
    this.m_aNamespaceDefines.push(new NamespaceDefine(prefix, uri));
  }
  /** Original unconditional empty result; do not substitute a namespace lookup. @param prefix - Ignored source argument. @returns Owned empty string. */
  getNamespaceURI(prefix: OUStringConstReference): OUString {
    void prefix;
    return new OUString();
  }
  /** Original unique declaration destruction before the weak base. @returns Nothing. */
  protected override destroy(): void {
    for (const declaration of this.m_aNamespaceDefines) declaration.dispose();
    this.m_aNamespaceDefines.length = 0;
    super.destroy();
  }
}

/** Original adapter forwards actual native values to its legacy document handler. */
export class CallbackDocumentHandler
  extends WeakImplHelper.specialize(XFastDocumentHandler)
  implements XFastDocumentHandler
{
  private readonly m_xDocumentHandler: Reference<XDocumentHandler>;
  private readonly m_xTokenHandler: Reference<XFastTokenHandler>;
  private readonly m_aNamespaceHandler: RtlReference<NamespaceHandler>;
  /** Original acquired field assignments retain the concrete namespace handler. @param document - Borrowed actual document handler. @param namespaces - Borrowed concrete declaration owner. @param tokens - Borrowed actual token handler. @returns Adapter. */
  constructor(
    document: ReferenceConstParameter<XDocumentHandler>,
    namespaces: RtlReference<NamespaceHandler>,
    tokens: ReferenceConstParameter<XFastTokenHandler>,
  ) {
    super();
    this.m_xDocumentHandler = new Reference(document);
    this.m_xTokenHandler = new Reference(tokens);
    this.m_aNamespaceHandler = new RtlReference(namespaces);
  }
  /** Original reverse field destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_aNamespaceHandler.dispose();
    this.m_xTokenHandler.dispose();
    this.m_xDocumentHandler.dispose();
    super.destroy();
  }
  /** Original native sequence-to-counted-string conversion; initialized byte cells are materialized only at the existing SAL converter boundary. Physical pointer aliasing is unqualified. @param token - Original requested token. @returns Owned Unicode value. */
  private tokenName(token: number): OUString {
    const sequence = this.m_xTokenHandler.operatorStar().getUTF8Identifier(token);
    try {
      const source = sequence.getConstArray(),
        bytes = new Uint8Array(sequence.getLength());
      if (ArrayBuffer.isView(source)) bytes.set(source.subarray(0, bytes.length));
      else
        for (let i = 0; i < bytes.length; ++i)
          bytes[i] = ((source as SequenceElements).get(i) as [number])[0];
      return new OUString(bytes, bytes.length, RTL_TEXTENCODING_UTF8);
    } finally {
      sequence.dispose();
    }
  }
  /** Original high-bit mask is passed without shifting. @param token - Combined token. @returns Native prefix or empty. */
  private getNamespacePrefixFromToken(token: number): OUString {
    return (token & 0xffff0000) !== 0 ? this.tokenName(token & 0xffff0000) : new OUString();
  }
  /** Original local-token mask. @param token - Combined token. @returns Owned local name. */
  private getNameFromToken(token: number): OUString {
    return this.tokenName(token & 0xffff);
  }
  /** Original namespace/local concatenation over owned native temporaries. @param token - Combined identity. @returns Owned name. */
  private nameFromToken(token: number): OUString {
    const prefix = this.getNamespacePrefixFromToken(token),
      local = this.getNameFromToken(token);
    try {
      if (prefix.isEmpty()) return new OUString(local);
      const name = new OUString(prefix);
      name.append(new Uint16Array([58]));
      name.append(local);
      return name;
    } finally {
      local.dispose();
      prefix.dispose();
    }
  }
  /** Original optional start forwarding. @returns Nothing. */
  startDocument(): void {
    if (this.m_xDocumentHandler.is()) this.m_xDocumentHandler.operatorStar().startDocument();
  }
  /** Original optional end forwarding. @returns Nothing. */
  endDocument(): void {
    if (this.m_xDocumentHandler.is()) this.m_xDocumentHandler.operatorStar().endDocument();
  }
  /** Original optional instruction forwarding. @param target - Native target. @param data - Native data. @returns Nothing. */
  processingInstruction(target: OUStringConstReference, data: OUStringConstReference): void {
    if (this.m_xDocumentHandler.is())
      this.m_xDocumentHandler.operatorStar().processingInstruction(target, data);
  }
  /** Original optional locator forwarding. @param locator - Borrowed native locator. @returns Nothing. */
  setDocumentLocator(locator: Reference<XLocator>): void {
    if (this.m_xDocumentHandler.is())
      this.m_xDocumentHandler.operatorStar().setDocumentLocator(locator);
  }
  /** Original known element delegates using the computed QName and default namespace. @param element - Token. @param attributes - Borrowed native attributes. @returns Nothing. */
  startFastElement(element: number, attributes: Reference<XFastAttributeList>): void {
    const name = this.nameFromToken(element),
      empty = new OUString();
    try {
      this.startUnknownElement(empty, name, attributes);
    } finally {
      empty.dispose();
      name.dispose();
    }
  }
  /** Original declaration/known/unknown attribute ordering and explicit original name admission. @param namespace - Ignored source URI. @param name - Native QName. @param attributes - Borrowed native fast list. @returns Nothing. */
  startUnknownElement(
    namespace: OUStringConstReference,
    name: OUStringConstReference,
    attributes: Reference<XFastAttributeList>,
  ): void {
    void namespace;
    if (!this.m_xDocumentHandler.is()) return;
    const list = new RtlReference(new AttributeList());
    try {
      this.m_aNamespaceHandler.operatorArrow().addNSDeclAttributes(list);
      const fast = attributes.operatorStar().getFastAttributes();
      try {
        const data = fast.getConstArray() as SequenceElements;
        for (let i = 0; i < fast.getLength(); ++i) {
          const attribute = FastAttribute.unacquired(data.get(i * 16) as SequenceElements),
            attrName = this.nameFromToken(attribute.Token);
          try {
            list.operatorArrow().AddAttribute(attrName, attribute.Value);
          } finally {
            attrName.dispose();
          }
        }
      } finally {
        fast.dispose();
      }
      const unknown = attributes.operatorStar().getUnknownAttributes();
      try {
        const data = unknown.getConstArray() as SequenceElements;
        for (let i = 0; i < unknown.getLength(); ++i) {
          const attribute = Attribute.unacquired(data.get(i * 24) as SequenceElements);
          list.operatorArrow().AddAttribute(attribute.Name, attribute.Value);
        }
      } finally {
        unknown.dispose();
      }
      const reference = new Reference(list.get());
      try {
        this.m_xDocumentHandler.operatorStar().startElement(name, reference);
      } finally {
        reference.dispose();
      }
    } finally {
      list.dispose();
    }
  }
  /** Original known closing delegates through the same source token masks. @param element - Token. @returns Nothing. */
  endFastElement(element: number): void {
    const name = this.nameFromToken(element),
      empty = new OUString();
    try {
      this.endUnknownElement(empty, name);
    } finally {
      empty.dispose();
      name.dispose();
    }
  }
  /** Original optional close ignores URI. @param namespace - Ignored URI. @param name - Native QName. @returns Nothing. */
  endUnknownElement(namespace: OUStringConstReference, name: OUStringConstReference): void {
    void namespace;
    if (this.m_xDocumentHandler.is()) this.m_xDocumentHandler.operatorStar().endElement(name);
  }
  /** Original known child returns an acquired reference to this same handler. @param element - Ignored token. @param attributes - Ignored list. @returns Owned self reference. */
  createFastChildContext(
    element: number,
    attributes: Reference<XFastAttributeList>,
  ): Reference<XFastContextHandler> {
    void element;
    void attributes;
    return new Reference<XFastContextHandler>(this);
  }
  /** Original unknown child returns this same native object. @param namespace - Ignored URI. @param name - Ignored name. @param attributes - Ignored list. @returns Owned self reference. */
  createUnknownChildContext(
    namespace: OUStringConstReference,
    name: OUStringConstReference,
    attributes: Reference<XFastAttributeList>,
  ): Reference<XFastContextHandler> {
    void namespace;
    void name;
    void attributes;
    return new Reference<XFastContextHandler>(this);
  }
  /** Original optional text forwarding. @param text - Borrowed native text. @returns Nothing. */
  characters(text: OUStringConstReference): void {
    if (this.m_xDocumentHandler.is()) this.m_xDocumentHandler.operatorStar().characters(text);
  }
}
