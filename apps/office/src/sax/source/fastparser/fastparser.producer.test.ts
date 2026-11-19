/** @fileoverview Actual C SAX2 callbacks drive original Emscripten FastSaxParserImpl producers, native Entity/legacy handlers and registered Writer/token/stream services. No synthetic positive parser/handler or private-state patch; full parseStream/custom-entity callback remains separate. */
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { afterEach, beforeAll, expect, it } from "vitest";
import { FastSaxParserImpl } from "./fastparser.impl";
import { ParserData } from "./fastparser.entity";
import { CallbackDocumentHandler, NamespaceHandler } from "./legacyfastparser.handlers";
import { createFastParserCallbackBinding } from "../../../external/libxml2/fastparsercallbacks";
import { initializeLibXml2, getLibXml2, withXmlBytes } from "../../../external/libxml2/libxml2";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { FastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/FastTokenHandler";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  MemoryInputStream,
  OSequenceOutputStream,
} from "../../../comphelper/source/streaming/seqstream";
import { FastTokenHandlerBase } from "../tools/fastattribs";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { namespaceTokens, StaticNamespaceMap } from "../../../oox/source/token/namespacemap";
import { getTokenFromUtf8 } from "../../../oox/source/token/tokenmap";
import {
  XMap,
  cppu_detail_getUnoType as mapType,
  getCppuType as mapDeprecated,
} from "../../../udkapi/com/sun/star/container/XMap";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
const Bytes = Sequence.specialize<number>("sal_Int8", 1),
  word = namespaceTokens.get("doc") as number,
  wordURI = text(StaticNamespaceMap().maTransitionalNamespaceMap.get(word) as OUString);
beforeAll(
  /** Real native library/component/exception bootstrap. @returns Completion. */ async () => {
    await initializeLibXml2();
    initializeExceptionAbi();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Actual owned native bytes, without making a string or XML provider. @param bytes - Actual signed-byte sequence. @returns UTF8 observation. */
function output(bytes: Sequence<number>): string {
  const cells = bytes.getConstArray() as SequenceElements,
    data = new Uint8Array(bytes.getLength());
  for (let i = 0; i < data.length; ++i) data[i] = (cells.get(i) as [number])[0];
  return new TextDecoder().decode(data);
}
/** Builds only real source owners and native services. All five C callbacks delegate to actual original source methods; full stream-loop tests are separate. @param tokenized - Use actual registered token handler. @param notifications - Use actual original namespace handler. @returns Native fixture. */
function fixture(tokenized = false, notifications = true) {
  expect(Number.isInteger(word)).toBe(true);
  expect(typeof wordURI).toBe("string");
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
    parser = own(new FastSaxParserImpl()),
    data = own(new ParserData()),
    input = own(new InputSource()),
    inputBytes = new Uint8Array([60, 97, 47, 62]),
    source = own(new Reference(new MemoryInputStream(inputBytes, inputBytes.length)));
  writer.operatorStar().setOutputStream(stream);
  input.aInputStream.assign(source);
  data.mxDocumentHandler.set(adapter.get());
  if (tokenized) data.mxTokenHandler.assign(tokens.get() as FastTokenHandlerBase);
  if (notifications) data.mxNamespaceHandler.set(namespaces.get());
  parser.pushEntity(data, input);
  const entity = parser.getEntity(),
    m = getLibXml2(),
    binding = createFastParserCallbackBinding({
      /** Direct actual source start callback. @param local - C name. @param prefix - C prefix. @param uri - C URI. @param count - Namespace pairs. @param pairs - Native array. @param attrCount - Attribute count. @param attrs - Native records. @returns Nothing. */
      startElement(local, prefix, uri, count, pairs, attrCount, attrs) {
        parser.callbackStartElement(local, prefix, uri, count, pairs, attrCount, attrs);
      },
      /** Direct original end callback. @returns Nothing. */ endElement() {
        parser.callbackEndElement();
      },
      /** Direct original counted text callback. @param bytes - Native bytes. @param count - Native count. @returns Nothing. */ characters(
        bytes,
        count,
      ) {
        parser.callbackCharacters(bytes, count);
      },
      /** Direct original PI callback. @param target - Native target. @param value - Native data. @returns Nothing. */ processingInstruction(
        target,
        value,
      ) {
        parser.callbackProcessingInstruction(target, value);
      },
      /** Original actual C entity callback. @param name - C name. @returns Native C entity. */ getEntity(
        name,
      ) {
        return parser.callbackGetEntity(name);
      },
    }),
    native = m._xmlCreatePushParserCtxt(binding.handler, binding.userData, 0, 0, 0);
  entity.mpParser = native;
  own({
    /** Same actual C cleanup order, followed by binding release. @returns Nothing. */ dispose() {
      const doc = m._office_parser_doc_get(native);
      if (doc !== 0) m._xmlFreeDoc(doc);
      m._xmlFreeParserCtxt(native);
      entity.mpParser = 0;
      binding.dispose();
    },
  });
  adapter.operatorArrow().startDocument();
  return {
    parser,
    entity,
    stream,
    bytes,
    /** Feeds genuine C buffers rather than manufactured Event values. @param xml - Native XML bytes. @param final - Source finish flag. @returns Actual status. */
    feed(xml: string | Uint8Array, final = false): number {
      return withXmlBytes(
        typeof xml === "string" ? new TextEncoder().encode(xml) : xml,
        /** Native push input. @param p - Native pointer. @param n - Native count. @returns Status. */ (
          p,
          n,
        ) => m._xmlParseChunk(native, p, n, final ? 1 : 0),
      );
    },
    /** Finalizes only the real Writer. @returns Native serialized output. */ finish(): string {
      adapter.operatorArrow().endDocument();
      return output(bytes);
    },
  };
}
it("streams original unknown namespace/attribute/text/PI consumers from actual C callbacks", /** No token handler is a genuine documented source configuration. @returns Nothing. */ () => {
  const f = fixture();
  expect(
    f.feed(
      '<?before keep?><p:root xmlns:p="urn:one" xmlns="urn:default" p:attr="Ω" plain="字"><child xmlns:p="urn:two" p:other="1">_a&amp;😀<?inside data?>z</child><p:last/></p:root>',
      true,
    ),
  ).toBe(0);
  expect(f.entity.hasException()).toBe(false);
  expect(f.finish()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<?before keep?><p:root xmlns:p="urn:one" xmlns="urn:default" p:attr="Ω" plain="字"><child xmlns:p="urn:two" p:other="1">_a&amp;😀<?inside data?>z</child><p:last/></p:root>',
  );
});
it("uses genuine namespace/local tokens and source implicit xml scope while preserving legacy QName conversion", /** Native OOX high-mask prefix behavior remains unchanged. @returns Nothing. */ () => {
  const f = fixture(true);
  f.parser.registerNamespace(u(wordURI), word);
  expect(f.feed('<w:p xmlns:w="' + wordURI + '" w:val="1" foo="x">')).toBe(0);
  expect(f.entity.maSharedEvent.mnElementToken).toBe(word | getTokenFromUtf8("p"));
  expect(f.feed('<w:r/><w:mystery xml:lang="en">x</w:mystery></w:p>', true)).toBe(0);
  expect(f.entity.hasException()).toBe(false);
  expect(f.finish()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<p xmlns:w="' +
      wordURI +
      '" val="1" foo="x"><r/><w:mystery xml:lang="en">x</w:mystery></p>',
  );
});
it("grows namespace definitions by64 and restores parent bindings after actual C end callbacks", /** Original backing-vector capacity and active-count stack are distinct. @returns Nothing. */ () => {
  const f = fixture(),
    declarations = Array.from(
      { length: 66 },
      /** Original declared prefix. @param unused - No value. @param index - Prefix index. @returns XML declaration. */ (
        _,
        index,
      ) => " xmlns:p" + index + '="urn:' + index + '"',
    ).join("");
  expect(f.feed("<root" + declarations + ">")).toBe(0);
  expect(f.entity.maNamespaceDefines.length).toBe(128);
  expect(f.entity.maNamespaceCount.at(-1)).toBe(67);
  expect(text(f.parser.getNamespaceURL(new Uint16Array([112, 48])))).toBe("urn:0");
  expect(f.feed('<p0:child xmlns:p0="urn:shadow"/>')).toBe(0);
  expect(text(f.parser.getNamespaceURL(new Uint16Array([112, 48])))).toBe("urn:0");
  expect(f.feed("</root>", true)).toBe(0);
  expect(f.entity.maNamespaceCount.length).toBe(0);
  expect(f.finish()).toContain('<p0:child xmlns:p0="urn:shadow"/>');
});
it("normalizes actual C namespace declarations before token lookup while notifying their original spelling", /** Source normalization and notification have intentionally different values. @returns Nothing. */ () => {
  const f = fixture(true);
  f.parser.registerNamespace(u("http://www.w3.org/2002/xforms"), word);
  expect(f.feed('<f:p xmlns:f="http://www.w3.org/not-a-year/xforms">')).toBe(0);
  expect(f.entity.maSharedEvent.mnElementToken).toBe(word | getTokenFromUtf8("p"));
  expect(text(f.parser.getNamespaceURL(new Uint16Array([102])))).toBe(
    "http://www.w3.org/2002/xforms",
  );
  expect(f.feed("</f:p>", true)).toBe(0);
  expect(f.finish()).toContain('<p xmlns:f="http://www.w3.org/not-a-year/xforms"/>');
});
it("retains source default-namespace inheritance after an unknown prefixed element", /** Source overwrites the inherited default namespace when the prefixed local token is unknown; preserve the resulting child token. @returns Nothing. */ () => {
  const f = fixture(true);
  f.parser.registerNamespace(u(wordURI), word);
  expect(f.feed('<w:unknown-root xmlns:w="' + wordURI + '" xmlns="urn:default"><p>')).toBe(0);
  expect(f.entity.maSharedEvent.mnElementToken).toBe(word | getTokenFromUtf8("p"));
  expect(f.entity.maNamespaceStack.at(-1)?.mnToken).toBe(word);
  expect(f.feed("</p></w:unknown-root>", true)).toBe(0);
  expect(f.finish()).toContain(
    '<w:unknown-root xmlns:w="' + wordURI + '" xmlns="urn:default"><p/></w:unknown-root>',
  );
});
it("retains optional namespace notifications, known unprefixed tokens and empty PI data", /** The optional native handler default is used directly. @returns Nothing. */ () => {
  const f = fixture(true, false);
  expect(f.feed('<?empty ?><p><r val="字">a&amp;😀</r></p>', true)).toBe(0);
  expect(f.entity.hasException()).toBe(false);
  expect(f.finish()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<?empty ?><p><r val="字">a&amp;😀</r></p>',
  );
});
it("captures genuine Writer failure while C callbacks continue, retaining the first native Any", /** The real source consumer handles the actual disconnected stream exception. @returns Nothing. */ () => {
  const f = fixture();
  f.stream.operatorStar().closeOutput();
  expect(f.feed('<root a="' + "x".repeat(32768) + '">x</root>', true)).toBe(0);
  expect(f.entity.hasException()).toBe(true);
});
it("retains generated XMap type metadata and the actual missing-prefix public wrapper", /** No map implementation or private native error field is invented. @returns Nothing. */ () => {
  expect(text(XMap.static_type().getTypeName())).toBe("com.sun.star.container.XMap");
  expect(mapType().getTypeLibType()).toBe(mapDeprecated().getTypeLibType());
  const f = fixture();
  expect(f.feed("<root/>", true)).toBe(0);
  let caught = false;
  try {
    f.parser.getNamespaceURL(new Uint16Array([112]));
  } catch (error) {
    if (!(error instanceof IllegalArgumentException)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
  f.finish();
});
it("retains registered default namespaces, undeclaration and prefixed byte comparisons from actual C scopes", /** All namespace/token values come from the real source namespace/token owners. @returns Nothing. */ () => {
  const f = fixture(true);
  f.parser.registerNamespace(u(wordURI), word);
  expect(
    f.feed(
      '<p xmlns="' +
        wordURI +
        '" xmlns:q="urn:other" xmlns:a="' +
        wordURI +
        '"><r/><q:unknown a:val="1"/><p xmlns=""/></p>',
      true,
    ),
  ).toBe(0);
  expect(f.entity.hasException()).toBe(false);
  expect(f.finish()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<p xmlns="' +
      wordURI +
      '" xmlns:q="urn:other" xmlns:a="' +
      wordURI +
      '"><r/><q:unknown val="1"/><p xmlns=""/></p>',
  );
});
it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])(
  "retains the explicit native missing-URI callback contract, tokenized=%s IgnoreMissingNSDecl=%s",
  /** Native pointers and nullable URI are direct declared callback operands, not a replacement parser result; the separate C-produced tests qualify actual libxml2 emission. @param tokenized - Original optional token handler. @param ignore - Original explicit option. @returns Nothing. */ (
    tokenized,
    ignore,
  ) => {
    const f = fixture(tokenized);
    f.parser.m_bIgnoreMissingNSDecl = ignore;
    withXmlBytes(
      new Uint8Array([114, 111, 111, 116]),
      /** Actual native name pointer. @param local - Native name. @returns Nothing. */ (local) =>
        withXmlBytes(
          new Uint8Array([112]),
          /** Actual native prefix pointer; URI is the source-declared NULL case. @param prefix - Native prefix. @returns Nothing. */ (
            prefix,
          ) => f.parser.callbackStartElement(local, prefix, 0, 0, 0, 0, 0),
        ),
    );
    expect(f.entity.hasException()).toBe(!ignore);
    f.parser.callbackEndElement();
    if (ignore) expect(f.finish()).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<p:root/>');
  },
);
it("retains NULL data in the source's native PI callback contract", /** This direct nullable C-ABI operand is distinct from the C engine's empty-string PI result. @returns Nothing. */ () => {
  const f = fixture();
  withXmlBytes(
    new Uint8Array([112, 105]),
    /** Calls the actual original callback with a native target and NULL data. @param target - Actual native target. @returns Nothing. */ (
      target,
    ) => f.parser.callbackProcessingInstruction(target, 0),
  );
  expect(f.feed("<root/>", true)).toBe(0);
  expect(f.finish()).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<?pi ?><root/>');
});
