/** @fileoverview Actual original native FastParser converted-input loop, source options, custom entity callback and cleanup connected to real registered Writer/token/streams; source complete UNO wrapper/QA remain separate. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { defaultBootstrap_InitialComponentContext } from "../../../cppuhelper/source/defaultbootstrap";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { FastParser } from "../../../offapi/com/sun/star/xml/sax/FastParser";
import { XInitialization } from "../../../udkapi/com/sun/star/lang/XInitialization";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XFastParser } from "../../../offapi/com/sun/star/xml/sax/XFastParser";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { CallbackDocumentHandler, NamespaceHandler } from "./legacyfastparser.handlers";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { FastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/FastTokenHandler";
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
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
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
    parserReference = own(FastParser.create(context)),
    parser = parserReference.operatorStar();
  writer.operatorStar().setOutputStream(stream);
  parser.setFastDocumentHandler(own(new Reference(adapter.get())));
  parser.setTokenHandler(tokens);
  parser.setNamespaceHandler(own(new Reference(namespaces.get())));
  return { parser, parserReference, bytes, stream, context };
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
const Args = Sequence.specialize<Any>("Any", 24);
/** Actual native initializer arguments. @param values - Native Any values. @returns Owned sequence. */
function args(values: Any[]) {
  return own(
    new Args(
      {
        /** Native Any lvalue. @param offset - Byte offset. @returns Native value. */ get: (
          offset: number,
        ) => values[offset / 24],
      },
      values.length,
    ),
  );
}
/** Verifies and releases the original exception value. @param action - Actual API operation. @returns Nothing. */
function illegal(action: () => void): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof IllegalArgumentException)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
}
it("creates the actual registered parser with all declared interfaces and service identity", /** Exercises actual public source service behavior. @returns Nothing. */ () => {
  const f = fixture(),
    info = own(
      new Reference<XServiceInfo>(f.parserReference, UNO_QUERY_THROW, XServiceInfo.static_type),
    ).operatorStar();
  expect(text(own(info.getImplementationName()))).toBe(
    "com.sun.star.comp.extensions.xml.sax.FastParser",
  );
  expect(info.supportsService(u("com.sun.star.xml.sax.FastParser"))).toBe(true);
  expect(info.supportsService(u("com.sun.star.xml.sax.Parser"))).toBe(false);
  const names = own(info.getSupportedServiceNames());
  expect(names.getLength()).toBe(1);
  expect(
    own(
      new Reference<XFastParser>(f.parserReference, UNO_QUERY_THROW, XFastParser.static_type),
    ).get(),
  ).toBe(f.parser);
  f.parser.setErrorHandler(own(new Reference()));
  f.parser.setEntityResolver(own(new Reference()));
  f.parser.setLocale(own(new Locale()));
  f.parser.registerNamespace(u("urn:source"), 0x10000);
  f.parser.setCustomEntityNames(pairs([["face", "😀"]]));
  f.parser.parseStream(source('<root xmlns:p="urn:source"><p:node>&face;</p:node></root>'));
  expect(output(f.bytes)).toContain("😀");
});
it("preserves original option trimming, accepted no-op, unknown rejection and sticky initialization", /** Exercises actual public source service behavior. @returns Nothing. */ () => {
  const f = fixture(),
    init = own(
      new Reference<XInitialization>(
        f.parserReference,
        UNO_QUERY_THROW,
        XInitialization.static_type,
      ),
    ).operatorStar();
  init.initialize(args([]));
  init.initialize(
    args([
      own(new Any(u(" , DoSmeplease, DisableThreadedParser, , ").getDataAddress(), "OUString")),
    ]),
  );
  illegal(
    /** Calls actual initialization with the original invalid argument. @returns Nothing. */ () =>
      init.initialize(args([own(new Any())])),
  );
  illegal(
    /** Calls actual initialization with the original invalid argument. @returns Nothing. */ () =>
      init.initialize(args([own(new Any(u("unknown").getDataAddress(), "OUString"))])),
  );
  illegal(
    /** Calls actual initialization with the original invalid argument. @returns Nothing. */ () =>
      init.initialize(
        args([own(new Any(u("IgnoreMissingNSDecl,unknown").getDataAddress(), "OUString"))]),
      ),
  );
  // Source applies earlier flags before an unknown later option throws.
  init.initialize(args([own(new Any(u("").getDataAddress(), "OUString")), own(new Any())]));
  f.parser.parseStream(source("<p:root />"));
  expect(output(f.bytes)).toContain("<p:root/>");
});
it("propagates actual malformed-stream exceptions through the public service and remains reusable", /** Exercises actual public source service behavior. @returns Nothing. */ () => {
  const f = fixture();
  let caught = false;
  try {
    f.parser.parseStream(source("<a>\n</b>"));
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    expect(text(error.SystemId)).toBe("pkg:/字.xml");
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
  f.parser.setFastDocumentHandler(own(new Reference()));
  f.parser.parseStream(source("<a>...<b />..</a>"));
});

it("preserves source short-prefix loss with MemoryInputStream rather than claiming original Pipe QA", /** Exercises actual public source service behavior. @returns Nothing. */ () => {
  const f = fixture();
  f.parser.parseStream(source("<b></a>"));
  expect(output(f.bytes)).toBe('<?xml version="1.0" encoding="UTF-8"?>\n');
});

it("reports actual missing service from an empty native bootstrap context", /** Exercises actual public source service behavior. @returns Nothing. */ () => {
  const context = own(defaultBootstrap_InitialComponentContext([]));
  let caught = false;
  try {
    own(FastParser.create(context));
  } catch (error) {
    if (!(error instanceof DeploymentException)) throw error;
    expect(error.Context.get()).toBe(context.get());
    expect(text(error.Message)).toContain("com.sun.star.xml.sax.FastParser");
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
});
