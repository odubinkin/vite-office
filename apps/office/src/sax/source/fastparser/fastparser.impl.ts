/** @fileoverview Original FastSaxParserImpl ownership and four C SAX2 producers on the pinned Emscripten thread=false profile. Converted stream/custom entities and source options are implemented; The public UNO service is supplied by fastparser.service.ts; full original QA and non-Emscripten queues remain unfinished. */
import { Entity, ParserData, NamespaceDefine, NameWithToken } from "./fastparser.entity";
import { FastLocatorImpl } from "./fastparser.locator";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import {
  Reference,
  type ReferenceConstParameter,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import {
  OUString,
  OUStringHash,
  OUStringToOString,
  type OUStringConstReference,
} from "../../../sal/inc/rtl/ustring";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { RTL_TEXTENCODING_ASCII_US, RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import type { InputSourceConstReference } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import type { XFastDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XFastDocumentHandler";
import type { XFastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/XFastTokenHandler";
import type { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";
import type { XFastNamespaceHandler } from "../../../offapi/com/sun/star/xml/sax/XFastNamespaceHandler";
import { FastTokenHandlerBase } from "../tools/fastattribs";
import { FastAttributeList } from "../tools/fastattribs";
import { OString, type OStringConstReference } from "../../../sal/inc/rtl/string";
import { NormalizeURI } from "./fastparser.normalize";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import {
  Sequence,
  type SequenceConstReference,
  type SequenceElements,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { PairStringString } from "../../../udkapi/com/sun/star/beans/Pair";
import { createFastParserCallbackBinding } from "../../../external/libxml2/fastparsercallbacks";
import { withXmlBytes } from "../../../external/libxml2/libxml2";
import {
  XML_INTERNAL_GENERAL_ENTITY,
  XML_PARSE_NOENT,
  XML_PARSE_HUGE,
  XML_ERR_OK,
} from "@vite-office/libxml2-wasm/constants";
import { XMap } from "../../../udkapi/com/sun/star/container/XMap";
import { DONTKNOW, NAMESPACE } from "../../../offapi/com/sun/star/xml/sax/FastToken";

/** Original custom-entity vector element; native by-value strings are owned once by each member. */
class ReplacementPair {
  readonly name = new OUString();
  readonly replacement = new OUString();
  /** Original implicit reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.replacement.dispose();
    this.name.dispose();
  }
}

/** Actual native unordered_map entry, with native owned Unicode key/value equality; bucket allocation/layout is not a C++ ABI claim. */
type NamespaceEntry = readonly [OUString, number];
/** Original parser private implementation; methods are ported by source responsibility, never replaced with positive stubs. */
export class FastSaxParserImpl {
  private callbackBinding: ReturnType<typeof createFastParserCallbackBinding> | undefined;
  private readonly m_Replacements: ReplacementPair[] = [];
  private readonly m_TemporalEntities: number[] = [];
  m_bIgnoreMissingNSDecl = false;
  m_bDisableThreadedParser = false;
  readonly mxMap = new Reference<XMap>();
  private readonly pendingCharacters: number[] = [];
  private readonly mxDocumentLocator: RtlReference<FastLocatorImpl>;
  private readonly maNamespaceMap = new Map<bigint, NamespaceEntry[]>();
  private readonly maData = new ParserData();
  private mpTop: Entity | null = null;
  private readonly maEntities: Entity[] = [];
  /** Original defaults and actual locator construction. @returns Parser owner. */
  constructor() {
    this.mxDocumentLocator = new RtlReference(new FastLocatorImpl(this));
  }
  /** Original locator invalidation precedes implicit reverse member destruction. Outstanding parse scopes remain a caller precondition. @returns Nothing. */
  dispose(): void {
    this.mxDocumentLocator.operatorArrow().dispose();
    for (const entity of this.m_TemporalEntities)
      if (entity !== 0) {
        const m = getLibXml2();
        m._xmlUnlinkNode(entity);
        m._xmlFreeNode(entity);
      }
    while (this.maEntities.length !== 0) this.popEntity();
    this.maData.dispose();
    for (const bucket of this.maNamespaceMap.values()) for (const [key] of bucket) key.dispose();
    this.maNamespaceMap.clear();
    this.mxDocumentLocator.dispose();
    this.mxMap.dispose();
    for (let index = this.m_Replacements.length; index-- !== 0;)
      (this.m_Replacements[index] as ReplacementPair).dispose();
    this.callbackBinding?.dispose();
  }
  /** Original cache assignment takes effect only for a subsequent pushed Entity. @param handler - Borrowed handler. @returns Nothing. */
  setFastDocumentHandler(handler: ReferenceConstParameter<XFastDocumentHandler>): void {
    this.maData.mxDocumentHandler.assign(handler);
  }
  /** Original dynamic_cast borrows the actual direct-token base; no alternate interface result provider. @param handler - Borrowed handler. @returns Nothing. */
  setTokenHandler(handler: ReferenceConstParameter<XFastTokenHandler>): void {
    const body = handler.get();
    this.maData.mxTokenHandler.assign(body instanceof FastTokenHandlerBase ? body : null);
  }
  /** Original cached error-handler assignment. @param handler - Borrowed handler. @returns Nothing. */
  setErrorHandler(handler: ReferenceConstParameter<XErrorHandler>): void {
    this.maData.mxErrorHandler.assign(handler);
  }
  /** Original cached namespace-handler assignment. @param handler - Borrowed handler. @returns Nothing. */
  setNamespaceHandler(handler: ReferenceConstParameter<XFastNamespaceHandler>): void {
    this.maData.mxNamespaceHandler.assign(handler);
  }
  /** Original source value-key lookup and unknown sentinel. Native Unicode hash/equality operate on the actual key owners. @param uri - Borrowed namespace key. @returns Original token. */
  private GetNamespaceToken(uri: OUStringConstReference): number {
    const bucket = this.maNamespaceMap.get(new OUStringHash().call(uri));
    if (bucket !== undefined) for (const [key, token] of bucket) if (key.equals(uri)) return token;
    return DONTKNOW;
  }
  /** Original minimum-token check, first registration and duplicate rejection; no extra alignment or URI validation. @param uri - Borrowed namespace key. @param token - Original signed32 token. @returns Nothing. */
  registerNamespace(uri: OUStringConstReference, token: number): void {
    let message: OUString;
    if (token < NAMESPACE)
      message = new OUString(
        new StringConcat(
          OUString.Concat(Uint8Array.from(new TextEncoder().encode("Invalid namespace token \0"))),
          OUString.number(token),
        ),
      );
    else if (this.GetNamespaceToken(uri) === DONTKNOW) {
      const hash = new OUStringHash().call(uri),
        bucket = this.maNamespaceMap.get(hash);
      if (bucket !== undefined) bucket.push([new OUString(uri), token]);
      else this.maNamespaceMap.set(hash, [[new OUString(uri), token]]);
      return;
    } else
      message = new OUString(
        new StringConcat(
          OUString.Concat(
            Uint8Array.from(new TextEncoder().encode("namespace URL is already registered: \0")),
          ),
          uri,
        ),
      );
    const context = new Reference();
    try {
      throw new IllegalArgumentException(message, context, 0);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  /** Original reverse scan only visits the currently valid prefix definitions. @param prefix - Borrowed UTF8 string_view bytes. @returns Borrowed actual definition URI. */
  private GetNamespaceURL(prefix: Uint8Array): OUStringConstReference {
    const entity = this.getEntity();
    if (entity.maNamespaceCount.length !== 0) {
      let count = entity.maNamespaceCount.at(-1) as number;
      while (count-- !== 0) {
        const definition = entity.maNamespaceDefines[count] as NamespaceDefine,
          bytes = definition.maPrefix.getStr();
        if (definition.maPrefix.getLength() !== prefix.length) continue;
        let equal = true;
        for (let index = 0; index < prefix.length; ++index)
          if (bytes[index] !== prefix[index]) {
            equal = false;
            break;
          }
        if (equal) return definition.maNamespaceURL;
      }
    }
    const name = OUString.fromUtf8(prefix),
      message = new OUString(
        new StringConcat(
          OUString.Concat(Uint8Array.from(new TextEncoder().encode("No namespace defined for \0"))),
          name,
        ),
      ),
      context = new Reference(),
      wrapped = new Any();
    try {
      throw new SAXException(message, context, wrapped);
    } finally {
      wrapped.dispose();
      context.dispose();
      message.dispose();
      name.dispose();
    }
  }
  /** Original public wrapper converts UTF16 prefix to UTF8 and translates caught UNO exceptions into the default IllegalArgumentException. Returns a borrowed const reference, not an owned copy. @param prefix - Borrowed UTF16 view. @returns Borrowed source URI. */
  getNamespaceURL(prefix: Uint16Array): OUStringConstReference {
    try {
      const bytes = OUStringToOString(prefix, RTL_TEXTENCODING_UTF8);
      try {
        return this.GetNamespaceURL(bytes.getStr().subarray(0, bytes.getLength()));
      } finally {
        bytes.dispose();
      }
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    throw new IllegalArgumentException();
  }
  /** Original public internal entry point validates the input before pushing; configuration references and InputSource are actual native copies. Converter failures leave the pushed Entity as in the source. @param data - Borrowed parser cache. @param source - Borrowed native input. @returns Nothing. */
  pushEntity(data: ParserData, source: InputSourceConstReference): void {
    if (!source.aInputStream.is()) {
      const message = new OUString(Uint8Array.from(new TextEncoder().encode("No input source\0"))),
        context = new Reference(),
        wrapped = new Any();
      try {
        throw new SAXException(message, context, wrapped);
      } finally {
        wrapped.dispose();
        context.dispose();
        message.dispose();
      }
    }
    const entity = new Entity(data);
    this.maEntities.push(entity);
    this.mpTop = entity;
    entity.maStructSource.assign(source);
    entity.maConverter.setInputStream(entity.maStructSource.aInputStream);
    if (!entity.maStructSource.sEncoding.isEmpty()) {
      const encoding = OUStringToOString(
        entity.maStructSource.sEncoding
          .getStr()
          .subarray(0, entity.maStructSource.sEncoding.getLength()),
        RTL_TEXTENCODING_ASCII_US,
      );
      try {
        entity.maConverter.setEncoding(encoding);
      } finally {
        encoding.dispose();
      }
    }
  }
  /** Original stack pop updates the same cached raw pointer. Nonempty stack is the original caller precondition. @returns Nothing. */
  popEntity(): void {
    (this.maEntities.pop() as Entity).dispose();
    this.mpTop = this.maEntities.length !== 0 ? (this.maEntities.at(-1) as Entity) : null;
  }
  /** Borrows original counted/terminated C UTF8 bytes; pointer/count validity is the native callback precondition. @param pointer - Native pointer. @param count - Optional original strlen/count. @returns Borrowed bytes until the next C allocation. */
  private xmlBytes(pointer: number, count = getLibXml2()._xmlStrlen(pointer)): Uint8Array {
    return getLibXml2().HEAPU8.subarray(pointer, pointer + count);
  }
  /** Original counted UTF8 OUString construction across the real C/RTL heaps. @param pointer - Native bytes. @param count - Optional count. @returns Owned native string. */
  private xmlString(pointer: number, count = getLibXml2()._xmlStrlen(pointer)): OUString {
    return new OUString(
      new Uint8Array(this.xmlBytes(pointer, count)),
      count,
      RTL_TEXTENCODING_UTF8,
    );
  }
  /** Original counted OString construction. @param pointer - Native bytes. @param count - Optional count. @returns Owned native bytes. */
  private byteString(pointer: number, count = getLibXml2()._xmlStrlen(pointer)): OString {
    return new OString(new Uint8Array(this.xmlBytes(pointer, count)), count);
  }
  /** Original OString/string_view equality without a host Unicode conversion. @param prefix - Actual RTL string. @param view - Borrowed UTF8 view. @returns Byte equality. */
  private equalPrefix(prefix: OStringConstReference, view: Uint8Array): boolean {
    if (prefix.getLength() !== view.length) return false;
    const bytes = prefix.getStr();
    for (let index = 0; index < view.length; ++index)
      if (bytes[index] !== view[index]) return false;
    return true;
  }
  /** Original namespace vector grows in64-entry blocks; the same native definition owners are assigned before old temporaries unwind. @param prefix - Borrowed actual prefix. @param uri - Borrowed normalized URI. @returns Nothing. */
  private DefineNamespace(prefix: OStringConstReference, uri: OUStringConstReference): void {
    const entity = this.getEntity(),
      top = entity.maNamespaceCount.length - 1,
      offset = entity.maNamespaceCount[top] as number;
    entity.maNamespaceCount[top] = offset + 1;
    if (entity.maNamespaceDefines.length <= offset) {
      const size = entity.maNamespaceDefines.length + 64;
      while (entity.maNamespaceDefines.length < size)
        entity.maNamespaceDefines.push(new NamespaceDefine());
    }
    const replacement = new NamespaceDefine(prefix, this.GetNamespaceToken(uri), uri);
    (entity.maNamespaceDefines[offset] as NamespaceDefine).dispose();
    entity.maNamespaceDefines[offset] = replacement;
  }
  /** Original direct token lookup through the actual source token base. @param name - Terminated native UTF8 name. @returns Native token. */
  private GetToken(name: number): number {
    return FastTokenHandlerBase.getTokenFromChars(
      this.getEntity().mxTokenHandler.get() as FastTokenHandlerBase,
      this.xmlBytes(name),
    );
  }
  /** Original namespace/local composition retains unknown propagation and unshifted registered namespace token. @param namespace - Original token. @param name - Native local name. @returns Combined token or DONTKNOW. */
  private GetTokenWithContextNamespace(namespace: number, name: number): number {
    if (namespace !== DONTKNOW) {
      const token = this.GetToken(name);
      if (token !== DONTKNOW) return namespace | token;
    }
    return DONTKNOW;
  }
  /** Original missing-prefix exception, with actual native message and empty context/wrapped values. @param prefix - Borrowed UTF8 prefix. @returns Never. */
  private missingNamespace(prefix: Uint8Array): never {
    const name = new OUString(new Uint8Array(prefix), prefix.length, RTL_TEXTENCODING_UTF8),
      message = new OUString(
        new StringConcat(
          OUString.Concat(
            new Uint8Array([
              78, 111, 32, 110, 97, 109, 101, 115, 112, 97, 99, 101, 32, 100, 101, 102, 105, 110,
              101, 100, 32, 102, 111, 114, 32, 0,
            ]),
          ),
          name,
        ),
      ),
      context = new Reference(),
      wrapped = new Any();
    try {
      throw new SAXException(message, context, wrapped);
    } finally {
      wrapped.dispose();
      context.dispose();
      message.dispose();
      name.dispose();
    }
  }
  /** Original reverse valid-prefix scan and IgnoreMissingNSDecl behavior. @param prefix - UTF8 prefix view. @param name - Native local name. @returns Native token. */
  private GetTokenWithPrefix(prefix: Uint8Array, name: number): number {
    const entity = this.getEntity();
    if (entity.maNamespaceCount.length === 0) return DONTKNOW;
    let count = entity.maNamespaceCount.at(-1) as number;
    while (count-- !== 0) {
      const definition = entity.maNamespaceDefines[count] as NamespaceDefine;
      if (this.equalPrefix(definition.maPrefix, prefix))
        return this.GetTokenWithContextNamespace(definition.mnToken, name);
    }
    if (!this.m_bIgnoreMissingNSDecl) this.missingNamespace(prefix);
    return DONTKNOW;
  }
  /** Original caught UNO exception transport into the actual current Entity. Non-UNO host exceptions remain outside the linked ABI. @param error - Actual caught value. @returns Nothing. */
  private saveCallbackException(error: unknown): void {
    if (!(error instanceof Exception)) throw error;
    try {
      const value = withCaughtException(error, getCaughtException);
      try {
        this.getEntity().saveException(value);
      } finally {
        value.dispose();
      }
    } finally {
      error.dispose();
    }
  }
  /** Original unknown prefixed attribute path; real UTF8 QName concatenation is lowered over byte views into an actual OString owner, never a host XML/name provider. @param attributes - Native five-pointer array. @param index - Original pointer index. @param list - Borrowed native list. @returns Nothing. */
  private addUnknownElementWithPrefix(
    attributes: number,
    index: number,
    list: FastAttributeList,
  ): void {
    const m = getLibXml2(),
      /** Original indexed C pointer-array read. @param offset - Attribute record field. @returns Actual pointer. */ at =
        (offset: number): number => m.getValue(attributes + (index + offset) * 4, "*"),
      uri = !this.m_bIgnoreMissingNSDecl || at(2) !== 0 ? this.xmlString(at(2)) : new OUString(),
      prefix = this.byteString(at(1)),
      local = this.byteString(at(0));
    let qualified: OString;
    if (prefix.isEmpty()) qualified = new OString(local);
    else {
      const bytes = new Uint8Array(prefix.getLength() + 1 + local.getLength());
      bytes.set(prefix.getStr().subarray(0, prefix.getLength()));
      bytes[prefix.getLength()] = 58;
      bytes.set(local.getStr().subarray(0, local.getLength()), prefix.getLength() + 1);
      qualified = new OString(bytes, bytes.length);
    }
    const value = this.byteString(at(3), at(4) - at(3));
    try {
      list.addUnknown(uri, qualified, value);
    } finally {
      value.dispose();
      qualified.dispose();
      local.dispose();
      prefix.dispose();
      uri.dispose();
    }
  }
  /** Original SAX2 start producer on the original Emscripten profile. parseStream explicitly fixes mbEnableThreads=false for this target; maSharedEvent is exactly getEvent's single-thread result and its type is deliberately not written. Non-Emscripten queues remain a separate unported build profile. @param localName - Native name. @param prefix - Native prefix or NULL. @param uri - Native URI or NULL. @param namespaceCount - Native pair count. @param namespaces - Native prefix/URI pairs. @param attributeCount - Native record count. @param attributes - Native five-pointer records. @returns Nothing. */
  callbackStartElement(
    localName: number,
    prefix: number,
    uri: number,
    namespaceCount: number,
    namespaces: number,
    attributeCount: number,
    attributes: number,
  ): void {
    if (this.pendingCharacters.length !== 0) this.sendPendingCharacters();
    const entity = this.getEntity(),
      m = getLibXml2();
    if (entity.maNamespaceCount.length === 0) {
      entity.maNamespaceCount.push(0);
      const xml = new OString(new Uint8Array([120, 109, 108]), 3),
        xmlURI = OUString.fromUtf8(
          new Uint8Array([
            104, 116, 116, 112, 58, 47, 47, 119, 119, 119, 46, 119, 51, 46, 111, 114, 103, 47, 88,
            77, 76, 47, 49, 57, 57, 56, 47, 110, 97, 109, 101, 115, 112, 97, 99, 101,
          ]),
        );
      try {
        this.DefineNamespace(xml, xmlURI);
      } finally {
        xmlURI.dispose();
        xml.dispose();
      }
    } else entity.maNamespaceCount.push(entity.maNamespaceCount.at(-1) as number);
    const event = entity.maSharedEvent;
    if (event.mxAttributes.is()) event.mxAttributes.operatorArrow().clear();
    else event.mxAttributes.set(new FastAttributeList(entity.mxTokenHandler.get()));
    if (entity.mxNamespaceHandler.is()) {
      if (event.mxDeclAttributes.is()) event.mxDeclAttributes.operatorArrow().clear();
      else event.mxDeclAttributes.set(new FastAttributeList(entity.mxTokenHandler.get()));
    }
    const namespace = new OUString();
    let namespaceToken = DONTKNOW;
    if (entity.maNamespaceStack.length !== 0) {
      const top = entity.maNamespaceStack.at(-1) as NameWithToken;
      namespace.assign(top.msName);
      namespaceToken = top.mnToken;
    }
    try {
      try {
        const elementPrefix =
          prefix !== 0 ? new Uint8Array(this.xmlBytes(prefix)) : new Uint8Array();
        for (let index = 0; index < namespaceCount * 2; index += 2) {
          const key = m.getValue(namespaces + index * 4, "*"),
            value = m.getValue(namespaces + (index + 1) * 4, "*");
          if (key !== 0) {
            const name = this.byteString(key),
              valueURI = this.xmlString(value);
            try {
              NormalizeURI(valueURI);
              this.DefineNamespace(name, valueURI);
              if (entity.mxNamespaceHandler.is()) {
                const original = this.byteString(value);
                try {
                  event.mxDeclAttributes.operatorArrow().addUnknown(name, original);
                } finally {
                  original.dispose();
                }
              }
            } finally {
              valueURI.dispose();
              name.dispose();
            }
          } else {
            const valueURI = this.xmlString(value);
            try {
              namespace.moveAssign(valueURI);
            } finally {
              valueURI.dispose();
            }
            NormalizeURI(namespace);
            namespaceToken = this.GetNamespaceToken(namespace);
            if (entity.mxNamespaceHandler.is()) {
              const empty = new OString(),
                original = this.byteString(value);
              try {
                event.mxDeclAttributes.operatorArrow().addUnknown(empty, original);
              } finally {
                original.dispose();
                empty.dispose();
              }
            }
          }
        }
        const list = event.mxAttributes.operatorArrow();
        if (entity.mxTokenHandler.is()) list.reserve(attributeCount);
        for (let index = 0; index < attributeCount * 5; index += 5) {
          const local = m.getValue(attributes + index * 4, "*"),
            pfx = m.getValue(attributes + (index + 1) * 4, "*"),
            begin = m.getValue(attributes + (index + 3) * 4, "*"),
            end = m.getValue(attributes + (index + 4) * 4, "*");
          if (pfx !== 0) {
            const token = entity.mxTokenHandler.is()
              ? this.GetTokenWithPrefix(this.xmlBytes(pfx), local)
              : DONTKNOW;
            if (token !== DONTKNOW) list.add(token, this.xmlBytes(begin, end - begin));
            else this.addUnknownElementWithPrefix(attributes, index, list);
          } else {
            const token = entity.mxTokenHandler.is() ? this.GetToken(local) : DONTKNOW;
            if (token !== DONTKNOW) list.add(token, this.xmlBytes(begin, end - begin));
            else {
              const name = this.byteString(local),
                value = this.byteString(begin, end - begin);
              try {
                list.addUnknown(name, value);
              } finally {
                value.dispose();
                name.dispose();
              }
            }
          }
        }
        if (entity.mxTokenHandler.is()) {
          if (elementPrefix.length !== 0)
            event.mnElementToken = this.GetTokenWithPrefix(elementPrefix, localName);
          else if (!namespace.isEmpty())
            event.mnElementToken = this.GetTokenWithContextNamespace(namespaceToken, localName);
          else event.mnElementToken = this.GetToken(localName);
        } else event.mnElementToken = DONTKNOW;
        if (event.mnElementToken === DONTKNOW) {
          const namePrefix =
              elementPrefix.length !== 0
                ? new OUString(elementPrefix, elementPrefix.length, RTL_TEXTENCODING_UTF8)
                : new OUString(),
            name = this.xmlString(localName);
          try {
            if (elementPrefix.length !== 0) {
              if (uri !== 0) {
                const value = this.xmlString(uri);
                try {
                  namespace.moveAssign(value);
                } finally {
                  value.dispose();
                }
              } else if (this.m_bIgnoreMissingNSDecl) namespace.clear();
              else this.missingNamespace(elementPrefix);
              namespaceToken = this.GetNamespaceToken(namespace);
            }
            event.msNamespace.assign(namespace);
            if (namePrefix.isEmpty()) event.msElementName.moveAssign(name);
            else {
              const result = new OUString(
                new StringConcat(
                  new StringConcat(OUString.Concat(namePrefix), new Uint8Array([58, 0])),
                  name,
                ),
              );
              try {
                event.msElementName.moveAssign(result);
              } finally {
                result.dispose();
              }
            }
          } finally {
            name.dispose();
            namePrefix.dispose();
          }
        } else event.msElementName.clear();
        entity.maNamespaceStack.push(new NameWithToken(namespace, namespaceToken));
        entity.startElement(event);
      } catch (error) {
        this.saveCallbackException(error);
      }
    } finally {
      namespace.dispose();
    }
  }
  /** Original end producer flushes characters before namespace/context pops. This is the source Emscripten direct-consumer path. @returns Nothing. */
  callbackEndElement(): void {
    if (this.pendingCharacters.length !== 0) this.sendPendingCharacters();
    const entity = this.getEntity();
    if (entity.maNamespaceCount.length !== 0) entity.maNamespaceCount.pop();
    if (entity.maNamespaceStack.length !== 0)
      (entity.maNamespaceStack.pop() as NameWithToken).dispose();
    entity.endElement();
  }
  /** Original counted byte accumulation, before any UTF8 conversion. @param pointer - Borrowed C bytes. @param count - Original byte count. @returns Nothing. */
  callbackCharacters(pointer: number, count: number): void {
    const start = this.pendingCharacters.length,
      m = getLibXml2();
    this.pendingCharacters.length = start + count;
    for (let index = 0; index < count; ++index)
      this.pendingCharacters[start + index] = m.HEAPU8[pointer + index] as number;
  }
  /** Original character coalescing and optional underscore map translation through the actual native XMap contract. @returns Nothing. */
  private sendPendingCharacters(): void {
    const chars = new OUString(
      Uint8Array.from(this.pendingCharacters),
      this.pendingCharacters.length,
      RTL_TEXTENCODING_UTF8,
    );
    try {
      if (chars.charAt(0) === 95 && this.mxMap.is()) {
        const key = new Any(chars.getDataAddress(), "OUString");
        try {
          const value = this.mxMap.operatorStar().get(key);
          try {
            value.extract(chars, "OUString");
          } finally {
            value.dispose();
          }
        } finally {
          key.dispose();
        }
      }
      this.getEntity().characters(chars);
      this.pendingCharacters.length = 0;
    } finally {
      chars.dispose();
    }
  }
  /** Original rare PI uses the shared Event namespace/element owners as target/data in that order; pending text is emitted first. @param target - Native terminated target. @param data - Native data or NULL. @returns Nothing. */
  callbackProcessingInstruction(target: number, data: number): void {
    if (this.pendingCharacters.length !== 0) this.sendPendingCharacters();
    const entity = this.getEntity(),
      event = entity.maSharedEvent,
      value = this.xmlString(target);
    try {
      event.msNamespace.moveAssign(value);
    } finally {
      value.dispose();
    }
    if (data !== 0) {
      const value = this.xmlString(data);
      try {
        event.msElementName.moveAssign(value);
      } finally {
        value.dispose();
      }
    } else event.msElementName.clear();
    entity.processingInstruction(event.msNamespace, event.msElementName);
  }
  /** Original custom replacement sequence copy, vector resize and native Unicode sort; caller mutation/lifetime does not change parser-owned members. @param replacements - Actual native Pair sequence. @returns Nothing. */
  setCustomEntityNames(replacements: SequenceConstReference<PairStringString>): void {
    const size = replacements.getLength();
    while (this.m_Replacements.length > size)
      (this.m_Replacements.pop() as ReplacementPair).dispose();
    while (this.m_Replacements.length < size) this.m_Replacements.push(new ReplacementPair());
    const values = replacements.getConstArray() as SequenceElements;
    for (let index = 0; index < size; ++index) {
      const pair = PairStringString.unacquired(
          values.get(index * 16) as ReadonlyMap<number, unknown>,
        ),
        target = this.m_Replacements[index] as ReplacementPair;
      target.name.assign(pair.First);
      target.replacement.assign(pair.Second);
    }
    if (size > 1)
      this.m_Replacements.sort(
        /** Original ReplacementPair operator<. @param left - Owned left pair. @param right - Owned right pair. @returns Native lexical result. */ (
          left,
          right,
        ) => left.name.compareTo(right.name),
      );
  }
  /** Original native xmlNewEntity allocation; every temporary entity remains parser-owned until the parser destructor, including NULL results. @param name - Borrowed native entity name. @param value - Borrowed native replacement. @returns Native entity pointer. */
  private newEntity(name: number, value: OUStringConstReference): number {
    const bytes = OUStringToOString(
      value.getStr().subarray(0, value.getLength()),
      RTL_TEXTENCODING_UTF8,
    );
    try {
      const entity = withXmlBytes(
        bytes.getStr().subarray(0, bytes.getLength()),
        /** Actual source C allocation. @param replacement - Native terminated replacement. @returns Native entity. */ (
          replacement,
        ) => getLibXml2()._xmlNewEntity(0, name, XML_INTERNAL_GENERAL_ENTITY, 0, 0, replacement),
      );
      this.m_TemporalEntities.push(entity);
      return entity;
    } finally {
      bytes.dispose();
    }
  }
  /** Original fifth C callback, including source lower_bound/repeated temporary allocation and numeric +2 parsing for both radices. Uses actual pinned libc strtoul, not a host numeric parser. @param name - Borrowed native terminated name or NULL. @returns Actual native entity pointer. */
  callbackGetEntity(name: number): number {
    const m = getLibXml2();
    if (name === 0) return m._xmlGetPredefinedEntity(name);
    const length = m._xmlStrlen(name);
    if (length === 0) return m._xmlGetPredefinedEntity(name);
    if (this.m_Replacements.length > 0) {
      let first = 0,
        count = this.m_Replacements.length;
      while (count !== 0) {
        const step = count >>> 1,
          index = first + step;
        if (
          (this.m_Replacements[index] as ReplacementPair).name.compareToAscii(
            this.xmlBytes(name, length + 1),
          ) < 0
        ) {
          first = index + 1;
          count -= step + 1;
        } else count = step;
      }
      if (first !== this.m_Replacements.length) {
        const pair = this.m_Replacements[first] as ReplacementPair;
        if (pair.name.compareToAscii(this.xmlBytes(name, length + 1)) === 0)
          return this.newEntity(name, pair.replacement);
      }
    }
    if (length < 2) return m._xmlGetPredefinedEntity(name);
    if (m.HEAPU8[name] === 35) {
      const hexadecimal = m.HEAPU8[name + 1] === 120 || m.HEAPU8[name + 1] === 88;
      if (hexadecimal && length < 3) return m._xmlGetPredefinedEntity(name);
      const code = m._strtoul(name + 2, 0, hexadecimal ? 16 : 10) >>> 0;
      if (code === 0) return m._xmlGetPredefinedEntity(name);
      const value = new OUString(new Uint32Array([code]), 1);
      try {
        return this.newEntity(name, value);
      } finally {
        value.dispose();
      }
    }
    return m._xmlGetPredefinedEntity(name);
  }
  /** Original startup/document lifecycle on the pinned Emscripten profile; C contexts/documents are freed before the actual Entity is popped even if callbacks or input throw. Physical C++ mutex/native other-platform thread joins remain outside this profile. @param source - Actual native input source. @returns Nothing. */
  parseStream(source: InputSourceConstReference): void {
    getLibXml2()._xmlInitParser();
    this.pushEntity(this.maData, source);
    const entity = this.getEntity(),
      m = getLibXml2();
    try {
      if (entity.mxDocumentHandler.is()) {
        const locator = new Reference(this.mxDocumentLocator.get());
        try {
          entity.mxDocumentHandler.operatorStar().setDocumentLocator(locator);
        } finally {
          locator.dispose();
        }
        entity.mxDocumentHandler.operatorStar().startDocument();
      }
      entity.mbEnableThreads = false; // Original #ifdef __EMSCRIPTEN__ branch, not a host-imposed default.
      this.parse();
      if (entity.mxDocumentHandler.is()) entity.mxDocumentHandler.operatorStar().endDocument();
    } finally {
      if (entity.mpParser !== 0) {
        const doc = m._office_parser_doc_get(entity.mpParser);
        if (doc !== 0) m._xmlFreeDoc(doc);
        m._xmlFreeParserCtxt(entity.mpParser);
      }
      this.popEntity();
    }
  }
  /** Binds the original C void* this pointer once, lazily after native initialization, and retains it through all native context destruction and this parser's member teardown. No XML state is duplicated. @returns Actual C callback/receiver scope. */
  private getCallbackBinding(): ReturnType<typeof createFastParserCallbackBinding> {
    return (this.callbackBinding ??= createFastParserCallbackBinding({
      /** Original C start forwarding. @param local - Native name. @param prefix - Native prefix. @param uri - Native URI. @param count - Namespace pairs. @param pairs - Native pairs. @param attrs - Attribute count. @param values - Native records. @returns Nothing. */
      startElement: (local, prefix, uri, count, pairs, attrs, values) =>
        this.callbackStartElement(local, prefix, uri, count, pairs, attrs, values),
      /** Original C end forwarding. @returns Nothing. */ endElement: () =>
        this.callbackEndElement(),
      /** Original C counted-byte forwarding. @param value - Native bytes. @param count - Native count. @returns Nothing. */ characters:
        (value, count) => this.callbackCharacters(value, count),
      /** Original C PI forwarding. @param target - Native target. @param data - Native data. @returns Nothing. */ processingInstruction:
        (target, data) => this.callbackProcessingInstruction(target, data),
      /** Original C entity forwarding. @param name - Native name. @returns Actual entity. */ getEntity:
        (name) => this.callbackGetEntity(name),
    }));
  }
  /** Original16KiB converted-byte parse loop and callback/EOF exception polling. First chunk is supplied to xmlCreatePushParserCtxt before assigning mpParser, exactly as source. @returns Nothing. */
  parse(): void {
    const Bytes = Sequence.specialize<number>("sal_Int8", 1),
      output = new Bytes(16 * 1024),
      entity = this.getEntity(),
      m = getLibXml2(),
      binding = this.getCallbackBinding();
    try {
      for (;;) {
        const count = entity.maConverter.readAndConvert(output, 16 * 1024);
        if (count <= 0) {
          if (entity.mpParser !== 0) {
            if (m._xmlParseChunk(entity.mpParser, 0, 0, 1) !== XML_ERR_OK)
              entity.throwException(this.mxDocumentLocator, true);
            if (entity.hasException()) entity.throwException(this.mxDocumentLocator, true);
          }
          break;
        }
        const cells = output.getConstArray() as SequenceElements,
          bytes = new Uint8Array(count);
        for (let index = 0; index < count; ++index)
          bytes[index] = (cells.get(index) as [number])[0];
        let continued = true;
        withXmlBytes(
          bytes,
          /** Original C calls over actual converted bytes. @param pointer - Native bytes. @param length - Native count. @returns Nothing. */ (
            pointer,
            length,
          ) => {
            if (entity.mpParser === 0) {
              entity.mpParser = m._xmlCreatePushParserCtxt(
                binding.handler,
                binding.userData,
                pointer,
                length,
                0,
              );
              if (entity.mpParser === 0) {
                const message = new OUString(
                    new Uint8Array([
                      67, 111, 117, 108, 100, 110, 39, 116, 32, 99, 114, 101, 97, 116, 101, 32, 112,
                      97, 114, 115, 101, 114, 0,
                    ]),
                  ),
                  context = new Reference(),
                  wrapped = new Any();
                try {
                  throw new SAXException(message, context, wrapped);
                } finally {
                  wrapped.dispose();
                  context.dispose();
                  message.dispose();
                }
              }
              m._xmlCtxtUseOptions(entity.mpParser, XML_PARSE_NOENT | XML_PARSE_HUGE);
            } else continued = m._xmlParseChunk(entity.mpParser, pointer, length, 0) === XML_ERR_OK;
          },
        );
        if (!continued) entity.throwException(this.mxDocumentLocator, true);
        if (entity.hasException()) entity.throwException(this.mxDocumentLocator, true);
      }
      // Original getEvent(DONE) returns maSharedEvent without assigning its type on this profile; no queued consumer runs.
    } finally {
      output.dispose();
    }
  }
  /** Original raw-pointer dereference; a current Entity is the caller precondition. @returns Borrowed actual Entity. */
  getEntity(): Entity {
    return this.mpTop as Entity;
  }
}
