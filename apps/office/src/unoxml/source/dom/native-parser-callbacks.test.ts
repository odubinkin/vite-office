/** @fileoverview Actual C SAX callback ABI, original domtest.cxx XML inputs and native resolver stream ownership. This qualifies parser wiring without substituting or claiming the pending DocumentBuilder/UCB service. */
import { afterEach, assert, expect, it } from "vitest";
import { XML_PARSE_DTDLOAD } from "@vite-office/libxml2-wasm/constants";
import { getLibXml2, initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { installParserCallbacks } from "../../../external/libxml2/parsercallbacks";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { SequenceInputStream } from "../../../comphelper/source/streaming/seqstream";
import { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";
import { XEntityResolver } from "../../../offapi/com/sun/star/xml/sax/XEntityResolver";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import {
  SAXParseException,
  cppu_detail_getUnoType,
} from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  validTestFile,
  warningTestFile,
  errorTestFile,
} from "../../../test/native-builder-fixtures";
import { api, own, read, releaseDomScope, u } from "../../../test/native-dom";
import { context_t, nativeIoContext } from "./documentbuilder.io";
import { reportParserError, throwEx } from "./documentbuilder.errors";
import { resolve_func } from "./documentbuilder.resolve";
import { CDocument } from "./document";
import { CNode, xmlString } from "./node";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
afterEach(releaseDomScope);

/** Complete genuine handler component; observes only actual public Any payloads. */
class Handler extends WeakImplHelper.specialize(XErrorHandler) implements XErrorHandler {
  readonly events: { warning: boolean; exception: SAXParseException }[] = [];
  action: (() => void) | undefined;
  /** Copies the actual callback value using existing UNO data operations. @param warning - Original callback category. @param value - Borrowed actual Any. @returns Nothing. */
  private receive(warning: boolean, value: Readonly<Any>): void {
    const exception = own(new SAXParseException());
    expect(value.extract(exception, cppu_detail_getUnoType)).toBe(true);
    this.events.push({ warning, exception });
    this.action?.();
  }
  /** Original error surface. @param value - Actual payload. @returns Nothing. */
  error(value: Readonly<Any>): void {
    this.receive(false, value);
  }
  /** Original warning surface. @param value - Actual payload. @returns Nothing. */
  warning(value: Readonly<Any>): void {
    this.receive(true, value);
  }
  /** Original full fatal-error surface. @param value - Actual payload. @returns Nothing. */
  fatalError(value: Readonly<Any>): void {
    this.receive(false, value);
  }
}
/** Actual upstream SequenceInputStream with an external close witness that outlives logical component destruction. */
class Input extends SequenceInputStream {
  /** Original data ownership, with a test-only observation. @param data - Actual byte Sequence. @param witness - External observer. @returns Actual stream. */
  constructor(
    data: Sequence<number>,
    private readonly witness: { closes: number },
  ) {
    super(data);
  }
  /** Observes the genuine source close call. @returns Nothing. */
  override closeInput(): void {
    ++this.witness.closes;
    super.closeInput();
  }
}
/** Materializes the original UTF8 fixture as an actual SequenceInputStream. @param xml - Exact fixture text. @param witness - External close witness. @returns Acquired stream. */
function stream(xml: string, witness: { closes: number }): Reference<Input> {
  const bytes = new TextEncoder().encode(xml),
    data = new Bytes(bytes.length),
    cells = data.getArray() as SequenceElements;
  try {
    for (let i = 0; i < bytes.length; ++i)
      (cells.get(i) as [number])[0] = ((bytes[i] as number) << 24) >> 24;
    return new Reference(new Input(data, witness));
  } finally {
    data.dispose();
  }
}
/** Runs real xmlCtxtReadIO with the actual callback bodies and native document factory, not an alternate builder. Default options remain the source zero; the explicit DTDLOAD case separately qualifies the resolver ABI. @param xml - Fixture bytes. @param handler - Actual handler. @param resolver - Actual resolver or empty source field. @param options - Explicit native qualification options. @returns Actual native document and borrowed-stream close witness. */
async function parseFixture(
  xml: string,
  handler: Reference<XErrorHandler>,
  resolver: Reference<XEntityResolver>,
  options = 0,
): Promise<{ document: Reference<CDocument>; witness: { closes: number } }> {
  await initializeLibXml2();
  return parseInitialized(xml, handler, resolver, options);
}
/** Runs the synchronous source parser path after bootstrap, including from a native callback. @param xml - Exact XML. @param handler - Actual handler. @param resolver - Actual resolver. @param options - Native options. @returns Actual document and input witness. */
function parseInitialized(
  xml: string,
  handler: Reference<XErrorHandler>,
  resolver: Reference<XEntityResolver>,
  options = 0,
): { document: Reference<CDocument>; witness: { closes: number } } {
  const m = getLibXml2(),
    context = m._xmlNewParserCtxt(),
    witness = { closes: 0 },
    input = own(stream(xml, witness)),
    io = new context_t();
  io.rInputStream.assign(input);
  io.close = false;
  io.freeOnClose = false;
  const native = nativeIoContext(io),
    callbacks = installParserCallbacks(context, {
      /** Actual source error body receives the original parser address. @param parser - Native context. @returns Nothing. */
      error(parser) {
        const acquired = new Reference(handler);
        try {
          reportParserError(parser, acquired, false);
        } finally {
          acquired.dispose();
        }
      },
      /** Actual source warning body receives the original parser address. @param parser - Native context. @returns Nothing. */
      warning(parser) {
        const acquired = new Reference(handler);
        try {
          reportParserError(parser, acquired, true);
        } finally {
          acquired.dispose();
        }
      },
      /** Actual source resolver uses the acquired user component. @param parser - Native context. @param publicId - Native ID. @param systemId - Native ID. @returns Native parser input. */
      resolveEntity(parser, publicId, systemId) {
        const acquired = new Reference(resolver);
        try {
          return resolve_func(parser, publicId, systemId, acquired);
        } finally {
          acquired.dispose();
        }
      },
    });
  try {
    const pointer = m._xmlCtxtReadIO(
      context,
      native.read,
      native.close,
      native.address,
      0,
      0,
      options,
    );
    if (!pointer) throwEx(context);
    return { document: own(CDocument.CreateCDocument(pointer)), witness };
  } finally {
    m._xmlFreeParserCtxt(context);
    callbacks.dispose();
    io.dispose();
  }
}

it("routes the original valid and warning XML fixtures through actual C SAX callbacks", /** Original XML bytes and warning/error assertions are retained; the service fixture remains pending. @returns Async completion. */ async () => {
  const ref = own(new Reference<XErrorHandler>(new Handler())),
    handler = api(ref) as Handler,
    resolver = own(new Reference<XEntityResolver>());
  const valid = await parseFixture(validTestFile, ref, resolver);
  expect(read(api(own(api(valid.document).getDocumentElement())).getNodeName())).toBe(
    "document-content",
  );
  expect(handler.events).toHaveLength(0);
  expect(valid.witness.closes).toBe(0);
  const warning = await parseFixture(warningTestFile, ref, resolver);
  expect(own(api(warning.document).getDocumentElement()).is()).toBe(true);
  expect(handler.events.length).toBeGreaterThan(0);
  expect(
    handler.events.every(
      /** Original warning-only result. @param event - Actual notification. @returns Warning flag. */ (
        event,
      ) => event.warning,
    ),
  ).toBe(true);
  expect(warning.witness.closes).toBe(0);
});

it("routes the original error fixture and throws the actual generated parse exception", /** Only real source exception fields are observed. @returns Async completion. */ async () => {
  const ref = own(new Reference<XErrorHandler>(new Handler())),
    handler = api(ref) as Handler;
  let caught = false;
  try {
    await parseFixture(errorTestFile, ref, own(new Reference<XEntityResolver>()));
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    try {
      caught = true;
      expect(error.LineNumber).toBe(1);
      expect(error.ColumnNumber).toBeGreaterThan(0);
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
  expect(handler.events.length).toBeGreaterThan(0);
  expect(
    handler.events.some(
      /** Original error result, not a warning. @param event - Actual notification. @returns Error category. */ (
        event,
      ) => !event.warning,
    ),
  ).toBe(true);
});

/** Complete user resolver component on the original XEntityResolver extension point, backed by actual SequenceInputStream/InputSource owners. */
class Resolver extends WeakImplHelper.specialize(XEntityResolver) implements XEntityResolver {
  readonly witness = { closes: 0 };
  readonly requests: { publicId: string; systemId: string }[] = [];
  weak: WeakReferenceHelper | undefined;
  /** Returns a genuine external DTD stream, preserving ownership of all returned members. @param publicId - Borrowed public ID. @param systemId - Borrowed system ID. @returns Owned actual InputSource. */
  resolveEntity(publicId: OUStringConstReference, systemId: OUStringConstReference): InputSource {
    this.requests.push({ publicId: text(publicId), systemId: text(systemId) });
    const input = stream('<!ELEMENT root (#PCDATA)><!ENTITY value "external 字">', this.witness),
      result = new InputSource();
    try {
      this.weak = own(new WeakReferenceHelper(input));
      result.aInputStream = input;
      result.sPublicId = publicId;
      result.sSystemId = systemId;
      result.sEncoding = u("UTF-16");
      return result;
    } finally {
      input.dispose();
    }
  }
}

it.each([true, false])(
  "uses real resolver streams and closes/releases them once through native IO callbacks, public=%s",
  /** Explicit raw-library DTDLOAD qualifies the resolver ABI without changing builder's zero-option default. @param hasPublic - Original public versus system-only declaration. @returns Async completion. */ async (
    hasPublic,
  ) => {
    const resolver = own(new Reference<XEntityResolver>(new Resolver())),
      actual = api(resolver) as Resolver,
      handler = own(new Reference<XErrorHandler>(new Handler()));
    const result = await parseFixture(
        hasPublic
          ? '<!DOCTYPE root PUBLIC "public-token" "local.dtd"><root>&value;</root>'
          : '<!DOCTYPE root SYSTEM "local.dtd"><root>&value;</root>',
        handler,
        resolver,
        XML_PARSE_DTDLOAD,
      ),
      root = api(own(api(result.document).getDocumentElement()));
    expect(actual.requests).toEqual([
      { publicId: hasPublic ? "public-token" : "", systemId: "local.dtd" },
    ]);
    expect(actual.witness.closes).toBe(1);
    const acquired = actual.weak?.get();
    try {
      expect(acquired?.is()).toBe(false);
    } finally {
      acquired?.dispose();
    }
    assert(root instanceof CNode);
    const m = await initializeLibXml2(),
      content = m._xmlNodeGetContent(root.GetNodePtr());
    try {
      expect(read(xmlString(content))).toBe("external 字");
    } finally {
      m._office_xmlFree(content);
    }
    expect(result.witness.closes).toBe(0);
  },
);

it("contains genuine UNO handler exceptions across the native callback boundary", /** Source warnings remain recoverable after a user handler failure. @returns Async completion. */ async () => {
  const ref = own(new Reference<XErrorHandler>(new Handler())),
    handler = api(ref) as Handler;
  handler.action = /** Actual UNO callback exception. @returns Never. */ () => {
    throw new RuntimeException();
  };
  const result = await parseFixture(warningTestFile, ref, own(new Reference<XEntityResolver>()));
  expect(own(api(result.document).getDocumentElement()).is()).toBe(true);
  expect(handler.events.length).toBeGreaterThan(0);
});

it("keeps separate native callback contexts during nested parsing", /** A warning handler reenters the actual native parser without replacing another context's callbacks. @returns Async completion. */ async () => {
  const outer = own(new Reference<XErrorHandler>(new Handler())),
    inner = own(new Reference<XErrorHandler>(new Handler())),
    resolver = own(new Reference<XEntityResolver>()),
    outerHandler = api(outer) as Handler,
    innerHandler = api(inner) as Handler;
  outerHandler.action =
    /** Runs actual nested parse synchronously within C's warning callback. @returns Nothing. */ () => {
      let caught = false;
      try {
        parseInitialized(errorTestFile, inner, resolver);
      } catch (error) {
        if (!(error instanceof SAXParseException)) throw error;
        caught = true;
        error.dispose();
      }
      expect(caught).toBe(true);
    };
  const result = await parseFixture(warningTestFile, outer, resolver);
  expect(own(api(result.document).getDocumentElement()).is()).toBe(true);
  expect(
    outerHandler.events.every(
      /** Outer callbacks remain warnings. @param event - Actual callback. @returns Original category. */ (
        event,
      ) => event.warning,
    ),
  ).toBe(true);
  expect(
    innerHandler.events.some(
      /** Inner callbacks remain errors. @param event - Actual callback. @returns Original category. */ (
        event,
      ) => !event.warning,
    ),
  ).toBe(true);
});
