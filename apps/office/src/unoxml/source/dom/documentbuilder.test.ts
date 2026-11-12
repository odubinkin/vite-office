/** @fileoverview Original domtest builder stream QA through the real registered DocumentBuilder, native libxml2 and genuine stream/handler owners. URI provider-dependent source assertions remain unqualified. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { CDocumentBuilder } from "./documentbuilder";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XDocumentBuilder } from "../../../offapi/com/sun/star/xml/dom/XDocumentBuilder";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  SAXParseException,
  cppu_detail_getUnoType as parseType,
} from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import {
  validTestFile,
  warningTestFile,
  errorTestFile,
} from "../../../test/native-builder-fixtures";
import { own, api, u, read, releaseDomScope, expectRuntime } from "../../../test/native-dom";
beforeAll(
  /** Initializes the actual platform and production registry. @returns Async completion. */ async () => {
    await initializeLibXml2();
    InitApplicationServiceManager(implementations);
  },
);
afterEach(releaseDomScope);
/** Real MemoryInputStream with observable source close ownership. */
class Input extends MemoryInputStream {
  closes = 0;
  /** Actual copied source bytes. @param value - XML fixture. @returns Stream. */ constructor(
    value: string,
  ) {
    const bytes = new Uint8Array(new TextEncoder().encode(value));
    super(bytes, bytes.length);
  }
  /** Observes actual close. @returns Nothing. */ override closeInput(): void {
    ++this.closes;
    super.closeInput();
  }
}
/** Application-owned public error observer, receiving real typed SAX Any values. */
class Observer extends WeakImplHelper.specialize(XErrorHandler) implements XErrorHandler {
  warnings = 0;
  errors = 0;
  /** Optional action may change builder state reentrantly. @param action - Actual callback. @returns Observer. */ constructor(
    private readonly action?: () => void,
  ) {
    super();
  }
  /** Original warning callback. @param value - Typed exception Any. @returns Nothing. */ warning(
    value: Readonly<Any>,
  ): void {
    ++this.warnings;
    this.observe(value);
  }
  /** Original error callback. @param value - Typed exception Any. @returns Nothing. */ error(
    value: Readonly<Any>,
  ): void {
    ++this.errors;
    this.observe(value);
  }
  /** Original full interface facet. @param value - Typed exception Any. @returns Nothing. */ fatalError(
    value: Readonly<Any>,
  ): void {
    this.error(value);
  }
  /** Observes native fields independently of parser lifetime. @param value - Actual Any. @returns Nothing. */ private observe(
    value: Readonly<Any>,
  ): void {
    const error = new SAXParseException();
    try {
      expect(value.extract(error, parseType)).toBe(true);
      expect(error.LineNumber).toBeGreaterThan(0);
      expect(error.ColumnNumber).toBeGreaterThan(0);
    } finally {
      error.dispose();
    }
    this.action?.();
  }
}
it("ports provider-independent testXDocumentBuilder assertions through the production service manager", /** Source URI/file-access assertions require the real pending provider. @returns Nothing. */ () => {
  const context = getProcessComponentContext() as Reference<XComponentContext>,
    manager = own(context.operatorStar().getServiceManager()),
    root = own(
      manager
        .operatorStar()
        .createInstanceWithContext(u("com.sun.star.xml.dom.DocumentBuilder"), context),
    ),
    builder = own(
      new Reference<XDocumentBuilder>(root, UNO_QUERY_THROW, XDocumentBuilder.static_type),
    ),
    info = own(new Reference<XServiceInfo>(root, UNO_QUERY_THROW, XServiceInfo.static_type));
  expect(root.get()).toBeInstanceOf(CDocumentBuilder);
  expect(api(builder).isNamespaceAware()).toBe(true);
  expect(api(builder).isValidating()).toBe(false);
  expect(own(api(builder).getDOMImplementation()).is()).toBe(false);
  expect(own(api(builder).newDocument()).is()).toBe(true);
  expect(read(api(info).getImplementationName())).toBe("com.sun.star.comp.xml.dom.DocumentBuilder");
  expect(api(info).supportsService(u("com.sun.star.xml.dom.DocumentBuilder"))).toBe(true);
  expect(api(info).supportsService(u("other"))).toBe(false);
  expectRuntime(
    /** Original parse(nullptr). @returns Document or exception. */ () =>
      api(builder).parse(own(new Reference())),
  );
  const input = own(new Reference(new Input(validTestFile)));
  expect(own(api(builder).parse(input)).is()).toBe(true);
  expect(api(input).closes).toBe(0);
  const actual = root.get() as CDocumentBuilder,
    resolver = own(actual.getEntityResolver());
  expect(resolver.is()).toBe(true);
  api(builder).setEntityResolver(own(new Reference()));
  api(builder).setErrorHandler(own(new Reference()));
  expect(own(actual.getEntityResolver()).is()).toBe(false);
  expect(own(actual.getErrorHandler()).is()).toBe(false);
});
it.each([
  ["validInputTest", validTestFile, false, false],
  ["warningInputTest", warningTestFile, true, false],
  ["errorInputTest", errorTestFile, false, true],
] as const)(
  "ports original domtest %s",
  /** Uses unchanged source fixture byte content and actual native parser diagnostics. @param label - Original QA method. @param xml - Original XML. @param warning - Expected warnings. @param failure - Expected parse error. @returns Nothing. */ (
    label,
    xml,
    warning,
    failure,
  ) => {
    void label;
    const builder = own(new Reference(new CDocumentBuilder())),
      observer = own(new Reference(new Observer())),
      input = own(new Reference(new Input(xml)));
    api(builder).setErrorHandler(observer);
    try {
      const document = own(api(builder).parse(input));
      expect(document.is()).toBe(true);
      expect(failure).toBe(false);
    } catch (error) {
      expect(failure).toBe(true);
      expect(error).toBeInstanceOf(SAXParseException);
      own(error as SAXParseException);
    }
    expect(Boolean(api(observer).warnings)).toBe(warning);
    expect(Boolean(api(observer).errors)).toBe(failure);
    expect(api(input).closes).toBe(0);
  },
);
it("reads the current handler on every callback and contains UNO callback failures", /** The first actual warning replaces its handler before the second native warning. @returns Nothing. */ () => {
  const builder = own(new Reference(new CDocumentBuilder())),
    second = own(new Reference(new Observer())),
    first = own(
      new Reference(
        new Observer(
          /** Reentrant handler replacement. @returns Never. */ () => {
            api(builder).setErrorHandler(second);
            throw new RuntimeException();
          },
        ),
      ),
    );
  api(builder).setErrorHandler(first);
  const input = own(
    new Reference(new Input('<root><a xml:space="invalid"/><b xml:space="invalid"/></root>')),
  );
  expect(own(api(builder).parse(input)).is()).toBe(true);
  expect(api(first).warnings).toBe(1);
  expect(api(second).warnings).toBe(1);
});
it("preserves default resolver identifiers and source empty-stream result when the real broker is unavailable", /** No broker/provider is substituted. @returns Nothing. */ () => {
  const builder = own(new Reference(new CDocumentBuilder())),
    resolver = own(api(builder).getEntityResolver()),
    source = own(api(resolver).resolveEntity(u("public"), u("file:///missing-entity.xml")));
  expect(source.sPublicId.equals(u("public"))).toBe(true);
  expect(source.sSystemId.equals(u("file:///missing-entity.xml"))).toBe(true);
  expect(source.sEncoding.isEmpty()).toBe(true);
  expect(source.aInputStream.is()).toBe(false);
});
