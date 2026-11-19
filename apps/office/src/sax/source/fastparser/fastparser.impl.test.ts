/** @fileoverview Original parser entity/namespace/locator ownership against actual native strings, UNO streams/services and C push contexts. Source public Entity aggregate setup is explicit; full callback/parseStream production is not claimed. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { FastSaxParserImpl } from "./fastparser.impl";
import { FastLocatorImpl } from "./fastparser.locator";
import { ParserData, NameWithToken, NamespaceDefine } from "./fastparser.entity";
import { CallbackDocumentHandler, NamespaceHandler } from "./legacyfastparser.handlers";
import { FastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/FastTokenHandler";
import { XFastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/XFastTokenHandler";
import { XFastDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XFastDocumentHandler";
import { XFastNamespaceHandler } from "../../../offapi/com/sun/star/xml/sax/XFastNamespaceHandler";
import type { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import type { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";
import { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { DONTKNOW, NAMESPACE } from "../../../offapi/com/sun/star/xml/sax/FastToken";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { WeakReference } from "../../../cppuhelper/inc/weakref";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { FastTokenHandlerBase } from "../tools/fastattribs";
import { OUStringHash } from "../../../sal/inc/rtl/ustring";
import { OString } from "../../../sal/inc/rtl/string";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { getLibXml2, initializeLibXml2, withXmlBytes } from "../../../external/libxml2/libxml2";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { namespaceTokens } from "../../../oox/source/token/namespacemap";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Actual native library and component bootstrap. @returns Initialization. */ async () => {
    await initializeLibXml2();
    initializeExceptionAbi();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Checks and releases an actual UNO exception value. @param action - Actual call. @param kind - Expected real exception constructor. @param message - Optional source message. @returns Nothing. */
function exception(
  action: () => unknown,
  kind: typeof IllegalArgumentException | typeof SAXException | typeof DisposedException,
  message?: string,
): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof kind)) throw error;
    try {
      caught = true;
      if (message !== undefined) expect(text(error.Message)).toBe(message);
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
}
/** Builds an actual native stream and source; there is no replacement input implementation. @param xml - Actual bytes. @param encoding - Source encoding hint. @returns Owned original source. */
function source(xml = "<root/>", encoding = ""): InputSource {
  const bytes = Uint8Array.from(new TextEncoder().encode(xml)),
    input = own(new InputSource()),
    stream = own(new Reference(new MemoryInputStream(bytes, bytes.length)));
  input.aInputStream.assign(stream);
  input.sEncoding.assign(u(encoding));
  input.sPublicId.assign(u("public😀"));
  input.sSystemId.assign(u("package:/字.xml"));
  return input;
}
/** Actual OString value for public source NamespaceDefine aggregates. @param value - UTF8 fixture spelling. @returns Owned string. */
function b(value: string): OString {
  const bytes = Uint8Array.from(new TextEncoder().encode(value));
  return own(new OString(bytes, bytes.length));
}
it("copies actual input/cache owners, restores nested Entity and does not close caller streams", /** Tests original source push/pop/converter and lifetime contracts. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl()),
    data = own(new ParserData()),
    handler = own(FastTokenHandler.create(getProcessComponentContext())),
    input = source("<root>字😀</root>", "UTF-8");
  data.mxTokenHandler.assign(handler.get() as FastTokenHandlerBase);
  parser.pushEntity(data, input);
  const first = parser.getEntity(),
    firstStream = first.maStructSource.aInputStream.get(),
    output = own(new Bytes());
  expect(first.mbEnableThreads).toBe(false);
  expect(parser.m_bIgnoreMissingNSDecl).toBe(false);
  expect(parser.m_bDisableThreadedParser).toBe(false);
  data.mxTokenHandler.clear();
  input.aInputStream.clear();
  input.sPublicId.assign(u("changed"));
  input.sEncoding.clear();
  expect(first.mxTokenHandler.get()).toBe(handler.get());
  expect(text(first.maStructSource.sPublicId)).toBe("public😀");
  const count = first.maConverter.readAndConvert(output, 16384),
    cells = output.getConstArray() as SequenceElements;
  const actual = new Uint8Array(count);
  for (let i = 0; i < count; ++i) actual[i] = (cells.get(i) as [number])[0];
  expect(new TextDecoder().decode(actual)).toBe("<root>字😀</root>");
  parser.pushEntity(data, source());
  expect(parser.getEntity()).not.toBe(first);
  expect(parser.getEntity().mxTokenHandler.is()).toBe(false);
  parser.popEntity();
  expect(parser.getEntity()).toBe(first);
  parser.popEntity();
  expect(firstStream?.available()).toBe(0);
});
it("rejects absent input before changing the current entity", /** Original no-input SAX value is not a host Error. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl()),
    data = own(new ParserData());
  parser.pushEntity(data, source());
  const before = parser.getEntity();
  exception(
    /** Invokes the actual source contract. @returns Actual call result. */ () =>
      parser.pushEntity(data, own(new InputSource())),
    SAXException,
    "No input source",
  );
  expect(parser.getEntity()).toBe(before);
});
it("uses native Unicode hash/equality, survives collisions and preserves exact registration boundaries", /** Tests source IDL/C++ minimum mismatch and copied keys, without a synthetic map provider. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl()),
    left = u("urn:Aa"),
    right = u("urn:B<"),
    hash = new OUStringHash();
  expect(hash.call(left)).toBe(hash.call(right));
  const word = namespaceTokens.get("doc") as number;
  parser.registerNamespace(left, word);
  parser.registerNamespace(right, NAMESPACE); // Source accepts equality despite IDL saying greater.
  exception(
    /** Invokes the actual source contract. @returns Actual call result. */ () =>
      parser.registerNamespace(u("urn:Aa"), word),
    IllegalArgumentException,
    "namespace URL is already registered: urn:Aa",
  );
  exception(
    /** Invokes the actual source contract. @returns Actual call result. */ () =>
      parser.registerNamespace(u("urn:B<"), word),
    IllegalArgumentException,
    "namespace URL is already registered: urn:B<",
  );
  left.assign(u("mutated"));
  exception(
    /** Invokes the actual source contract. @returns Actual call result. */ () =>
      parser.registerNamespace(u("urn:Aa"), word),
    IllegalArgumentException,
  );
  parser.registerNamespace(left, word);
  exception(
    /** Invokes the actual source contract. @returns Actual call result. */ () =>
      parser.registerNamespace(u("urn:invalid"), NAMESPACE - 1),
    IllegalArgumentException,
    "Invalid namespace token 65535",
  );
});
it("resolves only live source definitions, newest first, including empty and Unicode prefixes", /** Public aggregate fields are initialized as original producer values, not private parser-state patches or a fake namespace provider. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl()),
    data = own(new ParserData());
  parser.pushEntity(data, source());
  const entity = parser.getEntity(),
    word = namespaceTokens.get("doc") as number;
  entity.maNamespaceDefines.push(
    new NamespaceDefine(b("p"), word, u("urn:first")),
    new NamespaceDefine(b("px"), word, u("urn:other")),
    new NamespaceDefine(b("p"), word, u("urn:shadow")),
    new NamespaceDefine(b("字😀"), word, u("urn:unicode")),
    new NamespaceDefine(),
  );
  entity.maNamespaceStack.push(new NameWithToken(u("urn:default"), word));
  expect(entity.maNamespaceDefines[4]?.mnToken).toBe(DONTKNOW);
  exception(
    /** Invokes the actual source contract. @returns Actual call result. */ () =>
      parser.getNamespaceURL(u("p").getStr().subarray(0, 1)),
    IllegalArgumentException,
    "",
  );
  entity.maNamespaceCount.push(4);
  const prefix = u("p"),
    borrowed = parser.getNamespaceURL(prefix.getStr().subarray(0, prefix.getLength()));
  expect(borrowed).toBe(entity.maNamespaceDefines[2]?.maNamespaceURL);
  expect(text(borrowed)).toBe("urn:shadow");
  const unicode = u("字😀");
  expect(text(parser.getNamespaceURL(unicode.getStr().subarray(0, unicode.getLength())))).toBe(
    "urn:unicode",
  );
  entity.maNamespaceCount.push(2);
  expect(text(parser.getNamespaceURL(prefix.getStr().subarray(0, prefix.getLength())))).toBe(
    "urn:first",
  );
  exception(
    /** Invokes the actual source contract. @returns Actual call result. */ () =>
      parser.getNamespaceURL(u("missing").getStr().subarray(0, 7)),
    IllegalArgumentException,
  );
  exception(
    /** Invokes the actual source contract. @returns Actual call result. */ () =>
      parser.getNamespaceURL(u("q").getStr().subarray(0, 1)),
    IllegalArgumentException,
  );
  exception(
    /** Default namespaces use their separate source stack, not an invented empty-prefix definition. @returns Actual call result. */ () =>
      parser.getNamespaceURL(new Uint16Array()),
    IllegalArgumentException,
  );
});
it("retains actual registered handlers in the cache and releases each on its original setter", /** Actual weak references observe the owner; no refcount/private-field patch is used. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl()),
    tokens = FastTokenHandler.create(getProcessComponentContext()),
    TokenWeak = WeakReference.specialize(XFastTokenHandler.static_type),
    tokenWeak = own(new TokenWeak(tokens));
  parser.setTokenHandler(tokens);
  tokens.dispose();
  const tokenObservation = tokenWeak.operatorReference();
  expect(tokenObservation.is()).toBe(true);
  tokenObservation.dispose();
  parser.setTokenHandler(own(new Reference<XFastTokenHandler>()));
  expect(own(tokenWeak.operatorReference()).is()).toBe(false);
  const namespace = new Reference(new NamespaceHandler()),
    NSWeak = WeakReference.specialize(XFastNamespaceHandler.static_type),
    nsWeak = own(new NSWeak(namespace));
  parser.setNamespaceHandler(namespace);
  namespace.dispose();
  const ns = nsWeak.operatorReference();
  expect(ns.is()).toBe(true);
  ns.dispose();
  parser.setNamespaceHandler(own(new Reference<XFastNamespaceHandler>()));
  expect(own(nsWeak.operatorReference()).is()).toBe(false);
  const emptyDocument = own(new Reference<XDocumentHandler>()),
    emptyTokens = own(new Reference<XFastTokenHandler>()),
    emptyNS = own(new RtlReference<NamespaceHandler>()),
    document = new Reference(new CallbackDocumentHandler(emptyDocument, emptyNS, emptyTokens)),
    DocWeak = WeakReference.specialize(XFastDocumentHandler.static_type),
    docWeak = own(new DocWeak(document));
  parser.setFastDocumentHandler(document);
  document.dispose();
  const doc = docWeak.operatorReference();
  expect(doc.is()).toBe(true);
  doc.dispose();
  parser.setFastDocumentHandler(own(new Reference<XFastDocumentHandler>()));
  expect(own(docWeak.operatorReference()).is()).toBe(false);
  parser.setErrorHandler(own(new Reference<XErrorHandler>()));
});
it("reads actual C positions and source IDs through a queryable native locator across nested entities", /** Actual C default SAX handler parses bytes; no host locator or callback result provider is substituted. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl()),
    data = own(new ParserData()),
    input = source(),
    locator = own(new RtlReference(new FastLocatorImpl(parser))),
    query = own(new Reference<XLocator>(locator.get(), UNO_QUERY_THROW, XLocator.static_type)),
    m = getLibXml2(),
    context = m._xmlCreatePushParserCtxt(0, 0, 0, 0, 0);
  parser.pushEntity(data, input);
  parser.getEntity().mpParser = context;
  try {
    withXmlBytes(
      new TextEncoder().encode("<root>\n<child/>"),
      /** Actual incremental C input. @param bytes - Native bytes. @param count - Native length. @returns Native status. */ (
        bytes,
        count,
      ) => m._xmlParseChunk(context, bytes, count, 0),
    );
    expect(query.operatorStar().getLineNumber()).toBe(2);
    expect(query.operatorStar().getColumnNumber()).toBeGreaterThan(1);
    expect(read(query.operatorStar().getPublicId())).toBe("public😀");
    expect(read(query.operatorStar().getSystemId())).toBe("package:/字.xml");
    const child = source();
    child.sSystemId.assign(u("nested.xml"));
    parser.pushEntity(data, child);
    expect(read(query.operatorStar().getSystemId())).toBe("nested.xml");
    parser.popEntity();
    expect(read(query.operatorStar().getSystemId())).toBe("package:/字.xml");
    withXmlBytes(
      new TextEncoder().encode("\n</root>"),
      /** Native completion. @param bytes - Native bytes. @param count - Native length. @returns Native status. */ (
        bytes,
        count,
      ) => m._xmlParseChunk(context, bytes, count, 1),
    );
    expect(query.operatorStar().getLineNumber()).toBe(3);
  } finally {
    const document = m._office_parser_doc_get(context);
    if (document !== 0) m._xmlFreeDoc(document);
    m._xmlFreeParserCtxt(context);
    parser.getEntity().mpParser = 0;
  }
  locator.operatorArrow().dispose();
  exception(
    /** Invokes the actual disposed locator contract. @returns Actual call result. */ () =>
      query.operatorStar().getLineNumber(),
    DisposedException,
  );
  exception(
    /** Invokes the actual disposed locator contract. @returns Actual call result. */ () =>
      query.operatorStar().getColumnNumber(),
    DisposedException,
  );
  exception(
    /** Invokes the actual disposed locator contract. @returns Actual call result. */ () =>
      query.operatorStar().getPublicId(),
    DisposedException,
  );
  exception(
    /** Invokes the actual disposed locator contract. @returns Actual call result. */ () =>
      query.operatorStar().getSystemId(),
    DisposedException,
  );
});
