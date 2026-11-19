/** @fileoverview Actual registered LegacyFastParser initialization, native Pair and stream routes through the original adapter and real Writer; full Expat differential QA remains separate. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { XParser } from "../../../offapi/com/sun/star/xml/sax/XParser";
import { XInitialization } from "../../../udkapi/com/sun/star/lang/XInitialization";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XFastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/XFastTokenHandler";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { FastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/FastTokenHandler";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { SAXParseException } from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PairStringLong,
  cppu_detail_getUnoType_PairStringLong,
} from "../../../udkapi/com/sun/star/beans/Pair";
import {
  MemoryInputStream,
  OSequenceOutputStream,
} from "../../../comphelper/source/streaming/seqstream";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
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
    manager = own(context.operatorStar().getServiceManager()),
    created = own(
      manager
        .operatorStar()
        .createInstanceWithContext(u("com.sun.star.xml.sax.LegacyFastParser"), context),
    ),
    parserReference = own(new Reference<XParser>(created, UNO_QUERY_THROW, XParser.static_type)),
    parser = parserReference.operatorStar(),
    init = own(
      new Reference<XInitialization>(parserReference, UNO_QUERY_THROW, XInitialization.static_type),
    ).operatorStar();
  writer.operatorStar().setOutputStream(stream);
  parser.setDocumentHandler(document);
  return { parser, parserReference, init, bytes, stream, context };
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
const Args = Sequence.specialize<Any>("Any", 24);
/** Native initializer sequence. @param values - Actual native Any values. @returns Sequence owner. */
function args(values: Any[]) {
  return own(
    new Args(
      {
        /** Native cell address. @param offset - Byte offset. @returns Native value. */ get: (
          offset: number,
        ) => values[offset / 24],
      },
      values.length,
    ),
  );
}
/** Actual native string Any. @param value - Literal fixture. @returns Owned Any. */
function string(value: string): Any {
  return own(new Any(u(value).getDataAddress(), "OUString"));
}
/** Native namespace Pair Any. @param uri - Actual URI. @param token - Native namespace token. @returns Owned Any. */
function pair(uri: string, token: number): Any {
  return own(
    new Any(own(new PairStringLong(u(uri), token)), cppu_detail_getUnoType_PairStringLong),
  );
}
/** Verifies and releases genuine UNO exception. @param action - Public API call. @returns Nothing. */
function illegal(action: () => void): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof IllegalArgumentException)) throw error;
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
}
it("creates original ordered facets and forwards real unknown SAX events to Writer", /** Uses only the actual registered source services. @returns Nothing. */ () => {
  const f = fixture(),
    info = own(
      new Reference<XServiceInfo>(f.parserReference, UNO_QUERY_THROW, XServiceInfo.static_type),
    ).operatorStar();
  expect(text(own(info.getImplementationName()))).toBe(
    "com.sun.star.comp.extensions.xml.sax.LegacyFastParser",
  );
  expect(info.supportsService(u("com.sun.star.xml.sax.LegacyFastParser"))).toBe(true);
  expect(info.supportsService(u("com.sun.star.xml.sax.Parser"))).toBe(false);
  expect(own(info.getSupportedServiceNames()).getLength()).toBe(1);
  f.init.initialize(args([]));
  f.parser.setErrorHandler(own(new Reference()));
  f.parser.setDTDHandler(own(new Reference()));
  f.parser.setEntityResolver(own(new Reference()));
  f.parser.setLocale(own(new Locale()));
  f.parser.parseStream(
    source('<zz xmlns:p="urn:unregistered" p:attr="字"><p:child>😀&amp;</p:child></zz>'),
  );
  expect(output(f.bytes)).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<zz xmlns:p="urn:unregistered" p:attr="字"><p:child>😀&amp;</p:child></zz>',
  );
});
it("dispatches actual native token and namespace initialization with copied Pair ownership", /** Native Any/query, Pair fields and actual OOX token provider are used. @returns Nothing. */ () => {
  const f = fixture(),
    tokens = own(FastTokenHandler.create(f.context));
  f.init.initialize(
    args([own(new Any(tokens.getAddress(), ["Reference", XFastTokenHandler.static_type]))]),
  );
  const registration = args([string("registerNamespaces"), pair("urn:probe", 0x10000)]);
  f.init.initialize(registration);
  registration.realloc(0);
  f.parser.parseStream(source('<p:root xmlns:p="urn:probe">字</p:root>'));
  expect(output(f.bytes)).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n<root xmlns:p="urn:probe">字</root>',
  );
  illegal(
    /** Duplicate original URI is rejected. @returns Nothing. */ () =>
      f.init.initialize(args([string("registerNamespaces"), pair("urn:probe", 0x20000)])),
  );
});
it("delegates original string options and rejects actual invalid first arguments", /** No private parser flag is inspected or patched. @returns Nothing. */ () => {
  const f = fixture();
  f.init.initialize(args([string("IgnoreMissingNSDecl")]));
  illegal(
    /** Original invalid option. @returns Nothing. */ () =>
      f.init.initialize(args([string("unknown")])),
  );
  illegal(
    /** Original non-string/token Any. @returns Nothing. */ () =>
      f.init.initialize(args([own(new Any())])),
  );
  illegal(
    /** Original null token reference falls through to invalid FastParser initialization. @returns Nothing. */ () =>
      f.init.initialize(args([own(new Any([null], ["Reference", XFastTokenHandler.static_type]))])),
  );
  f.parser.parseStream(source("<p:unknown />"));
  expect(output(f.bytes)).toContain("<p:unknown/>");
});
it("preserves unchecked Pair extraction and prior namespace mutations on failure", /** A genuine incompatible Any leaves the previous initialized Pair intact. @returns Nothing. */ () => {
  const f = fixture();
  illegal(
    /** Default zero Pair reaches original minimum-token check. @returns Nothing. */ () =>
      f.init.initialize(args([string("registerNamespaces"), own(new Any())])),
  );
  illegal(
    /** Failed second extraction repeats the preceding URI, producing a real duplicate error. @returns Nothing. */ () =>
      f.init.initialize(
        args([string("registerNamespaces"), pair("urn:retained", 0x10000), own(new Any())]),
      ),
  );
  illegal(
    /** Earlier namespace registration is not rolled back. @returns Nothing. */ () =>
      f.init.initialize(args([string("registerNamespaces"), pair("urn:retained", 0x20000)])),
  );
});
it("propagates actual malformed input and constructs a new adapter for the next parse", /** Real XML errors and same service reuse are observed. @returns Nothing. */ () => {
  const f = fixture();
  let caught = false;
  try {
    f.parser.parseStream(source("<zz>\n</bad>"));
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
  f.parser.setDocumentHandler(own(new Reference()));
  f.parser.parseStream(source("<zz>valid</zz>"));
});

it("uses the original cached process context after process factory replacement", /** Source successful-once context cache is not reset or privately patched. @returns Nothing. */ () => {
  const context = getProcessComponentContext();
  InitApplicationServiceManager(
    implementations.filter(
      /** Selects actual source component. @param implementation - Registration. @returns Legacy-only selection. */ (
        implementation,
      ) => implementation.name === "com.sun.star.comp.extensions.xml.sax.LegacyFastParser",
    ),
  );
  try {
    expect(getProcessComponentContext().get()).toBe(context.get());
    const manager = own(context.operatorStar().getServiceManager()),
      created = own(
        manager
          .operatorStar()
          .createInstanceWithContext(u("com.sun.star.xml.sax.LegacyFastParser"), context),
      );
    expect(own(new Reference<XParser>(created, UNO_QUERY_THROW, XParser.static_type)).is()).toBe(
      true,
    );
  } finally {
    InitApplicationServiceManager(implementations);
  }
});
