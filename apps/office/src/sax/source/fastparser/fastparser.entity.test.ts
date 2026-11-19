/** @fileoverview Actual source Entity and legacy adapters connected to registered Writer/FastTokenHandler and native stream/attributes; no stand-in handler, numeric provider or private-state patch. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { Entity, Event, ParserData } from "./fastparser.entity";
import { CallbackDocumentHandler, NamespaceHandler } from "./legacyfastparser.handlers";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { FastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/FastTokenHandler";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import { DONTKNOW } from "../../../offapi/com/sun/star/xml/sax/FastToken";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OSequenceOutputStream } from "../../../comphelper/source/streaming/seqstream";
import { AttributeList } from "../../../comphelper/source/xml/attributelist";
import { FastAttributeList, FastTokenHandlerBase } from "../tools/fastattribs";
import { getTokenFromUtf8 as token } from "../../../oox/source/token/tokenmap";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { OString } from "../../../sal/inc/rtl/string";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Uses the existing actual component/exception bootstrap. @returns Nothing. */ () => {
    initializeExceptionAbi();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
it("keeps native namespace notifications optional while real document contexts still consume events", /** Tests the actual empty XFastNamespaceHandler configuration, not a replacement handler. @returns Nothing. */ () => {
  const f = fixture(false),
    handler = f.tokens.get() as FastTokenHandlerBase,
    root = event(token("p"), "ignored", handler),
    child = event(DONTKNOW, "child", handler);
  f.adapter.operatorArrow().startDocument();
  f.entity.startElement(root);
  f.entity.startElement(child);
  f.entity.endElement();
  f.entity.endElement();
  f.adapter.operatorArrow().endDocument();
  expect(f.entity.hasException()).toBe(false);
  expect(outputText(f.bytes)).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<p><child/></p>');
});
it.each([DONTKNOW, token("p")])(
  "retains the native absent document/namespace defaults for token %d",
  /** A genuine token handler remains available; no null-handler token lookup is invoked. @param id - Native unknown or known token. @returns Nothing. */ (
    id,
  ) => {
    const tokens = own(FastTokenHandler.create(getProcessComponentContext())),
      data = own(new ParserData());
    data.mxTokenHandler.assign(tokens.get() as FastTokenHandlerBase);
    const entity = own(new Entity(data)),
      source = event(id, "root", tokens.get() as FastTokenHandlerBase);
    entity.startElement(source);
    entity.characters(u("ignored"));
    entity.endElement();
    entity.processingInstruction(u("pi"), u("ignored"));
    expect(entity.hasException()).toBe(false);
  },
);
/** Actual byte-string value for the source unknown attribute API. @param value - Fixture text. @returns Native owned value. */
function b(value: string): OString {
  const bytes = new TextEncoder().encode(value);
  return own(new OString(bytes, bytes.length));
}
/** Reads actual finalized native byte fields. @param bytes - Actual output. @returns UTF8 observation. */
function outputText(bytes: Sequence<number>): string {
  const data = bytes.getConstArray() as SequenceElements,
    result = new Uint8Array(bytes.getLength());
  for (let i = 0; i < result.length; ++i) result[i] = (data.get(i) as [number])[0];
  return new TextDecoder().decode(result);
}
/** Builds actual services and owners. @param namespaceNotifications - Include the source namespace handler. @returns Native fixture. */
function fixture(namespaceNotifications = true) {
  const context = own(new Reference(getProcessComponentContext().get())),
    bytes = own(new Bytes()),
    stream = own(new Reference(new OSequenceOutputStream(bytes))),
    writer = own(Writer.create(context)),
    document = own(
      new Reference<XDocumentHandler>(writer, UNO_QUERY_THROW, XDocumentHandler.static_type),
    ),
    tokens = own(FastTokenHandler.create(context)),
    namespaces = own(new RtlReference(new NamespaceHandler())),
    adapter = own(new RtlReference(new CallbackDocumentHandler(document, namespaces, tokens))),
    data = own(new ParserData());
  writer.operatorStar().setOutputStream(stream);
  expect(tokens.get()).toBeInstanceOf(FastTokenHandlerBase);
  data.mxDocumentHandler.set(adapter.get());
  data.mxTokenHandler.assign(tokens.get() as FastTokenHandlerBase);
  if (namespaceNotifications) data.mxNamespaceHandler.set(namespaces.get());
  const entity = own(new Entity(data));
  return { bytes, stream, writer, document, tokens, namespaces, adapter, data, entity };
}
/** Initializes the real public source Event aggregate, as the callback producer does. @param tokenId - Actual token or DONTKNOW. @param name - Source QName. @param handler - Actual native token handler. @returns Owned source event. */
function event(tokenId: number, name: string, handler: FastTokenHandlerBase | null): Event {
  const result = own(new Event());
  result.mnElementToken = tokenId;
  result.msElementName.assign(u(name));
  result.msNamespace.assign(u("urn:event"));
  result.mxAttributes.set(new FastAttributeList(handler));
  result.mxDeclAttributes.set(new FastAttributeList(handler));
  return result;
}
it("routes copied parser data, known/unknown contexts, declaration/attribute order and native Unicode into real XML output", /** Uses genuine adapters/services, retaining the source high-bit prefix behavior. @returns Nothing. */ () => {
  const f = fixture(),
    handler = f.tokens.get() as FastTokenHandlerBase,
    root = event((token("w") << 16) | token("p"), "ignored", handler),
    child = event(DONTKNOW, "u:item", handler);
  root.mxDeclAttributes.operatorArrow().addUnknown(b("w"), b("urn:w"));
  root.mxDeclAttributes.operatorArrow().addUnknown(b("u"), b("urn:u"));
  root.mxAttributes.operatorArrow().add((token("w") << 16) | token("val"), u("Ω"));
  root.mxAttributes.operatorArrow().addUnknown(u("urn:u"), b("u:a"), b('q&"'));
  f.data.mxDocumentHandler.clear();
  f.data.mxNamespaceHandler.clear();
  f.data.mxTokenHandler.clear();
  f.adapter.operatorArrow().setDocumentLocator(own(new Reference<XLocator>()));
  f.adapter.operatorArrow().startDocument();
  f.entity.characters(u("outside"));
  f.entity.endElement();
  f.entity.startElement(root);
  f.entity.startElement(child);
  child.msElementName.assign(u("reused-buffer"));
  f.entity.characters(u("文字 & < >"));
  f.entity.endElement();
  f.entity.endElement();
  f.entity.processingInstruction(u("keep"), u("value"));
  f.adapter.operatorArrow().endDocument();
  expect(f.entity.hasException()).toBe(false);
  expect(outputText(f.bytes)).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<p xmlns:w="urn:w" xmlns:u="urn:u" val="Ω" u:a="q&amp;&quot;"><u:item>文字 &amp; &lt; &gt;</u:item></p><?keep value?>',
  );
  expect(text(own(f.namespaces.operatorArrow().getNamespaceURI(u("w"))))).toBe("");
});
it("preserves default namespace declarations, unprefixed known children and the original acquired self contexts", /** Checks source native identities and ordinary lexical emission. @returns Nothing. */ () => {
  const f = fixture(),
    handler = f.tokens.get() as FastTokenHandlerBase,
    root = event(DONTKNOW, "root", handler),
    child = event(token("r"), "ignored", handler);
  root.mxDeclAttributes.operatorArrow().addUnknown(b(""), b("urn:default"));
  const attr = own(new Reference(root.mxAttributes.get())),
    a = own(f.adapter.operatorArrow().createFastChildContext(token("r"), attr)),
    other = own(f.adapter.operatorArrow().createUnknownChildContext(u(""), u("n"), attr));
  expect(a.get()).toBe(f.adapter.get());
  expect(other.get()).toBe(f.adapter.get());
  f.adapter.operatorArrow().startDocument();
  f.entity.startElement(root);
  f.entity.startElement(child);
  f.entity.endElement();
  f.entity.endElement();
  f.adapter.operatorArrow().endDocument();
  expect(outputText(f.bytes)).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<root xmlns="urn:default"><r/></root>',
  );
});
it("preserves null root contexts and skips their descendants before namespace forwarding", /** Original configured namespace handler remains an actual independent component. @returns Nothing. */ () => {
  const namespaces = own(new RtlReference(new NamespaceHandler())),
    data = own(new ParserData());
  data.mxNamespaceHandler.set(namespaces.get());
  const entity = own(new Entity(data)),
    root = event(DONTKNOW, "root", null),
    child = event(token("r"), "child", null);
  root.mxDeclAttributes.operatorArrow().addUnknown(b("root"), b("urn:root"));
  child.mxDeclAttributes.operatorArrow().addUnknown(b("skip"), b("urn:skip"));
  entity.processingInstruction(u("pi"), u("ignored"));
  entity.startElement(root);
  entity.startElement(child);
  entity.characters(u("ignored"));
  entity.endElement();
  entity.endElement();
  entity.endElement();
  const attributes = own(new RtlReference(new AttributeList()));
  namespaces.operatorArrow().addNSDeclAttributes(attributes);
  expect(attributes.operatorArrow().getLength()).toBe(1);
  expect(text(own(attributes.operatorArrow().getNameByIndex(0)))).toBe("xmlns:root");
  expect(entity.hasException()).toBe(false);
});
it("captures genuine closed-stream callback failures and retains the first native exception", /** Writer and stream use their actual public connected/closed state transitions. @returns Nothing. */ () => {
  const f = fixture(),
    handler = f.tokens.get() as FastTokenHandlerBase,
    root = event(DONTKNOW, "root", handler);
  root.mxAttributes.operatorArrow().add(token("val"), "x".repeat(32768));
  f.adapter.operatorArrow().startDocument();
  f.stream.operatorStar().closeOutput();
  f.entity.startElement(root);
  expect(f.entity.hasException()).toBe(true);
  const first = own(new Any(f.entity.maSavedException));
  f.entity.processingInstruction(u("pi"), u("x".repeat(32768)));
  expect(f.entity.maSavedException.operatorEquals(first)).toBe(true);
  f.entity.characters(u("ignored below failed context"));
  f.entity.endElement();
});
it("captures real text and closing-write failures without a replacement context provider", /** Large valid source values reach real output writes after the stream closes. @returns Nothing. */ () => {
  const f = fixture(),
    handler = f.tokens.get() as FastTokenHandlerBase,
    root = event(DONTKNOW, "r".repeat(32768), handler);
  f.adapter.operatorArrow().startDocument();
  f.entity.startElement(root);
  expect(f.entity.hasException()).toBe(false);
  f.stream.operatorStar().closeOutput();
  f.entity.characters(u("x".repeat(32768)));
  expect(f.entity.hasException()).toBe(true);
  f.entity.endElement();
  expect(f.entity.hasException()).toBe(true);
});
it("retains the original no-document adapter guards and pending declaration ownership", /** Empty native references are genuine source-supported defaults. @returns Nothing. */ () => {
  const namespaces = own(new RtlReference(new NamespaceHandler())),
    empty = own(new Reference<XDocumentHandler>()),
    tokens = own(FastTokenHandler.create(getProcessComponentContext())),
    adapter = own(new RtlReference(new CallbackDocumentHandler(empty, namespaces, tokens))),
    attrs = own(new Reference(new FastAttributeList(tokens.get() as FastTokenHandlerBase)));
  namespaces.operatorArrow().registerNamespace(u("p"), u("urn:p"));
  adapter.operatorArrow().startDocument();
  adapter.operatorArrow().endDocument();
  adapter.operatorArrow().setDocumentLocator(own(new Reference<XLocator>()));
  adapter.operatorArrow().processingInstruction(u("pi"), u("data"));
  adapter.operatorArrow().characters(u("text"));
  adapter.operatorArrow().startUnknownElement(u(""), u("root"), attrs);
  adapter.operatorArrow().endUnknownElement(u(""), u("root"));
  const attributes = own(new RtlReference(new AttributeList()));
  namespaces.operatorArrow().addNSDeclAttributes(attributes);
  expect(attributes.operatorArrow().getLength()).toBe(1);
});
