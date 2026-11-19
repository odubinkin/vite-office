/** @fileoverview Browser ParserExpat component for streaming UNO SAX document handlers. */
import { SaxesParser } from "saxes";
import { AttributeList } from "../../../comphelper/source/xml/attributelist";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { acquire } from "../../../cppuhelper/inc/weak";
import type { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import {
  SAXParseException,
  cppu_detail_getUnoType as parseExceptionType,
} from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import type { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import type { XDTDHandler } from "../../../offapi/com/sun/star/xml/sax/XDTDHandler";
import type { XEntityResolver } from "../../../offapi/com/sun/star/xml/sax/XEntityResolver";
import type { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";
import { XExtendedDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XExtendedDocumentHandler";
import { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import { XParser } from "../../../offapi/com/sun/star/xml/sax/XParser";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import type { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { DEFAULT_FAST_XML_LIMITS, type FastXmlLimits } from "../fastparser/fastparser";
import { createInputEntity, decodedChunks, XmlByteError } from "../fastparser/streaminput";

const implementationName = "com.sun.star.comp.extensions.xml.sax.ParserExpat";
const serviceName = "com.sun.star.xml.sax.Parser";
const StringSequence = Sequence.specialize<rtl_uStringSlot>("OUString", 8);

/** Encodes the backend's JavaScript UTF-16 string as a UNO string. @param text - Backend text. @returns Owned value. */
function unoString(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; ++i) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}

/** Fatal backend syntax or resource-admission failure. */
class ParserSyntaxError extends Error {}

/** Live position and source identifiers supplied to SAX handlers. */
class LocatorImpl extends WeakImplHelper.specialize(XLocator) implements XLocator {
  source: InputSource | null = null;
  line = 1;
  column = 0;

  /** Returns the current parser line. @returns One-based line. */
  getLineNumber(): number {
    return this.line;
  }

  /** Returns the current parser column. @returns Zero-based column. */
  getColumnNumber(): number {
    return this.column;
  }

  /** Returns the active input public ID. @returns Owned identifier. */
  getPublicId(): OUString {
    if (this.source === null) throw new DisposedException();
    return new OUString(this.source.sPublicId);
  }

  /** Returns the active input system ID. @returns Owned identifier. */
  getSystemId(): OUString {
    if (this.source === null) throw new DisposedException();
    return new OUString(this.source.sSystemId);
  }
}

/** UNO SAX parser using qualified element and attribute names as in Expat's namespace-unaware mode. */
export class SaxExpatParser
  extends WeakImplHelper.specialize(XParser, XServiceInfo)
  implements XParser, XServiceInfo
{
  private readonly locator = new Reference(new LocatorImpl());
  private readonly attributes = new Reference(new AttributeList());
  private readonly documentHandler = new Reference<XDocumentHandler>();
  private readonly extendedHandler = new Reference<XExtendedDocumentHandler>();
  private readonly errorHandler = new Reference<XErrorHandler>();
  private readonly dtdHandler = new Reference<XDTDHandler>();
  private readonly entityResolver = new Reference<XEntityResolver>();

  /** Supplies the document admission limits used by the browser backend. @param limits - Resource ceilings. @returns Parser. */
  constructor(private readonly limits: FastXmlLimits = DEFAULT_FAST_XML_LIMITS) {
    super();
  }

  /** Sets the ordinary and queried extended document handlers. @param handler - UNO handler. @returns Nothing. */
  setDocumentHandler(handler: Reference<XDocumentHandler>): void {
    const extended = new Reference<XExtendedDocumentHandler>(
      handler,
      UNO_QUERY,
      XExtendedDocumentHandler.static_type,
    );
    this.documentHandler.assign(handler);
    this.extendedHandler.moveAssign(extended);
    extended.dispose();
  }

  /** Sets the parser's fatal error receiver. @param handler - UNO handler. @returns Nothing. */
  setErrorHandler(handler: Reference<XErrorHandler>): void {
    this.errorHandler.assign(handler);
  }

  /** Retains the supplied DTD handler. @param handler - UNO handler. @returns Nothing. */
  setDTDHandler(handler: Reference<XDTDHandler>): void {
    this.dtdHandler.assign(handler);
  }

  /** Retains the supplied entity resolver. @param resolver - UNO resolver. @returns Nothing. */
  setEntityResolver(resolver: Reference<XEntityResolver>): void {
    this.entityResolver.assign(resolver);
  }

  /** Applies the upstream locale setter, which is a no-op. @param locale - Requested locale. @returns Nothing. */
  setLocale(locale: Locale): void {
    void locale;
  }

  /** Parses a native stream and delivers the UNO SAX lifecycle. @param source - Caller-owned input. @returns Nothing. */
  parseStream(source: InputSource): void {
    if (!source.aInputStream.is() || this.locator.operatorStar().source !== null) {
      const message = unoString(
        source.aInputStream.is() ? "Parser is already active" : "No input source",
      );
      const empty = new Reference(),
        wrapped = new Any();
      try {
        throw new SAXException(message, empty, wrapped);
      } finally {
        wrapped.dispose();
        empty.dispose();
        message.dispose();
      }
    }

    const entity = createInputEntity(source);
    const locator = this.locator.operatorStar();
    locator.source = entity.maStructSource;
    locator.line = 1;
    locator.column = 0;
    try {
      this.documentHandler.get()?.setDocumentLocator(this.locator);
      this.documentHandler.get()?.startDocument();
      this.parse(entity);
      this.documentHandler.get()?.endDocument();
    } finally {
      locator.source = null;
      entity.dispose();
    }
  }

  /** Connects the streaming lexical backend to the original qualified SAX callbacks. @param entity - Active stream converter. @returns Nothing. */
  private parse(entity: ReturnType<typeof createInputEntity>): void {
    const parser = new SaxesParser({ xmlns: false });
    const locator = this.locator.operatorStar();
    const limits = this.limits;
    let depth = 0,
      attributesSeen = 0,
      elementsSeen = 0,
      charactersSeen = 0;

    const locate = /** Snapshots the live backend position. @returns Nothing. */ (): void => {
      locator.line = parser.line;
      locator.column = parser.column;
    };
    const characters =
      /** Validates and delivers ordinary and CDATA text. @param text - Decoded text. @returns Nothing. */ (
        text: string,
      ): void => {
        locate();
        charactersSeen += text.length;
        if (charactersSeen > limits.maxCharacters)
          throw new ParserSyntaxError("XML exceeds character limit.");
        const handler = this.documentHandler.get();
        if (handler)
          this.dispatch(
            /** Runs the character-data handler. @returns Nothing. */ () =>
              this.withString(
                text,
                /** Delivers the owned characters as a borrowed value. @param value - Native text. @returns Nothing. */ (
                  value,
                ) => handler.characters(value),
              ),
          );
      };
    parser.on(
      "error",
      /** Translates a lexical failure. @param error - Backend error. @returns Never. */ (
        error,
      ) => {
        throw new ParserSyntaxError(error.message);
      },
    );
    parser.on(
      "doctype",
      /** Rejects document type declarations. @returns Never. */ () => {
        throw new ParserSyntaxError("XML document type declarations are unsupported.");
      },
    );
    parser.on(
      "opentag",
      /** Validates and dispatches an opening tag. @param tag - Qualified lexical tag. @returns Nothing. */ (
        tag,
      ) => {
        locate();
        if (++depth > limits.maxDepth) throw new ParserSyntaxError("XML exceeds depth limit.");
        if (++elementsSeen > limits.maxElements)
          throw new ParserSyntaxError("XML exceeds element limit.");
        const attributes = Object.entries(tag.attributes);
        attributesSeen += attributes.length;
        if (attributesSeen > limits.maxAttributes)
          throw new ParserSyntaxError("XML exceeds attribute limit.");
        const handler = this.documentHandler.get();
        if (!handler) return;
        const list = this.attributes.operatorStar();
        list.Clear();
        for (const [key, value] of attributes)
          this.withString(
            key,
            /** Keeps the attribute name alive. @param name - Native name. @returns Nothing. */ (
              name,
            ) =>
              this.withString(
                value,
                /** Adds one attribute. @param text - Native value. @returns Nothing. */ (text) =>
                  list.AddAttribute(name, text),
              ),
          );
        this.dispatch(
          /** Runs the start-element handler. @returns Nothing. */ () =>
            this.withString(
              tag.name,
              /** Delivers the opening name and reusable attributes. @param name - Native name. @returns Nothing. */ (
                name,
              ) => handler.startElement(name, this.attributes),
            ),
        );
      },
    );
    parser.on(
      "closetag",
      /** Reports a closing tag. @param tag - Qualified lexical tag. @returns Nothing. */ (tag) => {
        locate();
        --depth;
        const handler = this.documentHandler.get();
        if (handler)
          this.dispatch(
            /** Runs the end-element handler. @returns Nothing. */ () =>
              this.withString(
                tag.name,
                /** Delivers the closing name. @param name - Native name. @returns Nothing. */ (
                  name,
                ) => handler.endElement(name),
              ),
          );
      },
    );
    parser.on(
      "text",
      /** Delivers text inside the document element. @param text - Backend text. @returns Nothing. */ (
        text,
      ) => {
        if (depth !== 0) characters(text);
      },
    );
    parser.on(
      "processinginstruction",
      /** Handles a processing instruction. @param instruction - Backend target and body. @returns Nothing. */ ({
        target,
        body,
      }) => {
        locate();
        const handler = this.documentHandler.get();
        if (handler)
          this.dispatch(
            /** Runs the processing-instruction handler. @returns Nothing. */ () =>
              this.withString(
                target,
                /** Keeps the native target alive. @param name - Native target. @returns Nothing. */ (
                  name,
                ) =>
                  this.withString(
                    body,
                    /** Delivers the instruction data. @param data - Native body. @returns Nothing. */ (
                      data,
                    ) => handler.processingInstruction(name, data),
                  ),
              ),
          );
      },
    );
    parser.on(
      "comment",
      /** Handles an XML comment. @param text - Backend text. @returns Nothing. */ (text) => {
        locate();
        const handler = this.extendedHandler.get();
        if (handler)
          this.dispatch(
            /** Runs the extended comment handler. @returns Nothing. */ () =>
              this.withString(
                text,
                /** Delivers the comment. @param value - Native comment text. @returns Nothing. */ (
                  value,
                ) => handler.comment(value),
              ),
          );
      },
    );
    parser.on(
      "cdata",
      /** Handles a CDATA section. @param text - Backend content. @returns Nothing. */ (text) => {
        locate();
        const handler = this.extendedHandler.get();
        if (handler)
          this.dispatch(
            /** Reports the CDATA opening event. @returns Nothing. */ () => handler.startCDATA(),
          );
        if (text) characters(text);
        if (handler)
          this.dispatch(
            /** Reports the CDATA closing event. @returns Nothing. */ () => handler.endCDATA(),
          );
      },
    );
    try {
      for (const chunk of decodedChunks(entity)) parser.write(chunk);
      parser.close();
    } catch (error) {
      if (!(
        error instanceof ParserSyntaxError ||
        error instanceof XmlByteError ||
        error instanceof SAXException
      ))
        throw error;
      locate();
      this.throwParseException(error);
    }
  }

  /** Passes SAX callback errors to XErrorHandler.error, which may allow parsing to continue. @param callback - Document event. @returns Nothing. */
  private dispatch(callback: () => void): void {
    try {
      callback();
    } catch (error) {
      if (!(error instanceof SAXException)) throw error;
      const failure = this.asParseException(error);
      const handler = this.errorHandler.get();
      if (!handler) throw failure;
      try {
        const value = new Any(failure, parseExceptionType);
        try {
          handler.error(value);
        } finally {
          value.dispose();
        }
      } catch (error) {
        if (!(error instanceof SAXException)) throw error;
        throw this.asParseException(error);
      } finally {
        failure.dispose();
      }
    }
  }

  /** Converts an ordinary SAX callback exception to its location-bearing form. @param error - Owned callback failure. @returns Owned parse error. */
  private asParseException(error: SAXException): SAXParseException {
    if (error instanceof SAXParseException) return error;
    const locator = this.locator.operatorStar(),
      publicId = locator.getPublicId(),
      systemId = locator.getSystemId();
    try {
      return new SAXParseException(
        error.Message,
        error.Context,
        error.WrappedException,
        publicId,
        systemId,
        locator.line,
        locator.column,
      );
    } finally {
      systemId.dispose();
      publicId.dispose();
      error.dispose();
    }
  }

  /** Keeps a callback's native string alive throughout the call. @param text - Backend string. @param callback - SAX receiver. @returns Nothing. */
  private withString(text: string, callback: (value: OUStringConstReference) => void): void {
    const value = unoString(text);
    try {
      callback(value);
    } finally {
      value.dispose();
    }
  }

  /** Reports a fatal XML or handler error through the original SAX exception contract. @param error - Parser or callback failure. @returns Never. */
  private throwParseException(error: Error | SAXException): never {
    const locator = this.locator.operatorStar(),
      message =
        error instanceof SAXException ? new OUString(error.Message) : unoString(error.message),
      publicId = locator.getPublicId(),
      systemId = locator.getSystemId(),
      context = new Reference(),
      wrapped = new Any();
    let failure: SAXParseException;
    try {
      if (error instanceof SAXParseException) wrapped.setValue(error, parseExceptionType());
      failure = new SAXParseException(
        message,
        context,
        wrapped,
        publicId,
        systemId,
        locator.line,
        locator.column,
      );
    } finally {
      wrapped.dispose();
      context.dispose();
      systemId.dispose();
      publicId.dispose();
      message.dispose();
      if (error instanceof SAXException) error.dispose();
    }
    try {
      const handler = this.errorHandler.get();
      if (handler) {
        const value = new Any(failure, parseExceptionType);
        try {
          handler.fatalError(value);
        } finally {
          value.dispose();
        }
      }
    } catch (error) {
      failure.dispose();
      throw error;
    }
    throw failure;
  }

  /** Returns the original implementation name. @returns Owned name. */
  getImplementationName(): OUString {
    return unoString(implementationName);
  }

  /** Checks the advertised service. @param name - Service name. @returns Whether supported. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }

  /** Returns the original single service name. @returns Owned names. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = unoString(serviceName);
    try {
      return new StringSequence(
        {
          get: /** Provides the UNO string slot to sequence construction. @returns Borrowed string slot. */ () =>
            name.getDataAddress(),
        },
        1,
      );
    } finally {
      name.dispose();
    }
  }

  /** Releases retained UNO state with the component. @returns Nothing. */
  protected override destroy(): void {
    this.entityResolver.dispose();
    this.dtdHandler.dispose();
    this.errorHandler.dispose();
    this.extendedHandler.dispose();
    this.documentHandler.dispose();
    this.attributes.dispose();
    this.locator.dispose();
    super.destroy();
  }
}

/** Constructs the registered parser. @param context - Unused factory context. @param args - Factory arguments. @returns Acquired UNO implementation. */
export function com_sun_star_comp_extensions_xml_sax_ParserExpat_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void context;
  void args;
  return acquire(new SaxExpatParser());
}
