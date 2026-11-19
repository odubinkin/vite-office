/** @fileoverview Actual original native FastParser converted-input loop, source options, custom entity callback and cleanup connected to real registered Writer/token/streams; source complete UNO wrapper/QA remain separate. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { FastSaxParserImpl } from "./fastparser.impl";
import { CallbackDocumentHandler, NamespaceHandler } from "./legacyfastparser.handlers";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { FastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/FastTokenHandler";
import type { XFastDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XFastDocumentHandler";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { SAXParseException } from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PairStringString,
  cppu_detail_getUnoType_PairStringString,
} from "../../../udkapi/com/sun/star/beans/Pair";
import {
  MemoryInputStream,
  OSequenceOutputStream,
} from "../../../comphelper/source/streaming/seqstream";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { getLibXml2, initializeLibXml2, withXmlBytes } from "../../../external/libxml2/libxml2";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { rtl_uString_assign, type rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
const Bytes = Sequence.specialize<number>("sal_Int8", 1),
  Pairs = Sequence.specialize<PairStringString>(cppu_detail_getUnoType_PairStringString, 16);
beforeAll(
  /** Real C library/component/exception bootstrap. @returns Completion. */ async () => {
    await initializeLibXml2();
    initializeExceptionAbi();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Actual native scalar-only observations of the existing native stream. @param bytes - Actual byte Sequence. @returns UTF8 text. */
function output(bytes: Sequence<number>): string {
  const result = new Uint8Array(bytes.getLength()),
    cells = bytes.getConstArray() as SequenceElements;
  for (let i = 0; i < result.length; ++i) result[i] = (cells.get(i) as [number])[0];
  return new TextDecoder().decode(result);
}
/** Builds the actual source cache through its public setters and the real registered Writer/token services. @returns Native parser/output. */
function fixture() {
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
    parser = own(new FastSaxParserImpl());
  writer.operatorStar().setOutputStream(stream);
  parser.setFastDocumentHandler(own(new Reference(adapter.get())));
  parser.setTokenHandler(tokens);
  parser.setNamespaceHandler(own(new Reference(namespaces.get())));
  return { parser, bytes, stream };
}
/** Native InputSource over actual MemoryInputStream, leaving closure with caller. @param xml - Input bytes. @param encoding - Original optional source encoding. @returns Actual native source. */
function source(xml: string | Uint8Array, encoding = ""): InputSource {
  const bytes = typeof xml === "string" ? Uint8Array.from(new TextEncoder().encode(xml)) : xml,
    stream = own(new Reference(new MemoryInputStream(bytes, bytes.length))),
    input = own(new InputSource());
  input.aInputStream.assign(stream);
  input.sPublicId.assign(u("public😀"));
  input.sSystemId.assign(u("pkg:/字.xml"));
  input.sEncoding.assign(u(encoding));
  return input;
}
/** Original Pair sequence values use actual field addresses and generated owners. @param values - Native fixture operands. @returns Actual sequence. */
function pairs(values: readonly (readonly [string, string])[]) {
  const result = own(new Pairs(values.length)),
    cells = result.getArray() as SequenceElements;
  for (let index = 0; index < values.length; ++index) {
    const fields = cells.get(index * 16) as ReadonlyMap<number, unknown>,
      input = values[index] as readonly [string, string];
    rtl_uString_assign(fields.get(0) as rtl_uStringSlot, u(input[0]).pData);
    rtl_uString_assign(fields.get(8) as rtl_uStringSlot, u(input[1]).pData);
  }
  return result;
}

it("runs actual converted stream/C callbacks and source cleanup with Unicode and predefined entities", /** All source parser phases use the actual native InputSource and real Writer. @returns Nothing. */ () => {
  const f = fixture(),
    input = source('<root a="字&amp;Ω"><p>😀&lt;x</p><?done keep?></root>', "UTF-8");
  f.parser.parseStream(input);
  expect(output(f.bytes)).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<root a="字&amp;Ω"><p>😀&lt;x</p><?done keep?></root>',
  );
  expect(input.aInputStream.operatorStar().available()).toBe(0);
});
it("crosses multiple original16KiB reads and retains original source namespace/text behavior", /** A real long UTF8 stream exercises incremental parsing after creation. @returns Nothing. */ () => {
  const f = fixture(),
    value = "字😀".repeat(10000);
  f.parser.parseStream(source("<root>" + value + "</root>"));
  expect(output(f.bytes)).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<root>' + value + "</root>",
  );
});
it("throws actual native malformed XML diagnostics and reuses the same parser after cleanup", /** No native context/error field or failure provider is patched. @returns Nothing. */ () => {
  const f = fixture();
  let caught = false;
  try {
    f.parser.parseStream(source("<a>\n</b>"));
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    try {
      caught = true;
      expect(error.LineNumber).toBe(2);
      expect(text(error.SystemId)).toBe("pkg:/字.xml");
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
  f.parser.setFastDocumentHandler(own(new Reference<XFastDocumentHandler>()));
  f.parser.parseStream(source("<a/>"));
});
it("preserves source empty-stream acceptance", /** No additional host XML-root rejection is inserted. @returns Nothing. */ () => {
  const f = fixture();
  f.parser.parseStream(source(""));
  expect(output(f.bytes)).toBe('<?xml version="1.0" encoding="UTF-8"?>\n');
});
it("uses genuine pinned libc strtoul and the source numeric +2 branch", /** Direct original callback inputs are separate from libxml2's own numeric character-reference handling. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl()),
    m = getLibXml2();
  for (const [name, expected] of [
    ["#x1F600", "😀"],
    ["#X41", "A"],
    ["#65", "\u0005"],
  ] as const)
    withXmlBytes(
      new TextEncoder().encode(name),
      /** Actual native callback name. @param pointer - Native name. @returns Nothing. */ (
        pointer,
      ) => {
        const entity = parser.callbackGetEntity(pointer);
        expect(entity).not.toBe(0);
        expect(m.UTF8ToString(m._office_entity_content_get(entity))).toBe(expected);
      },
    );
  expect(parser.callbackGetEntity(0)).toBe(0);
});

it("copies/sorts real custom replacement pairs, expands them through all five C callbacks and keeps caller copies independent", /** Native source sequence/RTL ownership and custom entity allocation, with no substitute entity provider. @returns Nothing. */ () => {
  const f = fixture(),
    replacements = pairs([
      ["zeta", "字😀"],
      ["alpha", "A&amp;B"],
    ]);
  f.parser.setCustomEntityNames(replacements);
  replacements.realloc(0);
  f.parser.parseStream(source('<root attr="&zeta;">&alpha; &zeta;</root>'));
  expect(output(f.bytes)).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<root attr="字😀">A&amp;B 字😀</root>',
  );
  f.parser.setCustomEntityNames(pairs([["single", "x"]]));
  f.parser.setCustomEntityNames(pairs([]));
});

it("retains original custom-name lower_bound misses, builtins and zero numeric fallbacks", /** Actual native pointers and libc conversion, without fabricated C results. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl()),
    m = getLibXml2();
  parser.setCustomEntityNames(
    pairs([
      ["alpha", "A"],
      ["zeta", "Z"],
    ]),
  );
  for (const name of ["", "z", "aardvark", "middle", "zzzz", "#x", "#x0", "#0", "#xZ"])
    withXmlBytes(
      new TextEncoder().encode(name),
      /** Actual callback input. @param pointer - Native name. @returns Nothing. */ (pointer) =>
        expect(parser.callbackGetEntity(pointer)).toBe(0),
    );
  withXmlBytes(
    new Uint8Array([97, 109, 112]),
    /** Predefined C entity still wins after a custom-name miss. @param name - Native name. @returns Nothing. */ (
      name,
    ) => expect(parser.callbackGetEntity(name)).toBe(m._xmlGetPredefinedEntity(name)),
  );
});
it("preserves actual libc partial conversion, sign and unsigned-long32 overflow", /** Source primitive is the pinned native implementation, not JavaScript parseInt. @returns Nothing. */ () => {
  const m = getLibXml2();
  for (const [input, expected] of [
    ["  +123tail", 123],
    ["-1", 0xffffffff],
    ["999999999999999999999999", 0xffffffff],
  ] as const)
    withXmlBytes(
      new TextEncoder().encode(input),
      /** Actual terminated numeric bytes. @param pointer - Native text. @returns Nothing. */ (
        pointer,
      ) => expect(m._strtoul(pointer, 0, 10) >>> 0).toBe(expected),
    );
});
it("preserves the source huge-attribute option across actual incremental reads", /** A real value larger than the original libxml2 default10MB limit is admitted through the authorized source flags. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl());
  parser.parseStream(source('<a value="' + "x".repeat(10 * 1024 * 1024 + 32) + '"/>'));
});
it("captures actual consumer failure after C parsing and throws the original saved exception", /** Real Writer/output connection lifecycle reaches source saved-exception polling. @returns Nothing. */ () => {
  const f = fixture();
  f.stream.operatorStar().closeOutput();
  let caught = false;
  try {
    f.parser.parseStream(source('<a value="' + "x".repeat(32768) + '"/>'));
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    try {
      caught = true;
      expect(error.WrappedException.hasValue()).toBe(true);
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
});
it("reports an actual malformed later chunk through the native parse status branch", /** The first source16KiB chunk is valid; a later closing mismatch fails without an injected status. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl());
  let caught = false;
  try {
    parser.parseStream(source("<a>" + "x".repeat(32768) + "</b>"));
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
});
it("cleans up an actual input exception before any native context exists", /** Source input remains a real but caller-closed stream; no throwing provider is manufactured. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl()),
    input = source("<a/>");
  input.aInputStream.operatorStar().closeInput();
  let caught = false;
  try {
    parser.parseStream(input);
  } catch (error) {
    if (!(error instanceof NotConnectedException)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
  parser.parseStream(source("<a/>"));
});
it("preserves the source Unicode custom-name/ASCII comparison mismatch", /** The public string API accepts a Greek entity name, but original compareToAscii compares its UTF8 bytes without decoding. @returns Nothing. */ () => {
  const parser = own(new FastSaxParserImpl());
  parser.setCustomEntityNames(pairs([["Ω", "value"]]));
  let caught = false;
  try {
    parser.parseStream(source("<a>&Ω;</a>"));
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
});
