/** @fileoverview Original Entity throwException and native C diagnostic contracts, including genuine captured Writer/stream failures; no replacement XML/error-handler provider or error-field injection. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { FastSaxParserImpl } from "./fastparser.impl";
import { FastLocatorImpl } from "./fastparser.locator";
import { ParserData, lclGetErrorMessage } from "./fastparser.entity";
import { CallbackDocumentHandler, NamespaceHandler } from "./legacyfastparser.handlers";
import { SAXParseException } from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import type { XFastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/XFastTokenHandler";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  MemoryInputStream,
  OSequenceOutputStream,
} from "../../../comphelper/source/streaming/seqstream";
import { getLibXml2, initializeLibXml2, withXmlBytes } from "../../../external/libxml2/libxml2";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
beforeAll(
  /** Actual native library/component/exception bootstrap. @returns Completion. */ async () => {
    await initializeLibXml2();
    initializeExceptionAbi();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Actual native parser context and source Entity, deliberately separate from the unfinished parseStream producer. @param data - Actual source configuration. @returns Genuine owner/context inputs. */
function fixture(data: ParserData) {
  const parser = own(new FastSaxParserImpl()),
    input = own(new InputSource()),
    bytes = new Uint8Array([60, 97, 47, 62]),
    stream = own(new Reference(new MemoryInputStream(bytes, bytes.length))),
    locator = own(new RtlReference(new FastLocatorImpl(parser))),
    m = getLibXml2(),
    context = m._xmlCreatePushParserCtxt(0, 0, 0, 0, 0);
  input.aInputStream.assign(stream);
  input.sPublicId.assign(u("public😀"));
  input.sSystemId.assign(u("pkg:/字.xml"));
  parser.pushEntity(data, input);
  const entity = parser.getEntity();
  entity.mpParser = context;
  own({
    /** Native context is freed before the original Entity stack value. @returns Nothing. */ dispose() {
      const document = m._office_parser_doc_get(context);
      if (document !== 0) m._xmlFreeDoc(document);
      m._xmlFreeParserCtxt(context);
      entity.mpParser = 0;
      locator.operatorArrow().dispose();
    },
  });
  return { entity, locator, context, m };
}
/** Feeds actual C bytes and returns the native status. @param context - Actual parser. @param xml - Actual input. @returns Native parse status. */
function parse(context: number, xml: string): number {
  return withXmlBytes(
    new TextEncoder().encode(xml),
    /** Actual terminating C parse call. @param bytes - Native pointer. @param count - Native count. @returns C status. */ (
      bytes,
      count,
    ) => getLibXml2()._xmlParseChunk(context, bytes, count, 1),
  );
}
/** Retains the real thrown native value for assertions and ordinary disposal. @param action - Actual never-returning call. @returns Actual thrown exception. */
function caught(action: () => never): SAXParseException {
  try {
    action();
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    return own(error);
  }
  throw new Error("Expected source SAXParseException");
}
it("uses the exact unknown-error fallback with Unicode source identifiers and signed line values", /** The actual C context has no fabricated last-error fields. @returns Nothing. */ () => {
  const f = fixture(own(new ParserData()));
  expect(parse(f.context, "<a/>")).toBe(0);
  expect(read(lclGetErrorMessage(f.context, u("pkg:/字😀.xml"), -17))).toBe(
    "[pkg:/字😀.xml line -17]: unknown error",
  );
});
it.each([false, true])(
  "throws an owned source SAXParseException with no handler duringParse=%s",
  /** Real C mismatch diagnostics and locator fields populate the actual generated exception. @param during - Source phase. @returns Nothing. */ (
    during,
  ) => {
    const f = fixture(own(new ParserData()));
    expect(parse(f.context, "<a>\n</b>")).not.toBe(0);
    const error = caught(
      /** Calls the source error path. @returns Never. */ () =>
        f.entity.throwException(f.locator, during),
    );
    expect(error.LineNumber).toBe(2);
    expect(error.ColumnNumber).toBeGreaterThan(0);
    expect(text(error.Message)).toContain("[pkg:/字.xml line 2]: ");
    expect(text(error.Message)).toContain("a line 1 and b");
    expect(text(error.PublicId)).toBe("public😀");
    expect(text(error.SystemId)).toBe("pkg:/字.xml");
    expect(error.Context.is()).toBe(false);
    expect(error.WrappedException.hasValue()).toBe(false);
    expect(f.entity.hasException()).toBe(false);
  },
);
it("preserves source ASCII_US diagnostic conversion while source IDs remain Unicode", /** Genuine native C UTF8 diagnostic bytes are not interpreted by a host XML engine. @returns Nothing. */ () => {
  const f = fixture(own(new ParserData()));
  expect(parse(f.context, "<字>\n</other>")).not.toBe(0);
  const pointer = f.m._office_error_message_get(f.m._xmlCtxtGetLastError(f.context));
  expect(f.m.UTF8ToString(pointer)).toContain("字");
  const actual = read(lclGetErrorMessage(f.context, u("pkg:/error.xml"), 2));
  expect(actual).not.toContain("字");
  expect(actual).toContain("other");
});
it("preserves the genuine first caught Writer failure through the native Any assignment boundary", /** Closing the actual output stream triggers the registered Writer's own exception; no throwing fixture provider is used. @returns Nothing. */ () => {
  const strong = own(new Reference(getProcessComponentContext().get())),
    Bytes = Sequence.specialize<number>("sal_Int8", 1),
    output = own(new Bytes()),
    stream = own(new Reference(new OSequenceOutputStream(output))),
    writer = own(Writer.create(strong)),
    document = own(
      new Reference<XDocumentHandler>(writer, UNO_QUERY_THROW, XDocumentHandler.static_type),
    ),
    namespace = own(new RtlReference<NamespaceHandler>()),
    tokens = own(new Reference<XFastTokenHandler>()),
    adapter = own(new RtlReference(new CallbackDocumentHandler(document, namespace, tokens))),
    data = own(new ParserData());
  writer.operatorStar().setOutputStream(stream);
  writer.operatorStar().startDocument();
  data.mxDocumentHandler.set(adapter.get());
  const f = fixture(data);
  expect(parse(f.context, "<a/>")).toBe(0);
  stream.operatorStar().closeOutput();
  f.entity.processingInstruction(u("pi"), u("x".repeat(32768)));
  expect(f.entity.hasException()).toBe(true);
  const saved = own(new Any(f.entity.maSavedException));
  const error = caught(
    /** Calls the real saved-exception path. @returns Never. */ () =>
      f.entity.throwException(f.locator, true),
  );
  expect(error.WrappedException.operatorEquals(saved)).toBe(true);
  expect(f.entity.maSavedException.operatorEquals(saved)).toBe(true);
  expect(text(error.Message)).toContain("unknown error");
});
