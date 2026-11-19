/** @fileoverview Registered Parser service tests for the original namespace and encoding fixtures and OOXML diagnostics. */
import { afterEach, expect, it } from "vitest";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { ReadRelationsInfoSequence } from "../../../comphelper/source/xml/ofopxmlhelper";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { Parser } from "../../../offapi/com/sun/star/xml/sax/Parser";
import { SAXParseException } from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import type { XAttributeList } from "../../../offapi/com/sun/star/xml/sax/XAttributeList";
import { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";
import { XExtendedDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XExtendedDocumentHandler";
import type { XDTDHandler } from "../../../offapi/com/sun/star/xml/sax/XDTDHandler";
import type { XEntityResolver } from "../../../offapi/com/sun/star/xml/sax/XEntityResolver";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { own, read, releaseDomScope, u } from "../../../test/native-dom";
import { inputFromBytes } from "../../../test/oox-input";
import { nativeText } from "../../../test/ofopxml-values";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { SaxExpatParser } from "./sax_expat";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";

afterEach(releaseDomScope);

/** Collects observable events from the registered SAX service. */
class DocumentHandler
  extends WeakImplHelper.specialize(XExtendedDocumentHandler)
  implements XExtendedDocumentHandler
{
  readonly elementNames: string[] = [];
  readonly attributeNames: string[] = [];
  contents = "";
  whitespace = "";
  systemId = "";
  ended = false;
  events: string[] = [];
  readonly locator = new Reference<XLocator>();

  /** Resets per-document observations. @returns Nothing. */
  startDocument(): void {
    this.ended = false;
  }

  /** Marks successful parsing. @returns Nothing. */
  endDocument(): void {
    this.ended = true;
  }

  /** Records raw names delivered by the parser. @param name - Element name. @param attributes - Current attributes. @returns Nothing. */
  startElement(name: OUStringConstReference, attributes: Reference<XAttributeList>): void {
    this.elementNames.push(nativeText(name));
    const list = attributes.operatorStar();
    for (let i = 0; i < list.getLength(); i++)
      this.attributeNames.push(read(list.getNameByIndex(i)));
  }

  /** Receives a closing event. @returns Nothing. */
  endElement(): void {}

  /** Collects text independent of SAX chunking. @param text - Current text. @returns Nothing. */
  characters(text: OUStringConstReference): void {
    this.contents += nativeText(text);
  }

  /** Collects separately classified whitespace. @param text - Current whitespace. @returns Nothing. */
  ignorableWhitespace(text: OUStringConstReference): void {
    this.whitespace += nativeText(text);
  }

  /** Records a processing instruction. @param target - Target. @param data - Data. @returns Nothing. */
  processingInstruction(target: OUStringConstReference, data: OUStringConstReference): void {
    this.events.push(nativeText(target) + " " + nativeText(data));
  }

  /** Records CDATA start. @returns Nothing. */
  startCDATA(): void {
    this.events.push("CDATA start");
  }

  /** Records CDATA end. @returns Nothing. */
  endCDATA(): void {
    this.events.push("CDATA end");
  }

  /** Records a comment. @param text - Comment text. @returns Nothing. */
  comment(text: OUStringConstReference): void {
    this.events.push(nativeText(text));
  }

  /** Receives backend-specific data. @returns Nothing. */
  unknown(): void {}

  /** Receives an optional line-break hint. @returns Nothing. */
  allowLineBreak(): void {}

  /** Captures the active stream identifier. @param locator - Parser-owned locator. @returns Nothing. */
  setDocumentLocator(locator: Reference<XLocator>): void {
    this.systemId = read(locator.operatorStar().getSystemId());
    this.locator.assign(locator);
    expect(locator.operatorStar().getLineNumber()).toBe(1);
    expect(locator.operatorStar().getColumnNumber()).toBe(0);
  }

  /** Releases the retained document locator. @returns Nothing. */
  protected override destroy(): void {
    this.locator.dispose();
    super.destroy();
  }
}

const namespaceDocument = [
  "<!-- all elements here are explicitly in the HTML namespace -->\n",
  "<html:html xmlns:html='http://www.w3.org/TR/REC-html40'>\n",
  "<html:head><html:title>Frobnostication</html:title></html:head>\n",
  "<html:body><html:p>Moved to \n",
  "<html:a href='http://frob.com'>here.</html:a></html:p></html:body>\n",
  "</html:html>\n",
].join("");

/** Creates a fixture document over an actual native input source. @param bytes - Original fixture bytes. @returns Test-scoped source. */
function source(bytes: Uint8Array): InputSource {
  const input = own(new InputSource());
  input.aInputStream = own(inputFromBytes(bytes));
  input.sSystemId = u("internal");
  return input;
}

it("ports OSaxParserTest namespace and ISO-8859-1 input using the registered service", /** Replays the namespace and Latin-1 byte fixtures. @returns Nothing. */ () => {
  const context = own(new Reference<XComponentContext>(getProcessComponentContext()));
  const parser = own(Parser.create(context));
  const info = own(new Reference<XServiceInfo>(parser, UNO_QUERY_THROW, XServiceInfo.static_type));
  expect(read(info.operatorStar().getImplementationName())).toBe(
    "com.sun.star.comp.extensions.xml.sax.ParserExpat",
  );
  expect(info.operatorStar().supportsService(u("com.sun.star.xml.sax.Parser"))).toBe(true);

  const handler = own(new Reference(new DocumentHandler()));
  parser.operatorStar().setDocumentHandler(handler);
  parser
    .operatorStar()
    .parseStream(source(new TextEncoder().encode("<?xml version='1.0'?>\n" + namespaceDocument)));
  expect(handler.operatorStar().elementNames).toEqual([
    "html:html",
    "html:head",
    "html:title",
    "html:body",
    "html:p",
    "html:a",
  ]);
  expect(handler.operatorStar().attributeNames).toEqual(["xmlns:html", "href"]);
  expect(handler.operatorStar().contents).toHaveLength(33);
  expect(handler.operatorStar().whitespace).toBe("");
  expect(handler.operatorStar().systemId).toBe("internal");
  expect(handler.operatorStar().ended).toBe(true);

  const latinHandler = own(new Reference(new DocumentHandler()));
  parser.operatorStar().setDocumentHandler(latinHandler);
  const latin =
    "<?xml version='1.0' encoding=\"iso-8859-1\"?>\n" +
    namespaceDocument.replace("Moved to \n", "Moved to ß\n");
  parser
    .operatorStar()
    .parseStream(
      source(
        Uint8Array.from(
          latin,
          /** Encodes one fixture character in Latin-1. @param character - Fixture code unit. @returns Original byte. */ (
            character,
          ) => character.charCodeAt(0),
        ),
      ),
    );
  expect(latinHandler.operatorStar().contents).toContain("Moved to ß\n");
  expect(latinHandler.operatorStar().ended).toBe(true);
});

it("preserves the source diagnostic system ID and rejects DTDs in package XML", /** Checks the native diagnostic on an unsupported document type. @returns Nothing. */ () => {
  const value = new TextEncoder().encode("<!DOCTYPE Relationships><Relationships/>");
  const input = own(inputFromBytes(value));
  const context = own(new Reference<XComponentContext>(getProcessComponentContext()));
  let caught = false;
  try {
    ReadRelationsInfoSequence(input, u("_rels/.rels").subView(0), context).dispose();
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    caught = true;
    expect(nativeText(own(error).SystemId)).toBe("_rels/_rels/.rels");
    expect(error.LineNumber).toBe(1);
    expect(nativeText(error.Message)).toContain("document type declarations");
  }
  expect(caught).toBe(true);
});

/** Receives UNO SAX errors and allows document callbacks to recover. */
class ErrorHandler extends WeakImplHelper.specialize(XErrorHandler) implements XErrorHandler {
  ordinary = 0;
  fatal = 0;
  reject = false;

  /** Receives a document callback failure. @param error - UNO error value. @returns Nothing. */
  error(error: Readonly<Any>): void {
    expect(error.hasValue()).toBe(true);
    ++this.ordinary;
    if (this.reject) throw new SAXParseException();
  }

  /** Receives a parser failure. @param error - UNO error value. @returns Nothing. */
  fatalError(error: Readonly<Any>): void {
    expect(error.hasValue()).toBe(true);
    ++this.fatal;
  }

  /** Receives a warning. @returns Nothing. */
  warning(): void {}
}

/** Raises a recoverable SAX error during parsing. */
class RejectingDocumentHandler extends DocumentHandler {
  /** Rejects one document event. @returns Never. */
  override startElement(): never {
    throw new SAXException();
  }
}

it("routes callback errors and malformed XML to the original XErrorHandler methods", /** Verifies recovery and both fatal error paths. @returns Nothing. */ () => {
  const context = own(new Reference<XComponentContext>(getProcessComponentContext())),
    parser = own(Parser.create(context)).operatorStar(),
    handler = own(new Reference(new RejectingDocumentHandler())),
    errors = own(new Reference(new ErrorHandler()));
  parser.setDocumentHandler(handler);
  parser.setErrorHandler(errors);
  parser.parseStream(source(new TextEncoder().encode("<root />")));
  expect(errors.operatorStar().ordinary).toBe(1);
  expect(errors.operatorStar().fatal).toBe(0);
  expect(handler.operatorStar().ended).toBe(true);

  let caught = false;
  try {
    parser.parseStream(source(new TextEncoder().encode("<root>bad")));
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    own(error);
    caught = true;
  }
  expect(caught).toBe(true);
  expect(errors.operatorStar().fatal).toBe(1);
  expect(handler.operatorStar().ended).toBe(false);

  errors.operatorStar().reject = true;
  const callbackFailure = failure(
    /** Parses a document with the rejecting error handler. @returns Nothing. */ () =>
      parser.parseStream(source(new TextEncoder().encode("<root />"))),
    SAXParseException,
  );
  expect(callbackFailure.WrappedException.hasValue()).toBe(true);
  expect(errors.operatorStar().fatal).toBe(2);
  expect(handler.operatorStar().ended).toBe(false);
});

/** Captures a real caller-owned UNO exception until fixture cleanup. @param action - Actual parser call. @param type - Expected constructor. @returns Caught value. */
function failure<T extends SAXException | RuntimeException>(
  action: () => void,
  type: new () => T,
): T {
  try {
    action();
  } catch (error) {
    if (!(error instanceof type)) throw error;
    return own(error);
  }
  throw new Error("Expected a UNO SAX or runtime failure");
}

it("delivers extended events and releases the input identifiers between parses", /** Verifies processing instructions, comments, CDATA and locator ownership. @returns Nothing. */ () => {
  const context = own(new Reference<XComponentContext>(getProcessComponentContext())),
    parser = own(Parser.create(context)).operatorStar(),
    handler = own(new Reference(new DocumentHandler()));
  parser.setLocale(own(new Locale()));
  parser.setDTDHandler(own(new Reference<XDTDHandler>()));
  parser.setEntityResolver(own(new Reference<XEntityResolver>()));
  parser.setDocumentHandler(handler);
  const xml =
    "<?testpi pidata?><HI><![CDATA[<greeting>Hello!</greeting>]]><!-- huhu --><![CDATA[]]></HI>";
  parser.parseStream(source(new TextEncoder().encode(xml)));
  const document = handler.operatorStar(),
    locator = document.locator.operatorStar();
  expect(document.events).toEqual([
    "testpi pidata",
    "CDATA start",
    "CDATA end",
    " huhu ",
    "CDATA start",
    "CDATA end",
  ]);
  expect(document.contents).toBe("<greeting>Hello!</greeting>");
  failure(
    /** Checks the inactive system ID. @returns Nothing. */ () => locator.getSystemId().dispose(),
    DisposedException,
  );
  failure(
    /** Checks the inactive public ID. @returns Nothing. */ () => locator.getPublicId().dispose(),
    DisposedException,
  );

  const missing = failure(
    /** Attempts parsing with no stream. @returns Nothing. */ () =>
      parser.parseStream(own(new InputSource())),
    SAXException,
  );
  expect(nativeText(missing.Message)).toBe("No input source");
  parser.setDocumentHandler(own(new Reference<XDocumentHandler>()));
  parser.parseStream(source(new TextEncoder().encode(xml)));
  expect(
    failure(
      /** Attempts parsing with an invalid encoded byte. @returns Nothing. */ () =>
        parser.parseStream(
          source(Uint8Array.of(60, 114, 111, 111, 116, 62, 255, 60, 47, 114, 111, 111, 116, 62)),
        ),
      SAXParseException,
    ).LineNumber,
  ).toBe(1);
});

it.each([
  ["maxDepth", "<r><a/></r>", "depth"],
  ["maxElements", "<r><a/></r>", "element"],
  ["maxAttributes", "<r a='1' b='2'/>", "attribute"],
  ["maxCharacters", "<r>abc</r>", "character"],
] as const)(
  "rejects package XML that exceeds %s",
  /** Checks one resource ceiling. @param limit - Limit field. @param xml - Fixture input. @param diagnostic - Expected diagnostic fragment. @returns Nothing. */ (
    limit,
    xml,
    diagnostic,
  ) => {
    const parser = own(
      new Reference(
        new SaxExpatParser({
          maxDepth: 8,
          maxElements: 8,
          maxAttributes: 8,
          maxCharacters: 8,
          [limit]: 1,
        }),
      ),
    ).operatorStar();
    const error = failure(
      /** Attempts to parse the over-budget document. @returns Nothing. */ () =>
        parser.parseStream(source(new TextEncoder().encode(xml))),
      SAXParseException,
    );
    expect(nativeText(error.Message)).toContain(diagnostic + " limit");
  },
);
